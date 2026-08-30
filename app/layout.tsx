import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../components/json-ld";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CursorGlow } from "../components/cursor-glow";
import { PageTransition } from "../components/page-transition";

export const metadata: Metadata = {
  title: { default: "Gopalakrishna — Generative AI Engineer", template: "%s | Gopalakrishna" },
  description:
    "Generative AI Engineer building production RAG systems, autonomous agents, and intelligent workflows.",
  metadataBase: new URL("https://gopalakrishnagenai.in"),
  applicationName: "Gopalakrishna GenAI",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: { title: "Gopalakrishna — Generative AI Engineer", description: "Production-minded RAG, agentic systems, and LLM inference engineering.", url: "/", siteName: "Gopalakrishna GenAI", type: "profile", images:[{url:"/opengraph-image",width:1200,height:630,alt:"Gopalakrishna — Generative AI Engineer"}] },
  twitter: { card: "summary_large_image", title: "Gopalakrishna — Generative AI Engineer", description: "RAG, autonomous agents, and optimized LLM systems.", images:["/opengraph-image"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><JsonLd /></head>
      <body className="bg-[#050505] text-white antialiased font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}<CursorGlow/><PageTransition/><Analytics/><SpeedInsights/>
      </body>
    </html>
  );
}
