"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { submenuFor, type MenuLink } from "@/lib/welcome-menu";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { markVibeRouted } from "@/lib/welcome-gate";
import { VoiceWave, type WavePhaseEnergy } from "./WelcomeOverlay";

// Вайб-окно: приветствие → направления → форматы. Один диалог, три шага,
// без перезагрузок между ними — внешняя рамка (затемнение, стекло, крестик)
// живёт в CenterModal, поэтому одно и то же окно открывается и при входе
// (WelcomeOverlay), и с боковой панели (VibeRail).
//
// Почему шага именно три. Раньше путь был длиннее: приветствие → выбор
// «вайб-режим или обычный сайт» → четыре направления → переход → ВТОРОЕ окно
// с пунктами. Четыре клика и два разных окна на одну задачу «покажи мне то,
// что мне нужно». Теперь приветствие уходит само, направления появляются
// сразу, а форматы раскрываются тут же — два клика до конкретной страницы.

const EASE = [0.22, 1, 0.36, 1] as const;

// Один набор переходов на всё окно.
//
// Раньше заголовок и список жили в двух независимых AnimatePresence с разными
// длительностями: при смене шага они уезжали и приезжали вразнобой, а высота
// карточки менялась мгновенно — это и читалось как рывок. Теперь шаг меняется
// целиком, одним блоком, а высота окна доезжает до новой отдельной анимацией.
//
// Анимируются только opacity и transform: и то и другое живёт на композиторе.
// Ни blur, ни height внутри шага не трогаются — фильтр поверх стекла с
// backdrop-filter заставляет браузер перерисовывать всю карточку каждый кадр,
// а это ровно те подёргивания, от которых уходим.
const STEP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: EASE, staggerChildren: 0.05, delayChildren: 0.05 },
  },
  out: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" as const } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
};

// Сколько ждать перед переходом на страницу. Роутинг и анимация закрытия,
// запущенные в один кадр, спорят за главный поток: рендер новой страницы
// успевает съесть середину исчезновения, и окно закрывается рывком. Пауза
// чуть короче самого исчезновения — глазу переход кажется мгновенным.
const EXIT_BEFORE_ROUTE_MS = 200;

const GREETING_PHRASE = { text: "Привет, добро пожаловать в наш Digital дом — HDKV AGENCY", charDelay: 40 };
const ASKING_PHRASE = { text: "Что тебя интересует?", charDelay: 70 };

// Сколько приветствие держится дочитанным, прежде чем само уступит место
// направлениям. Достаточно, чтобы фраза прочиталась, и мало, чтобы никто не
// успел заскучать и потянуться к «перейти на сайт».
const GREETING_HOLD_MS = 900;

// Окно никогда не прокручивается (требование Егора). Ужать отступы под низкий
// экран недостаточно: на ноутбуке 1000×600 и на телефоне в альбомной
// ориентации список форматов физически выше свободной высоты. Поэтому здесь
// не скролл и не обрезка, а подгон: содержимое целиком масштабируется до
// доступной высоты одним transform — пропорции, отступы и попадание пальцем
// сохраняются, просто окно становится меньше. При нормальной высоте экрана
// множитель равен единице и не делает ничего.
const CARD_CHROME_PX = 80; // поля карточки + запас до края экрана
const MIN_FIT_SCALE = 0.55;

function useFitToHeight(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const natural = el.scrollHeight;
      if (!natural) return;
      const available = window.innerHeight * 0.94 - CARD_CHROME_PX;
      const scale = natural > available ? Math.max(MIN_FIT_SCALE, available / natural) : 1;
      setFit((prev) =>
        Math.abs(prev.scale - scale) < 0.001 && prev.height === natural ? prev : { scale, height: natural }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- пересчёт на смене шага, содержимое там другой высоты
  }, deps);

  // Кортежем, а не объектом: правило react-hooks/refs считает обращением к
  // ref любое чтение свойства у объекта, в котором ref лежит.
  return [ref, fit.scale, fit.height] as const;
}

type Step = "greeting" | "services" | "formats";
type TypePhase = "typing" | "done";

function useTypedPhrase(phrase: { text: string; charDelay: number }, reduced: boolean, active: boolean) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TypePhase>("typing");

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion skip, runs once per (phrase, reduced, active) change
      setText(phrase.text);
      setPhase("done");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    setText("");
    setPhase("typing");

    function tick() {
      if (cancelled) return;
      i += 1;
      setText(phrase.text.slice(0, i));
      if (i < phrase.text.length) {
        timer = setTimeout(tick, phrase.charDelay);
      } else {
        setPhase("done");
      }
    }
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrase, reduced, active]);

  return { text, phase };
}

