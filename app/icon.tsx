import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "#080909", color: "#f0eee7", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", right: -100, top: -100, width: 360, height: 360, display: "flex", border: "2px solid rgba(217,255,67,.28)", transform: "rotate(28deg)" }} />
      <div style={{ position: "absolute", right: 112, top: 102, width: 18, height: 18, display: "flex", borderRadius: 20, background: "#d9ff43", boxShadow: "0 0 65px 24px rgba(217,255,67,.22)" }} />
      <div style={{ display: "flex", alignItems: "flex-end", fontSize: 190, fontWeight: 600, lineHeight: 1, letterSpacing: -18 }}>
        <span>G</span><span style={{ color: "#d9ff43" }}>K</span>
      </div>
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 42, height: 2, display: "flex", background: "rgba(255,255,255,.18)" }} />
    </div>,
    size,
  );
}
