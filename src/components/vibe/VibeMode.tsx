"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import NanoSphere from "@/components/ui/NanoSphere";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import LiveBrandWord from "@/components/layout/LiveBrandWord";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { playUi } from "@/lib/sound";
import { serviceMeta } from "@/lib/service-content";
import {
  VIBE_QUESTIONS,
  buildVibeDraft,
  vibeAnswersToFields,
  type VibeAnswer,
  type VibeAnswers,
} from "@/lib/vibe-quiz";

// Vibe-режим — полноэкранное окно, которое открывает сфера в вайб-баре
// (Егор, 2026-09-26, вариант B «манифест»). Сфера — главный герой окна:
// она всегда стоит по центру, крупно, и на каждое действие (шаг, ответ,
// набор текста) разгорается ярче — окно «отвечает» светом.
//
// Путь посетителя: три экрана о том, что это такое → анкета по одному
// вопросу → контакт → мгновенный черновик личного предложения (тариф и
// кейсы подбираются в браузере, см. lib/vibe-quiz) и обещание полной
// страницы через час. Заявка уходит обычным `fetch("/api/lead"` — ровно в
// такой записи, её переписывает на lead.php сборка статичного hdkv-ai.ru.

// Свой спектр окна: сине-фиолетовый в коралловый, а не страничные неоновые
// пары — Егор просил «мощные, стильные» градиенты вместо «детских».
const ORB_FROM = "#6f86ff";
const ORB_TO = "#ff7a9c";
const EASE = [0.22, 1, 0.36, 1] as const;
const TELEGRAM = "https://t.me/hdkv";

type Stage = "intro" | "quiz" | "contact" | "result";

