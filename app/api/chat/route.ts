import { portfolioAssistantInstructions } from "../../../lib/portfolio-context";
import { SourceRef } from "../../../lib/citations";
import { buildCachedSseStream, buildLiveSseStream, ChatMessage, openRouterDeltas, SSE_HEADERS } from "../../../lib/chat-stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const MAX_INPUT_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_RATE_ENTRIES = 1000;
const MAX_CACHE_ENTRIES = 200;

type RateEntry = { count: number; resetAt: number };
type CacheEntry = { answer: string; sources: SourceRef[]; expiresAt: number };

const globalRateStore = globalThis as typeof globalThis & {
  portfolioRateLimits?: Map<string, RateEntry>;
  portfolioAnswerCache?: Map<string, CacheEntry>;
};

const rateLimits =
  globalRateStore.portfolioRateLimits ??
  (globalRateStore.portfolioRateLimits = new Map<string, RateEntry>());
const answerCache =
  globalRateStore.portfolioAnswerCache ??
  (globalRateStore.portfolioAnswerCache = new Map<string, CacheEntry>());

function clientIdentifier(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

function rateLimit(identifier: string) {
  const now = Date.now();
  if (rateLimits.size >= MAX_RATE_ENTRIES) {
    for (const [key, entry] of rateLimits) if (entry.resetAt <= now) rateLimits.delete(key);
    while (rateLimits.size >= MAX_RATE_ENTRIES) rateLimits.delete(rateLimits.keys().next().value!);
  }
  const current = rateLimits.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  return { limited: current.count > MAX_REQUESTS, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

function requestGuard(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.startsWith("application/json")) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }
  return null;
}

function pruneAnswerCache(now: number) {
  for (const [key, entry] of answerCache) if (entry.expiresAt <= now) answerCache.delete(key);
  while (answerCache.size >= MAX_CACHE_ENTRIES) answerCache.delete(answerCache.keys().next().value!);
}

export async function POST(request: NextRequest) {
  const guarded = requestGuard(request);
  if (guarded) return guarded;
  // OpenRouter is the active provider. The legacy variable remains a
  // temporary fallback so existing deployments continue working during the
  // environment-variable migration.
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "The portfolio assistant is temporarily unavailable." },
      { status: 503 },
    );
  }

  const limit = rateLimit(clientIdentifier(request));
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many questions. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let message = "";
  let history: ChatMessage[] = [];
  try {
    const body = (await request.json()) as { message?: unknown; history?: unknown };
    message = typeof body.message === "string" ? body.message.trim() : "";
    if (Array.isArray(body.history)) {
      history = body.history
        .filter(
          (item): item is ChatMessage =>
            typeof item === "object" &&
            item !== null &&
            (item as ChatMessage).role !== undefined &&
            ["user", "assistant"].includes((item as ChatMessage).role) &&
            typeof (item as ChatMessage).content === "string",
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_INPUT_LENGTH) }));
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!message || message.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Enter a question between 1 and ${MAX_INPUT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const cacheContext = history.map((item) => `${item.role}:${item.content}`).join("|");
  const cacheKey = `${cacheContext}|user:${message}`.toLocaleLowerCase().replace(/\s+/g, " ");
  const now = Date.now();
  const cached = answerCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return new Response(buildCachedSseStream(cached.answer, cached.sources), { headers: SSE_HEADERS });
  }
  if (answerCache.size >= MAX_CACHE_ENTRIES || cached) pruneAnswerCache(now);

  try {
    let modelResponse: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      modelResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Pin a current conversational model so the generic free router
          // cannot select a classifier or another non-chat-specialized model.
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: portfolioAssistantInstructions },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.35,
          max_tokens: 650,
          stream: true,
          // Nemotron is a hybrid-reasoning model — without this, OpenRouter
          // can stream its raw chain-of-thought straight into delta.content
          // on more open-ended questions, burning the whole token budget on
          // scratchpad text before ever reaching an actual answer. Confirmed
          // live against production (not guessed): fine on simple prompts,
          // reliably broken on complex ones until this was added.
          reasoning: { enabled: false },
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (modelResponse.ok || ![429, 500, 502, 503, 504].includes(modelResponse.status) || attempt === 1) break;
      const retryAfter = Number(modelResponse.headers.get("retry-after") || "1");
      await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(retryAfter, 1), 2) * 1000));
    }

    if (!modelResponse) throw new Error("OpenRouter request did not start");

    if (!modelResponse.ok) {
      let errorMessage: string | undefined;
      try {
        const errorBody = (await modelResponse.json()) as { error?: { message?: string } };
        errorMessage = errorBody.error?.message;
      } catch {
        // Non-JSON error body — proceed without it.
      }
      console.error("OpenRouter response error", modelResponse.status, errorMessage);
      return NextResponse.json(
        { error: "The live model is temporarily unavailable.", mode: "fallback" },
        { status: modelResponse.status === 429 ? 429 : 502 },
      );
    }

    const stream = buildLiveSseStream(openRouterDeltas(modelResponse), (result) => {
      if (answerCache.size >= MAX_CACHE_ENTRIES) pruneAnswerCache(Date.now());
      answerCache.set(cacheKey, { answer: result.answer, sources: result.sources, expiresAt: Date.now() + CACHE_TTL_MS });
    });
    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error("Portfolio assistant request failed", error);
    // The client hasn't received any bytes yet at this point (the failure is
    // in setting up the upstream call, not mid-stream), so a plain JSON
    // error is still correct here — buildLiveSseStream handles failures
    // that happen after streaming has already started.
    return NextResponse.json(
      { error: "The portfolio assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
