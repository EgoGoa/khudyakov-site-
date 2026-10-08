"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useSiteFreeze } from "@/lib/use-site-freeze";
import { skipIntros } from "@/lib/skip-intro";
import { InlineVoiceSphere } from "@/components/layout/VoiceAssistant";
import { WIN, WIN_DIM } from "@/lib/motion";
import NanoSphere, { type SphereIntro } from "@/components/ui/NanoSphere";
import { InfoHow, InfoInside, InfoWhat } from "@/components/vibe/VibeInfographics";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import MobileClose from "@/components/ui/MobileClose";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { playUi } from "@/lib/sound";
import { trackGoal } from "@/lib/ym";
import { setVoiceCapture, useVoiceState } from "@/lib/voice/store";
import { controlOf, matchOptions, parseBudget } from "@/lib/voice/vibe-voice";
import {
  BUDGET_STEPS,
  OWN_PREFIX,
  buildOffer,
  encodeAnswers,
  formatBudget,
  isOwn,
  plainAccent,
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

// Три вводных слайда: заголовок, одна строка и живая инфографика с
// подписями под каждой частью (Егор: «тексты + инфографика, что происходит
// и для чего это нужно»).
const INTRO_STEPS: { title: string; lead: string; Info: () => ReactNode }[] = [
  { title: "Что такое *Vibe-режим*", lead: "Сайт сам собирает страницу под *твою задачу*", Info: InfoWhat },
  { title: "Как это *работает*", lead: "Отвечаешь на вопросы — страница *собирается сама*", Info: InfoHow },
  { title: "Что будет на твоей *Vibe-странице*", lead: "Всё, чтобы решить и *заказать*, — в одном месте", Info: InfoInside },
];

function useNarrow(query = "(max-width: 640px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return narrow;
}

export default function VibeMode({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  /** Прежнее окно выбора разделов; ссылку на него из вайб-окна Егор убрал
   *  («внизу только одна кнопка»), проп оставлен для совместимости. */
  onPickDirection?: () => void;
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
    // Вайб-окно — «сердце» сайта: анимации появления играют и на телефоне
    // (mid/low), где MotionTier сводит остальной сайт к минимуму. Уважаем
    // только системную настройку «уменьшить движение» (Егор, 2026-09-29).
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{open && <VibeWindow key="vibe" onClose={onClose} />}</AnimatePresence>
    </MotionConfig>,
    document.body
  );
}

function VibeWindow({ onClose }: { onClose: () => void }) {
  // Сайт за окном стоит картинкой, пока окно открыто (lib/use-site-freeze).
  useSiteFreeze();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(true, ref);
  const narrow = useNarrow();
  // Невысокий телефон (SE, мини, альбом с панелью браузера): сфера мельче,
  // чтобы вопросы с длинным списком и кнопка «Дальше» влезали в окно.
  const short = useNarrow("(max-width: 640px) and (max-height: 720px)");
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
  const [, setTyping] = useState(false);
  const bump = () => setPulse((p) => p + 1);

  const go = (next: () => void) => {
    playUi("click");
    bump();
    next();
  };

  useEffect(() => {
    trackGoal("vibe_open");
  }, []);

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
    stage === "splash" ? (narrow ? 150 : 200) : stage === "hello" ? (narrow ? 96 : 120) : stage === "intro" ? (short ? 64 : narrow ? 84 : 96) : stage === "building" ? (narrow ? 104 : 128) : short ? 40 : narrow ? 54 : 64;
  // Отступ сферы сверху: на заставке и приветствии сфера с текстом стоят
  // в середине окна, дальше поднимаются к верху.
  const orbSlot = stage === "contact" ? "quiz" : stage;
  // На телефоне верхний отступ убран: пустота над сферой уводила всю
  // композицию заставки и приветствия ниже середины окна (Егор, 2026-09-29).
  const orbTop = stage === "splash" ? (narrow ? 0 : 96) : stage === "hello" ? (narrow ? 0 : 120) : stage === "building" ? 60 : 0;
  // Тело окна начинается под строкой с крестиком (~60px), поэтому его
  // середина ниже середины самого окна; нижний отступ возвращает её на место.
  const bodyPad = narrow && (stage === "splash" || stage === "hello") ? 56 : undefined;
  // Над слайдами сфера крупнее (64 → 96px) и поднята выше, по центру, но
  // кольцо целиком остаётся внутри окна (Егор, 2026-09-26).
  // На телефоне не поднимаем: там сфера наезжала на «Vibe-режим» слева.
  const orbLift = stage === "intro" && !narrow ? -40 : 0;

  // Голосом (Егор, 2026-09-29): пока окно открыто и голос включён, всё
  // услышанное сначала разбирает окно — вариант по названию или номеру,
  // бюджет, «дальше», «назад», «закрой». Не разобрало — уходит сайту.
  const voiceRef = useRef<(text: string) => { say?: string } | null>(() => null);
  const onVoice = (text: string): { say?: string } | null => {
    const ctl = controlOf(text);
    if (ctl === "close") {
      onClose();
      return {};
    }
    if (stage === "splash" || stage === "hello") {
      if (!ctl || ctl === "back") return null;
      go(() => setStage("intro"));
      return {};
    }
    if (stage === "intro") {
      if (ctl === "back") {
        if (slide > 0) go(() => setSlide(slide - 1));
        return {};
      }
      if (ctl === "start" || (ctl === "next" && slide === INTRO_STEPS.length - 1)) {
        go(() => setStage("quiz"));
        return {};
      }
      if (ctl === "next") {
        go(() => setSlide(slide + 1));
        return {};
      }
      return null;
    }
    if (stage === "contact") {
      if (ctl === "back") {
        go(() => setStage("quiz"));
        return {};
      }
      return null;
    }
    if (stage !== "quiz") return null;
    const q = questions[qi];
    if (!q) return null;
    const toNext = () => go(() => (qi + 1 < total ? setQi(qi + 1) : setStage("contact")));
    const value = answers[q.id];
    const list = Array.isArray(value) ? value : [];
    const answered = Array.isArray(value) ? value.length > 0 : !!value;
    if (ctl === "back") {
      go(() => (qi > 0 ? setQi(qi - 1) : setStage("intro")));
      return {};
    }
    if (ctl === "next" || ctl === "start") {
      if (answered || q.optional) toNext();
      else return {};
      return {};
    }
    const set = (v: VibeValue) => setAnswers((prev) => ({ ...prev, [q.id]: v }));
    if (q.kind === "range") {
      const b = parseBudget(text);
      if (!b) return null;
      bump();
      set(String(b));
      return {};
    }
    if (q.kind === "text") {
      bump();
      set(text.trim());
      return {};
    }
    const opts = q.options ?? [];
    const hit = matchOptions(text, opts);
    const many = q.kind === "multi" || !!q.many;
    if (!hit.length) {
      if (!q.own) return null;
      bump();
      set(many ? [...list.filter((x) => !isOwn(x)), OWN_PREFIX + text.trim()] : OWN_PREFIX + text.trim());
      if (!many) window.setTimeout(toNext, 850);
      return {};
    }
    bump();
    playUi("click");
    if (many) {
      const add = hit.map((i) => opts[i].value).filter((v) => !list.includes(v));
      set([...list, ...add]);
    } else {
      set(opts[hit[0]].value);
      window.setTimeout(toNext, 850);
    }
    return {};
  };
  useEffect(() => {
    voiceRef.current = onVoice;
  });
  useEffect(() => {
    setVoiceCapture((t) => voiceRef.current(t));
    return () => setVoiceCapture(null);
  }, []);

  const finish = () => {
    trackGoal("vibe_finish");
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
      initial={WIN_DIM.initial}
      animate={WIN_DIM.animate}
      exit={WIN_DIM.exit}
      className="vibe-mode fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none"
      onClick={onClose}
    >
      {/* Сайт за окном темнеет и уходит в расфокус — как за кабинетом. */}
      <div className="site-scrim" aria-hidden="true" />
      {/* Окошко по центру (Егор: «окошко, а не на весь экран»). */}
      <motion.div
        // Общая анимация окон сайта (WIN, lib/motion).
        initial={WIN.initial}
        animate={WIN.animate}
        exit={WIN.exit}
        onClick={(e) => e.stopPropagation()}
        // Клик в окно — сфера и прочие вступления доигрывают быстро (lib/skip-intro).
        onPointerDown={skipIntros}
        className="win-shell vibe-mode__window vibe-mode__window--fixed"
      >
      <MobileClose inline onClick={onClose} />
      {/* Сияние в отдельной рамке по скруглению окна: оно шире окна и
          вращается, а Safari обрезает такой слой по прямоугольнику — за
          углами торчали ровные края (Егор, 2026-10-08). */}
      <div aria-hidden="true" className="vibe-mode__aurora-clip">
        <div className="vibe-mode__aurora" />
      </div>
      {/* Частиц вокруг сферы нет (Егор, 2026-09-27): пыль живёт только в
          сборке сферы на заставке и сливается в кольцо. */}

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
      <div className="vibe-mode__scroll z-[1] flex h-full flex-col px-5 pb-3 pt-5 sm:px-8 sm:pb-4">
        <div className="flex items-center justify-between">
          {/* «Vibe-режим» — без пилюли, переливается палитрой сферы и
              тихо выпускает частицы (Егор, 2026-09-26). */}
          <VibeWordmark className={`transition-opacity duration-500 ${stage === "splash" || stage === "hello" ? "opacity-0" : ""}`} />
          <button type="button" onClick={onClose} aria-label="Закрыть" className="vibe-mode__close mobile-hide">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="vibe-mode__body flex w-full flex-1 flex-col items-center pt-1" style={{ paddingBottom: bodyPad }}>
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
                style={{ paddingTop: orbTop, marginTop: orbLift }}
                // Над слайдами сфера заходит в строку с крестиком — клики
                // проходят сквозь её обёртку.
                className={`vibe-mode__orb flex w-full justify-center${stage === "intro" ? " pointer-events-none" : ""}`}
              >
                <NanoSphere
                  size={orbSize}
                  from={ORB_FROM}
                  to={ORB_TO}
                  // В окне сфера всегда «разогрета», как при наведении в
                  // вайб-баре: шире и активнее волны — видно, что окно живое.
                  hot
                  pulse={pulse}
                  glow={0.35}
                  bare
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

        {/* Волна ассистента в самом низу окна, под всеми кнопками, в полтора
            раза меньше плавающей (164×62 → 110×41, Егор 2026-09-27). Пока
            она здесь, плавающая прячется (InlineVoiceSphere). */}
        {/* Холст волны шире неё самой (запас под раскачку) — полоса
            обрезана, чтобы этот запас не раздувал окно до прокрутки. */}
        <VoiceHint />
        <div className="flex h-7 shrink-0 items-center justify-center overflow-hidden">
          <InlineVoiceSphere from={ORB_FROM} to={ORB_TO} width={110} height={41} waveOnly />
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}


// Строка над волной: как ответить голосом и что сейчас услышано.
function VoiceHint() {
  const s = useVoiceState();
  if (!s.canListen) return null;
  const text = !s.enabled
    ? "Нажми на волну — отвечай голосом"
    : s.live
      ? `«${s.live}»`
      : s.status === "speaking"
        ? ""
        : "Слушаю: назови вариант или скажи «дальше»";
  return <p className="vibe-mode__voice-hint">{text || "\u00a0"}</p>;
}

// «Vibe-режим» — словесный знак режима: «Vibe» фиолетовым, «режим» белым,
// без частиц — только мягкая неспешная пульсация свечения (Егор).
export function VibeWordmark({ className = "", hero = false }: { className?: string; hero?: boolean }) {
  return (
    <span className={`vibe-mode__wordmark ${hero ? "vibe-mode__wordmark--hero" : ""} ${className}`}>
      <span className="vibe-mode__wordmark-vibe">Vibe</span>-режим
      {/* Вайб-режим пока в бете (Егор, 2026-09-29). */}
      <span className="beta-badge">Beta</span>
    </span>
  );
}

// Акцентные слова: в текстах окна они размечены *звёздочками* и набираются
// фирменным градиентом (Егор: «в заголовках и подзаголовках одно-два слова
// в акцентах»).
function Accent({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="vibe-mode__iris">
            {p}
          </span>
        ) : (
          p
        )
      )}
    </>
  );
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
      <h2>
        <VibeWordmark hero />
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
  // Порядок появления (Егор): заголовок акцентно → инфографика собирается
  // слева направо → одно предложение → одна минималистичная кнопка.
  const rise = (delay: number) => ({
    initial: { opacity: 0, filter: "blur(12px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    transition: { delay, duration: 0.8, ease: SMOOTH },
  });
  return (
    <>
      <motion.span {...rise(0)} className="vibe-mode__eyebrow">
        {String(slide + 1).padStart(2, "0")} / {String(INTRO_STEPS.length).padStart(2, "0")}
      </motion.span>
      <motion.h2 {...rise(0.05)} className="vibe-mode__title vibe-mode__title--sm mt-2">
        <Accent text={step.title} />
      </motion.h2>
      {/* Сцена сама собирается из частиц (VibeInfographics): сначала
          графика, последними — подписи внутри неё. */}
      <div className="mt-6 w-full">
        <step.Info />
      </div>
      <motion.p {...rise(2.8)} className="vibe-mode__lead mt-5">
        <Accent text={step.lead} />
      </motion.p>
      {/* Стрелка назад — зеркало стрелки «Дальше/Начать»: тот же зазор
          10px до слова (Егор, 2026-09-26). Ширины слева и справа от слова
          равны, поэтому слово стоит ровно по центру; на первом слайде
          стрелка невидима, но место держит. */}
      <motion.div {...rise(3.1)} className="mt-10 flex w-full items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onSlide(slide - 1)}
          className="vibe-mode__prev"
          aria-label="Назад"
          disabled={slide === 0}
          style={slide === 0 ? { visibility: "hidden" } : undefined}
        >
          <Arrow />
        </button>
        <button type="button" onClick={last ? onStart : () => onSlide(slide + 1)} className="vibe-mode__next">
          {last ? "Начать" : "Дальше"}
          <Arrow />
        </button>
      </motion.div>
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
    q.kind === "text" ? current : q.kind === "multi" || q.many ? (list.find(isOwn)?.slice(1) ?? "") : isOwn(current) ? current.slice(1) : ""
  );
  // Ответ мог прийти голосом — поле «свой вариант» подтягивает его.
  const external =
    q.kind === "text" ? current : q.kind === "multi" || q.many ? (list.find(isOwn)?.slice(1) ?? "") : isOwn(current) ? current.slice(1) : "";
  const [seenExternal, setSeenExternal] = useState(external);
  if (external !== seenExternal) {
    setSeenExternal(external);
    if (external) setOwn(external);
  }
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
    if (q.kind === "multi" || q.many) {
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
    q.kind === "multi" || q.many ? list.length > 0 : q.kind === "text" ? own.trim().length > 0 : !!current || own.trim().length > 0;
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
        aria-label={q.kind === "text" ? plainAccent(q.title) : "Свой вариант"}
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
      <h2 className="vibe-mode__title vibe-mode__title--q mt-2">
        <Accent text={q.title} />
      </h2>
      <p className="vibe-mode__lead mt-2">
        <Accent text={q.hint} />
      </p>

      {q.kind === "single" && (
        <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
          {q.options!.map((o, i) => {
            // many — можно отметить несколько; дальше по кнопке «Дальше».
            const on = q.many ? list.includes(o.value) : current === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => (q.many ? toggleMulti(o.value) : pickSingle(o.value))}
                aria-pressed={on}
                className={`vibe-mode__option ${on ? "is-on" : ""}`}
              >
                <span className="vibe-mode__key">{q.many ? (on ? "✓" : "+") : String.fromCharCode(65 + i)}</span>
                <span>{o.label}</span>
              </button>
            );
          })}
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
      {q.own && q.kind !== "text" && ownInput(q.kind === "multi" || q.many ? "Добавить своё…" : "Свой вариант…")}

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

      <div className="vibe-mode__nav mt-4 flex w-full items-center justify-between">
        <button type="button" onClick={onBack} className="vibe-mode__back">
          ← Назад
        </button>
        <button type="button" disabled={!canNext} onClick={next} className="vibe-mode__next">
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
      <h2 className="vibe-mode__title vibe-mode__title--q mt-3">Куда прислать твой <span className="vibe-mode__iris">лендинг</span>?</h2>
      <p className="vibe-mode__lead mt-3">
          Страница откроется <span className="vibe-mode__iris">сразу</span>, а копию ссылки пришлём тебе
        </p>
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
          <button type="button" onClick={onBack} className="vibe-mode__back">
            ← Назад
          </button>
          <button type="submit" disabled={!ready} className="vibe-mode__next">
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
