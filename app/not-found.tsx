import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="404 navigation">
        <Link href="/">GK / AI systems</Link>
        <span>Error · 404</span>
      </nav>
      <div className="flex flex-1 flex-col justify-center px-5 py-24 sm:px-10">
        <p className="eyebrow">Retrieval miss</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(3rem,9vw,7rem)] font-semibold leading-[.9] tracking-tight">
          No document matched<br /><span className="text-[var(--accent)]">this query.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
          That page doesn&apos;t exist, or moved. The retriever came back empty — try one of these instead.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-pill btn-pill--solid">Back to systems</Link>
          <Link href="/projects" className="btn-pill btn-pill--outline">Browse case studies</Link>
          <Link href="/changelog" className="btn-pill btn-pill--outline">View changelog</Link>
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[.1em] text-[var(--faint)]">
          Tip: press ⌘K (or Ctrl+K) on the homepage to jump anywhere.
        </p>
      </div>
    </main>
  );
}
