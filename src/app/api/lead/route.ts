import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BRIEF_EMAIL, looksLikeEmail } from "@/lib/brief";

// Two entry points feed this one route: the "Заказать звонок" mini-brief
// (budget/format/deadline/refs/wishes) and "Запланировать консультацию с
// продюсером" (name/phone/wishes) opened from a work card's "Узнать
// больше". Both just differ in which fields they send — the route only
// cares about `type` for the subject line and doesn't validate field shape
// beyond name/phone, so adding a third lead form later never needs a new
// route.
type LeadPayload = {
  type:
    | "call"
    | "consult"
    | "brief"
    | "brief-ai"
    | "brief-smm"
    | "brief-sites"
    | "brief-hotel-video"
    | "team";
  name: string;
  phone?: string;
  email?: string;
  fields?: Record<string, string>;
};

const TYPE_LABEL: Record<LeadPayload["type"], string> = {
  call: "Заказать звонок",
  consult: "Консультация с продюсером",
  brief: "Бриф на видео",
  // The three direction briefs (/brief/ai, /brief/smm, /brief/sites) — same
  // shape as the video brief, distinguished here so the subject line alone
  // tells Egor which page the lead came from.
  "brief-ai": "Бриф на AI-решение",
  "brief-smm": "Бриф на SMM",
  "brief-sites": "Бриф на сайт",
  "brief-hotel-video": "Бриф на видеосъёмку базы отдыха",
  // Sent from a TeamCard/TeamConsultModal — `fields["Кому адресовано"]`
  // carries which team member the visitor actually clicked on.
  team: "Написали через карточку команды",
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = str(body.name);
  const phone = str(body.phone);
  const email = str(body.email);
  // A mistyped address must not cost the lead: it still goes into the letter,
  // just not into replyTo, which the mail provider may reject outright.
  const emailOk = looksLikeEmail(email);
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
    ...(email ? [emailOk ? `Email: ${email}` : `Email (похоже, с опечаткой): ${email}`] : []),
    ...Object.entries(body.fields ?? {}).map(([label, value]) => `${label}: ${value || "—"}`),
  ];

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    // Resend's shared sending domain — swap for a verified hdkv.agency
    // address once that domain is added in the Resend dashboard.
    from: "HUD.SERVICE <onboarding@resend.dev>",
    to: BRIEF_EMAIL,
    replyTo: emailOk ? email : undefined,
    subject: `${Object.hasOwn(TYPE_LABEL, body.type) ? TYPE_LABEL[body.type] : "Заявка с сайта"} — ${name}`,
    text: lines.join("\n"),
  });

  if (error) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
