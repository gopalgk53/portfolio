import { ImageResponse } from "next/og";
import { projects } from "../../../lib/data";

export const alt = "Project case study — Gopalakrishna, Generative AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

// Same visual language as the site-wide app/opengraph-image.tsx (same
// palette, same corner motif) but carrying this specific project's real
// title/category/stack instead of the generic homepage line — so a shared
// case-study link previews the actual case study, not the homepage.
export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.id === slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          color: "#ffffff",
          background: "#050505",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -80, top: -120, width: 560, height: 560, display: "flex", border: "1px solid rgba(99,179,255,.25)", transform: "rotate(24deg)" }} />
        <div style={{ position: "absolute", right: 205, top: 154, width: 18, height: 18, display: "flex", borderRadius: 20, background: "#63b3ff", boxShadow: "0 0 70px 25px rgba(99,179,255,.18)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, letterSpacing: 3, color: "#a8a8a8", textTransform: "uppercase" }}>
          <span>Gopalakrishna Maddipalli</span>
          <span>{project?.category ?? "Case study"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: project && project.title.length > 28 ? 62 : 78, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
          <span>{project?.title ?? "Project case study"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 30, borderTop: "1px solid rgba(255,255,255,.18)", fontSize: 15, letterSpacing: 2.5, textTransform: "uppercase" }}>
          <span style={{ color: "#63b3ff" }}>{project?.stack.slice(0, 4).join(" · ") ?? "Architecture blueprint"}</span>
          <span style={{ color: "#a8a8a8" }}>Case study</span>
        </div>
      </div>
    ),
    size,
  );
}
