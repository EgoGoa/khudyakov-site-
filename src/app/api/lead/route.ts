import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BRIEF_EMAIL } from "@/lib/brief";

// Two entry points feed this one route: the "Заказать звонок" mini-brief
// (budget/format/deadline/refs/wishes) and "Запланировать консультацию с
// продюсером" (name/phone/wishes) opened from a work card's "Узнать
// больше". Both just differ in which fields they send — the route only
// cares about `type` for the subject line and doesn't validate field shape
// beyond name/phone, so adding a third lead form later never needs a new
// route.
type LeadPayload = {
  type: "call" | "consult" | "brief";
  name: string;
  phone?: string;
  email?: string;
  fields?: Record<string, string>;
};

const TYPE_LABEL: Record<LeadPayload["type"], string> = {
  call: "Заказать звонок",
  consult: "Консультация с продюсером",
  brief: "Бриф на видео",
};

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  if (!name || (!phone && !email)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Resend isn't provisioned yet (terms pending in the Vercel dashboard).
    // Failing loudly here beats silently pretending the lead was sent.
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const lines = [
    `Имя: ${name}`,
    ...(phone ? [`Телефон: ${phone}`] : []),
    ...(email ? [`Email: ${email}`] : []),
    ...Object.entries(body.fields ?? {}).map(([label, value]) => `${label}: ${value || "—"}`),
  ];

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    // Resend's shared sending domain — swap for a verified hdkv.agency
    // address once that domain is added in the Resend dashboard.
    from: "HDKV.AGENCY <onboarding@resend.dev>",
    to: BRIEF_EMAIL,
    replyTo: email || undefined,
    subject: `${TYPE_LABEL[body.type]} — ${name}`,
    text: lines.join("\n"),
  });

  if (error) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
