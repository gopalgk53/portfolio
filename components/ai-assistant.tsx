"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Minimize2, RotateCcw, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { spring } from "../lib/motion";

type Message = { role: "user" | "assistant"; text: string; warning?: boolean };
const STORE = "gopal-bot-session-v1";
const welcome = "System initialized. I can help you explore Gopal's GenAI stack, project architectures, experience, and availability.";
const quick = ["View AI stack", "Latest RAG project", "Hire Gopal"];
const destinations: Record<string, string> = { "View AI stack": "#skills", "Latest RAG project": "#projects", "Hire Gopal": "#contact" };
const answers: Record<string, string> = {
  "View AI stack": "Gopal's stack spans Llama 3, Qwen, LoRA/QLoRA, vLLM, LangGraph, CrewAI, Qdrant, hybrid retrieval, FastAPI, Docker, PyTorch, AWS and GCP.",
  "Latest RAG project": "The AI Legal Assistant is designed around document ingestion, embeddings, hybrid retrieval, reranking and grounded generation. Open the Projects section to inspect its system flow.",
  "Hire Gopal": "Gopal is available for select Generative AI engineering and AI architecture roles. Use the Contact section for GitHub, LinkedIn, email and resume access.",
};
const blocked = /ignore previous|system prompt|write a poem|cats|jailbreak|developer message|hidden instruction/i;

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [warning, setWarning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("gopal-bot-tooltip")) setTooltip(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (messages.length) sessionStorage.setItem(STORE, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role === "user" && destinations[last.text]) setTimeout(() => document.querySelector(destinations[last.text])?.scrollIntoView({ behavior: "smooth" }), 180);
  }, [messages]);
  useEffect(() => {
    if (open) {
      setTooltip(false);
      sessionStorage.setItem("gopal-bot-tooltip", "seen");
      setTimeout(() => inputRef.current?.focus(), 260);
      if (!messages.length) setMessages([{ role: "assistant", text: welcome }]);
    }
  }, [open, messages.length]);
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (open && panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  async function respond(question: string) {
    if (!question.trim() || thinking) return;
    const unsafe = blocked.test(question);
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    setWarning(unsafe);

    let full = "";
    if (unsafe) {
      full = "[Guardrail exception]: I can only discuss Gopalakrishna's professional engineering profile. Try asking about his stack, projects, certifications, or availability.";
    } else {
      try {
        const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question.trim() }) });
        const data = (await response.json()) as { answer?: string; error?: string };
        if (!response.ok || !data.answer) throw new Error(data.error || "No answer returned");
        full = data.answer;
      } catch {
        full = answers[question] || "Gopalakrishna focuses on production-minded RAG, agent orchestration, model optimization and document intelligence. The live assistant is temporarily unavailable; try the project and skills sections instead.";
      }
    }

    let index = 0;
    setMessages((current) => [...current, { role: "assistant", text: "", warning: unsafe }]);
    const timer = setInterval(() => {
      index += 3;
      setMessages((current) => current.map((message, i) => (i === current.length - 1 ? { ...message, text: full.slice(0, index) } : message)));
      if (index >= full.length) {
        clearInterval(timer);
        setThinking(false);
      }
    }, 18);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    respond(input);
  }
  function reset() {
    sessionStorage.removeItem(STORE);
    setMessages([{ role: "assistant", text: welcome }]);
    setWarning(false);
    setThinking(false);
    setInput("");
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6" ref={panel}>
      <AnimatePresence>
        {tooltip && !open && (
          <motion.button
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12 }}
            transition={spring}
            onClick={() => setOpen(true)}
            className="absolute bottom-2 right-16 w-64 border border-white/[.14] bg-[#0a0a0b]/95 p-3 text-left font-mono text-[11px] leading-5 text-[#c9cbce]"
          >
            System online. Ask me about Gopal&apos;s AI stack…
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="orb"
            aria-label="Open Gopal AI assistant"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            transition={spring}
            className="grid h-14 w-14 place-items-center rounded-full border border-white/[.16] bg-[#0a0a0b] text-[var(--accent)]"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        ) : (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="Gopal AI assistant"
            initial={{ opacity: 0, scale: 0.72, y: 40, x: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.72, y: 38, x: 24 }}
            transition={spring}
            className={`flex h-[min(600px,78dvh)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden border bg-[#0a0a0b] ${warning ? "border-[#c9a25a]/50" : "border-white/[.14]"}`}
          >
            <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 ${warning ? "border-[#c9a25a]/35" : "border-white/[.12]"}`}>
              <div>
                <p className="font-mono text-xs text-[#ece9e2]">
                  Gopal-Bot v1.0 <span className="text-[#8fae90]">[online]</span>
                </p>
                <p className="mt-1 font-mono text-[9px] text-[#6c7075]">portfolio_context_node</p>
              </div>
              <div className="flex">
                <button onClick={() => setOpen(false)} aria-label="Minimize assistant" className="grid h-10 w-10 place-items-center text-[#83878c] hover:text-[var(--accent)]">
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-10 w-10 place-items-center text-[#83878c] hover:text-[var(--accent)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div ref={feed} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className={`max-w-[90%] p-3 text-xs leading-6 ${message.role === "user" ? "ml-auto border border-white/[.14] bg-transparent text-[#c9cbce]" : "border-l-2 border-[var(--accent)] bg-white/[.02] text-[#c9cbce]"}`}
                >
                  {message.text}
                  {message.role === "assistant" && index === messages.length - 1 && thinking && <span className="ml-1 animate-pulse text-[var(--accent)]">▮</span>}
                  {message.warning && (
                    <button onClick={reset} className="mt-3 flex items-center gap-2 border border-[#c9a25a]/30 px-3 py-2 font-mono text-[10px] text-[#c9a25a]">
                      <RotateCcw className="h-3 w-3" />
                      Reset session
                    </button>
                  )}
                </motion.div>
              ))}
              {thinking && messages[messages.length - 1]?.role !== "assistant" && <div className="font-mono text-[10px] text-[#83878c]">Calculating semantic vector distances…</div>}
              {messages.length <= 1 && !thinking && (
                <div className="flex flex-wrap gap-2">
                  {quick.map((item) => (
                    <button key={item} onClick={() => respond(item)} className="border border-white/[.14] px-3 py-2 font-mono text-[10px] text-[#c9cbce] hover:border-[var(--accent)]">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={submit} className="flex shrink-0 gap-2 border-t border-white/[.12] p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={thinking}
                aria-label="Ask Gopal AI assistant"
                placeholder={thinking ? "Calculating vector distances…" : "Ask about stack, projects, or experience…"}
                className="min-w-0 flex-1 border border-white/[.14] bg-white/[.02] px-3 py-3 font-mono text-[11px] text-[#ece9e2] outline-none focus:border-[var(--accent)]"
              />
              <button disabled={thinking || !input.trim()} aria-label="Send message" className="grid w-11 place-items-center border border-white/[.14] bg-[var(--accent-soft)] text-[var(--accent)] disabled:opacity-30">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
