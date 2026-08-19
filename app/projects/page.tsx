import Link from "next/link";
import { projects } from "../../lib/data";

export const metadata = { title: "Generative AI Project Case Studies" };

export default function ProjectsIndex() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] px-5 py-20 text-[#ece9e2]">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-mono text-xs text-[#83878c]">
          ← Portfolio
        </Link>
        <h1 className="mt-10 text-5xl font-bold tracking-[-.03em]">Engineering case studies.</h1>
        <p className="mt-5 max-w-2xl text-[#83878c]">Blueprint architectures with explicit goals, system flows, technology decisions, and evidence status.</p>
        <div className="mt-12 grid gap-px bg-white/[.08] md:grid-cols-2">
          {projects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}/`} className="border-t border-white/[.14] bg-white/[.015] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[.1em] text-[#6c7075]">CASE_{String(i + 1).padStart(2, "0")} · Blueprint</p>
              <h2 className="mt-4 text-xl font-semibold">{p.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#83878c]">{p.goal}</p>
              <span className="mt-6 inline-block text-xs text-[var(--accent)]">Read case study ↗</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
