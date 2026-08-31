import { certifications, projects, skills } from "./data";

// One shared citation vocabulary used by the AI assistant, the site search
// reranker, and their frontends: ids are type-prefixed (project:<real id> /
// skill:<index> / cert:<index>) so a type never has to be trusted separately
// from the id — it's derived by splitting the id itself, then checked
// against the real corpus. An id either resolves to something real from
// lib/data.ts or it's dropped; nothing downstream renders an unresolved id.
export type SourceType = "project" | "skill" | "certification";
export type SourceRef = { id: string; type: SourceType };
export type SourceDisplay = { title: string; subtitle: string; href: string; external?: boolean };

export const TYPE_LABEL: Record<SourceType, string> = { project: "Project", skill: "Skill", certification: "Credential" };

const knownProjectIds = new Set(projects.map((project) => project.id));
const knownSkillIndices = new Set(skills.map((_, i) => i));
const knownCertIndices = new Set(certifications.map((_, i) => i));

export function resolveSourceId(rawId: string): SourceRef | null {
  const separatorIndex = rawId.indexOf(":");
  if (separatorIndex < 0) return null;
  const prefix = rawId.slice(0, separatorIndex);
  const rest = rawId.slice(separatorIndex + 1);
  if (prefix === "project" && knownProjectIds.has(rest)) return { id: rawId, type: "project" };
  if (prefix === "skill" && knownSkillIndices.has(Number(rest))) return { id: rawId, type: "skill" };
  if (prefix === "cert" && knownCertIndices.has(Number(rest))) return { id: rawId, type: "certification" };
  return null;
}

export function resolveSourceDisplay(ref: SourceRef): SourceDisplay | null {
  const rest = ref.id.slice(ref.id.indexOf(":") + 1);
  if (ref.type === "project") {
    const p = projects.find((item) => item.id === rest);
    if (!p) return null;
    return { title: p.title, subtitle: p.impact, href: `/projects/${p.id}` };
  }
  if (ref.type === "skill") {
    const group = skills[Number(rest)];
    if (!group) return null;
    return { title: group.group, subtitle: group.items.slice(0, 4).join(", "), href: "#skills" };
  }
  const cert = certifications[Number(rest)];
  if (!cert) return null;
  const [name, meta, url] = cert;
  return { title: name, subtitle: meta, href: url, external: true };
}

// A compact "id = name" index handed to the model so it can cite real items
// by their real id — never invented, never a title it paraphrased itself.
export function buildCitationIndex() {
  const projectLines = projects.map((project) => `project:${project.id} = ${project.title}`).join("\n");
  const skillLines = skills.map((group, i) => `skill:${i} = ${group.group}`).join("\n");
  const certLines = certifications.map(([name], i) => `cert:${i} = ${name}`).join("\n");
  return `${projectLines}\n${skillLines}\n${certLines}`;
}
