"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, Download, Menu, X } from "lucide-react";
import { useState } from "react";
import { AIPromptBar } from "./ai-prompt-bar";
import { NeuralBackground } from "./neural-background";

const spring = { type: "spring" as const, stiffness: 200, damping: 25 };
const nav = [["Profile","about"],["Selected work","projects"],["Capabilities","skills"],["Experience","experience"],["Contact","contact"]];

export function Hero(){
  const [menuOpen,setMenuOpen]=useState(false);
  return <div className="relative min-h-screen overflow-hidden border-b border-white/[.13]">
    <NeuralBackground/>
    <nav className="liquid-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="text-sm font-semibold tracking-[-.02em]">Gopalakrishna <span className="ml-1 font-normal text-[#777b80]">/ AI Engineer</span></a>
        <div className="hidden items-center gap-7 text-[13px] text-[#999da1] md:flex">{nav.slice(0,4).map(([label,id])=><a key={id} href={`#${id}`}>{label}</a>)}<a href="#contact" className="border-b border-[#5e7cff] pb-1 text-white">Start a conversation</a></div>
        <button onClick={()=>setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center border border-white/15 md:hidden">{menuOpen?<X className="h-4 w-4"/>:<Menu className="h-4 w-4"/>}</button>
      </div>
      <AnimatePresence>{menuOpen&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={spring} className="border-t border-slate-900/10 bg-white/85 px-5 py-4 text-slate-900 backdrop-blur-2xl md:hidden">{nav.map(([label,id])=><a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)} className="block border-b border-slate-900/10 py-3 text-sm text-slate-700">{label}</a>)}</motion.div>}</AnimatePresence>
    </nav>

    <section id="top" className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 sm:px-8 sm:pt-36">
      <div className="w-full">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
          <div>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={spring} className="mb-10 flex items-center gap-3 text-[11px] uppercase tracking-[.18em] text-[#93979b]"><span className="h-2 w-2 rounded-full bg-[#9ac5a5]"/>Available for select roles · India</motion.div>
            <motion.h1 initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={spring} className="max-w-5xl text-[clamp(3.8rem,8.5vw,8.8rem)] font-semibold leading-[.82] tracking-[-.075em]">Gopalakrishna</motion.h1>
            <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{...spring,delay:.05}} className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6"><p className="text-[clamp(1.65rem,4vw,4rem)] leading-none tracking-[-.05em] text-[#aebaff]">Generative AI Engineer</p><span className="font-mono text-[10px] text-[#6e7277]">RAG / AGENTS / INFERENCE</span></motion.div>
          </div>
          <motion.aside initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{...spring,delay:.08}} className="border-l border-white/[.18] pl-6 lg:mb-2">
            <p className="text-[15px] leading-7 text-[#b3b5b7]">Building autonomous agents, high-throughput LLM inference pipelines, and enterprise RAG systems.</p>
            <a href="#projects" className="mt-7 inline-flex items-center gap-2 text-sm text-white">Explore selected work <ArrowDownRight className="h-4 w-4 text-[#5e7cff]"/></a>
          </motion.aside>
        </div>

        <div className="mt-16 grid gap-7 border-t border-white/[.14] pt-7 lg:grid-cols-[1fr_19rem]">
          <AIPromptBar/>
          <div className="flex items-start gap-3 lg:justify-end"><a href="/Gopalakrishna_Maddipalli_CV.pdf" className="inline-flex items-center gap-2 rounded-xl border border-white/[.08] bg-[#1066D6] px-4 py-3 text-xs text-white shadow-[0_8px_28px_rgba(16,102,214,.24)]"><Download className="h-3.5 w-3.5"/>Download résumé</a></div>
        </div>
      </div>
    </section>
  </div>
}
