"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { BRIEF_EMAIL, looksLikeEmail, type BriefStep } from "@/lib/brief";
import { HOTEL_VIDEO_STEPS } from "@/lib/hotelVideoBrief";

type ContactValue = { email: string; phone: string };
type AnswerValue = string | string[] | ContactValue | undefined;
type Answers = Record<string, AnswerValue>;
type SendState = "idle" | "sending" | "error" | "sent";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 transition focus:border-glow focus:outline-none";

function isAnswered(step: BriefStep, answers: Answers) {
  const v = answers[step.id];
  if (step.type === "chips") return Array.isArray(v) && v.length > 0;
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    return looksLikeEmail(c?.email);
  }
  return Boolean(v && String(v).trim());
}

function formatAnswer(step: BriefStep, answers: Answers): string | null {
  const v = answers[step.id];
  if (step.type === "chips") return Array.isArray(v) && v.length ? v.join(", ") : null;
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    if (!c?.email) return null;
    return c.phone?.trim() ? `${c.email} · ${c.phone.trim()}` : c.email;
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

// Single flat page, one "Отправить" button — this brief exists so Egor can
// send a client a link that opens, fills in two minutes, and lands in his
// inbox, without the multi-screen wizard the other briefs use.
export default function HotelVideoBriefForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [invalid, setInvalid] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");

  const set = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setInvalid((prev) => prev.filter((x) => x !== id));
  };

  const contact = (answers.contact as ContactValue) || { email: "", phone: "" };
  const contactOk = looksLikeEmail(contact.email);

  const mailtoHref = () => {
    const lines: string[] = ["БРИФ НА ВИДЕОСЪЁМКУ БАЗЫ ОТДЫХА — HUD.SERVICE", ""];
    HOTEL_VIDEO_STEPS.forEach((step) => {
      lines.push(step.title);
      lines.push(formatAnswer(step, answers) || "—");
      lines.push("");
    });
    const company = typeof answers.company === "string" ? answers.company.trim() : "";
    const subject = `Бриф на видеосъёмку — ${company || "новая база отдыха"}`;
    return `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join("\n")
    )}`;
  };

  const send = async () => {
    const missing = HOTEL_VIDEO_STEPS.filter((s) => s.required && !isAnswered(s, answers)).map(
      (s) => s.id
    );
    setInvalid(missing);
    if (missing.length) {
      document.getElementById(`field-${missing[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!contactOk || !consent) return;

    setSendState("sending");
    const fields: Record<string, string> = {};
    HOTEL_VIDEO_STEPS.forEach((step) => {
      if (step.type === "contact") return;
      fields[step.title] = formatAnswer(step, answers) || "—";
    });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "brief-hotel-video",
          name: typeof answers.company === "string" ? answers.company.trim() : "База отдыха",
          phone: contact.phone?.trim() || undefined,
          email: contact.email.trim(),
          fields,
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setSendState("sent");
    } catch {
      setSendState("error");
    }
  };

  if (sendState === "sent") {
    return (
      <section className="py-16 sm:py-24">
        <Container className="max-w-2xl">
          <div className="flex items-center gap-3 font-display text-xs uppercase tracking-[0.2em] text-glow">
            <span className="h-2 w-2 rounded-full bg-glow" />
            Отправлено
          </div>
          <h1 className="mt-6 font-display text-[1.688rem] uppercase tracking-tight text-white sm:text-[2.7rem]">
            Бриф отправлен
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white">
            Мы получили бриф на {BRIEF_EMAIL} и{" "}
            <span className="font-medium text-orange">свяжемся в течение одного рабочего дня</span>.
          </p>
          <Link href="/" className="btn-neon btn-warm btn-3d mt-8 inline-block !py-3.5 !px-7">
            На главную
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-2xl">
        <div className="mb-6 flex items-center gap-3 font-display text-xs uppercase tracking-[0.2em] text-orange">
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-orange" />
          Бриф · 10 вопросов
        </div>

        <h1 className="font-display text-[2.025rem] uppercase leading-[1.17] tracking-tight text-white sm:text-[2.7rem]">
          Съёмка базы отдыха
          <br />
          <span className="kw">земля + воздух</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white">
          Ответьте на 10 вопросов — это займёт пару минут. Заполненный бриф уходит сразу нам на почту.
        </p>

        <div className="mt-10 space-y-5">
          {HOTEL_VIDEO_STEPS.map((step, i) => (
            <div
              key={step.id}
              id={`field-${step.id}`}
              className={`glass-panel rounded-2xl p-5 transition ${
                invalid.includes(step.id) ? "ring-1 ring-orange" : ""
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xs text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium text-white">
                  {step.title}
                  {!step.required && (
                    <span className="ml-2 font-display text-[10px] uppercase tracking-[0.1em] text-white/50">
                      необязательно
                    </span>
                  )}
                </span>
              </div>
              {step.help && <p className="ml-8 mt-1.5 text-sm text-white/70">{step.help}</p>}
              <div className="mt-4 sm:ml-8">{renderControl(step)}</div>
              {invalid.includes(step.id) && (
                <p className="mt-2 text-xs text-orange sm:ml-8">Пожалуйста, заполните это поле.</p>
              )}
            </div>
          ))}
        </div>

        {!contactOk && (
          <p className="mt-6 rounded-lg border border-orange/40 bg-orange/10 p-4 text-sm text-white">
            {contact.email?.trim()
              ? "Проверьте email — похоже, в адресе опечатка."
              : "Укажите email для связи — без него письмо не сформируется."}
          </p>
        )}

        <div className="mt-6">
          <ConsentCheckbox checked={consent} onChange={setConsent} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!contactOk || !consent || sendState === "sending"}
            onClick={send}
            className={`btn-neon btn-warm btn-3d !py-3.5 !px-8 ${
              contactOk && consent && sendState !== "sending" ? "" : "pointer-events-none opacity-40"
            }`}
          >
            {sendState === "sending" ? "Отправляем…" : "Отправить →"}
          </button>
          {invalid.length > 0 && (
            <p className="text-sm text-orange">Заполните обязательные поля — их осталось {invalid.length}.</p>
          )}
        </div>

        {sendState === "error" && (
          <p className="mt-4 max-w-xl text-sm text-orange">
            Не получилось отправить автоматически. Откройте{" "}
            <a href={mailtoHref()} className="underline hover:text-white">
              черновик письма
            </a>{" "}
            и отправьте его на {BRIEF_EMAIL} вручную.
          </p>
        )}
      </Container>
    </section>
  );

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
                onClick={() => set(step.id, on ? selected.filter((x) => x !== opt) : [...selected, opt])}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  on
                    ? "border-glow bg-glow/15 text-white"
                    : "border-white/15 text-white/70 hover:border-glow/50 hover:text-white"
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
                    ? "border-orange bg-orange/15 text-white"
                    : "border-white/15 text-white/70 hover:border-orange/50 hover:text-white"
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
