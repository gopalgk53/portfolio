"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SoundToggle } from "./sound-toggle";

const nav = [["Systems", "projects"], ["Model lab", "playground"], ["Experience", "experience"], ["Stack", "skills"], ["Contact", "contact"]] as const;

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("top");
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const { scrollYProgress: pageProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const titleScale = useTransform(scrollYProgress, [0, .72], [1, .72]);
  const titleOpacity = useTransform(scrollYProgress, [0, .72, 1], [1, .8, 0]);
  const metaY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 24);
      const focusLine = window.innerHeight * 0.42;
      let current = "top";
      for (const [, id] of nav) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= focusLine) current = id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div ref={sectionRef} data-scene="identity" className="cinematic-hero relative min-h-[145svh] overflow-clip">
      <nav className="site-nav" data-scrolled={scrolled} aria-label="Primary navigation">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 sm:px-8">
          <a href="#top" aria-current={activeId === "top" ? "location" : undefined} className={`font-mono text-[10px] uppercase tracking-[.28em] ${activeId === "top" ? "text-[var(--accent)]" : ""}`}>GK / AI systems</a>
          <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[.12em] text-[#9b9b96] md:flex">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} className={activeId === id ? "text-[var(--accent)]" : undefined}>{label}</a>)}
            <a href="/Gopalakrishna_Maddipalli_CV.pdf" className="flex items-center gap-1 text-[#f0eee7]">Résumé <ArrowUpRight className="h-3 w-3" /></a>
            <SoundToggle className="text-[#9b9b96]" />
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <SoundToggle className="text-[#9b9b96]" />
            <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} className="grid h-10 w-10 place-items-center border border-white/15">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence>{menuOpen && (
          <motion.div id="mobile-navigation" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} className="border-t border-white/10 bg-[#080909] px-5 py-5 md:hidden">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} onClick={() => setMenuOpen(false)} className={`flex items-center justify-between border-b border-white/10 py-4 text-sm uppercase tracking-wider ${activeId === id ? "text-[var(--accent)]" : ""}`}>{label}{activeId === id && <span aria-hidden="true">●</span>}</a>)}
            <a href="/Gopalakrishna_Maddipalli_CV.pdf" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-4 text-sm uppercase tracking-wider">Résumé <ArrowUpRight className="h-4 w-4" /></a>
          </motion.div>
        )}</AnimatePresence>
        <motion.div aria-hidden="true" style={{ scaleX: pageProgress }} className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-[var(--accent)]" />
      </nav>

      <section id="top" className="sticky top-0 flex min-h-svh items-center overflow-hidden px-5 pt-20 sm:px-8">
        <motion.div style={reducedMotion ? undefined : { y: metaY }} className="absolute left-5 top-28 z-20 sm:left-8">
          <p className="font-sans text-[15px] font-medium uppercase leading-6 tracking-[.1em] text-[#f0eee7] sm:text-[17px]">Gopalakrishna Maddipalli</p>
          <p className="mt-1 font-mono text-[9px] uppercase leading-5 tracking-[.18em] text-[#777873]">Generative AI engineer</p>
          <p className="font-mono text-[9px] uppercase leading-5 tracking-[.18em] text-[#777873]">India · 2026</p>
        </motion.div>
        <motion.div style={reducedMotion ? undefined : { y: titleY, scale: titleScale, opacity: titleOpacity }} className="relative z-10 mx-auto w-full max-w-[1600px] origin-center pt-20">
          <p className="mb-4 text-right font-mono text-[9px] uppercase tracking-[.28em] text-[var(--signal)]">Systems that reason with context</p>
          <h1 className="hero-title" aria-label="Generative intelligence">
            <motion.span initial={reducedMotion ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="block">Generative</motion.span>
            <motion.span initial={reducedMotion ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: .1, ease: [0.16, 1, 0.3, 1] }} className="block text-right">Intelligence</motion.span>
          </h1>
          <div className="mt-8 grid gap-8 border-t border-white/15 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <p className="max-w-md text-sm leading-6 text-[#aaa9a3]">Building production-grade AI systems with LLMs, RAG, agents, Python &amp; AWS.</p>
            <p className="max-w-sm text-sm leading-6 text-[#777873]">Prompt engineering, retrieval architectures, agent orchestration, evaluation, and model serving.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#projects" className="flex items-center gap-3 text-xs uppercase tracking-[.16em]">Enter systems <ArrowDown className="h-4 w-4" /></a>
            </div>
          </div>
        </motion.div>
        <div className="absolute bottom-7 left-5 font-mono text-[9px] uppercase tracking-[.18em] text-[#666762] sm:left-8">Scroll / camera enabled</div>
        <div className="absolute bottom-7 right-5 font-mono text-[9px] uppercase tracking-[.18em] text-[#666762] sm:right-8">LLMs · RAG · Agents · AWS</div>
      </section>
    </div>
  );
}
