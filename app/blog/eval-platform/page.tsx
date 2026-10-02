import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "eval-platform")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/eval-platform/poster.jpg"] },
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
        <li key={step} className="flex items-center gap-2">
          <span className="border border-[var(--border-strong)] px-2.5 py-1.5">{step}</span>
          {i < steps.length - 1 && <span aria-hidden="true" className="text-[var(--faint)]">→</span>}
        </li>
      ))}
    </ol>
  );
}

function Rows({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border-strong)] font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">
          <th className="py-3 pr-4 font-normal">{head[0]}</th>
          <th className="py-3 font-normal">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a} className="border-b border-[var(--border)] align-top">
            <td className="py-4 pr-4 font-semibold">{a}</td>
            <td className="py-4 text-[0.98rem] leading-7 text-[var(--muted)]">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const SPLIT: [string, string][] = [
  ["9,700 match known clusters", "Update the existing eval's metadata: frequency, severity, last seen. No new test."],
  ["250 are variations", "Extend an existing eval only if coverage is actually missing."],
  ["49 are low-impact noise", "Monitor; revisit if they recur or escalate."],
  ["1 has no cluster match", "Novelty queue. It is never dropped for having a count of one."],
];

const TRIAGE_FAILURES: [string, string][] = [
  ["False merge", "Two genuinely different failures end up in one cluster."],
  ["False split", "One underlying failure becomes several clusters."],
  ["Missed novelty", "New behaviour is classified as known."],
  ["False novelty", "Known behaviour is escalated as new."],
  ["Bad prioritization", "A critical failure is ranked low."],
  ["Missed promotion", "An important boundary never reaches permanent coverage."],
];

const TIERS: [string, string][] = [
  ["T1 Release gate", "Critical deterministic checks, security boundaries, high-impact regressions, core agent behaviour, mandatory policy. Small, fast, blocking. Runs on every release."],
  ["T2 CI regression", "Known historical failures, tool use, RAG quality, routing, structured output, workflow scenarios. Runs on every change."],
  ["T3 Deep evals", "Long trajectories, adversarial and red-team cases, expensive LLM-as-judge, multi-turn, large retrieval benchmarks. Scheduled or before major releases, usually non-blocking."],
  ["T4 Production discovery", "Traces, drift, unusual trajectories, novel tool use, rare failures. Continuous; its output is the novelty queue."],
];

