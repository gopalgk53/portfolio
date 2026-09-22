"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  Cloud,
  Crown,
  Database,
  Gauge,
  Layers,
  LineChart,
  Lock,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ConceptNetwork } from "./concept-network-loader";
import { spring } from "../lib/motion";
import { Reveal } from "./reveal";
import { DocLinkRow, FlowColumn, IconBadge, PillTag, StatTile, SurfaceCard } from "./ui-primitives";
import { PaymentRiskStory } from "./payment-risk-story";
import { PaymentRiskBenchmark } from "./payment-risk-benchmark";

const REPO_URL = "https://github.com/gopalgk53/construction-legal-ai-suite/tree/main/payment-delay-predictor";
const DASHBOARD_URL = "https://payment-risk.gopalakrishnagenai.in/";

// Every figure here is either a property of the system (a frozen threshold,
// a count of services) or explicitly labelled as what it is. Nothing is
// presented as a measured production outcome, because the model runs on
// synthetic data.
const STATS: { value: string; label: string }[] = [
  { value: "0.20", label: "Frozen decision threshold" },
  { value: "7", label: "Benchmarked model families" },
  { value: "9", label: "AWS services in the served path" },
  { value: "LR v1", label: "Production champion model" },
  { value: "Synthetic", label: "Data basis — no customer records" },
];

const CAPABILITIES: { icon: typeof Users; title: string; detail: string }[] = [
  { icon: Gauge, title: "Risk prioritisation", detail: "Scores payment-protection workflows so review effort lands where delay is most likely." },
  { icon: ShieldCheck, title: "Human-reviewed by design", detail: "Produces a queue position for a reviewer, never an automated legal decision." },
  { icon: LineChart, title: "Explainable output", detail: "SHAP attributions accompany each score so a reviewer can see what drove it." },
  { icon: Database, title: "Governed data path", detail: "One route from raw storage to served score, with IAM as the boundary around it." },
  { icon: BarChart3, title: "Benchmarked, not assumed", detail: "Seven model families compared before a champion was frozen." },
  { icon: RefreshCw, title: "Monitored in service", detail: "CloudWatch tracks the deployed endpoint rather than assuming stability." },
];

const ARCHITECTURE = [
  {
    icon: Database,
    title: "Data layer (AWS)",
    rows: [
      { icon: Boxes, label: "S3", sublabel: "Raw and curated storage" },
      { icon: RefreshCw, label: "Glue", sublabel: "ETL and cataloguing" },
      { icon: Search, label: "Athena", sublabel: "Query and feature pulls" },
    ],
  },
  {
    icon: Lock,
    title: "Governance",
    rows: [
      { icon: Lock, label: "IAM", sublabel: "Security boundary, not a step" },
      { icon: ShieldCheck, label: "Scoped roles", sublabel: "Per-stage least privilege" },
      { icon: Layers, label: "Auditable path", sublabel: "One governed route to serving" },
    ],
  },
  {
    icon: LineChart,
    title: "Modelling",
    rows: [
      { icon: LineChart, label: "SageMaker", sublabel: "Training and evaluation" },
      { icon: BarChart3, label: "DataRobot AutoML", sublabel: "Benchmark comparison" },
      { icon: Search, label: "SHAP", sublabel: "Directional explanations" },
      { icon: Gauge, label: "Threshold 0.20", sublabel: "Frozen decision point" },
    ],
  },
  {
    icon: Server,
    title: "Serving",
    rows: [
      { icon: Server, label: "ECS", sublabel: "Containerised inference" },
      { icon: Cloud, label: "FastAPI", sublabel: "Scoring interface" },
      { icon: Boxes, label: "Docker", sublabel: "Reproducible runtime" },
    ],
  },
  {
    icon: Gauge,
    title: "Operations",
    rows: [
      { icon: Gauge, label: "CloudWatch", sublabel: "Endpoint and job metrics" },
      { icon: Users, label: "Reviewer queue", sublabel: "Where the score lands" },
      { icon: RefreshCw, label: "Retraining path", sublabel: "Refresh on new data" },
    ],
  },
];

const TECH_STACK = [
  "Python", "FastAPI", "AWS S3", "AWS Glue", "Amazon Athena", "AWS IAM",
  "Amazon SageMaker", "Amazon ECS", "Amazon CloudWatch", "DataRobot AutoML",
  "SHAP", "Docker", "scikit-learn",
];

const DOCS = [
  { icon: Layers, title: "Implementation repository", sublabel: "Source for the payment-delay predictor", href: REPO_URL },
  { icon: Gauge, title: "Live AWS dashboard", sublabel: "The deployed scoring dashboard", href: DASHBOARD_URL },
];

