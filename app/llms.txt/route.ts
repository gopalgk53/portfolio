import { certifications, projects, skills } from "../../lib/data";

// A machine-readable summary for AI crawlers/agents, per the llms.txt
// convention (llmstxt.org) — generated straight from the same lib/data.ts
// the rest of the site renders from, so it can never drift into claiming
// something the actual page content doesn't.
export const dynamic = "force-static";

const BASE = "https://gopalakrishnagenai.in";

function build() {
  const projectLines = projects
    .map((project) => `- [${project.title}](${BASE}/projects/${project.id}): ${project.goal} (${project.category}. Stack: ${project.stack.join(", ")}.)`)
    .join("\n");
  const skillLines = skills.map((group) => `- ${group.group}: ${group.items.join(", ")}`).join("\n");
  const certLines = certifications.map(([name, issuer]) => `- ${name} — ${issuer}`).join("\n");

  return `# Gopalakrishna Maddipalli — Generative AI Engineer

> Portfolio of a Generative AI Engineer based in India, focused on production-grade RAG systems, multi-agent orchestration, and applied LLM engineering. Seven years of prior construction operations and data science experience inform a workflow-first approach to Generative AI.

Figures on this site labelled "target" are project targets, not verified production results — see each case study for details.

## Projects
${projectLines}

## Skills
${skillLines}

## Certifications
${certLines}

## API
- [/api/projects](${BASE}/api/projects): all projects as JSON
- [/api/skills](${BASE}/api/skills): all skill groups as JSON
- [/api/certifications](${BASE}/api/certifications): all certifications as JSON
- Full docs: ${BASE}/api-docs

## Contact
- Email: gopalgk53@yahoo.com
- Résumé: ${BASE}/Gopalakrishna_Maddipalli_CV.pdf
- Site: ${BASE}
`;
}

export async function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
