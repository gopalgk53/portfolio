import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description: "A real, specific account of what this site does with your data — not boilerplate legal copy.",
  alternates: { canonical: "/security" },
};

const sections = [
  {
    title: "There's no database.",
    body: "This site doesn't operate a database or any long-term storage of visitor data. The contact form relays your name, email, and message directly to Resend, which sends it as a real email — it isn't saved anywhere by this site afterward.",
  },
  {
    title: "Rate limits, and what they track.",
    body: "Each interactive feature is rate-limited per visitor to keep it usable for everyone: the AI assistant (30 requests/10 min), Consult mode (15/10 min), site search (30/10 min), the prompt playground (20/10 min), and the contact form (5/15 min). This is tracked by IP address in memory only — never written to disk, never shared, and it resets automatically whenever this app redeploys.",
  },
  {
    title: "AI answers are cached briefly.",
    body: "Assistant, Consult, and search responses are cached in memory for 15 minutes so identical questions don't trigger a fresh model call. The cache holds the question and answer text only, lives in the same ephemeral memory as the rate limits above, and is never persisted.",
  },
  {
    title: "What's sent to the AI model.",
    body: "Your message (plus, for the assistant, the last few turns of that conversation) is sent to OpenRouter to generate a response. No visitor-identifying information — name, email, IP — is included in that request. The system prompts instruct the model to answer only from this site's own published facts, never to invent claims about Gopalakrishna.",
  },
  {
    title: "What stays in your browser.",
    body: "A few preferences live in your browser's local/session storage and never reach any server: your 3D-effects intensity, sound on/off, whether you've seen the intro animation, and the AI assistant's chat history for your current tab session. This site also keeps a short rolling log (last 50) of which links/buttons you click, held in session storage — used for nothing beyond this browser tab, cleared when you close it, and never transmitted anywhere.",
  },
  {
    title: "Analytics.",
    body: "Vercel Analytics and Speed Insights are used for aggregated, cookie-free traffic and performance metrics. Neither sets tracking cookies or builds an individual visitor profile.",
  },
  {
    title: "Security headers, for real.",
    body: "Every response carries a strict Content-Security-Policy, HSTS, X-Frame-Options: DENY, Cross-Origin-Opener-Policy: same-origin, a Permissions-Policy blocking camera/microphone/geolocation/payment/USB access by default, X-Content-Type-Options: nosniff, and a same-origin CSRF check on every API route. You can verify all of this yourself — it's just HTTP response headers, visible in your browser's network tab on any request to this site.",
  },
];

export default function SecurityPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Security and privacy navigation">
        <Link href="/">GK / AI systems</Link>
        <span>Security &amp; privacy</span>
      </nav>
      <header className="px-5 pt-20 sm:px-10 sm:pt-28">
        <p className="eyebrow">Transparency, not boilerplate</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[.95] tracking-tight">
          What this site <span className="text-[var(--accent)]">actually does.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          A specific, accurate account of how this site handles data — every claim below reflects the real,
          current code, not a generic privacy-policy template.
        </p>
      </header>
      <section className="mx-auto mt-16 max-w-3xl space-y-6 border-t border-[var(--border)] px-5 pb-32 pt-12 sm:px-10">
        {sections.map((section) => (
          <article key={section.title} className="glass-panel p-5 sm:p-6">
            <h2 className="text-base font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{section.body}</p>
          </article>
        ))}
        <p className="pt-4 text-xs leading-6 text-[var(--faint)]">
          Questions about any of this? Reach out via the{" "}
          <Link href="/#contact" className="text-[var(--accent)] hover:underline">
            contact section
          </Link>{" "}
          — or read the code yourself at{" "}
          <a href="https://github.com/gopalgk53/portfolio" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
            github.com/gopalgk53/portfolio
          </a>
          .
        </p>
      </section>
      <footer className="case-footer">
        <p>Also on this site: /llms.txt, /api-docs, /changelog</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
