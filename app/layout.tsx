import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "../components/json-ld";

export const metadata: Metadata = {
  title: "Gopalakrishnan — Generative AI Engineer",
  description:
    "Generative AI Engineer building production RAG systems, autonomous agents, and intelligent workflows.",
  metadataBase: new URL("https://gopalakrishnagenai.in"),
  alternates: { canonical: "/" },
  openGraph: { title: "Gopalakrishnan — Generative AI Engineer", description: "Production-minded RAG, agentic systems, and LLM inference engineering.", url: "/", siteName: "Gopalakrishnan GenAI", type: "profile" },
  twitter: { card: "summary_large_image", title: "Gopalakrishnan — Generative AI Engineer", description: "RAG, autonomous agents, and optimized LLM systems." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/><JsonLd /></head>
      <body className="bg-[#0A0D12] text-slate-100 antialiased font-sans">{children}</body>
    </html>
  );
}
