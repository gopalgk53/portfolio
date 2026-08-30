"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { projects } from "../lib/data";
import { spring } from "../lib/motion";

type Result = { id: string; relevance: string };
type Mode = "idle" | "live" | "cache" | "fallback";

const project = (id: string) => projects.find((p) => p.id === id)!;

// A crude but honest client-side fallback for when the live model is
// unavailable — literal keyword overlap against the real project fields,
// not a fabricated "AI match". Kept clearly labeled as offline in the UI.
function localMatch(query: string): Result[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = projects.map((p) => {
    const haystack = `${p.title} ${p.category} ${p.goal} ${p.impact} ${p.stack.join(" ")} ${p.flow}`.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    return { id: p.id, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => ({ id: s.id, relevance: "Keyword match" }));
}

export function ProjectSearch() {
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
          placeholder="Search the real project corpus — e.g. “vector database experience”"
          aria-label="Search projects"
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
              const p = project(result.id);
              return (
                <motion.a
                  key={result.id}
                  href={`/projects/${result.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: index * 0.04 }}
                  className="glow-card flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-white/[.1] px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-medium text-white">{p.title}</span>
                    <span className="ml-2 text-[var(--muted)]">{result.relevance || p.impact}</span>
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
