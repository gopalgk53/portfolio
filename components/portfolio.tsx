"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Code2, ExternalLink, Link2, Mail, Play } from "lucide-react";

// lucide-react@1.31.0 (pinned in package.json) doesn't ship brand marks, so
// GitHub/LinkedIn reuse the closest neutral technical glyphs — same
// workaround the pre-redesign code used (Code2 for GitHub).
const Github = Code2;
const Linkedin = Link2;
import { FormEvent, ReactNode, useState } from "react";
import { certifications, projects, skills } from "../lib/data";
import { spring, staggerChild } from "../lib/motion";
import { RevealText } from "./motion/reveal-text";
import { Magnetic } from "./motion/magnetic";
import { RagFlow } from "./visualizations/rag-flow";
import { AgentFlow } from "./visualizations/agent-flow";
import { PromptPlayground } from "./prompt-playground";
import { InfrastructureDashboard } from "./infrastructure-dashboard";
import { PipelineDeepDive } from "./pipeline-deep-dive";
import { HiringEvidence } from "./hiring-evidence";

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

function Section({ id, scene, children }: { id: string; scene: SceneId; children: ReactNode }) {
  const copy = naturalCopy[id];
  return (
    <section id={id} data-scene={scene} className="relative z-10 scroll-mt-20 border-t border-white/[.1] px-5 py-24 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <header className="typography-shield mb-16 grid gap-7 lg:grid-cols-[10rem_1fr_.65fr] lg:items-start">
          <p className="eyebrow pt-2">{copy.eyebrow}</p>
          <h2 className="max-w-4xl overflow-hidden text-4xl font-semibold tracking-[-.04em] sm:text-6xl">
            <RevealText as="span">{copy.title}</RevealText>
          </h2>
          {copy.description && <p className="max-w-xl leading-7 text-[#83878c]">{copy.description}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" scene="identity">
      <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={spring} className="relative">
          <div className="aspect-[4/5] overflow-hidden bg-[#111214]">
            <img src="https://avatars.githubusercontent.com/u/60279201?v=4" alt="Gopalakrishna, Generative AI Engineer" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover grayscale" />
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

function ProjectCard({ project, index, flagship }: { project: Project; index: number; flagship?: "rag" | "agents" }) {
  const [tab, setTab] = useState<"overview" | "architecture">("overview");
  const big = index < 2 || Boolean(flagship);
  return (
    <motion.article
      layout
      data-scene={flagship === "rag" ? "retrieval" : flagship === "agents" ? "agents" : undefined}
      whileHover={{ y: -4 }}
      transition={spring}
      className={`group flex min-h-[410px] flex-col border-t border-white/[.14] bg-white/[.012] p-6 sm:p-8 ${big ? "lg:min-h-[470px] md:col-span-2" : ""}`}
    >
      <div className="flex justify-between text-[11px] text-[#6c7075]">
        <span>Case study</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className={`${big ? "text-3xl" : "text-xl"} mt-9 max-w-xl font-medium tracking-[-.03em]`}>{project.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#9a9ea3]">{project.impact}</p>
      <div className="mt-7 flex gap-6 border-b border-white/[.12]">
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
                  <span className="border border-white/[.12] px-2.5 py-2 font-mono text-[9px] text-[#c9cbce]">{node}</span>
                  {i < arr.length - 1 && <span className="text-[#515459]">→</span>}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {flagship === "rag" && (
        <div className="mt-7">
          <RagFlow flow={project.flow} />
        </div>
      )}
      {flagship === "agents" && (
        <div className="mt-7">
          <AgentFlow flow={project.flow} domains={AGENT_DOMAINS} />
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-6">
        {project.stack.map((x) => (
          <span key={x} className="font-mono text-[9px] text-[#6c7075]">
            {x}
          </span>
        ))}
      </div>
      <div className="mt-6 flex gap-5 border-t border-white/[.12] pt-5 text-xs">
        <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#c9cbce]">
          Inspect code <Code2 className="h-3 w-3" />
        </a>
        <a href="#playground" className="flex items-center gap-1 text-[#6c7075]">
          Live simulator <Play className="h-3 w-3" />
        </a>
      </div>
    </motion.article>
  );
}

function Projects() {
  return (
    <Section id="projects" scene="retrieval">
      <div className="mb-10 grid border-y border-white/[.1] py-4 text-xs text-[#83878c] sm:grid-cols-3">
        <span>TTFT target · &lt;150ms</span>
        <span>Orchestration · LangGraph</span>
        <span>Vector stores · Qdrant / FAISS</span>
      </div>
      <div className="grid gap-px bg-white/[.08] md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} flagship={p.id === "legal-rag" ? "rag" : p.id === "multi-agent" ? "agents" : undefined} />
        ))}
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
    <Section id="playground" scene="infra">
      <PromptPlayground />
    </Section>
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
        {visible.map(([name, meta, url], index) => (
          <motion.a key={name} href={url} target="_blank" rel="noreferrer" whileHover={{ x: 5 }} transition={spring} className="grid items-center gap-3 border-b border-white/[.14] py-6 sm:grid-cols-[10rem_1fr_auto]">
            <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#6c7075]">{index === 0 ? "Primary · Great Learning" : `Credential ${String(index + 1).padStart(2, "0")}`}</span>
            <div>
              <h3 className={index === 0 ? "text-xl font-medium" : "text-sm font-medium"}>{name}</h3>
              <p className="mt-1 text-xs text-[#6c7075]">{meta}</p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          </motion.a>
        ))}
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
                  <a href={url as string} target={String(url).startsWith("http") ? "_blank" : undefined} className="flex items-center justify-between border-b border-white/[.12] py-4 text-sm text-[#9a9ea3]">
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
      <Projects />
      <Skills />
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
