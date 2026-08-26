"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { spring } from "../lib/motion";

type Status = "idle" | "ready" | "computing" | "streaming" | "complete" | "error";
const panel = "rounded-[var(--radius-md)] border border-white/[.12] bg-white/[.015]";
const FALLBACK_ANSWER = "The live model is temporarily unavailable, so this is a static example: a production-ready RAG response should ground every claim in retrieved evidence, apply explicit refusal rules, preserve source attribution, and return a predictable structure for downstream systems.";

export function PromptPlayground() {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [topP, setTopP] = useState(0.9);
  const [divider, setDivider] = useState(50);
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("");
  const [latency, setLatency] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [focus, setFocus] = useState<0 | 1 | 2 | 3>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestId = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [output, reduced]);

  useEffect(() => () => {
    if (revealTimer.current) clearInterval(revealTimer.current);
  }, []);

  function revealAnswer(text: string) {
    if (revealTimer.current) clearInterval(revealTimer.current);
    setStatus("streaming");
    let index = 0;
    revealTimer.current = setInterval(
      () => {
        index += reduced ? text.length : 4;
        setOutput(text.slice(0, index));
        if (index >= text.length) {
          if (revealTimer.current) clearInterval(revealTimer.current);
          setStatus("complete");
        }
      },
      reduced ? 1 : 24,
    );
  }

  async function execute() {
    if (!prompt.trim()) {
      setStatus("error");
      setFocus(1);
      return;
    }
    const thisRequest = ++requestId.current;
    setStatus("computing");
    setFocus(3);
    setOutput("");
    setLatency(0);
    setTokens(0);
    setErrorMessage("");

    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), temperature, topP }),
      });
      const data = (await response.json()) as { answer?: string; latencyMs?: number; tokens?: number; error?: string };
      if (thisRequest !== requestId.current) return; // a newer run superseded this one

      if (!response.ok || !data.answer) {
        setErrorMessage(data.error || "The live model is temporarily unavailable.");
        setLatency(0);
        setTokens(0);
        revealAnswer(FALLBACK_ANSWER);
        return;
      }

      setLatency(data.latencyMs ?? 0);
      setTokens(data.tokens ?? Math.ceil(data.answer.length / 4));
      revealAnswer(data.answer);
    } catch {
      if (thisRequest !== requestId.current) return;
      setErrorMessage("Network error reaching the live model.");
      revealAnswer(FALLBACK_ANSWER);
    }
  }
  function reset() {
    requestId.current += 1; // orphan any in-flight request/reveal
    if (revealTimer.current) clearInterval(revealTimer.current);
    setPrompt("");
    setTemperature(0.3);
    setTopP(0.9);
    setDivider(50);
    setStatus("idle");
    setOutput("");
    setLatency(0);
    setTokens(0);
    setErrorMessage("");
    setFocus(0);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[.1em] text-[var(--faint)]">Status: {status}</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={spring} onClick={reset} className="btn-pill btn-pill--outline">
          <RotateCcw className="h-3 w-3" />
          Reset
        </motion.button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_.9fr_1.25fr]">
        <motion.article animate={{ opacity: focus === 0 || focus === 1 ? 1 : 0.55 }} transition={spring} className={`${panel} flex min-h-[500px] flex-col p-5 ${status === "error" ? "!border-[#c96a6a]/70" : ""}`} onFocus={() => setFocus(1)} onBlur={() => setFocus(0)}>
          <header className="flex justify-between text-xs">
            <span className="font-medium text-[var(--muted)]">Write a prompt</span>
            <span className={status === "error" ? "text-[#c96a6a]" : "text-[var(--faint)]"}>{status === "error" ? "Add a prompt" : prompt ? "Ready" : "Empty"}</span>
          </header>
          <div className="relative mt-5">
            <span className="absolute left-3 top-3 font-mono text-sm text-[var(--accent)]">›</span>
            <textarea
              aria-label="Prompt playground input"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (status === "error") setStatus("ready");
              }}
              rows={8}
              placeholder={status === "error" ? "Add a prompt to inspect model behavior." : "Enter a prompt to inspect model behavior…"}
              className="w-full resize-none rounded-[var(--radius-sm)] border border-white/[.12] bg-black/40 py-3 pl-8 pr-3 font-mono text-xs leading-6 text-[var(--muted)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="mt-2 flex gap-4 font-mono text-[9px] text-[var(--faint)]">
            <span>CHARS: {prompt.length}</span>
            <span>TOKENS_EST: {Math.ceil(prompt.length / 4)}</span>
            <span>GROUNDING: ON</span>
          </div>
          <div className="mt-6 space-y-5">
            <label className="block font-mono text-[10px] text-[var(--muted)]">
              TEMPERATURE <b className="float-right text-white">{temperature.toFixed(1)}</b>
              <input type="range" min="0" max="1.5" step=".1" value={temperature} disabled={status === "computing" || status === "streaming"} onChange={(e) => setTemperature(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" />
            </label>
            <label className="block font-mono text-[10px] text-[var(--muted)]">
              TOP-P <b className="float-right text-white">{topP.toFixed(1)}</b>
              <input type="range" min=".1" max="1" step=".1" value={topP} disabled={status === "computing" || status === "streaming"} onChange={(e) => setTopP(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" />
            </label>
          </div>
          <motion.button onClick={execute} disabled={status === "computing" || status === "streaming"} whileTap={{ scale: 0.98 }} transition={spring} className="btn-pill btn-pill--solid mt-auto self-end">
            {status === "computing" || status === "streaming" ? "Generating…" : "Run prompt"}
          </motion.button>
        </motion.article>

        <motion.article animate={{ opacity: focus === 0 || focus === 2 ? 1 : 0.55 }} transition={spring} className={`${panel} min-h-[500px] p-5`} onPointerDown={() => setFocus(2)}>
          <header className="flex justify-between text-xs">
            <span className="font-medium text-[var(--muted)]">Compare approaches</span>
            <span className="text-[var(--faint)]">Basic ↔ structured</span>
          </header>
          <div className="relative mt-5 h-[390px] overflow-hidden rounded-[var(--radius-sm)] border border-white/[.1] bg-black/40">
            <div className="absolute inset-0 p-5 font-mono text-[10px] leading-6 text-[var(--faint)]">
              <b className="text-[var(--muted)]">NAIVE PROMPT</b>
              <p className="mt-5">Answer my question about this document. Make the answer useful.</p>
              <p className="mt-8 text-[#c96a6a]/70">RISK: HIGH AMBIGUITY</p>
            </div>
            <div style={{ clipPath: `inset(0 0 0 ${divider}%)` }} className="absolute inset-0 bg-[var(--bg)] p-5 font-mono text-[10px] leading-6 text-[var(--muted)]">
              <b className="text-white">OPTIMIZED SYSTEM PROMPT</b>
              <p className="mt-5">
                <span className="text-[var(--accent)]">ROLE:</span> Evidence-grounded legal assistant
                <br />
                <span className="text-[var(--accent)]">CONTEXT:</span> Retrieved source chunks only
                <br />
                <span className="text-[var(--accent)]">GUARDRAIL:</span> Refuse unsupported claims
                <br />
                <span className="text-[var(--accent)]">FORMAT:</span> Answer, evidence, confidence
                <br />
                <span className="text-[var(--accent)]">EVALUATE:</span> Cite every material statement
              </p>
              <p className="mt-8 text-[#8fae90]">RISK: CONTROLLED</p>
            </div>
            <div style={{ left: `${divider}%` }} className="pointer-events-none absolute inset-y-0 w-px bg-[var(--accent)]" />
            <input aria-label="Compare naive and optimized prompt" type="range" min="5" max="95" value={divider} onChange={(e) => setDivider(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
            <div style={{ left: `calc(${divider}% - 18px)` }} className="pointer-events-none absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/[.2] bg-[var(--bg)] font-mono text-[9px] text-[var(--muted)]">
              ↔
            </div>
          </div>
        </motion.article>

        <motion.article animate={{ opacity: focus === 0 || focus === 3 ? 1 : 0.55 }} transition={spring} className={`${panel} flex min-h-[500px] flex-col p-5`} onPointerDown={() => setFocus(3)}>
          <header className="flex justify-between text-xs">
            <span className="font-medium text-[var(--muted)]">Example output</span>
            <span className="text-[var(--muted)]">{status === "idle" || status === "ready" || status === "error" ? "Waiting" : status}</span>
          </header>
          <div ref={outputRef} className="relative mt-5 flex-1 overflow-y-auto rounded-[var(--radius-sm)] border border-white/[.1] bg-black/40 p-5 font-mono text-xs leading-7 text-[var(--muted)]">
            {(status === "idle" || status === "ready" || status === "error") && <p className="text-[var(--faint)]">Awaiting execution. Enter a prompt and run it.</p>}
            {status === "computing" && (
              <div className="grid h-full place-items-center text-center text-[var(--muted)]">
                <div>
                  <Sparkles className="mx-auto mb-4 h-5 w-5 animate-pulse" />
                  <p>Calling the live model…</p>
                </div>
              </div>
            )}
            {(status === "streaming" || status === "complete") && (
              <p>
                {output}
                <span className={status === "streaming" ? "animate-pulse text-[var(--accent)]" : "hidden"}> █</span>
              </p>
            )}
          </div>
          {errorMessage && (status === "streaming" || status === "complete") && (
            <p className="mt-2 font-mono text-[9px] text-[#c96a6a]">{errorMessage} Showing a static example instead.</p>
          )}
          <footer className="mt-4 border-t border-white/[.1] pt-3">
            <p className="mb-2 font-mono text-[8px] uppercase tracking-[.14em] text-[var(--faint)]">{errorMessage ? "Fallback example" : "Live model telemetry"}</p>
            <div className="flex justify-between gap-4 font-mono text-[9px]">
              <span className="text-[var(--muted)]">LATENCY: {latency > 0 ? `${latency.toFixed(0)}ms` : "—"}</span>
              <span className="text-[var(--muted)]">TOKENS: {tokens > 0 ? tokens : "—"}</span>
            </div>
          </footer>
        </motion.article>
      </div>
    </div>
  );
}
