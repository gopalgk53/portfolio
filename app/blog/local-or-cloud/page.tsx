import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleShell, sectionId } from "../../../components/article-shell";
import { posts } from "../../../lib/posts";

const post = posts.find((item) => item.slug === "local-or-cloud")!;
const SOURCES = [
  ["Microsoft and GitHub: Bringing local models and sandboxed tools to Windows and GitHub Copilot, 7 October 2026", "https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/"],
  ["Microsoft Source: Building Windows for Hybrid Intelligence, 7 October 2026", "https://news.microsoft.com/source/emea/2026/10/building-windows-for-hybrid-intelligence/"],
  ["GitHub Community: HydraFusion research preview in GitHub Copilot CLI", "https://github.com/orgs/community/discussions/206492"],
] as const;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: ["/media/blog/local-or-cloud/poster.jpg"] },
};

function H2({ children }: { children: string }) {
  return <h2 id={sectionId(children)} className="!mt-16 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-[2rem]">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.08rem] leading-8 text-[var(--muted)]">{children}</p>;
}

function Rows({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border-strong)] text-[12px] text-[var(--faint)]">
          <th className="py-3 pr-4 font-normal">{head[0]}</th>
          <th className="py-3 font-normal">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a} className="border-b border-[var(--border)] align-top">
            <td className="py-4 pr-4 font-semibold">{a}</td>
            <td className="py-4 text-[0.98rem] leading-7 text-[var(--muted)]">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-5 overflow-x-auto border border-[var(--navy-border)] bg-[var(--navy)] p-5 text-[13px] leading-6 text-[var(--navy-text)]">
      <code style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{children}</code>
    </pre>
  );
}

const DIMENSIONS: [string, string][] = [
  ["Capability", "Can this model finish this task at the quality we need? Route on measured task success per task type, not on parameter count."],
  ["Latency", "Time to first token, decode throughput and end-to-end task time. Local removes the network round trip, but cold loads, a growing KV cache and memory pressure can still make it slower."],
  ["Privacy and policy", "Some data shouldn't leave the device, and a local path can help with residency rules. It doesn't replace access control, encryption, sandboxing, log policy or model supply-chain checks."],
  ["Cost", "Cloud means API spend, GPUs, networking and operations. Local means hardware, energy, memory, model updates and fleet complexity. Compare total cost of ownership."],
  ["Reliability", "Network loss, device resource pressure, model unavailability, timeouts and version skew. Fallback is allowed only inside policy."],
];

const ROUTES: [string, string][] = [
  ["A · Classify a short document", "Low complexity, approved for local processing, local model meets the quality bar → LOCAL."],
  ["B · Analyze a multi-document problem", "Needs long context and stronger reasoning, cloud permitted → CLOUD."],
  ["C · Summarize a confidential document", "Restricted data, cloud prohibited → LOCAL. If local can't meet the task: defer, human review or a policy-approved failure. Never a silent hop to the cloud."],
  ["D · Respond while offline", "No network, local model available → LOCAL. Otherwise fail gracefully; a cloud-only task is deferred, not forced onto a model that can't do it."],
];

const EVALS: [string, string][] = [
  ["Routing accuracy", "Did the router pick the route a labelled eval set says it should have?"],
  ["Task success per route", "The same task run locally and in the cloud, scored the same way."],
  ["Latency per route", "Including cold starts and long-context cases, not just warm averages."],
  ["Fallback rate", "How often the preferred route fails, and what happens next."],
  ["Policy compliance", "Restricted requests that reached a disallowed route. The target is zero, and it should be tested, not assumed."],
];