// Голосового ввода в окне больше нет: микрофон Егор попросил убрать — рядом с
// логотипом, волной, списком и двумя нижними кнопками он перегружал окно, а
// распознавание в любом случае работало только в Chrome. Сама волна осталась:
// она не кнопка, а «лицо» агента, и держит окно живым, ничего не обещая.

// Название направления набрано ровно как заголовок его страницы: тот же
// градиент (PAGE_GRADIENT — единственный источник этих цветов на сайте),
// тот же заголовочный шрифт в верхнем регистре. Человек видит в окне то же
// слово тем же цветом, что встретит на самой странице, и потому узнаёт, куда
// попал, ещё до того, как дочитает.
function gradientTextStyle(key: ServiceKey): CSSProperties {
  const g = PAGE_GRADIENT[key];
  return {
    backgroundImage: g.via
      ? `linear-gradient(90deg, ${g.from} 0%, ${g.via} 55%, ${g.to} 100%)`
      : `linear-gradient(90deg, ${g.from} 0%, ${g.to} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    // text-shadow на прозрачном глифе печатается сплошной плашкой в его
    // форме — поэтому свечение идёт drop-shadow'ом, он следует за уже
    // закрашенным градиентом.
    filter: `drop-shadow(0 0 10px ${g.from}80) drop-shadow(0 0 24px ${g.to}70)`,
  };
}

function ServiceButton({ serviceKey, onSelect }: { serviceKey: ServiceKey; onSelect: () => void }) {
  const g = PAGE_GRADIENT[serviceKey];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="btn-neon vibe-pick"
      style={
        {
          "--pick-from": g.from,
          "--pick-to": g.to,
          // Каждая кнопка ведёт своё кольцо со сдвигом — иначе четыре
          // одинаковых блика идут строем, и ряд читается как один объект.
          "--btn-neon-delay": `${serviceOrder.indexOf(serviceKey) * -1.7}s`,
        } as CSSProperties
      }
    >
      <span className="vibe-pick-mark" aria-hidden="true" />
      <span>{serviceMeta[serviceKey].label}</span>
    </button>
  );
}

export default function WelcomeWidget({
  onClose,
  onSkip,
  skipGreeting = false,
}: {
  /** Посетитель закончил с окном: выбрал формат или закрыл его. */
  onClose: () => void;
  /** Только «Перейти на сайт →» — когда вызывающему нечего делать отдельно,
   *  совпадает с onClose. */
  onSkip?: () => void;
  /** Открыть сразу на выборе направления. Приветствие здороваются один раз —
   *  при входе на сайт; когда то же окно открывают с боковой панели, чтобы
   *  куда-то перейти, здороваться заново значит держать человека полторы
   *  секунды перед тем, что он и пришёл нажать. */
  skipGreeting?: boolean;
}) {
  const router = useRouter();
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState<Step>(skipGreeting ? "services" : "greeting");
  const [picked, setPicked] = useState<ServiceKey | null>(null);
  const skip = onSkip ?? onClose;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount check, matchMedia only exists in the browser
    setReduced(mq.matches);
  }, []);

  const greeting = useTypedPhrase(GREETING_PHRASE, reduced, step === "greeting");
  const asking = useTypedPhrase(ASKING_PHRASE, reduced, step !== "greeting");
  const greetingDone = greeting.phase === "done";

  // Приветствие само уступает место направлениям: отдельная кнопка «дальше»
  // была лишним кликом ровно там, где выбора ещё нет.
  useEffect(() => {
    if (step !== "greeting" || !greetingDone) return;
    const id = setTimeout(() => setStep("services"), GREETING_HOLD_MS);
    return () => clearTimeout(id);
  }, [step, greetingDone]);

  const isTyping = step === "greeting" ? greeting.phase === "typing" : asking.phase === "typing";
  const waveEnergy: WavePhaseEnergy = isTyping ? "typing" : "idle";

  // Любой переход отсюда помечается как «навигация из вайб-окна», чтобы
  // старое меню раздела не встретило посетителя вторым окном сразу после
  // перехода — он только что выбрал то же самое здесь.
  const go = useCallback(
    (href: string) => {
      markVibeRouted();
      onClose();
      setTimeout(() => router.push(href), EXIT_BEFORE_ROUTE_MS);
    },
    [onClose, router]
  );

  const formats: MenuLink[] = picked ? submenuFor(picked) : [];

  const [fitRef, fitScale, fitHeight] = useFitToHeight([step, picked]);

  return (
    // Высота окна — отдельная плавная анимация: шаги разной высоты, и без
    // неё карточка прыгала бы на новый размер в один кадр. initial={false},
    // чтобы при открытии она не разворачивалась от нуля.
    <motion.div
      className="w-full"
      initial={false}
      animate={{ height: fitHeight ? fitHeight * fitScale : "auto" }}
      transition={{ duration: 0.42, ease: EASE }}
    >
      <div
        ref={fitRef}
        className="vibe-window flex h-fit w-full flex-col items-center text-center"
        style={fitScale < 1 ? { transform: `scale(${fitScale})`, transformOrigin: "top center" } : undefined}
      >
        {/* Логотип в шапке окна: окно открывается поверх сайта и часто ещё до
            того, как человек рассмотрел страницу, — без подписи это просто
            всплывшее меню. Тот же знак, что в шапке сайта (пульсирующая точка
            + HDKV.AGENCY), набранный мельче. */}
        <div className="mb-4 flex items-center gap-2" aria-hidden="true">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse-rec rounded-full bg-rec" />
          <span className="font-display text-sm uppercase leading-none tracking-tight text-paper">
            HDKV<span className="text-rec">.AGENCY</span>
          </span>
        </div>

        {/* Назад — круглая кнопка со стрелкой, зеркальная крестику CenterModal:
            тот же диаметр и та же подложка, только у правого края. */}
        <AnimatePresence>
          {step === "formats" && (
            <motion.button
              key="back"
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.28, ease: EASE }}
              onClick={() => {
                setStep("services");
                setPicked(null);
              }}
              aria-label="Назад к направлениям"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 text-lg leading-none text-paper/70 backdrop-blur-md transition-colors hover:bg-paper/20 hover:text-paper sm:right-5 sm:top-5"
            >
              <span aria-hidden="true">←</span>
            </motion.button>
          )}
        </AnimatePresence>

        <VoiceWave energy={waveEnergy} />

        {/* Один AnimatePresence на весь шаг: заголовок и кнопки уходят и
            приходят как одно целое, а не двумя разными анимациями. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={STEP_VARIANTS}
            initial="hidden"
            animate="show"
            exit="out"
            className="w-full"
          >
            {step === "greeting" && (
              <p className="vibe-window-lead vibe-window-gap min-h-[3.6em] font-sans text-lg font-light leading-snug text-paper sm:text-xl">
                {greeting.text}
                {greeting.phase === "typing" && (
                  <span
                    className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                    style={{ height: "1em" }}
                    aria-hidden="true"
                  />
                )}
              </p>
            )}

            {step === "services" && (
              <>
                <p className="vibe-window-lead vibe-window-gap min-h-[1.8em] font-sans text-lg font-light leading-snug text-paper sm:text-xl">
                  {asking.text}
                  {asking.phase === "typing" && (
                    <span
                      className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                      style={{ height: "1em" }}
                      aria-hidden="true"
                    />
                  )}
                </p>

                <div className="vibe-window-gap mx-auto flex w-full max-w-[300px] flex-col gap-2.5">
                  {serviceOrder.map((key) => (
                    <motion.div key={key} variants={ITEM_VARIANTS}>
                      <ServiceButton
                        serviceKey={key}
                        onSelect={() => {
                          setPicked(key);
                          setStep("formats");
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {step === "formats" && picked && (
              <>
                <p className="vibe-window-lead vibe-window-gap min-h-[1.8em] font-sans text-lg font-light leading-snug text-paper sm:text-xl">
                  <span style={gradientTextStyle(picked)} className="font-display uppercase tracking-tight">
                    {serviceMeta[picked].label}
                  </span>
                </p>
                <p className="mt-2 text-sm text-paper/70">Выбери формат — откроем сразу нужный блок</p>

                <div className="vibe-window-gap mx-auto flex w-full max-w-[300px] flex-col gap-2.5">
                  {formats.map((item) => (
                    <motion.div key={item.href} variants={ITEM_VARIANTS}>
                      <button type="button" onClick={() => go(item.href)} className="btn-neon w-full justify-center">
                        {item.label}
                      </button>
                    </motion.div>
                  ))}

                  <motion.div variants={ITEM_VARIANTS}>
                    {/* Полноценная кнопка, а не тихая ссылка: «весь раздел» —
                        такой же выбор, как любой формат над ним, и носит метку
                        цвета своего раздела. Переход идёт через go(), как и у
                        форматов: сначала окно закрывается, затем роутинг. */}
                    <Link
                      href={`/${serviceMeta[picked].slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(`/${serviceMeta[picked].slug}`);
                      }}
                      className="btn-neon vibe-pick"
                      style={
                        {
                          "--pick-from": PAGE_GRADIENT[picked].from,
                          "--pick-to": PAGE_GRADIENT[picked].to,
                        } as CSSProperties
                      }
                    >
                      <span className="vibe-pick-mark" aria-hidden="true" />
                      <span>Весь раздел →</span>
                    </Link>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="vibe-window-gap flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={skip}
            className="whitespace-nowrap rounded-full border border-paper/20 bg-ink/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md transition-colors hover:border-glow/50 hover:text-paper"
          >
            Перейти на сайт →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
