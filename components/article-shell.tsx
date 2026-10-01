import type { ReactNode } from "react";

export const sectionId = (title: string) =>
  title.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Two-column article layout: a sticky rail (metadata + section index) beside
// a wide reading column, so long-form posts use the width of large screens
// instead of floating in a narrow centred strip.
export function ArticleShell({
  meta,
  sections,
  children,
}: {
  meta: string[];
  sections: string[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[92rem] gap-10 px-5 pb-28 pt-16 sm:px-10 sm:pt-24 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-24">
      <aside className="hidden lg:block">
        <div className="sticky top-24 border-t border-[var(--border-strong)] pt-5 font-mono text-[11px] uppercase leading-6 tracking-[.12em] text-[var(--muted)]">
          {meta.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <p className="mt-8 text-[var(--faint)]">On this page</p>
          <ol className="mt-2 space-y-2 normal-case tracking-normal">
            {sections.map((title, i) => (
              <li key={title} className="flex gap-3 font-sans text-[13px] leading-5">
                <span className="font-mono text-[11px] text-[var(--faint)]">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${sectionId(title)}`} className="text-[var(--muted)] hover:text-[var(--accent)]">{title}</a>
              </li>
            ))}
          </ol>
        </div>
      </aside>
      <article className="min-w-0 max-w-[60rem]">{children}</article>
    </div>
  );
}
