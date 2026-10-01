"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav } from "../lib/nav";

const RESUME = "/Gopalakrishna_Maddipalli_CV.pdf";
const GITHUB = "https://github.com/gopalgk53";

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("top");
  const reducedMotion = useReducedMotion();

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
    <div data-scene="identity" className="cinematic-hero">
      <nav className="site-nav" data-scrolled={scrolled} aria-label="Primary navigation">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="text-[14px] font-semibold tracking-tight">Gopalakrishna Maddipalli</a>
          <div className="hidden items-center gap-7 text-[14px] font-medium text-[var(--muted)] md:flex">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} className={`transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)] ${activeId === id ? "text-[var(--text)]" : ""}`}>{label}</a>)}
            <a href={RESUME} className="btn-pill btn-pill--outline">Résumé <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] md:hidden">
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>{menuOpen && (
          <motion.div id="mobile-navigation" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 md:hidden">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} onClick={() => setMenuOpen(false)} className={`block border-b border-[var(--border)] py-4 text-[16px] font-medium ${activeId === id ? "text-[var(--accent)]" : ""}`}>{label}</a>)}
            <a href={RESUME} onClick={() => setMenuOpen(false)} className="btn-pill btn-pill--solid mt-5 w-full">Résumé <ArrowUpRight className="h-4 w-4" /></a>
          </motion.div>
        )}</AnimatePresence>
      </nav>

      <section id="top" className="mx-auto max-w-[1280px] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
        <p className="font-mono text-[12px] uppercase tracking-[.12em] text-[var(--muted)]">AI / ML Engineer · India</p>
        <h1 className="!mt-5 max-w-[18ch] text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-.025em] text-white">
          I build AI systems for construction operations.
        </h1>
        <p className="mt-7 max-w-[62ch] text-[17px] leading-[1.65] text-[var(--navy-text)] opacity-85 sm:text-[18px]">
          Seven years at a construction payment-protection company, first as a research analyst and now as a data
          scientist. I build the data pipelines, models and agents for that work, with evaluation and human review
          wherever a wrong answer costs money.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#projects" className="btn-pill btn-pill--solid">View projects <ArrowRight className="h-4 w-4" /></a>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="btn-pill hero-secondary">GitHub <ArrowUpRight className="h-4 w-4" /></a>
          <a href={RESUME} className="btn-pill hero-secondary">Résumé <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <p className="mt-16 border-t border-[var(--navy-border)] pt-5 font-mono text-[12px] tracking-[.06em] text-[var(--muted)]">
          Python <span className="text-[var(--navy-border)]">|</span> AWS <span className="text-[var(--navy-border)]">|</span> Microsoft Foundry <span className="text-[var(--navy-border)]">|</span> MCP <span className="text-[var(--navy-border)]">|</span> Evaluation
        </p>
      </section>
    </div>
  );
}
