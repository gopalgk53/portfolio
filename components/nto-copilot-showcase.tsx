"use client";

import { MotionConfig, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Database,
  FileSearch,
  FileText,
  GitCompareArrows,
  GraduationCap,
  Landmark,
  Layers,
  ListChecks,
  MessageCircleQuestion,
  Search,
  Server,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { spring } from "../lib/motion";
import { Reveal } from "./reveal";
import { DocLinkRow, FlowColumn, IconBadge, PillTag, StatTile, SurfaceCard } from "./ui-primitives";

const REPO_URL = "https://github.com/gopalgk53/construction-legal-ai-suite/tree/feat/nto-operations-copilot/nto-operations-copilot";
const LIVE_APP_URL = "https://nto-copilot-web-gopalg53.azurewebsites.net";
// Individual documents live under blob/, not tree/ — linking the file view
// directly avoids a GitHub redirect and keeps the reader on the document.
const DOC_BASE = "https://github.com/gopalgk53/construction-legal-ai-suite/blob/feat/nto-operations-copilot/nto-operations-copilot/docs";

const STATS: { value: string; label: string }[] = [
  { value: "220", label: "Synthetic work orders" },
  { value: "100", label: "New research-queue WOs" },
  { value: "20 × 5", label: "Intake scenario families × variants" },
  { value: "4", label: "Project / notice classes" },
  { value: "6", label: "Guided research stages" },
];

const CAPABILITIES: { icon: typeof GraduationCap; title: string; detail: string }[] = [
  { icon: GraduationCap, title: "Process coaching", detail: "Explains the current research stage and the reason behind the next approved action." },
  { icon: Database, title: "Work-order grounding", detail: "Retrieves synthetic intake evidence through one allowlisted, read-only MCP tool." },
  { icon: GitCompareArrows, title: "Conflict preservation", detail: "Keeps customer claims separate from recorded evidence instead of silently choosing a winner." },
  { icon: FileSearch, title: "Notice selection", detail: "References a state and project-class notice resource while requiring the underlying WO facts to be verified." },
  { icon: UserRoundCheck, title: "Human control", detail: "Stops on missing or conflicting evidence; the researcher stays responsible for verification and escalation." },
  { icon: MessageCircleQuestion, title: "Query-specific answers", detail: "Returns concise Answer, Why, and Next step guidance instead of repeating the full record." },
];

const ARCHITECTURE = [
  {
    icon: Database,
    title: "Synthetic WO data (AWS)",
    rows: [
      { icon: Database, label: "AWS S3", sublabel: "220-record synthetic dataset" },
      { icon: Cloud, label: "AWS Lambda", sublabel: "Read-only retrieval" },
      { icon: ShieldCheck, label: "Separate ground truth", sublabel: "Evaluator-only data stays hidden" },
    ],
  },
  {
    icon: Layers,
    title: "Agent & tool boundary",
    rows: [
      { icon: Search, label: "Microsoft Foundry", sublabel: "WO intake agent" },
      { icon: GitCompareArrows, label: "MCP", sublabel: "Read-only get_work_order" },
      { icon: ShieldCheck, label: "Tool allowlist", sublabel: "Unexpected tools fail closed" },
    ],
  },
  {
    icon: Server,
    title: "Policy & API boundary",
    rows: [
      { icon: CheckCircle2, label: "FastAPI", sublabel: "Validation and policy boundary" },
      { icon: FileText, label: "Knowledge resources", sublabel: "SOP, escalation, QC, notice selection" },
      { icon: MessageCircleQuestion, label: "Response contract", sublabel: "Answer · Why · Next step" },
    ],
  },
  {
    icon: Cloud,
    title: "Research workspace (Azure)",
    rows: [
      { icon: Layers, label: "Next.js + TypeScript", sublabel: "Guided research interface" },
      { icon: ListChecks, label: "Request queue", sublabel: "20 scenarios × 5 variants" },
      { icon: Cloud, label: "Azure App Service", sublabel: "Frontend and API hosting" },
    ],
  },
];

const CONFLICT_PATH: { title: string; detail: string }[] = [
  { title: "Preserve conflict", detail: "Record both names and their sources. Neither value overwrites the other." },
  { title: "Contact CC first", detail: "Follow the approved CC-first confirmation path." },
  { title: "Three calls, three emails", detail: "Document each attempt when the procedure requires it." },
  { title: "Return to customer", detail: "Send the issue back if the conflict remains unresolved." },
  { title: "Escalate when applicable", detail: "Route to human review when the operating procedure requires it." },
];

const NOTICE_CLASSES = ["Private residential", "Private commercial", "State / county", "Federal"];

const TECH_STACK = [
  "Microsoft Foundry", "MCP", "Python", "FastAPI", "Pydantic", "Next.js", "React", "TypeScript",
  "Tailwind CSS", "Framer Motion", "AWS S3", "AWS Lambda", "Azure App Service", "Managed identity",
];

const DOCS = [
  { icon: FileText, title: "Architecture", sublabel: "Trust boundaries and request lifecycle", href: `${DOC_BASE}/ARCHITECTURE.md` },
  { icon: ShieldCheck, title: "Security", sublabel: "Identity, MCP approval, and limitations", href: `${DOC_BASE}/SECURITY.md` },
  { icon: BookOpen, title: "User guide", sublabel: "Research workflow and coaching model", href: `${DOC_BASE}/USER_GUIDE.md` },
  { icon: CheckCircle2, title: "Testing", sublabel: "Frontend, API, grounding, and live checks", href: `${DOC_BASE}/TESTING.md` },
];

const onNavy = { borderColor: "var(--navy-border)", color: "#fff", background: "transparent" };

// Sits inside .band-navy, which remaps --muted/--accent and recolours every <p>
// for a dark surface — this light card uses fixed light-surface colours instead.
function CoachPreview() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-white/15 bg-white text-slate-900 shadow-[0_30px_80px_-35px_rgba(0,0,0,.6)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white"><GraduationCap className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0"><strong className="block text-sm">Research coach</strong><span className="block truncate text-[11px] text-slate-500">Stage 04 · Participants · synthetic WO</span></div>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">Ready for research</span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <div className="ml-auto max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-5 sm:max-w-[78%]">The customer says Horizon Builders is the GC, but the NOC shows Summit Construction. Which GC should I use?</div>
        <div className="space-y-3 rounded-2xl border border-[var(--border)] p-4">
          <div><span className="text-[10px] font-semibold uppercase tracking-[.1em] text-blue-600">Answer</span><div className="mt-1 text-xs leading-5 text-slate-600">Don&apos;t choose one yet. Preserve both names with their sources.</div></div>
          <div><span className="text-[10px] font-semibold uppercase tracking-[.1em] text-blue-600">Why</span><div className="mt-1 text-xs leading-5 text-slate-600">The customer claim is unverified intake; the recorded NOC is documented evidence. They conflict.</div></div>
          <div className="border-l-2 border-blue-600 pl-3"><span className="text-[10px] font-semibold uppercase tracking-[.1em] text-blue-600">Next step</span><div className="mt-1 text-xs leading-5 text-slate-600">Follow the CC-first confirmation path and escalate if the conflict remains unresolved.</div></div>
        </div>
      </div>
    </div>
  );
}

