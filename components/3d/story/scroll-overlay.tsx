"use client";

import { useEffect, useRef } from "react";
import { ensureGsapReady, ScrollTrigger } from "../../../lib/gsap";
import { CHAPTERS } from "./story-state";
import { storyScrollState } from "./story-state";

/**
 * The scrollable DOM layer. Sits at z-index 10 above the fixed <Canvas>,
 * pointer-events: none on the root so clicks fall through to nothing behind
 * the text; the CTA at the end opts back in with pointer-events: auto. Its
 * real, in-flow height (five 100vh panels) is what makes the page
 * scrollable at all — the "3D camera movement" is really this DOM content
 * scrolling normally while the canvas underneath stays fixed.
 */
export function ScrollOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const gsap = ensureGsapReady();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const masterTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: reduceMotion ? true : 1.4,
        onUpdate: (self) => {
          storyScrollState.progress = self.progress;
          const activeIndex = Math.round(self.progress * (CHAPTERS.length - 1));
          railRef.current?.querySelectorAll<HTMLElement>("[data-rail-dot]").forEach((dot, i) => {
            dot.dataset.active = String(i === activeIndex);
          });
        },
      });

      panelRefs.current.forEach((panel) => {
        if (!panel) return;
        const text = panel.querySelector<HTMLElement>("[data-chapter-text]");
        if (!text) return;

        // One timeline, one ScrollTrigger, three keyframes (in / hold / out).
        // Two independent scrubbed tweens on the same element previously
        // fought each other: whichever ScrollTrigger was created later kept
        // re-rendering its own not-yet-started "from" state (autoAlpha: 0)
        // over the top of the other tween's result on every scroll event,
        // so the fade-in effectively never won. A single timeline has only
        // one render per scroll tick, so there is nothing left to clobber it.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: panel,
              start: "top 80%",
              end: "bottom 20%",
              scrub: reduceMotion ? true : 1,
            },
          })
          .fromTo(text, { autoAlpha: 0, y: reduceMotion ? 0 : 42 }, { autoAlpha: 1, y: 0, ease: "none", duration: 0.35 })
          .to(text, { autoAlpha: 1, y: 0, ease: "none", duration: 0.3 })
          .to(text, { autoAlpha: 0, y: reduceMotion ? 0 : -32, ease: "none", duration: 0.35 });
      });

      return () => masterTrigger.kill();
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="story-overlay">
      <h1 className="sr-only">A cinematic journey through modern AI systems</h1>
      <a href="/" className="story-home-link font-mono" aria-label="Return to portfolio home">
        GK / Portfolio
      </a>
      <div ref={railRef} className="story-rail" aria-hidden="true">
        {CHAPTERS.map((chapter, i) => (
          <span key={chapter.id} data-rail-dot data-active={i === 0} title={chapter.title} />
        ))}
      </div>

      {CHAPTERS.map((chapter, i) => (
        <section
          key={chapter.id}
          ref={(el) => {
            panelRefs.current[i] = el;
          }}
          className="story-panel"
          aria-label={`Chapter ${chapter.index}: ${chapter.title}`}
        >
          <div className="story-panel-inner" data-chapter-text>
            <span className="story-eyebrow font-mono">
              {chapter.index} // {chapter.kicker}
            </span>
            <h2 className="story-title">{chapter.title}</h2>
            <p className="story-body">{chapter.body}</p>
          </div>
        </section>
      ))}

      <div className="story-panel story-panel--cta">
        <div className="story-panel-inner" data-chapter-text>
          <span className="story-eyebrow font-mono">END // CONTINUE</span>
          <h2 className="story-title story-title--small">See the systems behind it</h2>
          <a href="/#projects" className="story-cta">
            Enter the portfolio →
          </a>
        </div>
      </div>
    </div>
  );
}