export function PaymentRiskShowcase({
  goal,
  projectIndex,
  totalProjects,
  nextProjectId,
  nextProjectTitle,
}: {
  goal: string;
  projectIndex: number;
  totalProjects: number;
  nextProjectId: string;
  nextProjectTitle: string;
}) {
  return (
    <main id="main-content" tabIndex={-1} className="premium-wash min-h-screen text-[var(--text)]">
      <nav className="case-nav" aria-label="Case study navigation">
        <Link href="/projects">← Architecture archive</Link>
        <span>Case {String(projectIndex + 1).padStart(2, "0")} / {String(totalProjects).padStart(2, "0")}</span>
      </nav>

      <section id="pr-hero" className="band-navy px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--navy-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--navy-text)]">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              Implemented flagship
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Construction Payment <span className="text-[#60a5fa]">Risk</span> Prediction
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--navy-muted)]">{goal}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">
                Inspect repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a href={DASHBOARD_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--outline" style={{ borderColor: "var(--navy-border)", color: "#fff", background: "transparent" }}>
                Open AWS dashboard <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.12 }}
            className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[0_30px_70px_-32px_rgba(0,0,0,.45)]"
          >
            <div className="h-[360px] sm:h-[420px]">
              <ConceptNetwork variant="pipeline" />
            </div>
            <p className="border-t border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--faint)]">
              Served path · S3 → Glue → Athena → SageMaker → ECS → CloudWatch → review
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="grid gap-6 border-b border-[var(--border)] pb-10 sm:grid-cols-3 lg:grid-cols-5">
              {STATS.map((stat) => (
                <StatTile key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              All model development, evaluation, and explanations use synthetic construction payment-protection
              workflow data. The system supports operational prioritisation and human review — it does not provide
              legal advice or make automated legal decisions.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <div className="flex items-center gap-3">
                <IconBadge icon={Layers} />
                <h2 className="text-2xl font-semibold tracking-tight">Project overview</h2>
              </div>
              <p className="mt-5 leading-7 text-[var(--muted)]">
                A production-oriented machine-learning system for construction payment-protection workflows. It scores
                which cases are most likely to run into delay or escalation, so limited review capacity is spent where
                it matters first. The score is a queue position for a human reviewer, not a decision.
              </p>
              <blockquote className="mt-6 border-l-2 border-[var(--accent)] pl-5 text-[15px] italic leading-7 text-[var(--muted)]">
                The hard part was never fitting a model — it was building one governed path from raw data to a served
                score, and being explicit about where the model stops and a person takes over.
              </blockquote>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <div className="flex items-center gap-3">
                <IconBadge icon={Gauge} />
                <h2 className="text-2xl font-semibold tracking-tight">Key capabilities</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {CAPABILITIES.map((cap) => (
                  <SurfaceCard key={cap.title} className="p-4">
                    <IconBadge icon={cap.icon} />
                    <strong className="mt-3 block text-sm font-semibold">{cap.title}</strong>
                    <span className="mt-1 block text-[13px] leading-6 text-[var(--muted)]">{cap.detail}</span>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pr-architecture" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">System architecture</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  One governed path from raw data to a served score.
                </h2>
              </div>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="case-repository">
                View implementation in repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {ARCHITECTURE.map((column, index) => (
              <Reveal key={column.title} delay={Math.min(index, 4) * 0.06}>
                <FlowColumn icon={column.icon} title={column.title} rows={column.rows} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PaymentRiskStory />
      <PaymentRiskBenchmark />

      <section id="pr-stack" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">Technology</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">The execution layer.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {TECH_STACK.map((item) => (
                  <PillTag key={item}>{item}</PillTag>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <p className="eyebrow">Go and look</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Evidence you can open.</h2>
              <div className="mt-5 grid gap-3">
                {DOCS.map((doc) => (
                  <DocLinkRow key={doc.title} icon={doc.icon} title={doc.title} sublabel={doc.sublabel} href={doc.href} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SurfaceCard className="p-6">
              <p className="eyebrow">Assumptions &amp; limitations</p>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
                <li>All development, evaluation, and explanations use synthetic workflow data; no proprietary company or customer data is represented.</li>
                <li>DataRobot used different temporal partitions from the manually engineered Logistic Regression experiment. Its results are a benchmark, not an identical head-to-head comparison.</li>
                <li>The DataRobot feature-effect and SHAP findings are directional only. No unverified magnitude, ranking, or local explanation is claimed.</li>
                <li>Logistic Regression v1 remains the production champion at the frozen 0.20 threshold. The DataRobot benchmark is not deployed.</li>
              </ol>
            </SurfaceCard>
          </Reveal>
        </div>
      </section>

      <footer className="case-next">
        <p>Next system · {String(((projectIndex + 1) % totalProjects) + 1).padStart(2, "0")}</p>
        <Link href={`/projects/${nextProjectId}`}>
          {nextProjectTitle}
          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </main>
  );
}
