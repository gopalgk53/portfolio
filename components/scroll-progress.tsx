"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

// A thin fixed bar tracking real scroll position through the page —
// framer-motion's useScroll already drives page-level effects elsewhere
// (hero.tsx, prompt-playground.tsx), so this reuses the same mechanism
// rather than a second scroll listener. useSpring smooths it so it doesn't
// visually stutter on trackpad/wheel scroll; skipped entirely under
// prefers-reduced-motion, same gating as cursor-glow/page-transition.
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: .001 });

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="no-print fixed left-0 top-0 z-[250] h-[3px] w-full bg-white/[.06]">
      <motion.div className="h-full w-full" style={{ scaleX: smoothed, transformOrigin: "0% 50%", background: "var(--gradient-accent)" }} />
    </div>
  );
}
