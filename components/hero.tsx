"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness, Building2, Check, ChevronDown, Code2, Copy, FileText, Link2, Mail, Menu, Radio, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { projects, skills } from "../lib/data";
import { nav } from "../lib/nav";
import { HeroAgentTrace } from "./hero-agent-trace";
import { SoundToggle } from "./sound-toggle";

const featuredProject = projects.find((project) => project.id === "multi-agent") ?? projects[0];
const toolkit = ["Python", "FastAPI", "LangGraph", "MCP", "AWS", "Next.js"];
const Github = Code2;
const Linkedin = Link2;

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("top");
  const [copied, setCopied] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

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
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) return navigator.share({ title: "Gopalakrishna · AI Systems", url: window.location.href });
    await copyLink();
  };

  const reveal = (delay: number) => reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985, transition: { delay } };

  return (
    <div data-scene="identity" className="cinematic-hero hero-bento-shell relative min-h-svh overflow-hidden">
      <nav className="site-nav" data-scrolled={scrolled} aria-label="Primary navigation">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 sm:px-8">
          <a href="#top" aria-current={activeId === "top" ? "location" : undefined} className="flex items-center gap-3 text-[13px] font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--text)] text-[11px] text-white">GK</span><span>Gopalakrishna · AI Systems</span>
          </a>
          <div className="hidden items-center gap-6 text-[13px] font-medium text-[var(--muted)] lg:flex">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} className={`transition-colors hover:text-[var(--text)] ${activeId === id ? "text-[var(--accent)]" : ""}`}>{label}</a>)}
            <SoundToggle className="text-[var(--muted)]" />
            <button type="button" onClick={copyLink} className="hero-nav-action">{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}</button>
            <button type="button" onClick={share} className="hero-nav-icon" aria-label="Share portfolio"><Share2 /></button>
          </div>
          <div className="flex items-center gap-3 lg:hidden">
            <span className="mobile-section-progress" aria-live="polite">{activeId === "top" ? "INTRO" : `${String(Math.max(1, nav.findIndex(([, id]) => id === activeId) + 1)).padStart(2, "0")} / ${String(nav.length).padStart(2, "0")}`}</span>
            <SoundToggle className="text-[var(--muted)]" />
            <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-strong)]">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          </div>
        </div>
        <AnimatePresence>{menuOpen && <motion.div id="mobile-navigation" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} className="border-t border-[var(--border)] bg-[var(--bg)] px-5 py-5 lg:hidden">
          {nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-[var(--border)] py-4 text-[15px] font-medium">{label}</a>)}
          <a href="/Gopalakrishna_Maddipalli_CV.pdf" onClick={() => setMenuOpen(false)} className="btn-pill btn-pill--solid mt-5 w-full">Résumé <ArrowUpRight className="h-4 w-4" /></a>
        </motion.div>}</AnimatePresence>
        <motion.div aria-hidden="true" style={{ scaleX: scrollYProgress, background: "var(--gradient-accent)" }} className="absolute inset-x-0 bottom-[-1px] h-px origin-left" />
      </nav>

      <section id="top" className="hero-bento-section relative z-10 mx-auto w-full max-w-[1180px] px-4 pb-5 pt-24 sm:px-6">
        <div className="hero-bento-grid" data-secondary-open={secondaryOpen}>
          <motion.article initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-bento-card hero-profile-card lg:col-span-2 lg:row-span-2">
            <div className="flex items-start justify-between gap-5"><img src="/gopalakrishna.jpg" alt="Gopalakrishna Maddipalli" className="h-[76px] w-[76px] rounded-full border-4 border-white/20 object-cover shadow-xl" /><span className="hero-status"><i />Available for select roles</span></div>
            <div className="mt-5"><p className="hero-card-kicker">AI ENGINEER · INDIA</p><h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[.94] tracking-[-.05em] text-white">Gopalakrishna<br />Maddipalli</h1><p className="mt-4 max-w-md text-[14px] leading-6 text-white/65">I build production-grade AI systems across RAG, multi-agent workflows, model evaluation, and cloud deployment.</p></div>
            <div className="mt-auto pt-5">
              <div className="hero-profile-actions"><a href="#projects" className="hero-profile-projects">View projects <ArrowRight /></a><a href="/Gopalakrishna_Maddipalli_CV.pdf" className="hero-profile-resume">Résumé <ArrowUpRight /></a></div>
              <div className="mt-3 flex items-center gap-2"><a href="https://github.com/gopalgk53" target="_blank" rel="noreferrer" className="hero-social" aria-label="GitHub profile"><Github /></a><a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="hero-social" aria-label="LinkedIn profile"><Linkedin /></a><a href="mailto:gopalgk53@yahoo.com" className="hero-social" aria-label="Email Gopalakrishna"><Mail /></a></div>
            </div>
          </motion.article>

          <motion.article initial={reveal(.1)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-bento-card hero-focus-card lg:col-span-2"><div className="relative z-10 max-w-xl"><p className="hero-card-kicker text-[var(--accent-2)]">CURRENT FOCUS</p><h2 className="mt-2 text-[clamp(1.55rem,3.2vw,2.7rem)] font-semibold leading-none tracking-[-.045em] text-white">Systems that reason<br />with context.</h2><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-white/70"><span>Evaluation-led RAG</span><span>Stateful agents</span><span>Low-latency serving</span></div></div><BrainCircuit className="hero-focus-icon" aria-hidden="true" /></motion.article>
          <motion.article initial={reveal(.15)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-bento-card hero-trace-card"><div className="flex items-center justify-between"><span className="hero-card-kicker text-[var(--accent)]"><Radio /> LIVE PIPELINE</span><span className="hero-live-dot">Online</span></div><HeroAgentTrace /></motion.article>
          <motion.a href="#evidence-index" aria-label="Review portfolio evidence" initial={reveal(.2)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-bento-card hero-stat-card"><div className="flex items-start justify-between"><Sparkles /><span>Evidence-aware portfolio</span></div><div><strong>{projects.length}</strong><p>documented systems · targets labelled</p><span className="hero-stat-link">Review evidence <ArrowRight aria-hidden="true" /></span></div></motion.a>
          <button type="button" aria-expanded={secondaryOpen} onClick={() => setSecondaryOpen((value) => !value)} className="hero-more-toggle">{secondaryOpen ? "Show focused introduction" : "Explore experience, work and writing"}<ChevronDown aria-hidden="true" /></button>
          <motion.a href={`/projects/${featuredProject.id}`} initial={reveal(.25)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-secondary-card hero-bento-card hero-project-card lg:col-span-2"><div className="hero-project-icon"><BriefcaseBusiness /></div><div className="min-w-0 flex-1"><p className="hero-card-kicker">FEATURED SYSTEM</p><h2>{featuredProject.title}</h2><div className="mt-2 flex flex-wrap gap-1.5">{featuredProject.stack.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div></div><div className="hero-arrow"><ArrowUpRight /></div></motion.a>
          <motion.a href="#experience" initial={reveal(.3)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-secondary-card hero-bento-card hero-experience-card"><div className="flex items-center justify-between"><span className="hero-card-kicker">EXPERIENCE</span><Building2 /></div><div><strong>7+</strong><h2>Years across construction, data &amp; AI</h2><p>SunRay Construction Solutions · Hyderabad, India</p></div></motion.a>
          <motion.a href="/blog" initial={reveal(.35)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-secondary-card hero-bento-card hero-writing-card"><div className="flex items-center justify-between"><span className="hero-card-kicker">WRITING</span><FileText /></div><div><h2>Engineering notes</h2><p>Typed decisions, production failures, and reliable AI systems.</p></div></motion.a>
          <motion.article initial={reveal(.4)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-secondary-card hero-bento-card hero-toolkit-card lg:col-span-2"><p className="hero-card-kicker">CORE TOOLKIT</p><div className="mt-3 flex flex-wrap gap-2">{toolkit.filter((item) => skills.some((group) => group.items.includes(item))).map((item) => <span key={item}>{item}</span>)}</div></motion.article>
          <motion.a href="#contact" initial={reveal(.45)} animate={{ opacity: 1, y: 0, scale: 1 }} className="hero-secondary-card hero-bento-card hero-contact-card lg:col-span-2"><div><p className="hero-card-kicker text-white/45">COLLABORATE</p><h2>Let&apos;s build something reliable.</h2><p>Open to select Generative AI engineering and architecture roles.</p></div><span>Say hello <ArrowRight /></span></motion.a>
        </div>
      </section>
    </div>
  );
}
