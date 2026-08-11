"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Minimize2, RotateCcw, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; text: string; warning?: boolean };
const spring = { type: "spring" as const, stiffness: 200, damping: 25 };
const STORE = "gopal-bot-session-v1";
const welcome = "System initialized. I can help you explore Gopal's GenAI stack, project architectures, experience, and availability.";
const quick = ["⚡ View AI Stack", "📂 Latest RAG Project", "💼 Hire Gopal"];
const answers: Record<string,string> = {
  "⚡ View AI Stack":"Gopal's stack spans Llama 3, Qwen, LoRA/QLoRA, vLLM, LangGraph, CrewAI, Qdrant, hybrid retrieval, FastAPI, Docker, PyTorch, AWS and GCP.",
  "📂 Latest RAG Project":"The AI Legal Assistant is designed around document ingestion, embeddings, hybrid retrieval, reranking and grounded generation. Open the Projects section to inspect its system flow.",
  "💼 Hire Gopal":"Gopal is available for select Generative AI engineering and AI architecture roles. Use the Contact section for GitHub, LinkedIn, email and resume access.",
};
const blocked = /ignore previous|system prompt|write a poem|cats|jailbreak|developer message|hidden instruction/i;

export function AIAssistant() {
  const [open,setOpen]=useState(false), [tooltip,setTooltip]=useState(false), [thinking,setThinking]=useState(false), [warning,setWarning]=useState(false);
  const [messages,setMessages]=useState<Message[]>([]), [input,setInput]=useState("");
  const panel=useRef<HTMLDivElement>(null), feed=useRef<HTMLDivElement>(null), inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{try{const saved=sessionStorage.getItem(STORE);if(saved)setMessages(JSON.parse(saved));}catch{}const timer=setTimeout(()=>{if(!sessionStorage.getItem("gopal-bot-tooltip"))setTooltip(true)},7000);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{if(messages.length)sessionStorage.setItem(STORE,JSON.stringify(messages));},[messages]);
  useEffect(()=>{if(open){setTooltip(false);sessionStorage.setItem("gopal-bot-tooltip","seen");setTimeout(()=>inputRef.current?.focus(),260);if(!messages.length)setMessages([{role:"assistant",text:welcome}]);}},[open,messages.length]);
  useEffect(()=>{feed.current?.scrollTo({top:feed.current.scrollHeight,behavior:"smooth"});},[messages,thinking]);
  useEffect(()=>{const close=(event:PointerEvent)=>{if(open&&panel.current&&!panel.current.contains(event.target as Node))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};document.addEventListener("pointerdown",close);document.addEventListener("keydown",key);return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",key)}},[open]);

  function respond(question:string){if(!question.trim()||thinking)return;const unsafe=blocked.test(question);setMessages(current=>[...current,{role:"user",text:question}]);setInput("");setThinking(true);setWarning(unsafe);const full=unsafe?"[GUARDRAIL EXCEPTION]: Request unauthorized. My system architecture is strictly optimized to discuss Gopal's professional engineering profile. Resetting context layer...":answers[question]||"Gopal focuses on production-minded RAG, agent orchestration, model optimization and document intelligence. Try asking about his stack, projects, experience, or availability.";let index=0;setTimeout(()=>{setMessages(current=>[...current,{role:"assistant",text:"",warning:unsafe}]);const timer=setInterval(()=>{index+=3;setMessages(current=>current.map((message,i)=>i===current.length-1?{...message,text:full.slice(0,index)}:message));if(index>=full.length){clearInterval(timer);setThinking(false)}},24)},420)}
  function submit(event:FormEvent){event.preventDefault();respond(input)}
  function reset(){sessionStorage.removeItem(STORE);setMessages([{role:"assistant",text:welcome}]);setWarning(false);setThinking(false);setInput("")}

  return <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6" ref={panel}>
    <AnimatePresence>{tooltip&&!open&&<motion.button initial={{opacity:0,x:18,scale:.96}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:12}} transition={spring} onClick={()=>setOpen(true)} className="absolute bottom-2 right-16 w-64 rounded-xl border border-cyan-400/20 bg-black/85 p-3 text-left font-mono text-[11px] leading-5 text-cyan-100 shadow-[0_12px_40px_rgba(0,0,0,.55)] backdrop-blur-xl">System online. Ask me about Gopal&apos;s AI stack... <span className="animate-pulse text-emerald-400">█</span></motion.button>}</AnimatePresence>
    <AnimatePresence mode="wait">{!open?<motion.button key="orb" aria-label="Open Gopal AI assistant" onClick={()=>setOpen(true)} initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.7,opacity:0}} whileHover={{scale:1.06}} transition={spring} className="grid h-14 w-14 place-items-center rounded-full border border-cyan-300/35 bg-black/75 text-cyan-300 shadow-[0_0_18px_rgba(0,242,254,.22),inset_0_0_18px_rgba(0,255,102,.08)] backdrop-blur-xl"><span className="absolute h-8 w-8 animate-ping rounded-full border border-cyan-400/15"/><Bot className="relative h-6 w-6"/></motion.button>:
      <motion.section key="panel" role="dialog" aria-label="Gopal AI assistant" initial={{opacity:0,scale:.72,y:40,x:28}} animate={{opacity:1,scale:1,y:0,x:0}} exit={{opacity:0,scale:.72,y:38,x:24}} transition={spring} className={`flex h-[min(600px,78dvh)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border bg-black/90 shadow-[0_24px_90px_rgba(0,0,0,.7)] backdrop-blur-xl ${warning?"border-amber-400/55":"border-cyan-400/25"}`}>
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 ${warning?"border-amber-400/35":"border-cyan-400/15"}`}><div><p className="font-mono text-xs text-white">Gopal-Bot v1.0 <span className="text-emerald-400">[ONLINE]</span></p><p className="mt-1 font-mono text-[9px] text-slate-600">portfolio_context_node</p></div><div className="flex"><button onClick={()=>setOpen(false)} aria-label="Minimize assistant" className="grid h-10 w-10 place-items-center text-slate-400 hover:text-cyan-300"><Minimize2 className="h-4 w-4"/></button><button onClick={()=>setOpen(false)} aria-label="Close assistant" className="grid h-10 w-10 place-items-center text-slate-400 hover:text-cyan-300"><X className="h-4 w-4"/></button></div></header>
        <div ref={feed} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">{messages.map((message,index)=><motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={spring} className={`max-w-[90%] rounded-xl p-3 text-xs leading-6 ${message.role==="user"?"ml-auto border border-slate-700 bg-transparent text-slate-200":"border-l-2 border-cyan-400 bg-emerald-950/10 text-slate-300"}`}>{message.text}{message.role==="assistant"&&index===messages.length-1&&thinking&&<span className="ml-1 animate-pulse text-emerald-400">█</span>}{message.warning&&<button onClick={reset} className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/30 px-3 py-2 font-mono text-[10px] text-amber-300"><RotateCcw className="h-3 w-3"/>Reset session</button>}</motion.div>)}{thinking&&messages[messages.length-1]?.role!=="assistant"&&<div className="font-mono text-[10px] text-emerald-400">[Calculating semantic vector distances...] <span className="animate-pulse">▮ ▮ ▮</span></div>}{messages.length<=1&&!thinking&&<div className="flex flex-wrap gap-2">{quick.map(item=><button key={item} onClick={()=>respond(item)} className="rounded-full border border-cyan-400/15 bg-cyan-400/[.04] px-3 py-2 font-mono text-[10px] text-cyan-100 hover:border-emerald-400/35">{item}</button>)}</div>}</div>
        <form onSubmit={submit} className="flex shrink-0 gap-2 border-t border-cyan-400/10 p-3"><input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} disabled={thinking} aria-label="Ask Gopal AI assistant" placeholder={thinking?"Calculating vector distances...":"Ask about stack, projects, or experience..."} className="min-w-0 flex-1 rounded-xl border border-cyan-400/15 bg-emerald-950/10 px-3 py-3 font-mono text-[11px] text-white outline-none focus:border-cyan-400/50"/><button disabled={thinking||!input.trim()} aria-label="Send message" className="grid w-11 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 disabled:opacity-30"><Send className="h-4 w-4"/></button></form>
      </motion.section>}</AnimatePresence>
  </div>;
}
