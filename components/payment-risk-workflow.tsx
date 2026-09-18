"use client";

import { motion } from "framer-motion";
import { Activity, Brain, Database, Search, Server, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { spring } from "../lib/motion";

// Three real phases of this project's actual pipeline (lib/data.ts's flow:
// "S3 → Glue → Athena → SageMaker → ECS → CloudWatch") — grouped by what
// each stage genuinely does (ingest/transform/query, train/host, serve/
// monitor), not an arbitrary layout. One-liners describe each AWS
// service's real, generic role in this kind of pipeline; nothing here
// claims a project-specific metric that isn't already stated elsewhere on
// this page.
const PHASES = [
  {
    label: "Data lake",
    stages: [
      { name: "S3", Icon: Database, detail: "Raw payment and project records land here first." },
      { name: "Glue", Icon: Workflow, detail: "ETL jobs clean and transform the raw records." },
      { name: "Athena", Icon: Search, detail: "SQL queries the curated data lake directly." },
    ],
  },
  {
    label: "Modeling",
    stages: [{ name: "SageMaker", Icon: Brain, detail: "Trains and hosts the payment-risk scoring model." }],
  },
  {
    label: "Serving & ops",
    stages: [
      { name: "ECS", Icon: Server, detail: "Serves the model behind the dashboard's API." },
      { name: "CloudWatch", Icon: Activity, detail: "Monitors requests, latency, and drift." },
    ],
  },
];

const FLAT_STAGES = PHASES.flatMap((phase) => phase.stages.map((stage) => ({ ...stage, phase: phase.label })));

export function PaymentRiskWorkflow() {
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
    const timer = setInterval(() => setActive((v) => (v + 1) % FLAT_STAGES.length), 1900);
    return () => clearInterval(timer);
  }, [visible, paused]);

  let stageIndex = 0;

  return (
    <div ref={root} className="glass-panel p-6 sm:p-8">
      <p className="eyebrow mb-8">Real pipeline · S3 → Glue → Athena → SageMaker → ECS → CloudWatch</p>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        {PHASES.map((phase, phaseIndex) => {
          const startIndex = stageIndex;
          stageIndex += phase.stages.length;
          const phaseActive = active >= startIndex && active < startIndex + phase.stages.length;
          return (
            <div key={phase.label} className="contents lg:flex lg:items-stretch">
              <div className={`flex-1 rounded-[var(--radius-md)] border p-5 transition-colors ${phaseActive ? "border-[var(--accent)]/60 bg-[var(--accent-soft)]" : "border-white/[.12]"}`}>
                <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--faint)]">{phase.label}</p>
                <div className="mt-4 flex flex-col gap-4">
                  {phase.stages.map((stage, i) => {
                    const index = startIndex + i;
                    const isActive = active === index;
                    return (
                      <button
                        key={stage.name}
                        onClick={() => {
                          setActive(index);
                          setPaused(true);
                        }}
                        className="group flex items-start gap-3 text-left"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border transition-colors ${isActive ? "border-[var(--accent)] text-[var(--accent)]" : "border-white/[.14] text-[var(--faint)] group-hover:text-[var(--muted)]"}`}>
                          <stage.Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className={`block font-mono text-[11px] uppercase tracking-[.06em] ${isActive ? "text-white" : "text-[var(--muted)]"}`}>{stage.name}</span>
                          <span className="mt-1 block max-w-[16rem] text-xs leading-5 text-[var(--faint)]">{stage.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {phaseIndex < PHASES.length - 1 && (
                <div className="my-3 flex items-center justify-center lg:my-0 lg:w-10 lg:shrink-0">
                  <span className="relative h-8 w-px bg-white/[.14] lg:h-px lg:w-8">
                    {phaseActive && (
                      <>
                        {/* Two separate dots rather than one animating both axes —
                            animating top+left together would drift diagonally
                            instead of tracking the connector's actual axis at
                            each breakpoint (vertical line on mobile, horizontal
                            on desktop). */}
                        <motion.span
                          className="absolute -left-[3px] block h-[7px] w-[7px] rounded-full bg-[var(--accent)] lg:hidden"
                          animate={{ top: ["0%", "100%"] }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        <motion.span
                          className="absolute -top-[3px] hidden h-[7px] w-[7px] rounded-full bg-[var(--accent)] lg:block"
                          animate={{ left: ["0%", "100%"] }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <motion.p key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="mt-8 max-w-lg text-sm leading-6 text-[var(--muted)]">
        Currently highlighting <strong className="text-white">{FLAT_STAGES[active].name}</strong> — {FLAT_STAGES[active].detail.toLowerCase()}
      </motion.p>
    </div>
  );
}
