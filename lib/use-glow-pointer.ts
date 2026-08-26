"use client";

import { useEffect, useRef } from "react";

// Tracks the pointer inside an element and exposes its position as CSS
// custom properties (--mx/--my), consumed by the .glow-card radial-gradient
// in globals.css. No-ops on touch devices and under prefers-reduced-motion —
// those get a static glow purely from CSS, no listener attached at all.
export function useGlowPointer<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    function onMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      el!.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      el!.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return ref;
}
