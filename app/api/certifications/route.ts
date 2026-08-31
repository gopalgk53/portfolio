import { NextResponse } from "next/server";
import { certifications } from "../../../lib/data";

export const dynamic = "force-static";

// lib/data.ts stores certifications as [name, issuer, url] tuples (kept
// terse since they're only ever destructured internally); this endpoint
// maps them to named fields since a public API response shouldn't force
// consumers to know the positional order by convention. No explicit cache
// header — see app/api/projects/route.ts for why (next.config.mjs already
// forces no-store on every /api response).
export async function GET() {
  const results = certifications.map(([name, issuer, url]) => ({ name, issuer, url }));
  return NextResponse.json({ count: results.length, results });
}
