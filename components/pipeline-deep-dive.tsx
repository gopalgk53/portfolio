"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const stages = [
  { name: "Document Intake", detail: "OCR, format validation, metadata normalization and source identity." },
  { name: "Chunking", detail: "Semantic boundaries, overlap strategy and metadata preservation." },
  { name: "Embeddings", detail: "Vector generation, dimensional normalization and batched inference." },
  { name: "Hybrid Retrieval", detail: "Dense + sparse search, metadata filtering and Reciprocal Rank Fusion." },
  { name: "Rerank + Guardrails", detail: "Evidence thresholds, deduplication, refusal rules and context compression." },
  { name: "Grounded Stream", detail: "Source-aware prompt policy, citations, schema validation and streaming." },
];

export function PipelineDeepDive() {
  const [selected, setSelected] = useState(3);
  return (
    <section id="pipeline" className="relative z-10 scroll-mt-20 border-t border-white/[.1] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="eyebrow">Pipeline deep-dive</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-.03em] sm:text-6xl">Inside a production RAG loop.</h2>
          <p className="mt-5 max-w-2xl text-[var(--muted)]">Select a stage to isolate its responsibilities and inspect the architecture.</p>
        </header>
        <div className="grid gap-6 rounded-[var(--radius-md)] border border-white/[.12] bg-white/[.015] p-6 lg:grid-cols-[1.65fr_.85fr] lg:p-8">
          <div className="relative overflow-x-auto rounded-[var(--radius-sm)] border border-white/[.08] bg-[linear-gradient(rgba(99,179,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(99,179,255,.035)_1px,transparent_1px)] bg-[size:32px_32px] p-6">
            <div className="flex min-w-[850px] items-center gap-3">
              {stages.map((stage, i) => (
                <div className="contents" key={stage.name}>
                  <motion.button
                    onClick={() => setSelected(i)}
                    animate={{ opacity: selected === i ? 1 : 0.32, scale: selected === i ? 1.035 : 1 }}
                    className="relative h-28 w-32 shrink-0 rounded-[var(--radius-sm)] border bg-black/60 p-3 text-left"
                    style={{ borderColor: selected === i ? "var(--accent)" : "rgba(255,255,255,.12)" }}
                  >
                    <span className="font-mono text-[8px] text-[var(--faint)]">STAGE_0{i + 1}</span>
                    <b className="mt-3 block text-xs text-white">{stage.name}</b>
                  </motion.button>
                  {i < stages.length - 1 && (
                    <div className="relative h-px w-7 bg-white/[.14]">
                      <motion.i animate={{ x: [0, 28, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-[var(--radius-sm)] border border-white/[.12] bg-black/40 p-6">
            <p className="font-mono text-[9px] text-[var(--muted)]">ACTIVE_COORDINATE / 0{selected + 1}</p>
            <h3 className="mt-5 text-2xl font-semibold text-white">{stages[selected].name}</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{stages[selected].detail}</p>
            <div className="mt-7 space-y-3 font-mono text-[9px] text-[var(--faint)]">
              <p>TOPOLOGY: {selected === 3 ? "HYBRID + RRF" : "CONFIGURABLE"}</p>
              <p>OBSERVABILITY: TRACE ENABLED</p>
              <p>HUMAN REVIEW: REQUIRED</p>
              <p className="text-[var(--faint)]">Example architecture configuration—not a production benchmark.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
