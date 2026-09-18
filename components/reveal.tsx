"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "../lib/motion";

// A shared scroll-triggered fade/rise wrapper — a Client Component so it
// can be imported straight into Server Component pages (the case-study
// template) and wrap server-rendered children, instead of converting
// those whole pages to the client just to get one animation.
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
