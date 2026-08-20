import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../components/json-ld";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Gopalakrishna — Generative AI Engineer",
  description:
    "Generative AI Engineer building production RAG systems, autonomous agents, and intelligent workflows.",
  metadataBase: new URL("https://gopalakrishnagenai.in"),
  alternates: { canonical: "/" },
  openGraph: { title: "Gopalakrishna — Generative AI Engineer", description: "Production-minded RAG, agentic systems, and LLM inference engineering.", url: "/", siteName: "Gopalakrishna GenAI", type: "profile", images:[{url:"/og-image.svg",width:1200,height:630,alt:"Gopalakrishna — Generative AI Engineer"}] },
  twitter: { card: "summary_large_image", title: "Gopalakrishna — Generative AI Engineer", description: "RAG, autonomous agents, and optimized LLM systems.", images:["/og-image.svg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><JsonLd /></head>
      <body className="bg-[#0A0A0B] text-[#ece9e2] antialiased font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}<Analytics/><SpeedInsights/>
      </body>
    </html>
  );
}
