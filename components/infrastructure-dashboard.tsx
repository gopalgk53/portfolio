"use client";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { spring } from "../lib/motion";

const models = ["Llama-3-70B", "Mistral-Large", "Custom-RAG-Pipeline"];
const panel = "rounded-[var(--radius-md)] border border-white/[.12] bg-white/[.015] p-6";

export function InfrastructureDashboard() {
  const [model, setModel] = useState(models[2]);
  const [tick, setTick] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [active, setActive] = useState(true);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "150px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active || reduced) return;
    const timer = setInterval(() => setTick((v) => v + 1), 1500);
    return () => clearInterval(timer);
  }, [active, reduced]);

  const data = useMemo(() => Array.from({ length: 22 }, (_, i) => 42 + Math.sin((i + tick) * 0.75) * 9 + Math.cos((i + tick) * 0.31) * 5), [tick]);
  const points = data.map((value, i) => `${(i / 21) * 100},${54 - (value - 28) * 1.35}`).join(" ");
  const flush = () => {
    setResetting(true);
    setTimeout(() => {
      setTick(0);
      setResetting(false);
    }, 650);
  };
  const logs = ["Embedding node loaded", "Vector space synchronized", "Reranker health check passed", "KV cache allocation stable"];

  return (
    <section ref={root} id="infrastructure" className="relative z-10 scroll-mt-20 border-t border-white/[.1] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="eyebrow">Infrastructure observability</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-.03em] sm:text-6xl">Model execution, made observable.</h2>
          <p className="mt-5 max-w-2xl text-[var(--muted)]">Browser-generated observability data demonstrating inference monitoring interface design.</p>
          <span className="mt-4 inline-block rounded-full border border-white/[.14] px-3 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-[var(--muted)]">Simulated runtime telemetry</span>
        </header>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className={`${panel} min-h-[350px]`}>
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-[var(--muted)]">NODE_01 / RUNTIME</span>
              <span className="text-[#8fae90]">● ACTIVE</span>
            </div>
            <div className="mt-6 rounded-[var(--radius-sm)] border border-white/[.08] bg-black/40 p-4 font-mono text-[10px] leading-7">
              {logs.map((x, i) => (
                <motion.p key={x} animate={{ opacity: resetting ? 0 : 0.35 + i * 0.18, x: resetting ? -8 : 0 }} transition={spring} className="text-[var(--muted)]">
                  [{String(tick + i).padStart(4, "0")}] {x}...
                </motion.p>
              ))}
            </div>
            <div className="mt-6 flex gap-2 overflow-x-auto">
              {models.map((x) => (
                <button key={x} onClick={() => setModel(x)} className={`whitespace-nowrap rounded-full border px-3 py-2 font-mono text-[9px] transition-colors ${model === x ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white" : "border-white/[.1] text-[var(--faint)]"}`}>
                  {x}
                </button>
              ))}
            </div>
          </article>
          <article className={`${panel} min-h-[350px]`}>
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-[var(--muted)]">NODE_02 / TOKEN_THROUGHPUT</span>
              <b className="text-white">{resetting ? 0 : Math.round(data.at(-1) || 0)} TPS</b>
            </div>
            <svg viewBox="0 0 100 60" className="mt-8 h-56 w-full" role="img" aria-label="Simulated tokens per second sparkline">
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
                  <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[15, 30, 45].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.08)" strokeWidth=".25" />
              ))}
              <polygon points={`0,60 ${resetting ? "0,54 100,54" : points} 100,60`} fill="url(#spark)" />
              <polyline points={resetting ? "0,54 100,54" : points} fill="none" stroke="var(--accent)" strokeWidth=".65" vectorEffect="non-scaling-stroke" />
            </svg>
            <p className="font-mono text-[9px] text-[var(--faint)]">MODEL: {model} · POLL: 1.5s</p>
          </article>
          <article className={`${panel} min-h-[330px]`}>
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-[var(--muted)]">NODE_03 / LATENCY</span>
              <span className="text-[var(--faint)]">SIMULATED</span>
            </div>
            <div className="mt-8 space-y-7">
              {[
                ["Prompt Guardrails", 42, 18],
                ["Vector Embedding Match", 118, 43],
                ["LLM Completion Stream", 280, 82],
              ].map(([label, ms, width]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between font-mono text-[10px]">
                    <span className="text-[var(--muted)]">{label}</span>
                    <span className="text-white">{resetting ? 0 : ms}ms</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-white/[.1] bg-black/40">
                    <motion.div animate={{ width: resetting ? 0 : `${width}%` }} transition={spring} className="h-full bg-[var(--accent)] opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className={`${panel} min-h-[330px]`}>
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-[var(--muted)]">NODE_04 / SUMMARY</span>
              <span className="text-[var(--faint)]">DEMO DATA</span>
            </div>
            <div className="mt-7 grid gap-5">
              {[
                ["TOTAL_REQUESTS_MANAGED", "142,830"],
                ["CONTEXT_PRECISION_RATIO", "99.4%"],
                ["COMPUTE_EFFICIENCY_INDEX", "87.2"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[9px] text-[var(--faint)]">{label}</p>
                  <motion.b animate={{ opacity: resetting ? 0.2 : 1 }} className="mt-1 block text-3xl tabular-nums text-white">
                    {resetting ? "0" : value}
                  </motion.b>
                </div>
              ))}
            </div>
            <button onClick={flush} disabled={resetting} className="btn-pill btn-pill--outline mt-7">
              <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
              FLUSH PIPELINE
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
