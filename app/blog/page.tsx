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
    <main id="main-content" tabIndex={-1} className="site-subpage min-h-screen text-[var(--text)]">
      <nav className="case-nav" aria-label="Writing navigation">
        <Link href="/">Gopalakrishna · AI Systems</Link>
        <span>Writing · {posts.length} {(posts.length as number) === 1 ? "post" : "posts"}</span>
      </nav>
      <header className="mx-auto max-w-[92rem] px-5 pt-20 sm:px-10 sm:pt-28">
        <p className="eyebrow">Writing · 2026</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[.95] tracking-tight">
          Notes on <span className="text-gradient-accent">system design.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
          Agentic architecture, governed AI, and production ML, written from the systems I build.
        </p>
      </header>
      <section className="mx-auto mt-16 max-w-[92rem] px-5 pb-32 sm:px-10">
        <div className="border-t border-[var(--border-strong)]">
          {posts.map((post, i) => (
            <Reveal key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group grid gap-3 border-b border-[var(--border)] py-9 md:grid-cols-[12rem_minmax(0,1fr)_2rem] md:gap-10">
                <span className="text-[12px] text-[var(--faint)]">{String(posts.length - i).padStart(2, "0")} | {formatDate(post.date)}<span className="block md:mt-1">{post.readingTime}</span></span>
                <span>
                  <span className="block text-2xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--accent)] md:text-[1.9rem]">{post.title}</span>
                  <span className="mt-3 block max-w-4xl text-[1rem] leading-7 text-[var(--muted)]">{post.description}</span>
                </span>
                <span aria-hidden="true" className="hidden text-xl text-[var(--accent)] transition-transform group-hover:translate-x-1 md:block">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <footer className="case-footer">
        <p>End of writing</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
