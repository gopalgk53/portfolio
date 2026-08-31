import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../../lib/data";
import { PrintButton } from "../../../components/print-button";

export const dynamicParams = false;
export function generateStaticParams() { return projects.map((project) => ({ slug: project.id })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.id === slug);
  if (!project) return { title: "Project Case Study" };
  return { title: `${project.title} — Case Study`, description: project.goal, alternates: { canonical: `/projects/${project.id}` }, openGraph: { title: `${project.title} — Case Study`, description: project.goal, url: `/projects/${project.id}` } };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectIndex = projects.findIndex((item) => item.id === slug);
  const project = projects[projectIndex];
  if (!project) notFound();
  const nodes = project.flow.split(" → ");
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <main id="main-content" tabIndex={-1} className="case-study min-h-screen bg-[#050505] text-white">
      <nav className="case-nav" aria-label="Case study navigation"><Link href="/projects">← Architecture archive</Link><span>Case {String(projectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span></nav>
      <article>
        <header className="case-study-hero">
          <div className="case-study-meta"><p>{project.category}</p><p>Architecture blueprint</p></div>
          <h1>{project.title}</h1>
          <p className="case-study-goal">{project.goal}</p>
          <div className="case-repository-row">
            <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="case-repository">Inspect repository ↗</a>
            <PrintButton />
          </div>
        </header>
        <section className="case-signal" aria-label="Evidence status"><p className="eyebrow">Evidence status / blueprint</p><p>This case study documents an engineering blueprint and its intended business outcome. Targets are not represented as verified production benchmarks.</p></section>
        <section className="case-architecture">
          <div className="case-section-heading"><p className="eyebrow">01 / System flow</p><h2>Architecture,<br />step by step.</h2></div>
          <ol className="case-flow">{nodes.map((node, index) => <li key={`${node}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong></li>)}</ol>
        </section>
        <section className="case-outcome"><p className="eyebrow">02 / Intended outcome</p><p>{project.impact}</p></section>
        <section className="case-engineering">
          <div><p className="eyebrow">03 / Technology choices</p><h2>The execution layer.</h2></div>
          <ul>{project.stack.map((technology, index) => <li key={technology}><span>{String(index + 1).padStart(2, "0")}</span>{technology}</li>)}</ul>
        </section>
        <section className="case-evidence">
          <p className="eyebrow">04 / Next evidence to publish</p><h2>A blueprint becomes proof through reproducible evidence.</h2>
          <ol><li>Repository-specific implementation screenshots and exact folder links</li><li>Evaluation dataset and reproducible benchmark procedure</li><li>Failure-case analysis and architecture trade-offs</li><li>Deployment notes, tests, and observed runtime measurements</li></ol>
        </section>
        <section className="case-evidence">
          <p className="eyebrow">05 / Assumptions &amp; limitations</p><h2>What this case study is — and isn&apos;t.</h2>
          <ol>
            <li>This page documents an architecture blueprint and its intended outcome, not a monitored, running production deployment with live metrics.</li>
            <li>
              {project.impact.toLowerCase().includes("target")
                ? "The impact figure above is a design target set before implementation, not a measured result from real usage."
                : "The impact statement above describes the intended outcome this architecture was designed to produce, not a measured result from real usage."}
            </li>
            <li>Implementation-level specifics not published here — exact prompts, evaluation datasets, latency under real load, failure-mode handling — are exactly the &ldquo;next evidence to publish&rdquo; listed above.</li>
            <li>No claim is made about uptime, accuracy, or performance beyond what&apos;s stated on this page.</li>
          </ol>
        </section>
      </article>
      <footer className="case-next"><p>Next system · {String(((projectIndex + 1) % projects.length) + 1).padStart(2, "0")}</p><Link href={`/projects/${nextProject.id}`}>{nextProject.title}<span aria-hidden="true">→</span></Link></footer>
    </main>
  );
}
