import { useGlowPointer } from "../lib/use-glow-pointer";

const points: Array<[string, string, string]> = [
  ["01", "I understand the workflow", "Seven years in construction operations taught me where delays, ambiguity, and risk actually enter a process."],
  ["02", "I work comfortably with data", "My foundation includes predictive modelling, explainability, document processing, and practical analytics."],
  ["03", "I design for responsible use", "I treat evaluation, human review, cost, latency, and failure handling as part of the product—not afterthoughts."],
];

function EvidenceCard({ n, title, copy }: { n: string; title: string; copy: string }) {
  const glowRef = useGlowPointer<HTMLDivElement>();
  return (
    <div ref={glowRef} className="glass-panel glow-card p-6">
      <span className="font-mono text-xs text-[var(--faint)]">{n}</span>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

export function HiringEvidence() {
  return (
    <section className="relative z-10 border-t border-white/[.1] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">What I bring</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-.03em] sm:text-6xl">Technical work grounded in domain experience.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {points.map(([n, title, copy]) => (
            <EvidenceCard key={n} n={n} title={title} copy={copy} />
          ))}
        </div>
      </div>
    </section>
  );
}
