"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

type Audience = "recruiter" | "engineer";
const KEY = "gopal-audience-mode";

// Doesn't reorder the page — the section order, nav anchors, and command
// palette all depend on it staying fixed. Instead this re-emphasizes what's
// most relevant to who's looking, right where the profile intro already
// sits, using content that's real either way (résumé/contact vs. stack/case
// studies) — same facts, different lead.
export function AudienceHighlight() {
  const [audience, setAudience] = useState<Audience>("recruiter");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "recruiter" || saved === "engineer") setAudience(saved);
  }, []);

  function choose(next: Audience) {
    setAudience(next);
    localStorage.setItem(KEY, next);
  }

  return (
    <div className="mt-10 rounded-[var(--radius-md)] border border-white/[.12] bg-white/[.02] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[9px] uppercase tracking-[.14em] text-[var(--faint)]">Viewing as</p>
        <div role="tablist" aria-label="Audience" className="flex gap-1 rounded-[var(--radius-pill)] border border-white/[.1] p-1">
          {(["recruiter", "engineer"] as const).map((a) => (
            <button
              key={a}
              role="tab"
              aria-selected={audience === a}
              onClick={() => choose(a)}
              className={`rounded-[var(--radius-pill)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.06em] transition-colors ${audience === a ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--faint)] hover:text-[var(--muted)]"}`}
            >
              {a === "recruiter" ? "Recruiter" : "Engineer"}
            </button>
          ))}
        </div>
      </div>

      {audience === "recruiter" ? (
        <div className="mt-5">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Available for Generative AI Engineering and AI Architecture roles, based in India — 7+ years domain
            experience, 9 blueprint systems, 23 credentials retained.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/Gopalakrishna_Maddipalli_CV.pdf" className="btn-pill btn-pill--solid">
              Download résumé
            </a>
            <a href="#contact" className="btn-pill btn-pill--outline">
              Contact
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Llama 3 · LangGraph · vLLM · Qdrant · FastAPI · AWS — nine real architecture blueprints spanning RAG,
            multi-agent orchestration, document intelligence, and predictive ML, each with its own system flow.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/projects" className="btn-pill btn-pill--solid">
              Explore case studies
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a href="#skills" className="btn-pill btn-pill--outline">
              Inspect the stack
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
