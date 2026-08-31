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
