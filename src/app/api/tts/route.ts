// Живой голос ассистента — Yandex SpeechKit (выбор Егора 2026-09-26: голос
// браузера звучит роботом). Браузер присылает фразу, сюда возвращается mp3.
//
// GET, а не POST, — чтобы одинаковые фразы («Открываю Vibe сайты»)
// кешировались CDN и не синтезировались и не оплачивались повторно.
// Без ключа отвечает 503, и VoiceAssistant говорит голосом браузера.
//
// Ключ: YANDEX_SPEECHKIT_API_KEY — API-ключ сервисного аккаунта Yandex Cloud
// с ролью ai.speechkit-tts.user. Голос и тон можно сменить без правки кода:
// YANDEX_TTS_VOICE (alena, marina, jane, filipp…), YANDEX_TTS_EMOTION.

const MAX_TEXT = 500;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;
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

export async function GET(request: Request) {
  const key = process.env.YANDEX_SPEECHKIT_API_KEY;
  if (!key) return new Response("not_configured", { status: 503 });

  const text = new URL(request.url).searchParams.get("text")?.trim().slice(0, MAX_TEXT) ?? "";
  if (!text) return new Response("missing_text", { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return new Response("rate_limited", { status: 429 });

  const form = new URLSearchParams({
    text,
    lang: "ru-RU",
    voice: process.env.YANDEX_TTS_VOICE || "alena",
    emotion: process.env.YANDEX_TTS_EMOTION || "good",
    // Чуть медленнее обычного — спокойнее.
    speed: "0.95",
    format: "mp3",
  });

  try {
    const res = await fetch("https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize", {
      method: "POST",
      headers: { Authorization: `Api-Key ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) return new Response("tts_failed", { status: 502 });
    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, immutable",
      },
    });
  } catch {
    return new Response("tts_failed", { status: 502 });
  }
}
