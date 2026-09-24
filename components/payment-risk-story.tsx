"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Boxes,
  Brain,
  Database,
  GitBranch,
  History,
  LayoutDashboard,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { spring } from "../lib/motion";

type ChapterId = 0 | 1 | 2 | 3 | 4;
type ChapterVisualProps = { isActive: boolean; paused: boolean; reducedMotion: boolean };

const CHAPTERS: { id: ChapterId; eyebrow: string; title: string; summary: string }[] = [
  {
    id: 0,
    eyebrow: "Chapter 1 / The problem",
    title: "Payment risk can drift quietly, until something is watching the queue.",
    summary:
      "Construction payment-protection milestones can slide from on-track toward escalation-worthy without anyone noticing in time. This system watches the queue so a human can review the ones that need it — it does not decide anything on its own.",
  },
  {
    id: 1,
    eyebrow: "Chapter 2 / The pipeline",
    title: "One governed path from raw data to a served score.",
    summary:
      "Every score reaching the dashboard passes through the same AWS pipeline. IAM is drawn here as a security boundary around that pipeline, not as a step in it — it governs who and what can reach each stage.",
  },
  {
    id: 2,
    eyebrow: "Chapter 3 / The decision",
    title: "A frozen threshold routes attention — it does not rule on anything.",
    summary:
      "Scores at or above 0.20 route to human review; the rest are monitored. This is an operational review priority, not a legal decision, and it never makes one automatically.",
  },
  {
    id: 3,
    eyebrow: "Chapter 4 / The benchmark",
    title: "Seven approaches were benchmarked. The simpler model still runs in production.",
    summary:
      "DataRobot AutoML ranked seven models on holdout data. Logistic Regression v1 remains the deployed, governed champion — the benchmark is evidence, not a replacement.",
  },
  {
    id: 4,
    eyebrow: "Chapter 5 / The explanation",
    title: "Four factors move the score — direction only, nothing invented.",
    summary:
      "Feature effects show which direction each factor pushes the modeled risk. No unverified magnitude or ranking is claimed, and none of this is a causal or legal conclusion.",
  },
];

const QUEUE_SCENARIOS: { label: string; fill: number }[][] = [
  [
    { label: "Milestone A", fill: 0.28 },
    { label: "Milestone B", fill: 0.55 },
    { label: "Milestone C", fill: 0.86 },
  ],
  [
    { label: "Milestone A", fill: 0.64 },
    { label: "Milestone B", fill: 0.93 },
    { label: "Milestone C", fill: 0.36 },
  ],
  [
    { label: "Milestone A", fill: 0.95 },
    { label: "Milestone B", fill: 0.24 },
    { label: "Milestone C", fill: 0.7 },
  ],
];

function queueStatus(fill: number) {
  if (fill >= 0.75) return { label: "Operational review priority", color: "var(--accent-2)" };
  if (fill >= 0.4) return { label: "Approaching deadline", color: "var(--accent-gold)" };
  return { label: "On track", color: "var(--accent)" };
}

