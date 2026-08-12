import { portfolioAssistantInstructions } from "../../../lib/portfolio-context";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;
const MAX_INPUT_LENGTH = 500;

type RateEntry = { count: number; resetAt: number };
type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const globalRateStore = globalThis as typeof globalThis & {
  portfolioRateLimits?: Map<string, RateEntry>;
};

const rateLimits =
  globalRateStore.portfolioRateLimits ??
  (globalRateStore.portfolioRateLimits = new Map<string, RateEntry>());

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
  const apiKey = process.env.GROQ_API_KEY;

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
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!message || message.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Enter a question between 1 and ${MAX_INPUT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: portfolioAssistantInstructions },
          { role: "user", content: message },
        ],
        temperature: 0.2,
        max_completion_tokens: 240,
      }),
      signal: AbortSignal.timeout(20_000),
      },
    );

    const data = (await groqResponse.json()) as GroqResponse;
    if (!groqResponse.ok) {
      console.error("Groq response error", groqResponse.status, data.error?.message);
      return NextResponse.json(
        { error: "The portfolio assistant could not answer right now." },
        { status: 502 },
      );
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "The portfolio assistant returned an empty answer." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Portfolio assistant request failed", error);
    return NextResponse.json(
      { error: "The portfolio assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
