"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { nav } from "../lib/nav";
import { spring } from "../lib/motion";

type Command = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Actions";
  href?: string;
  action?: () => void;
};

// ⌘K / Ctrl+K anywhere on the site opens this. The nav group is built from
// the same list the header nav renders (lib/nav.ts) so the two can't drift
// apart; the actions group covers the things a visitor would otherwise dig
// for (the AI assistant, the résumé, the full case-study archive).
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      ...nav.map(([label, id]) => ({ id, label: `Jump to ${label}`, hint: `G ${label[0].toUpperCase()}`, group: "Navigate" as const, href: `#${id}` })),
      { id: "assistant", label: "Ask the AI assistant", hint: "A", group: "Actions" as const, action: () => window.dispatchEvent(new CustomEvent("gopal-open-assistant")) },
      { id: "resume", label: "Open résumé", hint: "R", group: "Actions" as const, href: "/Gopalakrishna_Maddipalli_CV.pdf" },
      { id: "cases", label: "Explore all case studies", hint: "↵", group: "Actions" as const, href: "/projects" },
      { id: "changelog", label: "View changelog", hint: "↵", group: "Actions" as const, href: "/changelog" },
      { id: "security", label: "Security & privacy", hint: "↵", group: "Actions" as const, href: "/security" },
      { id: "terminal", label: "Open terminal mode", hint: "T", group: "Actions" as const, href: "/terminal" },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => setSelected(0), [query, open]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.clearTimeout(focusTimer);
      };
    }
    setQuery("");
  }, [open]);

  function activate(command: Command) {
    setOpen(false);
    if (command.action) command.action();
    else if (command.href) window.location.href = command.href;
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((v) => Math.min(v + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((v) => Math.max(v - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = filtered[selected];
      if (command) activate(command);
    }
  }

  const groups: Array<"Navigate" | "Actions"> = ["Navigate", "Actions"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="no-print fixed inset-0 z-[200] flex items-start justify-center bg-[var(--bg)]/72 px-5 pt-[14vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={spring}
            className="glass-panel w-full max-w-[620px] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={onListKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to a section or run a command…"
                aria-label="Search commands"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[var(--faint)]"
              />
              <kbd className="font-mono text-[10px] tracking-[.1em] text-[var(--faint)]">ESC</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {groups.map((group) => {
                const items = filtered.filter((c) => c.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} className="py-2">
                    <p className="px-3 pb-1 font-mono text-[9px] uppercase tracking-[.18em] text-[var(--faint)]">{group}</p>
                    {items.map((command) => {
                      const index = filtered.indexOf(command);
                      const isSelected = index === selected;
                      return (
                        <button
                          key={command.id}
                          onMouseEnter={() => setSelected(index)}
                          onClick={() => activate(command)}
                          className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm transition-colors ${isSelected ? "bg-[var(--accent-soft)] text-white" : "text-[var(--muted)]"}`}
                        >
                          <span>{command.label}</span>
                          <span className="ml-auto font-mono text-[10px] text-[var(--faint)]">{command.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {!filtered.length && <p className="px-3 py-6 text-center text-sm text-[var(--faint)]">No matches.</p>}
            </div>

            <div className="flex items-center gap-5 border-t border-white/10 px-5 py-3 font-mono text-[9px] uppercase tracking-[.1em] text-[var(--faint)]">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">⌘K toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