function RiskQueueVisual({ isActive, paused, reducedMotion }: ChapterVisualProps) {
  const [scenario, setScenario] = useState(0);

  useEffect(() => {
    if (!isActive || paused || reducedMotion) return;
    const timer = setInterval(() => setScenario((v) => (v + 1) % QUEUE_SCENARIOS.length), 3600);
    return () => clearInterval(timer);
  }, [isActive, paused, reducedMotion]);

  const items = QUEUE_SCENARIOS[reducedMotion ? 0 : scenario];

  return (
    <div className="glass-panel p-6 sm:p-8">
      <p className="text-[11px] font-semibold text-[var(--faint)]">
        Illustrative synthetic scenario — for demonstration only, not real project data
      </p>
      <div className="mt-6 flex flex-col gap-5">
        {items.map((item) => {
          const status = queueStatus(item.fill);
          return (
            <div key={item.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] font-semibold text-[var(--muted)]">{item.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: status.color }}>
                  {status.label}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: status.color, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: item.fill }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 1.1, ease: "easeInOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 max-w-md text-xs leading-5 text-[var(--faint)]">
        Once a milestone crosses the threshold, it is flagged for operational review priority — a queue position, not a legal outcome.
      </p>
    </div>
  );
}

// The request-path stages only — solid-arrow runtime flow in the
// architecture diagram. Glue, Athena, CloudWatch, model governance, CI/CD,
// and testing are real parts of the system, but the diagram's own legend
// draws them as dashed arrows: monitoring/governance/control flow that
// wraps around this path rather than sitting inline in it. They're the
// CONTROL_PLANE strip below, not stages here — putting them in this list
// would misrepresent a request's actual path, which is what this animation
// is for.
const PIPELINE_STAGES = [
  { name: "S3", Icon: Database, detail: "Synthetic work order and payment records land here first." },
  { name: "Feature engineering", Icon: Workflow, detail: "Validates, cleans, and engineers features from the raw records." },
  { name: "SageMaker", Icon: Brain, detail: "Trains, evaluates, and versions the candidate models; the champion is selected here." },
  { name: "SHAP", Icon: Lightbulb, detail: "Explains the served score — which features pushed it, and in which direction." },
  { name: "FastAPI", Icon: Boxes, detail: "Serves the score and its explanation behind a typed, validated API contract." },
  { name: "ECS / Fargate", Icon: Server, detail: "Runs the containerized API behind the load balancer." },
  { name: "Dashboard", Icon: LayoutDashboard, detail: "Renders the risk score and its explanation for a human reviewer." },
];

// The dashed-arrow half of the diagram: real systems, but wrapped around
// the request path rather than sitting inside it.
const CONTROL_PLANE = [
  { name: "CloudWatch", Icon: Activity, detail: "Logs, metrics, alarms, and feature-drift detection watch every stage continuously." },
  { name: "Glue + Athena", Icon: Search, detail: "A separate analytics path catalogs and queries the same data for operational reporting." },
  { name: "Model governance", Icon: History, detail: "Every prediction is stamped with model version, dataset version, and a trace ID for audit." },
  { name: "CI/CD + pytest", Icon: GitBranch, detail: "Unit, integration, API, and model tests gate every build before GitHub Actions deploys it." },
];

function PipelineVisual({ isActive, paused, reducedMotion }: ChapterVisualProps) {
  const [active, setActive] = useState(0);
  const [localPaused, setLocalPaused] = useState(false);

  useEffect(() => {
    if (!isActive || paused || localPaused || reducedMotion) return;
    const timer = setInterval(() => setActive((v) => (v + 1) % PIPELINE_STAGES.length), 1900);
    return () => clearInterval(timer);
  }, [isActive, paused, localPaused, reducedMotion]);

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-4 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-[var(--faint)]">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          IAM + Secrets Manager — security boundary, least-privilege access, encrypted at rest and in transit
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
          {PIPELINE_STAGES.map((stage, index) => {
            const isStageActive = active === index;
            return (
              <div key={stage.name} className="contents lg:flex lg:items-stretch">
                <button
                  type="button"
                  onClick={() => {
                    setActive(index);
                    setLocalPaused(true);
                  }}
                  className="group flex-1 rounded-[var(--radius-sm)] border p-3 text-left transition-colors"
                  style={{ borderColor: isStageActive ? "var(--accent)" : "var(--border)" }}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border"
                    style={{
                      borderColor: isStageActive ? "var(--accent)" : "var(--border-strong)",
                      color: isStageActive ? "var(--accent)" : "var(--faint)",
                    }}
                  >
                    <stage.Icon className="h-4 w-4" />
                  </span>
                  <span className={`mt-2 block text-[11px] font-semibold ${isStageActive ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                    {stage.name}
                  </span>
                </button>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="my-1 flex items-center justify-center lg:my-0 lg:w-6 lg:shrink-0" aria-hidden="true">
                    <span className="h-4 w-px bg-[var(--border-strong)] lg:h-px lg:w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted)]">
        Currently highlighting <strong className="text-[var(--text)]">{PIPELINE_STAGES[active].name}</strong> — {PIPELINE_STAGES[active].detail.toLowerCase()}
      </p>
      {/* Dashed border, distinct from the solid-bordered stages above — the
          same solid/dashed distinction the source architecture diagram
          uses for runtime flow vs monitoring/governance/control flow. */}
      <div className="mt-5 grid gap-3 border-t border-dashed border-[var(--border-strong)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {CONTROL_PLANE.map((item) => (
          <div key={item.name} className="rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[var(--faint)]">
                <item.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-semibold text-[var(--muted)]">{item.name}</span>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-[var(--faint)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const DECISION_SCENARIOS = [0.09, 0.34, 0.18, 0.55];
const DECISION_THRESHOLD = 0.2;

function decisionStatus(score: number) {
  return score >= DECISION_THRESHOLD
    ? { label: "Human review recommended", color: "var(--accent-2)" }
    : { label: "Monitor", color: "var(--accent)" };
}

const DECISION_REASONS = [
  "Integrated with the governed AWS feature, serving, and monitoring contracts.",
  "Directly interpretable for a human-reviewed payment-protection workflow.",
  "No partition-aligned evidence yet demonstrates a material replacement benefit.",
  "DataRobot remains a benchmark; none of its models is deployed.",
];

function DecisionGateVisual({ isActive, paused, reducedMotion }: ChapterVisualProps) {
  const [scenario, setScenario] = useState(0);

  useEffect(() => {
    if (!isActive || paused || reducedMotion) return;
    const timer = setInterval(() => setScenario((v) => (v + 1) % DECISION_SCENARIOS.length), 3200);
    return () => clearInterval(timer);
  }, [isActive, paused, reducedMotion]);

  const score = DECISION_SCENARIOS[reducedMotion ? 0 : scenario];
  const status = decisionStatus(score);

  return (
    <div className="glass-panel p-6 sm:p-8">
      <p className="text-[11px] font-semibold text-[var(--faint)]">
        Illustrative synthetic scenario — for demonstration only, not real project data
      </p>
      <div className="relative mt-10 h-16">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border-strong)]" />
        <div className="absolute top-0 h-full w-px" style={{ left: `${DECISION_THRESHOLD * 100}%`, background: "var(--accent-gold)" }} />
        <span
          className="absolute top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold"
          style={{ left: `${DECISION_THRESHOLD * 100}%`, color: "var(--accent-gold)" }}
        >
          0.20 threshold
        </span>
        <motion.div
          className="absolute top-1/2"
          initial={false}
          animate={{ left: `${Math.min(score, 1) * 100}%` }}
          transition={reducedMotion ? { duration: 0 } : spring}
        >
          <span className="absolute -left-1.5 -top-1.5 block h-3 w-3 rounded-full" style={{ background: status.color }} />
          <span
            className="absolute -top-8 left-0 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold"
            style={{ color: status.color }}
          >
            {score.toFixed(2)} · {status.label}
          </span>
        </motion.div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-[minmax(10rem,.7fr)_minmax(14rem,1.3fr)]">
        <div>
          <p className="text-[11px] font-semibold text-[var(--faint)]">Production champion</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text)]">Logistic Regression v1</p>
          <p className="mt-1 text-[11px] font-semibold text-[var(--faint)]">0.20 frozen operational threshold</p>
        </div>
        <ul className="m-0 list-none border-t border-[var(--border)] p-0">
          {DECISION_REASONS.map((reason, index) => (
            <li key={reason} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[var(--border)] py-3 text-xs leading-5 text-[var(--muted)]">
              <span className="font-mono text-[10px] text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const BENCHMARK_MODELS = [
  { name: "Elastic-Net α=0.5", auc: 0.684 },
  { name: "LightGBM", auc: 0.6806 },
  { name: "XGBoost", auc: 0.6765 },
  { name: "GAM", auc: 0.6748 },
  { name: "Random Forest", auc: 0.6714 },
  { name: "Elastic-Net L2", auc: 0.6702 },
  { name: "RuleFit", auc: 0.6625 },
] as const;

const VALIDATION_SCORES = [
  { label: "Backtest ROC-AUC", value: "0.6733", accent: false },
  { label: "Holdout ROC-AUC", value: "0.6840", accent: true },
  { label: "Holdout PR-AUC", value: "0.4136", accent: false },
  { label: "Holdout LogLoss", value: "0.5274", accent: false },
];

function BenchmarkVisual({ isActive, reducedMotion }: ChapterVisualProps) {
  return (
    <div className="glass-panel p-6 sm:p-8">
      <p className="text-[11px] font-semibold text-[var(--faint)]">
        DataRobot holdout ROC-AUC · higher is better · scale begins at 0.65
      </p>
      <ol className="m-0 mt-6 list-none p-0">
        {BENCHMARK_MODELS.map((model, index) => (
          <li key={model.name} className="grid grid-cols-[2rem_minmax(9rem,12rem)_1fr_4rem] items-center gap-3 border-t border-[var(--border)] py-3">
            <span className="font-mono text-[10px] text-[var(--faint)]">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm text-[var(--muted)]">{model.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-[var(--border)]" aria-hidden="true">
              <motion.span
                className="block h-full rounded-full"
                style={{ background: index === 0 ? "var(--gradient-accent)" : "var(--accent)", transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={isActive ? { scaleX: (model.auc - 0.65) / 0.04 } : { scaleX: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.9, delay: index * 0.06, ease: "easeOut" }}
              />
            </span>
            <strong className="text-right font-mono text-xs text-[var(--text)]">{model.auc.toFixed(4)}</strong>
          </li>
        ))}
      </ol>
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] sm:grid-cols-4">
        {VALIDATION_SCORES.map((score) => (
          <div
            key={score.label}
            className="flex flex-col p-4"
            style={score.accent ? { background: "var(--gradient-accent)", color: "var(--bg)" } : { background: "var(--bg)" }}
          >
            <span className="text-[11px] font-semibold">{score.label}</span>
            <strong className="mt-3 text-2xl font-semibold">{score.value}</strong>
            <small className={score.accent ? "text-[rgba(5,5,5,.65)]" : "text-[var(--faint)]"}>Elastic-Net α=0.5</small>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--faint)]">
        These DataRobot partitions differ from the manually engineered AWS experiment, so the figures are not placed on a shared production leaderboard.
      </p>
    </div>
  );
}

const EXPLAINABILITY_FACTORS = [
  { label: "Prior escalation rate", direction: "increase" as const },
  { label: "Critical missing fields", direction: "increase" as const },
  { label: "Conflicting project information", direction: "increase" as const },
  { label: "Payment-chain completeness", direction: "decrease" as const },
];

function ExplainabilityVisual({ isActive, paused, reducedMotion }: ChapterVisualProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!isActive || paused || reducedMotion) return;
    const timer = setInterval(() => setActive((v) => (v + 1) % EXPLAINABILITY_FACTORS.length), 2400);
    return () => clearInterval(timer);
  }, [isActive, paused, reducedMotion]);

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {(["increase", "decrease"] as const).map((direction) => (
          <div key={direction}>
            <p
              className="flex items-center gap-2 text-[11px] font-semibold"
              style={{ color: direction === "increase" ? "var(--accent-gold)" : "var(--accent)" }}
            >
              {direction === "increase" ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
              Risk {direction === "increase" ? "increases" : "decreases"}
            </p>
            <ul className="m-0 mt-4 flex flex-col gap-2 p-0">
              {EXPLAINABILITY_FACTORS.filter((factor) => factor.direction === direction).map((factor) => {
                const index = EXPLAINABILITY_FACTORS.indexOf(factor);
                const isHighlighted = reducedMotion ? true : active === index;
                return (
                  <li
                    key={factor.label}
                    className="rounded-[var(--radius-sm)] border px-3 py-2 text-sm transition-colors"
                    style={{
                      borderColor: isHighlighted ? (direction === "increase" ? "var(--accent-gold)" : "var(--accent)") : "var(--border)",
                      color: isHighlighted ? "var(--text)" : "var(--muted)",
                      background: isHighlighted ? (direction === "increase" ? "var(--accent-gold-soft)" : "var(--accent-soft)") : "transparent",
                    }}
                  >
                    {factor.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-[var(--faint)]">
        Direction only — no unverified SHAP magnitude or feature rank is presented. Statistical associations, not causal or legal conclusions.
      </p>
    </div>
  );
}

function ChapterVisual({ id, ...rest }: { id: ChapterId } & ChapterVisualProps) {
  if (id === 0) return <RiskQueueVisual {...rest} />;
  if (id === 1) return <PipelineVisual {...rest} />;
  if (id === 2) return <DecisionGateVisual {...rest} />;
  if (id === 3) return <BenchmarkVisual {...rest} />;
  return <ExplainabilityVisual {...rest} />;
}

export function PaymentRiskStory() {
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = !!reducedMotionValue;
  const [active, setActive] = useState<ChapterId>(0);
  const [paused, setPaused] = useState(false);
  const [replayTick, setReplayTick] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const navButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const observers = CHAPTERS.map((chapter) => {
      const el = sectionRefs.current[chapter.id];
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(chapter.id);
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  function goTo(id: ChapterId) {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    navButtonRefs.current[id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      goTo(Math.min(active + 1, CHAPTERS.length - 1) as ChapterId);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(Math.max(active - 1, 0) as ChapterId);
    }
  }

  return (
    <section aria-label="Interactive project walkthrough" className="border-t border-[var(--border)] bg-[var(--surface)] py-20 sm:py-28" onKeyDown={handleKeyDown}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Project walkthrough</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">Five chapters, one governed pipeline.</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
          Scroll through, jump to a chapter directly, or step through with the arrow keys. Every number here is a verified result — nothing in this section is a legal decision.
        </p>

        <nav aria-label="Chapters" className="sticky top-0 z-10 mt-10 flex flex-wrap items-center gap-4 border-y border-[var(--border)] bg-[var(--surface)]/95 px-1 py-2.5 backdrop-blur">
          <div className="flex items-center gap-1.5">
            {CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                ref={(el) => {
                  navButtonRefs.current[chapter.id] = el;
                }}
                type="button"
                title={chapter.eyebrow}
                aria-current={active === chapter.id ? "true" : undefined}
                onClick={() => goTo(chapter.id)}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border font-mono text-[11px] transition-colors ${
                  active === chapter.id ? "border-transparent text-[var(--bg)]" : "border-[var(--border-strong)] text-[var(--faint)] hover:text-[var(--muted)]"
                }`}
                style={active === chapter.id ? { background: "var(--gradient-accent)" } : undefined}
              >
                {String(chapter.id + 1).padStart(2, "0")}
                <span className="sr-only">{chapter.eyebrow}</span>
              </button>
            ))}
          </div>
          <p
            className="hidden min-w-0 flex-1 text-[11px] font-semibold text-[var(--muted)] sm:block"
            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {CHAPTERS[active].eyebrow}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[var(--faint)] transition-colors hover:text-[var(--muted)]"
            >
              {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
              <span className="sr-only">{paused ? "Resume chapter animation" : "Pause chapter animation"}</span>
            </button>
            <button
              type="button"
              onClick={() => setReplayTick((v) => v + 1)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[var(--faint)] transition-colors hover:text-[var(--muted)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Replay this chapter's animation</span>
            </button>
          </div>
        </nav>

        <div className="mt-4 flex flex-col gap-20 sm:gap-28">
          {CHAPTERS.map((chapter) => (
            <article
              id={`risk-chapter-${chapter.id}`}
              aria-labelledby={`risk-chapter-${chapter.id}-heading`}
              ref={(el) => {
                sectionRefs.current[chapter.id] = el;
              }}
              className="scroll-mt-28"
            >
              <p className="eyebrow">{chapter.eyebrow}</p>
              <h3 id={`risk-chapter-${chapter.id}-heading`} className="mt-3 max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {chapter.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{chapter.summary}</p>
              <div className="mt-8">
                <ChapterVisual key={replayTick} id={chapter.id} isActive={active === chapter.id} paused={paused} reducedMotion={reducedMotion} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
