import { NextResponse } from "next/server";
import { generateText } from "ai";

// Chapter 03's own "спросить агента" search bar (Trust.tsx / BlockAssistant)
// — a visitor's free-form question about this service, answered live
// instead of only ever routed to email. Runs through Vercel AI Gateway
// (plain "provider/model" string, no direct provider SDK) so it works the
// same in local dev (via the pulled OIDC token) and once deployed.
export async function POST(request: Request) {
  let body: { question?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "missing_question" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: "anthropic/claude-haiku-4.5",
      system: `Ты — ассистент продюсерского центра HDKV.AGENCY на странице услуги "Создание контента". ${
        body.context ?? ""
      } Отвечай по-русски, кратко (2-4 предложения), дружелюбно и по делу, без воды и маркетинговых штампов. Если вопрос не по теме услуг агентства — вежливо скажи, что лучше обсудить это с продюсером в Telegram.`,
      prompt: question,
    });
    return NextResponse.json({ answer: text });
  } catch {
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
