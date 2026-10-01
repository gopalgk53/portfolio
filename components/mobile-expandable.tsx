"use client";

import { ChevronDown } from "lucide-react";
import { Children, useId, useRef, useState, type ReactNode } from "react";

// Shows only the first `limit` items on phones, with a control to reveal the
// rest. Desktop always shows everything.
//
// The collapse is CSS only (`hidden md:contents`), not a viewport check in
// JavaScript: the server and the first client render agree on every screen
// size, so there is no hydration mismatch and no flash of the full list
// before it collapses. `contents` keeps each item a direct layout child of
// `className`, so grids and flex columns behave exactly as if the wrapper
// were not there.
export function MobileExpandable({
  children,
  limit,
  noun,
  className,
}: {
  children: ReactNode;
  limit: number;
  noun: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const hiddenCount = items.length - limit;

  if (hiddenCount <= 0) return <div className={className}>{children}</div>;

  function toggle() {
    const next = !open;
    setOpen(next);
    // Collapsing from the bottom of a long list would otherwise strand the
    // reader far below where the list now ends.
    if (!next) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div id={listId} ref={listRef} className={`scroll-mt-24 ${className ?? ""}`}>
        {items.map((child, index) => (
          <div key={index} className={index >= limit && !open ? "hidden md:contents" : "contents"}>
            {child}
          </div>
        ))}
      </div>
      {/* md:hidden sits on this wrapper, not the button: .btn-pill sets its
          own display outside Tailwind's layers and would beat the utility,
          leaving the control visible on desktop. */}
      <div className="mt-6 md:hidden">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={listId}
          className="btn-pill btn-pill--outline w-full"
        >
          {open ? "Show fewer" : `Show ${hiddenCount} more ${noun}`}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

// Same idea for a single tall block rather than a list: on phones the body
// stays behind a button, on desktop it is always shown. The heading above it
// is left to the caller so the section still says what is inside.
export function MobileDisclosure({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <>
      <div className="mb-6 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="btn-pill btn-pill--outline w-full"
        >
          {open ? "Hide" : label}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
      <div id={bodyId} className={open ? "block" : "hidden md:block"}>
        {children}
      </div>
    </>
  );
}
