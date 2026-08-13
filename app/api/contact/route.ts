import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 3000;

type RateEntry = { count: number; resetAt: number };
type ResendResponse = { id?: string; message?: string; name?: string };

const globalRateStore = globalThis as typeof globalThis & {
  contactRateLimits?: Map<string, RateEntry>;
};

const rateLimits =
  globalRateStore.contactRateLimits ??
  (globalRateStore.contactRateLimits = new Map<string, RateEntry>());

function clientIdentifier(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const current = rateLimits.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email delivery is temporarily unavailable." },
      { status: 503 },
    );
  }

  if (isRateLimited(clientIdentifier(request))) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  // Quietly accept bot-filled submissions without sending an email.
  if (company) return NextResponse.json({ success: true });

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > MAX_EMAIL_LENGTH
  ) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be between 10 and ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from:
          process.env.CONTACT_FROM_EMAIL ||
          "Gopalakrishna Portfolio <contact@gopalakrishnagenai.in>",
        to: [process.env.CONTACT_TO_EMAIL || "gopalgk53@yahoo.com"],
        reply_to: email,
        subject: `Portfolio inquiry from ${name}`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
        html: `<h2>New portfolio inquiry</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong></p><p>${safeMessage}</p>`,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await response.json()) as ResendResponse;
    if (!response.ok || !data.id) {
      console.error("Resend contact error", response.status, data.message ?? data.name);
      return NextResponse.json(
        { error: "Message delivery failed. Please email gopalgk53@yahoo.com directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact delivery failed", error);
    return NextResponse.json(
      { error: "Message delivery failed. Please email gopalgk53@yahoo.com directly." },
      { status: 502 },
    );
  }
}
