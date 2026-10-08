import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "signal-not-a-verdict")!;
const SOURCES = [
  ["OpenAI: Our approach to EU text provenance rules, 5 October 2026", "https://openai.com/index/eu-text-provenance/"],
  ["OpenAI technical report: textGrain, Entropy-Calibrated Watermarking for Language Model Text", "https://cdn.openai.com/pdf/e9508624-d767-41b6-a26d-e34ca798ada6/textgrain-entropy-calibrated-watermarking-for-language-model-text.pdf"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/signal-not-a-verdict/poster.jpg"] },
};

function H2({ children }: { children: string }) {
  return <h2 id={sectionId(children)} className="!mt-16 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-[2rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.08rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function Rows({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border-strong)] text-[12px] text-[var(--faint)]">
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

const QUESTIONS: [string, string][] = [
  ["Provenance", "Where did this content come from? A watermark is one signal that can speak to this."],
  ["Authenticity", "Has the content stayed intact, or been modified? Knowing the origin doesn't answer this."],
  ["Attribution", "Which system or actor produced it? Provenance signals can contribute, but don't prove every attribution claim."],
  ["Truthfulness", "Is the information correct? That needs separate verification."],
];

const STATED: [string, string][] = [
  ["Does not verify accuracy", "It doesn't tell you whether a passage is true, misleading or harmful."],
  ["Absence is not proof of human authorship", "Text may be too short, edited or translated, come from an unsupported model, predate watermarking, or come from another company's tools."],
  ["Does not measure human contribution", "It can indicate an OpenAI system generated or processed part of a passage, not how much human judgment went into it."],
  ["Does not identify the user or establish ownership", "No person, account, prompt or conversation is associated with the text."],
];

const EVAL_CASES: [string, string][] = [
  ["Outcomes", "True positives, false positives, true negatives, false negatives."],
  ["Length", "Short and long text. OpenAI reports detection is lower for shorter and more constrained text."],
  ["Transformations", "Copy and paste, light editing, paraphrasing, translation, partial extraction, formatting changes, mixed human and AI editing."],
  ["Variation", "Domain, model and decoding settings, where they are meaningful for the detector."],
  ["Metrics", "Precision, recall, false-positive rate, false-negative rate, calibration, and robustness per transformation."],
];

export default function SignalNotAVerdictPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "AI systems • 004", "Provenance"]} sections={["What OpenAI announced", "Four different questions", "The dangerous shortcut", "Detection as evidence", "Evaluate the detector"]}>
        <header>
          <p className="text-[12px] text-[var(--muted)]">
            AI systems • 004 <span className="text-[var(--faint)]">·</span> {date} <span className="text-[var(--faint)]">·</span> Provenance
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            A signal is not <span className="text-[var(--accent)]">a verdict.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">What does an AI watermark actually prove?</p>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#07111C]" controls preload="none" playsInline poster="/media/blog/signal-not-a-verdict/poster.jpg">
          <source src="/media/blog/signal-not-a-verdict/signal-not-a-verdict.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/signal-not-a-verdict/signal-not-a-verdict.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 text-[12px] text-[var(--faint)]">45 seconds · music only · examples on screen are illustrative</p>

        <P>AI-generated text is getting invisible watermarks. But a watermark is not a truth detector.</P>

        <H2>What OpenAI announced</H2>
        <P>
          On 5 October 2026 OpenAI described <strong className="font-semibold text-[var(--text)]">textGrain</strong>, a text
          watermark that adds &ldquo;an invisible statistical signal to the model&rsquo;s word choices&rdquo;, which a detector
          then looks for. It is opt-in through the API for select models, off by default, and is coming to ChatGPT and Codex
          output in the EU over the next few weeks. Detector access starts with approved researchers and expert
          organizations rather than the public, and OpenAI says it plans to release the technology as open source.
        </P>
        <P>
          I&apos;m less interested in the product than in the abstraction people will build on top of it. OpenAI is unusually
          direct about what a detection can and can&apos;t tell you:
        </P>
        <Rows head={["OpenAI says a watermark…", "Because"]} rows={STATED} />

        <H2>Four different questions</H2>
        <P>These get blurred together in conversations about AI detection. They aren&apos;t the same question.</P>
        <dl className="mt-6 border-t border-[var(--border-strong)]">
          {QUESTIONS.map(([name, copy]) => (
            <div key={name} className="grid gap-x-6 gap-y-1 border-b border-[var(--border)] py-5 sm:grid-cols-[12rem_1fr]">
              <dt className="font-semibold">{name}</dt>
              <dd className="text-[0.98rem] leading-7 text-[var(--muted)]">{copy}</dd>
            </div>
          ))}
        </dl>
        <P>
          A detected watermark signal speaks to provenance. It leaves authenticity, attribution and truthfulness unresolved.
          Two documents can carry the same signal and differ completely on factual accuracy.
        </P>

        <H2>The dangerous shortcut</H2>
        <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
          <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{`watermark detected  →  AI
no watermark        →  human`}</code>
        </pre>
        <P>
          That turns a probabilistic signal into an oracle. The second line is the riskier one: a document with no detected
          signal is better described as <em>origin: insufficient evidence</em> than as human-written, for exactly the reasons
          OpenAI lists. A signal is not a verdict.
        </P>

        <H2>Detection as evidence</H2>
        <P>
          A sturdier design treats the watermark as one input. Combine it with metadata, signed credentials and generation
          records where they exist (they won&apos;t always), keep the result as evidence rather than a label, and let a policy
          decide what happens next: automation for low-impact, high-confidence cases and human review when the decision is
          high-impact or the evidence is uncertain. That isn&apos;t a universal policy; it&apos;s a way to keep a human in the
          loop where a wrong call is costly.
        </P>
        <figure className="mt-8">
          <img src="/media/blog/signal-not-a-verdict/pipeline.jpg" alt="Content is ingested, then a watermark detector, metadata analysis and signature or credential check feed an evidence store and a provenance engine. Low-risk cases go to automation, high-impact or uncertain cases to human review, and everything lands in an audit log." loading="lazy" className="w-full border border-[var(--border)]" />
          <figcaption className="mt-3 text-[12px] text-[var(--faint)]">Conceptual architecture · not a product design</figcaption>
        </figure>
        <P>Store the context around a detection, not just its outcome. A conceptual record might hold:</P>
        <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
          <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{`content_id, content_hash
detector, detector_version
signal            signal_detected | no_signal_detected | error
confidence        (as reported, and how it is defined)
transformations   none | edited | translated | unknown
supporting_metadata, credentials
policy_version, decision, review_status`}</code>
        </pre>
        <P>
          This is my own sketch, not an OpenAI schema. The point is that detectors, thresholds, policies and models change, so
          a stored result has to stay interpretable later. Never keep only &ldquo;AI = true&rdquo;.
        </P>

        <H2>Evaluate the detector</H2>
        <P>
          Treat the detector like any other production component and test it. OpenAI&apos;s own figures show why: in its
          evaluations on 400-token English passages, replacing 10% of words with synonyms reduced detection from about 92% to
          66%, and replacing 25% reduced it to 17%. Its technical report is also careful that a theoretical false-positive
          guarantee holds under stated assumptions and that a deployed key needs empirical calibration checks.
        </P>
        <Rows head={["Dimension", "Cases"]} rows={EVAL_CASES} />
        <P>Report results per condition rather than as one headline number, and re-run them whenever the detector, key or threshold changes.</P>
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-5 text-[1.15rem] font-semibold leading-8">
          AI provenance should be engineered as an evidence system, not a binary AI detector.
        </p>
        <P>How would you design provenance checks if the decision could affect a student, employee, customer or publication?</P>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">Discuss on LinkedIn ↗</a>
          <Link href="/#contact" className="btn-pill btn-pill--outline">Discuss a system</Link>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-[13px] leading-6 text-[var(--faint)]">
          <p className="text-[12px]">Sources</p>
          <ul className="mt-2 space-y-1">
            {SOURCES.map(([label, href]) => (
              <li key={href}><a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--accent)]">{label}</a></li>
            ))}
          </ul>
          <p className="mt-3">Statements about textGrain, its rollout, detector access and limitations are from OpenAI&apos;s own page and report. The four-question framing, the evidence pipeline, the record and the evaluation cases are my own engineering interpretation, not OpenAI&apos;s design or an industry standard.</p>
        </footer>
      </ArticleShell>
    </main>
  );
}
