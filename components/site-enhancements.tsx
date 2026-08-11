"use client";
import { Gauge, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const KEY="gopal-reduced-effects";
export function SiteEnhancements(){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem(KEY)==="true";setReduced(saved);document.documentElement.classList.toggle("reduced-effects",saved);const click=(event:MouseEvent)=>{const target=(event.target as HTMLElement).closest("a,button");if(!target)return;const label=(target.textContent||target.getAttribute("aria-label")||"").trim().slice(0,80);const history=JSON.parse(sessionStorage.getItem("gopal-private-events")||"[]");history.push({event:"interaction",label,path:location.hash||"#top",at:Date.now()});sessionStorage.setItem("gopal-private-events",JSON.stringify(history.slice(-50)));};document.addEventListener("click",click);return()=>document.removeEventListener("click",click)},[]);
 function toggle(){const next=!reduced;setReduced(next);localStorage.setItem(KEY,String(next));document.documentElement.classList.toggle("reduced-effects",next);window.dispatchEvent(new CustomEvent("gopal-effects",{detail:{reduced:next}}));}
 return <button onClick={toggle} aria-pressed={reduced} className="fixed bottom-5 left-4 z-[90] flex h-11 items-center gap-2 rounded-full border border-cyan-400/15 bg-[#050711]/85 px-3 font-mono text-[9px] text-slate-400 shadow-xl backdrop-blur-xl sm:left-6"><span className="sr-only">Toggle reduced visual effects</span>{reduced?<Gauge className="h-4 w-4 text-[#5ee6c4]"/>:<Sparkles className="h-4 w-4 text-violet-300"/>}<span className="hidden sm:inline">{reduced?"EFFECTS: LOW":"EFFECTS: FULL"}</span></button>
}
