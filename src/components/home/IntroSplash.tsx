"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";
import { createPortal } from "react-dom";
import { MotionConfig, motion } from "framer-motion";

// Заставка входа: логотип проявляется на запотевшем стекле, которым накрыта
// вся страница, а потом стекло растворяется — и за ним уже собрано меню
// выбора направления.
//
// Почему именно так, а не «картинка на секунду»:
//
//   · Стекло настоящее. Обе половины — это backdrop-filter поверх живой
//     страницы, а не залитый цветом прямоугольник. Поэтому за ними видно
//     размытые контуры главной, и когда створки разъезжаются, сайт не
//     «появляется», а входит в фокус. Залитая подложка такого не даст.
//
//   · Логотип проявляется размытием, а не просто прозрачностью. Он лежит на
//     том же стекле, что и всё остальное: сначала он такая же мутная форма,
//     потом резкая. Это единственный приём, который связывает знак с фоном,
//     а не кладёт его сверху.
//
//   · Стекло растворяется, а не разъезжается (прямое решение Егора). Уход
//     одной плоскостью читается спокойнее: страница выходит из тумана в
//     фокус, без механики створок, которая спорит с самим меню.
//
// Показывается при каждом заходе на сайт, включая обычное обновление
// страницы (F5) — прямая просьба Егора. Единственное исключение —
// prefers-reduced-motion: там заставка не играет вовсе.

const EASE = [0.22, 1, 0.36, 1] as const;

/** Ритм заставки. Знак не появляется целиком — он собирается: сначала точка,
 *  следом буквы по одной. Ни вихря, ни линии под знаком больше нет (просьба
 *  Егора убрать оба) — сборка сама по себе и есть весь эффект. Знак держится
 *  собранным на экране секунду, потом стекло быстро растворяется. */
const T_DOT = 0.15;
const T_CHARS = 0.45;
const STAGGER = 0.045;
const CHAR_DUR = 0.7;
// Момент, когда собралась последняя буква. 11 = длина "HUD" + ".SERVICE".
const T_SETTLED = T_CHARS + (11 - 1) * STAGGER + CHAR_DUR;
// Знак стоит собранным — его должны успеть прочитать, прежде чем он уйдёт.
// Финальное ТЗ Егора (записано с его слов, «запомни эту задачу»): знак
// стоит по центру ровно 1.5с, красиво испаряется, и СРАЗУ следом плавно и
// последовательно (карточка за карточкой) появляется меню. «Сразу следом»
// оказалось буквально: меню не должно начинать открываться, пока от знака
// ещё что-то видно на экране — первая попытка запускала обе анимации в один
// момент (T_REVEAL = T_VANISH), и знак с меню были видны одновременно, что
// Егор явно забраковал.
const HOLD = 1.5;
/** Момент, с которого знак начинает испаряться. */
const T_VANISH = T_SETTLED + HOLD;
/** Испарение — той же природы, что и появление (просьба Егора: «ближе к
 *  стилю появления»), только в обратную сторону: буквы точно так же по
 *  одной, тем же наклоном по X и тем же блюром, волной слева направо —
 *  просто тают, а не встают. Шаг и длительность чуть крупнее, чем на входе
 *  (0.05 и 0.8 вместо 0.045 и 0.7): рассыпаться на глаз должно чуть
 *  медленнее, чем собраться. */
const STAGGER_OUT = 0.018;
const CHAR_DUR_OUT = 0.3;
const D_DISSOLVE = (11 - 1) * STAGGER_OUT + CHAR_DUR_OUT;
/** Меню открывается сразу, как знак полностью растворился — не раньше:
 *  на экране не должно быть одновременно и остатков знака, и уже открытого
 *  меню (просьба Егора после проверки живьём). */
const T_REVEAL = T_VANISH + D_DISSOLVE;
/** Стекло уходит вместе с появлением меню — меню проступает сквозь него. */
const D_FADE = 0.6;
const T_DONE_MS = (Math.max(T_VANISH + D_DISSOLVE, T_REVEAL + D_FADE) + 0.1) * 1000;

