// The single source of truth for the site's primary section links —
// shared by the nav bar (components/hero.tsx) and the command palette
// (components/command-palette.tsx) so the two never drift apart.
export const nav = [
  ["Systems", "projects"],
  ["Model lab", "playground"],
  ["Experience", "experience"],
  ["Stack", "skills"],
  ["Contact", "contact"],
] as const;
