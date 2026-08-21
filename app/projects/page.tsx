import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "../../lib/data";

export const metadata: Metadata = {
  title: "Generative AI Project Case Studies",
  description: "Nine Generative AI, agentic AI, machine learning, document intelligence, and data engineering architecture blueprints.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndex() {
  return (
    <main id="main-content" tabIndex={-1} className="case-archive min-h-screen bg-[#080909] text-[#ece9e2]">
      <nav className="case-nav" aria-label="Case study navigation">
        <Link href="/">GK / AI systems</Link>
        <span>Archive · 09 systems</span>
      </nav>
      <header className="case-index-hero">
        <p className="eyebrow">Architecture archive · 2026</p>
        <h1>Systems<br /><span>in context.</span></h1>
        <div className="case-index-intro">
          <p>Nine engineering blueprints spanning retrieval, agents, document intelligence, predictive systems, and data infrastructure.</p>
          <p>Goals and target outcomes are labelled explicitly. No target is presented as a verified production result.</p>
        </div>
      </header>
      <section className="case-index-list" aria-label="Project case studies">
        {projects.map((project, index) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="case-index-row">
            <span className="case-index-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="case-index-copy">
              <span className="case-index-category">{project.category}</span>
              <strong>{project.title}</strong>
              <small>{project.goal}</small>
            </span>
            <span className="case-index-impact">{project.impact}</span>
            <span className="case-index-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      <footer className="case-footer">
        <p>End of archive / nine systems</p>
        <Link href="/#contact">Discuss a system ↗</Link>
      </footer>
    </main>
  );
}