const INTRO_STEPS = [
  {
    title: "Как это работает",
    items: [
      { n: "01", h: "Анкета", t: "8 вопросов по одному, с вариантами или своим ответом. Три минуты." },
      { n: "02", h: "Разбор", t: "Команда вместе с AI-ассистентом изучает задачу, бюджет и сроки." },
      { n: "03", h: "Твой сайт", t: "Персональная страница-предложение — через час, по ссылке." },
    ],
  },
  {
    title: "Что будет на твоей странице",
    items: [
      { n: "01", h: "Решение", t: "Что именно сделаем под твою задачу и почему так." },
      { n: "02", h: "Кейсы", t: "Работы из твоей сферы, а не общее портфолио." },
      { n: "03", h: "Тарифы", t: "Цены под твой бюджет и сроки — без лишнего." },
      { n: "04", h: "Один клик", t: "Заказать, обсудить или запустить — сразу со страницы." },
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

  const total = VIBE_QUESTIONS.length;
  const progress = stage === "quiz" ? qi / total : stage === "contact" ? 1 : 0;
  const orbSize = stage === "intro" ? (narrow ? 150 : 230) : stage === "result" ? (narrow ? 96 : 130) : narrow ? 84 : 118;

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
      className="vibe-mode fixed inset-0 z-[100] overflow-y-auto overscroll-contain outline-none"
    >
      <div aria-hidden="true" className="vibe-mode__aurora" />

      {/* Тонкая полоса прогресса по верхнему краю — только в анкете. */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[2] h-[2px]">
        <motion.div
          className="vibe-mode__progress h-full"
          animate={{ width: `${progress * 100}%`, opacity: stage === "quiz" || stage === "contact" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <div className="relative z-[1] flex min-h-full flex-col px-4 pb-6 pt-4 sm:px-8 sm:pt-6">
        <div className="flex items-center justify-between">
          <span className="vibe-mode__eyebrow">HUD.SERVICE · Vibe</span>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="vibe-mode__icon-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center py-6">
          {/* Сфера — всегда по центру над содержимым, меняет только размер. */}
          <motion.div
            layout
            transition={{ duration: 0.7, ease: EASE }}
            className="vibe-mode__orb relative flex items-center justify-center"
            style={{ width: orbSize, height: orbSize }}
          >
            <NanoSphere key={orbSize} size={orbSize} from={ORB_FROM} to={ORB_TO} hot={typing || stage === "result"} pulse={pulse} />
          </motion.div>

          <div className="mt-6 w-full sm:mt-8">
            <AnimatePresence mode="wait" initial={false}>
              {stage === "intro" && (
                <Screen key={`intro-${slide}`}>
                  <Intro
                    slide={slide}
                    onSlide={(i) => go(() => setSlide(i))}
                    onStart={() => go(() => setStage("quiz"))}
                  />
                </Screen>
              )}
              {stage === "quiz" && (
                <Screen key={`q-${qi}`}>
                  <Question
                    index={qi}
                    answer={answers[VIBE_QUESTIONS[qi].id]}
                    onTyping={setTyping}
                    onPick={(a) => {
                      playUi("click");
                      bump();
                      setAnswers((prev) => ({ ...prev, [VIBE_QUESTIONS[qi].id]: a }));
                    }}
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
                    onDone={() => go(() => setStage("result"))}
                  />
                </Screen>
              )}
              {stage === "result" && (
                <Screen key="result">
                  <Result answers={answers} onClose={onClose} />
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
            className="vibe-mode__quiet mx-auto"
          >
            Просто выбрать направление →
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
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

function Intro({ slide, onSlide, onStart }: { slide: number; onSlide: (i: number) => void; onStart: () => void }) {
  const last = slide === INTRO_STEPS.length;
  return (
    <>
      {slide === 0 ? (
        <>
          <span className="vibe-mode__eyebrow">Vibe-режим · новый формат</span>
          <h2 className="vibe-mode__title mt-4">
            Персонализируй
            <br />
            {/* Фирменный знак, как в шапке (Егор: «используем наш логотип,
                новый бренд») — точка + HUD.SERVICE с живым градиентом. */}
            <span className="vibe-mode__brand">
              <span aria-hidden="true" className="vibe-mode__brand-dot animate-pulse-rec rounded-full brand-dot" />
              HUD<LiveBrandWord>.SERVICE</LiveBrandWord>
            </span>{" "}
            под себя
          </h2>
          <p className="vibe-mode__lead mt-5 max-w-[560px]">
            Ответь на 8 вопросов — и получи персональное предложение: адаптивный сайт под твой проект, с решением, кейсами и
            ценой.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["3 минуты", "8 вопросов", "Готово за 1 час"].map((t) => (
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
            className={`mt-7 grid w-full gap-3 text-left ${
              INTRO_STEPS[slide - 1].items.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            {INTRO_STEPS[slide - 1].items.map((it) => (
              <div key={it.n} className="vibe-mode__card">
                <span className="vibe-mode__num">{it.n}</span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">{it.h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.5]">{it.t}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-9 flex w-full max-w-[560px] items-center justify-between gap-4">
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

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Question({
  index,
  answer,
  onPick,
  onNext,
  onBack,
  onTyping,
}: {
  index: number;
  answer?: VibeAnswer;
  onPick: (a: VibeAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  onTyping: (v: boolean) => void;
}) {
  const q = VIBE_QUESTIONS[index];
  const [own, setOwn] = useState(answer?.own ? answer.label : "");
  const advance = useRef<number | null>(null);
  useEffect(() => () => {
    if (advance.current) window.clearTimeout(advance.current);
    onTyping(false);
  }, [onTyping]);

  const pick = (value: string, label: string) => {
    onPick({ value, label });
    setOwn("");
    // Как в хороших анкетах: выбрал — и через мгновение следующий вопрос,
    // успев увидеть вспышку сферы и реплику ассистента.
    if (advance.current) window.clearTimeout(advance.current);
    advance.current = window.setTimeout(onNext, 850);
  };

  const commitOwn = () => {
    const v = own.trim();
    if (!v) return;
    onPick({ value: v, label: v, own: true });
  };

  const onOwnKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = own.trim();
      if (v) {
        onPick({ value: v, label: v, own: true });
        onNext();
      }
    }
  };

  const reaction = answer && q.react ? q.react(answer) : null;
  const canNext = !!answer || q.optional || own.trim().length > 0;

  return (
    <>
      <span className="vibe-mode__eyebrow">
        {String(index + 1).padStart(2, "0")} / {String(VIBE_QUESTIONS.length).padStart(2, "0")}
      </span>
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3">{q.title}</h2>
      <p className="vibe-mode__lead mt-3">{q.hint}</p>

      {q.options.length > 0 && (
        <div
          className={
            q.chips
              ? "mt-7 flex max-w-[720px] flex-wrap justify-center gap-2"
              : "mt-7 grid w-full max-w-[640px] gap-2.5 sm:grid-cols-2"
          }
        >
          {q.options.map((o, i) => {
            const on = !answer?.own && answer?.value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value, o.label)}
                aria-pressed={on}
                className={`${q.chips ? "vibe-mode__chip" : "vibe-mode__option"} ${on ? "is-on" : ""}`}
              >
                {!q.chips && <span className="vibe-mode__key">{String.fromCharCode(65 + i)}</span>}
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {q.own && (
        <div className={`vibe-mode__own mt-2.5 w-full max-w-[640px] ${answer?.own ? "is-on" : ""}`}>
          <input
            value={own}
            onChange={(e) => {
              setOwn(e.target.value);
              onTyping(e.target.value.length > 0);
            }}
            onFocus={() => onTyping(own.length > 0)}
            onBlur={() => {
              onTyping(false);
              commitOwn();
            }}
            onKeyDown={onOwnKey}
            placeholder={q.options.length ? "Свой вариант…" : "Ссылка или пара слов о проекте"}
            aria-label="Свой вариант"
            className="w-full bg-transparent outline-none placeholder:text-white/70"
          />
          <span aria-hidden="true" className="whitespace-nowrap text-[12px] font-medium">
            Enter ↵
          </span>
        </div>
      )}

      <div className="mt-4 min-h-[22px]">
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

      <div className="mt-6 flex w-full max-w-[640px] items-center justify-between">
        <button type="button" onClick={onBack} className="vibe-mode__ghost">
          ← Назад
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => {
            if (!answer && own.trim()) commitOwn();
            onNext();
          }}
          className="vibe-mode__cta"
        >
          {!answer && !own.trim() && q.optional ? "Пропустить" : "Дальше"}
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
    try {
      const draft = buildVibeDraft(answers);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vibe",
          name: name.trim(),
          phone: contact.trim(),
          fields: {
            ...vibeAnswersToFields(answers),
            "Черновик на сайте": `${draft.headline} · тариф «${draft.tier.name}» (${draft.tier.price})`,
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
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
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3">Куда прислать твою страницу?</h2>
      <p className="vibe-mode__lead mt-3">Черновик покажем сразу, а полную персональную страницу пришлём через час.</p>
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
        <div className="mt-1 px-1 [&_label]:text-white [&_label]:text-[13px]">
          <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
        </div>
        {error && (
          <p className="px-1 text-[14px]">
            Не получилось отправить.{" "}
            <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="underline">
              Напиши нам в Telegram
            </a>{" "}
            — ответим за час.
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={onBack} className="vibe-mode__ghost">
            ← Назад
          </button>
          <button type="submit" disabled={!ready} className="vibe-mode__cta">
            {sending ? "Собираю…" : "Получить предложение"}
            <Arrow />
          </button>
        </div>
      </form>
    </>
  );
}

function Result({ answers, onClose }: { answers: VibeAnswers; onClose: () => void }) {
  const draft = buildVibeDraft(answers);
  const features = (draft.tier.benefits ?? draft.tier.features).slice(0, 3);
  return (
    <>
      <span className="vibe-mode__eyebrow">Черновик готов · полная версия через час</span>
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3 max-w-[760px]">{draft.headline}</h2>

      <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-3">
        <div className="vibe-mode__card vibe-mode__card--accent">
          <span className="vibe-mode__num">Тариф</span>
          <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em]">{draft.tier.name}</h3>
          <p className="mt-1 text-[15px] font-medium">{draft.tier.price}</p>
          <p className="mt-2 text-[13px] leading-[1.5]">{draft.tier.tagline}</p>
        </div>
        <div className="vibe-mode__card">
          <span className="vibe-mode__num">Что войдёт</span>
          <ul className="mt-3 space-y-2 text-[14px] leading-[1.45]">
            {features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="vibe-mode__assist-dot mt-[7px]" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="vibe-mode__card">
          <span className="vibe-mode__num">Кейсы для тебя</span>
          <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.35]">
            {draft.cases.map((w) => (
              <li key={w.id}>
                <span className="font-semibold">{w.title}</span>
                <span className="block text-[12px]">{w.client}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="vibe-mode__cta">
          Обсудить в Telegram
          <Arrow />
        </a>
        <Link href="/works" onClick={onClose} className="vibe-mode__ghost vibe-mode__ghost--pill">
          Все кейсы
        </Link>
        <Link href={`/${serviceMeta[draft.key].slug}`} onClick={onClose} className="vibe-mode__ghost vibe-mode__ghost--pill">
          Раздел «{serviceMeta[draft.key].label}»
        </Link>
      </div>
    </>
  );
}
