"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const systems = [
  { zone: "Payment protection", title: "Construction Payment Risk Prediction", signal: "Risk signals → human review", detail: "Synthetic workflow intelligence · frozen threshold 0.20", tone: "blue" },
  { zone: "Payment protection", title: "Lien Recommendation Engine", signal: "State rules → deadline path", detail: "Notice timing · evidence · approval gates", tone: "gold" },
  { zone: "Payment protection", title: "Explainable Payment Intelligence", signal: "Prediction → defensible drivers", detail: "Feature effects · SHAP · governed explanations", tone: "blue" },
  { zone: "Payment protection", title: "Construction Compliance Copilot", signal: "Intake → controlled action", detail: "Documents · deadlines · human approval", tone: "gold" },
  { zone: "Document intelligence", title: "Construction Document Intelligence", signal: "PDF → structured evidence", detail: "OCR · entity extraction · review states", tone: "blue" },
  { zone: "Document intelligence", title: "Claims & Contract Intelligence", signal: "Clauses → obligation matrix", detail: "Claims · evidence · source-linked findings", tone: "gold" },
  { zone: "Document intelligence", title: "Construction Data Lakehouse", signal: "Operations → governed data", detail: "S3 · Glue · Athena · executive analytics", tone: "blue" },
  { zone: "Grounded intelligence", title: "AI Legal Assistant", signal: "Sources → grounded answers", detail: "Retrieval · reranking · citations · abstention", tone: "violet" },
  { zone: "Grounded intelligence", title: "Multi-Agent Construction AI", signal: "Planner → specialist network", detail: "Compliance · risk · communication · audit", tone: "violet" },
] as const;

const FRAME_MS = 4500;

export function ProjectShowcase() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || hasStarted) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasStarted(true);
        setPlaying(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (active === systems.length - 1) setPlaying(false);
      else setActive((value) => value + 1);
    }, FRAME_MS);
    return () => window.clearTimeout(timer);
  }, [active, playing]);

  function replay() {
    setActive(0);
    setPlaying(true);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const system = systems[active];

  return (
    <section ref={stageRef} id="showcase" className={`project-showcase project-showcase--${system.tone}`} aria-labelledby="showcase-title">
      <div className="showcase-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <header className="showcase-header">
        <div>
          <p className="eyebrow">Portfolio film / Nine connected systems</p>
          <h2 id="showcase-title">From workflow friction<br />to governed intelligence.</h2>
        </div>
        <div className="showcase-controls">
          <span>{String(active + 1).padStart(2, "0")} / {String(systems.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause portfolio showcase" : "Play portfolio showcase"}>
            {playing ? <Pause /> : <Play />}
          </button>
          <button type="button" onClick={replay} aria-label="Replay portfolio showcase"><RotateCcw /></button>
        </div>
      </header>

      <div className="showcase-stage">
        <div className="showcase-horizon" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
        </div>
        <div className="showcase-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="showcase-copy" key={system.title}>
          <p>{system.zone}</p>
          <h3>{system.title}</h3>
          <strong>{system.signal}</strong>
          <span>{system.detail}</span>
        </div>
        <div className="showcase-architecture" aria-hidden="true">
          <span className="showcase-core" />
          {Array.from({ length: 7 }).map((_, index) => <span key={index} className={`showcase-module showcase-module--${index + 1}`} />)}
        </div>
      </div>

      <nav className="showcase-timeline" aria-label="Portfolio showcase chapters">
        {systems.map((item, index) => (
          <button key={item.title} type="button" onClick={() => { setActive(index); setPlaying(false); }} aria-label={`Show ${item.title}`} aria-current={active === index ? "step" : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span><i>{item.title}</i>
          </button>
        ))}
      </nav>
      <div className="showcase-progress" aria-hidden="true"><span key={`${active}-${playing}`} className={playing ? "is-playing" : ""} /></div>
      <p className="showcase-boundary">Synthetic where stated · Source-aware · Human-reviewed · No automated legal decisions</p>
    </section>
  );
}
