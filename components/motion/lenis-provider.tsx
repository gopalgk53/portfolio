"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Adds the site's cinematic inertial-scroll feel on top of native scrolling.
// Framer Motion's useScroll (used everywhere else in this codebase) reads
// window scroll position, which Lenis keeps in sync by design — no other
// component needs to know this exists. Skipped entirely under
// prefers-reduced-motion, same gate every other motion component here uses.
export function LenisProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.4 });
    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
