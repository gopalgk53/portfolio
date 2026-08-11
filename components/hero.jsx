"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const spring = { type: "spring", stiffness: 200, damping: 25 };
const skills = ["RAG systems", "autonomous agents", "LLMOps", "multimodal AI"];

function Background() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(104,231,255,.10),transparent_38%),radial-gradient(circle_at_90%_65%,rgba(154,124,255,.09),transparent_32%)]" />
      <div className="absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <motion.div
        className="absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]"
        animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 36, 0], scale: [1, 1.18, 1] }}
        transition={{ ...spring, duration: 14, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[8%] right-[7%] h-80 w-80 rounded-full bg-violet-500/10 blur-[110px]"
        animate={reduceMotion ? undefined : { x: [0, -55, 0], y: [0, -45, 0], scale: [1, 1.12, 1] }}
        transition={{ ...spring, duration: 16, repeat: Infinity }}
      />
      <div className="noise absolute inset-0 opacity-[.025]" />
    </div>
  );
}

function SkillTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % skills.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-flex min-w-[9.5rem] overflow-hidden align-bottom text-white sm:min-w-[12rem]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={skills[index]}
          className="inline-block"
          initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
          transition={spring}
        >
          {skills[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[.08] bg-[#050507]/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="font-semibold tracking-[-.03em]">Gopalakrishna<span className="text-cyan-300">.AI</span></a>
          <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            {["About", "Projects", "Experience", "Contact"].map((item) => (
              <motion.a key={item} href={`#${item.toLowerCase()}`} whileHover={{ y: -2, color: "#f7f7f8" }} transition={spring}>{item}</motion.a>
            ))}
          </div>
          <motion.a href="#contact" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring} className="rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-xs font-medium">Let&apos;s talk</motion.a>
        </div>
      </motion.nav>

      <section id="top" className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8">
        <div className="max-w-5xl">
          <motion.div layoutId="availability" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs text-zinc-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            Available for Generative AI roles
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: .05 }} className="max-w-5xl text-balance text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[6.6rem]">
            Building intelligence that moves from
            <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent"> reasoning to action.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: .1 }} className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
            Generative AI Engineer designing <SkillTicker /> for complex, high-stakes workflows.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: .15 }} className="mt-10 flex flex-wrap gap-3">
            <motion.a href="#projects" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: .98 }} transition={spring} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Explore selected work</motion.a>
            <motion.a href="/Gopalakrishna_Maddipalli_CV.pdf" whileHover={{ y: -3 }} whileTap={{ scale: .98 }} transition={spring} className="rounded-full border border-white/15 bg-white/[.04] px-5 py-3 text-sm font-semibold backdrop-blur-md">Download CV</motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
