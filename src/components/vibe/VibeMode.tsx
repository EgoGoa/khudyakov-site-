"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import NanoSphere, { type SphereIntro } from "@/components/ui/NanoSphere";
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
// вопросов (общие + ветка выбранной услуги) → контакт → «собираю лендинг» →
// персональный лендинг /offer под его задачу (см. lib/vibe-quiz). Егор
// (2026-09-26): это не КП, а одностраничный сайт, собранный только под
// клиента, — «Vibe-сайт». Заявка уходит
// обычным `fetch("/api/lead"` — ровно в такой записи, её переписывает на
// lead.php сборка статичного hdkv-ai.ru.

// Свой спектр окна: сине-фиолетовый в коралловый, а не страничные неоновые
// пары — Егор просил «мощные, стильные» градиенты вместо «детских».
export const ORB_FROM = "#6f86ff";
export const ORB_TO = "#ff7a9c";
const EASE = [0.22, 1, 0.36, 1] as const;
export const TELEGRAM = "https://t.me/hdkv";
/** Имя и контакт клиента — только в его браузере, для кнопки заказа на лендинге. */
export const CONTACT_KEY = "hdkv_vibe_contact";

// splash → hello → intro — заставка окна (Егор, 2026-09-26): сфера на всё
// окно, под ней появляется логотип, через секунду заставка гаснет, печатается
// «Персонализируй наш сервис для себя», и только потом три слайда-объяснения.
type Stage = "splash" | "hello" | "intro" | "quiz" | "contact" | "building";
const SPLASH_MS = 4800;
const SMOOTH = [0.65, 0, 0.35, 1] as const;
const HELLO_TEXT = ["Персонализируй наш сервис ", "для себя"] as const;

const INTRO_STEPS: { title: string; lead?: string; items: { n: string; h: string; t: string }[] }[] = [
  {
    title: "Что такое Vibe-сайт",
    lead: "Лендинг, собранный только под твою задачу",
    items: [
      { n: "01", h: "Одна страница", t: "Всё про твой проект" },
      { n: "02", h: "Без поиска", t: "Не нужно листать сайт" },
      { n: "03", h: "Под бюджет", t: "Тарифы тебе по силам" },
    ],
  },
  {
    title: "Как это работает",
    items: [
      { n: "01", h: "Бриф", t: "3 минуты, по вопросу" },
      { n: "02", h: "Сборка", t: "Под задачу и бюджет" },
      { n: "03", h: "Твой лендинг", t: "Одна страница — сразу" },
    ],
  },
  {
    title: "Что будет на твоём лендинге",
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

  const [stage, setStage] = useState<Stage>("splash");
  const orbRef = useRef<HTMLDivElement>(null);
  // Появление сферы — «схлопывание» (выбор Егора); ?sphere=vortex|stroke|dust — для сравнения.
  const [sphereIntro] = useState<SphereIntro>(() => {
    const v = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sphere") : null;
    return v === "dust" || v === "stroke" || v === "vortex" ? v : "implode";
  });
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

  // Заставка сама переходит к приветствию.
  useEffect(() => {
    if (stage !== "splash") return;
    const t = window.setTimeout(() => setStage("hello"), SPLASH_MS);
    return () => window.clearTimeout(t);
  }, [stage]);

  const questions = questionsFor(answers);
  const total = questions.length;
  const progress = stage === "quiz" ? qi / (total + 1) : stage === "contact" ? total / (total + 1) : stage === "building" ? 1 : 0;
  const orbSize =
    stage === "splash" ? (narrow ? 150 : 200) : stage === "hello" ? (narrow ? 96 : 120) : stage === "intro" ? (narrow ? 72 : 84) : stage === "building" ? (narrow ? 104 : 128) : narrow ? 54 : 64;
  // Отступ сферы сверху: на заставке и приветствии сфера с текстом стоят
  // в середине окна, дальше поднимаются к верху.
  const orbSlot = stage === "contact" ? "quiz" : stage;
  const orbTop = stage === "splash" ? (narrow ? 70 : 96) : stage === "hello" ? (narrow ? 90 : 120) : stage === "building" ? 60 : 0;

  const finish = () => {
    setStage("building");
    bump();
    // Пауза «собираю» — не для вида: за это время сфера разгорается, и
    // переход на лендинг читается как результат работы, а не прыжок.
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
      aria-label="Vibe-сайт"
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
        className="vibe-mode__window vibe-mode__window--fixed"
      >
      <div aria-hidden="true" className="vibe-mode__aurora" />
      <VibeDust originRef={orbRef} />

      {/* Тонкая полоса прогресса по верхнему краю окна — в анкете. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[2] h-[2px]">
        <motion.div
          className="vibe-mode__progress h-full"
          animate={{ width: `${progress * 100}%`, opacity: stage === "quiz" || stage === "contact" || stage === "building" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      {/* Окно статичного размера (Егор: «не адаптируется под текст»):
          высота задана в CSS, содержимое стоит по центру. */}
      <div className="vibe-mode__scroll z-[1] flex h-full flex-col px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
        <div className="flex items-center justify-between">
          <span className={`vibe-mode__tag transition-opacity duration-500 ${stage === "splash" || stage === "hello" ? "opacity-0" : ""}`}>
            Vibe-сайт
          </span>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="vibe-mode__icon-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex w-full flex-1 flex-col items-center pt-1">
          {/* Сфера не переезжает (Егор: «плавно затухает и там плавно
              появляется»): у каждого вида экрана своё место и размер, при
              смене вида она гаснет через размытие и проявляется на новом
              месте. Между вопросами анкеты место одно — сфера не мигает. */}
          <div ref={orbRef} className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={orbSlot}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.6, ease: SMOOTH }}
                style={{ paddingTop: orbTop }}
                className="vibe-mode__orb flex w-full justify-center"
              >
                <NanoSphere
                  size={orbSize}
                  from={ORB_FROM}
                  to={ORB_TO}
                  hot={typing || stage === "building"}
                  pulse={pulse}
                  glow={0.35}
                  intro={orbSlot === "splash" ? sphereIntro : undefined}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 w-full">
            {/* initial не выключаем: иначе гасится и задержка логотипа заставки. */}
            <AnimatePresence mode="wait">
              {stage === "splash" && (
                <Screen key="splash">
                  <SplashLogo />
                </Screen>
              )}
              {stage === "hello" && (
                <Screen key="hello">
                  <Hello onDone={() => setStage("intro")} />
                </Screen>
              )}
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
            className="vibe-mode__quiet mx-auto mt-auto"
          >
            Просто выбрать направление →
          </button>
        )}
      </div>
      </motion.div>
    </motion.div>
  );
}

