"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { certifications, credlyBadges, projects } from "../lib/data";
import { posts } from "../lib/posts";
import { Reveal } from "./reveal";

const REPO_ROOT = "https://github.com/gopalgk53/construction-legal-ai-suite";
const LINKEDIN = "https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b";
const EMAIL = "gopalgk53@yahoo.com";

type Link_ = { label: string; href: string };
type Featured = {
  id: string;
  poster: string;
  summary: string;
  evidence: [string, string][];
  links: Link_[];
};

// The three projects with public code, a deployment and a film. Everything
// in `evidence` is checkable from the case study or the repository; the
// second item is a label (BUILT / DEPLOYED / SYNTHETIC / TARGET) so a reader
// can tell measured work from demonstration data at a glance.
const FEATURED: Featured[] = [
  {
    id: "multi-agent",
    poster: "/media/multi-agent/wo-intelligence-film-poster.jpg",
    summary:
      "Specialist agents on Microsoft Foundry handle intake, research, evidence and discrepancy checks for construction work orders. A deterministic Python router decides the next step, and anything complex goes to a person.",
    evidence: [
      ["Running on Azure Container Apps, deployed by GitHub Actions with OIDC", "Deployed"],
      ["Evaluated on 120 work orders across 24 scenario families", "Synthetic"],
      ["pytest suite runs in CI", "Built"],
    ],
    links: [
      { label: "Case study", href: "/projects/multi-agent" },
      { label: "Live app", href: "https://wo-intelligence-web.victoriousmoss-788bd572.southeastasia.azurecontainerapps.io/" },
      { label: "Code", href: `${REPO_ROOT}/tree/main/wo-agent-orchestrator` },
    ],
  },
  {
    id: "nto-operations-copilot",
    poster: "/media/nto-operations-copilot/nto-copilot-film-poster.jpg",
    summary:
      "A research coach for new Notice to Owner researchers. It walks them through six stages, pulls work-order evidence through one allowlisted, read-only MCP tool and suggests the next approved action. A person still verifies every notice.",
    evidence: [
      ["Pilot running on Azure App Service", "Deployed"],
      ["Read-only tool boundary: the model can look things up, not change them", "Built"],
      ["Work orders in the demo are generated, not customer data", "Synthetic"],
    ],
    links: [
      { label: "Case study", href: "/projects/nto-operations-copilot" },
      { label: "Live app", href: "https://nto-copilot-web-gopalg53.azurewebsites.net" },
      { label: "Code", href: `${REPO_ROOT}/tree/main/nto-operations-copilot` },
    ],
  },
  {
    id: "payment-risk",
    poster: "/media/payment-risk/payment-risk-film-poster.jpg",
    summary:
      "A model that ranks payment-protection work by the risk of a delayed payment, so the team looks at the riskiest jobs first. Every score comes with a SHAP explanation a reviewer can check before acting.",
    evidence: [
      ["Benchmarked against DataRobot AutoML, results in the case study", "Built"],
      ["Risk dashboard you can open", "Deployed"],
      ["Trained and validated on generated payment records", "Synthetic"],
    ],
    links: [
      { label: "Case study", href: "/projects/payment-risk" },
      { label: "Dashboard", href: "https://payment-risk.gopalakrishnagenai.in/" },
      { label: "Code", href: `${REPO_ROOT}/tree/main/payment-delay-predictor` },
    ],
  },
];

const STACK: [string, string, string][] = [
  ["Data and cloud", "Getting data in, cleaned and queryable", "Python, SQL, PySpark, AWS S3, Glue, Athena, Redshift, Lambda, API Gateway, IAM, Power BI"],
  ["Modelling", "Training, explaining and checking models", "scikit-learn, XGBoost, DataRobot AutoML, SHAP, PyTorch, Hugging Face, LoRA / QLoRA, Amazon SageMaker"],
  ["Retrieval and agents", "Grounding answers and coordinating tools", "Microsoft Foundry, MCP, LangChain, LangGraph, LlamaIndex, CrewAI, AutoGen, AWS Bedrock, FAISS, Qdrant, Pinecone, Milvus, Chroma, reranking"],
  ["Documents", "Turning PDFs into structured records", "Amazon Textract, PaddleOCR, spaCy, PostgreSQL"],
  ["Serving and operations", "Running it, watching it, shipping changes", "FastAPI, Docker, Redis, Amazon ECS, CloudWatch, Azure Container Apps, Azure App Service, GitHub Actions, pytest"],
  ["Interfaces", "The screens people actually use", "Next.js, React, TypeScript, Tailwind CSS"],
];

