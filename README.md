# Generative AI Engineer Portfolio

Single-page portfolio for Gopalakrishna Maddipalli — a cinematic, editorial-style
site built around production Generative AI, advanced RAG, and autonomous
multi-agent workflows. Next.js 15 · React 19 · Tailwind 4 · Framer Motion ·
Three.js.

## Highlights

- Restrained, near-black editorial visual system — single accent color, no
  glassmorphism, dramatic type scale.
- An AI Knowledge Network background: a real graph of the stages an
  agentic RAG system moves through (Documents → Embeddings → Vector DB →
  Retriever → LLM → Memory → Agents → Tools → APIs → AWS), scroll-linked to
  whichever section is in view.
- Dedicated retrieval-loop and agent-coordination visualizations built from
  the actual documented architecture of the flagship RAG and multi-agent
  projects.
- Nine full GenAI project case studies, a skills/tech ecosystem, an
  experience timeline, certifications, a live AI chat assistant, and a
  contact form — all grounded in real, verified content (see `lib/data.ts`).
- Full `prefers-reduced-motion` and mobile-adaptive 3D quality support.

## Development

```bash
npm install
npm run dev
```

## Deployment

Hosted on Vercel (not GitHub Pages) because `app/api/chat` and
`app/api/contact` are server route handlers — they need a Node runtime, which
a static export can't provide. See the project owner's deployment notes for
the `vercel link` / environment-variable / DNS steps.
