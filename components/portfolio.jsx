"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { certifications, projects, skills } from "../lib/data";

const spring = { type: "spring", stiffness: 200, damping: 25 };
const categories = ["All", ...new Set(projects.map((project) => project.category))];

function Section({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="relative z-10 scroll-mt-24 border-t border-white/[.07] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={spring} className="mb-12 grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div><p className="mb-3 font-mono text-xs uppercase tracking-[.18em] text-cyan-300">{eyebrow}</p><h2 className="max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{title}</h2></div>
          {description && <p className="max-w-xl text-base leading-7 text-zinc-400 lg:justify-self-end">{description}</p>}
        </motion.header>
        {children}
      </div>
    </section>
  );
}

function About() {
  const timeline = [
    ["Operations", "Construction research and workflow expertise"],
    ["Data science", "Predictive ML, OCR, analytics, and explainability"],
    ["Generative AI", "RAG, agent orchestration, evaluation, and LLMOps"],
  ];
  return (
    <Section id="about" eyebrow="01 / About" title="Domain depth meets agentic engineering." description="Seven years in construction operations and data science shape how I build: start with the workflow, ground the intelligence, and measure the outcome.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={spring} className="rounded-3xl border border-white/10 bg-white/[.035] p-7 backdrop-blur-xl sm:p-10">
          <p className="text-xl leading-9 text-zinc-300">I specialize in prompt engineering, advanced RAG topologies, and autonomous multi-agent workflows—designing systems where retrieval quality, orchestration, evaluation, and observability are first-class engineering concerns.</p>
          <div id="experience" className="mt-10 grid gap-3 sm:grid-cols-3">
            {timeline.map(([title, copy], index) => <motion.div key={title} whileHover={{ y: -4 }} transition={spring} className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><span className="font-mono text-[10px] text-zinc-600">0{index + 1}</span><h3 className="mt-5 font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{copy}</p></motion.div>)}
          </div>
        </motion.div>
        <motion.aside initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: .06 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-300/[.07] to-violet-400/[.05] p-7 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[.18em] text-zinc-500">Currently building</p>
          <div className="mt-8 space-y-3">{["Graph RAG topologies", "Agent evaluation harnesses", "LLMOps observability"].map((item) => <motion.div key={item} whileHover={{ x: 6 }} transition={spring} className="flex items-center gap-3 border-b border-white/[.08] py-4"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{item}</motion.div>)}</div>
          <div className="mt-10 grid grid-cols-3 gap-3 text-center"><div><b className="block text-2xl">7+</b><span className="text-xs text-zinc-500">years</span></div><div><b className="block text-2xl">9</b><span className="text-xs text-zinc-500">systems</span></div><div><b className="block text-2xl">22</b><span className="text-xs text-zinc-500">credentials</span></div></div>
        </motion.aside>
      </div>
    </Section>
  );
}

function Projects() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const visible = useMemo(() => filter === "All" ? projects : projects.filter((project) => project.category === filter), [filter]);
  return (
    <Section id="projects" eyebrow="02 / Selected work" title="Systems designed around measurable outcomes." description="Nine production-focused AI architectures spanning retrieval, agents, document intelligence, machine learning, and data platforms.">
      <div className="mb-8 flex flex-wrap gap-2">{categories.map((category) => <motion.button key={category} onClick={() => setFilter(category)} layout transition={spring} className={`relative rounded-full px-4 py-2 text-xs ${filter === category ? "text-black" : "text-zinc-400"}`}>{filter === category && <motion.span layoutId="project-filter" className="absolute inset-0 -z-10 rounded-full bg-white" transition={spring} />}{category}</motion.button>)}</div>
      <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project, index) => <motion.article layout key={project.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={spring} whileHover={{ y: -6 }} className="group flex min-h-[360px] flex-col rounded-3xl border border-white/[.09] bg-white/[.032] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.14em] text-zinc-500">{project.category}</span><span className="text-xs text-zinc-700">0{index + 1}</span></div>
            <motion.div whileHover={{ scale: 1.02 }} transition={spring} className="my-7 h-20 rounded-2xl border border-white/[.07] bg-[radial-gradient(circle_at_25%_40%,rgba(104,231,255,.18),transparent_24%),radial-gradient(circle_at_72%_60%,rgba(154,124,255,.15),transparent_26%)]" />
            <h3 className="text-xl font-medium tracking-[-.025em]">{project.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{project.goal}</p>
            <button onClick={() => setSelected(project)} className="mt-auto pt-7 text-left text-xs font-medium text-cyan-300">Inspect system ↗</button>
          </motion.article>)}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>{selected && <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><motion.div layoutId={`project-${selected.id}`} initial={{ opacity: 0, scale: .94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 16 }} transition={spring} className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0b0b0e] p-7 shadow-2xl sm:p-10"><div className="flex justify-between gap-6"><div><p className="font-mono text-xs text-cyan-300">{selected.category}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{selected.title}</h3></div><button onClick={() => setSelected(null)} aria-label="Close project" className="h-9 w-9 rounded-full border border-white/10">×</button></div><p className="mt-6 leading-7 text-zinc-400">{selected.goal}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/[.08] p-4"><span className="font-mono text-[10px] text-zinc-600">ARCHITECTURE</span><p className="mt-3 text-sm leading-6">{selected.flow}</p></div><div className="rounded-2xl border border-white/[.08] p-4"><span className="font-mono text-[10px] text-zinc-600">BUSINESS IMPACT</span><p className="mt-3 text-sm leading-6">{selected.impact}</p></div></div><div className="mt-6 flex flex-wrap gap-2">{selected.stack.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">{item}</span>)}</div><a href="https://github.com/gopalgk53/construction-legal-ai-suite" target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">View repository ↗</a></motion.div></motion.div>}</AnimatePresence>
    </Section>
  );
}

function Skills() {
  return <Section id="skills" eyebrow="03 / Capabilities" title="A practical stack for intelligent systems."><div className="grid gap-4 md:grid-cols-3">{skills.map((skill, index) => <motion.div key={skill.group} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: index * .04 }} className="rounded-3xl border border-white/[.09] bg-white/[.03] p-6"><h3 className="text-lg font-medium">{skill.group}</h3><div className="mt-6 flex flex-wrap gap-2">{skill.items.map((item) => <motion.span whileHover={{ y: -2, borderColor: "rgba(104,231,255,.4)" }} transition={spring} key={item} className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400">{item}</motion.span>)}</div></motion.div>)}</div></Section>;
}

function Certifications() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? certifications : certifications.slice(0, 6);
  return <Section id="certifications" eyebrow="04 / Credentials" title="Verified learning, kept accessible." description="Every certification link from the previous portfolio remains available."><motion.div layout className="grid gap-3 md:grid-cols-2"><AnimatePresence mode="popLayout">{visible.map(([name, meta, url]) => <motion.a layout key={name} href={url} target="_blank" rel="noreferrer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ x: 5 }} transition={spring} className="flex items-center justify-between gap-5 rounded-2xl border border-white/[.08] bg-white/[.025] p-5"><div><h3 className="text-sm font-medium">{name}</h3><p className="mt-1 text-xs text-zinc-600">{meta}</p></div><span className="text-cyan-300">↗</span></motion.a>)}</AnimatePresence></motion.div><motion.button layout onClick={() => setExpanded((value) => !value)} transition={spring} className="mt-7 rounded-full border border-white/15 px-5 py-3 text-sm">{expanded ? "Show featured credentials" : `View all ${certifications.length} credentials`}</motion.button></Section>;
}

function Contact() {
  const [status, setStatus] = useState("");
  function submit(event) { event.preventDefault(); const data = new FormData(event.currentTarget); if (!data.get("name")?.trim() || !/^\S+@\S+\.\S+$/.test(data.get("email")) || data.get("message")?.trim().length < 10) { setStatus("Please complete all fields with a valid email and message."); return; } setStatus("Payload compiled. Complete transmission in your email client."); location.href = `mailto:gopalgk53@yahoo.com?subject=${encodeURIComponent(`Portfolio inquiry from ${data.get("name")}`)}&body=${encodeURIComponent(`${data.get("message")}\n\nFrom: ${data.get("email")}`)}`; }
  return <Section id="contact" eyebrow="05 / Contact" title="Let’s build useful intelligence." description="Open to Generative AI, AI/ML engineering, and applied agentic-system opportunities."><div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><div className="rounded-3xl border border-white/[.09] bg-white/[.03] p-7"><p className="font-mono text-xs text-emerald-300">SYSTEM_STATUS: AVAILABLE</p><div className="mt-8 space-y-3">{[["GitHub","https://github.com/gopalgk53"],["LinkedIn","https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b"],["Email","mailto:gopalgk53@yahoo.com"]].map(([label,url]) => <motion.a whileHover={{ x: 5 }} transition={spring} className="block border-b border-white/[.08] py-4 text-sm text-zinc-400" key={label} href={url} target={url.startsWith("http") ? "_blank" : undefined}>{label} ↗</motion.a>)}</div></div><form onSubmit={submit} className="rounded-3xl border border-white/[.09] bg-white/[.03] p-7 sm:p-9"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-zinc-500">NAME<input name="name" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50" /></label><label className="text-xs text-zinc-500">EMAIL<input name="email" type="email" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50" /></label></div><label className="mt-4 block text-xs text-zinc-500">MESSAGE<textarea name="message" rows="5" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50" /></label><div className="mt-5 flex flex-wrap items-center gap-4"><motion.button whileHover={{ y: -3 }} whileTap={{ scale: .98 }} transition={spring} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Compose transmission</motion.button><p role="status" className="text-xs text-zinc-500">{status}</p></div></form></div></Section>;
}

export function Portfolio() {
  return <><About /><Projects /><Skills /><Certifications /><Contact /><footer className="relative z-10 border-t border-white/[.07] px-5 py-8 text-center text-xs text-zinc-600">© 2026 Gopalakrishna Maddipalli · Human insight, intelligent systems.</footer></>;
}
