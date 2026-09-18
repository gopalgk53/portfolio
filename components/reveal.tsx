"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { spring } from "../lib/motion";

// A shared scroll-triggered fade/rise wrapper — a Client Component so it
// can be imported straight into Server Component pages (the case-study
// template, security, api-docs, changelog) and wrap server-rendered
// children, instead of converting those whole pages to the client just to
// get one animation.
//
// This drives the reveal from its own IntersectionObserver rather than
// framer-motion's whileInView. whileInView left content that was already
// in the viewport at page load stuck at opacity 0 — on pages where the
// first card sits above the fold, that meant a visitor who hadn't
// scrolled yet saw blank space. observe() always delivers an initial
// callback for an intersecting element, so the first screen resolves
// without waiting for a scroll that may never come.
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
