import { NextResponse } from "next/server";
import { generateText } from "ai";
import { VOICE_ROUTES as ROUTES, VOICE_SYSTEM as SYSTEM } from "@/lib/voice/prompt";

// Голосовой ассистент (VoiceAssistant.tsx): свободные вопросы, которые не
// разобрал локальный парсер команд (lib/voice/intents.ts). Отвечает
// короткой фразой для озвучки и, если уместно, одним действием — перейти на
// блок, позвонить, открыть Телеграм. Тот же AI Gateway и та же защита, что у
// /api/ask.

const MAX_TEXT = 600;
const MAX_TURNS = 6;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
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

type Turn = { role: "user" | "assistant"; text: string };

const ALLOWED_TYPES = new Set(["call", "telegram", "whatsapp", "vibe"]);

function parseReply(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return { say: raw.trim().slice(0, 400), action: null };
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as { say?: unknown; action?: { type?: unknown; href?: unknown } | null };
    const say = typeof obj.say === "string" ? obj.say.trim().slice(0, 400) : "";
    let action: { type: string; href?: string } | null = null;
    const a = obj.action;
    if (a && typeof a.type === "string") {
      if (a.type === "route" && typeof a.href === "string" && ROUTES.has(a.href)) action = { type: "route", href: a.href };
      else if (ALLOWED_TYPES.has(a.type)) action = { type: a.type };
    }
    return { say, action };
  } catch {
    return { say: "", action: null };
  }
}

export async function POST(request: Request) {
  if (!sameSite(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { text?: unknown; path?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (!text) return NextResponse.json({ error: "missing_text" }, { status: 400 });
  const path = typeof body.path === "string" ? body.path.slice(0, 80) : "/";
  const history: Turn[] = Array.isArray(body.history)
    ? (body.history as Turn[])
        .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.text === "string")
        .slice(-MAX_TURNS)
        .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_TEXT) }))
    : [];

  try {
    const { text: raw } = await generateText({
      model: "anthropic/claude-haiku-4.5",
      system: SYSTEM,
      messages: [
        ...history.map((t) => ({ role: t.role, content: t.text })),
        { role: "user" as const, content: `[страница: ${path}]\n${text}` },
      ],
      maxOutputTokens: 300,
    });
    const reply = parseReply(raw);
    if (!reply.say) return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    return NextResponse.json(reply);
  } catch {
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
