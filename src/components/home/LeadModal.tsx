"use client";

import { useState } from "react";
import CenterModal from "@/components/ui/CenterModal";
import { MicIcon, PhoneIcon, UserIcon } from "@/components/ui/Icons";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useDictation } from "@/lib/use-dictation";

type Screen = "choice" | "call" | "consult" | "sending" | "sent" | "error";
type Accent = "call" | "consult";

const CUSTOM = "Свой вариант";

const inputClass =
  "w-full rounded-lg border border-paper/15 bg-paper/[0.04] py-3 pl-4 pr-11 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none";

// Egor's ask: every field in this brief can be filled either by typing or
// by talking — dictation appends to whatever's already in the field
// (rather than replacing it), so one person can type half an answer and
// finish it by voice. Each field gets its own mic rather than one big
// "dictate everything" button because Web Speech has no notion of which
// field a rambling answer belongs to — per-field keeps the transcript
// scoped to the question actually being answered.
function DictateButton({ onText }: { onText: (t: string) => void }) {
  const { listening, supported, toggle } = useDictation((t) => onText(t));
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Остановить запись" : "Надиктовать"}
      className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition ${
        listening ? "bg-glow/25 text-glow" : "text-paper/40 hover:bg-paper/10 hover:text-paper/80"
      }`}
    >
      <MicIcon className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
    </button>
  );
}

function DictateField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      <DictateButton onText={(t) => onChange(value ? `${value} ${t}` : t)} />
    </div>
  );
}

// Every question is a row of quick-pick chips plus a "Свой вариант" chip
// that swaps in a free (voice-capable) text field — Egor's ask, so a
// visitor can answer in one tap instead of typing every field, but never
// gets boxed out of an answer that isn't in the list. `accent` just tints
// the selected chip: rec/orange for the call form, glow cyan for the
// consult one, so the two forms read as two different, colourful paths
// rather than the same grey list twice.
function ChoiceField({
  options,
  value,
  onChange,
  customPlaceholder,
  accent,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  customPlaceholder?: string;
  accent: Accent;
}) {
  const isCustom = value !== "" && !options.includes(value);
  const [customMode, setCustomMode] = useState(isCustom);
  const selectedClass =
    accent === "call" ? "border-rec bg-rec/15 text-paper" : "border-glow bg-glow/15 text-paper";

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = opt === CUSTOM ? customMode : !customMode && value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (opt === CUSTOM) {
                  setCustomMode(true);
                  return;
                }
                setCustomMode(false);
                onChange(opt);
              }}
              className={`rounded-full border px-3.5 py-2 text-xs transition ${
                on ? selectedClass : "border-paper/15 text-paper/65 hover:border-paper/40 hover:text-paper"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {customMode && (
        <DictateField value={value === CUSTOM ? "" : value} onChange={onChange} placeholder={customPlaceholder} />
      )}
    </div>
  );
}

const CALL_FIELDS = [
  {
    id: "budget",
    label: "Бюджет",
    options: ["До 150 000 ₽", "150 000–400 000 ₽", "400 000–800 000 ₽", "800 000 ₽ и выше", CUSTOM],
    customPlaceholder: "Свой бюджет",
  },
  {
    id: "format",
    label: "Формат",
    options: ["Рекламный ролик", "Имиджевое видео", "Шоурил", "AI-видео", "Motion / анимация", CUSTOM],
    customPlaceholder: "Опишите формат",
  },
  {
    id: "deadline",
    label: "Сроки",
    options: ["Как можно скорее", "В течение месяца", "1–3 месяца", "Дата не критична", CUSTOM],
    customPlaceholder: "Укажите дату или срок",
  },
  {
    id: "refs",
    label: "Референсы",
    options: ["Пришлю ссылки отдельно", "Ориентируюсь на ваше портфолио", "Без референсов", CUSTOM],
    customPlaceholder: "Ссылки на примеры",
  },
  {
    id: "wishes",
    label: "Пожелания",
    options: ["На ваш вкус, доверяю команде", "Важно согласовать каждый этап", "Есть особые пожелания", CUSTOM],
    customPlaceholder: "Что важно учесть",
  },
] as const;

