"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Loader2, Sparkles, Terminal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const spring = { type: "spring" as const, stiffness: 200, damping: 25 };
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
    setQuery(value); setStream(""); setAnswer(""); setLoading(true);

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
      setAnswer(
        responses[value] ||
          "Gopalakrishna focuses on production RAG, agentic systems, and high-throughput inference. The live assistant is temporarily unavailable, but you can inspect the project case studies below.",
      );
    }
  }
  function submit(event: FormEvent) { event.preventDefault(); ask(query); }
  useEffect(() => {
    if (!loading || !answer) return;
    let index = 0;
    const timer = window.setInterval(() => { index += 1; setStream(answer.slice(0, index)); if (index >= answer.length) { clearInterval(timer); setLoading(false); } }, 11);
    return () => clearInterval(timer);
  }, [answer, loading]);

  return <div className="w-full max-w-3xl">
    <motion.div layout className="overflow-hidden border-l border-white/[.18] pl-5" transition={spring}>
      <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.12em] text-[#74787d]"><span className="flex items-center gap-2"><Terminal className="h-3 w-3 text-[#aebaff]"/>Ask the portfolio</span><span className={mode === "fallback" ? "text-[#d8c6aa]" : "text-[#9ac5a5]"}>{mode === "fallback" ? "Local index" : mode === "cache" ? "Cached" : "Live"}</span></div>
      <form onSubmit={submit} className="relative"><Sparkles className="absolute left-0 top-3.5 h-4 w-4 text-[#5e7cff]"/><input aria-label="Ask Gopal AI assistant" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Ask about experience, systems, or technical decisions…" className="w-full border-0 border-b border-white/[.18] bg-transparent py-3 pl-7 pr-12 text-sm text-white outline-none placeholder:text-[#5f6368] focus:border-[#5e7cff]"/><motion.button aria-label={loading?"Generating response":"Submit question"} whileHover={{scale:1.06}} whileTap={{scale:.94}} transition={spring} disabled={loading} className="absolute right-0 top-2 p-2 text-[#aebaff]">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<CornerDownLeft className="h-4 w-4"/>}</motion.button></form>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{prompts.map(([label,prompt])=><button key={label} onClick={()=>ask(prompt)} className="border-b border-transparent py-1 text-[11px] text-[#888c90] hover:border-[#5e7cff] hover:text-white">{label}</button>)}</div>
      <AnimatePresence>{(stream || loading) && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring} className="mt-5 overflow-hidden border-l border-[#5e7cff] bg-white/[.025] px-4 py-3 text-sm leading-6 text-[#b8babd]"><p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[#74787d]">Response {loading && "· composing"}</p>{stream}<span className="ml-1 inline-block h-3 w-px bg-[#aebaff]" /></motion.div>}</AnimatePresence>
    </motion.div>
  </div>;
}
