import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "typed-decisions-not-paragraphs")!;
const SOURCE_URL = "https://typesafe.ai/blog/introducing-system-one-models-and-jev";

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date },
};

const CODE = `from dataclasses import dataclass
from enum import Enum


class GCResolution(Enum):
    MATCHES_RECORD = "matches_record"
    CONFLICT_PRESERVE = "conflict_preserve"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


@dataclass(frozen=True)
class Decision:
    value: GCResolution
    probability: float   # calibrated confidence from the decision model
    sources: tuple[str, ...]


# Stricter threshold where a wrong call is expensive.
THRESHOLDS = {
    GCResolution.MATCHES_RECORD: 0.95,
    GCResolution.CONFLICT_PRESERVE: 0.80,
    GCResolution.INSUFFICIENT_EVIDENCE: 0.0,  # always safe to stop
}


def route(decision: Decision) -> str:
    """The policy lives in code; the model only proposes a decision."""
    if decision.probability < THRESHOLDS[decision.value]:
        return "escalate_to_human"
    if decision.value is GCResolution.CONFLICT_PRESERVE:
        return "cc_first_confirmation_path"
    if decision.value is GCResolution.INSUFFICIENT_EVIDENCE:
        return "request_missing_evidence"
    return "continue_research"`;

function H2({ children }: { children: string }) {
  return <h2 id={sectionId(children)} className="!mt-16 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-[2rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.08rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function List({ items }: { items: [string, string][] }) {
  return (
    <ul className="mt-5 space-y-3 text-[1.02rem] leading-8 text-[var(--muted)]">
      {items.map(([lead, rest]) => (
        <li key={lead} className="flex gap-3">
          <span aria-hidden="true" className="mt-[.8rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span><strong className="font-semibold text-[var(--text)]">{lead}</strong> {rest}</span>
        </li>
      ))}
    </ul>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="!mt-10 text-lg font-semibold tracking-tight">{children}</h3>;
}

export default function TypedDecisionsPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="site-subpage article-subpage min-h-screen text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "Gemini 4 Argon", "Agentic system design"]} sections={["What Jev actually is", "Why decision tasks need structure", "Where this meets work I've already shipped", "A blueprint for putting a decision model into an agent pipeline", "A sketch of the decision boundary", "Where this fits on this site", "Let's talk"]}>
        <header>
          <p className="eyebrow">Agentic system design · {date}</p>
          <h1 className="mt-4 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            Typed decisions, <span className="text-gradient-accent">not paragraphs.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">What Jev gets right about agentic systems.</p>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <P>Most agent failures I&apos;ve debugged weren&apos;t reasoning failures. They were parsing failures.</P>
        <P>
          The model wrote a good paragraph. Then the software downstream had to guess what it meant, whether it was
          sure, and what to do next.
        </P>
        <P>
          TypeSafe AI&apos;s new model, <strong className="font-semibold text-[var(--text)]">Jev</strong>, starts from the
          opposite end. Instead of writing text you then have to parse, it returns a typed decision with a probability
          attached. It&apos;s a small idea with large consequences for how we design agent systems.
        </P>

        <H2>What Jev actually is</H2>
        <P>
          TypeSafe calls Jev the first of its &ldquo;System One&rdquo; models. The name borrows from fast, intuitive
          thinking: quick, structured calls rather than long deliberation.
        </P>
        <P>The contract is simple:</P>
        <List
          items={[
            ["Input:", "unstructured state, meaning documents, records and context."],
            ["Output:", "a value from a set of options defined in advance, plus a probability for that value."],
            ["Training:", "a method TypeSafe calls Reinforcement Learning for Calibrated Decisions (RLCD). It's aimed at probabilities that are honest, rather than at answers people prefer."],
          ]}
        />
        <P>TypeSafe describes the product as a frontier-intelligence function call.</P>
        <P>
          TypeSafe reports large speed and cost gains over general-purpose LLMs on these tasks. It quotes response
          times of 70 to 500 milliseconds. These are the vendor&apos;s own benchmarks from an early-access release, and
          its announcement discusses their limits openly. I&apos;d treat them as promising, not settled.
        </P>

        <H2>Why decision tasks need structure</H2>
        <P>Much of what we call &ldquo;agentic AI&rdquo; is actually a string of small decisions:</P>
        <ul className="mt-5 space-y-2 border-l-2 border-[var(--accent)] pl-5 text-[1.02rem] leading-8 text-[var(--muted)]">
          <li>Is this record complete?</li>
          <li>Do these two sources agree?</li>
          <li>Which of four categories does this project fall into?</li>
          <li>Is the evidence strong enough to go on, or should a human take over?</li>
        </ul>
        <P>
          General-purpose LLMs answer these in prose. Then we write fragile code to pull a decision out of the prose.
          Then we bolt on a confidence score the model was never trained to produce.
        </P>
        <P>
          That&apos;s the gap Jev targets. If the set of possible outputs is fixed and the probability is calibrated, the
          step where prose gets translated into a decision disappears.
        </P>

        <H2>Where this meets work I&apos;ve already shipped</H2>
        <P>I&apos;ve been building toward the same idea from the application side, without a model like Jev.</P>
        <P>
          In <Link href="/projects/nto-operations-copilot" className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] underline-offset-4">NTO Operations Copilot</Link>,
          a research coach for Notice to Owner researchers, every answer follows one fixed format: Answer, Why and Next
          step. When a customer&apos;s claim conflicts with a recorded document, the system doesn&apos;t pick a winner. It
          keeps both, labels where each came from, and sends the case down an approved escalation path.
        </P>
        <P>
          In my <Link href="/projects/multi-agent" className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] underline-offset-4">work-order orchestration</Link> project,
          a deterministic Python layer decides what happens next. The AI agents propose; the code decides.
        </P>
        <P>
          Both are the same instinct: <strong className="font-semibold text-[var(--text)]">don&apos;t let prose drive the
          workflow.</strong> Jev moves that instinct into the model itself.
        </P>

        <H2>A blueprint for putting a decision model into an agent pipeline</H2>
        <P>
          This is how I&apos;d approach adding a typed decision model to an agent pipeline. It&apos;s a design plan, not a
          report of a finished integration.
        </P>
        <H3>Ingestion: state the decision before choosing a model</H3>
        <List
          items={[
            ["Write out the output type first.", "Every allowed value, including NEEDS_HUMAN_REVIEW."],
            ["Label where each input came from:", "customer claim, official record, or a system-generated value."],
            ["Keep the model read-only", "and restricted to approved tools, like the read-only MCP boundary in NTO Copilot."],
          ]}
        />
        <H3>Optimization: send each task to the right tool</H3>
        <List
          items={[
            ["Fast, typed decisions", "go to a System One-style model."],
            ["Explanations and open-ended questions", "stay with a general LLM."],
            ["Hard rules", "stay in plain code. No model should decide a legal deadline."],
          ]}
        />
        <H3>Validation: decide what &ldquo;sure enough&rdquo; means</H3>
        <List
          items={[
            ["Set a confidence threshold", "for each decision type, based on how costly a mistake is."],
            ["Below the threshold, hand off to a human.", "Don't retry until the output looks better."],
            ["Check the probabilities against real outcomes.", "A calibration claim is worth only as much as your own measurements."],
          ]}
        />

        <H2>A sketch of the decision boundary</H2>
        <P>
          This is an illustrative sketch of the pattern, not Jev&apos;s API. TypeSafe&apos;s early-access interface may
          look different.
        </P>
        <pre className="mt-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[12.5px] leading-6 text-[var(--navy-text)] sm:p-6">
          <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{CODE}</code>
        </pre>
        <P>
          The model returns a typed value with a probability. Plain code turns that into the next step. A human handles
          everything the code doesn&apos;t clear.
        </P>

        <H2>Where this fits on this site</H2>
        <P>
          My portfolio follows the same rule as my systems: <strong className="font-semibold text-[var(--text)]">clear
          structure, stated uncertainty, no inflated claims.</strong>
        </P>
        <P>
          Every case study separates what&apos;s implemented from what&apos;s a target. The goal is the same one Jev aims
          for at the model level: output a reader, or a machine, can rely on without guessing.
        </P>

        <H2>Let&apos;s talk</H2>
        <P>
          If you&apos;re designing agent systems where a wrong decision costs real money, where autonomy should stop is
          the most important design question.
        </P>
        <P>
          I&apos;d like to compare notes. Connect with me on LinkedIn and tell me where your agents still depend on prose
          to make decisions.
        </P>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">Connect on LinkedIn ↗</a>
          <Link href="/#contact" className="btn-pill btn-pill--outline">Discuss a system</Link>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-[13px] leading-6 text-[var(--faint)]">
          Source: TypeSafe AI, <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--accent)]">Introducing System One models and Jev</a> (28 September 2026).
          Performance figures are TypeSafe&apos;s own early-access claims. I have not used Jev in the projects linked above.
        </footer>
      </ArticleShell>
    </main>
  );
}
