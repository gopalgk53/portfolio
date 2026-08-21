"use client";

// ---------------------------------------------------------------------------
// Shared scroll state for the story canvas. Written once per scroll tick by
// the GSAP ScrollTrigger in <ScrollOverlay>, read every frame inside R3F's
// useFrame loop. Deliberately a plain mutable object rather than React
// state: the camera rig and five chapters all need this value at 60fps and
// none of them should trigger a React re-render to get it.
// ---------------------------------------------------------------------------

export const CHAPTER_COUNT = 5;

export const CHAPTERS = [
  {
    id: "workflow",
    index: "01",
    kicker: "INTEGRATE",
    title: "The AI Workflow",
    body: "Orchestrating unstructured data arrays into continuous, resilient computational pipelines.",
  },
  {
    id: "ml",
    index: "02",
    kicker: "ANALYZE",
    title: "Machine Learning",
    body: "Identifying complex latent structures and self-optimizing statistical patterns at scale.",
  },
  {
    id: "deep-learning",
    index: "03",
    kicker: "COGNITION",
    title: "Deep Learning",
    body: "Multi-layered high-dimensional neural architectures processing abstract cognitive representations.",
  },
  {
    id: "generative",
    index: "04",
    kicker: "CREATION",
    title: "Generative AI",
    body: "Transforming learned multi-dimensional vectors into high-fidelity novel synthesis.",
  },
  {
    id: "agentic",
    index: "05",
    kicker: "AUTONOMY",
    title: "Agentic AI",
    body: "Self-directing execution loops operating with continuous goal-oriented intent and dynamic tools.",
  },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export interface StoryScrollState {
  /** 0 → 1 across the entire pinned scroll track. */
  progress: number;
  /** Per-chapter focus, 0 (out of view) → 1 (centered), one entry per chapter. */
  chapterFocus: number[];
  /** Normalized pointer position in [-1, 1], updated on pointermove. */
  pointer: { x: number; y: number };
  /** Smoothed |d(progress)/dt|, roughly 0 (still) → 1+ (fast scroll). */
  scrollVelocity: number;
}

export const storyScrollState: StoryScrollState = {
  progress: 0,
  chapterFocus: new Array(CHAPTER_COUNT).fill(0),
  pointer: { x: 0, y: 0 },
  scrollVelocity: 0,
};

/** World-space Y distance between two consecutive chapters, given a viewport height in world units. */
export function chapterSpacing(viewportHeight: number): number {
  return viewportHeight * 1.5;
}
