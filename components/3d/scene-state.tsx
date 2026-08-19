"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { playSceneChord } from "../../lib/sound";

// Which cluster of the AI Knowledge Network should read as "active" while a
// given section is in view. The palette stays a single accent throughout —
// only which nodes light up (and how much) changes between domains.
export type SceneDomain = "identity" | "retrieval" | "agents" | "infra" | "close";

const SceneContext = createContext<SceneDomain>("identity");

export function SceneProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<SceneDomain>("identity");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    if (!sections.length) return;

    const update = () => {
      const focusLine = window.innerHeight * 0.46;
      let closest = sections[0];
      let distance = Number.POSITIVE_INFINITY;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const inside = rect.top <= focusLine && rect.bottom >= focusLine;
        const candidateDistance = inside ? 0 : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        // <= (not <) so that among ties — e.g. a flagship project block
        // nested inside the projects section — the more specific, later
        // element in document order wins.
        if (candidateDistance <= distance) {
          closest = section;
          distance = candidateDistance;
        }
      }
      setActiveDomain((closest.dataset.scene as SceneDomain) || "identity");
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.aiDomain = activeDomain;
  }, [activeDomain]);

  // A short chord marks each scroll-driven scene change, built from a
  // scale shared across every domain so a full scroll session reads as one
  // small, deliberate piece of music rather than a repeated UI beep —
  // silent unless the visitor has turned interface sound on. Skips the
  // very first mount so it only plays on actual transitions.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    playSceneChord(activeDomain);
  }, [activeDomain]);

  const value = useMemo(() => activeDomain, [activeDomain]);
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useSceneDomain() {
  return useContext(SceneContext);
}
