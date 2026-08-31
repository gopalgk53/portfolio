import type { Metadata } from "next";
import Link from "next/link";
import { changelog } from "../../lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "A real record of how this portfolio has shipped and evolved, pulled from its own merged pull requests.",
  alternates: { canonical: "/changelog", types: { "application/rss+xml": "/changelog/feed.xml" } },
};

const TAG_COLOR: Record<string, string> = {
  Feature: "text-[var(--accent)] border-[var(--accent)]/40",
  Fix: "text-[#8fae90] border-[#8fae90]/40",
  Polish: "text-[var(--muted)] border-[var(--border-strong)]",
  Redesign: "text-[#c9a25a] border-[#c9a25a]/40",
  Infra: "text-[var(--faint)] border-[var(--border-strong)]",
};

export default function ChangelogPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Changelog navigation">
        <Link href="/">GK / AI systems</Link>
        <span>Changelog · {changelog.length} entries</span>
      </nav>
      <header className="px-5 pt-20 sm:px-10 sm:pt-28">
        <p className="eyebrow">Build log · 2026</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[.95] tracking-tight">
          What actually <span className="text-[var(--accent)]">shipped.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
          A real record pulled from this site&apos;s own merged pull requests — not marketing copy. Each entry
          links to the actual PR on GitHub.
        </p>
        <a href="/changelog/feed.xml" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.1em] text-[var(--faint)] hover:text-[var(--accent)]">
          RSS feed ↗
        </a>
      </header>
      <section className="mx-auto mt-16 max-w-3xl border-t border-[var(--border)] px-5 pb-32 sm:px-10">
        {changelog.map((entry) => (
          <a
            key={entry.pr}
            href={`https://github.com/gopalgk53/portfolio/pull/${entry.pr}`}
            target="_blank"
            rel="noreferrer"
            className="glow-card flex flex-col gap-3 border-b border-[var(--border)] py-6 sm:flex-row sm:items-center sm:gap-6"
          >
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.12em] text-[var(--faint)] sm:w-28">{entry.date}</span>
            <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.1em] sm:w-24 sm:justify-center ${TAG_COLOR[entry.tag] || "text-[var(--muted)] border-[var(--border-strong)]"}`}>
              {entry.tag}
            </span>
            <span className="flex-1 text-sm leading-6 text-[var(--text)]">{entry.title}</span>
            <span className="shrink-0 font-mono text-[10px] text-[var(--faint)]">PR #{entry.pr} ↗</span>
          </a>
        ))}
      </section>
      <footer className="case-footer">
        <p>End of log / {changelog.length} shipped changes</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
