import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505", color: "#ffffff", fontFamily: "Arial, sans-serif", fontSize: 72, fontWeight: 600, letterSpacing: -7 }}>
      <span>G</span><span style={{ color: "#63b3ff" }}>K</span>
    </div>,
    size,
  );
}
