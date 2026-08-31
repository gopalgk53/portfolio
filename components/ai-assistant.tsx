"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CheckCircle2, Minimize2, RotateCcw, Send } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { spring } from "../lib/motion";
import { resolveSourceDisplay, SourceRef, TYPE_LABEL } from "../lib/citations";

type Message = { role: "user" | "assistant"; text: string; warning?: boolean; sources?: SourceRef[] };
type Stage = "retrieving" | "reranking" | "generating" | null;
const STAGE_ORDER = ["retrieving", "reranking", "generating"] as const;
const STAGE_LABEL: Record<(typeof STAGE_ORDER)[number], string> = {
  retrieving: "Retrieving context",
  reranking: "Reranking",
  generating: "Generating answer",
};

// The real RAG pipeline stages instead of a generic spinner — completed
// steps get a checkmark, the active one pulses in the accent color.
function StageList({ stage }: { stage: NonNullable<Stage> }) {
  const activeIndex = STAGE_ORDER.indexOf(stage);
  return (
    <div className="mb-3 flex flex-col gap-1.5 font-mono text-[10px]">
      {STAGE_ORDER.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={s} className={`flex items-center gap-2 ${active ? "text-[var(--accent)]" : "text-[var(--faint)]"}`}>
            {done ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : active ? (
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--accent)]" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-current opacity-40" />
            )}
            <span className={done ? "line-through decoration-[var(--faint)]/60" : ""}>{STAGE_LABEL[s]}</span>
          </div>
        );
      })}
    </div>
  );
}
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

// The literal stage labels RagFlow/AgentFlow render (see their `stages`
// arrays) — not a separate vocabulary invented here. When an answer
// mentions one, the matching diagram node highlights, via the same
// window-event convention already used for gopal-open-assistant/gopal-effects.
// Exactly the `flow` values from lib/data.ts's legal-rag and multi-agent
// projects (split on " → "), minus the generic User/Answer/Request/Response
// bookends RagFlow/AgentFlow add themselves — those are common English
// words that would false-trigger on unrelated answers.
const DIAGRAM_LABELS = ["Documents", "Embeddings", "Vector DB", "Rerank", "LLM", "Planner", "Specialists", "Tools", "Human approval"];
function highlightDiagramNodes(answer: string) {
  const lower = answer.toLowerCase();
  for (const label of DIAGRAM_LABELS) {
    if (lower.includes(label.toLowerCase())) {
      window.dispatchEvent(new CustomEvent("gopal-highlight-node", { detail: { label } }));
    }
  }
}

