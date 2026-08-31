"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { certifications, projects, skills } from "../lib/data";

type Line = { type: "input" | "output" | "error"; text: string };

const BANNER = [
  "gopal-bot terminal v1.0 — type `help` to see what's real here.",
  "Every command below reads this site's actual data. Nothing is generated.",
].join("\n");

function projectsList() {
  return projects.map((p, i) => `${String(i + 1).padStart(2, "0")}  ${p.id.padEnd(20)}  ${p.title}`).join("\n") + "\n\nType `project <id>` for details, e.g. `project legal-rag`.";
}

function projectDetail(id: string) {
  const p = projects.find((project) => project.id === id.trim());
  if (!p) return `No project with id "${id}". Type \`projects\` to list valid ids.`;
  return [
    `${p.title} — ${p.category}`,
    `goal:    ${p.goal}`,
    `impact:  ${p.impact}`,
    `stack:   ${p.stack.join(", ")}`,
    `flow:    ${p.flow}`,
    `link:    /projects/${p.id}`,
  ].join("\n");
}

function skillsList() {
  return skills.map((group) => `${group.group}\n  ${group.items.join(", ")}`).join("\n\n");
}

function certsList() {
  return `${certifications.length} certifications on file:\n\n` + certifications.map(([name, issuer], i) => `${String(i + 1).padStart(2, "0")}. ${name} — ${issuer}`).join("\n");
}

function whoami() {
  return [
    "Gopalakrishna Maddipalli — Generative AI Engineer, India.",
    "Seven years across construction operations and data science, now focused on",
    "production RAG systems, multi-agent orchestration, and applied LLM engineering.",
    "Type `projects`, `skills`, `certs`, or `contact` to dig in.",
  ].join("\n");
}

function contact() {
  return ["email:   gopalgk53@yahoo.com", "résumé:  /Gopalakrishna_Maddipalli_CV.pdf", "site:    https://gopalakrishnagenai.in"].join("\n");
}

export function TerminalShell() {
  const [lines, setLines] = useState<Line[]>([{ type: "output", text: BANNER }]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo(
    () => ({
      help: () =>
        [
          "commands:",
          "  whoami            short bio",
          "  projects          list all project ids",
          "  project <id>      show one project's real detail",
          "  skills            list skill groups",
          "  certs             list all 23 certifications",
          "  contact           email, résumé, site",
          "  open <path>       navigate this site, e.g. `open /projects`",
          "  clear             clear this terminal",
          "  exit              back to the real site",
        ].join("\n"),
      whoami,
      projects: projectsList,
      skills: skillsList,
      certs: certsList,
      certifications: certsList,
      contact,
    }),
    [],
  );

  function run(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setLines((current) => [...current, { type: "input", text: trimmed }]);
    setHistory((current) => [...current, trimmed]);
    setHistoryIndex(null);

    const [cmd, ...rest] = trimmed.split(/\s+/);
    const arg = rest.join(" ");
    const key = cmd.toLowerCase();

    if (key === "clear") {
      setLines([]);
      return;
    }
    if (key === "exit" || key === "home") {
      window.location.href = "/";
      return;
    }
    if (key === "open") {
      const path = arg.startsWith("/") || arg.startsWith("http") ? arg : `/${arg}`;
      setLines((current) => [...current, { type: "output", text: `→ navigating to ${path}` }]);
      window.setTimeout(() => {
        window.location.href = path;
      }, 400);
      return;
    }
    if (key === "project") {
      setLines((current) => [...current, { type: arg ? "output" : "error", text: arg ? projectDetail(arg) : "usage: project <id> — try `projects` first." }]);
      return;
    }
    if (key === "sudo") {
      setLines((current) => [...current, { type: "error", text: "permission denied: you don't run this pipeline. try `contact` instead." }]);
      return;
    }
    const handler = commands[key as keyof typeof commands];
    if (handler) {
      setLines((current) => [...current, { type: "output", text: handler() }]);
      return;
    }
    setLines((current) => [...current, { type: "error", text: `command not found: ${cmd}. type \`help\`.` }]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    run(input);
    setInput("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col bg-black text-[#c7f7c7]" onClick={() => inputRef.current?.focus()}>
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[.12em] text-[var(--faint)]">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--accent)]">
          ← back to gopalakrishnagenai.in
        </Link>
        <span>terminal · type help</span>
      </header>
      <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-6 font-mono text-[13px] leading-6">
        {lines.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${line.type === "input" ? "text-white" : line.type === "error" ? "text-[#e08787]" : "text-[#8fdc8f]"}`}>
            {line.type === "input" ? `$ ${line.text}` : line.text}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 px-5 py-4 font-mono text-[13px]">
        <span className="text-white">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal command input"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[#c7f7c7] outline-none placeholder:text-[var(--faint)]"
          placeholder="type a command…"
        />
      </form>
    </main>
  );
}
