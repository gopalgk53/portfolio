"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { spring } from "../../lib/motion";

/**
 * Visualizes the Multi-Agent Construction AI project. Stage names come
 * verbatim from that project's documented `flow` field (Planner →
 * Specialists → Tools → Human approval); the specialist workstream labels
 * are the literal domain words from that project's `goal` field — nothing
 * here names an agent or capability the project data doesn't already state.
 */
export function AgentFlow({ flow, domains }: { flow: string; domains: string[] }) {
  const technicalStages = flow.split(" → ");
  const stages = ["Request", ...technicalStages, "Response"];
  const specialistsIndex = stages.indexOf("Specialists");
  const [active, setActive] = useState(specialistsIndex >= 0 ? specialistsIndex : 0);
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
    const timer = setInterval(() => setActive((v) => (v + 1) % stages.length), 1900);
    return () => clearInterval(timer);
  }, [visible, paused, stages.length]);

  return (
    <div ref={root} className="border border-white/[.12] bg-white/[.015] p-6 sm:p-8">
      <p className="eyebrow mb-8">Agent coordination</p>
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-wrap items-center justify-center gap-y-6">
          {stages.map((stage, i) => (
            <div key={stage} className="contents">
              <button
                onClick={() => {
                  setActive(i);
                  setPaused(true);
                }}
                className="group relative flex shrink-0 flex-col items-center gap-2 px-1"
              >
                {active === i && <motion.span layoutId="agent-active" transition={spring} className="absolute -inset-x-2 -inset-y-2 border border-[var(--accent)]" />}
                <span className="relative font-mono text-[9px] text-[#5b5f64]">{String(i + 1).padStart(2, "0")}</span>
                <span className={`relative whitespace-nowrap font-mono text-[11px] uppercase tracking-[.08em] ${active === i ? "text-[#ece9e2]" : "text-[#83878c]"}`}>{stage}</span>
              </button>
              {i < stages.length - 1 && <span className="mx-3 h-px w-8 shrink-0 bg-white/[.14] sm:w-10" />}
            </div>
          ))}
        </div>

        <motion.div initial={false} animate={{ opacity: active === specialistsIndex ? 1 : 0.25 }} transition={spring} className="flex flex-wrap justify-center gap-3">
          {domains.map((domain) => (
            <span key={domain} className="border border-white/[.12] px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#c9cbce]">
              {domain}
            </span>
          ))}
        </motion.div>
      </div>
      <p className="mt-8 max-w-lg text-sm leading-6 text-[#83878c]">
        A planner routes each request to specialist workstreams, calls tools where needed, and holds the result for human approval before a
        final response is returned.
      </p>
    </div>
  );
}
