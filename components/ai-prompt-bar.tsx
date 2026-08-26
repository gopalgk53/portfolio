"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Loader2, Terminal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { spring } from "../lib/motion";

const prompts = [
  ["RAG stack", "What's his RAG stack?"],
  ["Latency", "View latency optimizations"],
  ["Agents", "Show agentic frameworks used"],
] as const;
const responses: Record<string, string> = {
  "What's his RAG stack?": "Hybrid retrieval with Qdrant or Pinecone, sparse + dense search, Reciprocal Rank Fusion, reranking, grounded generation, and evaluation-led observability.",
  "View latency optimizations": "The optimization toolkit includes vLLM continuous batching, quantization with AWQ/GGUF/GPTQ, FlashAttention, caching, streaming responses, and measured TTFT budgets.",
  "Show agentic frameworks used": "LangGraph, AutoGen, CrewAI, LlamaIndex, LangChain, and DSPy—selected according to state, tool-use, evaluation, and orchestration requirements.",
};

export function AIPromptBar() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [stream, setStream] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"live" | "cache" | "fallback">("live");

  async function ask(value: string) {
    if (!value.trim() || loading) return;
    setQuery(value);
    setStream("");
    setAnswer("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value.trim() }),
      });
      const data = (await response.json()) as { answer?: string; error?: string; mode?: "live" | "cache" };
      if (!response.ok || !data.answer) throw new Error(data.error || "No answer returned");
      setMode(data.mode || "live");
      setAnswer(data.answer);
    } catch {
      setMode("fallback");
      setAnswer(responses[value] || "Gopalakrishna focuses on production RAG, agentic systems, and high-throughput inference. The live assistant is temporarily unavailable, but you can inspect the project case studies below.");
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    ask(query);
  }
  useEffect(() => {
    if (!loading || !answer) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setStream(answer.slice(0, index));
      if (index >= answer.length) {
        clearInterval(timer);
        setLoading(false);
      }
    }, 11);
    return () => clearInterval(timer);
  }, [answer, loading]);

  return (
    <div className="w-full max-w-3xl">
      <motion.div layout transition={spring} className="rounded-[var(--radius-md)] border border-white/[.12] bg-white/[.015] p-5">
        <div className="mb-4 flex items-center justify-between text-xs text-[var(--muted)]">
          <span className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-[var(--accent)]" />
            Ask about my work
          </span>
          <span className={mode === "fallback" ? "text-[#c9a25a]" : "text-[#8fae90]"}>{mode === "fallback" ? "Offline answer" : mode === "cache" ? "Saved answer" : "Online"}</span>
        </div>
        <form onSubmit={submit} className="relative">
          <input
            aria-label="Ask Gopal AI assistant"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask about experience, systems, or technical decisions…"
            className="field py-3 pl-4 pr-12 text-sm"
          />
          <motion.button
            aria-label={loading ? "Generating response" : "Submit question"}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            disabled={loading}
            className="absolute right-2 top-2 rounded-full border border-white/[.14] bg-[var(--accent)] p-2 text-[var(--bg)]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          </motion.button>
        </form>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {prompts.map(([label, prompt]) => (
            <button key={label} onClick={() => ask(prompt)} className="border-b border-transparent py-1 text-[11px] text-[var(--muted)] hover:border-[var(--accent)] hover:text-white">
              {label}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {(stream || loading) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring} className="mt-5 overflow-hidden border-l border-[var(--accent)] pl-4 text-sm leading-6 text-[var(--muted)]">
              <p className="mb-1 text-xs text-[var(--muted)]">{loading ? "Writing…" : "Answer"}</p>
              {stream}
              <span className="ml-1 inline-block h-3 w-px bg-[var(--accent)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
