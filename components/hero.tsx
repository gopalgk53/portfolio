"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { AIPromptBar } from "./ai-prompt-bar";
import { NeuralBackground } from "./neural-background";

const spring = { type: "spring" as const, stiffness: 200, damping: 25 };

export function Hero() {
  return <div className="relative min-h-screen overflow-hidden">
    <NeuralBackground />
    <nav className="liquid-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-semibold tracking-tight">Gopalakrishnan<span className="text-cyan-300">.AI</span></a>
        <div className="hidden gap-6 text-sm text-slate-400 md:flex">{["About","Projects","Playground","Experience","Certifications"].map(item => <motion.a key={item} href={`#${item.toLowerCase()}`} whileHover={{y:-2,color:"#fff"}} transition={spring}>{item}</motion.a>)}</div>
        <motion.a href="#contact" whileHover={{scale:1.04}} whileTap={{scale:.96}} transition={spring} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100">Let&apos;s talk</motion.a>
      </div>
    </nav>
    <section id="top" className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-20 pt-28 sm:px-8">
      <motion.div className="liquid-orb liquid-orb-a" animate={{y:[0,-18,0],x:[0,-9,0],scale:[1,1.04,1]}} transition={{...spring,repeat:Infinity}} aria-hidden="true" />
      <motion.div className="liquid-orb liquid-orb-b" animate={{y:[0,15,0],x:[0,12,0],scale:[1,1.06,1]}} transition={{...spring,repeat:Infinity}} aria-hidden="true" />
      <div className="w-full">
        <motion.div layoutId="availability" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={spring} className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.06] px-3 py-1.5 font-mono text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />STATUS: FINE-TUNING MODELS · AVAILABLE FOR SELECT AI ROLES</motion.div>
        <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={spring} className="mb-4 font-mono text-[10px] uppercase tracking-[.22em] text-cyan-300">MODEL_PROFILE / GOPAL-AI / v1.0</motion.p>
        <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={spring} className="max-w-5xl text-balance text-5xl font-black leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[6rem]">Gopalakrishnan — <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">Generative AI Engineer</span></motion.h1>
        <motion.p initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{...spring,delay:.06}} className="mt-7 max-w-3xl text-lg leading-8 text-slate-400">Building autonomous agents, high-throughput LLM inference pipelines, and enterprise RAG systems.</motion.p>
        <AIPromptBar />
        <div className="mt-6 flex flex-wrap gap-3"><motion.a href="#projects" whileHover={{y:-3,scale:1.02}} whileTap={{scale:.97}} transition={spring} className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-gradient-to-b from-white to-blue-50 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_rgba(105,175,255,.22),inset_0_1px_0_white]">View my work <ArrowDown className="h-4 w-4" /></motion.a><motion.a href="/Gopalakrishna_Maddipalli_CV.pdf" whileHover={{y:-3,scale:1.02}} whileTap={{scale:.97}} transition={spring} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.08] px-5 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.15)] backdrop-blur-xl"><Download className="h-4 w-4" />Resume</motion.a></div>
      </div>
    </section>
  </div>;
}
