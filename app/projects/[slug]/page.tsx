import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../../lib/data";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}
export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const p = projects.find((x) => x.id === slug);
    return { title: p ? `${p.title} — Case Study` : "Project Case Study", description: p?.goal };
  });
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.id === slug);
  if (!p) notFound();
  const nodes = p.flow.split(" → ");
  return (
    <main className="min-h-screen bg-[#0a0a0b] px-5 py-16 text-[#ece9e2]">
      <article className="mx-auto max-w-4xl">
        <div className="flex flex-wrap gap-4">
          <Link href="/projects/" className="font-mono text-xs text-[#83878c]">
            ← All case studies
          </Link>
          <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="font-mono text-xs text-[var(--accent)]">
            Repository ↗
          </a>
        </div>
        <p className="mt-14 font-mono text-[10px] uppercase tracking-[.16em] text-[#6c7075]">{p.category} · Architecture blueprint</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-.03em] sm:text-6xl">{p.title}</h1>
        <p className="mt-6 text-lg leading-8 text-[#c9cbce]">{p.goal}</p>
        <div className="mt-10 border border-[#c9a25a]/25 bg-[#c9a25a]/[.04] p-5 text-sm leading-7 text-[#83878c]">
          <b className="text-[#d7bd85]">Evidence status:</b> This page documents an engineering blueprint and its intended business outcome. Targets are not represented as verified production benchmarks.
        </div>
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">System architecture</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {nodes.map((n, i) => (
              <span key={n} className="contents">
                <span className="border border-white/[.14] bg-white/[.02] px-4 py-3 font-mono text-xs text-[#c9cbce]">{n}</span>
                {i < nodes.length - 1 && <span className="text-[#4b4e52]">→</span>}
              </span>
            ))}
          </div>
        </section>
        <section className="mt-14 grid gap-5 sm:grid-cols-2">
          <div className="border border-white/[.12] bg-white/[.015] p-6">
            <h2 className="font-semibold">Business objective</h2>
            <p className="mt-4 text-sm leading-7 text-[#83878c]">{p.impact}</p>
          </div>
          <div className="border border-white/[.12] bg-white/[.015] p-6">
            <h2 className="font-semibold">Engineering considerations</h2>
            <p className="mt-4 text-sm leading-7 text-[#83878c]">Evaluation, observability, failure handling, human review, security boundaries, and measurable acceptance criteria.</p>
          </div>
        </section>
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Technology choices</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {p.stack.map((x) => (
              <span key={x} className="border border-white/[.14] px-3 py-2 font-mono text-[10px] text-[#c9cbce]">
                {x}
              </span>
            ))}
          </div>
        </section>
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Next evidence to publish</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-[#83878c]">
            <li>Repository-specific implementation screenshots and exact folder links</li>
            <li>Evaluation dataset and reproducible benchmark procedure</li>
            <li>Failure-case analysis and architecture trade-offs</li>
            <li>Deployment notes, tests, and observed runtime measurements</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
