import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "production-failures-regression-tests")!;
const SOURCES = [
  ["CoreWeave press release, 30 Sept 2026", "https://www.coreweave.com/news/coreweave-forge-launches-turning-the-ai-loop-production-run-into-a-better-model-and-agent"],
  ["CoreWeave Forge launch blog", "https://www.coreweave.com/blog/coreweave-forge-turn-ai-iteration-into-compounding-improvement"],
  ["CoreWeave Agent Lens", "https://www.coreweave.com/products/coreweave-forge/agent-lens"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/production-failures/poster.jpg"] },
};

function H2({ children }: { children: ReactNode }) {
  return <h2 className="!mt-16 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.02rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[12.5px] tracking-wide text-[var(--text)]">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span className="border border-[var(--border-strong)] px-2.5 py-1.5">{step}</span>
          {i < steps.length - 1 && <span aria-hidden="true" className="text-[var(--faint)]">→</span>}
        </li>
      ))}
    </ol>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="mt-5 border-l-2 border-[var(--accent)] pl-5 text-[1.02rem] leading-8 text-[var(--text)]">{children}</blockquote>;
}

const FAILURES: [string, string, string][] = [
  ["Hallucination", "an unsupported claim", "Groundedness eval"],
  ["Bad retrieval", "irrelevant evidence", "Retrieval-quality eval"],
  ["Wrong tool", "incorrect selection", "Tool-routing eval"],
  ["Bad tool arguments", "right tool, wrong parameters", "Structured tool-call eval"],
  ["Trajectory failure", "right answer, unsafe or wasteful path", "Trajectory eval"],
  ["Policy violation", "a forbidden action", "Policy eval"],
];

const STACK: [string, string, string][] = [
  ["L6", "System", "latency, cost, reliability, task completion, human escalation"],
  ["L5", "Safety / policy", "authorization, sensitive data, forbidden actions"],
  ["L4", "Trajectory", "a reasonable path, recovery from failure, no needless repetition, workflow constraints"],
  ["L3", "Tools", "correct tool, correct arguments, sequencing, error handling"],
  ["L2", "Retrieval", "recall, precision, evidence relevance, citation correctness"],
  ["L1", "Output", "correctness, relevance, groundedness, completeness"],
];

