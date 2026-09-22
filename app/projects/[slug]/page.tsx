import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../../lib/data";
import { PrintButton } from "../../../components/print-button";
import { PaymentRiskBenchmark } from "../../../components/payment-risk-benchmark";
import { PaymentRiskStory } from "../../../components/payment-risk-story";
import { MultiAgentShowcase } from "../../../components/multi-agent-showcase";
import { PaymentRiskShowcase } from "../../../components/payment-risk-showcase";
import { Reveal } from "../../../components/reveal";

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
  const isPaymentRisk = project.id === "payment-risk";
  const isMultiAgent = project.id === "multi-agent";

  if (isPaymentRisk) {
    return (
      <PaymentRiskShowcase
        goal={project.goal}
        projectIndex={projectIndex}
        totalProjects={projects.length}
        nextProjectId={nextProject.id}
        nextProjectTitle={nextProject.title}
      />
    );
  }

  if (isMultiAgent) {
    return (
      <MultiAgentShowcase
        goal={project.goal}
        projectIndex={projectIndex}
        totalProjects={projects.length}
        nextProjectId={nextProject.id}
        nextProjectTitle={nextProject.title}
      />
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="case-study min-h-screen bg-[var(--bg)]/80 text-[var(--text)]">
      <nav className="case-nav" aria-label="Case study navigation"><Link href="/projects">← Architecture archive</Link><span>Case {String(projectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span></nav>
      <article>
        <header className="case-study-hero">
          <div className="case-study-meta"><p>{project.category}</p><p>{isPaymentRisk ? "Implemented flagship" : "Architecture blueprint"}</p></div>
          <h1>{project.title}</h1>
          <p className="case-study-goal">{project.goal}</p>
          <div className="case-repository-row">
            <a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="case-repository">Inspect repository ↗</a>
            {isPaymentRisk && <a href="https://payment-risk.gopalakrishnagenai.in/" target="_blank" rel="noreferrer" className="case-repository">Open AWS dashboard ↗</a>}
            <PrintButton />
          </div>
        </header>
        <Reveal><section className="case-signal" aria-label="Evidence status"><p className="eyebrow">Evidence status / {isPaymentRisk ? "verified project" : "blueprint"}</p><p>{isPaymentRisk ? "Built with synthetic construction payment-protection data. The model supports operational prioritization and human review; it does not provide legal advice or make automated legal decisions." : "This case study documents an engineering blueprint and its intended business outcome. Targets are not represented as verified production benchmarks."}</p></section></Reveal>
        {isPaymentRisk && <PaymentRiskStory />}
        <Reveal><section className="case-architecture">
          <div className="case-section-heading"><p className="eyebrow">01 / System flow</p><h2>Architecture,<br />step by step.</h2></div>
          <ol className="case-flow">{nodes.map((node, index) => <li key={`${node}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong></li>)}</ol>
        </section></Reveal>
        <Reveal><section className="case-outcome"><p className="eyebrow">02 / {isPaymentRisk ? "Operational purpose" : "Intended outcome"}</p><p>{project.impact}</p></section></Reveal>
        {isPaymentRisk && <PaymentRiskBenchmark />}
        <Reveal><section className="case-engineering">
          <div><p className="eyebrow">{isPaymentRisk ? "04" : "03"} / Technology choices</p><h2>The execution layer.</h2></div>
          <ul>{(isPaymentRisk ? ["AWS S3", "AWS Glue", "Amazon Athena", "AWS IAM", "Amazon SageMaker", "Amazon ECS", "Amazon CloudWatch", "DataRobot AutoML", "SHAP"] : project.stack).map((technology, index) => <li key={technology}><span>{String(index + 1).padStart(2, "0")}</span>{technology}</li>)}</ul>
        </section></Reveal>
        {!isPaymentRisk && <Reveal><section className="case-evidence">
          <p className="eyebrow">04 / Next evidence to publish</p><h2>A blueprint becomes proof through reproducible evidence.</h2>
          <ol><li>Repository-specific implementation screenshots and exact folder links</li><li>Evaluation dataset and reproducible benchmark procedure</li><li>Failure-case analysis and architecture trade-offs</li><li>Deployment notes, tests, and observed runtime measurements</li></ol>
        </section></Reveal>}
        <Reveal><section className="case-evidence">
          <p className="eyebrow">05 / Assumptions &amp; limitations</p><h2>What this case study is — and isn&apos;t.</h2>
          <ol>
            <li>{isPaymentRisk ? "All model development, evaluation, and explanations use synthetic construction payment-protection workflow data; no proprietary company or customer data is represented." : "This page documents an architecture blueprint and its intended outcome, not a monitored, running production deployment with live metrics."}</li>
            <li>
              {isPaymentRisk
                ? "DataRobot used different temporal partitions from the manually engineered Logistic Regression experiment. Its results are a benchmark, not an identical head-to-head comparison."
                : project.impact.toLowerCase().includes("target")
                ? "The impact figure above is a design target set before implementation, not a measured result from real usage."
                : "The impact statement above describes the intended outcome this architecture was designed to produce, not a measured result from real usage."}
            </li>
            <li>{isPaymentRisk ? "The DataRobot feature-effect and SHAP findings are directional only. No unverified magnitude, ranking, or local explanation is claimed." : "Implementation-level specifics not published here — exact prompts, evaluation datasets, latency under real load, failure-mode handling — are exactly the “next evidence to publish” listed above."}</li>
            <li>{isPaymentRisk ? "Logistic Regression v1 remains the production champion at the frozen 0.20 threshold. The DataRobot benchmark is not deployed." : "No claim is made about uptime, accuracy, or performance beyond what’s stated on this page."}</li>
          </ol>
        </section></Reveal>
      </article>
      <footer className="case-next"><p>Next system · {String(((projectIndex + 1) % projects.length) + 1).padStart(2, "0")}</p><Link href={`/projects/${nextProject.id}`}>{nextProject.title}<span aria-hidden="true">→</span></Link></footer>
    </main>
  );
}
