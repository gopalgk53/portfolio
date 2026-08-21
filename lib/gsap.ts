"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

// Registers GSAP's ScrollTrigger exactly once per document. Import this
// module (for its side effect) from any client component that builds a
// scroll-bound timeline instead of calling gsap.registerPlugin directly —
// keeps every consumer working against the same singleton plugin instance.
export function ensureGsapReady(): typeof gsap {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };
