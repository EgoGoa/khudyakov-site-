"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { BRIEF_EMAIL, SCENE_NAMES, STEPS, type BriefStep } from "@/lib/brief";

type ContactValue = { email: string; phone: string };
type AnswerValue = string | string[] | ContactValue | undefined;
type Answers = Record<string, AnswerValue>;

type Screen = "intro" | "page1" | "page2" | "review" | "sent";

const inputClass =
  "w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none";

function isAnswered(step: BriefStep, answers: Answers) {
  const v = answers[step.id];
  if (step.type === "chips") return Array.isArray(v) && v.length > 0;
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    return Boolean(c?.email && c.email.trim());
  }
  return Boolean(v && String(v).trim());
}

function formatAnswer(step: BriefStep, answers: Answers): string | null {
  const v = answers[step.id];

  if (step.type === "chips") {
    return Array.isArray(v) && v.length ? v.join(", ") : null;
  }
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    if (!c?.email) return null;
    const parts: string[] = [];
    const name = answers.name;
    if (typeof name === "string" && name.trim()) parts.push(name.trim());
    parts.push(c.email);
    if (c.phone?.trim()) parts.push(c.phone.trim());
    return parts.join(" · ");
  }
  if (step.type === "date") {
    if (typeof v !== "string" || !v) return null;
    const d = new Date(`${v}T00:00:00`);
    const out = Number.isNaN(d.getTime())
      ? v
      : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    const note = answers[`${step.id}Note`];
    return typeof note === "string" && note.trim() ? `${out} — ${note.trim()}` : out;
  }
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export default function BriefForm() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [invalid, setInvalid] = useState<string[]>([]);

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

  const mailtoHref = () => {
    const lines: string[] = ["БРИФ НА ВИДЕОПРОДАКШН — HDKV.AGENCY", ""];
    const seen: number[] = [];
    STEPS.forEach((step) => {
      if (!seen.includes(step.scene)) {
        seen.push(step.scene);
        lines.push(`— ${SCENE_NAMES[step.scene].toUpperCase()} —`);
      }
      lines.push(step.title);
      lines.push(formatAnswer(step, answers) || "—");
      lines.push("");
    });
    const company = typeof answers.company === "string" ? answers.company.trim() : "";
    const subject = `Бриф на видео — ${company || "новый проект"}`;
    return `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
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
                    Укажите email для связи — без него письмо не сформируется.
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
                  <a
                    href={contactOk ? mailtoHref() : undefined}
                    onClick={() => {
                      if (contactOk) setTimeout(() => setScreen("sent"), 250);
                    }}
                    aria-disabled={!contactOk}
                    className={`rounded-full bg-rec px-8 py-3.5 text-sm font-medium text-white transition ${
                      contactOk
                        ? "hover:bg-rec-light active:scale-95"
                        : "pointer-events-none opacity-40"
                    }`}
                  >
                    Отправить бриф на почту →
                  </a>
                </div>

                <p className="mt-4 max-w-xl text-xs leading-relaxed text-paper/40">
                  Кнопка откроет черновик письма в вашей почтовой программе,
                  адресованный на {BRIEF_EMAIL}, с уже готовым текстом брифа —
                  останется нажать «Отправить».
                </p>
              </div>
            )}

            {screen === "sent" && (
              <div>
                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-glow">
                  <span className="h-2 w-2 rounded-full bg-glow" />
                  Запись завершена
                </div>
                <h2 className="mt-6 font-display text-3xl uppercase tracking-tight text-paper sm:text-5xl">
                  Бриф готов к отправке
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/60">
                  Мы открыли черновик письма в вашей почте. Если он не появился —
                  проверьте, назначена ли почтовая программа по умолчанию, или
                  напишите нам напрямую на{" "}
                  <a href={`mailto:${BRIEF_EMAIL}`} className="text-glow hover:underline">
                    {BRIEF_EMAIL}
                  </a>
                  .
                </p>
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
