import { architectureConsultantInstructions } from "../../../lib/portfolio-context";
import { SourceRef } from "../../../lib/citations";
import { buildCachedSseStream, buildLiveSseStream, openRouterDeltas, SSE_HEADERS } from "../../../lib/chat-stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// A separate rate-limit/cache budget from app/api/chat/route.ts (same
// pattern as app/api/search/route.ts) so Consult-mode traffic never
// competes with the assistant's own budget.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 15;
const MAX_INPUT_LENGTH = 500;
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_RATE_ENTRIES = 1000;
const MAX_CACHE_ENTRIES = 200;

type RateEntry = { count: number; resetAt: number };
type CacheEntry = { answer: string; sources: SourceRef[]; expiresAt: number };

const globalStore = globalThis as typeof globalThis & {
  portfolioConsultRateLimits?: Map<string, RateEntry>;
  portfolioConsultCache?: Map<string, CacheEntry>;
};
const rateLimits = globalStore.portfolioConsultRateLimits ?? (globalStore.portfolioConsultRateLimits = new Map());
const answerCache = globalStore.portfolioConsultCache ?? (globalStore.portfolioConsultCache = new Map());

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

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Consult mode is temporarily unavailable." }, { status: 503 });

  const limit = rateLimit(clientIdentifier(request));
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let problem = "";
  try {
    const body = (await request.json()) as { problem?: unknown };
    problem = typeof body.problem === "string" ? body.problem.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!problem || problem.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({ error: `Describe a problem between 1 and ${MAX_INPUT_LENGTH} characters.` }, { status: 400 });
  }

  const cacheKey = problem.toLocaleLowerCase().replace(/\s+/g, " ");
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
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: architectureConsultantInstructions },
            { role: "user", content: problem },
          ],
          temperature: 0.4,
          max_tokens: 500,
          stream: true,
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
      console.error("OpenRouter consult error", modelResponse.status, errorMessage);
      return NextResponse.json({ error: "Consult mode is temporarily unavailable." }, { status: modelResponse.status === 429 ? 429 : 502 });
    }

    const stream = buildLiveSseStream(openRouterDeltas(modelResponse), (result) => {
      if (answerCache.size >= MAX_CACHE_ENTRIES) pruneAnswerCache(Date.now());
      answerCache.set(cacheKey, { answer: result.answer, sources: result.sources, expiresAt: Date.now() + CACHE_TTL_MS });
    });
    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error("Consult request failed", error);
    return NextResponse.json({ error: "Consult mode is temporarily unavailable." }, { status: 502 });
  }
}
