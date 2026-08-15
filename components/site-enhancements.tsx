"use client";

import { Gauge, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type EffectsMode = "low" | "balanced" | "immersive";

const KEY = "gopal-effects-mode";
const modes: Array<{ id: EffectsMode; label: string; icon: typeof Gauge }> = [
  { id: "low", label: "Low", icon: Gauge },
  { id: "balanced", label: "Balanced", icon: Sparkles },
  { id: "immersive", label: "Immersive", icon: Zap },
];

export function SiteEnhancements() {
  const [mode, setMode] = useState<EffectsMode>("balanced");
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const legacyLow = localStorage.getItem("gopal-reduced-effects") === "true";
    const saved = localStorage.getItem(KEY) as EffectsMode | null;
    const prefersLow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = saved && modes.some(item => item.id === saved) ? saved : legacyLow || prefersLow ? "low" : "balanced";
    setMode(initial);
    localStorage.setItem(KEY, initial);
    document.documentElement.dataset.effects = initial;
    const announceInitial = requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("gopal-effects", { detail: { mode: initial } })));

    const track = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a,button");
      if (!target) return;
      const label = (target.textContent || target.getAttribute("aria-label") || "").trim().slice(0, 80);
      const history = JSON.parse(sessionStorage.getItem("gopal-private-events") || "[]");
      history.push({ event: "interaction", label, path: location.hash || "#top", at: Date.now() });
      sessionStorage.setItem("gopal-private-events", JSON.stringify(history.slice(-50)));
    };
    document.addEventListener("click", track);
    return () => {
      cancelAnimationFrame(announceInitial);
      document.removeEventListener("click", track);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    controlRef.current?.querySelector<HTMLButtonElement>("[role='menuitemradio'][aria-checked='true']")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (controlRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function choose(next: EffectsMode) {
    setMode(next);
    setOpen(false);
    localStorage.setItem(KEY, next);
    localStorage.removeItem("gopal-reduced-effects");
    document.documentElement.dataset.effects = next;
    window.dispatchEvent(new CustomEvent("gopal-effects", { detail: { mode: next } }));
  }

  const active = modes.find(item => item.id === mode) || modes[1];
  const ActiveIcon = active.icon;

  return <div ref={controlRef} className="fixed bottom-5 left-4 z-[90] sm:left-6">
    {open && <div id="effects-intensity-menu" role="menu" aria-label="3D intensity" className="mb-2 w-40 rounded-2xl border border-white/10 bg-[#070812]/92 p-1.5 shadow-2xl backdrop-blur-2xl">
      {modes.map(item => {
        const Icon = item.icon;
        return <button key={item.id} role="menuitemradio" aria-checked={mode === item.id} onClick={() => choose(item.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-mono text-[10px] transition ${mode === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/[.06] hover:text-white"}`}>
          <Icon className="h-3.5 w-3.5"/><span>{item.label}</span>{mode === item.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]"/>}
        </button>;
      })}
    </div>}
    <button ref={triggerRef} onClick={() => setOpen(value => !value)} aria-controls="effects-intensity-menu" aria-expanded={open} aria-haspopup="menu" className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-[#050711]/88 px-3 font-mono text-[9px] text-slate-300 shadow-xl backdrop-blur-xl">
      <ActiveIcon className="h-4 w-4 text-[var(--accent-primary)]"/><span className="hidden sm:inline">3D: {active.label.toUpperCase()}</span><span className="sr-only">Choose 3D animation intensity. Current setting: {active.label}</span>
    </button>
    <span className="sr-only" aria-live="polite">3D animation intensity set to {active.label}</span>
  </div>;
}