/** Собирает единый transition для элемента, который сначала встаёт
 *  (появление), потом стоит (HOLD), потом тает (испарение) — все три фазы
 *  одним таймлайном, потому что у framer только один `animate` на элемент.
 *  `enterDelay`/`enterDur` — когда и как долго встаёт; `exitDelay` — когда
 *  начинает таять (абсолютное время сцены); `exitDur` — как долго тает. */
function lifespan(enterDelay: number, enterDur: number, exitDelay: number, exitDur: number) {
  const total = exitDelay + exitDur - enterDelay;
  const tEnter = enterDur / total;
  const tExitStart = (exitDelay - enterDelay) / total;
  return { delay: enterDelay, duration: total, times: [0, tEnter, tExitStart, 1] };
}

/** Слово знака посимвольно. Градиент `.brand-word` идёт по всему слову
 *  сразу, а посимвольная анимация требует отдельного элемента на букву —
 *  поэтому цвет каждой буквы считается как срез того же градиента по её
 *  позиции. Глазом это тот же переход, но каждая буква теперь своя. */
const HEAD = "HUD";
const TAIL = ".SERVICE";
const TAIL_FROM = [124, 242, 176] as const; // #7cf2b0
const TAIL_TO = [16, 185, 129] as const; // #10b981

const CHARS = [
  ...HEAD.split("").map((ch) => ({ ch, color: "var(--color-paper, #f5f5f2)", glow: "rgba(0,210,255,0.35)" })),
  ...TAIL.split("").map((ch, i) => {
    const t = TAIL.length > 1 ? i / (TAIL.length - 1) : 0;
    const rgb = TAIL_FROM.map((c, k) => Math.round(c + (TAIL_TO[k] - c) * t));
    return { ch, color: `rgb(${rgb.join(",")})`, glow: `rgba(${rgb.join(",")},0.5)` };
  }),
];

// Раньше заставка запоминала показ в localStorage и играла только один раз
// до следующего деплоя — Егор попросил обратное: пусть отыгрывает при
// каждом заходе, включая обычное обновление страницы (F5). Ничего больше не
// хранится, единственное, что решает, играть ли заставку, —
// prefers-reduced-motion в эффекте ниже.

/** Стекло заставки. Заливка почти прозрачная — работает именно блюр, как и
 *  на всех стеклянных поверхностях сайта; поверх него косой блик, который
 *  и читается как «запотевшее», плюс мягкая виньетка к внешнему краю. */
const GLASS: React.CSSProperties = {
  backdropFilter: "blur(34px) saturate(135%)",
  WebkitBackdropFilter: "blur(34px) saturate(135%)",
  background:
    "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 38%, rgba(12,14,20,0.30) 100%)",
};

