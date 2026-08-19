"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Cinematic entry: a black frame with the wordmark and a counting
// percentage, which lifts away like a curtain to unveil the hero.
// Shown once per browsing session; skipped entirely for visitors who
// prefer reduced motion.
export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "exit" | "done">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("gopal-intro-seen") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    const start = performance.now();
    const duration = 1500;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // Ease the counter so it lingers near the start and snaps at the end.
      setProgress(Math.round(Math.pow(p, 0.8) * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem("gopal-intro-seen", "true");
        setPhase("exit");
        window.setTimeout(() => setPhase("done"), 900);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (phase === "done") return null;

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={phase === "exit" ? { y: "-100%" } : { y: "0%" }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[200] grid place-items-center bg-[#0a0a0b]"
    >
      <div className="text-center">
        <p className="text-[clamp(1.6rem,4.5vw,3.2rem)] font-semibold uppercase tracking-[.14em]">Gopalakrishna</p>
        <p className="mt-4 font-mono text-[10px] tracking-[.3em] text-[#6c7075]">{String(progress).padStart(2, "0")}%</p>
      </div>
      <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[.3em] text-[#4b4e52]">Generative AI Engineer</p>
    </motion.div>
  );
}