// Фон окна: мелкая пыль мягко исходит от сферы (Егор: «частиц больше,
// детальнее, меньше, разной плотности и яркости — как будто они все от
// сферы мягко идут»). Частица рождается у кольца, медленно уплывает наружу
// с лёгким завихрением, тормозит и тает. Плотность по кругу неровная —
// сгустки медленно поворачиваются. На слабых устройствах пыли нет, на
// средних — меньше частиц и 30 кадров/с.
function VibeDust({ originRef }: { originRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const html = document.documentElement;
    if (html.hasAttribute("data-lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mid = html.hasAttribute("data-mid");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Центр и радиус сферы в координатах окна — берём с её обёртки.
    let ox = w / 2;
    let oy = h * 0.35;
    let or = 60;
    const locate = () => {
      // Корень NanoSphere — первый span внутри обёртки сферы.
      const el = originRef.current?.querySelector("span") as HTMLElement | null;
      if (!el) return;
      const a = el.getBoundingClientRect();
      const b = canvas.getBoundingClientRect();
      ox = a.left + a.width / 2 - b.left;
      oy = a.top + a.height / 2 - b.top;
      or = a.width * 0.4;
    };

    const tints = ["111,134,255", "150,130,255", "176,124,255", "255,122,156", "255,176,122", "255,255,255", "255,255,255"];
    type P = { a: number; d: number; v: number; curl: number; born: number; life: number; r: number; b: number; c: string };
    const MAX = mid ? 140 : 320;
    const spawn = (t: number): P => {
      // Сгустки: угол выбираем с весом, который медленно поворачивается.
      let a = 0;
      for (let k = 0; k < 4; k++) {
        a = Math.random() * Math.PI * 2;
        if (Math.random() < 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(3 * a + t * 0.15))) break;
      }
      const tiny = Math.random() < 0.8;
      return {
        a,
        d: 0.85 + Math.random() * 0.3,
        v: 10 + Math.random() * 34,
        curl: (Math.random() - 0.5) * 0.5,
        born: t,
        life: 4 + Math.random() * 6,
        r: tiny ? 0.25 + Math.random() * 0.5 : 0.6 + Math.random() * 0.8,
        b: tiny ? 0.25 + Math.random() * 0.55 : 0.5 + Math.random() * 0.5,
        c: tints[Math.floor(Math.random() * tints.length)],
      };
    };
    const start = performance.now() / 1000;
    // Сразу раскидываем часть по возрасту, чтобы фон не начинался с пустоты.
    const ps: P[] = Array.from({ length: MAX }, () => {
      const p = spawn(start);
      p.born = start - Math.random() * p.life;
      return p;
    });

    let raf = 0;
    let last = 0;
    let frame = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (mid && now - last < 33) return;
      last = now;
      if (frame++ % 6 === 0) locate();
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < ps.length; i++) {
        let p = ps[i];
        let age = (t - p.born) / p.life;
        if (age >= 1) {
          p = ps[i] = spawn(t);
          age = 0;
        }
        // Уплывает, замедляясь (путь ~ √возраста), и слегка закручивается.
        const travel = p.v * p.life * Math.sqrt(age) * 0.55;
        const ang = p.a + p.curl * age + 0.04 * Math.sin(t * 0.3 + p.a * 3);
        const dist = or * p.d + travel;
        const x = ox + Math.cos(ang) * dist;
        const y = oy + Math.sin(ang) * dist;
        if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
        const fade = Math.min(1, age * 5) * (1 - age) ** 1.5;
        const tw = 0.7 + 0.3 * Math.sin(t * 2 + i);
        const al = p.b * fade * tw;
        if (al < 0.02) continue;
        if (p.r > 0.6) {
          ctx.fillStyle = `rgba(${p.c},${al * 0.18})`;
          ctx.beginPath();
          ctx.arc(x, y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${p.c},${al})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [originRef]);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // Текст проявляется из размытия и так же растворяется (Егор).
      initial={{ opacity: 0, filter: "blur(14px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.6, ease: SMOOTH }}
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

// Заставка: логотип появляется под сферой чуть позже неё.
function SplashLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(14px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ delay: 3, duration: 1.1, ease: SMOOTH }}
      className="pb-8"
    >
      <h2 className="vibe-mode__hero-logo" aria-label="HUD.SERVICE">
        <span aria-hidden="true" className="vibe-mode__brand-dot animate-pulse-rec rounded-full brand-dot" />
        <span>
          HUD<LiveBrandWord period={1500}>.SERVICE</LiveBrandWord>
        </span>
      </h2>
    </motion.div>
  );
}

// «Персонализируй наш сервис для себя» — слова по очереди проявляются из
// размытия короткой вспышкой (Егор: «не печатать по буквам, а по слову
// через размытие — стильнее и дороже»), затем пауза и переход к слайдам.
function Hello({ onDone }: { onDone: () => void }) {
  const words = HELLO_TEXT.flatMap((part, pi) => part.trim().split(" ").map((w) => ({ w, accent: pi === 1 })));
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    const t = window.setTimeout(() => doneRef.current(), 400 + words.length * 260 + 1700);
    return () => window.clearTimeout(t);
  }, [words.length]);
  return (
    <h2 className="vibe-mode__title mt-1 max-w-[520px]" aria-label={HELLO_TEXT.join("")}>
      {words.map((x, i) => [
        i > 0 ? " " : null,
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, filter: "blur(14px) brightness(2.2)" }}
          animate={{ opacity: 1, filter: "blur(0px) brightness(1)" }}
          transition={{ delay: 0.4 + i * 0.26, duration: 0.9, ease: SMOOTH }}
          className={`inline-block ${x.accent ? "vibe-mode__iris" : ""}`}
        >
          {x.w}
        </motion.span>,
      ])}
    </h2>
  );
}