const TIMELINE: { when: string; role: string; org: string; points: string[] }[] = [
  {
    when: "Oct 2021 – now",
    role: "Data Scientist",
    org: "Sunray Construction Solutions",
    points: [
      "Design and ship machine-learning and OCR systems for document-heavy legal workflows.",
      "Build the dashboards the operations team uses to track work-order volume, processing time and throughput.",
      "Since 2024, most of my work has been generative AI for the same workflows: retrieval, agents and the evaluation around them.",
    ],
  },
  {
    when: "Jan 2021",
    role: "Post Graduate Program in AI and Machine Learning",
    org: "McCombs School of Business, UT Austin (via Great Learning)",
    points: ["The formal grounding in statistics, ML and deep learning I'd been learning piecemeal on the job."],
  },
  {
    when: "2019 – 2021",
    role: "Research Analyst",
    org: "Sunray Construction Solutions",
    points: [
      "Analysed operational and customer data to support business and product decisions.",
      "Learned the domain: notices, deadlines, liens and the documents behind them. That knowledge shapes everything I build now.",
    ],
  },
];

const LABEL_STYLE: Record<string, string> = {
  Built: "text-[var(--text)] border-[var(--border-strong)]",
  Deployed: "text-[var(--accent)] border-[var(--accent)]",
  Synthetic: "text-[#92400e] border-[#d97706]",
  Target: "text-[var(--muted)] border-[var(--border-strong)] border-dashed",
  Blueprint: "text-[var(--muted)] border-[var(--border-strong)] border-dashed",
};

function Label({ children }: { children: string }) {
  return (
    <span className={`inline-block shrink-0 rounded-[var(--radius-xs)] border px-1.5 py-0.5 font-mono text-[10.5px] uppercase leading-4 tracking-[.08em] ${LABEL_STYLE[children] ?? LABEL_STYLE.Built}`}>
      {children}
    </span>
  );
}

