const points: Array<[string, string, string]> = [
  ["01", "I understand the workflow", "Seven years in construction operations taught me where delays, ambiguity, and risk actually enter a process."],
  ["02", "I work comfortably with data", "My foundation includes predictive modelling, explainability, document processing, and practical analytics."],
  ["03", "I design for responsible use", "I treat evaluation, human review, cost, latency, and failure handling as part of the product—not afterthoughts."],
];

export function HiringEvidence() {
  return (
    <section className="relative z-10 border-t border-white/[.1] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">What I bring</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-.03em] sm:text-6xl">Technical work grounded in domain experience.</h2>
        <div className="mt-10 grid gap-px bg-white/[.08] md:grid-cols-3">
          {points.map(([n, title, copy]) => (
            <div key={n} className="border-t border-white/[.14] bg-[#0a0a0b] p-6">
              <span className="font-mono text-xs text-[#6c7075]">{n}</span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#83878c]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
