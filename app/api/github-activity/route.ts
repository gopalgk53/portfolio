import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxies GitHub's public events API server-side. The page's CSP only
// permits same-origin fetches from the browser (connect-src 'self') — by
// design, not an oversight — so this route exists rather than loosening
// that policy for one widget. Cached briefly so repeat visits don't spend
// GitHub's unauthenticated rate limit.
export async function GET() {
  try {
    const response = await fetch("https://api.github.com/users/gopalgk53/events/public", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "gopalakrishnagenai.in" },
      next: { revalidate: 300 },
    });
    if (!response.ok) return NextResponse.json({ createdAt: null });

    const events = (await response.json()) as Array<{ created_at?: string }>;
    const createdAt = Array.isArray(events) ? events[0]?.created_at ?? null : null;
    return NextResponse.json({ createdAt });
  } catch {
    return NextResponse.json({ createdAt: null });
  }
}
