"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import {
  BRIEF_EMAIL,
  SCENE_NAMES,
  STEPS,
  buildBriefText,
  briefSubject,
  formatAnswer,
  isAnswered,
  type Answers,
  type AnswerValue,
  type BriefStep,
  type ContactValue,
} from "@/lib/brief";

type Screen = "intro" | "page1" | "page2" | "review" | "sent";

// How the brief actually left the building, which decides what the final
// screen tells the visitor to do next.
//   "sending"   — the request is in flight
//   "delivered" — it reached the agency; nothing further is asked of them
//   "fallback"  — delivery is off or refused, so it went to the clipboard and
//                 they still have to send the letter themselves
type SendState = "idle" | "sending" | "delivered" | "fallback";

const inputClass =
  "w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none";

// The fallback route, for when server-side delivery is unavailable.
//
// A mail client does not take an unlimited mailto:. Outlook on Windows opens
// one through ShellExecute, which caps a URL at roughly 2 KB, and other
// clients have their own limits; past them the body is silently truncated or
// the link simply does not open — the visitor believes the brief was sent and
// we never receive it.
//
// This brief cannot fit that budget, and no amount of trimming answers would
// change it: every Cyrillic character costs six characters once
// percent-encoded ("%D0%B0"), so the twenty question titles ALONE — with every
// answer left empty — already encode to a 3.9k-character link, and a normal
// set of answers reaches ~7.6k. So the letter never carries the brief: it
// carries the instruction, and the answers go via the clipboard.
//
// This is now only the second choice. The brief is posted to /api/brief first,
// which forwards it to the agency's Telegram and asks nothing further of the
// visitor; the clipboard path is what happens when that is switched off or
// unreachable.
const CLIPBOARD_BODY =
  "Текст брифа скопирован в буфер обмена — вставьте его сюда (Ctrl+V, на Mac ⌘+V) и отправьте письмо.";