function Section({ id, label, title, intro, children }: { id: string; label: string; title: ReactNode; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="chapter scroll-mt-16 border-t border-[var(--border)] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <header className="mb-12 sm:mb-16">
            <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">{label}</p>
            <h2 className="!mt-4 max-w-[24ch] text-[clamp(2.25rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-.02em]">{title}</h2>
            {intro && <p className="!mt-5 max-w-[66ch] text-[17px] leading-[1.65] text-[var(--muted)]">{intro}</p>}
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function ExtLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const external = href.startsWith("http");
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={`inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline ${className}`}>
      {children}
      {external && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
    </a>
  );
}

function FeaturedProject({ item }: { item: Featured }) {
  const project = projects.find((p) => p.id === item.id)!;
  return (
    <article className="surface-card grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <a href={`/projects/${item.id}`} className="block border-b border-[var(--border)] bg-[var(--navy)] lg:border-b-0 lg:border-r" aria-label={`${project.title} case study`}>
        <img src={item.poster} alt="" loading="lazy" className="aspect-video h-full w-full object-cover" />
      </a>
      <div className="p-6 sm:p-8">
        <p className="font-mono text-[12px] uppercase tracking-[.1em] text-[var(--muted)]">{project.category} · {project.stack.slice(0, 3).join(" · ")}</p>
        <h3 className="!mt-3 text-[clamp(1.5rem,2.4vw,1.875rem)] font-semibold leading-tight tracking-[-.015em]">{project.title}</h3>
        <p className="!mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-[var(--muted)]">{item.summary}</p>
        <ul className="!mt-6 space-y-2.5 border-t border-[var(--border)] pt-5">
          {item.evidence.map(([text, label]) => (
            <li key={text} className="flex items-start gap-3 text-[15px] leading-6">
              <Label>{label}</Label>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="!mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          {item.links.map((link, i) => (
            <ExtLink key={link.href} href={link.href} className={i === 0 ? "text-[var(--accent)]" : "text-[var(--text)]"}>{link.label}{i === 0 && " →"}</ExtLink>
          ))}
        </div>
      </div>
    </article>
  );
}

function Work() {
  const featuredIds = new Set(FEATURED.map((f) => f.id));
  const blueprints = projects.filter((p) => !featuredIds.has(p.id));
  return (
    <Section
      id="projects"
      label="Work"
      title="Three systems with code, a deployment and a demo."
      intro="These are the projects I can show end to end. Each one runs on generated data rather than customer records, and the case studies say exactly what was measured and what wasn't."
    >
      <div className="grid gap-6">
        {FEATURED.map((item) => (
          <Reveal key={item.id}><FeaturedProject item={item} /></Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div>
          <h3 className="text-[22px] font-semibold tracking-[-.01em]">Blueprints</h3>
          <p className="!mt-3 text-[15px] leading-6 text-[var(--muted)]">
            Architecture write-ups. Some draw on work I&apos;ve done at Sunray, but none has public code yet, so any figure in them is a target, not a result.
          </p>
        </div>
        <ul className="border-t border-[var(--border-strong)]">
          {blueprints.map((p) => (
            <li key={p.id}>
              <a href={`/projects/${p.id}`} className="group grid gap-x-6 gap-y-1 border-b border-[var(--border)] py-5 sm:grid-cols-[minmax(0,1fr)_auto]">
                <span>
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-[17px] font-semibold group-hover:text-[var(--accent)]">{p.title}</span>
                    <Label>Blueprint</Label>
                  </span>
                  <span className="mt-1 block max-w-[68ch] text-[15px] leading-6 text-[var(--muted)]">{p.goal}</span>
                </span>
                <span className="font-mono text-[12px] leading-6 text-[var(--faint)] sm:max-w-[22rem] sm:text-right">{p.flow}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="about" label="About" title="Construction operations first, then data, then AI.">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <figure>
          <img src="/gopalakrishna.jpg" alt="Gopalakrishna Maddipalli" loading="lazy" className="aspect-[4/5] w-full rounded-[var(--radius-md)] border border-[var(--border)] object-cover" />
          <figcaption className="mt-3 font-mono text-[12px] uppercase tracking-[.1em] text-[var(--muted)]">India</figcaption>
        </figure>
        <div className="max-w-[66ch] space-y-5 text-[17px] leading-[1.7] text-[var(--muted)]">
          <p>
            <span className="text-[var(--text)]">I joined Sunray Construction Solutions in 2019 as a research analyst.</span> The job was the
            unglamorous side of construction payment protection: notices, deadlines, liens and the stacks of documents behind them.
          </p>
          <p>
            In 2021 I finished the AI/ML program at UT Austin and moved into data science at the same company. I built OCR and machine-learning
            systems for legal documents, and the dashboards the operations team uses to track work orders.
          </p>
          <p>
            Since 2024 most of my work has been generative AI: retrieval, agents and the evaluation around them. The domain years matter
            more than the tools. I know where a work order stalls, which mistakes cost money and where a person has to stay in the loop.
          </p>
          <dl className="!mt-10 grid gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-3">
            {[
              ["Workflow first", "I map the real process before choosing a model."],
              ["Evaluation is the product", "Tests, review queues and failure handling ship with the feature."],
              ["Plain code decides", "Models propose. Deterministic code and people make the call."],
            ].map(([title, copy]) => (
              <div key={title}>
                <dt className="text-[15px] font-semibold text-[var(--text)]">{title}</dt>
                <dd className="mt-1.5 text-[15px] leading-6">{copy}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" label="Experience" title="Seven years in one domain.">
      <ol className="relative max-w-[60rem] border-l border-[var(--border-strong)] pl-8 sm:pl-10">
        {TIMELINE.map((item) => (
          <li key={item.when + item.role} className="relative pb-12 last:pb-0">
            <span aria-hidden="true" className="absolute -left-[37px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] sm:-left-[45px]" />
            <p className="font-mono text-[12px] uppercase tracking-[.1em] text-[var(--muted)]">{item.when}</p>
            <h3 className="!mt-2 text-[22px] font-semibold tracking-[-.01em]">{item.role}</h3>
            <p className="text-[15px] text-[var(--muted)]">{item.org}</p>
            <ul className="!mt-4 max-w-[66ch] list-disc space-y-1.5 pl-5 text-[16px] leading-[1.6] text-[var(--muted)] marker:text-[var(--faint)]">
              {item.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Stack() {
  return (
    <Section id="skills" label="Stack" title="Tools, grouped by the job they do.">
      <dl className="border-t border-[var(--border-strong)]">
        {STACK.map(([group, job, items]) => (
          <div key={group} className="grid gap-x-10 gap-y-2 border-b border-[var(--border)] py-6 md:grid-cols-[16rem_minmax(0,1fr)]">
            <dt>
              <span className="block text-[17px] font-semibold">{group}</span>
              <span className="block text-[14px] text-[var(--muted)]">{job}</span>
            </dt>
            <dd className="max-w-[70ch] text-[16px] leading-[1.7]">{items}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Credentials() {
  const [primary, ...rest] = certifications;
  const topBadges = credlyBadges.slice(0, 5);
  const moreBadges = credlyBadges.slice(5);
  return (
    <Section id="certifications" label="Credentials" title="Training, with links you can check.">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-[15px] font-semibold uppercase tracking-[.06em] text-[var(--muted)]">Education</h3>
          <a href={primary[2]} target="_blank" rel="noreferrer" className="surface-card !mt-4 block p-6">
            <span className="block text-[19px] font-semibold leading-snug">{primary[0]}</span>
            <span className="mt-2 block text-[15px] text-[var(--muted)]">{primary[1]}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--accent)]">Verify <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </a>
        </div>
        <div>
          <h3 className="text-[15px] font-semibold uppercase tracking-[.06em] text-[var(--muted)]">Verified badges</h3>
          <ul className="!mt-4 border-t border-[var(--border)]">
            {topBadges.map((badge) => (
              <li key={badge.name} className="border-b border-[var(--border)]">
                {badge.url ? (
                  <a href={badge.url} target="_blank" rel="noreferrer" className="group flex items-baseline justify-between gap-4 py-3.5">
                    <span><span className="text-[16px] font-medium group-hover:text-[var(--accent)]">{badge.name}</span> <span className="text-[14px] text-[var(--muted)]">· {badge.issuer} · {badge.issued}</span></span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="block py-3.5"><span className="text-[16px] font-medium">{badge.name}</span> <span className="text-[14px] text-[var(--muted)]">· {badge.issuer} · {badge.issued}</span></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <details className="group mt-10 border-t border-[var(--border-strong)]">
        <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[16px] font-semibold">
          {moreBadges.length} more badges and {rest.length} course certificates
          <span aria-hidden="true" className="font-mono text-[18px] text-[var(--muted)] group-open:hidden">+</span>
          <span aria-hidden="true" className="hidden font-mono text-[18px] text-[var(--muted)] group-open:inline">−</span>
        </summary>
        <ul className="grid gap-x-10 md:grid-cols-2">
          {moreBadges.map((badge) => (
            <li key={badge.name} className="border-t border-[var(--border)] py-3.5">
              {badge.url ? (
                <a href={badge.url} target="_blank" rel="noreferrer" className="group block"><span className="text-[15px] font-medium group-hover:text-[var(--accent)]">{badge.name}</span><span className="block text-[13px] text-[var(--muted)]">{badge.issuer} · {badge.issued} · Credly badge</span></a>
              ) : (
                <span className="block"><span className="text-[15px] font-medium">{badge.name}</span><span className="block text-[13px] text-[var(--muted)]">{badge.issuer} · {badge.issued}</span></span>
              )}
            </li>
          ))}
          {rest.map(([name, meta, url]) => {
            const unavailable = url.includes("leapsdata.analyttica.com");
            return (
              <li key={name} className="border-t border-[var(--border)] py-3.5">
                {unavailable ? (
                  <span className="block"><span className="text-[15px] font-medium">{name}</span><span className="block text-[13px] text-[var(--muted)]">{meta} · issuer&apos;s verification page is offline</span></span>
                ) : (
                  <a href={url} target="_blank" rel="noreferrer" className="group block"><span className="text-[15px] font-medium group-hover:text-[var(--accent)]">{name}</span><span className="block text-[13px] text-[var(--muted)]">{meta}</span></a>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </Section>
  );
}

function Writing() {
  const formatDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return (
    <Section id="writing" label="Writing" title="Notes from building these systems.">
      <ul className="border-t border-[var(--border-strong)]">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group grid gap-2 border-b border-[var(--border)] py-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
              <span className="font-mono text-[12px] uppercase leading-7 tracking-[.08em] text-[var(--muted)]">{formatDate(post.date)}</span>
              <span>
                <span className="block text-[20px] font-semibold leading-snug group-hover:text-[var(--accent)]">{post.title}</span>
                <span className="mt-1.5 block max-w-[68ch] text-[16px] leading-[1.6] text-[var(--muted)]">{post.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="mt-8 inline-flex items-center gap-1 text-[15px] font-medium text-[var(--accent)] underline-offset-4 hover:underline">All writing →</Link>
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
      setStatus("Check your name, email and message (at least 10 characters).");
      return;
    }
    setSending(true);
    setStatus("Sending…");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message, company }) });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "Message delivery failed.");
      form.reset();
      setStatus("Sent. I'll reply by email.");
    } catch (error) {
      setStatus(error instanceof Error ? `${error.message} You can also email me directly.` : "That didn't go through. Please email me directly.");
    } finally {
      setSending(false);
    }
  }
  return (
    <Section
      id="contact"
      label="Contact"
      title="Hiring for applied AI, or building software for construction?"
      intro="I'd like to hear about it. Email is the fastest way to reach me."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-3 text-[clamp(1.25rem,2.2vw,1.625rem)] font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            <Mail className="h-5 w-5" aria-hidden="true" /> {EMAIL}
          </a>
          <ul className="!mt-8 border-t border-[var(--border)] text-[16px]">
            {[["LinkedIn", LINKEDIN], ["GitHub", "https://github.com/gopalgk53"], ["Résumé (PDF)", "/Gopalakrishna_Maddipalli_CV.pdf"]].map(([label, href]) => (
              <li key={label} className="border-b border-[var(--border)]">
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="flex items-center justify-between py-4 font-medium hover:text-[var(--accent)]">
                  {label} <ArrowUpRight className="h-4 w-4 text-[var(--faint)]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} aria-describedby="contact-form-description" className="surface-card p-6 sm:p-8">
          <p id="contact-form-description" className="text-[15px] text-[var(--muted)]">Or leave a message here and it lands in my inbox.</p>
          <div className="hidden" aria-hidden="true">
            <label>
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="!mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-[14px] font-medium">Name<input name="name" autoComplete="name" maxLength={80} required className="field mt-2" /></label>
            <label className="text-[14px] font-medium">Email<input name="email" type="email" autoComplete="email" maxLength={254} required className="field mt-2" /></label>
          </div>
          <label className="!mt-5 block text-[14px] font-medium">Message<textarea name="message" placeholder="What are you working on?" rows={5} minLength={10} maxLength={3000} required className="field mt-2 resize-y" /></label>
          <div className="!mt-6 flex flex-wrap items-center gap-4">
            <button disabled={sending} className="btn-pill btn-pill--solid">{sending ? "Sending…" : "Send message"}</button>
            <span role="status" aria-live="polite" className="text-[14px] text-[var(--muted)]">{status}</span>
          </div>
        </form>
      </div>
    </Section>
  );
}

export function Portfolio() {
  return (
    <>
      <Work />
      <About />
      <Experience />
      <Stack />
      <Writing />
      <Credentials />
      <Contact />
      <footer className="border-t border-[var(--border)] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 text-[13px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Gopalakrishna Maddipalli</p>
          <nav aria-label="Site meta links" className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/blog" className="hover:text-[var(--accent)]">Writing</Link>
            <Link href="/changelog" className="hover:text-[var(--accent)]">Changelog</Link>
            <Link href="/api-docs" className="hover:text-[var(--accent)]">API</Link>
            <Link href="/security" className="hover:text-[var(--accent)]">Security</Link>
            <a href="/llms.txt" className="hover:text-[var(--accent)]">llms.txt</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
