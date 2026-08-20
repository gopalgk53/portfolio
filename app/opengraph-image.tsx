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
        color: "#f0eee7",
        background: "#080909",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", right: -80, top: -120, width: 560, height: 560, display: "flex", border: "1px solid rgba(217,255,67,.25)", transform: "rotate(24deg)" }} />
      <div style={{ position: "absolute", right: 205, top: 154, width: 18, height: 18, display: "flex", borderRadius: 20, background: "#d9ff43", boxShadow: "0 0 70px 25px rgba(217,255,67,.18)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, letterSpacing: 3, color: "#8b8f95", textTransform: "uppercase" }}>
        <span>Gopalakrishna Maddipalli</span><span>India · 2026</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 600, lineHeight: .82, letterSpacing: -7, textTransform: "uppercase" }}>
        <span>Generative</span><span>Intelligence</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 30, borderTop: "1px solid rgba(255,255,255,.18)", fontSize: 15, letterSpacing: 2.5, textTransform: "uppercase" }}>
        <span style={{ color: "#d9ff43" }}>RAG · Agents · Evaluation · LLMOps</span>
        <span style={{ color: "#8b8f95" }}>Systems that reason with context</span>
      </div>
    </div>,
    size,
  );
}