export default function IntroSplash({
  onReveal,
}: {
  /** Створки пошли врозь — самое время начать собирать меню под ними. */
  onReveal: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(true);

  // Колбэки в ref: сцена заводится один раз по таймерам, и перерисовка
  // родителя (а она тут будет — меню начинает собираться) не должна
  // перезапускать таймеры с нуля.
  const cb = useRef({ onReveal });
  cb.current = { onReveal };

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- разовая проверка на монтировании
      setPlaying(false);
      cb.current.onReveal();
      return;
    }
    // Ветер на появлении знака. На самом первом заходе браузер его не
    // пропустит (звук разрешается только после клика), зато слышно при
    // повторном показе заставки в той же вкладке.
    const wind = window.setTimeout(() => sound()?.introWind(), T_DOT * 1000);
    const a = window.setTimeout(() => cb.current.onReveal(), T_REVEAL * 1000);
    const b = window.setTimeout(() => setPlaying(false), T_DONE_MS);
    return () => {
      window.clearTimeout(wind);
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  if (!mounted || !playing) return null;

  return createPortal(
    // Заставка всегда играет полностью, на любом уровне устройства: в режиме
    // reducedMotion (MotionTier, mid/low) framer прыгает сразу в последний
    // кадр ключей — знак оказывался сдвинутым вверх, буквы — не на месте.
    // Она идёт 1.5с, это дёшево даже для слабого железа.
    <MotionConfig reducedMotion="never">
    <div
      // По центру экрана — финальное ТЗ Егора. Меню теперь начинает
      // открываться только в момент, когда знак уже начал таять (T_REVEAL =
      // T_VANISH), а не стоит рядом с ним несколько секунд — поэтому знаку
      // больше незачем подстраиваться под будущее место карточек, конфликта
      // с ними нет.
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Стекло — отдельный слой под знаком, а не общий контейнер. Иначе его
          прозрачность утягивала бы за собой и дым: хвост растворения (0.95с)
          обрывался бы в момент, когда гаснет стекло (0.55с). Теперь стекло
          уходит само по себе, а дым доживает свой век уже над открывшимся
          меню. */}
      <motion.div
        className="absolute inset-0"
        style={GLASS}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: D_FADE, ease: EASE, delay: T_REVEAL }}
      />
      {/* Дымовой фильтр. Турбулентный шум смещает пиксели знака (feTurbulence
          → feDisplacementMap): пока `scale` нулевой, фильтр ничего не делает
          и знак стоит резким; на растворении `scale` растёт — и буквы
          разрывает на волокна, как дым. Одновременно растёт частота шума:
          дым не просто расходится, а истончается.

          Анимация — SMIL внутри самого фильтра, а не через framer-motion:
          примитивы фильтра не CSS-свойства, из JS их пришлось бы дёргать
          покадрово. SMIL стартует сам по `begin` и играет ровно один раз.

          Фильтр висит на отдельной обёртке, а не на motion-контейнере ниже:
          framer не умеет интерполировать `url()` внутри `filter`, и общий
          список сломал бы анимацию блюра. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="hdkv-smoke" x="-70%" y="-70%" width="240%" height="240%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.015" numOctaves="3" seed="7" result="noise">
              <animate
                attributeName="baseFrequency"
                dur={`${D_DISSOLVE}s`}
                begin={`${T_VANISH}s`}
                fill="freeze"
                calcMode="spline"
                keyTimes="0;0.5;1"
                keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                values="0.009 0.015;0.025 0.045;0.055 0.085"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              {/* Ровный набор амплитуды, без скачка: знак не разрывает, а
                  постепенно уводит в волокна — испарение, а не взрыв.
                  Пик снижен с 150 до 40 — на размере знака 150 рвало буквы
                  так сильно, что это читалось как дрожь и кривые изломы, а
                  не как дым (просьба Егора после проверки живьём). */}
              <animate
                attributeName="scale"
                dur={`${D_DISSOLVE}s`}
                begin={`${T_VANISH}s`}
                fill="freeze"
                calcMode="spline"
                keyTimes="0;0.35;0.7;1"
                keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                values="0;7;20;40"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <div style={{ filter: "url(#hdkv-smoke)" }}>
        {/* Знак собирается на месте, поэтому вся сборка живёт в одном
            контейнере. Он же на выходе слегка поднимается целиком (тот же
            дрейф дыма вверх), но гаснет не сразу весь — каждая буква тает
            по отдельности, тем же приёмом, что и вставала: см. `lifespan`
            на буквах ниже. Турбулентность выше рвёт уже тающие буквы на
            волокна поверх этого. */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ y: 0 }}
          animate={{ y: [0, -8, -30, -60] }}
          // Тот же класс бага, что у точки/букв (см. комментарий там): один
          // `ease` на несколько ключевых кадров гонит общий прогресс через
          // всю анимацию целиком. Здесь дрейф и так монотонно растёт, поэтому
          // это не создавало плато-артефакт, но `easeIn` на каждый отрезок —
          // честнее, чем EASE (тот сделан для появления, не для дрейфа дыма).
          transition={{ duration: D_DISSOLVE, times: [0, 0.35, 0.68, 1], ease: ["easeIn", "easeIn", "easeIn"], delay: T_VANISH }}
        >
        {/* Размер знака. Нижняя граница clamp рассчитана на телефон: корневой
            размер там 14.4px, поэтому 2.1rem даёт ~30px — знак остаётся
            крупным, но с полями по краям, а не встык к рамке экрана. */}
        {/* В 2 раза меньше прежнего размера — просьба Егора: знак был
            слишком крупным для заставки. */}
        <div className="relative flex items-center gap-[0.3em] text-[clamp(1.05rem,4.25vw,3.25rem)] sm:gap-[0.35em]">
          {/* Точка. Приходит первой и бьёт двумя расходящимися кольцами —
              это отсчёт, после которого начинают вставать буквы. На выходе
              тает первой же, тем же приёмом, что и буквы (см. lifespan). */}
          <motion.span
            className="relative inline-block h-[0.2em] w-[0.2em] shrink-0 rounded-full brand-dot"
            initial={{ opacity: 0, scale: 0.2, filter: "blur(0px)" }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1, 1, 1.4], filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(10px)"] }}
            // Один `ease` на четыре ключевых кадра — это была настоящая
            // причина, по которой HOLD на глаз почти не менялся, сколько его
            // ни увеличивай: framer-motion в этом случае гонит один и тот же
            // изогнутый прогресс через ВСЮ шкалу времени целиком, а не по
            // каждому отрезку своей кривой. Массив из трёх eases — по одному
            // на отрезок (появление / плато / растворение) — держит плато
            // ровно плоским. Отрезок растворения — не EASE: у EASE
            // (0.22,1,0.36,1) обе Y-точки контроля равны 1, то есть кривая
            // почти мгновенно долетает до конца и там же стоит — на входе
            // это читается как бодрый разгон, а на 1→0 тот же профиль
            // читается как рывок в никуда, а не таяние. easeInOut — ровная
            // симметричная кривая, поэтому знак действительно тает, а не
            // обрывается.
            transition={{ ...lifespan(T_DOT, 0.55, T_VANISH, CHAR_DUR_OUT), ease: [EASE, "linear", "easeInOut"] }}
          >
            {[0, 0.28].map((off) => (
              <motion.span
                key={off}
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(52,211,153,0.75)" }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.85, 0], scale: [1, 3.4] }}
                transition={{ duration: 1.1, ease: "easeOut", delay: T_DOT + 0.25 + off }}
              />
            ))}
          </motion.span>

          {/* Буквы. На входе каждая встаёт из размытия, снизу и с наклоном
              по оси X, волной слева направо (STAGGER). На выходе — та же
              анимация зеркально (просьба Егора: исчезновение должно быть
              «такое же», не другое): тот же наклон по X, но в обратную
              сторону, та же волна (STAGGER_OUT). Резким это раньше делала
              не сама форма движения, а слишком сильный дымовой фильтр (см.
              feDisplacementMap выше, амплитуда уже уменьшена) и жёсткая
              кривая на самой прозрачности (та теперь easeInOut, а не EASE,
              ниже в transition) — форму движения трогать не нужно было. */}
          <span className="font-display uppercase leading-none tracking-tight" style={{ perspective: 600 }}>
            {CHARS.map((c, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{
                  color: c.color,
                  textShadow: `0 0 28px ${c.glow}, 0 0 70px rgba(0,0,0,0.5)`,
                }}
                initial={{ opacity: 0, y: "0.45em", rotateX: -70, filter: "blur(16px)" }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: ["0.45em", "0em", "0em", "-0.5em"],
                  rotateX: [-70, 0, 0, 70],
                  filter: ["blur(16px)", "blur(0px)", "blur(0px)", "blur(18px)"],
                }}
                transition={{
                  ...lifespan(T_CHARS + i * STAGGER, CHAR_DUR, T_VANISH + i * STAGGER_OUT, CHAR_DUR_OUT),
                  // См. комментарий у точки выше — тот же массив eases по
                  // сегментам, а не один на все четыре ключевых кадра, и та
                  // же замена EASE на easeInOut для растворения.
                  ease: [EASE, "linear", "easeInOut"],
                }}
              >
                {c.ch}
              </motion.span>
            ))}
          </span>

        </div>
        </motion.div>
      </div>
    </div>
    </MotionConfig>,
    document.body
  );
}
