import { ImageResponse } from "next/og";

export const alt = "Gopalakrishna — Generative AI Engineer building RAG and agentic systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
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
        <span>Gopalakrishna Maddipalli</span><span>India · 2026</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 600, lineHeight: .82, letterSpacing: -7, textTransform: "uppercase" }}>
        <span>Generative</span><span>Intelligence</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 30, borderTop: "1px solid rgba(255,255,255,.18)", fontSize: 15, letterSpacing: 2.5, textTransform: "uppercase" }}>
        <span style={{ color: "#63b3ff" }}>RAG · Agents · Evaluation · LLMOps</span>
        <span style={{ color: "#a8a8a8" }}>Systems that reason with context</span>
      </div>
    </div>,
    size,
  );
}
