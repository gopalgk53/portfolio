"use client";

// A single, honest print trigger: the browser's real print dialog, styled
// output courtesy of app/globals.css's @media print rules — no PDF library,
// no server-side rendering step, nothing more than window.print().
export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--border-strong)] px-[1.3rem] py-[.65rem] font-mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      {label}
    </button>
  );
}
