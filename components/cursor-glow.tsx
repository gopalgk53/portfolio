"use client";

import { useEffect, useRef, useState } from "react";

// A soft accent-glow dot that trails the cursor on desktop and grows over
// interactive elements. Supplements — never replaces — the native cursor,
// so it never gets in the way of normal pointer or keyboard use. Desktop
// fine-pointer only, off entirely under prefers-reduced-motion, same
// gating pattern as components/motion/magnetic.tsx.
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      const el = dotRef.current;
      if (el) el.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    };
    const onOver = (event: PointerEvent) => {
      setHovering(!!(event.target as HTMLElement).closest("a,button"));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={`no-print pointer-events-none fixed left-0 top-0 z-[300] rounded-full ${hovering ? "h-12 w-12 opacity-70" : "h-6 w-6 opacity-40"}`}
      style={{
        background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        mixBlendMode: "screen",
        transition: "transform 120ms ease-out, width 220ms ease-out, height 220ms ease-out, opacity 220ms ease-out",
        willChange: "transform",
      }}
    />
  );
}
