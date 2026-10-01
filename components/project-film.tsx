"use client";

import { Reveal } from "./reveal";

// Music-only project films: every idea is carried by on-screen text, so they
// work muted. preload="none" keeps the MP4 off the network until play.
export function ProjectFilm({
  src,
  poster,
  eyebrow,
  title,
  description,
}: {
  src: string;
  poster: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <video
          className="mt-8 aspect-video w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[#0F172A] shadow-[0_30px_70px_-32px_rgba(15,23,42,.45)]"
          controls
          preload="none"
          playsInline
          poster={poster}
        >
          <source src={src} type="video/mp4" />
          Your browser can&apos;t play this video. <a href={src}>Download the MP4</a>.
        </video>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </Reveal>
    </>
  );
}