export default function EvalPlatformPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "AI evals", "LLMOps"]} sections={["Failure to eval cannot be automatic", "Deduplication has a blind spot", "Who triages", "The triage needs evals too", "Tier the suite", "Evals need a lifecycle", "Build a platform, not a pile"]}>
        <header>
          <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">
            AI evals <span className="text-[var(--faint)]">|</span> {date} <span className="text-[var(--faint)]">|</span> LLMOps
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            Your AI eval suite can become <span className="text-[var(--accent)]">technical debt.</span>
          </h1>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#0F172A]" controls preload="none" playsInline poster="/media/blog/eval-platform/poster.jpg">
          <source src="/media/blog/eval-platform/eval-platform.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/eval-platform/eval-platform.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">60 seconds · music only</p>

        <P>
          In <Link href="/blog/production-failures-regression-tests" className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] underline-offset-4">yesterday&apos;s post</Link> I
          argued that production AI failures should become regression opportunities. A fair objection came back: if every
          failure turns into a permanent test, doesn&apos;t the suite eventually become the bottleneck?
        </P>
        <P>It does, if the rule is &ldquo;failure → eval&rdquo;.</P>
        <Flow steps={["10", "100", "1,000", "10,000", "100,000 evals"]} />
        <P>
          At that scale you get duplicated tests, slow CI, expensive LLM-as-judge runs, stale and flaky evals, and a release
          gate nobody trusts.
        </P>

        <H2>Failure to eval cannot be automatic</H2>
        <P>The step between a failure and an eval has to be triage, not a copy:</P>
        <Flow steps={["Failure", "Fingerprint", "Known / novel", "Risk", "Human review if needed", "Promote", "Tier"]} />
        <P>Take an illustrative batch of 10,000 production failures:</P>
        <Rows head={["Group", "What happens"]} rows={SPLIT} />
        <P>Ten thousand failures, and possibly one new test.</P>

        <H2>Deduplication has a blind spot</H2>
        <P>
          A failure that appears once has no cluster to join, and a frequency-based filter quietly drops it. That one case might
          be a new attack pattern, an authorization gap, an unusual RAG failure or a tool behaviour nobody has seen before.
          That isn&apos;t always true, since many singletons are noise. But it&apos;s the reason frequency alone shouldn&apos;t
          decide promotion.
        </P>
        <p className="mt-8 border-l-2 border-[var(--accent)] pl-5 text-[1.25rem] font-semibold leading-8">
          Deduplication controls volume. Novelty detection protects coverage.
        </p>
        <P>
          Each failure gets a handful of signals: severity, business impact, recurrence, novelty, safety and security impact,
          customer impact, reproducibility and triage confidence. Combine them however your team decides:
        </P>
        <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
          <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>Risk = f(severity, impact, recurrence, novelty, safety, confidence)</code>
        </pre>
        <P>This is a conceptual framework, not a standard formula. The only rule that matters is that recurrence is one input among several.</P>

        <H2>Who triages</H2>
        <P>
          Both. Automation handles fingerprints, embeddings, clustering, near-duplicate detection, recurrence counts, metadata
          extraction, a first severity guess, novelty scoring and routing. People handle security, safety and policy-sensitive
          cases, novel behaviour, ambiguous cluster assignments, low-confidence calls and the promotion of critical behavioural
          boundaries.
        </P>
        <Flow steps={["Failure", "Automated triage", "Confidence / risk check"]} />
        <P>Known, low-risk cases are handled automatically. Novel or high-risk cases go to a person.</P>

        <H2>The triage needs evals too</H2>
        <P>Once automation decides what gets promoted, the triage step becomes a system with its own failure modes:</P>
        <Rows head={["Triage failure", "What it looks like"]} rows={TRIAGE_FAILURES} />
        <P>Audit a labelled sample of triage decisions on a schedule, and track incidents that an existing cluster should have caught.</P>

        <H2>Tier the suite</H2>
        <P>Not every eval needs to block every deployment.</P>
        <Rows head={["Tier", "Contents and cadence"]} rows={TIERS} />
        <P>A novel, high-risk singleton can earn a place in the release gate. Most promoted cases belong in CI regression.</P>

        <H2>Evals need a lifecycle</H2>
        <Flow steps={["Candidate", "Active", "Critical", "Monitored", "Redundant / stale", "Archived"]} />
        <P>
          Review an eval when it turns redundant, stale, flaky, superseded or too expensive for its tier. Version the suite
          (eval-suite-v1.0, v1.1, v2.0) and keep a record per eval: the behavioural boundary, originating incident, reason added,
          owner, severity, tier, last failure, last review and the model and system versions it ran against. Archiving keeps
          that lineage; it doesn&apos;t delete history. These fields are a suggestion, not a standard schema.
        </P>

        <H2>Build a platform, not a pile</H2>
        <figure className="mt-6">
          <img src="/media/blog/eval-platform/infographic.jpg" alt="Four-layer eval governance platform: production observability, failure intelligence, eval governance and evaluation execution, with security, cost, observability, governance and auditability rails." loading="lazy" className="w-full max-w-[40rem] border border-[var(--border)]" />
          <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--faint)]">Conceptual reference architecture · not a product or standard</figcaption>
        </figure>
        <P>
          Evals start to look like any other test platform: lifecycle, versioning, ownership, observability, cost controls and
          release policy.
        </P>
        <p className="mt-6 text-[1.15rem] font-semibold leading-8">
          The challenge isn&apos;t collecting more evals. It&apos;s preserving the right behavioral boundaries without allowing
          the evaluation system itself to become the bottleneck.
        </p>
        <P>How are you deciding which production failures deserve permanent regression coverage?</P>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">Discuss on LinkedIn ↗</a>
          <Link href="/#contact" className="btn-pill btn-pill--outline">Discuss a system</Link>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-[13px] leading-6 text-[var(--faint)]">
          All counts are illustrative. The triage signals, tiers, lifecycle states and record fields are my own engineering
          framework, not an industry standard, and they apply with any tooling.
        </footer>
      </ArticleShell>
    </main>
  );
}
