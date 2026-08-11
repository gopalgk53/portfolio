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

  function ask(value: string) {
    if (!value.trim() || loading) return;
    setQuery(value); setStream(""); setLoading(true);
    setAnswer(responses[value] || `Gopalakrishnan focuses on production RAG, agentic systems, and high-throughput inference. Ask about a specific architecture or open a project case study below.`);
  }
  function submit(event: FormEvent) { event.preventDefault(); ask(query); }
  useEffect(() => {
    if (!loading || !answer) return;
    let index = 0;
    const timer = window.setInterval(() => { index += 1; setStream(answer.slice(0, index)); if (index >= answer.length) { clearInterval(timer); setLoading(false); } }, 11);
    return () => clearInterval(timer);
  }, [answer, loading]);

  return <div className="mt-10 w-full max-w-3xl">
    <motion.div layout className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl shadow-blue-500/5 backdrop-blur-xl" transition={spring}>
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/70 pb-3 font-mono text-[11px] text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-red-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-400" /><Terminal className="ml-2 h-3.5 w-3.5 text-violet-400" />gopal-ai-v1.0</span><span className="text-emerald-400">● active_node</span></div>
      <form onSubmit={submit} className="relative"><Sparkles className="absolute left-3 top-3.5 h-4 w-4 text-violet-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask Gopal's AI assistant about his stack, experience, or system architecture..." className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-10 pr-12 font-mono text-xs text-slate-100 outline-none focus:border-violet-500/60" /><motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }} transition={spring} disabled={loading} className="absolute right-2 top-2 rounded-lg border border-violet-500/30 bg-violet-600/20 p-2 text-violet-300">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}</motion.button></form>
      <div className="mt-3 flex flex-wrap gap-2">{prompts.map(([label, prompt]) => <motion.button key={label} whileHover={{ y: -2 }} whileTap={{ scale: .97 }} transition={spring} onClick={() => ask(prompt)} className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[10px] text-slate-400">{label}</motion.button>)}</div>
      <AnimatePresence>{(stream || loading) && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring} className="mt-4 overflow-hidden rounded-xl border border-violet-900/40 bg-slate-900/80 p-3.5 font-mono text-xs leading-6 text-slate-300"><p className="mb-1 text-[9px] uppercase tracking-widest text-violet-400">agent_output {loading && "● streaming"}</p>{stream}<span className="ml-1 inline-block h-3 w-1 bg-violet-400" /></motion.div>}</AnimatePresence>
    </motion.div>
  </div>;
}
