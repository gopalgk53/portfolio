"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { certifications, projects, skills } from "../lib/data";
import { spring } from "../lib/motion";
import { resolveSourceDisplay, SourceType, TYPE_LABEL } from "../lib/citations";

type ResultType = SourceType;
type Result = { id: string; type: ResultType; relevance: string };
type Mode = "idle" | "live" | "cache" | "fallback";

// Resolves a type-prefixed id (project:<id> / skill:<index> / cert:<index>)
// back to real, renderable content via the shared resolver (also used by
// app/api/search/route.ts and the AI assistant's citations), preferring the
// model's per-result relevance blurb over the resolver's generic subtitle.
function resolveDisplay(result: Result): { title: string; subtitle: string; href: string; external?: boolean } | null {
  const display = resolveSourceDisplay({ id: result.id, type: result.type });
  if (!display) return null;
  return { ...display, subtitle: result.relevance || display.subtitle };
}

// A crude but honest client-side fallback for when the live model is
// unavailable — literal keyword overlap against the real fields, not a
// fabricated "AI match". Kept clearly labeled as offline in the UI.
function localMatch(query: string): Result[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const score = (haystack: string) => terms.reduce((sum, term) => sum + (haystack.toLowerCase().includes(term) ? 1 : 0), 0);

  const scored: Array<{ id: string; type: ResultType; score: number }> = [
    ...projects.map((p) => ({
      id: `project:${p.id}`,
      type: "project" as const,
      score: score(`${p.title} ${p.category} ${p.goal} ${p.impact} ${p.stack.join(" ")} ${p.flow}`),
    })),
    ...skills.map((group, i) => ({
      id: `skill:${i}`,
      type: "skill" as const,
      score: score(`${group.group} ${group.items.join(" ")}`),
    })),
    ...certifications.map(([name, meta], i) => ({
      id: `cert:${i}`,
      type: "certification" as const,
      score: score(`${name} ${meta}`),
    })),
  ];

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => ({ id: s.id, type: s.type, relevance: "Keyword match" }));
}

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [mode, setMode] = useState<Mode>("idle");
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  async function runSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setMode("idle");
      return;
    }
    const thisRequest = ++requestId.current;
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = (await response.json()) as { results?: Result[]; mode?: string };
      if (thisRequest !== requestId.current) return;
      if (!response.ok || !data.results || (data.mode === "fallback" && !data.results.length)) {
        setResults(localMatch(trimmed));
        setMode("fallback");
      } else {
        setResults(data.results);
        setMode((data.mode as Mode) || "live");
      }
    } catch {
      if (thisRequest !== requestId.current) return;
      setResults(localMatch(trimmed));
      setMode("fallback");
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    runSearch(query);
  }

  return (
    <div className="glass-panel mb-10 p-5 sm:p-6">
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accent)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, skills, and credentials — e.g. “vector database experience”"
          aria-label="Search projects, skills, and credentials"
          className="field w-full pl-11 pr-24 text-sm"
        />
        <button type="submit" disabled={loading} className="btn-pill btn-pill--solid absolute right-1.5 top-1.5 !py-2" style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {mode !== "idle" && (
        <div className="mt-4">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[.14em] text-[var(--faint)]">
            {mode === "live" ? "Live ranking · real model" : mode === "cache" ? "Cached ranking" : "Offline keyword match"}
            {" · "}
            {results.length ? `${results.length} match${results.length === 1 ? "" : "es"}` : "no matches"}
          </p>
          <div className="flex flex-col gap-2">
            {results.map((result, index) => {
              const display = resolveDisplay(result);
              if (!display) return null;
              return (
                <motion.a
                  key={result.id}
                  href={display.href}
                  target={display.external ? "_blank" : undefined}
                  rel={display.external ? "noreferrer" : undefined}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: index * 0.04 }}
                  className="glow-card flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-white/[.1] px-4 py-3 text-sm"
                >
                  <span>
                    <span className="mr-2 font-mono text-[9px] uppercase tracking-[.1em] text-[var(--accent)]">{TYPE_LABEL[result.type]}</span>
                    <span className="font-medium text-white">{display.title}</span>
                    <span className="ml-2 text-[var(--muted)]">{display.subtitle}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                </motion.a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
