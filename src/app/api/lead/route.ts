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
    | "team"
    | "vibe"
    | "vibe-order"
    | "block-vibe";
  name: string;
  phone?: string;
  email?: string;
  fields?: Record<string, string>;
  /** Скрины из окошка Vibe-блока: data-URL jpeg, до трёх штук. */
  files?: { name: string; data: string }[];
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
  // Анкета вайб-режима (сфера в вайб-баре) — ждёт персональную страницу
  // в течение часа.
  vibe: "Vibe-режим: клиент собрал КП",
  // Кнопка «Выбрать план» на странице-КП (/offer).
  "vibe-order": "Vibe-режим: заказ тарифа из КП",
  // Окошко «персонализировать этот блок» у вайб-бара.
  "block-vibe": "Vibe-блок: клиент собрал блок под себя",
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Защита от спама: заявки приходят только со своего сайта, тело запроса
// ограничено (3 скрина по 4 МБ в base64 + поля), частота — по IP. Счётчик
// живёт в памяти одного сервера: это тормоз для одного клиента, не квота.
const MAX_BODY = 16_000_000;
const MAX_FIELD = 4000;
const MAX_FIELDS = 40;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function sameSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameSite(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = str(body.name).slice(0, 200);
  const phone = str(body.phone).slice(0, 100);
  const email = str(body.email).slice(0, 200);
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
    ...Object.entries(body.fields ?? {})
      .slice(0, MAX_FIELDS)
      .map(([label, value]) => `${label.slice(0, 100)}: ${str(value).slice(0, MAX_FIELD) || "—"}`),
  ];

  const attachments = (Array.isArray(body.files) ? body.files : [])
    .slice(0, 3)
    .flatMap((f) => {
      const m = typeof f?.data === "string" ? f.data.match(/^data:image\/[a-z+]+;base64,(.+)$/) : null;
      return m && m[1].length < 4_000_000 ? [{ filename: str(f.name) || "screen.jpg", content: m[1] }] : [];
    });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    // Resend's shared sending domain — swap for a verified hdkv.agency
    // address once that domain is added in the Resend dashboard.
    from: "HUD.SERVICE <onboarding@resend.dev>",
    to: BRIEF_EMAIL,
    replyTo: emailOk ? email : undefined,
    subject: `${Object.hasOwn(TYPE_LABEL, body.type) ? TYPE_LABEL[body.type] : "Заявка с сайта"} — ${name}`,
    text: lines.join("\n"),
    attachments: attachments.length ? attachments : undefined,
  });

  if (error) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
