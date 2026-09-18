import {
  ArrowUpRight,
  Boxes,
  Brain,
  CheckCircle2,
  Cloud,
  Crown,
  Database,
  FileCode2,
  FileText,
  Layers,
  LayoutGrid,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DocLinkRow, FlowColumn, IconBadge, PillTag, ScenarioCard, StatTile, SurfaceCard } from "./ui-primitives";

const REPO_URL = "https://github.com/gopalgk53/construction-legal-ai-suite";

const STATS: { value: string; label: string }[] = [
  { value: "120", label: "Illustrative work order volume — design target" },
  { value: "24", label: "Scenario families — design target" },
  { value: "~99%", label: "Target evaluation baseline" },
  { value: "75", label: "Automated tests — design target" },
  { value: "Design target", label: "Azure Container Apps deployment" },
];

const CAPABILITIES: { icon: typeof Users; title: string; detail: string }[] = [
  { icon: Users, title: "Multi-agent AI", detail: "Specialist agents for intake, research, evidence, and discrepancy detection." },
  { icon: Database, title: "Evidence provenance", detail: "Separate customer claims from independently researched information." },
  { icon: ShieldCheck, title: "Controlled autonomy", detail: "A deterministic Python control plane holds workflow authority, not the model." },
  { icon: FileCode2, title: "Immutable corrections", detail: "Proposes corrections without modifying original source records." },
  { icon: Users, title: "Human-in-the-loop", detail: "Safe escalation for cases with unresolved material conflicts." },
  { icon: Cloud, title: "Deployment target", detail: "Designed for Azure Container Apps, with CI/CD via GitHub Actions." },
];

