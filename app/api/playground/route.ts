import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Same provider/key as the portfolio assistant (app/api/chat/route.ts) —
// OPENROUTER_API_KEY is already configured in Vercel, so the Interactive
// Lab needs no separate credential. Slightly stricter limits than the
// assistant since this is a demo surface, not a support channel.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
const MAX_RATE_ENTRIES = 1000;
const MAX_PROMPT_LENGTH = 600;

const SYSTEM_PROMPT =
  "You are a concise technical assistant powering a portfolio's interactive prompt-playground demo. Answer the user's prompt directly and factually. Keep responses under 130 words. If the prompt is ambiguous or unanswerable, say so briefly instead of guessing.";

type RateEntry = { count: number; resetAt: number };
type APIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
};

const globalRateStore = globalThis as typeof globalThis & {
  playgroundRateLimits?: Map<string, RateEntry>;
};
const rateLimits = globalRateStore.playgroundRateLimits ?? (globalRateStore.playgroundRateLimits = new Map<string, RateEntry>());

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

export async function POST(request: NextRequest) {
  const guarded = requestGuard(request);
  if (guarded) return guarded;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The live model is temporarily unavailable." }, { status: 503 });
  }

  const limit = rateLimit(clientIdentifier(request));
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many runs. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let prompt = "";
  let temperature = 0.3;
  let topP = 0.9;
  try {
    const body = (await request.json()) as { prompt?: unknown; temperature?: unknown; topP?: unknown };
    prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    temperature = typeof body.temperature === "number" && Number.isFinite(body.temperature) ? Math.min(Math.max(body.temperature, 0), 1.5) : 0.3;
    topP = typeof body.topP === "number" && Number.isFinite(body.topP) ? Math.min(Math.max(body.topP, 0.1), 1) : 0.9;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: `Enter a prompt between 1 and ${MAX_PROMPT_LENGTH} characters.` }, { status: 400 });
  }

  const startedAt = Date.now();
  try {
    let modelResponse: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      modelResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature,
          top_p: topP,
          max_tokens: 320,
          // See app/api/chat/route.ts — same hybrid-reasoning model, same
          // risk of the raw chain-of-thought consuming the token budget
          // before a real answer appears.
          reasoning: { enabled: false },
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
      console.error("OpenRouter playground error", modelResponse.status, data.error?.message);
      return NextResponse.json({ error: "The live model is temporarily unavailable." }, { status: modelResponse.status === 429 ? 429 : 502 });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json({ error: "The model returned an empty answer." }, { status: 502 });
    }

    const latencyMs = Date.now() - startedAt;
    const tokens = data.usage?.completion_tokens ?? Math.ceil(answer.length / 4);
    return NextResponse.json({ answer, latencyMs, tokens });
  } catch (error) {
    console.error("Playground request failed", error);
    return NextResponse.json({ error: "The live model is temporarily unavailable." }, { status: 502 });
  }
}
