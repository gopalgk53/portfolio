import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "agent-runtime-security")!;
const SOURCES = [
  ["NVIDIA newsroom: Open Agent Safety Platform, 28 Sept 2026", "https://nvidianews.nvidia.com/news/open-agent-safety-platform"],
  ["NVIDIA OpenShell documentation: overview", "https://docs.nvidia.com/openshell/latest/about/overview.html"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/agent-runtime-security/poster.jpg"] },
};

function H2({ children }: { children: string }) {
  return <h2 id={sectionId(children)} className="!mt-16 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-[2rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.08rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function Flow({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div className="mt-5">
      <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[var(--faint)]">{label}</p>
      <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[12.5px] tracking-wide text-[var(--text)]">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="border border-[var(--border-strong)] px-2.5 py-1.5">{step}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="text-[var(--faint)]">→</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

const CONTROLS: [string, string][] = [
  ["Agent identity", "Every call is attributable to a specific agent, not just to the user who started it."],
  ["Scoped credentials", "The agent holds the narrowest token that does the job, and it expires."],
  ["Tool-level authorization", "Permission is checked per tool and per operation, with reads and writes kept separate."],
  ["Policy engine", "Allow, deny or escalate is decided by code outside the model, which the model can't talk its way past."],
  ["Runtime sandbox", "Code, files and network egress run inside a boundary the agent can't widen."],
  ["MCP authorization", "Each MCP server checks who is calling and what they may do, rather than trusting the client."],
  ["Human approval", "Consequential writes wait for a person, and the agent can propose but not commit."],
  ["Audit and evals", "Every action is logged so it can be replayed, and security evals run before each release."],
];

const DECISIONS: [string, string, string][] = [
  ["READ DATABASE", "✓ Allow", "text-[var(--accent)]"],
  ["DELETE DATABASE", "✕ Deny", "text-[#b91c1c]"],
  ["UPDATE VERIFIED DATA", "⚠ Human approval", "text-[#b45309]"],
];

export default function AgentRuntimeSecurityPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "Agent runtime security", "Agent engineering"]} sections={["Guidance is not enforcement", "How the architecture changed", "The layers that enforce limits", "Policy decides, one action at a time", "The industry is moving here", "Bounded consequences"]}>
        <header>
          <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">
            Agent runtime security <span className="text-[var(--faint)]">|</span> {date} <span className="text-[var(--faint)]">|</span> Agent engineering
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            A system prompt is not a <span className="text-[var(--accent)]">security boundary.</span>
          </h1>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-start">
          <figure>
            <video className="aspect-[4/5] w-full border border-[var(--border)] bg-[#0F172A]" controls preload="none" playsInline poster="/media/blog/agent-runtime-security/poster.jpg">
              <source src="/media/blog/agent-runtime-security/agent-runtime-security.mp4" type="video/mp4" />
              Your browser can&apos;t play this video. <a href="/media/blog/agent-runtime-security/agent-runtime-security.mp4">Download the MP4</a>.
            </video>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">30 seconds · music only</figcaption>
          </figure>
          <div>
            <p className="text-[1.08rem] leading-8 text-[var(--muted)]">
              Your AI agent can query databases, call APIs, run code, read files and operate tools. What actually stops it from
              doing something it shouldn&apos;t?
            </p>
            <P>For a lot of agents today, the honest answer is a line in the system prompt.</P>
            <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
              <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>SYSTEM: &quot;You may read production data, but never modify it.&quot;</code>
            </pre>
          </div>
        </div>

        <H2>Guidance is not enforcement</H2>
        <P>
          That instruction is useful. It shapes what the model tries to do, and most of the time it works. But it&apos;s a
          request, not a control. Prompt injection, a misread tool result or a plain reasoning error can all lead an agent to
          ignore it, and nothing in the prompt can stop the call once it&apos;s made.
        </P>
        <P>
          We would never give a normal application database-admin credentials and rely on a README that says &ldquo;please
          don&apos;t delete anything&rdquo;. An agent deserves the same treatment, arguably stricter, because its next action is
          decided at runtime rather than written in advance.
        </P>
        <P>
          <strong className="font-semibold text-[var(--text)]">A system prompt tells an agent what it should do. Architecture determines what it is actually allowed to do.</strong>
        </P>

        <H2>How the architecture changed</H2>
        <Flow label="Early LLM apps" steps={["User", "Model", "Answer"]} />
        <Flow label="Early agents" steps={["User", "Agent", "Tools", "Action"]} />
        <Flow label="Production agents" steps={["User", "Authentication", "Agent", "Agent identity", "Policy engine", "Runtime sandbox", "Authorized tools / MCP", "Infrastructure"]} />
        <P>The production version adds audit and observability across every step, so each decision can be traced afterwards.</P>

        <H2>The layers that enforce limits</H2>
        <dl className="mt-6 border-t border-[var(--border-strong)]">
          {CONTROLS.map(([name, copy]) => (
            <div key={name} className="grid gap-x-6 gap-y-1 border-b border-[var(--border)] py-4 sm:grid-cols-[13rem_1fr]">
              <dt className="font-semibold">{name}</dt>
              <dd className="text-[0.98rem] leading-7 text-[var(--muted)]">{copy}</dd>
            </div>
          ))}
        </dl>
        <P>None of these depend on the model behaving well. That&apos;s the point: they still hold when it doesn&apos;t.</P>

        <H2>Policy decides, one action at a time</H2>
        <P>The same agent, with the same prompt, gets three different answers depending on what it is trying to do:</P>
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-strong)] font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">
              <th className="py-3 pr-4 font-normal">Requested action</th>
              <th className="py-3 font-normal">Policy result</th>
            </tr>
          </thead>
          <tbody>
            {DECISIONS.map(([action, result, color]) => (
              <tr key={action} className="border-b border-[var(--border)]">
                <td className="py-4 pr-4 font-mono text-[13px]">{action}</td>
                <td className={`py-4 font-semibold ${color}`}>{result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          The deny happens before the request reaches infrastructure. The approval case is the one teams most often skip:
          an agent that can propose a write but not commit it is far more useful than one that can do neither, and far safer
          than one that can do both.
        </P>

        <H2>The industry is moving here</H2>
        <P>
          On 28 September 2026 NVIDIA announced its Open Agent Safety Platform. It&apos;s built around OpenShell, an
          open-source runtime that runs agents in sandboxes governed by declarative policy. It&apos;s one example of a broader
          shift rather than the only way to do this. Most of the controls above can be built today with ordinary identity,
          policy and container tooling.
        </P>
        <P>
          If 2024 was mostly about prompt engineering and 2025 about agent engineering, the emphasis now is moving to agent
          infrastructure engineering: the layers around the model that decide what it can touch. These aren&apos;t clean
          eras, just where the hard problems have been.
        </P>

        <H2>Bounded consequences</H2>
        <P>
          The safest production agent isn&apos;t necessarily the one that follows every instruction perfectly. It&apos;s the one
          running inside an architecture where its mistakes have bounded consequences.
        </P>
        <P>
          So don&apos;t just ask &ldquo;How intelligent is my agent?&rdquo; Also ask &ldquo;How much authority should it
          have?&rdquo;
        </P>
        <P>As agents become more autonomous, should authorization and sandboxing become standard layers in every production AI architecture?</P>

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
          <p className="mt-3">The NVIDIA details come from NVIDIA&apos;s own announcement and docs. The architecture, controls and policy examples are my own engineering view and apply with any tooling.</p>
        </footer>
      </ArticleShell>
    </main>
  );
}