const ARCHITECTURE = [
  {
    icon: Database,
    title: "Synthetic data layer (AWS)",
    rows: [
      { icon: Boxes, label: "S3", sublabel: "Document storage" },
      { icon: RefreshCw, label: "Lambda", sublabel: "Data processing" },
      { icon: Lock, label: "API Gateway", sublabel: "Secure access" },
    ],
  },
  {
    icon: Layers,
    title: "MCP integration",
    rows: [
      { icon: Boxes, label: "MCP adapter", sublabel: "Tool integration" },
      { icon: Lock, label: "Secure communication", sublabel: "Authenticated access" },
      { icon: ShieldCheck, label: "Tool governance", sublabel: "Controlled access" },
    ],
  },
  {
    icon: Brain,
    title: "Multi-agent system (Microsoft Foundry)",
    rows: [
      { icon: Users, label: "Intake agent", sublabel: "Understand work-order input" },
      { icon: Users, label: "Research agent", sublabel: "Investigate information" },
      { icon: Users, label: "Evidence agent", sublabel: "Construct evidence view" },
      { icon: Users, label: "Discrepancy agent", sublabel: "Detect matches, conflicts, gaps" },
      { icon: Users, label: "QC agent", sublabel: "Final quality review" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Deterministic control plane (Python/FastAPI)",
    rows: [
      { icon: CheckCircle2, label: "Structured parsing", sublabel: "Validate agent outputs" },
      { icon: Layers, label: "State machine", sublabel: "Control workflow routing" },
      { icon: ShieldCheck, label: "Correction logic", sublabel: "Manage correction limits" },
      { icon: Server, label: "API layer", sublabel: "RESTful asynchronous API" },
    ],
  },
  {
    icon: Server,
    title: "Frontend & deployment",
    rows: [
      { icon: LayoutGrid, label: "Next.js", sublabel: "Operations console" },
      { icon: Boxes, label: "Docker", sublabel: "Containerized deployment" },
      { icon: Cloud, label: "Azure Container Apps", sublabel: "Target hosting" },
      { icon: RefreshCw, label: "GitHub Actions", sublabel: "OIDC-based CI/CD" },
    ],
  },
];

const SCENARIOS: { index: number; title: string; id: string; steps: string[]; humanReview: boolean; corrections: number }[] = [
  { index: 1, title: "Straight-through autonomy", id: "SYN-WO-000001", steps: ["Intake", "Research", "Evidence", "Discrepancy", "QC", "Complete"], humanReview: false, corrections: 0 },
  { index: 2, title: "Controlled autonomous correction", id: "SYN-WO-000116", steps: ["Intake", "Research", "Evidence", "Discrepancy", "Correction", "Research", "QC", "Complete"], humanReview: false, corrections: 1 },
  { index: 3, title: "Safety escalation", id: "SYN-WO-000111", steps: ["Intake", "Research", "Evidence", "Discrepancy", "QC", "Human review"], humanReview: true, corrections: 0 },
];

const PERFORMANCE: { value: string; label: string }[] = [
  { value: "154/156 (~99%)", label: "Correct evaluations — target" },
  { value: "100%", label: "Tool selection accuracy — target" },
  { value: "15.1s", label: "P50 latency — target" },
  { value: "18.8s", label: "P95 latency — target" },
  { value: "83%", label: "Tool output utilization — target" },
  { value: "120 / 24", label: "Work orders / scenario families" },
];

const TECH_STACK = [
  "Python", "FastAPI", "Microsoft Foundry", "GPT-5-mini", "MCP", "AWS S3", "AWS Lambda",
  "API Gateway", "Next.js", "React", "TypeScript", "Tailwind CSS", "Docker",
  "Azure Container Apps", "GitHub Actions", "OIDC", "pytest",
];

const DOCS = [
  { icon: FileText, title: "Architecture documentation", sublabel: "System design and technical details", href: "#ma-architecture" },
  { icon: CheckCircle2, title: "Production acceptance", sublabel: "Validation results and evidence", href: "#ma-performance" },
  { icon: Terminal, title: "Operations runbook", sublabel: "Deployment and troubleshooting", href: REPO_URL },
  { icon: Layers, title: "Portfolio case study", sublabel: "Complete project narrative", href: "#ma-hero" },
];

export function MultiAgentShowcase({
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
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Case study navigation">
        <Link href="/projects">← Architecture archive</Link>
        <span>
          Case {String(projectIndex + 1).padStart(2, "0")} / {String(totalProjects).padStart(2, "0")}
        </span>
      </nav>

      <section id="ma-hero" className="band-navy relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--navy-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[.1em] text-[var(--navy-text)]">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              Flagship blueprint
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Autonomous Work Order <span className="text-[#60a5fa]">Intelligence</span> &amp; Operations Platform
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--navy-muted)]">{goal}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">
                Inspect repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a href="#ma-architecture" className="btn-pill btn-pill--outline" style={{ borderColor: "var(--navy-border)", color: "#fff", background: "transparent" }}>
                View architecture
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-[var(--text)] shadow-[0_30px_70px_-32px_rgba(0,0,0,.45)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[#f1f5f9] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </div>
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 text-xs text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--faint)]" />
              Concept preview — not a live application
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-[var(--text)]">Work Order Intelligence</p>
              <p className="mt-1 text-xs text-[var(--faint)]">Multi-agent AI for construction payment-protection operations</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Explore scenarios", "Run work order", "View results"].map((label) => (
                  <span key={label} className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-2 text-center text-[10px] font-medium text-[var(--muted)]">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { id: "SYN-WO-000001", tag: "Straight-through" },
                  { id: "SYN-WO-000116", tag: "Correction" },
                ].map((row) => (
                  <div key={row.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-xs">
                    <span className="font-mono text-[var(--faint)]">{row.id}</span>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">{row.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-xs leading-5 text-[var(--faint)]">
          These figures describe design targets for this architecture and its evaluation harness. They are not measured results from a deployed system.
        </p>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <IconBadge icon={FileText} />
              <h2 className="text-2xl font-semibold tracking-tight">Project overview</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              A production-oriented, evidence-aware multi-agent architecture for construction payment-protection
              workflows. The system is designed to process work orders through specialist AI agents for intake,
              research, evidence analysis, discrepancy detection, and quality control, with controlled correction
              and human-in-the-loop escalation for complex cases.
            </p>
            <div className="quote-panel mt-6 text-sm italic leading-6 text-[var(--muted)]">
              The key architectural question isn&apos;t connecting multiple agents — it&apos;s deciding where AI
              autonomy should stop, and where deterministic software should take control.
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <IconBadge icon={LayoutGrid} />
              <h2 className="text-2xl font-semibold tracking-tight">Key capabilities</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.map((cap) => (
                <SurfaceCard key={cap.title} className="p-4">
                  <IconBadge icon={cap.icon} />
                  <p className="mt-3 text-sm font-semibold text-[var(--text)]">{cap.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--faint)]">{cap.detail}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </div>

        <section id="ma-architecture" className="mt-24 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">System architecture</p>
              <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Cross-cloud architecture, from work order to operational recommendation.
              </h2>
            </div>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--outline">
              View architecture in repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-10 flow-diagram">
            {ARCHITECTURE.map((column, index) => (
              <div key={column.title} className="contents lg:flex lg:items-start" style={{ display: "contents" }}>
                <FlowColumn icon={column.icon} title={column.title} rows={column.rows} />
                {index < ARCHITECTURE.length - 1 && (
                  <div className="flow-arrow" aria-hidden="true">
                    <ArrowUpRight className="h-4 w-4 rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Golden path scenarios</p>
              <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Three illustrative scenarios demonstrate the system&apos;s intended safety boundaries.
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-[var(--faint)]">
            Illustrative synthetic scenarios — for demonstration only, not measured results from a deployed system.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.id} {...scenario} />
            ))}
          </div>
        </section>

        <section id="ma-performance" className="mt-24 scroll-mt-24 grid gap-10 lg:grid-cols-3">
          <div>
            <p className="eyebrow">Performance &amp; evaluation</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Illustrative evaluation targets</h3>
            <div className="mt-5 grid grid-cols-2 gap-5">
              {PERFORMANCE.map((row) => (
                <StatTile key={row.label} value={row.value} label={row.label} />
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-[var(--faint)]">
              These figures describe design targets for this architecture&apos;s evaluation harness. They are not
              measured results from a deployed system.
            </p>
          </div>
          <div>
            <p className="eyebrow">Tech stack</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Built with</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span key={tech} className="pill-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Project documentation</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Read more</h3>
            <div className="mt-3">
              {DOCS.map((doc) => (
                <DocLinkRow key={doc.title} icon={doc.icon} title={doc.title} sublabel={doc.sublabel} href={doc.href} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-[var(--border)] pt-10">
          <p className="eyebrow">Assumptions &amp; limitations</p>
          <ol className="mt-4 grid gap-4 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
            <li>This is an architecture blueprint and its intended design, not a monitored, running production deployment with live metrics.</li>
            <li>Every number on this page is a design target for the evaluation harness this architecture is designed to reach, not a measured result from real usage.</li>
            <li>No live application or dedicated public repository exists for this project yet — the repository link above is the same shared repository used across this portfolio&apos;s case studies.</li>
            <li>Implementation-level specifics not published here — exact agent prompts, evaluation datasets, latency under real load — are the next evidence to publish as this moves from blueprint to implementation.</li>
          </ol>
        </section>
      </div>

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