function inlineFormat(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>,
  );
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split(/\n|(?=\s- \*\*)/).map(line => line.trim()).filter(Boolean);
  return <div className="space-y-2">{lines.map((line, index) => {
    const bullet = line.startsWith("- ");
    const content = bullet ? line.slice(2) : line;
    return bullet
      ? <div key={index} className="grid grid-cols-[8px_1fr] gap-2"><span className="mt-[.65rem] h-1 w-1 bg-[var(--accent)]"/><span>{inlineFormat(content)}</span></div>
      : <p key={index}>{inlineFormat(content)}</p>;
  })}</div>;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [stage, setStage] = useState<Stage>(null);
  const [warning, setWarning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeAssistant(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 500);
  }

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
      if (open && panel.current && !panel.current.contains(event.target as Node)) closeAssistant(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) closeAssistant();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  useEffect(() => {
    const openFromPalette = () => setOpen(true);
    window.addEventListener("gopal-open-assistant", openFromPalette);
    return () => window.removeEventListener("gopal-open-assistant", openFromPalette);
  }, []);

  async function respond(question: string) {
    if (!question.trim() || thinking) return;
    const unsafe = blocked.test(question);
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    setWarning(unsafe);

    let full = "";
    let sources: SourceRef[] = [];
    if (unsafe) {
      full = "[Guardrail exception]: I can only discuss Gopalakrishna's professional engineering profile. Try asking about his stack, projects, certifications, or availability.";
    } else {
      setStage("retrieving");
      const rerankTimer = window.setTimeout(() => setStage("reranking"), 450);
      try {
        const history = messages.slice(-8).map(message => ({ role: message.role, content: message.text }));
        const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question.trim(), history }) });
        const data = (await response.json()) as { answer?: string; sources?: SourceRef[]; error?: string };
        if (!response.ok || !data.answer) throw new Error(data.error || "No answer returned");
        full = data.answer;
        sources = Array.isArray(data.sources) ? data.sources : [];
      } catch {
        full = answers[question] || "Gopalakrishna focuses on production-minded RAG, agent orchestration, model optimization and document intelligence. The live assistant is temporarily unavailable; try the project and skills sections instead.";
      } finally {
        window.clearTimeout(rerankTimer);
      }
    }
    setStage("generating");

    let index = 0;
    setMessages((current) => [...current, { role: "assistant", text: "", warning: unsafe, sources }]);
    const timer = setInterval(() => {
      index += 3;
      setMessages((current) => current.map((message, i) => (i === current.length - 1 ? { ...message, text: full.slice(0, index) } : message)));
      if (index >= full.length) {
        clearInterval(timer);
        setThinking(false);
        setStage(null);
        if (!unsafe) highlightDiagramNodes(full);
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
    setStage(null);
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
            className="card-elevated absolute bottom-2 right-16 w-64 bg-[var(--bg)]/95 p-3 text-left font-mono text-[11px] leading-5 text-[var(--muted)]"
          >
            System online. Ask me about Gopal&apos;s AI stack…
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="orb"
            ref={triggerRef}
            aria-label="Open Gopal AI assistant"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            transition={spring}
            className="grid h-14 w-14 place-items-center rounded-full border border-white/[.16] bg-[var(--bg)] text-[var(--accent)]"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        ) : (
          <motion.section
            key="panel"
            role="dialog"
            aria-labelledby="gopal-assistant-title"
            aria-describedby="gopal-assistant-description"
            initial={{ opacity: 0, scale: 0.72, y: 40, x: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.72, y: 38, x: 24 }}
            transition={spring}
            className={`flex h-[min(600px,78dvh)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-[var(--radius-md)] border bg-[var(--bg)] shadow-[0_40px_100px_-30px_rgba(0,0,0,.85)] ${warning ? "border-[#c9a25a]/50" : "border-white/[.14]"}`}
          >
            <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 ${warning ? "border-[#c9a25a]/35" : "border-white/[.12]"}`}>
              <div>
                <h2 id="gopal-assistant-title" className="font-mono text-xs text-white">
                  Gopal-Bot v1.0 <span className="text-[#8fae90]">[online]</span>
                </h2>
                <p id="gopal-assistant-description" className="mt-1 font-mono text-[9px] text-[var(--faint)]">Portfolio context assistant</p>
              </div>
              <div className="flex">
                <button onClick={() => closeAssistant()} aria-label="Minimize assistant" className="grid h-10 w-10 place-items-center text-[var(--muted)] hover:text-[var(--accent)]">
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div ref={feed} role="log" aria-live="polite" aria-relevant="additions text" aria-busy={thinking} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => {
                const isLastAssistant = message.role === "assistant" && index === messages.length - 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className={`max-w-[90%] rounded-[var(--radius-sm)] p-3 text-xs leading-6 ${message.role === "user" ? "ml-auto border border-white/[.14] bg-transparent text-[var(--muted)]" : "border-l-2 border-[var(--accent)] bg-white/[.02] text-[var(--muted)]"}`}
                  >
                    {isLastAssistant && thinking && stage === "generating" && <StageList stage={stage} />}
                    {message.role === "assistant" ? <FormattedMessage text={message.text} /> : message.text}
                    {isLastAssistant && thinking && <span className="ml-1 animate-pulse text-[var(--accent)]">▮</span>}
                    {message.role === "assistant" && !!message.sources?.length && !(isLastAssistant && thinking) && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/[.08] pt-3">
                        {message.sources.map((source) => {
                          const display = resolveSourceDisplay(source);
                          if (!display) return null;
                          return (
                            <a
                              key={source.id}
                              href={display.href}
                              target={display.external ? "_blank" : undefined}
                              rel={display.external ? "noreferrer" : undefined}
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/[.14] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.08em] text-[var(--faint)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            >
                              <span className="text-[var(--accent)]">{TYPE_LABEL[source.type]}</span>
                              {display.title}
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {message.warning && (
                      <button onClick={reset} className="mt-3 flex items-center gap-2 rounded-full border border-[#c9a25a]/30 px-3 py-2 font-mono text-[10px] text-[#c9a25a]">
                        <RotateCcw className="h-3 w-3" />
                        Reset session
                      </button>
                    )}
                  </motion.div>
                );
              })}
              {thinking && messages[messages.length - 1]?.role !== "assistant" && stage && stage !== "generating" && <StageList stage={stage} />}
              {messages.length <= 1 && !thinking && (
                <div className="flex flex-wrap gap-2">
                  {quick.map((item) => (
                    <button key={item} onClick={() => respond(item)} className="rounded-full border border-white/[.14] px-3 py-2 font-mono text-[10px] text-[var(--muted)] hover:border-[var(--accent)]">
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
                placeholder={thinking ? "Generating grounded answer…" : "Ask about stack, projects, or experience…"}
                className="min-w-0 flex-1 rounded-[var(--radius-pill)] border border-white/[.14] bg-white/[.02] px-4 py-3 font-mono text-[11px] text-white outline-none focus:border-[var(--accent)]"
              />
              <button disabled={thinking || !input.trim()} aria-label="Send message" className="grid w-11 shrink-0 place-items-center rounded-full border border-white/[.14] bg-[var(--accent-soft)] text-[var(--accent)] disabled:opacity-30">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
