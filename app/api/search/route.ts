import { NextRequest, NextResponse } from "next/server";
import { certifications, projects, skills } from "../../../lib/data";
import { resolveSourceId, SourceType } from "../../../lib/citations";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const MAX_QUERY_LENGTH = 200;
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_RATE_ENTRIES = 1000;
const MAX_CACHE_ENTRIES = 200;

type ResultType = SourceType;
type RateEntry = { count: number; resetAt: number };
type SearchResult = { id: string; type: ResultType; relevance: string };
type CacheEntry = { results: SearchResult[]; expiresAt: number };
type APIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

// A separate rate-limit/cache budget from app/api/chat/route.ts so search
// traffic never starves the assistant (or vice versa) — same globalThis
// Map pattern, different keys.
const globalStore = globalThis as typeof globalThis & {
  portfolioSearchRateLimits?: Map<string, RateEntry>;
  portfolioSearchCache?: Map<string, CacheEntry>;
};
const rateLimits = globalStore.portfolioSearchRateLimits ?? (globalStore.portfolioSearchRateLimits = new Map());
const resultCache = globalStore.portfolioSearchCache ?? (globalStore.portfolioSearchCache = new Map());

function buildIndexedCorpus() {
  const projectLines = projects
    .map((project) => `- id: project:${project.id} | ${project.title} (${project.category}): ${project.goal} Stack: ${project.stack.join(", ")}. Flow: ${project.flow}.`)
    .join("\n");
  const skillLines = skills
    .map((group, i) => `- id: skill:${i} | ${group.group}: ${group.items.join(", ")}.`)
    .join("\n");
  const certLines = certifications
    .map(([name, meta], i) => `- id: cert:${i} | ${name} — ${meta}.`)
    .join("\n");
  return `PROJECTS\n${projectLines}\n\nSKILLS\n${skillLines}\n\nCERTIFICATIONS\n${certLines}`;
}

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

function pruneCache(now: number) {
  for (const [key, entry] of resultCache) if (entry.expiresAt <= now) resultCache.delete(key);
  while (resultCache.size >= MAX_CACHE_ENTRIES) resultCache.delete(resultCache.keys().next().value!);
}

// Defensive parse of the model's response: strips a stray code fence if the
// model adds one despite instructions, extracts the first {...} object,
// validates shape, and drops any id that isn't real — the frontend must
// never be able to render a hallucinated project, skill, or credential.
function parseResults(raw: string): SearchResult[] {
  const stripped = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { results?: unknown };
    if (!Array.isArray(parsed.results)) return [];
    const seen = new Set<string>();
    const results: SearchResult[] = [];
    for (const item of parsed.results) {
      if (typeof item !== "object" || item === null) continue;
      const rawId = (item as { id?: unknown }).id;
      const relevance = (item as { relevance?: unknown }).relevance;
      if (typeof rawId !== "string" || seen.has(rawId)) continue;
      const resolved = resolveSourceId(rawId);
      if (!resolved) continue;
      seen.add(rawId);
      results.push({ id: resolved.id, type: resolved.type, relevance: typeof relevance === "string" ? relevance.slice(0, 140) : "" });
      if (results.length >= 5) break;
    }
    return results;
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const guarded = requestGuard(request);
  if (guarded) return guarded;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ results: [], mode: "fallback" });

  const limit = rateLimit(clientIdentifier(request));
  if (limit.limited) {
    return NextResponse.json({ error: "Too many searches. Please try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  let query = "";
  try {
    const body = (await request.json()) as { query?: unknown };
    query = typeof body.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: `Enter a search between 1 and ${MAX_QUERY_LENGTH} characters.` }, { status: 400 });
  }

  const cacheKey = query.toLocaleLowerCase().replace(/\s+/g, " ");
  const now = Date.now();
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return NextResponse.json({ results: cached.results, mode: "cache" });
  if (resultCache.size >= MAX_CACHE_ENTRIES || cached) pruneCache(now);

  try {
    const modelResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          {
            role: "system",
            content: `You rerank a small, fixed corpus of real portfolio content — project case studies, skill groups, and certifications — against a visitor's search query. Return ONLY strict JSON, no prose, no markdown fences, in exactly this shape: {"results":[{"id":"<id>","relevance":"<short phrase, under 12 words>"}]}. Only use ids exactly as they appear below (including the "project:"/"skill:"/"cert:" prefix) — never invent one. Return at most 5 results across all types, most relevant first, best matches only. If nothing is a good match, return {"results":[]}.\n\n${buildIndexedCorpus()}`,
          },
          { role: "user", content: query },
        ],
        temperature: 0.2,
        max_tokens: 350,
        // Same hybrid-reasoning model as app/api/chat/route.ts — without
        // this, a chain-of-thought preamble can eat the token budget before
        // the required JSON ever appears, silently degrading every search
        // to the local fallback instead of a real reranked result.
        reasoning: { enabled: false },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await modelResponse.json()) as APIResponse;
    if (!modelResponse.ok) {
      console.error("OpenRouter search error", modelResponse.status, data.error?.message);
      return NextResponse.json({ results: [], mode: "fallback" });
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    const results = content ? parseResults(content) : [];

    if (resultCache.size >= MAX_CACHE_ENTRIES) pruneCache(Date.now());
    resultCache.set(cacheKey, { results, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ results, mode: "live" });
  } catch (error) {
    console.error("Portfolio search request failed", error);
    return NextResponse.json({ results: [], mode: "fallback" });
  }
}
