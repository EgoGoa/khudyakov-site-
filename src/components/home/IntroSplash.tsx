"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

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
// Момент, когда собралась последняя буква — отсюда считается секунда паузы
// перед переходом. 11 = длина "HUD" + ".SERVICE" (см. CHARS ниже).
const T_SETTLED = T_CHARS + (11 - 1) * STAGGER + CHAR_DUR;
const HOLD = 1.0;
const T_FADE = T_SETTLED + HOLD;
// Стекло растворяется быстро — само исчезновение, а не долгое таяние.
const D_FADE = 0.35;
// Знак уходит на ту же вспышку чуть дольше стекла (see JSX ниже), чтобы
// blur-хвост не обрубался вместе с ним.
const D_DISSOLVE = 0.5;
const T_DONE_MS = (T_FADE + D_DISSOLVE + 0.1) * 1000;

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
    const a = window.setTimeout(() => cb.current.onReveal(), T_FADE * 1000);
    const b = window.setTimeout(() => setPlaying(false), T_DONE_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  if (!mounted || !playing) return null;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
      style={GLASS}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: D_FADE, ease: EASE, delay: T_FADE }}
    >
      {/* Знак собирается на месте, поэтому вся сборка живёт в одном
          контейнере: он же на выходе уезжает обратно в размытие целиком,
          чтобы буквы не расходились каждая по-своему.

          Растворение — не просто угасание, а короткая вспышка перед ним
          (яркость подскакивает и тут же спадает вместе с резким ростом
          блюра и масштаба): без вихря и линии это единственный акцент в
          конце сцены, и он должен читаться как энергичный уход, а не
          тихое исчезновение. Начинается в тот же момент, что и растворение
          стекла (T_FADE), и укладывается в тот же короткий отрезок. */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
        animate={{
          opacity: [1, 1, 0],
          scale: [1, 1.08, 1.32],
          filter: ["brightness(1) blur(0px)", "brightness(1.9) blur(2px)", "brightness(1) blur(26px)"],
        }}
        transition={{ duration: D_DISSOLVE, times: [0, 0.3, 1], ease: EASE, delay: T_FADE }}
      >
        {/* Размер знака. Нижняя граница clamp рассчитана на телефон: корневой
            размер там 14.4px, поэтому 2.1rem даёт ~30px — знак остаётся
            крупным, но с полями по краям, а не встык к рамке экрана. */}
        {/* В 2 раза меньше прежнего размера — просьба Егора: знак был
            слишком крупным для заставки. */}
        <div className="relative flex items-center gap-[0.3em] text-[clamp(1.05rem,4.25vw,3.25rem)] sm:gap-[0.35em]">
          {/* Точка. Приходит первой и бьёт двумя расходящимися кольцами —
              это отсчёт, после которого начинают вставать буквы. Кольца
              живут ровно один проход: повторяющийся пульс прочитался бы
              как индикатор загрузки. */}
          <motion.span
            className="relative inline-block h-[0.2em] w-[0.2em] shrink-0 rounded-full brand-dot"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE, delay: T_DOT }}
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

          {/* Буквы. Каждая встаёт из размытия, снизу и с лёгким наклоном по
              оси X — знак «поворачивается» к зрителю, а не проявляется
              плоско. Порядок слева направо, шагом STAGGER. */}
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
                animate={{ opacity: 1, y: "0em", rotateX: 0, filter: "blur(0px)" }}
                transition={{ duration: CHAR_DUR, ease: EASE, delay: T_CHARS + i * STAGGER }}
              >
                {c.ch}
              </motion.span>
            ))}
          </span>

        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
