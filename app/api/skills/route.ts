import { NextResponse } from "next/server";
import { skills } from "../../../lib/data";

// See app/api/projects/route.ts for why there's no explicit cache header
// here — next.config.mjs's blanket /api/:path* rule already forces
// Cache-Control: no-store on every response under /api.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ count: skills.length, results: skills });
}
