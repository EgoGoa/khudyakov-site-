"use client";

import { useState } from "react";
import CenterModal from "@/components/ui/CenterModal";
import { MicIcon, SendIcon } from "@/components/ui/Icons";
import { useDictation } from "@/lib/use-dictation";

const TELEGRAM_URL = "https://t.me/hdkv";

type Screen = "ask" | "loading" | "answer" | "contact" | "sent" | "error";

// Умная строка над кнопками выбора задачи — та же механика, что несёт
// BlockAssistant на /content (та же модалка, тот же голосовой ввод, тот же
// /api/ask), но с двумя разными исходами вместо одного:
//
// 1. Клик по готовому вопросу — как и на /content, ответ приходит от AI
//    прямо в окне: это вопрос, а не заявка, отвечать на него почтой незачем.
// 2. Свой текст, набранный или надиктованный, — это уже не вопрос, а
//    пожелание к проекту, и его нужно не отвечать, а донести до команды.
//    Поэтому свой текст идёт другим путём: короткий шаг «как с вами
//    связаться», AI сжимает сообщение в структурированный бриф (тот же
//    /api/ask, другой system-промпт), и то и другое уходит на почту через
//    /api/lead — тем же письмом, что и обычный бриф с /brief.
export default function TaskAssistant({
  suggested,
  context,
  pageLabel,
}: {
  suggested: string[];
  /** Тема страницы — уходит в system-промпт /api/ask, чтобы AI отвечал
   *  и переписывал бриф в контексте конкретного формата, а не вообще. */
  context: string;
  /** Заголовок страницы для темы письма — «Бриф со страницы «…»». */
  pageLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [contact, setContact] = useState("");
  const { listening, supported, toggle } = useDictation((t) =>
    setQuestion((prev) => (prev ? `${prev} ${t}` : t))
  );

  const reset = () => {
    setScreen("ask");
    setQuestion("");
    setAnswer("");
    setContact("");
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 400);
  };

  // Готовый вопрос — обычный AI-ответ в окне, без почты.
  const askSuggested = async (q: string) => {
    const text = q.trim();
    if (!text) return;
    setQuestion(text);
    setScreen("loading");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setAnswer(data.answer as string);
      setScreen("answer");
    } catch {
      setScreen("error");
    }
  };

  // Свой текст — это бриф, а не вопрос: спрашиваем контакт, а не отвечаем.
  const goToContact = () => {
    if (!question.trim()) return;
    setScreen("contact");
  };

  const sendBrief = async () => {
    const contactValue = contact.trim();
    if (!contactValue) return;
    setScreen("loading");
    try {
      const isEmail = /\S+@\S+\.\S+/.test(contactValue);
      const summaryRes = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          context: `${context} Посетитель оставляет заявку, а не задаёт вопрос. Не отвечай ему — вместо ответа перепиши его сообщение в 2-4 коротких пункта: что нужно, для какой задачи, важные детали. От третьего лица, по-русски, без markdown и без фраз вроде «клиент пишет».`,
        }),
      });
      const summary = summaryRes.ok ? ((await summaryRes.json()).answer as string) : "";

      const leadRes = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "brief",
          name: `Бриф со страницы «${pageLabel}»`,
          email: isEmail ? contactValue : undefined,
          phone: isEmail ? undefined : contactValue,
          fields: {
            Страница: pageLabel,
            Сообщение: question.trim(),
            ...(summary ? { "Бриф от AI": summary } : {}),
          },
        }),
      });
      if (!leadRes.ok) throw new Error("failed");
      setScreen("sent");
    } catch {
      setScreen("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="assistant-bar group mx-auto flex w-full max-w-2xl items-center gap-2.5 rounded-full bg-ink/50 py-1.5 pl-4 pr-1.5 text-left backdrop-blur-md transition"
      >
        <span className="min-w-0 flex-1 truncate text-xs text-paper/55 sm:text-sm">
          Голосом или текстом — расскажите, что нужно именно вам…
        </span>
        <span className="assistant-mic flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-glow/15 text-glow ring-1 ring-glow/40 transition group-hover:bg-glow/25">
          <MicIcon className="h-3.5 w-3.5" />
        </span>
      </button>

      <CenterModal open={open} onClose={close} ariaLabel="Спросить или оставить бриф" compact>
        <div className="flex h-fit w-full flex-col text-left">
          {screen === "ask" && (
            <>
              <h3 className="font-display text-[1.35rem] uppercase tracking-tight text-paper sm:text-[1.688rem]">
                Что вам нужно?
              </h3>
              <p className="mt-2 text-sm text-paper/60">
                Выберите готовый вопрос — ответит агент. Или опишите своё словами
                или голосом — передадим команде.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {suggested.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => askSuggested(q)}
                    className="rounded-full border border-paper/15 px-3.5 py-2 text-left text-xs text-paper/75 transition hover:border-glow/50 hover:text-paper"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="relative mt-4">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToContact()}
                  placeholder="Опишите свою задачу…"
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] py-3 pl-4 pr-20 text-sm text-paper placeholder:text-paper/35 focus:border-glow focus:outline-none"
                />
                {supported && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Наговорить голосом"
                    className={`absolute right-11 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition ${
                      listening ? "bg-glow/25 text-glow" : "text-paper/40 hover:bg-paper/10 hover:text-paper/80"
                    }`}
                  >
                    <MicIcon className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToContact}
                  disabled={!question.trim()}
                  aria-label="Отправить"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-glow/20 text-glow transition disabled:opacity-30"
                >
                  <SendIcon />
                </button>
              </div>
            </>
          )}

          {screen === "loading" && (
            <div className="py-10 text-center">
              <p className="text-sm text-paper/55">«{question}»</p>
              <p className="mt-3 animate-pulse text-sm text-glow">Секунду…</p>
            </div>
          )}

          {screen === "answer" && (
            <>
              <p className="font-display text-xs uppercase tracking-[0.18em] text-glow">Вопрос</p>
              <p className="mt-1.5 text-sm text-paper/70">«{question}»</p>
              <div className="mt-4 rounded-xl border border-glow/25 bg-glow/[0.06] p-4">
                <p className="text-sm leading-relaxed text-paper">{answer}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-paper/20 px-5 py-2.5 text-sm font-medium text-paper transition hover:border-paper/50"
                >
                  ← Задать ещё
                </button>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-rec px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rec-light"
                >
                  Спросить продюсера →
                </a>
              </div>
            </>
          )}

          {screen === "contact" && (
            <>
              <h3 className="font-display text-xl uppercase tracking-tight text-paper">Как с вами связаться?</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                Передадим ваше сообщение команде и ответим в течение дня.
              </p>
              <div className="mt-4 rounded-xl border border-paper/15 bg-paper/[0.04] p-3">
                <p className="text-xs leading-relaxed text-paper/60">«{question}»</p>
              </div>
              <div className="relative mt-4">
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendBrief()}
                  placeholder="Email или Telegram"
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] py-3 pl-4 pr-12 text-sm text-paper placeholder:text-paper/35 focus:border-glow focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendBrief}
                  disabled={!contact.trim()}
                  aria-label="Отправить бриф"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-glow/20 text-glow transition disabled:opacity-30"
                >
                  <SendIcon />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setScreen("ask")}
                className="mt-4 font-display text-[11px] uppercase tracking-[0.16em] text-paper/50 transition hover:text-paper"
              >
                ← Назад
              </button>
            </>
          )}

          {screen === "sent" && (
            <>
              <h3 className="font-display text-xl uppercase tracking-tight text-paper">Бриф отправлен</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                Получили и уже читаем. Ответим на «{contact}» в течение дня.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full border border-paper/20 px-5 py-2.5 text-sm font-medium text-paper transition hover:border-paper/50"
              >
                ← Спросить ещё что-то
              </button>
            </>
          )}

          {screen === "error" && (
            <>
              <h3 className="font-display text-xl uppercase tracking-tight text-paper">Не получилось отправить</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                Напишите напрямую продюсеру в Telegram —{" "}
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-glow hover:underline">
                  @hdkv
                </a>
                .
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full border border-paper/20 px-5 py-2.5 text-sm font-medium text-paper transition hover:border-paper/50"
              >
                ← Назад
              </button>
            </>
          )}
        </div>
      </CenterModal>
    </>
  );
}
