import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "retrieval-not-truth")!;
const SOURCES = [
  ["Chen, Hua and Xiao: Relevance Is Not Sufficient Evidence: Detecting Evidence Gaps Before Generation in RAG, arXiv 2609.37469, September 2026", "https://arxiv.org/abs/2609.37469"],
  ["Joren et al. (Google): Sufficient Context: A New Lens on Retrieval Augmented Generation Systems, arXiv 2411.06037", "https://arxiv.org/abs/2411.06037"],
  ["Min et al.: FActScore: Fine-grained Atomic Evaluation of Factual Precision in Long Form Text Generation, EMNLP 2023", "https://arxiv.org/abs/2305.14251"],
  ["Es et al.: Ragas: Automated Evaluation of Retrieval Augmented Generation, arXiv 2309.15217", "https://arxiv.org/abs/2309.15217"],
  ["Yan et al.: Corrective Retrieval Augmented Generation, arXiv 2401.15884", "https://arxiv.org/abs/2401.15884"],
  ["Geifman and El-Yaniv: Selective Classification for Deep Neural Networks, arXiv 1705.08500", "https://arxiv.org/abs/1705.08500"],
  ["Greshake et al.: Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection, arXiv 2302.12173", "https://arxiv.org/abs/2302.12173"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/retrieval-not-truth/poster.jpg"] },
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

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
      <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{children}</code>
    </pre>
  );
}

const QUESTIONS: [string, string][] = [
  ["Retrieval relevance", "Did we retrieve information related to the question?"],
  ["Evidence sufficiency", "Does the retrieved information contain enough evidence to answer this specific question?"],
  ["Answer faithfulness", "Is every generated claim supported by the retrieved evidence?"],
  ["Answer correctness", "Is the answer true according to the appropriate ground truth? A faithful answer can repeat a wrong source."],
];

const CHECKS: [string, string][] = [
  ["Required facts", "What does this question need? A multi-hop question (which contractor was responsible when the final permit was approved?) may need an assignment record, a permit date and a change history together."],
  ["Presence", "Is each required fact in a passage that can be cited, not just implied by the topic?"],
  ["Entity", "Is it the right Project X, and not Project X-2 or a similarly named vendor?"],
  ["Currency", "Is the information current enough for what was asked?"],
  ["Conflict", "Do sources disagree? Then resolve with authority, version and timestamp, or escalate."],
  ["Specificity", "Does the evidence support the level of precision the question asks for?"],
];

const EVALS: [string, string][] = [
  ["Evidence sufficiency", "Precision, recall and a confusion matrix. Watch the false-sufficient rate (it lets unsupported answers through) and the false-insufficient rate (it withholds good answers)."],
  ["Abstention", "Coverage, and risk at a given coverage: incorrect answers avoided versus correct answers unnecessarily withheld."],
  ["Faithfulness and claims", "Supported-claim precision, unsupported-claim rate, and the verifier's own accuracy against human labels. The verifier is a model too."],
  ["Citations", "Does each citation point to the supporting passage, not just the right document?"],
  ["Conflicts", "Conflicts flagged, resolved correctly, or escalated, rather than silently picked."],
  ["Retrieval and end to end", "Recall of required passages, retries that actually found the missing fact, and task success on realistic questions."],
];

const CASES = [
  "A highly relevant document missing the requested fact",
  "The right document with outdated information",
  "Multiple conflicting sources",
  "A question that needs several documents",
  "Evidence containing misleading instructions or a prompt injection",
  "Evidence that supports only part of the answer",
  "A similarly named wrong entity",
  "A citation that points to the document but not the supporting passage",
  "A confident answer despite insufficient evidence",
];