export default function ProductionFailuresPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)]/80 text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <article className="mx-auto max-w-[44rem] px-5 pb-28 pt-20 sm:px-8 sm:pt-28">
        <header>
          <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">
            CoreWeave Forge <span className="text-[var(--faint)]">|</span> {date} <span className="text-[var(--faint)]">|</span> Agent engineering
          </p>
          <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">
            Your agent&apos;s most valuable dataset is its <span className="text-[var(--accent)]">production failures.</span>
          </h1>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video
          className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#0F172A]"
          controls
          preload="none"
          playsInline
          poster="/media/blog/production-failures/poster.jpg"
        >
          <source src="/media/blog/production-failures/production-failures-loop.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/production-failures/production-failures-loop.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">65 seconds · music only</p>

        <P>
          A failure that ends in a monitoring dashboard teaches the next version nothing. Most agent teams still run the
          lifecycle they inherited from classic ML:
        </P>
        <Flow steps={["Build", "Test", "Deploy", "Monitor"]} />
        <P>
          That shape assumes one output per request and a model that changes rarely. Agents break both assumptions. They
          take dozens of actions per task, and the interesting failures sit in the middle of those actions, not at the
          end. Production behavior has to flow back into the next version on purpose:
        </P>
        <Flow steps={["Run", "Observe", "Curate", "Improve", "Evaluate", "Release", "Repeat"]} />

        <H2>What CoreWeave shipped</H2>
        <P>
          On 30 September 2026 CoreWeave launched Forge, which it describes as a development layer that runs that loop in
          one environment. Three details matter for this argument, quoted from CoreWeave&apos;s own pages:
        </P>
        <Quote>Forge “runs the entire AI loop – run, observe, curate, improve, evaluate and repeat – in one connected environment.”</Quote>
        <Quote>Agent Lens: “Each detected failure becomes a test case in a growing evaluation set. Run a candidate fix against the entire set … and catch regressions before promoting the change to production.”</Quote>
        <Quote>Domain experts tune the LLM judge and review disagreements with human scores “before the judge automatically evaluates every new production trace.”</Quote>
        <P>
          Forge brings together Weights &amp; Biases Models, OpenPipe&apos;s post-training work and the marimo notebook
          project. CoreWeave also publishes its own performance figures; I&apos;ve left them out, because they are vendor
          benchmarks I can&apos;t check. The rest of this piece is my reading of the engineering lesson, and none of it
          depends on using Forge.
        </P>

        <H2>Every failure type maps to an eval</H2>
        <P>The useful move is to name the failure precisely enough that it becomes testable.</P>
        <table className="mt-6 w-full border-collapse text-left text-[0.98rem]">
          <thead>
            <tr className="border-b border-[var(--border-strong)] font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">
              <th className="py-3 pr-4 font-normal">Failure</th>
              <th className="py-3 font-normal">Becomes</th>
            </tr>
          </thead>
          <tbody>
            {FAILURES.map(([failure, detail, evalName]) => (
              <tr key={failure} className="border-b border-[var(--border)] align-top">
                <td className="py-4 pr-4"><span className="font-semibold text-[var(--text)]">{failure}</span><span className="block text-[0.9rem] text-[var(--muted)]">{detail}</span></td>
                <td className="py-4 font-semibold text-[var(--accent)]">{evalName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          The last two rows are the reason final-answer scoring falls short for agents. An agent can land on the right
          answer after calling a tool it had no business calling. A grader that only reads the answer marks that run as a
          pass.
        </P>

        <H2>Evaluate the layers, not just the answer</H2>
        <P>A classic eval is input → model → output → score. An agent run has a plan, tool calls, observations and state in between, and each layer can fail independently.</P>
        <dl className="mt-6 border-t border-[var(--border-strong)]">
          {STACK.map(([level, name, items]) => (
            <div key={level} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[var(--border)] py-4 sm:grid-cols-[3rem_10rem_1fr]">
              <dt className="font-mono text-[13px] text-[var(--accent)]">{level}</dt>
              <dd className="font-semibold">{name}</dd>
              <dd className="col-start-2 text-[0.95rem] leading-7 text-[var(--muted)] sm:col-start-3">{items}</dd>
            </div>
          ))}
        </dl>

        <H2>Software already solved the shape of this</H2>
        <P>Engineers trust one rule: a bug that reached production gets a test, so it can&apos;t ship twice.</P>
        <Flow steps={["Bug", "Reproduce", "Write test", "Fix", "Test passes"]} />
        <P>The AI version adds a trace and a gate:</P>
        <Flow steps={["Failure", "Capture trace", "Reproduce", "Create eval", "Fix", "Regression eval", "Release gate"]} />
        <P>
          <strong className="font-semibold text-[var(--text)]">Every important production failure should be able to become a regression test.</strong>{" "}
          Not every failure deserves one. The ones that recur, cost money or touch policy do.
        </P>

        <H2>Keep the loop controlled</H2>
        <P>
          A feedback loop is not permission for a system to rewrite itself in production. Every improvement still goes
          through dataset curation, engineering review, evaluation, regression testing, security checks and a release
          gate. CoreWeave&apos;s own pages describe curation as human-in-the-loop, which is the right default. The goal is
          an agent that gets better from production under control, release by release.
        </P>
        <P>Which failure type is hardest for your team to turn into a repeatable eval?</P>

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
          <p className="mt-3">Quotes are from CoreWeave. The failure-to-eval mapping, eval stack and controls are my own engineering interpretation and apply with any tooling.</p>
        </footer>
      </article>
    </main>
  );
}