function Intro({ slide, onSlide, onStart }: { slide: number; onSlide: (i: number) => void; onStart: () => void }) {
  const last = slide === INTRO_STEPS.length - 1;
  const step = INTRO_STEPS[slide];
  return (
    <>
      <span className="vibe-mode__eyebrow">
        {String(slide + 1).padStart(2, "0")} / {String(INTRO_STEPS.length).padStart(2, "0")}
      </span>
      <h2 className="vibe-mode__title vibe-mode__title--sm mt-2">{step.title}</h2>
      {step.lead && <p className="vibe-mode__lead mt-2">{step.lead}</p>}
      <div className={`mt-5 grid w-full gap-2.5 text-left ${step.items.length === 4 ? "grid-cols-2" : "sm:grid-cols-3"}`}>
        {step.items.map((it) => (
          <div key={it.n} className="vibe-mode__card">
            <span className="vibe-mode__num">{it.n}</span>
            <h3 className="mt-2 font-display text-[15px] font-bold uppercase">{it.h}</h3>
            <p className="mt-1 text-[12px] leading-snug">{it.t}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex w-full items-center justify-between gap-4">
        <Dots count={INTRO_STEPS.length} active={slide} onPick={onSlide} />
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
      <span aria-hidden="true" className="whitespace-nowrap text-[11px]">
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
          <div className="mt-2 flex justify-between text-[11px]">
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
            "Лендинг клиента": link,
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
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3">Куда прислать твой лендинг?</h2>
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
            {sending ? "Отправляю…" : "Собрать мой лендинг"}
            <Arrow />
          </button>
        </div>
      </form>
    </>
  );
}

// «Собираю лендинг» — строки появляются по очереди, пока сфера горит.
function Building({ answers }: { answers: VibeAnswers }) {
  const offer = buildOffer(answers);
  const lines = [
    `Решение: ${offer.product.toLowerCase()}`,
    offer.sphere ? `Кейсы из сферы «${offer.sphere}»` : "Подборка кейсов",
    `Тариф «${offer.tier.name}» под бюджет`,
    "Собираю лендинг…",
  ];
  return (
    <>
      <span className="vibe-mode__eyebrow">Собираю твой лендинг</span>
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
