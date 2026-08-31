import { changelog } from "../../../lib/changelog";

// A standard RSS 2.0 feed over the exact same real changelog data the
// /changelog page renders — one source of truth, two formats.
export const dynamic = "force-static";

const BASE = "https://gopalakrishnagenai.in";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function build() {
  const items = changelog
    .map(
      (entry) => `    <item>
      <title>${escapeXml(`[${entry.tag}] ${entry.title}`)}</title>
      <link>https://github.com/gopalgk53/portfolio/pull/${entry.pr}</link>
      <guid isPermaLink="false">portfolio-pr-${entry.pr}</guid>
      <pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(entry.title)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Gopalakrishna's portfolio — changelog</title>
    <link>${BASE}/changelog</link>
    <description>A real record of how this portfolio has shipped and evolved, pulled from its own merged pull requests.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}

export async function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
