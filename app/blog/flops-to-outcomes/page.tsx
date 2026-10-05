import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "flops-to-outcomes")!;
const SOURCES = [
  ["Qualcomm press release, 25 June 2026: data center roadmap for the agentic AI era", "https://www.qualcomm.com/news/releases/2026/06/qualcomm-unveils-comprehensive-data-center-roadmap-for-the-agent"],
  ["NVIDIA blog, 15 September 2026: tokens per watt for AI factories", "https://blogs.nvidia.com/blog/ai-infra-summit-vera-rubin-dsx-energy-efficiencies-tokens-per-watt-ai-factories/"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/flops-to-outcomes/poster.jpg"] },
};

function H2({ children }: { children: string }) {
  return <h2 id={sectionId(children)} className="!mt-16 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-[2rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.08rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[12.5px] tracking-wide text-[var(--text)]">
      {steps.map((step, i) => (
        <li key={step + i} className="flex items-center gap-2">
          <span className="border border-[var(--border-strong)] px-2.5 py-1.5">{step}</span>
          {i < steps.length - 1 && <span aria-hidden="true" className="text-[var(--faint)]">→</span>}
        </li>
      ))}
    </ol>
  );
}

const LADDER: [string, string, string][] = [
  ["FLOPS", "Compute capability", "How much arithmetic the hardware can do, peak or sustained depending on how it's reported. Peak FLOPS isn't application performance: memory bandwidth, utilization and the workload decide what you get."],
  ["Tokens / second", "Inference throughput", "How fast a serving setup produces tokens. Only meaningful with its conditions attached: model, hardware, batch size, input and output lengths, serving configuration."],
  ["Tokens / watt", "Energy efficiency", "Throughput relative to power. A useful efficiency measure that still says nothing about whether the answer was right."],
  ["Cost / task", "System economics", "What one complete workflow costs: model calls, retrieval, tool and API calls, retries and the supporting infrastructure."],
  ["Successful tasks / compute", "Outcome efficiency", "How much correct, useful work the system produces for the resources it consumes. A conceptual application metric, not a standard benchmark."],
];

const ROUTES: [string, string][] = [
  ["Complex reasoning, planning, ambiguity", "A capable reasoning model"],
  ["Classification, extraction, routing", "A smaller model"],
  ["Knowledge lookup", "Retrieval"],
  ["Repeated requests", "A cache"],
  ["Strict rules, validation, calculations", "Deterministic code"],
  ["High-impact uncertainty", "Human review"],
];

export default function FlopsToOutcomesPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "AI infrastructure • 001", "Inference"]} sections={["The metric ladder", "Why agents change the equation", "Not every decision needs the biggest model", "Optimize the system for the outcome"]}>
        <header>
          <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">
            AI infrastructure • 001 <span className="text-[var(--faint)]">|</span> {date} <span className="text-[var(--faint)]">|</span> Inference
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            From FLOPS to <span className="text-[var(--accent)]">outcomes.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">What should production AI actually optimize?</p>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#07111C]" controls preload="none" playsInline poster="/media/blog/flops-to-outcomes/poster.jpg">
          <source src="/media/blog/flops-to-outcomes/flops-to-outcomes.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/flops-to-outcomes/flops-to-outcomes.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">45 seconds · music only · numbers on screen are illustrative</p>

        <P>
          We spend a lot of time talking about how powerful AI hardware is. Production AI raises a different question: how
          efficiently are we converting compute into useful work?
        </P>
        <P>
          The industry is already moving past raw compute. Qualcomm describes its new data center products as optimized for
          tokens-per-watt &ldquo;as the key lever to reduce total cost of ownership&rdquo;, and NVIDIA argues the infrastructure metric is
          &ldquo;fast shifting from peak performance to validated agentic tokens per megawatt&rdquo;. I think the useful move is
          to go one or two layers further.
        </P>

        <H2>The metric ladder</H2>
        <P>Each of these measures a different layer. None replaces the one below it.</P>
        <dl className="mt-6 border-t border-[var(--border-strong)]">
          {LADDER.map(([metric, layer, copy], i) => (
            <div key={metric} className="grid gap-x-6 gap-y-1 border-b border-[var(--border)] py-5 sm:grid-cols-[14rem_1fr]">
              <dt>
                <span className="block font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">Level {i + 1} · {layer}</span>
                <span className="mt-1 block font-semibold">{metric}</span>
              </dt>
              <dd className="text-[0.98rem] leading-7 text-[var(--muted)]">{copy}</dd>
            </div>
          ))}
        </dl>

        <H2>Why agents change the equation</H2>
        <P>A chat request is roughly one model call. An agent request looks more like this:</P>
        <Flow steps={["Request", "Plan", "Retrieve", "Reason", "Tool", "Observe", "Re-plan", "Tool", "Verify", "Response"]} />
        <P>
          One user request can turn into several model calls, retrievals, tool invocations and the occasional retry. Tokens,
          power, latency and cost accumulate across all of them. If you only measure tokens per second, an agent that loops
          through four extra large-model calls and a retry looks productive. Cost per task, and how many tasks actually
          succeed for the compute spent, expose it.
        </P>
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-5 text-[1.15rem] font-semibold leading-8">A user request is not one inference call.</p>

        <H2>Not every decision needs the biggest model</H2>
        <P>A system that produces fewer tokens is not worse, and a frontier model is not the right tool for every step. Route each decision to the cheapest component that can do it correctly:</P>
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-strong)] font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">
              <th className="py-3 pr-4 font-normal">Kind of step</th>
              <th className="py-3 font-normal">Better handled by</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map(([a, b]) => (
              <tr key={a} className="border-b border-[var(--border)]">
                <td className="py-4 pr-4 text-[0.98rem] text-[var(--muted)]">{a}</td>
                <td className="py-4 font-semibold">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <figure className="mt-8">
          <img src="/media/blog/flops-to-outcomes/router.jpg" alt="A request goes to a router, which sends complex reasoning to a capable model, classification to a small model, knowledge lookups to retrieval, repeated requests to a cache, strict rules to deterministic code and high-impact uncertainty to human review." loading="lazy" className="w-full border border-[var(--border)]" />
          <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">These are design choices, not universal rules: they depend on the task, the risk and measured quality</figcaption>
        </figure>

        <H2>Optimize the system for the outcome</H2>
        <P>
          Instead of only pushing tokens per second up, it is worth also tracking task success, latency, energy, cost, retries
          and unnecessary model calls, while holding quality, reliability and safety fixed. The interesting optimization target
          may not be the fastest model. It may be the architecture that produces the correct outcome using the least
          unnecessary computation.
        </P>
        <p className="mt-6 text-[1.15rem] font-semibold leading-8">Don&apos;t optimize the model in isolation. Optimize the system for the outcome.</p>
        <P>How are you measuring cost per completed task in your agent systems today, if at all?</P>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">Discuss on LinkedIn ↗</a>
          <Link href="/#contact" className="btn-pill btn-pill--outline">Discuss a system</Link>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-[13px] leading-6 text-[var(--faint)]">
          <p className="font-mono text-[11px] uppercase tracking-[.1em]">Sources</p>
          <ul className="mt-2 space-y-1">
            {SOURCES.map(([label, href]) => (
              <li key={href}><a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--accent)]">{label}</a></li>
            ))}
          </ul>
          <p className="mt-3">Vendor quotes are from Qualcomm and NVIDIA&apos;s own pages; their performance multiples are deliberately left out. The metric ladder, the router and &ldquo;successful tasks per compute&rdquo; are my own engineering framing, not industry standards.</p>
        </footer>
      </ArticleShell>
    </main>
  );
}
