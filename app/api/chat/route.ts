import { portfolioAssistantInstructions } from "../../../lib/portfolio-context";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const MAX_INPUT_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;
const CACHE_TTL_MS = 15 * 60 * 1000;

type RateEntry = { count: number; resetAt: number };
type ChatMessage = { role: "user" | "assistant"; content: string };
type CacheEntry = { answer: string; expiresAt: number };
type APIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

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

function isRateLimited(identifier: string) {
  const now = Date.now();
  const current = rateLimits.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
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

  if (isRateLimited(clientIdentifier(request))) {
    return NextResponse.json(
      { error: "Too many questions. Please try again in a few minutes." },
      { status: 429 },
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
  const cached = answerCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ answer: cached.answer, mode: "cache" });
  }

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
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (modelResponse.ok || ![429, 500, 502, 503, 504].includes(modelResponse.status) || attempt === 1) break;
      const retryAfter = Number(modelResponse.headers.get("retry-after") || "1");
      await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(retryAfter, 1), 2) * 1000));
    }

    if (!modelResponse) throw new Error("OpenRouter request did not start");

    const data = (await modelResponse.json()) as APIResponse;
    if (!modelResponse.ok) {
      console.error("OpenRouter response error", modelResponse.status, data.error?.message);
      return NextResponse.json(
        { error: "The live model is temporarily unavailable.", mode: "fallback" },
        { status: modelResponse.status === 429 ? 429 : 502 },
      );
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "The portfolio assistant returned an empty answer." },
        { status: 502 },
      );
    }

    answerCache.set(cacheKey, { answer, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ answer, mode: "live" });
  } catch (error) {
    console.error("Portfolio assistant request failed", error);
    return NextResponse.json(
      { error: "The portfolio assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
