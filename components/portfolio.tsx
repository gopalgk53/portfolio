"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Code2, ExternalLink, Link2, Mail, Play } from "lucide-react";

// lucide-react@1.31.0 (pinned in package.json) doesn't ship brand marks, so
// GitHub/LinkedIn reuse the closest neutral technical glyphs — same
// workaround the pre-redesign code used (Code2 for GitHub).
const Github = Code2;
const Linkedin = Link2;
import { FormEvent, ReactNode, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { certifications, projects, skills } from "../lib/data";
import { spring, staggerChild } from "../lib/motion";
import { RevealText } from "./motion/reveal-text";
import { Magnetic } from "./motion/magnetic";
import { RagFlow } from "./visualizations/rag-flow";
import { AgentFlow } from "./visualizations/agent-flow";
import { HiringEvidence } from "./hiring-evidence";

const LabLoading = () => <div className="px-8 py-16 font-mono text-[10px] uppercase tracking-[.16em] text-[#6c7075]">Loading technical module…</div>;
const PromptPlayground = dynamic(() => import("./prompt-playground").then(module => module.PromptPlayground), { loading: LabLoading });
const InfrastructureDashboard = dynamic(() => import("./infrastructure-dashboard").then(module => module.InfrastructureDashboard), { loading: LabLoading });
const PipelineDeepDive = dynamic(() => import("./pipeline-deep-dive").then(module => module.PipelineDeepDive), { loading: LabLoading });

type Project = (typeof projects)[number];
type SceneId = "identity" | "retrieval" | "agents" | "infra" | "close";

const AGENT_DOMAINS = ["Compliance", "Risk", "Communication"];

const naturalCopy: Record<string, { eyebrow: string; title: string; description?: string }> = {
  about: { eyebrow: "01 / Profile", title: "I build AI systems that move from prototype → production.", description: "Seven years across construction operations and data science inform a workflow-first approach to Generative AI, RAG, and autonomous agents." },
  projects: { eyebrow: "02 / Selected work", title: "Selected AI systems.", description: "Nine blueprint projects with explicit goals, implementation stacks, and system flows. Figures marked as targets are project targets — not unverified production claims." },
  skills: { eyebrow: "03 / Capabilities", title: "The execution stack." },
  playground: { eyebrow: "04 / Interactive lab", title: "See how prompt structure changes an answer.", description: "A small browser demo for comparing prompts and adjusting common model settings. The output and timing data are simulated." },
  experience: { eyebrow: "05 / Experience", title: "From operations to data and AI." },
  certifications: { eyebrow: "06 / Credentials", title: "Formal training behind the practice." },
  contact: { eyebrow: "07 / Contact", title: "Let's build intelligent systems." },
};

// Each section "arrives" with a slow scale/opacity settle as it scrolls
// into view — the scene-to-scene morph the brief asks for, rather than a
// hard cut between stacked blocks. The eyebrow label drifts at a slightly
// different rate than the rest of the header for a touch of spatial depth.
function Section({ id, scene, children }: { id: string; scene: SceneId; children: ReactNode }) {
  const copy = naturalCopy[id];
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.4"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.965, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const eyebrowY = useTransform(scrollYProgress, [0, 1], [18, 0]);

  return (
    <motion.section
      ref={ref}
      id={id}
      data-scene={scene}
      style={reducedMotion ? undefined : { scale, opacity }}
      className="chapter relative z-10 scroll-mt-20 border-t border-white/[.1] px-5 py-28 sm:px-8 sm:py-44"
    >
      <div className="mx-auto max-w-[1600px]">
        <header className="typography-shield mb-16 grid gap-7 lg:grid-cols-[10rem_1fr_.65fr] lg:items-start">
          <motion.p style={reducedMotion ? undefined : { y: eyebrowY }} className="eyebrow pt-2">
            {copy.eyebrow}
          </motion.p>
          <h2 className="max-w-5xl overflow-hidden text-[clamp(2.8rem,6.5vw,7rem)] font-medium leading-[.92] tracking-[-.055em]">
            <RevealText as="span">{copy.title}</RevealText>
          </h2>
          {copy.description && <p className="max-w-xl leading-7 text-[#83878c]">{copy.description}</p>}
        </header>
        {children}
      </div>
    </motion.section>
  );
}

function About() {
  return (
    <Section id="about" scene="identity">
      <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={spring} className="relative">
          <div className="aspect-[4/5] overflow-hidden bg-[#111214]">
            <img src="https://avatars.githubusercontent.com/u/60279201?v=4" alt="Gopalakrishna, Generative AI Engineer" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex justify-between border-t border-white/[.14] pt-3 text-xs">
            <span>Gopalakrishna</span>
            <span className="text-[#83878c]">India · Available</span>
          </div>
        </motion.div>
        <div>
          <p className="max-w-3xl text-[clamp(1.45rem,2.7vw,2.55rem)] leading-[1.35] tracking-[-.03em] text-[#c9cbce]">
            I focus on prompt engineering, advanced RAG topologies, autonomous multi-agent workflows, and the evaluation systems required to make
            them reliable — spanning Data Science, Generative AI, LLM applications, Machine Learning, and AWS.
          </p>
          <div className="mt-14 grid border-y border-white/[.14] sm:grid-cols-3">
            {[["7+", "Years domain experience"], ["9", "Blueprint systems"], ["23", "Credentials retained"]].map(([n, l]) => (
              <div key={l} className="border-b border-white/[.12] py-6 sm:border-b-0 sm:border-r sm:px-6 first:pl-0 last:border-r-0">
                <b className="text-4xl font-medium tracking-[-.03em]">{n}</b>
                <p className="mt-2 text-xs text-[#6c7075]">{l}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 mt-12 font-mono text-[9px] uppercase tracking-[.18em] text-[#6c7075]">Current focus</p>
          {["Evaluation-led RAG", "Stateful agent orchestration", "Low-latency model serving"].map((x) => (
            <motion.div key={x} whileHover={{ x: 5 }} transition={spring} className="flex items-center gap-3 border-b border-white/[.12] py-5">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              {x}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [tab, setTab] = useState<"overview" | "architecture">("overview");
  return (
    <motion.article
      layout
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0, 217, 255, 0.1)" }}
      transition={spring}
      className="group relative grid min-h-[360px] overflow-hidden border-t border-white/15 py-10 md:grid-cols-[7rem_1fr_1fr] md:gap-10 md:py-14"
    >
      <div className="text-[11px] text-[#6c7075]">{String(index + 1).padStart(2, "0")} / 09</div>
      <div className="relative z-10">
      <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--signal)]">{project.category}</p>
      <h3 className="mt-5 max-w-2xl text-[clamp(1.8rem,4vw,4.5rem)] font-medium leading-[.98] tracking-[-.045em]">{project.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#9a9ea3]">{project.impact}</p>
      <div className="mt-7 flex gap-6 border-b border-white/[.12] md:hidden">
        {(["overview", "architecture"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`relative pb-3 text-xs capitalize ${tab === t ? "text-[#ece9e2]" : "text-[#6c7075]"}`}>
            {tab === t && <motion.span layoutId={`tab-${project.id}`} transition={spring} className="absolute inset-x-0 bottom-[-1px] h-px bg-[var(--accent)]" />}
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring} className="mt-5 min-h-28">
          {tab === "overview" ? (
            <p className="text-sm leading-7 text-[#9a9ea3]">{project.goal}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {project.flow.split(" → ").map((node, i, arr) => (
                <span key={node} className="contents">
                  <span className="relative group/node">
                    <span className="absolute inset-0 rounded bg-gradient-to-r from-[var(--accent)] to-[var(--accent-purple)] opacity-0 group-hover/node:opacity-20 blur transition-opacity"></span>
                    <span className="relative border border-[var(--accent)] border-opacity-30 px-2.5 py-2 font-mono text-[9px] text-[var(--accent)] backdrop-blur-sm bg-[var(--accent)] bg-opacity-5 rounded transition-all group-hover/node:border-opacity-50 group-hover/node:bg-opacity-10">
                      {node}
                    </span>
                  </span>
                  {i < arr.length - 1 && <span className="text-[#515459]">→</span>}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-10">
        {project.stack.map((x) => (
          <span key={x} className="font-mono text-[9px] text-[#6c7075]">
            {x}
          </span>
        ))}
      </div></div>
      <div className="relative z-10 flex flex-col justify-between border-l border-white/10 pl-6">
        <div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-[#6c7075]">System flow</p><p className="mt-4 text-sm leading-7 text-[#aaa9a3]">{project.flow}</p></div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[.12] pt-5 text-xs">
          <a href={`/projects/${project.id}`} className="flex items-center gap-1 text-[var(--accent)]">
            Read case study <ArrowUpRight className="h-3 w-3" />
          </a>
          <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#c9cbce]">
            Inspect code <Code2 className="h-3 w-3" />
          </a>
          <a href="#playground" className="flex items-center gap-1 text-[#6c7075]">
            Live simulator <Play className="h-3 w-3" />
          </a>
        </div></div>
    </motion.article>
  );
}

// The two flagship systems (the RAG and multi-agent projects) get a full
// cinematic treatment of their own — Problem → Architecture → Engineering →
// Impact — instead of living inside the same card grid as the rest, per the
// brief's "each flagship project receives its own cinematic section."
function FlagshipProject({ project, index, scene, viz }: { project: Project; index: number; scene: "retrieval" | "agents"; viz: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.3"] });
  const numberX = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const numberOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.16]);

  return (
    <div ref={ref} data-scene={scene} className="flagship-chapter relative min-h-[130svh] border-t border-white/[.14] py-20 sm:py-28">
      <motion.span
        aria-hidden="true"
        style={reducedMotion ? { opacity: 0.16 } : { x: numberX, opacity: numberOpacity }}
        className="pointer-events-none absolute -top-4 right-0 text-[clamp(6rem,16vw,13rem)] font-semibold leading-none tracking-[-.04em] text-white"
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <div className="sticky top-24">
      <p className="eyebrow relative">Flagship system · Case {String(index + 1).padStart(2, "0")}</p>
      <h3 className="relative mt-5 max-w-5xl text-[clamp(3rem,7vw,8rem)] font-medium leading-[.9] tracking-[-.055em]">{project.title}</h3>

      <div className="relative mt-10 grid gap-8 border-y border-white/[.12] py-8 sm:grid-cols-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#6c7075]">Problem</p>
          <p className="mt-3 text-sm leading-6 text-[#c9cbce]">{project.goal}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#6c7075]">Engineering</p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-[#c9cbce]">{project.stack.join(" · ")}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#6c7075]">Impact</p>
          <p className="mt-3 text-sm leading-6 text-[#c9cbce]">{project.impact}</p>
        </div>
      </div></div>

      <div className="relative mt-10">{viz}</div>

      <div className="relative mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs">
        <a href={`/projects/${project.id}`} className="flex items-center gap-1 text-[var(--accent)]">
          Read case study <ArrowUpRight className="h-3 w-3" />
        </a>
        <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#c9cbce]">
          Inspect code <Code2 className="h-3 w-3" />
        </a>
        <a href="#playground" className="flex items-center gap-1 text-[#6c7075]">
          Live simulator <Play className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function Projects() {
  const flagshipIds = new Set(["legal-rag", "multi-agent"]);
  const rest = projects.filter((p) => !flagshipIds.has(p.id));
  const legalRag = projects.find((p) => p.id === "legal-rag")!;
  const multiAgent = projects.find((p) => p.id === "multi-agent")!;
  const legalRagIndex = projects.findIndex((p) => p.id === "legal-rag");
  const multiAgentIndex = projects.findIndex((p) => p.id === "multi-agent");

  return (
    <Section id="projects" scene="retrieval">
      <div className="mb-10 grid border-y border-white/[.1] py-4 text-xs text-[#83878c] sm:grid-cols-3">
        <span>TTFT target · &lt;150ms</span>
        <span>Orchestration · LangGraph</span>
        <span>Vector stores · Qdrant / FAISS</span>
      </div>

      <FlagshipProject project={legalRag} index={legalRagIndex} scene="retrieval" viz={<RagFlow flow={legalRag.flow} />} />
      <FlagshipProject project={multiAgent} index={multiAgentIndex} scene="agents" viz={<AgentFlow flow={multiAgent.flow} domains={AGENT_DOMAINS} />} />

      <div className="mt-24">
        {rest.map((p) => (
          <ProjectCard key={p.id} project={p} index={projects.indexOf(p)} />
        ))}
      </div>
      <div className="mt-16 flex justify-end border-t border-white/[.14] pt-8">
        <a href="/projects" className="group flex items-center gap-4 text-sm text-[#c9cbce]">
          Explore all nine case studies
          <ArrowUpRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      </div>
    </Section>
  );
}

function Skills() {
  return (
    <Section id="skills" scene="infra">
      <div className="border-t border-white/[.14]">
        {skills.map((s, i) => (
          <motion.div key={s.group} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={staggerChild(i)} className="grid gap-5 border-b border-white/[.14] py-7 md:grid-cols-[2rem_17rem_1fr]">
            <span className="font-mono text-[10px] text-[#6c7075]">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-medium">{s.group}</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {s.items.map((x) => (
                <motion.span key={x} whileHover={{ x: 3 }} transition={spring} className="font-mono text-[10px] text-[#9a9ea3]">
                  {x}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Playground() {
  return (
    <div className="model-lab" data-scene="infra">
      <Section id="playground" scene="infra">
        <div className="mb-16 grid gap-6 border-y border-black/20 py-5 font-mono text-[9px] uppercase tracking-[.16em] md:grid-cols-3">
          <span>Outputs · simulated</span><span>Timing · simulated</span><span>Purpose · interaction study</span>
        </div>
        <PromptPlayground />
      </Section>
    </div>
  );
}

function Manifesto() {
  return (
    <section data-scene="agents" className="manifesto relative z-10 flex min-h-svh items-center overflow-hidden px-5 py-28 sm:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <p className="eyebrow mb-10">System principle / 01</p>
        <p className="text-[clamp(3.4rem,10vw,10rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">I build systems that think with context.</p>
        <div className="mt-12 h-px w-full bg-white/15" />
      </div>
    </section>
  );
}

function Experience() {
  const rows: Array<[string, string, string]> = [
    ["2024 — Now", "Generative AI systems", "RAG · agents · evaluation · LLMOps"],
    ["Data practice", "Data science", "Predictive ML · explainability · document intelligence"],
    ["Domain foundation", "Construction research & operations", "Domain workflows · compliance · business analysis"],
  ];
  return (
    <Section id="experience" scene="identity">
      <div className="border-t border-white/[.14]">
        {rows.map(([period, title, copy]) => (
          <div key={period} className="grid gap-3 border-b border-white/[.14] py-8 sm:grid-cols-[12rem_1fr]">
            <span className="text-xs text-[#6c7075]">{period}</span>
            <div>
              <h3 className="text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#83878c]">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Certifications() {
  const [all, setAll] = useState(false);
  const visible = all ? certifications : certifications.slice(0, 6);
  return (
    <Section id="certifications" scene="identity">
      <div className="border-t border-white/[.14]">
        {visible.map(([name, meta, url], index) => {
          const unavailable = url.includes("leapsdata.analyttica.com");
          const content = <>
            <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#6c7075]">{index === 0 ? "Primary · Great Learning" : `Credential ${String(index + 1).padStart(2, "0")}`}</span>
            <div>
              <h3 className={index === 0 ? "text-xl font-medium" : "text-sm font-medium"}>{name}</h3>
              <p className="mt-1 text-xs text-[#6c7075]">{meta}</p>
            </div>
            {unavailable ? <span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#6c7075]">Verification host unavailable</span> : <ExternalLink className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
          </>;
          return unavailable ? (
            <div key={name} className="grid items-center gap-3 border-b border-white/[.14] py-6 sm:grid-cols-[10rem_1fr_auto]">{content}</div>
          ) : (
            <motion.a key={name} href={url} target="_blank" rel="noreferrer" whileHover={{ x: 5 }} transition={spring} className="grid items-center gap-3 border-b border-white/[.14] py-6 sm:grid-cols-[10rem_1fr_auto]">{content}</motion.a>
          );
        })}
      </div>
      <motion.button onClick={() => setAll(!all)} whileTap={{ scale: 0.97 }} transition={spring} className="mt-7 border-b border-[var(--accent)] pb-1 text-sm">
        {all ? "Show featured" : `View all ${certifications.length} credentials`}
      </motion.button>
    </Section>
  );
}

function Contact() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const d = new FormData(form);
    const name = String(d.get("name") || "");
    const email = String(d.get("email") || "");
    const message = String(d.get("message") || "");
    const company = String(d.get("company") || "");
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || message.trim().length < 10) {
      setStatus("Check name, email, and message (10+ characters).");
      return;
    }
    setSending(true);
    setStatus("Sending…");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message, company }) });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "Message delivery failed.");
      form.reset();
      setStatus("Message delivered. Gopalakrishna has been alerted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Message delivery failed. Please email directly.");
    } finally {
      setSending(false);
    }
  }
  return (
    <Section id="contact" scene="close">
      <div className="mb-16 typography-shield">
        <h3 className="max-w-2xl text-[clamp(2.4rem,6vw,5rem)] font-semibold uppercase leading-[.95] tracking-[-.03em]">
          <RevealText as="span">Let&rsquo;s build</RevealText>
          <RevealText as="span" delay={0.06}>
            intelligent systems.
          </RevealText>
        </h3>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[.16em] text-[#6c7075]">Generative AI · RAG · Agents · Machine Learning · AWS</p>
      </div>
      <div className="grid gap-px bg-white/[.1] lg:grid-cols-[.8fr_1.2fr]">
        <div className="bg-[#0d0e0f] p-7 sm:p-10">
          <p className="max-w-sm text-lg leading-8 text-[#c9cbce]">Open to thoughtful conversations about GenAI engineering, AI architecture, and applied research.</p>
          <div className="mt-12">
            {[
              ["GitHub", "https://github.com/gopalgk53", Github],
              ["LinkedIn", "https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b", Linkedin],
              ["gopalgk53@yahoo.com", "mailto:gopalgk53@yahoo.com", Mail],
            ].map(([label, url, Icon]) => {
              const IconComp = Icon as typeof Github;
              return (
                <Magnetic key={label as string} className="block w-full">
                  <a href={url as string} target={String(url).startsWith("http") ? "_blank" : undefined} rel={String(url).startsWith("http") ? "noreferrer" : undefined} className="flex items-center justify-between border-b border-white/[.12] py-4 text-sm text-[#9a9ea3]">
                    <span className="flex items-center gap-2 break-all">
                      <IconComp className="h-4 w-4 shrink-0" />
                      {label as string}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </a>
                </Magnetic>
              );
            })}
          </div>
          <a href="/Gopalakrishna_Maddipalli_CV.pdf" className="mt-7 inline-flex border-b border-[var(--accent)] pb-1 text-sm">
            Download résumé
          </a>
        </div>
        <form onSubmit={submit} className="bg-[#0d0e0f] p-7 sm:p-10">
          <p className="mb-8 text-sm text-[#83878c]">Send a message directly to Gopalakrishna.</p>
          <div className="hidden" aria-hidden="true">
            <label>
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <input name="name" aria-label="Name" placeholder="Your name" maxLength={80} required className="field" />
            <input name="email" type="email" aria-label="Email" placeholder="Email address" maxLength={254} required className="field" />
          </div>
          <textarea name="message" aria-label="Message" placeholder="Tell me about your project or role" rows={5} minLength={10} maxLength={3000} required className="field mt-5 resize-none" />
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Magnetic>
              <motion.button whileHover={sending ? undefined : { y: -2 }} whileTap={sending ? undefined : { scale: 0.97 }} transition={spring} disabled={sending} className="bg-[#ece9e2] px-5 py-3 text-sm font-semibold text-[#0a0a0b] disabled:cursor-wait disabled:opacity-60">
                {sending ? "Sending…" : "Send message"}
              </motion.button>
            </Magnetic>
            <span role="status" aria-live="polite" className="text-xs text-[#6c7075]">
              {status}
            </span>
          </div>
        </form>
      </div>
    </Section>
  );
}

export function Portfolio() {
  return (
    <>
      <About />
      <Manifesto />
      <Projects />
      <Playground />
      <details className="lab-disclosure">
        <summary>Technical lab · Infrastructure observability</summary>
        <InfrastructureDashboard />
      </details>
      <details className="lab-disclosure">
        <summary>Technical lab · Production RAG pipeline</summary>
        <PipelineDeepDive />
      </details>
      <Experience />
      <Skills />
      <Certifications />
      <HiringEvidence />
      <Contact />
      <footer className="relative z-10 border-t border-white/[.1] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#6c7075] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Gopalakrishna · Generative AI Engineer</p>
          <p>India · gopalakrishnagenai.in</p>
        </div>
      </footer>
    </>
  );
}
