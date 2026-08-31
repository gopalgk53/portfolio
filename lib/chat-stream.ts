import { extractSources, SourceRef } from "./citations";

// Shared real-token-streaming plumbing for app/api/chat/route.ts and
// app/api/consult/route.ts — both proxy an OpenRouter streaming completion
// to the browser as Server-Sent Events instead of the old "wait for the
// whole answer, then fake-type it out" pattern. Two event types reach the
// client: "token" (a chunk of real generated text) and "done" (the final,
// validated SourceRefs once the model finishes) — "error" on failure.

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type StreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; sources: SourceRef[]; mode: "live" | "cache" }
  | { type: "error"; error: string };

export function sseEncode(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

// The model is instructed to end its answer with a trailing "SOURCES: ..."
// line. Since we're streaming token-by-token, that line would otherwise
// flash on screen before we can strip it — so this buffer holds back a
// small trailing window of text (long enough that a marker split across two
// network chunks, e.g. "...\nSOU" + "RCES: ...", can never leak) until
// either the marker is found (then everything from the marker on is held
// until the stream ends) or more text arrives to push the window forward.
const HOLDBACK = 16; // longer than "\nSOURCES:" plus slack for spacing variants
export function createFlushBuffer(onFlush: (text: string) => void) {
  let raw = "";
  let sent = 0;
  let markerIndex = -1;
  return {
    push(delta: string) {
      raw += delta;
      if (markerIndex === -1) {
        const found = raw.search(/\n\s*SOURCES:/i);
        if (found !== -1) markerIndex = found;
      }
      const safeEnd = markerIndex !== -1 ? markerIndex : Math.max(sent, raw.length - HOLDBACK);
      if (safeEnd > sent) {
        onFlush(raw.slice(sent, safeEnd));
        sent = safeEnd;
      }
    },
    // Flushes any remaining visible text (only reachable when the model
    // never emitted a recognizable SOURCES line) and returns the full raw
    // text for the final, authoritative extractSources() parse.
    finish() {
      if (markerIndex === -1 && raw.length > sent) {
        onFlush(raw.slice(sent));
        sent = raw.length;
      }
      return raw;
    },
  };
}

// Parses OpenRouter's OpenAI-compatible SSE stream and yields each delta's
// text content as it arrives.
export async function* openRouterDeltas(response: Response): AsyncGenerator<string> {
  const body = response.body;
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const line = rawEvent.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch {
          // A malformed/partial SSE line — skip it rather than aborting the whole stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// nvidia/nemotron-3-super-120b-a12b is a hybrid-reasoning model — even with
// reasoning:{enabled:false} on the request (see app/api/chat/route.ts),
// OpenRouter's free tier occasionally still streams a raw chain-of-thought
// preamble instead of a real answer. Every leak observed live in production
// started with one of these unmistakable scratchpad phrases within the
// first few words, so peeking at the opening of a stream is enough to catch
// it before a visitor ever sees it — no need to inspect the whole answer,
// which would risk false-positives on legitimate text.
const REASONING_LEAK_PATTERN = /^(we need to|let'?s (think|craft|answer|see|write)|draft:|we must|okay,?\s|first,?\s+i\s|thinking:|<think>|i need to (figure|think))/i;
export function looksLikeReasoningLeak(text: string): boolean {
  return REASONING_LEAK_PATTERN.test(text.trim());
}

const PEEK_CHARS = 60;

async function* prefixThenContinue(prefix: string, rest: AsyncGenerator<string>): AsyncGenerator<string> {
  if (prefix) yield prefix;
  yield* rest;
}

// Reads just enough of a delta stream (~one clause) to judge whether it
// opens like leaked reasoning, then hands back a generator that replays
// exactly what it consumed followed by the rest of the same stream — the
// peek is invisible to whatever ends up consuming the returned generator.
async function peekDeltas(deltas: AsyncGenerator<string>): Promise<{ looksLikeLeak: boolean; stream: AsyncGenerator<string> } | null> {
  let peeked = "";
  while (peeked.length < PEEK_CHARS) {
    const { value, done } = await deltas.next();
    if (done) break;
    peeked += value;
  }
  if (!peeked) return null;
  return { looksLikeLeak: looksLikeReasoningLeak(peeked), stream: prefixThenContinue(peeked, deltas) };
}

// Tries fetchAttempt (which already owns its own HTTP-level retry for
// 429/5xx — see the route) up to twice, discarding the first attempt
// entirely and trying again if its opening looks like a reasoning leak.
// If the second attempt ALSO leaks, uses it anyway — the flush buffer and
// extractSources() downstream still work correctly on it (it's just
// probably a worse answer), and this stays far better than blocking a
// visitor's request indefinitely chasing a guarantee a free model can't
// promise.
export async function getCleanDeltaStream(fetchAttempt: () => Promise<Response>): Promise<AsyncGenerator<string> | null> {
  let fallback: AsyncGenerator<string> | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetchAttempt();
    if (!response.ok) continue;
    const peeked = await peekDeltas(openRouterDeltas(response));
    if (!peeked) continue;
    if (!peeked.looksLikeLeak) return peeked.stream;
    fallback = peeked.stream;
  }
  return fallback;
}

// Builds the outgoing ReadableStream for a live model call: consumes the
// OpenRouter delta generator, flushes visible text as "token" events,
// and emits one final "done" event with validated sources — calling
// onComplete so the route can write its own cache entry.
export function buildLiveSseStream(
  deltas: AsyncGenerator<string>,
  onComplete: (result: { answer: string; sources: SourceRef[] }) => void,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const buffer = createFlushBuffer((text) => {
        if (text) controller.enqueue(sseEncode({ type: "token", text }));
      });
      try {
        for await (const delta of deltas) buffer.push(delta);
        const raw = buffer.finish();
        const result = extractSources(raw);
        if (!result.answer) throw new Error("Empty answer after streaming");
        onComplete(result);
        controller.enqueue(sseEncode({ type: "done", sources: result.sources, mode: "live" }));
      } catch (error) {
        console.error("Chat stream failed mid-generation", error);
        controller.enqueue(sseEncode({ type: "error", error: "The live model is temporarily unavailable." }));
      } finally {
        controller.close();
      }
    },
  });
}

// A cache hit has no real streaming to do — but the client should never
// need two different code paths, so this delivers the already-known answer
// as a single token event immediately followed by done.
export function buildCachedSseStream(answer: string, sources: SourceRef[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(sseEncode({ type: "token", text: answer }));
      controller.enqueue(sseEncode({ type: "done", sources, mode: "cache" }));
      controller.close();
    },
  });
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-store",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;