export default function LocalOrCloudPost() {
  const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="case-nav" aria-label="Article navigation">
        <Link href="/blog">← Writing</Link>
        <span>{post.readingTime}</span>
      </nav>

      <ArticleShell meta={[date, post.readingTime, "AI architecture • 005", "Inference routing"]} sections={["What Microsoft and GitHub announced", "From one route to a decision", "Five routing dimensions", "Policy before routing", "The router needs evals too"]}>
        <header>
          <p className="text-[12px] text-[var(--muted)]">
            AI architecture • 005 <span className="text-[var(--faint)]">·</span> {date} <span className="text-[var(--faint)]">·</span> Inference routing
          </p>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            Local or <span className="text-[var(--accent)]">cloud?</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Where should AI inference happen?</p>
          <p className="mt-6 text-[13px] text-[var(--faint)]">Maddipalli Gopalakrishna · AI / ML Engineer</p>
        </header>

        <video className="mt-10 aspect-video w-full border border-[var(--border)] bg-[#07111C]" controls preload="none" playsInline poster="/media/blog/local-or-cloud/poster.jpg">
          <source src="/media/blog/local-or-cloud/local-or-cloud.mp4" type="video/mp4" />
          Your browser can&apos;t play this video. <a href="/media/blog/local-or-cloud/local-or-cloud.mp4">Download the MP4</a>.
        </video>
        <p className="mt-3 text-[12px] text-[var(--faint)]">45 seconds · music only · routed requests on screen are illustrative</p>

        <P>Not every AI request needs to travel to the cloud. And not every AI request should run locally.</P>

        <H2>What Microsoft and GitHub announced</H2>
        <P>
          On 7 October 2026, Microsoft and GitHub said GitHub Copilot will &ldquo;determine when a task is best handled by
          on-device intelligence and when it should leverage cloud-scale models&rdquo;. On NVIDIA RTX Spark PCs such as Surface
          Laptop Ultra, that includes a local version of MAI Code 1.1 Flash, a quantized coding model. Developers can let
          Copilot&apos;s <strong className="font-semibold text-[var(--text)]">Auto</strong> mode route work between local and
          cloud models, which considers task context and cache state, or they can pick a local model or an OpenAI-compatible
          local endpoint themselves.
        </P>
        <P>
          GitHub frames this as the next step for Project HydraFusion, its multi-model orchestrator (still a research
          preview): orchestration across compute environments, not just across models. Microsoft describes the wider Windows
          direction as &ldquo;hybrid intelligence&rdquo;, with agents that run locally when needed and connect to the cloud when
          appropriate.
        </P>
        <P>
          Two lines from GitHub&apos;s post are worth keeping in mind. An agent&apos;s shell commands &ldquo;inherit the access of
          the account running them. Moving inference onto the device doesn&apos;t change that.&rdquo; And &ldquo;local inference
          does not make the session offline.&rdquo; Where a model runs and what an agent is allowed to do are separate questions.
        </P>

        <H2>From one route to a decision</H2>
        <P>The usual architecture has a single execution environment for every request:</P>
        <Code>{`user → application → cloud model API → response`}</Code>
        <P>A hybrid design adds a decision before execution:</P>
        <Code>{`request
  → policy check
  → inference router ─┬─ local model
                      └─ cloud model
  → output validation
  → response
  → observability`}</Code>
        <P>
          Choosing the model is only part of the design. Choosing where that model executes becomes another architecture
          decision, with its own failure modes. The router isn&apos;t simply choosing the cheapest model. It&apos;s selecting an
          execution environment that satisfies the workload&apos;s requirements.
        </P>

        <H2>Five routing dimensions</H2>
        <Rows head={["Dimension", "What the router has to know"]} rows={DIMENSIONS} />
        <P>
          None of these has a fixed winner. Local isn&apos;t automatically faster, cheaper or more private; each depends on the
          workload, the hardware and how the system is built. GitHub&apos;s own post makes the memory point: model weights are only
          part of the budget once the context and KV cache grow over an agent session.
        </P>

        <H2>Policy before routing</H2>
        <P>
          The order matters. Data classification decides which routes are allowed at all; the router then chooses among the
          allowed routes using measured quality, latency budget, cost budget, device resources and model health. A sketch:
        </P>
        <Code>{`allowed = policy.allowed_routes(data_classification)      # deterministic, first
if not allowed: return REJECT

candidates = [r for r in allowed
              if measured_quality(r, task_type) >= threshold
              and healthy(r) and resources_fit(r)]

if not candidates:
    return DEFER or HUMAN_REVIEW    # never widen 'allowed' to fall back

route = best(candidates, latency_budget, cost_budget)
log(route, inputs, model_version, policy_version)`}</Code>
        <P>
          A learned scorer can rank candidates, but it should never be able to add a route that policy removed. A single LLM
          deciding every route is not a design I&apos;d trust here. Some illustrative cases:
        </P>
        <Rows head={["Request", "Route"]} rows={ROUTES} />
        <figure className="mt-8">
          <img src="/media/blog/local-or-cloud/router-architecture.jpg" alt="A client application sends requests through a request classifier and a data policy engine. Allowed requests reach an inference router informed by a model capability registry, which gets measured quality from an AI eval framework. The router sends work to a local inference runtime or, only if policy authorizes it, a cloud inference gateway; both feed an output validator. Denied requests go to reject, defer or human review, and an audit log. Telemetry flows into an observability pipeline, which feeds production signals back into eval sets." loading="lazy" className="w-full border border-[var(--border)]" />
          <figcaption className="mt-3 text-[12px] text-[var(--faint)]">Reference architecture · conceptual · not Microsoft or GitHub internal design</figcaption>
        </figure>

        <H2>The router needs evals too</H2>
        <P>
          A wrong route is a quiet failure. The answer still arrives, just from the wrong place, at the wrong cost, or against
          policy. Treat the router like any other production component:
        </P>
        <Rows head={["Measure", "Why"]} rows={EVALS} />
        <P>
          Keep an evaluation matrix per task type (local quality, cloud quality, latency on each route, cost, policy
          eligibility, selected route), fill it with your own measurements, and re-run it when a model, quantization, runtime
          or policy version changes.
        </P>
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-5 text-[1.15rem] font-semibold leading-8">
          Model selection determines capability. Inference routing determines how that capability is delivered.
        </p>
        <P>Where would you draw the line in your systems: which requests should never leave the device?</P>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b" target="_blank" rel="noreferrer" className="btn-pill btn-pill--solid">Discuss on LinkedIn ↗</a>
          <Link href="/#contact" className="btn-pill btn-pill--outline">Discuss a system</Link>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-[13px] leading-6 text-[var(--faint)]">
          <p className="text-[12px]">Sources</p>
          <ul className="mt-2 space-y-1">
            {SOURCES.map(([label, href]) => (
              <li key={href}><a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--accent)]">{label}</a></li>
            ))}
          </ul>
          <p className="mt-3">Statements about GitHub Copilot, HydraFusion, MAI Code 1.1 Flash, MXC and Windows hybrid intelligence are from Microsoft&apos;s and GitHub&apos;s own posts. Microsoft hasn&apos;t published how Copilot&apos;s router decides beyond task context and cache state. The routing dimensions, the policy-first sketch, the example requests, the reference architecture and the evaluation measures are my own engineering interpretation, not Microsoft&apos;s or GitHub&apos;s design.</p>
        </footer>
      </ArticleShell>
    </main>
  );
}
