export const posts = [
  {
    slug: "signal-not-a-verdict",
    title: "A Signal Is Not a Verdict: What an AI Text Watermark Actually Proves",
    description: "OpenAI's textGrain watermark is one signal answering one question, provenance. Treat detection as evidence in a policy and review pipeline, and evaluate the detector like any other system.",
    date: "2026-10-07",
    readingTime: "7 min read",
  },
  {
    slug: "flops-to-outcomes",
    title: "From FLOPS to Outcomes: What Should Production AI Optimize?",
    description: "FLOPS, tokens per second and tokens per watt each measure a different layer. Agents add cost per task and, ultimately, how many tasks succeed for the compute spent.",
    date: "2026-10-05",
    readingTime: "6 min read",
  },
  {
    slug: "eval-platform",
    title: "Your AI Eval Suite Can Become Technical Debt",
    description: "Turning every production failure into a permanent eval eventually makes the suite the bottleneck. Triage first: deduplicate the known, protect the novel, tier what runs where, and evaluate the triage too.",
    date: "2026-10-03",
    readingTime: "7 min read",
  },
  {
    slug: "agent-runtime-security",
    title: "A System Prompt Is Not a Security Boundary",
    description: "Agents can now query databases, call APIs and run code. What limits them should live in identity, policy, sandboxing and tool authorization, not in an instruction to the model.",
    date: "2026-10-02",
    readingTime: "5 min read",
  },
  {
    slug: "production-failures-regression-tests",
    title: "Your Agent's Most Valuable Dataset Is Its Production Failures",
    description: "CoreWeave Forge frames AI work as a run-observe-curate-improve-evaluate loop. The engineering lesson: map each failure type to an eval, test every layer of an agent, and gate every fix.",
    date: "2026-10-02",
    readingTime: "6 min read",
  },
  {
    slug: "typed-decisions-not-paragraphs",
    title: "Typed Decisions, Not Paragraphs: What Jev Gets Right About Agentic Systems",
    description: "Why decision steps in agent systems need typed outputs, calibrated confidence, and a human exit, and how TypeSafe AI's Jev model approaches that from the model side.",
    date: "2026-09-30",
    readingTime: "6 min read",
  },
] as const;
