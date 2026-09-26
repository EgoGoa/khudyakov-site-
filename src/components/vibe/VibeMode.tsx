"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import NanoSphere from "@/components/ui/NanoSphere";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import LiveBrandWord from "@/components/layout/LiveBrandWord";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { playUi } from "@/lib/sound";
import {
  BUDGET_STEPS,
  OWN_PREFIX,
  buildOffer,
  encodeAnswers,
  formatBudget,
  isOwn,
  questionsFor,
  vibeAnswersToFields,
  type VibeAnswers,
  type VibeQuestion,
  type VibeValue,
} from "@/lib/vibe-quiz";

// Vibe-режим — полноэкранное окно, которое открывает сфера в вайб-баре
// (Егор, 2026-09-26, вариант B «манифест»). Сфера — главный герой окна:
// она всегда стоит по центру, крупно, и на каждое действие (шаг, ответ,
// набор текста) разгорается ярче — окно «отвечает» светом.
//
// Путь посетителя: три экрана о том, что это такое → анкета ~16–18
// вопросов (общие + ветка выбранной услуги) → контакт → «собираю КП» →
// отдельная страница-КП /offer под него (см. lib/vibe-quiz). Заявка уходит
// обычным `fetch("/api/lead"` — ровно в такой записи, её переписывает на
// lead.php сборка статичного hdkv-ai.ru.

// Свой спектр окна: сине-фиолетовый в коралловый, а не страничные неоновые
// пары — Егор просил «мощные, стильные» градиенты вместо «детских».
export const ORB_FROM = "#6f86ff";
export const ORB_TO = "#ff7a9c";
const EASE = [0.22, 1, 0.36, 1] as const;
export const TELEGRAM = "https://t.me/hdkv";
/** Имя и контакт клиента — только в его браузере, для кнопки заказа в КП. */
export const CONTACT_KEY = "hdkv_vibe_contact";

type Stage = "intro" | "quiz" | "contact" | "building";

const INTRO_STEPS = [
  {
    title: "Как это работает",
    items: [
      { n: "01", h: "Бриф", t: "3 минуты, по вопросу" },
      { n: "02", h: "Сборка", t: "Под сферу и бюджет" },
      { n: "03", h: "Твоё КП", t: "Страница — сразу" },
    ],
  },
  {
    title: "Что будет в твоём КП",
    items: [
      { n: "01", h: "Решение", t: "Что сделаем, по пунктам" },
      { n: "02", h: "Кейсы", t: "Из твоей сферы" },
      { n: "03", h: "Тарифы", t: "Под твой бюджет" },
      { n: "04", h: "Заказ", t: "В один клик" },
    ],
  },
];

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export default function VibeMode({
  open,
  onClose,
  onPickDirection,
}: {
  open: boolean;
  onClose: () => void;
  /** «Просто выбрать направление» — прежнее окно выбора разделов. */
  onPickDirection: () => void;
}) {
  // Портал только на клиенте: на сервере document нет.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    playUi("open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      playUi("close");
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{open && <VibeWindow key="vibe" onClose={onClose} onPickDirection={onPickDirection} />}</AnimatePresence>,
    document.body
  );
}

