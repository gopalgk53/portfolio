// A curated, real subset of this repo's own merged-PR history — every
// entry below is an actual shipped pull request (see the linked PR), not
// invented copy. Early rapid-iteration PRs from the same exploratory
// sessions are collapsed into their most representative entry so this
// reads as a changelog rather than a raw commit dump; nothing here
// describes work that didn't actually ship.
export type ChangelogEntry = { date: string; title: string; pr: number; tag: string };

export const changelog: ChangelogEntry[] = [
  { date: "2026-08-31", title: "Source citations for the AI assistant — answers now cite the real project, skill, or credential they drew from.", pr: 76, tag: "Feature" },
  { date: "2026-08-30", title: "Site-wide search extended to cover skills and certifications, not just projects.", pr: 75, tag: "Feature" },
  { date: "2026-08-30", title: "Fixed the Interactive Lab and Technical Lab panels getting stuck on \"Loading technical module…\".", pr: 74, tag: "Fix" },
  { date: "2026-08-30", title: "Real LLM-reranked project search, and the AI assistant now drives the architecture diagrams it discusses.", pr: 73, tag: "Feature" },
  { date: "2026-08-30", title: "Polish pass: dark case-outcome panel, cursor glow, page-transition curtain, live GitHub activity badge.", pr: 72, tag: "Polish" },
  { date: "2026-08-29", title: "Futuristic upgrade: larger name treatment, cursor-reactive 3D data clusters, hero agent trace, ⌘K command palette, RAG pipeline stages.", pr: 71, tag: "Feature" },
  { date: "2026-08-26", title: "Premium cinematic redesign: new color system, Inter type, glass/glow UI throughout.", pr: 70, tag: "Redesign" },
  { date: "2026-08-25", title: "Design refresh inspired by antigravity.google's visual language.", pr: 69, tag: "Redesign" },
  { date: "2026-08-23", title: "Velocity-sensitive cursor scatter, touch support, and organic dust drift in the 3D background.", pr: 68, tag: "Polish" },
  { date: "2026-08-22", title: "Interactive Lab wired to a real model; domain clusters stay visible across all sections.", pr: 67, tag: "Feature" },
  { date: "2026-08-22", title: "Per-category 3D motifs added to the Capabilities section.", pr: 63, tag: "Feature" },
  { date: "2026-08-21", title: "Automated quality gate added; assistant and contact APIs hardened against abuse.", pr: 58, tag: "Infra" },
  { date: "2026-08-20", title: "Cinematic redesign extended to individual project case-study pages.", pr: 47, tag: "Redesign" },
  { date: "2026-08-19", title: "Cinematic GenAI portfolio redesign, inspired by EDOLUS.", pr: 42, tag: "Redesign" },
  { date: "2026-08-15", title: "Scroll-driven 3D AI domain experience added to the homepage.", pr: 34, tag: "Feature" },
  { date: "2026-08-13", title: "Editorial visual system redesign.", pr: 29, tag: "Redesign" },
  { date: "2026-08-12", title: "AI portfolio assistant backend added — the first version of Gopal-Bot.", pr: 27, tag: "Feature" },
];
