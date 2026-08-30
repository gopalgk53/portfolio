"use client";

import { useEffect, useState } from "react";

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Real, live GitHub activity — not a fabricated "always online" claim.
// Goes through this site's own /api/github-activity (a thin server-side
// proxy) rather than fetching api.github.com directly from the browser,
// since the page's CSP deliberately only allows same-origin connections.
// Renders nothing at all if the request fails or returns no events, rather
// than showing a stale or made-up fallback.
export function GithubActivity() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-activity")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { createdAt: string | null }) => {
        if (!cancelled && data.createdAt) setLabel(relativeTime(data.createdAt));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) return null;

  return (
    <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--faint)]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8fae90]" />
      Last commit activity {label}
    </span>
  );
}