function VibeWindow({ onClose, onPickDirection }: { onClose: () => void; onPickDirection: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(true, ref);
  const narrow = useNarrow();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("intro");
  const [slide, setSlide] = useState(0);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<VibeAnswers>({});
  const [pulse, setPulse] = useState(0);
  const [typing, setTyping] = useState(false);
  const bump = () => setPulse((p) => p + 1);

  const go = (next: () => void) => {
    playUi("click");
    bump();
    next();
  };

  const questions = questionsFor(answers);
  const total = questions.length;
  const progress = stage === "quiz" ? qi / (total + 1) : stage === "contact" ? total / (total + 1) : stage === "building" ? 1 : 0;
  const orbSize =
    stage === "intro" ? (narrow ? 88 : 108) : stage === "building" ? (narrow ? 104 : 128) : narrow ? 54 : 64;

  const finish = () => {
    setStage("building");
    bump();
    // Пауза «собираю» — не для вида: за это время сфера разгорается, и
    // переход на страницу КП читается как результат работы, а не прыжок.
    window.setTimeout(() => {
      router.push(`/offer?p=${encodeAnswers(answers)}`);
      onClose();
    }, 2200);
  };

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Vibe-режим"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="vibe-mode fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none"
      onClick={onClose}
    >
      {/* Окошко по центру (Егор: «окошко, а не на весь экран»). */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="vibe-mode__window"
      >
      <div aria-hidden="true" className="vibe-mode__aurora" />

      {/* Тонкая полоса прогресса по верхнему краю окна — в анкете. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[2] h-[2px]">
        <motion.div
          className="vibe-mode__progress h-full"
          animate={{ width: `${progress * 100}%`, opacity: stage === "intro" ? 0 : 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <div className="vibe-mode__scroll z-[1] flex flex-col px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
        <div className="flex items-center justify-between">
          <span className="vibe-mode__eyebrow">HUD.SERVICE · Vibe</span>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="vibe-mode__icon-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex w-full flex-col items-center pt-2">
          {/* Сфера — всегда по центру над содержимым, меняет только размер. */}
          <motion.div
            layout
            transition={{ duration: 0.7, ease: EASE }}
            className="vibe-mode__orb relative flex items-center justify-center"
            style={{ width: orbSize, height: orbSize }}
          >
            <NanoSphere key={orbSize} size={orbSize} from={ORB_FROM} to={ORB_TO} hot={typing || stage === "building"} pulse={pulse} glow={0.35} />
          </motion.div>

          <div className="mt-5 w-full">
            <AnimatePresence mode="wait" initial={false}>
              {stage === "intro" && (
                <Screen key={`intro-${slide}`}>
                  <Intro slide={slide} onSlide={(i) => go(() => setSlide(i))} onStart={() => go(() => setStage("quiz"))} />
                </Screen>
              )}
              {stage === "quiz" && questions[qi] && (
                <Screen key={`q-${questions[qi].id}`}>
                  <Question
                    q={questions[qi]}
                    index={qi}
                    total={total}
                    answers={answers}
                    onTyping={setTyping}
                    onPulse={bump}
                    onAnswer={(v) =>
                      setAnswers((prev) => {
                        const next = { ...prev, [questions[qi].id]: v };
                        if (v === "" || (Array.isArray(v) && v.length === 0)) delete next[questions[qi].id];
                        return next;
                      })
                    }
                    onNext={() => go(() => (qi + 1 < total ? setQi(qi + 1) : setStage("contact")))}
                    onBack={() => go(() => (qi > 0 ? setQi(qi - 1) : setStage("intro")))}
                  />
                </Screen>
              )}
              {stage === "contact" && (
                <Screen key="contact">
                  <Contact
                    answers={answers}
                    onTyping={setTyping}
                    onBack={() => go(() => setStage("quiz"))}
                    onDone={finish}
                  />
                </Screen>
              )}
              {stage === "building" && (
                <Screen key="building">
                  <Building answers={answers} />
                </Screen>
              )}
            </AnimatePresence>
          </div>
        </div>

        {stage === "intro" && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onPickDirection();
            }}
            className="vibe-mode__quiet mx-auto mt-4"
          >
            Просто выбрать направление →
          </button>
        )}
      </div>
      </motion.div>
    </motion.div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex w-full flex-col items-center text-center"
    >
      {children}
    </motion.div>
  );
}

