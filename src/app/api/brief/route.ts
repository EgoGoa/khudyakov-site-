import { NextResponse, type NextRequest } from "next/server";
import { STEPS, buildBriefText, briefSubject, isAnswered, type Answers } from "@/lib/brief";
import { deliverBrief, isDeliveryConfigured } from "@/lib/brief-delivery";

// Receives a filled brief and posts it into the agency's Telegram (see
// lib/brief-delivery.ts for why Telegram and how it is configured).
//
// Every answer is re-rendered server-side by buildBriefText, driven by STEPS —
// the request's own keys never reach the message, choice/chips answers are
// checked against the options the question actually offers, and each field is
// length-capped. So this is a form endpoint, not a "send arbitrary text to our
// chat" relay that happens to be publicly reachable.
//
// Responses the client acts on:
//   200 {delivered: true}                  — landed, show the confirmation
//   503 {delivered: false, reason: ...}    — not configured, or Telegram
//                                            refused: fall back to clipboard
//   400 {error}                            — malformed or missing contact

// Bounded so a huge body is rejected before it is parsed. Set above what the
// form itself can legitimately produce, not at a round number: buildBriefText
// caps each answer at 2000 characters and there are ~24 of them, so a
// maximally-filled brief is ~48k characters — around 96 KB once Cyrillic is
// UTF-8 encoded. A cap below that would reject real briefs (bouncing them into
// the clipboard fallback) while doing nothing extra against an abusive one.
const MAX_BODY_BYTES = 256_000;

// Best-effort throttle. In-memory, so it resets on redeploy and is per
// instance rather than global — this is a speed bump against a script hammering
// the endpoint, not a guarantee. A real limit belongs at the edge/CDN.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Bound the map itself, so a spray of unique IPs cannot grow it forever.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  if (!isDeliveryConfigured()) {
    return NextResponse.json(
      { delivered: false, reason: "not-configured" },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ delivered: false, reason: "rate-limited" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  let answers: Answers;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    answers = (parsed as { answers?: unknown }).answers as Answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new Error("shape");
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  // The one field without which a brief is not actionable — we would have no
  // way to answer it.
  const contactStep = STEPS.find((s) => s.type === "contact");
  if (contactStep && !isAnswered(contactStep, answers)) {
    return NextResponse.json({ error: "contact-required" }, { status: 400 });
  }

  const delivered = await deliverBrief(briefSubject(answers), buildBriefText(answers));
  return delivered
    ? NextResponse.json({ delivered: true })
    : NextResponse.json({ delivered: false, reason: "send-failed" }, { status: 503 });
}
