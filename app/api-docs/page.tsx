import type { Metadata } from "next";
import Link from "next/link";
import { certifications, projects, skills } from "../../lib/data";

export const metadata: Metadata = {
  title: "API",
  description: "A small, public, read-only JSON API over this portfolio's own project, skill, and certification data.",
  alternates: { canonical: "/api-docs" },
};

const BASE = "https://gopalakrishnagenai.in";

const endpoints = [
  {
    method: "GET",
    path: "/api/projects",
    description: "All project case studies — the same data the Systems section renders.",
    example: JSON.stringify({ count: projects.length, results: [projects[0]] }, null, 2),
  },
  {
    method: "GET",
    path: "/api/skills",
    description: "All skill groups — the same data the Stack section renders.",
    example: JSON.stringify({ count: skills.length, results: [skills[0]] }, null, 2),
  },
  {
    method: "GET",
    path: "/api/certifications",
    description: "All certifications, as { name, issuer, url } — the same data the Credentials section renders.",
    example: JSON.stringify(
      { count: certifications.length, results: [{ name: certifications[0][0], issuer: certifications[0][1], url: certifications[0][2] }] },
      null,
      2,
    ),
  },
];

export default function ApiDocsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="API documentation navigation">
        <Link href="/">GK / AI systems</Link>
        <span>API · {endpoints.length} endpoints</span>
      </nav>
      <header className="px-5 pt-20 sm:px-10 sm:pt-28">
        <p className="eyebrow">Public data API · read-only</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[.95] tracking-tight">
          The same data, <span className="text-[var(--accent)]">as JSON.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Three small, unauthenticated GET endpoints that mirror exactly what this site itself renders — no
          separate database, no hidden fields, nothing beyond what&apos;s already public on the page. There&apos;s no
          write access, no API key required, and — like every route under /api on this site — every response is
          sent with <code className="font-mono text-[11px]">Cache-Control: no-store</code>, so you always get the
          current data.
        </p>
        <p className="mt-4 max-w-2xl font-mono text-[11px] text-[var(--faint)]">Base URL: {BASE}</p>
      </header>
      <section className="mx-auto mt-16 max-w-3xl space-y-6 border-t border-[var(--border)] px-5 pb-32 pt-12 sm:px-10">
        {endpoints.map((endpoint) => (
          <article key={endpoint.path} className="glass-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--accent)]/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-[var(--accent)]">
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-white">{endpoint.path}</code>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{endpoint.description}</p>
            <pre className="mt-4 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/40 p-4 font-mono text-[11px] leading-6 text-[var(--muted)]">
              {endpoint.example}
            </pre>
          </article>
        ))}
      </section>
      <footer className="case-footer">
        <p>Also on this site: /llms.txt for AI crawlers</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
