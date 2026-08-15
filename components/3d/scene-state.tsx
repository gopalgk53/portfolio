"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type SceneDomain = "nlp" | "ml" | "dl" | "agents";

const domainTokens: Record<SceneDomain, { accent: string; glow: string }> = {
  nlp: { accent: "#a855f7", glow: "rgba(168,85,247,.28)" },
  ml: { accent: "#6366f1", glow: "rgba(99,102,241,.28)" },
  dl: { accent: "#6366f1", glow: "rgba(99,102,241,.28)" },
  agents: { accent: "#10b981", glow: "rgba(16,185,129,.28)" },
};

const SceneContext = createContext<SceneDomain>("nlp");

export function SceneProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<SceneDomain>("nlp");

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
        if (candidateDistance < distance) {
          closest = section;
          distance = candidateDistance;
        }
      }
      setActiveDomain((closest.dataset.scene as SceneDomain) || "nlp");
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
    const token = domainTokens[activeDomain];
    document.documentElement.dataset.aiDomain = activeDomain;
    document.documentElement.style.setProperty("--accent-primary", token.accent);
    document.documentElement.style.setProperty("--accent-glow", token.glow);
  }, [activeDomain]);

  const value = useMemo(() => activeDomain, [activeDomain]);
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useSceneDomain() {
  return useContext(SceneContext);
}
