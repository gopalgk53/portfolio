"use client";

import { useEffect, useState } from "react";
import { ScrollStoryCanvas } from "./scroll-story-canvas";
import { ScrollOverlay } from "./scroll-overlay";
import { StoryPreloader } from "./story-preloader";
import { CHAPTERS } from "./story-state";

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * A plain, non-WebGL fallback for browsers without a usable GPU context.
 * Same chapters, same copy, a simple opacity/translate fade on scroll via
 * CSS scroll-driven animation where supported — no Canvas, no GSAP, no
 * ScrollTrigger, so it never depends on anything the fallback path exists
 * to avoid.
 */
function StaticFallback() {
  return (
    <div className="story-overlay story-overlay--static">
      <h1 className="sr-only">A cinematic journey through modern AI systems</h1>
      <a href="/" className="story-home-link font-mono" aria-label="Return to portfolio home">
        GK / Portfolio
      </a>
      {CHAPTERS.map((chapter) => (
        <section key={chapter.id} className="story-panel" aria-label={`Chapter ${chapter.index}: ${chapter.title}`}>
          <div className="story-panel-inner story-panel-inner--static">
            <span className="story-eyebrow font-mono">
              {chapter.index} // {chapter.kicker}
            </span>
            <h2 className="story-title">{chapter.title}</h2>
            <p className="story-body">{chapter.body}</p>
          </div>
        </section>
      ))}
      <div className="story-panel story-panel--cta">
        <div className="story-panel-inner">
          <a href="/#projects" className="story-cta">
            Enter the portfolio →
          </a>
        </div>
      </div>
    </div>
  );
}

export function StoryExperience() {
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(detectWebgl() && !reduceMotion ? "webgl" : "fallback");
  }, []);

  if (mode === "pending") return null;

  if (mode === "fallback") {
    return <StaticFallback />;
  }

  return (
    <>
      <StoryPreloader />
      <ScrollStoryCanvas />
      <ScrollOverlay />
    </>
  );
}
