"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { spring } from "../../lib/motion";

/**
 * Visualizes the AI Legal Assistant's retrieval loop. The technical middle
 * stages come verbatim from that project's documented `flow` field in
 * lib/data.ts (Documents → Embeddings → Vector DB → Rerank → LLM) — only the
 * "User" / "Answer" bookends are narrative framing, not technical claims.
 */
export function RagFlow({ flow }: { flow: string }) {
  const technicalStages = flow.split(" → ");
  const stages = ["User", ...technicalStages, "Answer"];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "-20% 0px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused) return;
    const timer = setInterval(() => setActive((v) => (v + 1) % stages.length), 1700);
    return () => clearInterval(timer);
  }, [visible, paused, stages.length]);

  return (
    <div ref={root} className="glass-panel p-6 sm:p-8">
      <p className="eyebrow mb-8">Retrieval loop</p>
      <div className="flex flex-wrap items-center gap-y-6 overflow-x-auto pb-2 sm:flex-nowrap sm:gap-0">
        {stages.map((stage, i) => (
          <div key={stage} className="contents">
            <button
              onClick={() => {
                setActive(i);
                setPaused(true);
              }}
              className="group relative flex shrink-0 flex-col items-start gap-2 px-1"
            >
              {active === i && (
                <motion.span layoutId="rag-active" transition={spring} className="absolute -inset-x-2 -inset-y-2 border border-[var(--accent)]" />
              )}
              <span className="relative font-mono text-[9px] text-[var(--faint)]">{String(i + 1).padStart(2, "0")}</span>
              <span className={`relative whitespace-nowrap font-mono text-[11px] uppercase tracking-[.08em] ${active === i ? "text-white" : "text-[var(--muted)]"}`}>{stage}</span>
            </button>
            {i < stages.length - 1 && (
              <span className="relative mx-3 h-px w-8 shrink-0 bg-white/[.14] sm:w-10">
                {active === i && (
                  <motion.span
                    className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-[var(--accent)]"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-lg text-sm leading-6 text-[var(--muted)]">
        Documents are embedded and indexed ahead of time; at query time the retriever pulls and reranks the closest matches before the LLM
        generates a grounded, source-aware answer.
      </p>
    </div>
  );
}
