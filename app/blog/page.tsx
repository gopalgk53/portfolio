import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../../components/reveal";
import { posts } from "../../lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on agentic system design, governed AI, and production ML engineering.",
  alternates: { canonical: "/blog" },
};

const formatDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function BlogIndex() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)]/80 text-[var(--text)]">
      <nav className="case-nav" aria-label="Writing navigation">
        <Link href="/">Gopalakrishna · AI Systems</Link>
        <span>Writing · {posts.length} {(posts.length as number) === 1 ? "post" : "posts"}</span>
      </nav>
      <header className="px-5 pt-20 sm:px-10 sm:pt-28">
        <p className="eyebrow">Writing · 2026</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[.95] tracking-tight">
          Notes on <span className="text-gradient-accent">system design.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
          Agentic architecture, governed AI, and production ML, written from the systems I build.
        </p>
      </header>
      <section className="mx-auto mt-16 max-w-3xl border-t border-[var(--border)] px-5 pb-32 sm:px-10">
        {posts.map((post) => (
          <Reveal key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="glow-card flex flex-col gap-2 border-b border-[var(--border)] py-8">
              <span className="text-[13px] text-[var(--faint)]">{formatDate(post.date)} · {post.readingTime}</span>
              <span className="text-xl font-semibold leading-snug tracking-tight">{post.title}</span>
              <span className="text-sm leading-6 text-[var(--muted)]">{post.description}</span>
            </Link>
          </Reveal>
        ))}
      </section>
      <footer className="case-footer">
        <p>End of writing</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
