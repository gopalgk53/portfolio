"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { PointerEvent, ReactNode, useEffect, useState } from "react";

/**
 * Wraps a button/link and nudges it toward the pointer within a small radius.
 * No-ops on touch devices and under prefers-reduced-motion — this is a
 * desktop hover flourish, not a functional control.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.35,
  range = 60,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  range?: number;
}) {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 22, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(relX, relY);
    if (distance > range) return;
    x.set(relX * strength);
    y.set(relY * strength);
  }
  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={enabled ? { x: springX, y: springY } : undefined}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
