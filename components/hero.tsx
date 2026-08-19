"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { spring } from "../lib/motion";
import { RevealText } from "./motion/reveal-text";
import { Magnetic } from "./motion/magnetic";
import { AIPromptBar } from "./ai-prompt-bar";

const nav = [
  ["Work", "projects"],
  ["Experience", "experience"],
  ["Stack", "skills"],
  ["About", "about"],
  ["Contact", "contact"],
] as const;

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div data-scene="identity" className="relative min-h-screen overflow-hidden border-b border-white/[.1]">
      <nav className="site-nav" data-scrolled={scrolled}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="font-mono text-sm tracking-[.06em]">
            GK
          </a>
          <div className="hidden items-center gap-8 text-[13px] text-[#a9adb1] md:flex">
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <a href="/Gopalakrishna_Maddipalli_CV.pdf" className="flex items-center gap-1 border-b border-[var(--accent)] pb-0.5 text-[#ece9e2]">
              Résumé <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center border border-white/15 md:hidden">
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring} className="border-t border-white/[.1] bg-[#0a0a0b] px-5 py-4 md:hidden">
              {nav.map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="block border-b border-white/[.08] py-3 text-sm text-[#c9cbce]">
                  {label}
                </a>
              ))}
              <a href="/Gopalakrishna_Maddipalli_CV.pdf" onClick={() => setMenuOpen(false)} className="mt-3 flex items-center gap-1 text-sm text-[#ece9e2]">
                Résumé <ArrowUpRight className="h-3 w-3" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="top" className="typography-shield relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8 sm:pt-36">
        <p className="eyebrow mb-9">Generative AI Engineer · India</p>

        <h1 className="max-w-6xl text-[clamp(2.2rem,11.5vw,10.5rem)] font-semibold leading-[.86] tracking-[-.045em]">
          <RevealText as="span" immediate>
            Gopalakrishna
          </RevealText>
          <span className="mt-1 block text-[clamp(1.8rem,4.6vw,4.4rem)] font-medium tracking-[-.03em] text-[#83878c]">
            <RevealText as="span" immediate delay={0.08}>
              Generative AI Engineer
            </RevealText>
          </span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.22 }} className="mt-10 max-w-xl text-[15px] leading-7 text-[#a9adb1]">
          Building production-grade AI systems with LLMs, RAG, agents, Python &amp; AWS.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Magnetic>
            <a href="#projects" className="flex items-center gap-2 text-sm text-[#ece9e2]">
              Explore my work
              <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowDown className="h-4 w-4 text-[var(--accent)]" />
              </motion.span>
            </a>
          </Magnetic>
          <a href="https://github.com/gopalgk53" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#83878c]">
            GitHub <ArrowUpRight className="h-3 w-3" />
          </a>
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#83878c]">
            LinkedIn <ArrowUpRight className="h-3 w-3" />
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.38 }} className="mt-16 border-t border-white/[.1] pt-8">
          <AIPromptBar />
        </motion.div>
      </section>
    </div>
  );
}
