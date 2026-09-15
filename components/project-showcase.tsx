"use client";

import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const systems = [
  { zone: "Payment protection", title: "Construction Payment Risk Prediction", short: "Payment risk", signal: "Risk signals → human review", detail: "Synthetic workflow intelligence · frozen threshold 0.20", tone: "blue", visual: ["Payment history", "Escalation rate", "Chain completeness"] },
  { zone: "Payment protection", title: "Lien Recommendation Engine", short: "Lien pathways", signal: "State rules → deadline path", detail: "Notice timing · evidence · approval gates", tone: "gold", visual: ["Jurisdiction", "Notice window", "Review gate"] },
  { zone: "Payment protection", title: "Explainable Payment Intelligence", short: "Explanations", signal: "Prediction → defensible drivers", detail: "Feature effects · SHAP · governed explanations", tone: "blue", visual: ["Prior escalation", "Missing fields", "Project conflict"] },
  { zone: "Payment protection", title: "Construction Compliance Copilot", short: "Compliance", signal: "Intake → controlled action", detail: "Documents · deadlines · human approval", tone: "gold", visual: ["Evidence intake", "Rule check", "Approval"] },
  { zone: "Document intelligence", title: "Construction Document Intelligence", short: "Document AI", signal: "PDF → structured evidence", detail: "OCR · entity extraction · review states", tone: "blue", visual: ["Document", "Entities", "Evidence"] },
  { zone: "Document intelligence", title: "Claims & Contract Intelligence", short: "Claims", signal: "Clauses → obligation matrix", detail: "Claims · evidence · source-linked findings", tone: "gold", visual: ["Clause", "Obligation", "Citation"] },
  { zone: "Document intelligence", title: "Construction Data Lakehouse", short: "Lakehouse", signal: "Operations → governed data", detail: "S3 · Glue · Athena · executive analytics", tone: "blue", visual: ["S3", "Glue", "Athena"] },
  { zone: "Grounded intelligence", title: "AI Legal Assistant", short: "Legal assistant", signal: "Sources → grounded answers", detail: "Retrieval · reranking · citations · abstention", tone: "violet", visual: ["Retrieve", "Ground", "Cite"] },
  { zone: "Grounded intelligence", title: "Multi-Agent Construction AI", short: "Agent network", signal: "Planner → specialist network", detail: "Compliance · risk · communication · audit", tone: "violet", visual: ["Planner", "Specialists", "Audit"] },
] as const;

const FRAME_MS = 4500;
const TOTAL_SECONDS = (systems.length * FRAME_MS) / 1000;

export function ProjectShowcase() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || hasStarted) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHasStarted(true); setPlaying(true); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const next = value + 100;
        if (next < FRAME_MS) return next;
        setActive((current) => {
          if (current === systems.length - 1) { setPlaying(false); return current; }
          return current + 1;
        });
        return 0;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  const replay = useCallback(() => {
    setActive(0); setElapsed(0); setPlaying(true);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const toggleFullscreen = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.requestFullscreen();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!stageRef.current?.matches(":hover") && document.fullscreenElement !== stageRef.current) return;
      if (event.code === "Space") { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === "r") replay();
      if (event.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [replay, toggleFullscreen]);

  const system = systems[active];
  const totalElapsed = ((active * FRAME_MS) + elapsed) / 1000;

  return (
    <section ref={stageRef} id="showcase" className={`project-showcase project-showcase--${system.tone}`} aria-labelledby="showcase-title">
      <div className="showcase-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <aside className="showcase-rail" aria-label="Portfolio capabilities">
        <div className="showcase-mark"><span>GK</span><b>System portfolio</b></div>
        <p>Connected capabilities</p>
        <nav>{systems.map((item, index) => (
          <button key={item.title} type="button" onClick={() => { setActive(index); setElapsed(0); setPlaying(false); }} aria-current={active === index ? "step" : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span><i>{item.short}</i><b aria-hidden="true" />
          </button>
        ))}</nav>
      </aside>

      <div className="showcase-film">
        <header className="showcase-header">
          <div><p className="eyebrow">Portfolio film / Nine connected systems</p><h2 id="showcase-title">From workflow friction<br />to governed intelligence.</h2></div>
          <span className="showcase-count">{String(active + 1).padStart(2, "0")} / {String(systems.length).padStart(2, "0")}</span>
        </header>
        <div className="showcase-stage">
          <div className="showcase-scene" key={system.title}>
            <div className="showcase-copy"><p>{system.zone}</p><h3>{system.title}</h3><strong>{system.signal}</strong><span>{system.detail}</span></div>
            <div className={`showcase-visual showcase-visual--${active + 1}`} aria-hidden="true">
              <div className="showcase-core"><i /></div>
              {system.visual.map((label, index) => <div className={`showcase-node showcase-node--${index + 1}`} key={label}><span>{label}</span><i /></div>)}
              <div className="showcase-scan" />
            </div>
          </div>
        </div>
        <div className="showcase-player" aria-label="Showcase playback controls">
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause portfolio showcase" : "Play portfolio showcase"}>{playing ? <Pause /> : <Play />}</button>
          <button type="button" onClick={replay} aria-label="Restart portfolio showcase"><RotateCcw /></button>
          <div className="showcase-scrub" aria-hidden="true"><span style={{ width: `${Math.min(100, (totalElapsed / TOTAL_SECONDS) * 100)}%` }} /></div>
          <output>{totalElapsed.toFixed(1)} / {TOTAL_SECONDS.toFixed(1)}</output>
          <button type="button" onClick={toggleFullscreen} aria-label="View showcase fullscreen"><Maximize2 /></button>
        </div>
        <p className="showcase-shortcuts">Space: play/pause · R: restart · F: fullscreen</p>
        <p className="showcase-boundary">Synthetic where stated · Source-aware · Human-reviewed · No automated legal decisions</p>
      </div>
    </section>
  );
}