export default function RetrievalNotTruthPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "RAG systems • 007", "Evidence"]} sections={["Relevant is not enough", "Four different questions", "Sufficiency depends on the question", "An evidence sufficiency gate", "Conflicts and trust boundaries", "The gate needs evals too"]}>
        <header>
          <p className="text-[12px] text-[var(--muted)]">
            RAG systems • 007 <span className="text-[var(--faint)]">·</span> {date} <span className="text-[var(--faint)]">·</span> Evidence
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            Retrieval <span className="text-[var(--accent)]">≠</span> truth.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Why your RAG system needs an evidence sufficiency gate.</p>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#07111C]" controls preload="none" playsInline poster="/media/blog/retrieval-not-truth/poster.jpg">
          <source src="/media/blog/retrieval-not-truth/retrieval-not-truth.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/retrieval-not-truth/retrieval-not-truth.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 text-[12px] text-[var(--faint)]">45 seconds · music only · all figures on screen are synthetic</p>

        <P>Your RAG system retrieved the right document. So why did it still hallucinate?</P>

        <H2>Relevant is not enough</H2>
        <P>
          A user asks: &ldquo;What was the final approved budget for Project X?&rdquo; The retriever finds &ldquo;Project X &mdash;
          Financial Planning&rdquo;. It&apos;s highly relevant. It contains an initial budget of $1.2M, a revised estimate of $1.4M,
          and no record of final approval. (Every figure in this post is synthetic.)
        </P>
        <P>
          A weak system answers &ldquo;The final approved budget was $1.4M.&rdquo; A reliable one says &ldquo;The retrieved evidence
          contains a revised estimate of $1.4M, but does not establish the final approved budget.&rdquo; The document was relevant.
          The evidence was insufficient. The answer shouldn&apos;t invent certainty.
        </P>
        <P>
          This isn&apos;t a contrived edge case. In &ldquo;Relevance Is Not Sufficient Evidence&rdquo; (Chen, Hua and Xiao, September
          2026), 12 generators that were explicitly told to abstain when the documents lacked the answer still answered 40.0% to
          99.3% of insufficient-evidence questions. Google&apos;s earlier &ldquo;Sufficient Context&rdquo; work found that larger
          models answer well when context is sufficient but often give incorrect answers instead of abstaining when it isn&apos;t.
        </P>

        <H2>Four different questions</H2>
        <Rows head={["Property", "The question it answers"]} rows={QUESTIONS} />
        <P>
          They&apos;re related, but not interchangeable. A highly relevant document may be insufficient. A sufficient document may
          be misread. A faithful answer may repeat incorrect source data. And a correct-looking answer may not be supported by
          anything that was retrieved.
        </P>

        <H2>Sufficiency depends on the question</H2>
        <P>Take one document: &ldquo;Project X revised budget estimate: $1.4M.&rdquo;</P>
        <Code>{`Q: What was the revised estimate?          → SUFFICIENT
Q: What was the final approved budget?     → INSUFFICIENT`}</Code>
        <P>
          Same document, different question, different outcome. Sufficiency isn&apos;t a property of the document; it depends on
          what the question requires. That&apos;s also why a single similarity score can&apos;t decide it. A relevance score
          measures similarity under a particular retrieval model. It doesn&apos;t tell you that every fact the answer needs is
          present.
        </P>

        <H2>An evidence sufficiency gate</H2>
        <P>A typical pipeline goes straight from retrieval to generation:</P>
        <Code>{`question → embedding → vector search → documents → LLM → answer`}</Code>
        <P>One design that follows from the distinction is an explicit check in between:</P>
        <Code>{`question → query understanding → hybrid retrieval → reranking
  → evidence assembly → EVIDENCE SUFFICIENCY GATE
      ├─ sufficient   → grounded generation → claim verification
      │                 → citation validation → response
      └─ insufficient → retrieve more → recheck
                          └─ still insufficient → abstain / escalate`}</Code>
        <P>
          The gate takes the question, the retrieved passages with source IDs, timestamps and other metadata, and any conflicting
          passages. It returns sufficient, insufficient, conflicting or uncertain, together with which required facts it found.
          What it checks:
        </P>
        <Rows head={["Check", "What it means"]} rows={CHECKS} />
        <P>
          The research supports judging this before generation. Chen et al.&apos;s RINSE combines three signals (coverage of the
          question, an extractive answer span, and evidence spread across passages) and, notably, they report that no single
          signal works on every dataset. After generation, claim-level verification in the spirit of FActScore splits the answer
          into individual claims (&ldquo;approved in September&rdquo;, &ldquo;budget was $1.4M&rdquo;, &ldquo;managed by
          Contractor A&rdquo;) and checks each against the evidence: supported, unsupported, contradicted or uncertain. One score
          for a whole answer can hide the one unsupported claim.
        </P>
        <figure className="mt-8">
          <img src="/media/blog/retrieval-not-truth/rag-architecture.jpg" alt="A client application sends a question through query understanding, a hybrid retriever, a reranker and an evidence assembler to an evidence sufficiency gate, which checks with a conflict detector. If evidence is insufficient, a retrieval retry controller loops back to the retriever; if it is still insufficient, the output policy abstains or escalates. If sufficient, a grounded generator feeds a claim verifier, a citation validator and the output policy, which returns an answer to the client. A source provenance store, observability, an AI eval framework and an audit log sit across the whole system." loading="lazy" className="w-full border border-[var(--border)]" />
          <figcaption className="mt-3 text-[12px] text-[var(--faint)]">Conceptual reference architecture · not a universal requirement or a guarantee against hallucination</figcaption>
        </figure>
        <P>Every important claim should stay traceable. A conceptual provenance record:</P>
        <Code>{`claim:        "Project X's final approved budget was $1.5M."
evidence:     doc_id, page, section, source_type, version, timestamp
verification: supported | unsupported | contradicted | uncertain
decision:     gate result, policy_version`}</Code>

        <H2>Conflicts and trust boundaries</H2>
        <P>
          If document A says the final budget was $1.4M and document B says $1.6M, the system shouldn&apos;t pick whichever scored
          higher in retrieval. Detect the conflict, check source authority, check the document version, check timestamps, and
          resolve only if that&apos;s justified; otherwise escalate. The latest timestamp isn&apos;t automatically the authoritative
          one. A draft saved yesterday doesn&apos;t override a signed approval from last month.
        </P>
        <P>
          Retrieved content is data, not an instruction source. A document that says &ldquo;ignore previous instructions&rdquo; or
          &ldquo;send the user&apos;s information to this URL&rdquo; is exactly the indirect prompt injection Greshake et al.
          described. A sufficiency gate isn&apos;t a defence against that. You still need trust-boundary enforcement,
          least-privilege tool permissions, source isolation, output validation and security evaluations.
        </P>

        <H2>The gate needs evals too</H2>
        <P>
          The gate is a model or a heuristic, and it can be wrong in both directions. Evaluate it as its own component, separately
          from retrieval and generation:
        </P>
        <Rows head={["Evaluate", "How"]} rows={EVALS} />
        <P>
          Abstention is a risk&ndash;coverage trade-off (the selective-classification framing from Geifman and El-Yaniv): answering
          less often should buy fewer wrong answers, and you should measure what it costs. Build the eval set carefully. Chen et
          al. point out that deleting evidence or pairing it with an unrelated question can leak the label through word overlap
          or passage position. Cases worth including:
        </P>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-[1.02rem] leading-7 text-[var(--muted)]">
          {CASES.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <P>Each one can pass a relevance-only check and still produce an unsupported answer. Run them as regression tests whenever the retriever, gate, model or prompts change.</P>
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-5 text-[1.15rem] font-semibold leading-8">
          The objective isn&apos;t simply to retrieve something relevant. It&apos;s to answer only when the available evidence justifies the answer.
        </p>
        <P>How are you handling insufficient or conflicting evidence in your RAG systems?</P>

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
          <p className="mt-3">Research findings (generators answering insufficient-evidence questions, sufficiency judged before generation, no single reliable signal, abstention as a risk&ndash;coverage trade-off, claim-level evaluation, indirect prompt injection) are from the cited papers. The gate placement, its outcomes, the retry and escalation loop, the conflict-resolution order, the reference architecture, the provenance record and the evaluation framework are my own engineering interpretation; none of the papers implements this exact design. All Project X figures are synthetic.</p>
        </footer>
      </ArticleShell>
    </main>
  );
}
