import { SourceRef } from "./citations";

// Client-side counterpart to lib/chat-stream.ts's server-side SSE encoder —
// parses the same "event: X\ndata: Y\n\n" frames back out. Used by
// components/ai-assistant.tsx for both /api/chat and /api/consult, which
// emit an identical event shape.
export type StreamHandlers = {
  onToken: (text: string) => void;
  onDone: (sources: SourceRef[]) => void;
  onError: (message: string) => void;
};

export async function consumeSseStream(response: Response, handlers: StreamHandlers) {
  const body = response.body;
  if (!body) {
    handlers.onError("This response has no stream to read.");
    return;
  }
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const eventLine = rawEvent.split("\n").find((l) => l.startsWith("event:"));
        const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data:"));
        if (!eventLine || !dataLine) continue;
        const eventType = eventLine.slice(6).trim();
        try {
          const data = JSON.parse(dataLine.slice(5).trim()) as { text?: unknown; sources?: unknown; error?: unknown };
          if (eventType === "token" && typeof data.text === "string") {
            handlers.onToken(data.text);
          } else if (eventType === "done") {
            finished = true;
            handlers.onDone(Array.isArray(data.sources) ? (data.sources as SourceRef[]) : []);
          } else if (eventType === "error") {
            finished = true;
            handlers.onError(typeof data.error === "string" ? data.error : "The live model is temporarily unavailable.");
          }
        } catch {
          // A malformed/partial SSE frame — skip it rather than aborting the whole stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  if (!finished) handlers.onError("The connection ended before a full answer arrived.");
}
