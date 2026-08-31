"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CheckCircle2, Mic, Minimize2, RotateCcw, Send, Volume2, VolumeX } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { spring } from "../lib/motion";
import { resolveSourceDisplay, SourceRef, TYPE_LABEL } from "../lib/citations";
import { consumeSseStream } from "../lib/stream-client";

type Mode = "chat" | "consult";
type Message = { role: "user" | "assistant"; text: string; warning?: boolean; sources?: SourceRef[] };
type Stage = "retrieving" | "reranking" | "generating" | null;
const STAGE_ORDER = ["retrieving", "reranking", "generating"] as const;
const STAGE_LABEL: Record<(typeof STAGE_ORDER)[number], string> = {
  retrieving: "Retrieving context",
  reranking: "Reranking",
  generating: "Generating answer",
};

// Web Speech API's recognition side isn't in this TypeScript toolchain's
// DOM lib (only the SpeechRecognitionResult/-List/-Alternative *data*
// types are — the recognizer class itself isn't) — this is the minimal
// shape this component actually calls, not a full spec polyfill.
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResultList }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// The real RAG pipeline stages instead of a generic spinner — completed
// steps get a checkmark, the active one pulses in the accent color.
// "Generating answer" now turns active on the first genuinely streamed
// token, not a synthetic timer.
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
const welcome = "System initialized. I can help you explore Gopal's GenAI stack, project architectures, experience, and availability. Switch to Consult to describe a problem instead.";
const quick = ["View AI stack", "Latest RAG project", "Hire Gopal"];
const consultQuick = [
  "I need to search thousands of PDFs for specific clauses",
  "I want to predict which customers will pay late",
  "I need multiple AI agents to coordinate a workflow",
];
const destinations: Record<string, string> = { "View AI stack": "#skills", "Latest RAG project": "#projects", "Hire Gopal": "#contact" };
const answers: Record<string, string> = {
  "View AI stack": "Gopal's stack spans Llama 3, Qwen, LoRA/QLoRA, vLLM, LangGraph, CrewAI, Qdrant, hybrid retrieval, FastAPI, Docker, PyTorch, AWS and GCP.",
  "Latest RAG project": "The AI Legal Assistant is designed around document ingestion, embeddings, hybrid retrieval, reranking and grounded generation. Open the Projects section to inspect its system flow.",
  "Hire Gopal": "Gopal is available for select Generative AI engineering and AI architecture roles. Use the Contact section for GitHub, LinkedIn, email and resume access.",
};
const consultFallback = "Live consult mode is temporarily unavailable. Browse the Systems section to see his real project architectures directly, or try again shortly.";
const chatFallback = "Gopalakrishna focuses on production-minded RAG, agent orchestration, model optimization and document intelligence. The live assistant is temporarily unavailable; try the project and skills sections instead.";
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
  const [mode, setMode] = useState<Mode>("chat");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

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
    setVoiceSupported(!!getSpeechRecognitionConstructor());
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
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
  // Stop listening and cancel any speaking utterance once the panel closes,
  // so voice features never keep running against a hidden panel.
  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();
      setListening(false);
      if (speechSupported) window.speechSynthesis.cancel();
    }
  }, [open, speechSupported]);

  function toggleListening() {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Constructor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function speak(text: string) {
    if (!speakEnabled || !speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
    utterance.rate = 1.02;
    window.speechSynthesis.speak(utterance);
  }

  async function respond(question: string) {
    if (!question.trim() || thinking) return;
    const unsafe = blocked.test(question);
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    setWarning(unsafe);

    if (unsafe) {
      const full = "[Guardrail exception]: I can only discuss Gopalakrishna's professional engineering profile. Try asking about his stack, projects, certifications, or availability.";
      setMessages((current) => [...current, { role: "assistant", text: full, warning: true, sources: [] }]);
      setThinking(false);
      setStage(null);
      return;
    }

    setStage("retrieving");
    const rerankTimer = window.setTimeout(() => setStage("reranking"), 450);
    setMessages((current) => [...current, { role: "assistant", text: "", sources: [] }]);

    let accumulated = "";
    let finalSources: SourceRef[] = [];
    let streamError: string | null = null;
    let gotFirstToken = false;

    try {
      const endpoint = mode === "consult" ? "/api/consult" : "/api/chat";
      const body =
        mode === "consult"
          ? JSON.stringify({ problem: question.trim() })
          : JSON.stringify({ message: question.trim(), history: messages.slice(-8).map((m) => ({ role: m.role, content: m.text })) });
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorBody.error || "Request failed");
      }
      window.clearTimeout(rerankTimer);
      await consumeSseStream(response, {
        onToken: (text) => {
          if (!gotFirstToken) {
            gotFirstToken = true;
            setStage("generating");
          }
          accumulated += text;
          const snapshot = accumulated;
          setMessages((current) => current.map((message, i) => (i === current.length - 1 ? { ...message, text: snapshot } : message)));
        },
        onDone: (sources) => {
          finalSources = sources;
        },
        onError: (message) => {
          streamError = message;
        },
      });
      if (streamError && !gotFirstToken) throw new Error(streamError);
      // If real tokens already streamed to the visitor before a late error
      // (e.g. the connection drops right at the end), keep what genuinely
      // streamed rather than discarding it for a canned fallback.
    } catch {
      window.clearTimeout(rerankTimer);
      const fallback = mode === "consult" ? consultFallback : answers[question] || chatFallback;
      accumulated = fallback;
      setMessages((current) => current.map((message, i) => (i === current.length - 1 ? { ...message, text: fallback } : message)));
    } finally {
      window.clearTimeout(rerankTimer);
      setMessages((current) => current.map((message, i) => (i === current.length - 1 ? { ...message, sources: finalSources } : message)));
      setThinking(false);
      setStage(null);
      highlightDiagramNodes(accumulated);
      speak(accumulated);
    }
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

  const quickPrompts = mode === "consult" ? consultQuick : quick;

  return (
    <div className="no-print fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6" ref={panel}>
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
            className={`flex h-[min(640px,80dvh)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-[var(--radius-md)] border bg-[var(--bg)] shadow-[0_40px_100px_-30px_rgba(0,0,0,.85)] ${warning ? "border-[#c9a25a]/50" : "border-white/[.14]"}`}
          >
            <header className={`shrink-0 border-b px-4 pb-3 pt-3 ${warning ? "border-[#c9a25a]/35" : "border-white/[.12]"}`}>
              <div className="flex h-10 items-center justify-between">
                <div>
                  <h2 id="gopal-assistant-title" className="font-mono text-xs text-white">
                    Gopal-Bot v1.0 <span className="text-[#8fae90]">[online]</span>
                  </h2>
                  <p id="gopal-assistant-description" className="mt-1 font-mono text-[9px] text-[var(--faint)]">Portfolio context assistant · streaming live</p>
                </div>
                <div className="flex items-center gap-1">
                  {speechSupported && (
                    <button
                      onClick={() => setSpeakEnabled((v) => !v)}
                      aria-label={speakEnabled ? "Disable spoken answers" : "Enable spoken answers"}
                      aria-pressed={speakEnabled}
                      className={`grid h-9 w-9 place-items-center rounded-full ${speakEnabled ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--accent)]"}`}
                    >
                      {speakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                  )}
                  <button onClick={() => closeAssistant()} aria-label="Minimize assistant" className="grid h-10 w-10 place-items-center text-[var(--muted)] hover:text-[var(--accent)]">
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div role="tablist" aria-label="Assistant mode" className="mt-2 grid grid-cols-2 gap-1 rounded-[var(--radius-pill)] border border-white/[.1] p-1">
                {(["chat", "consult"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`rounded-[var(--radius-pill)] py-1.5 font-mono text-[10px] uppercase tracking-[.08em] transition-colors ${mode === m ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--faint)] hover:text-[var(--muted)]"}`}
                  >
                    {m === "chat" ? "Ask" : "Consult"}
                  </button>
                ))}
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
                    {isLastAssistant && thinking && stage !== "generating" && <StageList stage={stage!} />}
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
              {messages.length <= 1 && !thinking && (
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((item) => (
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
                aria-label={mode === "consult" ? "Describe a problem" : "Ask Gopal AI assistant"}
                placeholder={thinking ? "Generating grounded answer…" : mode === "consult" ? "Describe a real problem you're solving…" : "Ask about stack, projects, or experience…"}
                className="min-w-0 flex-1 rounded-[var(--radius-pill)] border border-white/[.14] bg-white/[.02] px-4 py-3 font-mono text-[11px] text-white outline-none focus:border-[var(--accent)]"
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={thinking}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                  aria-pressed={listening}
                  className={`grid w-11 shrink-0 place-items-center rounded-full border disabled:opacity-30 ${listening ? "border-[#c96a6a]/50 bg-[#c96a6a]/10 text-[#c96a6a]" : "border-white/[.14] text-[var(--muted)] hover:text-[var(--accent)]"}`}
                >
                  <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                </button>
              )}
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