export function NtoCopilotShowcase({
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
    // "user" drops transform animation for reduced-motion visitors without a
    // client-only branch, which would mismatch the server-rendered markup.
    <MotionConfig reducedMotion="user">
      <main id="main-content" tabIndex={-1} className="premium-wash min-h-screen text-[var(--text)]">
        <nav className="case-nav" aria-label="Case study navigation">
          <Link href="/projects">← Architecture archive</Link>
          <span>
            Case {String(projectIndex + 1).padStart(2, "0")} / {String(totalProjects).padStart(2, "0")}
          </span>
        </nav>

        <section id="nto-hero" className="band-navy relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--navy-border)] px-3 py-1 text-[11px] font-semibold text-[var(--navy-text)]">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Deployed operational AI pilot
                </span>
                <span className="text-[11px] font-semibold text-[var(--navy-muted)]">Agentic AI</span>
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                NTO Operations <span className="text-[#60a5fa]">Copilot</span>
              </h1>
              <p className="mt-4 text-lg font-medium leading-7 text-[var(--navy-text)]">An evidence-grounded research coach for new Notice to Owner researchers.</p>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--navy-muted)]">{goal}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={LIVE_APP_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">
                  Open live app <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill--outline" style={onNavy}>
                  Inspect repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a href={`${DOC_BASE}/ARCHITECTURE.md`} target="_blank" rel="noreferrer" className="btn-pill btn-pill--outline" style={onNavy}>
                  View architecture <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...spring, delay: 0.12 }}
            >
              <CoachPreview />
              <p className="mt-3 text-center text-xs text-[var(--navy-muted)]">Illustrative coaching exchange based on the documented GC-conflict procedure.</p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {STATS.map((stat) => (
              <StatTile key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </Reveal>
          <p className="mt-6 max-w-3xl text-xs leading-5 text-[var(--faint)]">
            These counts describe the implemented synthetic dataset and interface. They are not accuracy, time-saving, or real-usage figures.
          </p>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <Reveal>
              <div className="flex items-center gap-3">
                <IconBadge icon={FileText} />
                <h2 className="text-2xl font-semibold tracking-tight">Project overview</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                New NTO researchers have to work through property, recorded NOC, participant, and notice checks while
                customer intake, official records, and procedure don&apos;t always agree. The hard part is knowing which
                source to trust, what to record, and when to stop and ask.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                NTO Operations Copilot guides the researcher through six stages, retrieves synthetic work-order evidence,
                explains exceptions, preserves uncertainty, and recommends the next approved action.
              </p>
              <div className="quote-panel mt-6 text-sm italic leading-6 text-[var(--muted)]">
                The coach teaches the process and surfaces uncertainty. The researcher remains accountable for
                verification and escalation.
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="flex items-center gap-3">
                <IconBadge icon={CheckCircle2} />
                <h2 className="text-2xl font-semibold tracking-tight">Key coaching capabilities</h2>
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
            </Reveal>
          </div>

          <section id="nto-architecture" className="mt-24 scroll-mt-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">System architecture</p>
                  <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                    A cross-cloud evidence path with explicit policy boundaries.
                  </h2>
                </div>
                <a href={`${DOC_BASE}/ARCHITECTURE.md`} target="_blank" rel="noreferrer" className="btn-pill btn-pill--outline">
                  Read architecture docs <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                The browser never talks to Foundry or holds credentials. The FastAPI gateway validates each request, calls
                the Foundry WO intake agent, and permits only the read-only <code className="text-[13px]">get_work_order</code> MCP
                tool, which reads synthetic records from AWS.
              </p>
            </Reveal>
            {/* Four stages plus three arrows: an explicit track list keeps the
                arrows narrow instead of each taking an auto-fit card column. */}
            <Reveal delay={0.1} className="mt-10 flow-diagram min-[900px]:!grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] min-[900px]:!gap-x-3">
              {ARCHITECTURE.map((column, index) => (
                <div key={column.title} style={{ display: "contents" }}>
                  <FlowColumn icon={column.icon} title={column.title} rows={column.rows} />
                  {index < ARCHITECTURE.length - 1 && (
                    <div className="flow-arrow" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4 rotate-45" />
                    </div>
                  )}
                </div>
              ))}
            </Reveal>
          </section>

          <section className="mt-24">
            <Reveal>
              <p className="eyebrow">Evidence example</p>
              <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                When the customer and the record disagree, both stay on the page.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                A documented general-contractor conflict from the synthetic teaching set. The coach labels where each value
                came from and doesn&apos;t pick a winner.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
              <SurfaceCard className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[var(--accent)]">Customer claim</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">Horizon Builders</p>
                <p className="mt-2 text-xs leading-5 text-[var(--faint)]">General contractor as provided on intake. Unverified.</p>
              </SurfaceCard>
              <div className="grid place-items-center py-1 text-[var(--faint)]" aria-hidden="true">
                <GitCompareArrows className="h-5 w-5" />
              </div>
              <SurfaceCard className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[var(--accent)]">Recorded NOC evidence</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">Summit Construction</p>
                <p className="mt-2 text-xs leading-5 text-[var(--faint)]">General contractor named on the recorded Notice of Commencement.</p>
              </SurfaceCard>
            </Reveal>
          </section>

          <section className="mt-24">
            <Reveal>
              <p className="eyebrow">Approved conflict path</p>
              <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">The approved procedure stays visible.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                The coach points to the documented path rather than improvising one.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {CONFLICT_PATH.map((step, index) => (
                  <li key={step.title}>
                    <SurfaceCard className="h-full p-5">
                      <span className="text-[11px] font-semibold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                      <p className="mt-3 text-sm font-semibold">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--faint)]">{step.detail}</p>
                    </SurfaceCard>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <section className="mt-24 grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="flex items-center gap-3">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl font-semibold tracking-tight">Request queue</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                100 new research requests (SYN-WO-000121 to SYN-WO-000220) are grouped into 20 intake scenario families
                with five variants each. They arrive as ready for research, so no queued WO looks already reviewed, and a
                selection isn&apos;t marked loaded until the intake agent confirms the record.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Missing references show as <em>Not provided</em>. That is deliberate scenario data for the researcher to
                work through.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="flex items-center gap-3">
                <IconBadge icon={Landmark} />
                <h2 className="text-2xl font-semibold tracking-tight">Notice selection</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                The coach&apos;s knowledge includes a state notice-selection reference. Work orders fall into four
                project/notice classes, and the researcher still verifies the state and class from the evidence before
                a notice is chosen.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {NOTICE_CLASSES.map((item) => (
                  <PillTag key={item}>{item}</PillTag>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--faint)]">
                An internal operational reference, not legal advice. Current rules and deadlines need verification.
              </p>
            </Reveal>
          </section>

          <Reveal>
            <section className="mt-24 grid gap-10 lg:grid-cols-3">
              <div>
                <p className="eyebrow">Implementation</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">What is deployed</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
                  <li>WO validation and intake summary</li>
                  <li>100-item guided request queue</li>
                  <li>Foundry and MCP evidence retrieval</li>
                  <li>Answer, Why, and Next step responses</li>
                  <li>Human review and escalation guidance</li>
                </ul>
              </div>
              <div>
                <p className="eyebrow">Tech stack</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">Built with</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {TECH_STACK.map((tech) => (
                    <PillTag key={tech}>{tech}</PillTag>
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
          </Reveal>

          <Reveal>
            <section className="mt-24 border-t border-[var(--border)] pt-10">
              <p className="eyebrow">Assumptions &amp; limitations</p>
              <ol className="mt-4 grid gap-4 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
                <li>The application uses synthetic work-order data only. It isn&apos;t connected to real customer workloads.</li>
                <li>The state notice-selection resource is an internal operational reference, not legal advice. Current rules and deadlines need verification.</li>
                <li>The coach recommends actions. It doesn&apos;t make autonomous legal or operational decisions, and it doesn&apos;t approve or release notices.</li>
                <li>No production accuracy, researcher-time reduction, or error-reduction figure has been measured. Establishing those would need a user study.</li>
              </ol>
            </section>
          </Reveal>
        </div>

        <footer className="case-next">
          <p>Next system · {String(((projectIndex + 1) % totalProjects) + 1).padStart(2, "0")}</p>
          <Link href={`/projects/${nextProjectId}`}>
            {nextProjectTitle}
            <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
    </MotionConfig>
  );
}
