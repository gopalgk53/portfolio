"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// A live-feeling trace through the real stages the flagship RAG pipeline
// documents (see components/visualizations/rag-flow.tsx) — not filler copy.
// Loops on the same setInterval + IntersectionObserver-pause pattern
// RagFlow/AgentFlow already use elsewhere in this codebase.
const STEPS = [
  { inProgress: "retrieving context…", done: "retrieving context — done" },
  { inProgress: "reranking 12 candidates…", done: "reranking 12 candidates — done" },
  { inProgress: "grounding check…", done: "grounding check: passed" },
  { inProgress: "generating answer", done: "generating answer" },
] as const;

export function HeroAgentTrace() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    const timer = setInterval(() => setActive((v) => (v + 1) % STEPS.length), 1500);
    return () => clearInterval(timer);
  }, [reducedMotion, visible]);

  return (
    <div ref={rootRef}>
      <div className="mt-3 font-mono text-[11px] leading-6">
        {STEPS.map((step, i) => {
          if (i > active) return null;
          const isCurrent = i === active;
          return (
            <div key={step.inProgress}>
              <span className={isCurrent ? "text-white/85" : "text-[var(--faint)]"}>
                &gt; {isCurrent || reducedMotion ? step.inProgress : step.done}
              </span>
              {isCurrent && !reducedMotion && <span className="trace-caret text-[var(--accent)]"> ▍</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/[.08]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
