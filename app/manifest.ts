import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gopalakrishna — Generative AI Engineer",
    short_name: "Gopalakrishna AI",
    description: "Generative AI engineering portfolio focused on RAG systems, autonomous agents, evaluation, and LLM infrastructure.",
    start_url: "/",
    display: "standalone",
    background_color: "#080909",
    theme_color: "#080909",
    categories: ["portfolio", "technology", "artificial intelligence"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
