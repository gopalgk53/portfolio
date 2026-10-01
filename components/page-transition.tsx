"use client";

import { useEffect, useState } from "react";

const FLAG = "gopal-page-transition";

// A brief curtain beat around navigating into a case study. Since these
// are real full-page navigations (plain <a> tags, not client routing), this
// can't animate across the load the way an SPA transition would — instead
// it fades the curtain in right as you click (covering the moment the
// browser tears down this page) and, via a sessionStorage flag read on the
// next page's first paint, fades back out on arrival. Always rendered (at
// opacity 0 when idle) so the CSS transition has something to animate
// instead of fighting a mount/unmount. Off entirely under
// prefers-reduced-motion.
export function PageTransition() {
  const [opacity, setOpacity] = useState(() => (typeof window !== "undefined" && sessionStorage.getItem(FLAG) ? 1 : 0));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (sessionStorage.getItem(FLAG)) {
      sessionStorage.removeItem(FLAG);
      const frame = requestAnimationFrame(() => setOpacity(0));
      return () => cancelAnimationFrame(frame);
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/projects")) return;
      sessionStorage.setItem(FLAG, "1");
      setOpacity(1);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-[250] bg-[var(--bg)]"
      style={{ opacity, transition: "opacity 320ms ease-out" }}
    />
  );
}
