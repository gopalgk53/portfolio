import { NextResponse } from "next/server";
import { projects } from "../../../lib/data";

// A genuinely public, read-only mirror of the same data the homepage
// renders — no auth, no rate limit needed (static data, no model call, no
// cost). next.config.mjs's blanket /api/:path* rule stamps every response
// under /api with Cache-Control: no-store — deliberate for the functional
// routes (chat/search/contact/playground), and it applies here too, so
// this endpoint is genuinely never cached rather than just labeled that way.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ count: projects.length, results: projects });
}