// Same shape as CALL_FIELDS's questions — a producer consult doesn't need
// budget/format/refs up front (that's the call), just enough to book the
// right slot and know what to prepare.
const CONSULT_FIELDS = [
  {
    id: "time",
    label: "Удобное время",
    options: ["Утро · 10:00–13:00", "День · 13:00–17:00", "Вечер · 17:00–20:00", CUSTOM],
    customPlaceholder: "Когда удобно созвониться",
  },
  {
    id: "wishes",
    label: "О чём хотите поговорить",
    options: ["Выбор формата под задачу", "Смета и сроки", "Сценарий и референсы", CUSTOM],
    customPlaceholder: "Кратко опишите задачу",
  },
] as const;

async function submitLead(
  type: "call" | "consult",
  name: string,
  phone: string,
  fieldValues: Record<string, string>,
  fieldLabels: readonly { id: string; label: string }[]
) {
  const fields: Record<string, string> = {};
  fieldLabels.forEach(({ id, label }) => {
    fields[label] = fieldValues[id] ?? "";
  });
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, phone, fields }),
  });
  if (!res.ok) throw new Error("send_failed");
}

// Opened from a work card's "Обсудить" (Works.tsx) — the same glass window
// every entry point on the site opens (CenterModal), so this reads as part
// of the same flow as the welcome/service overlays rather than a
// bolted-on popup. Two paths from one window rather than two separate
// modals: a quick call-me brief (budget, format, deadline, refs, wishes)
// or a producer consult slot, both ending on the same "sent" screen.
export default function LeadModal({
  open,
  onClose,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  /** Seeds the call-brief's fields — the promo card opens this same modal
   *  with "Формат" already set to "AI-видео" and the September offer noted
   *  in "Пожелания", so a visitor doesn't have to retype what they clicked
   *  through to get here. Left untouched (not merged into CALL_FIELDS'
   *  defaults) for the plain "Обсудить" entry point on a work card. */
  prefill?: Record<string, string>;
}) {
  const [screen, setScreen] = useState<Screen>("choice");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [values, setValues] = useState<Record<string, string>>(prefill ?? {});

  // Without this, the page underneath (CinematicStage's pinned chapter deck)
  // kept reading every wheel/touch gesture as its own — scrolling inside
  // this window stepped the chapter behind it instead. See CinematicStage's
  // `scrollLocked` check, which bails out whenever body scroll is locked.
  useBodyScrollLock(open);

  const reset = () => {
    setScreen("choice");
    setName("");
    setPhone("");
    setValues(prefill ?? {});
  };

  const close = () => {
    onClose();
    // Wait for CenterModal's own exit animation before clearing state, so
    // the form doesn't visibly blank out while the window is still fading.
    setTimeout(reset, 400);
  };

  const submit = async (type: "call" | "consult") => {
    setScreen("sending");
    try {
      await submitLead(type, name, phone, values, type === "call" ? CALL_FIELDS : CONSULT_FIELDS);
      setScreen("sent");
    } catch {
      setScreen("error");
    }
  };

  const formType: "call" | "consult" | null = screen === "call" ? "call" : screen === "consult" ? "consult" : null;
  const fieldsFor = formType === "call" ? CALL_FIELDS : formType === "consult" ? CONSULT_FIELDS : null;
  const canSend = name.trim() && phone.trim();

  return (
    <CenterModal open={open} onClose={close} ariaLabel="Связаться с HDKV.AGENCY" compact>
      <div className="flex h-fit w-full flex-col text-center">
        {screen === "choice" && (
          <>
            <h3 className="font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Как удобнее обсудить проект?
            </h3>
            <p className="mt-3 text-sm text-paper/60">
              Выберите вариант — ответим в течение одного рабочего дня.
            </p>
            <div className="mx-auto mt-8 flex w-full max-w-[260px] flex-col gap-3">
              <button type="button" onClick={() => setScreen("call")} className="lead-choice-btn lead-choice-call">
                <PhoneIcon className="h-4 w-4" />
                Заказать звонок
              </button>
              <button type="button" onClick={() => setScreen("consult")} className="lead-choice-btn lead-choice-consult">
                <UserIcon className="h-4 w-4" />
                Консультация с продюсером
              </button>
            </div>
          </>
        )}

        {fieldsFor && formType && (
          <>
            <h3 className="font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              {screen === "call" ? "Заказать звонок" : "Консультация с продюсером"}
            </h3>
            <p className="mt-3 text-sm text-paper/60">
              {screen === "call"
                ? "Выберите ответы одним тапом или расскажите голосом — перезвоним и уточним детали."
                : "Продюсер свяжется, чтобы разобрать задачу и предложить формат."}
            </p>

            <div className="mt-5 space-y-3.5 text-left">
              <div className="grid gap-3 sm:grid-cols-2">
                <DictateField value={name} onChange={setName} placeholder="Как к вам обращаться" />
                <DictateField value={phone} onChange={setPhone} placeholder="Телефон или Telegram" />
              </div>
              {fieldsFor.map((f) => (
                <div key={f.id}>
                  <label className="mb-1.5 block font-display text-[11px] uppercase tracking-[0.1em] text-paper/45">
                    {f.label}
                  </label>
                  <ChoiceField
                    options={f.options}
                    value={values[f.id] ?? ""}
                    onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
                    customPlaceholder={f.customPlaceholder}
                    accent={formType}
                  />
                </div>
              ))}
              <p className="flex items-center gap-1.5 text-xs text-paper/40">
                <MicIcon className="h-3.5 w-3.5" /> В «Свой вариант» можно надиктовать ответ голосом.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setScreen("choice")}
                className="rounded-full border border-paper/20 px-6 py-3 text-sm font-medium text-paper transition hover:border-paper/50"
              >
                ← Назад
              </button>
              <button
                type="button"
                disabled={!canSend}
                onClick={() => submit(formType)}
                className={`rounded-full bg-rec px-7 py-3 text-sm font-medium text-white transition ${
                  canSend ? "hover:bg-rec-light active:scale-95" : "pointer-events-none opacity-40"
                }`}
              >
                Отправить →
              </button>
            </div>
          </>
        )}

        {screen === "sending" && (
          <p className="py-10 text-sm text-paper/60">Отправляем…</p>
        )}

        {screen === "sent" && (
          <>
            <div className="mx-auto flex items-center gap-3 font-display text-xs uppercase tracking-[0.2em] text-glow">
              <span className="h-2 w-2 rounded-full bg-glow" />
              Заявка отправлена
            </div>
            <h3 className="mt-5 font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Спасибо, {name || "мы получили заявку"}!
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/60">
              Ответим в течение одного рабочего дня на указанный контакт.
            </p>
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-7 rounded-full bg-rec px-7 py-3 text-sm font-medium text-white transition hover:bg-rec-light"
            >
              Закрыть
            </button>
          </>
        )}

        {screen === "error" && (
          <>
            <h3 className="font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Не получилось отправить
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/60">
              Напишите нам напрямую в Telegram —{" "}
              <a href="https://t.me/hdkv" target="_blank" rel="noopener noreferrer" className="text-glow hover:underline">
                @hdkv
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => setScreen("choice")}
              className="mx-auto mt-7 rounded-full border border-paper/20 px-6 py-3 text-sm font-medium text-paper transition hover:border-paper/50"
            >
              ← Назад
            </button>
          </>
        )}
      </div>
    </CenterModal>
  );
}
