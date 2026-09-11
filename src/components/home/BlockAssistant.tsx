"use client";

import { useState } from "react";
import CenterModal from "@/components/ui/CenterModal";
import { MicIcon, SendIcon } from "@/components/ui/Icons";
import { useDictation } from "@/lib/use-dictation";

const TELEGRAM_URL = "https://t.me/hdkv";

const SUGGESTED = [
  "Сколько будет стоить ролик под мою задачу?",
  "Какие сроки на съёмку и монтаж?",
  "Можно AI-видео вместо живой съёмки?",
  "Как проходит согласование этапов?",
];

type Screen = "ask" | "loading" | "answer" | "error";

// The chapter's own "спросить агента" bar, under the header — Egor's ask:
// a visitor with a question specific to this chapter (pricing, timing,
// format) can get a real answer right here instead of reading through the
// FAQ hoping it's covered. Opens the same CenterModal every other overlay
// on the site does, so the page behind it dims exactly the way the
// welcome/service overlays already do — no bespoke dimming logic needed.
export default function BlockAssistant({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { listening, supported, toggle } = useDictation((t) =>
    setQuestion((prev) => (prev ? `${prev} ${t}` : t))
  );

  const reset = () => {
    setScreen("ask");
    setQuestion("");
    setAnswer("");
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 400);
  };

  const ask = async (q: string) => {
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

  return (
    <>
      {/* `ml-auto`, not `mx-auto` — Trust.tsx now sizes this bar's row to
          exactly the width the five-reasons/Promo column needs (see its own
          note), and centring the bar inside that row left a gap between the
          bar's own right edge and the row's, throwing off the "same right
          edge as the reasons column" alignment Egor asked for. Right-
          aligning instead means the bar's right edge always matches the
          row's, which is what actually has to line up. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="assistant-bar group ml-auto flex w-full max-w-2xl items-center gap-2.5 rounded-full bg-ink/50 py-1.5 pl-4 pr-1.5 text-left backdrop-blur-md transition"
      >
        <span className="min-w-0 flex-1 truncate text-xs text-paper/55 sm:text-sm">
          Спросите про сроки, бюджет или формат — ответит агент или продюсер…
        </span>
        <span className="assistant-mic flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-glow/15 text-glow ring-1 ring-glow/40 transition group-hover:bg-glow/25">
          <MicIcon className="h-3.5 w-3.5" />
        </span>
      </button>

      <CenterModal open={open} onClose={close} ariaLabel="Спросить об услуге" compact>
        <div className="flex h-fit w-full flex-col text-left">
          {screen === "ask" && (
            <>
              <h3 className="font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
                О чём спросить?
              </h3>
              <p className="mt-2 text-sm text-paper/60">
                Выберите вопрос, напишите свой или спросите голосом.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
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
                  onKeyDown={(e) => e.key === "Enter" && ask(question)}
                  placeholder="Свой вопрос…"
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] py-3 pl-4 pr-20 text-sm text-paper placeholder:text-paper/35 focus:border-glow focus:outline-none"
                />
                {supported && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Спросить голосом"
                    className={`absolute right-11 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition ${
                      listening ? "bg-glow/25 text-glow" : "text-paper/40 hover:bg-paper/10 hover:text-paper/80"
                    }`}
                  >
                    <MicIcon className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => ask(question)}
                  disabled={!question.trim()}
                  aria-label="Спросить"
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
              <p className="mt-3 animate-pulse text-sm text-glow">Агент думает…</p>
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

          {screen === "error" && (
            <>
              <h3 className="font-display text-xl uppercase tracking-tight text-paper">Агент не ответил</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                Спросите напрямую продюсера в Telegram —{" "}
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
