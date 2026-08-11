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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><JsonLd /></head>
      <body className="bg-[#0A0D12] text-slate-100 antialiased font-sans">{children}</body>
    </html>
  );
}