export default function BriefForm() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [invalid, setInvalid] = useState<string[]>([]);
  // "fail" is not an error state so much as a fallback one: it reveals the
  // brief in a selectable textarea, which is the last route out that needs
  // neither a working mail client nor clipboard permission.
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [sendState, setSendState] = useState<SendState>("idle");

  const set = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setInvalid((prev) => prev.filter((x) => x !== id));
  };

  const numberOf = useMemo(() => {
    const map: Record<string, string> = {};
    STEPS.forEach((s, i) => {
      map[s.id] = String(i + 1).padStart(2, "0");
    });
    return map;
  }, []);

  const contactOk = isAnswered(
    STEPS.find((s) => s.type === "contact") as BriefStep,
    answers
  );

  const validatePage = (page: 1 | 2) => {
    const missing = STEPS.filter(
      (s) => s.page === page && s.required && !isAnswered(s, answers)
    ).map((s) => s.id);
    setInvalid(missing);
    if (missing.length) {
      document
        .getElementById(`field-${missing[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  // Built by the same function the server uses to render what it receives, so
  // the text the visitor is told they copied is exactly the text we get.
  const briefText = useMemo(() => buildBriefText(answers), [answers]);

  // Addressed and titled, with the paste instruction as its body — on the
  // fallback path the answers reach the letter through the clipboard.
  const mailHref = useMemo(
    () =>
      `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(
        briefSubject(answers)
      )}&body=${encodeURIComponent(CLIPBOARD_BODY)}`,
    [answers]
  );

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied("ok");
      return true;
    } catch {
      // No clipboard permission, or an insecure context — the textarea this
      // flips open lets the visitor select the text by hand instead, so the
      // answers are never trapped in a form they cannot get out of.
      setCopied("fail");
      return false;
    }
  };

  // Try to deliver the brief ourselves; fall back to the visitor's mail client
  // only if that is unavailable. Whichever way it goes, the answers are also
  // put on the clipboard first — costing nothing, and meaning a delivery that
  // fails halfway still leaves the visitor holding their five minutes of work.
  const submit = async () => {
    if (!contactOk || sendState === "sending") return;
    setSendState("sending");
    void copyBrief();

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok && (await res.json().catch(() => null))?.delivered) {
        setSendState("delivered");
        setScreen("sent");
        return;
      }
    } catch {
      // Offline, timed out, blocked — same answer as a refusal below.
    }

    // Delivery is off or did not go through: hand over to the mail client.
    // Assigning location rather than window.open, because by this point the
    // originating click is several awaits in the past and a popup would be
    // blocked — a mailto: assignment is a handler hand-off, not a popup, so it
    // opens the mail client and leaves the page where it is.
    setSendState("fallback");
    setScreen("sent");
    window.location.href = mailHref;
  };

  const hud =
    screen === "intro"
      ? "Бриф · 20 вопросов"
      : screen === "page1"
      ? "Страница 1 из 2"
      : screen === "page2"
      ? "Страница 2 из 2"
      : screen === "review"
      ? "Монтажный лист"
      : "Отправлено";

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-4xl">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-rec">
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-rec" />
          {hud}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === "intro" && (
              <div>
                <h1 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-paper sm:text-6xl">
                  Съёмка начинается
                  <br />
                  <span className="text-glow">с брифа</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/60">
                  Ответьте на 20 вопросов о проекте — это займёт около пяти
                  минут. В конце мы соберём всё в один документ, который
                  останется только отправить нам на почту.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ["~5 минут", "на заполнение"],
                    ["20 вопросов", "по делу"],
                    ["2 страницы", "с навигацией"],
                    ["Без регистрации", "ничего не храним"],
                  ].map(([big, small]) => (
                    <div key={big} className="border-l border-glow/30 pl-4">
                      <div className="font-display text-lg uppercase text-paper">{big}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/45">
                        {small}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setScreen("page1")}
                  className="mt-10 rounded-full bg-rec px-8 py-4 text-sm font-medium text-white transition hover:bg-rec-light active:scale-95"
                >
                  Начать бриф →
                </button>
              </div>
            )}

            {(screen === "page1" || screen === "page2") && (
              <div>
                <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
                  {screen === "page1" ? "О вас и о цели" : "Формат, стиль и логистика"}
                </h2>
                <p className="mt-3 text-sm text-paper/55">
                  {screen === "page1"
                    ? "Вопросы 01–08. Отвечайте свободно — коротко или развёрнуто, как удобно."
                    : "Вопросы 09–20. Часть можно пропустить, если пока нет ответа."}
                </p>

                <div className="mt-10 space-y-10">
                  {renderScenes(screen === "page1" ? 1 : 2)}
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {screen === "page2" && (
                    <button
                      type="button"
                      onClick={() => setScreen("page1")}
                      className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/50"
                    >
                      ← К странице 1
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (screen === "page1") {
                        if (validatePage(1)) setScreen("page2");
                      } else if (validatePage(2)) {
                        setScreen("review");
                      }
                    }}
                    className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light active:scale-95"
                  >
                    {screen === "page1" ? "К странице 2 →" : "К монтажному листу →"}
                  </button>
                </div>

                {invalid.length > 0 && (
                  <p className="mt-4 text-sm text-rec">
                    Заполните обязательные поля — их осталось {invalid.length}.
                  </p>
                )}
              </div>
            )}

            {screen === "review" && (
              <div>
                <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
                  Монтажный лист
                </h2>
                <p className="mt-3 text-sm text-paper/55">
                  Проверьте ответы — всё можно поправить прямо здесь.
                </p>

                <div className="mt-8 space-y-8">
                  {[1, 2, 3, 4, 5].map((scene) => (
                    <div key={scene}>
                      <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow">
                        Сцена {String(scene).padStart(2, "0")} · {SCENE_NAMES[scene]}
                      </div>
                      <div className="liquid-glass rounded-2xl">
                        {STEPS.filter((s) => s.scene === scene).map((step) => {
                          const ans = formatAnswer(step, answers);
                          return (
                            <div
                              key={step.id}
                              className="flex items-start justify-between gap-4 border-b border-paper/10 p-4 last:border-b-0"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-paper/80">{step.title}</div>
                                <div
                                  className={`mt-1 text-sm ${
                                    ans ? "text-paper" : "text-paper/35"
                                  }`}
                                >
                                  {ans || "— не указано —"}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setScreen(step.page === 1 ? "page1" : "page2");
                                  setTimeout(() => {
                                    document
                                      .getElementById(`field-${step.id}`)
                                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                                  }, 80);
                                }}
                                className="shrink-0 rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/60 transition hover:border-glow/60 hover:text-glow"
                              >
                                Изменить
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!contactOk && (
                  <p className="mt-6 rounded-lg border border-rec/40 bg-rec/10 p-4 text-sm text-paper">
                    Укажите email для связи — без него мы не сможем ответить.
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen("page2")}
                    className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/50"
                  >
                    ← Назад
                  </button>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!contactOk || sendState === "sending"}
                    className={`rounded-full bg-rec px-8 py-3.5 text-sm font-medium text-white transition ${
                      contactOk && sendState !== "sending"
                        ? "hover:bg-rec-light active:scale-95"
                        : "cursor-not-allowed opacity-40"
                    }`}
                  >
                    {sendState === "sending" ? "Отправляем…" : "Отправить бриф →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyBrief()}
                    className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-glow/60 hover:text-glow"
                  >
                    {copied === "ok" ? "Скопировано ✓" : "Только скопировать текст"}
                  </button>
                </div>

                <p className="mt-4 max-w-xl text-xs leading-relaxed text-paper/50">
                  Бриф уходит нам напрямую. Если отправка почему-то не пройдёт,
                  мы скопируем текст в буфер обмена и откроем письмо на{" "}
                  {BRIEF_EMAIL} — тогда останется вставить текст и нажать
                  «Отправить». Ответы не потеряются в любом случае.
                </p>

                {copied === "fail" && (
                  <div className="mt-4">
                    <p className="text-sm text-paper/70">
                      Браузер не дал скопировать автоматически — выделите текст
                      ниже и скопируйте вручную, затем отправьте его на{" "}
                      <a href={`mailto:${BRIEF_EMAIL}`} className="text-glow hover:underline">
                        {BRIEF_EMAIL}
                      </a>
                      .
                    </p>
                    <textarea
                      readOnly
                      rows={10}
                      value={briefText}
                      onFocus={(e) => e.currentTarget.select()}
                      className={`${inputClass} mt-3 font-mono text-xs`}
                    />
                  </div>
                )}
              </div>
            )}

            {screen === "sent" && (
              <div>
                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-glow">
                  <span className="h-2 w-2 rounded-full bg-glow" />
                  {sendState === "delivered" ? "Бриф у нас" : "Запись завершена"}
                </div>
                <h2 className="mt-6 font-display text-3xl uppercase tracking-tight text-paper sm:text-5xl">
                  {sendState === "delivered" ? "Бриф отправлен" : "Бриф готов к отправке"}
                </h2>
                {sendState === "delivered" ? (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/60">
                    Мы получили ваш бриф и свяжемся с вами в течение рабочего
                    дня. Копия текста осталась в буфере обмена — если захотите
                    сохранить её себе. Срочный вопрос — пишите на{" "}
                    <a href={`mailto:${BRIEF_EMAIL}`} className="text-glow hover:underline">
                      {BRIEF_EMAIL}
                    </a>
                    .
                  </p>
                ) : (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/60">
                    Текст брифа скопирован в буфер обмена, и мы открыли письмо —
                    вставьте текст (Ctrl+V, на Mac ⌘+V) и нажмите «Отправить».
                    Если письмо не появилось — проверьте, назначена ли почтовая
                    программа по умолчанию, или напишите нам напрямую на{" "}
                    <a href={`mailto:${BRIEF_EMAIL}`} className="text-glow hover:underline">
                      {BRIEF_EMAIL}
                    </a>
                    .
                  </p>
                )}

                {/* The answers stay reachable after "отправлено" too: if the
                    mail client never opened, this screen is otherwise a dead
                    end holding twenty answered questions with no way out. */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => void copyBrief()}
                    className="rounded-full border border-paper/20 px-6 py-3 text-sm font-medium text-paper transition hover:border-glow/60 hover:text-glow"
                  >
                    {copied === "ok" ? "Скопировано ✓" : "Скопировать текст брифа ещё раз"}
                  </button>
                  {copied === "fail" && (
                    <textarea
                      readOnly
                      rows={10}
                      value={briefText}
                      onFocus={(e) => e.currentTarget.select()}
                      className={`${inputClass} mt-3 font-mono text-xs`}
                    />
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen("review")}
                    className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/50"
                  >
                    ← К монтажному листу
                  </button>
                  <Link
                    href="/"
                    className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light"
                  >
                    На главную
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );

  function renderScenes(page: 1 | 2) {
    const scenes: number[] = [];
    STEPS.filter((s) => s.page === page).forEach((s) => {
      if (!scenes.includes(s.scene)) scenes.push(s.scene);
    });

    return scenes.map((scene) => (
      <div key={scene}>
        <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-glow">
          Сцена {String(scene).padStart(2, "0")} · {SCENE_NAMES[scene]}
        </div>
        <div className="space-y-6">
          {STEPS.filter((s) => s.page === page && s.scene === scene).map((step) => (
            <div
              key={step.id}
              id={`field-${step.id}`}
              className={`liquid-glass rounded-2xl p-5 transition ${
                invalid.includes(step.id) ? "ring-1 ring-rec" : ""
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-paper/35">{numberOf[step.id]}</span>
                <span className="text-base font-medium text-paper">
                  {step.title}
                  {!step.required && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/35">
                      необязательно
                    </span>
                  )}
                </span>
              </div>
              {step.help && (
                <p className="ml-8 mt-1.5 text-sm text-paper/45">{step.help}</p>
              )}
              <div className="ml-0 mt-4 sm:ml-8">{renderControl(step)}</div>
              {invalid.includes(step.id) && (
                <p className="ml-0 mt-2 text-xs text-rec sm:ml-8">
                  Пожалуйста, заполните это поле.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  }

  function renderControl(step: BriefStep) {
    const v = answers[step.id];

    if (step.type === "text") {
      return (
        <input
          value={typeof v === "string" ? v : ""}
          onChange={(e) => set(step.id, e.target.value)}
          placeholder={step.placeholder}
          className={inputClass}
        />
      );
    }

    if (step.type === "textarea") {
      return (
        <textarea
          rows={3}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => set(step.id, e.target.value)}
          placeholder={step.placeholder}
          className={`${inputClass} resize-none`}
        />
      );
    }

    if (step.type === "contact") {
      const c = (v as ContactValue) || { email: "", phone: "" };
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="email"
            value={c.email}
            onChange={(e) => set(step.id, { ...c, email: e.target.value })}
            placeholder="hello@company.com"
            className={inputClass}
          />
          <input
            value={c.phone}
            onChange={(e) => set(step.id, { ...c, phone: e.target.value })}
            placeholder="Телефон или Telegram (необязательно)"
            className={inputClass}
          />
        </div>
      );
    }

    if (step.type === "chips") {
      const selected = Array.isArray(v) ? v : [];
      return (
        <div className="flex flex-wrap gap-2">
          {step.options?.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  set(
                    step.id,
                    on ? selected.filter((x) => x !== opt) : [...selected, opt]
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  on
                    ? "border-glow bg-glow/15 text-paper"
                    : "border-paper/15 text-paper/65 hover:border-glow/50 hover:text-paper"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    if (step.type === "choice") {
      return (
        <div className="flex flex-wrap gap-2">
          {step.options?.map((opt) => {
            const on = v === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => set(step.id, opt)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  on
                    ? "border-rec bg-rec/15 text-paper"
                    : "border-paper/15 text-paper/65 hover:border-rec/50 hover:text-paper"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    // date
    const note = answers[`${step.id}Note`];
    return (
      <div className="space-y-3">
        <input
          type="date"
          value={typeof v === "string" ? v : ""}
          onChange={(e) => set(step.id, e.target.value)}
          className={`${inputClass} [color-scheme:dark]`}
        />
        <textarea
          rows={2}
          value={typeof note === "string" ? note : ""}
          onChange={(e) => set(`${step.id}Note`, e.target.value)}
          placeholder="Комментарий по срокам (необязательно)"
          className={`${inputClass} resize-none`}
        />
      </div>
    );
  }
}