function Dots({ count, active, onPick }: { count: number; active: number; onPick: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Экран ${i + 1}`}
          aria-current={i === active ? "step" : undefined}
          onClick={() => onPick(i)}
          className={`vibe-mode__dot ${i === active ? "is-on" : ""}`}
        />
      ))}
    </div>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Intro({ slide, onSlide, onStart }: { slide: number; onSlide: (i: number) => void; onStart: () => void }) {
  const last = slide === INTRO_STEPS.length;
  return (
    <>
      {slide === 0 ? (
        <>
          <span className="vibe-mode__eyebrow">Vibe-режим · новый формат</span>
          <h2 className="vibe-mode__title mt-3">
            Персонализируй
            <br />
            {/* Фирменный знак, как в шапке (Егор: «используем наш логотип,
                новый бренд») — точка + HUD.SERVICE с живым градиентом. */}
            <span className="vibe-mode__brand">
              <span aria-hidden="true" className="vibe-mode__brand-dot animate-pulse-rec rounded-full brand-dot" />
              <span>
                HUD<LiveBrandWord>.SERVICE</LiveBrandWord>
              </span>
            </span>{" "}
            под себя
          </h2>
          <p className="vibe-mode__lead mt-4 max-w-[420px]">
            Интерактивный бриф — и твоё <span className="vibe-mode__iris">КП отдельной страницей</span>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["3 минуты", "Под твой бюджет", "Сразу"].map((t) => (
              <span key={t} className="vibe-mode__pill">
                {t}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="vibe-mode__title vibe-mode__title--sm">{INTRO_STEPS[slide - 1].title}</h2>
          <div
            className={`mt-5 grid w-full gap-2.5 text-left ${
              INTRO_STEPS[slide - 1].items.length === 4 ? "grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            {INTRO_STEPS[slide - 1].items.map((it) => (
              <div key={it.n} className="vibe-mode__card">
                <span className="vibe-mode__num">{it.n}</span>
                <h3 className="mt-2 font-display text-[15px] font-bold uppercase">{it.h}</h3>
                <p className="mt-1 text-[13px] font-semibold leading-snug">{it.t}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-7 flex w-full items-center justify-between gap-4">
        <Dots count={INTRO_STEPS.length + 1} active={slide} onPick={onSlide} />
        <div className="flex items-center gap-2">
          {!last && (
            <button type="button" onClick={onStart} className="vibe-mode__ghost">
              Начать сразу
            </button>
          )}
          <button type="button" onClick={last ? onStart : () => onSlide(slide + 1)} className="vibe-mode__cta">
            {last ? "Персонализировать" : "Дальше"}
            <Arrow />
          </button>
        </div>
      </div>
    </>
  );
}

function Question({
  q,
  index,
  total,
  answers,
  onAnswer,
  onNext,
  onBack,
  onTyping,
  onPulse,
}: {
  q: VibeQuestion;
  index: number;
  total: number;
  answers: VibeAnswers;
  onAnswer: (v: VibeValue) => void;
  onNext: () => void;
  onBack: () => void;
  onTyping: (v: boolean) => void;
  onPulse: () => void;
}) {
  const value = answers[q.id];
  const current = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? value : [];
  const [own, setOwn] = useState(
    q.kind === "text" ? current : q.kind === "multi" ? (list.find(isOwn)?.slice(1) ?? "") : isOwn(current) ? current.slice(1) : ""
  );
  const advance = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (advance.current) window.clearTimeout(advance.current);
      onTyping(false);
    },
    [onTyping]
  );

  const tap = () => {
    playUi("click");
    onPulse();
  };

  // Одиночный выбор: выбрал — и через мгновение следующий вопрос, успев
  // увидеть вспышку сферы и реплику ассистента.
  const pickSingle = (v: string) => {
    tap();
    setOwn("");
    onAnswer(v);
    if (advance.current) window.clearTimeout(advance.current);
    advance.current = window.setTimeout(onNext, 850);
  };

  const toggleMulti = (v: string) => {
    tap();
    onAnswer(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  // Свой ответ живёт рядом с вариантами: для multi — отдельным элементом
  // списка с префиксом, для остальных — заменяет выбранный вариант.
  const commitOwn = (text: string) => {
    const t = text.trim();
    if (q.kind === "text") return onAnswer(t);
    if (q.kind === "multi") {
      const rest = list.filter((x) => !isOwn(x));
      return onAnswer(t ? [...rest, OWN_PREFIX + t] : rest);
    }
    if (t) onAnswer(OWN_PREFIX + t);
    else if (isOwn(current)) onAnswer("");
  };

  // Бюджет: ползунок по шагам, по умолчанию 150 000 ₽ — и он сразу
  // засчитывается ответом, иначе «Дальше» на ползунке сбивает с толку.
  const budgetIdx = q.kind === "range" ? Math.max(0, BUDGET_STEPS.indexOf(Number(current) || 150_000)) : 0;
  useEffect(() => {
    if (q.kind === "range" && !current) onAnswer(String(BUDGET_STEPS[budgetIdx]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при входе на вопрос
  }, [q.id]);

  const answered =
    q.kind === "multi" ? list.length > 0 : q.kind === "text" ? own.trim().length > 0 : !!current || own.trim().length > 0;
  const canNext = answered || !!q.optional;
  const reaction = answered && value !== undefined && q.react ? q.react(value, answers) : null;

  const next = () => {
    if (own.trim()) commitOwn(own);
    onNext();
  };

  const ownInput = (placeholder: string) => (
    <div className={`vibe-mode__own mt-2 w-full ${own.trim() && (q.kind === "text" || isOwn(current) || list.some(isOwn)) ? "is-on" : ""}`}>
      <input
        value={own}
        onChange={(e) => {
          setOwn(e.target.value);
          onTyping(e.target.value.length > 0);
        }}
        onFocus={() => onTyping(own.length > 0)}
        onBlur={() => {
          onTyping(false);
          commitOwn(own);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (own.trim() || q.optional) next();
          }
        }}
        placeholder={placeholder}
        aria-label={q.kind === "text" ? q.title : "Свой вариант"}
        className="w-full bg-transparent outline-none placeholder:text-white/70"
      />
      <span aria-hidden="true" className="whitespace-nowrap text-[12px] font-medium">
        Enter ↵
      </span>
    </div>
  );

  return (
    <>
      <span className="vibe-mode__eyebrow">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <h2 className="vibe-mode__title vibe-mode__title--q mt-2">{q.title}</h2>
      <p className="vibe-mode__lead mt-2">{q.hint}</p>

      {q.kind === "single" && (
        <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
          {q.options!.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pickSingle(o.value)}
              aria-pressed={current === o.value}
              className={`vibe-mode__option ${current === o.value ? "is-on" : ""}`}
            >
              <span className="vibe-mode__key">{String.fromCharCode(65 + i)}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}

      {(q.kind === "chips" || q.kind === "multi") && (
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {q.options!.map((o) => {
            const on = q.kind === "multi" ? list.includes(o.value) : current === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => (q.kind === "multi" ? toggleMulti(o.value) : pickSingle(o.value))}
                aria-pressed={on}
                className={`vibe-mode__chip ${on ? "is-on" : ""}`}
              >
                {q.kind === "multi" && <span className={`vibe-mode__tick ${on ? "is-on" : ""}`} aria-hidden="true" />}
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {q.kind === "range" && (
        <div className="mt-6 w-full">
          <div className="vibe-mode__budget">{formatBudget(BUDGET_STEPS[budgetIdx])}</div>
          <input
            type="range"
            min={0}
            max={BUDGET_STEPS.length - 1}
            step={1}
            value={budgetIdx}
            onChange={(e) => {
              onAnswer(String(BUDGET_STEPS[Number(e.target.value)]));
              onPulse();
            }}
            onPointerDown={() => onTyping(true)}
            onPointerUp={() => onTyping(false)}
            aria-label="Бюджет"
            aria-valuetext={formatBudget(BUDGET_STEPS[budgetIdx])}
            className="vibe-mode__range mt-6 w-full"
            style={{ ["--fill" as string]: `${(budgetIdx / (BUDGET_STEPS.length - 1)) * 100}%` }}
          />
          <div className="mt-2 flex justify-between text-[12px] font-medium">
            <span>30 тыс.</span>
            <span>150 тыс.</span>
            <span>400 тыс.</span>
            <span>1 млн+</span>
          </div>
        </div>
      )}

      {q.kind === "text" && <div className="mt-5 flex w-full justify-center">{ownInput(q.placeholder ?? "")}</div>}
      {q.own && q.kind !== "text" && ownInput(q.kind === "multi" ? "Добавить своё…" : "Свой вариант…")}

      <div className="mt-3 min-h-[22px]">
        <AnimatePresence mode="wait">
          {reaction && (
            <motion.p
              key={reaction}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="vibe-mode__assist"
            >
              <span className="vibe-mode__assist-dot" aria-hidden="true" />
              {reaction}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex w-full items-center justify-between">
        <button type="button" onClick={onBack} className="vibe-mode__ghost">
          ← Назад
        </button>
        <button type="button" disabled={!canNext} onClick={next} className="vibe-mode__cta">
          {!answered && q.optional ? "Пропустить" : "Дальше"}
          <Arrow />
        </button>
      </div>
    </>
  );
}

function Contact({
  answers,
  onBack,
  onDone,
  onTyping,
}: {
  answers: VibeAnswers;
  onBack: () => void;
  onDone: () => void;
  onTyping: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const ready = name.trim() && contact.trim() && consent && !sending;

  const submit = async () => {
    if (!ready) return;
    setSending(true);
    setError(false);
    const offer = buildOffer(answers);
    const link = `${window.location.origin}/offer?p=${encodeAnswers(answers)}`;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vibe",
          name: name.trim(),
          phone: contact.trim(),
          fields: {
            "КП клиента": link,
            "Предложено": `${offer.title} · тариф «${offer.tier.name}» (${offer.tier.price})`,
            ...vibeAnswersToFields(answers),
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      try {
        localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name.trim(), contact: contact.trim() }));
      } catch {}
      onDone();
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <span className="vibe-mode__eyebrow">Последний шаг</span>
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3">Куда прислать твоё КП?</h2>
      <p className="vibe-mode__lead mt-3">Страница откроется сразу, а копию ссылки пришлём тебе — чтобы не потерялась.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-7 flex w-full max-w-[520px] flex-col gap-2.5 text-left"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => onTyping(true)}
          onBlur={() => onTyping(false)}
          placeholder="Как к тебе обращаться"
          autoComplete="name"
          className="vibe-mode__field"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onFocus={() => onTyping(true)}
          onBlur={() => onTyping(false)}
          placeholder="Telegram или телефон"
          autoComplete="tel"
          className="vibe-mode__field"
        />
        <div className="mt-1 px-1 [&_label]:text-[13px] [&_label]:text-white">
          <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
        </div>
        {error && (
          <p className="px-1 text-[14px]">
            Не получилось отправить.{" "}
            <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="underline">
              Напиши нам в Telegram
            </a>{" "}
            — ответим быстро.
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={onBack} className="vibe-mode__ghost">
            ← Назад
          </button>
          <button type="submit" disabled={!ready} className="vibe-mode__cta">
            {sending ? "Отправляю…" : "Собрать моё КП"}
            <Arrow />
          </button>
        </div>
      </form>
    </>
  );
}

// «Собираю КП» — строки появляются по очереди, пока сфера горит.
function Building({ answers }: { answers: VibeAnswers }) {
  const offer = buildOffer(answers);
  const lines = [
    `Решение: ${offer.product.toLowerCase()}`,
    offer.sphere ? `Кейсы из сферы «${offer.sphere}»` : "Подборка кейсов",
    `Тариф «${offer.tier.name}» под бюджет`,
    "Собираю страницу…",
  ];
  return (
    <>
      <span className="vibe-mode__eyebrow">Собираю твоё КП</span>
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3 max-w-[760px]">{offer.title}</h2>
      <div className="mt-6 flex flex-col items-center gap-2">
        {lines.map((l, i) => (
          <motion.p
            key={l}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.4, duration: 0.35 }}
            className="vibe-mode__assist"
          >
            <span className="vibe-mode__assist-dot" aria-hidden="true" />
            {l}
          </motion.p>
        ))}
      </div>
    </>
  );
}
