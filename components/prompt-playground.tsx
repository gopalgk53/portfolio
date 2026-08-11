"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Status = "idle"|"ready"|"computing"|"streaming"|"complete"|"error";
const spring={type:"spring" as const,stiffness:200,damping:25};
const finalAnswer="A production-ready RAG response should ground every claim in retrieved evidence, apply explicit refusal rules, preserve source attribution, and return a predictable structure for downstream systems.";

export function PromptPlayground(){
  const [prompt,setPrompt]=useState(""),[temperature,setTemperature]=useState(.3),[topP,setTopP]=useState(.9),[divider,setDivider]=useState(50);
  const [status,setStatus]=useState<Status>("idle"),[output,setOutput]=useState(""),[latency,setLatency]=useState(0),[tokens,setTokens]=useState(0),[focus,setFocus]=useState<1|2|3|0>(0);
  const outputRef=useRef<HTMLDivElement>(null), reduced=useReducedMotion();
  const active=(card:number)=>focus===0||focus===card?"opacity-100":"opacity-55";

  useEffect(()=>{outputRef.current?.scrollTo({top:outputRef.current.scrollHeight,behavior:reduced?"auto":"smooth"})},[output,reduced]);
  function execute(){
    if(!prompt.trim()){setStatus("error");setFocus(1);return}
    setStatus("computing");setFocus(3);setOutput("");setLatency(0);setTokens(0);
    let tick=0;const telemetry=setInterval(()=>{tick+=1;setLatency(38+Math.random()*76);setTokens(Math.floor(18+Math.random()*34))},70);
    setTimeout(()=>{setStatus("streaming");let index=0;const stream=setInterval(()=>{index+=reduced?finalAnswer.length:4;setOutput(finalAnswer.slice(0,index));if(index>=finalAnswer.length){clearInterval(stream);clearInterval(telemetry);setLatency(86.42);setTokens(41);setStatus("complete")}},reduced?1:32)},reduced?50:760);
  }
  function reset(){setPrompt("");setTemperature(.3);setTopP(.9);setDivider(50);setStatus("idle");setOutput("");setLatency(0);setTokens(0);setFocus(0)}

  return <div>
    <div className="mb-5 flex items-center justify-between gap-4"><p className="font-mono text-[10px] text-emerald-300">SYSTEM_STATE: {status.toUpperCase()}</p><motion.button whileHover={{scale:1.03}} whileTap={{scale:.96}} transition={spring} onClick={reset} className="flex items-center gap-2 rounded-lg border border-cyan-400/15 px-3 py-2 font-mono text-[10px] text-cyan-200"><RotateCcw className="h-3 w-3"/>FLUSH CACHE</motion.button></div>
    <div className="grid gap-5 xl:grid-cols-[1.05fr_.9fr_1.25fr]">
      <motion.article animate={{opacity:focus===0||focus===1?1:.55}} transition={spring} className={`glass-card flex min-h-[500px] flex-col p-5 ${status==="error"?"!border-red-500/70":""}`} onFocus={()=>setFocus(1)} onBlur={()=>setFocus(0)}>
        <header className="flex justify-between font-mono text-[9px]"><span className="text-cyan-300">NODE_01 / PROMPT_CONTROL</span><span className={status==="error"?"text-red-400":"text-slate-600"}>{status==="error"?"VALIDATION_ERROR":prompt?"READY":"EMPTY"}</span></header>
        <div className="relative mt-5"><span className="absolute left-3 top-3 font-mono text-sm text-emerald-400">›</span><textarea value={prompt} onChange={e=>{setPrompt(e.target.value);if(status==="error")setStatus("ready")}} rows={8} placeholder={status==="error"?"[SYSTEM ERROR: Null input detected. Please provide a semantic prompt sequence.]":"Enter a prompt to inspect model behavior..."} className="w-full resize-none rounded-xl border border-cyan-400/15 bg-black/70 py-3 pl-8 pr-3 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-cyan-400/60 focus:shadow-[0_0_24px_rgba(0,242,254,.08)]"/></div>
        <div className="mt-2 flex gap-4 font-mono text-[9px] text-slate-600"><span>CHARS: {prompt.length}</span><span>TOKENS_EST: {Math.ceil(prompt.length/4)}</span><span>GROUNDING: ON</span></div>
        <div className="mt-6 space-y-5"><label className="block font-mono text-[10px] text-slate-400">TEMPERATURE <b className="float-right text-cyan-300">{temperature.toFixed(1)}</b><input type="range" min="0" max="1.5" step=".1" value={temperature} disabled={status==="computing"||status==="streaming"} onChange={e=>setTemperature(Number(e.target.value))} className="mt-3 w-full accent-emerald-400"/></label><label className="block font-mono text-[10px] text-slate-400">TOP-P <b className="float-right text-emerald-300">{topP.toFixed(1)}</b><input type="range" min=".1" max="1" step=".1" value={topP} disabled={status==="computing"||status==="streaming"} onChange={e=>setTopP(Number(e.target.value))} className="mt-3 w-full accent-cyan-400"/></label></div>
        <motion.button onClick={execute} disabled={status==="computing"||status==="streaming"} whileHover={{y:-2,boxShadow:"0 0 24px rgba(0,255,102,.18)"}} whileTap={{scale:.98}} transition={spring} className="mt-auto self-end rounded-lg border border-emerald-400/50 bg-emerald-400/[.06] px-5 py-3 font-mono text-[10px] font-semibold text-emerald-300 disabled:opacity-40">{status==="computing"||status==="streaming"?"EXECUTION ACTIVE":"EXECUTE INFERENCE"}</motion.button>
      </motion.article>

      <motion.article animate={{opacity:focus===0||focus===2?1:.55}} transition={spring} className="glass-card min-h-[500px] p-5" onPointerDown={()=>setFocus(2)}>
        <header className="flex justify-between font-mono text-[9px]"><span className="text-cyan-300">NODE_02 / PROMPT_DIFF</span><span className="text-slate-600">NAIVE ↔ ENGINEERED</span></header>
        <div className="relative mt-5 h-[390px] overflow-hidden rounded-xl border border-white/[.07] bg-black/70">
          <div className="absolute inset-0 p-5 font-mono text-[10px] leading-6 text-slate-600"><b className="text-slate-400">NAIVE PROMPT</b><p className="mt-5">Answer my question about this document. Make the answer useful.</p><p className="mt-8 text-red-400/55">RISK: HIGH AMBIGUITY</p></div>
          <div style={{clipPath:`inset(0 0 0 ${divider}%)`}} className="absolute inset-0 bg-[#00100c] p-5 font-mono text-[10px] leading-6 text-cyan-200"><b className="text-emerald-300">OPTIMIZED SYSTEM PROMPT</b><p className="mt-5"><span className="text-emerald-400">ROLE:</span> Evidence-grounded legal assistant<br/><span className="text-emerald-400">CONTEXT:</span> Retrieved source chunks only<br/><span className="text-emerald-400">GUARDRAIL:</span> Refuse unsupported claims<br/><span className="text-emerald-400">FORMAT:</span> Answer, evidence, confidence<br/><span className="text-emerald-400">EVALUATE:</span> Cite every material statement</p><p className="mt-8 text-emerald-400">RISK: CONTROLLED</p></div>
          <div style={{left:`${divider}%`}} className="pointer-events-none absolute inset-y-0 w-px bg-cyan-300 shadow-[0_0_14px_#00f2fe]"/>
          <input aria-label="Compare naive and optimized prompt" type="range" min="5" max="95" value={divider} onChange={e=>setDivider(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"/>
          <div style={{left:`calc(${divider}% - 18px)`}} className="pointer-events-none absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/50 bg-black font-mono text-[9px] text-cyan-200">↔</div>
        </div>
      </motion.article>

      <motion.article animate={{opacity:focus===0||focus===3?1:.55}} transition={spring} className="glass-card flex min-h-[500px] flex-col p-5" onPointerDown={()=>setFocus(3)}>
        <header className="flex justify-between font-mono text-[9px]"><span className="text-cyan-300">NODE_03 / MODEL_OUTPUT</span><span className="text-emerald-400">{status==="idle"||status==="ready"||status==="error"?"AWAITING":status.toUpperCase()}</span></header>
        <div ref={outputRef} className="relative mt-5 flex-1 overflow-y-auto rounded-xl border border-cyan-400/10 bg-black/70 p-5 font-mono text-xs leading-7 text-slate-300">
          {(status==="idle"||status==="ready"||status==="error")&&<p className="text-slate-700">[Awaiting execution sequence... User token input required]</p>}
          {status==="computing"&&<div className="grid h-full place-items-center text-center text-emerald-400"><div><Sparkles className="mx-auto mb-4 h-5 w-5 animate-pulse"/><p>[Calculating semantic vector distances...]</p><p className="mt-3 animate-pulse text-[9px] text-cyan-500">0x01 · 0x10 · 0x11 · 0x00</p></div></div>}
          {(status==="streaming"||status==="complete")&&<p>{output}<span className={status==="streaming"?"animate-pulse text-emerald-400":"hidden"}> █</span></p>}
        </div>
        <footer className="mt-4 border-t border-cyan-400/10 pt-3"><p className="mb-2 font-mono text-[8px] tracking-widest text-slate-700">SIMULATED TELEMETRY</p><div className="flex justify-between gap-4 font-mono text-[9px]"><span className="text-cyan-300">LATENCY: {latency.toFixed(2)}ms</span><span className="text-emerald-300">TOKEN YIELD: {tokens} t/s</span></div></footer>
      </motion.article>
    </div>
  </div>
}
