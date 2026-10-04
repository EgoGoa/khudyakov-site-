"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { getTier } from "@/lib/perf-tier";
import LiveBrandWord from "@/components/layout/LiveBrandWord";

// Вводные окна перед стартовым меню (Егор, 2026-10-04, макет v6 —
// docs/intro-scenes-preview.html). После заставки со знаком идут три окна:
// «Всё в одном», «Вайб-режим», «Приложение», в каждом по три сцены. Сцена
// внутри окна сменяется сама каждые 5 секунд, следующее окно — по
// «Дальше», «Пропустить» сразу ведёт в меню.
//
// Стиль: графитовые плитки-бенто, крупные цифры, графики со стеклянными
// подсказками. Явных оранжевых кнопок нет — акцент даёт фирменный градиент
// (красный → розовый → голубой) в окантовках, важных словах и ключевых
// цифрах. Текст проявляется по словам слева направо из размытия.
//
// Показывается при каждой загрузке сайта и при клике на логотип в шапке: путь
// всегда начинается со знака (Егор, 2026-10-04). «Пропустить» ведёт сразу в меню.

const SCENE_MS = 5000;
// Заставка окна стоит дольше, чем кажется нужным: на телефоне слова проявляются
// медленнее, и при 1,3–2 с заголовок едва успевал прочитаться (Егор, 2026-10-04).
const TITLE_MS = 3000;

// lite — слабое устройство или reduced motion: только прозрачность, без
// размытия, сдвигов и бегущих цифр.
const LiteCtx = createContext(false);
const useLite = () => useContext(LiteCtx);

// ---------- общие приёмы движения ----------

/** Текст с акцентами: **слово** — фирменным градиентом. Слова проявляются
 *  по очереди слева направо, из размытия в резкость. Градиент растянут на
 *  всю выделенную фразу (по строкам), а не повторяется на каждом слове: у
 *  слов-блоков свой background, поэтому ширину и сдвиг ленты считаем по
 *  положению слов (CSS-переменные --gx / --gw на каждом слове). */
function Reveal({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const lite = useLite();
  const ref = useRef<HTMLSpanElement>(null);
  const words: { w: string; run: number }[] = [];
  let run = -1;
  text.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    const k = part.startsWith("**");
    if (k) run += 1;
    part
      .replace(/\*\*/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => words.push({ w, run: k ? run : -1 }));
  });

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const paint = () => {
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-run]"));
      const lines = new Map<string, HTMLElement[]>();
      els.forEach((el) => {
        const key = `${el.dataset.run}:${el.offsetTop}`;
        lines.set(key, [...(lines.get(key) ?? []), el]);
      });
      lines.forEach((group) => {
        const left = Math.min(...group.map((el) => el.offsetLeft));
        const right = Math.max(...group.map((el) => el.offsetLeft + el.offsetWidth));
        group.forEach((el) => {
          el.style.setProperty("--gx", `${el.offsetLeft - left}px`);
          el.style.setProperty("--gw", `${Math.max(1, right - left)}px`);
        });
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(root);
    void document.fonts?.ready.then(paint);
    return () => ro.disconnect();
  }, [text]);

  if (lite) {
    // Слабое устройство: слова неподвижны, плавно проявляется вся фраза
    // целиком — один анимируемый слой вместо десятка.
    return (
      <motion.span
        className={className}
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {words.map(({ w, run: r }, i) => (
          <span key={i}>
            <span className={r >= 0 ? "wi-k wi-kw" : undefined} data-run={r >= 0 ? r : undefined} style={{ display: "inline-block" }}>
              {w}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </motion.span>
    );
  }

  return (
    <span className={className} ref={ref}>
      {words.map(({ w, run: r }, i) => (
        <span key={i}>
          <motion.span
            className={r >= 0 ? "wi-k wi-kw" : undefined}
            data-run={r >= 0 ? r : undefined}
            style={{ display: "inline-block" }}
            initial={lite ? { opacity: 0 } : { opacity: 0, x: -18, y: 4, filter: "blur(14px)" }}
            animate={lite ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            transition={{ duration: lite ? 0.3 : 1, ease: EASE, delay: delay + i * 0.055 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** Плитка бенто: всплывает из глубины по очереди. Размытие снимается
 *  совсем (filter: none) — иначе стекло внутри плитки не размывало бы. */
function Tile({
  i = 0,
  className = "",
  style,
  children,
}: {
  i?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const lite = useLite();
  return (
    <motion.div
      className={`wi-tile ${className}`}
      style={{ ...style, "--td": `${0.15 + i * 0.14}s` } as CSSProperties}
      initial={lite ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.955, filter: "blur(16px)" }}
      animate={
        lite
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }
      }
      transition={{ duration: lite ? 0.3 : 1.1, ease: EASE, delay: 0.15 + i * 0.14 }}
    >
      {children}
    </motion.div>
  );
}

/** Число набегает от нуля. */
function Count({
  to,
  delay = 0.5,
  dur = 1.3,
  prefix = "",
  suffix = "",
}: {
  to: number;
  delay?: number;
  dur?: number;
  prefix?: string;
  suffix?: ReactNode;
}) {
  const lite = useLite();
  const [v, setV] = useState(lite ? to : 0);
  useEffect(() => {
    if (lite) return;
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / (dur * 1000)));
      const e = 1 - Math.pow(1 - t, 3);
      setV(Math.round(to * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, delay, dur, lite]);
  // Ширина резервируется по итоговому числу: пока цифры бегут, блок не
  // растёт и не двигает соседей (значок рядом больше не «трясёт»).
  const final = `${prefix}${to.toLocaleString("ru-RU")}`;
  return (
    <span className="wi-count">
      <span className="wi-count-ghost" aria-hidden="true">
        {final}
        {suffix}
      </span>
      <span className="wi-count-now">
        {prefix}
        {v.toLocaleString("ru-RU")}
        {suffix}
      </span>
    </span>
  );
}

/** Отложенный флаг: становится true через ms после появления сцены. */
function useAfter(ms: number) {
  const lite = useLite();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setOn(true), lite ? 0 : ms);
    return () => window.clearTimeout(id);
  }, [ms, lite]);
  return on;
}

const draw = (delay: number, dur = 1.4) => ({
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: dur, ease: EASE, delay },
});

function DotArrow({ style, className }: { style?: CSSProperties; className?: string }) {
  const pts = [
    [4, 14], [11, 14], [18, 14], [25, 14], [32, 14],
    [25, 7], [18, 2], [25, 21], [18, 26],
  ];
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" style={style} className={className} aria-hidden="true">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#fff" className="wi-dot" style={{ animationDelay: `${(x / 32) * 0.6}s` }} />
      ))}
    </svg>
  );
}

/** Фирменная точка из шапки сайта: зелёная, светящаяся, чуть дышит. */
function GreenDot({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#34d399" filter="url(#wi-glow)" className="wi-gdot" />;
}

/** Знак: «● HUD.» — точка перед H и точка после D, как в шапке. */
function HudMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="url(#wi-gh)" />
      <GreenDot cx={8.5} cy={20} r={2.3} />
      <text x="13.5" y="23.6" fontFamily="var(--font-bebas)" fontWeight="700" fontSize="8.6" fill="#fff">
        HUD.
      </text>
    </svg>
  );
}

/** Название — один в один как логотип в шапке: зелёная пульсирующая точка,
 *  «HUD» шрифтом заголовков капсом и «.SERVICE» с живым градиентом
 *  (LiveBrandWord). Везде, где в введении написано HUD.SERVICE. */
function Brand() {
  return (
    <span className="wi-brand">
      <i className="brand-dot animate-pulse-rec wi-bdot" />
      <span className="font-display uppercase tracking-tight">
        HUD<LiveBrandWord>.SERVICE</LiveBrandWord>
      </span>
    </span>
  );
}

// ---------- сцены ----------

function S11() {
  const lite = useLite();
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr auto" }}>
      <Tile i={0} className="wi-s2 wi-flowtile">
        <div className="wi-pills-col">
          {["Видео", "AI", "Сайты", "SMM"].map((t, k) => (
            <motion.span
              key={t}
              className="wi-pill wi-glass wi-pulse"
              style={{ "--pd": `${0.9 + k * 0.45}s` } as CSSProperties}
              initial={lite ? { opacity: 0 } : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.45 + k * 0.1 }}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <DotArrow className="wi-arrow" style={{ width: 54, height: 42 }} />
        <motion.div
          initial={lite ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={lite ? { duration: 0.3 } : { type: "spring", stiffness: 160, damping: 14, delay: 1.1 }}
        >
          <div className="wi-pulse" style={{ "--pd": "1.4s" } as CSSProperties}>
            <HudMark size={92} />
          </div>
        </motion.div>
      </Tile>
      <Tile i={1}>
        <div className="wi-lbl">Менеджер</div>
        <div className="wi-num wi-mt">1</div>
      </Tile>
      <Tile i={2}>
        <div className="wi-lbl">Договор и смета</div>
        <div className="wi-num wi-mt">1</div>
      </Tile>
    </div>
  );
}

function S12() {
  const lite = useLite();
  return (
    <div className="wi-bento" style={{ gridTemplateColumns: "1.1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
      <Tile i={0} className="wi-hotb wi-center" style={{ gridRow: "1 / 3" }}>
        <svg viewBox="0 0 140 84" className="wi-gauge" aria-hidden="true">
          <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".35">
            <path d="M10 70h8M14.6 47.6l7 4M28 28l5 6.5M48 15.5l2.6 7.6M70 11v8M92 15.5l-2.6 7.6M112 28l-5 6.5M125.4 47.6l-7 4M130 70h-8" />
          </g>
          <path d="M18 70A52 52 0 0 1 122 70" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="6" strokeLinecap="round" />
          <motion.path d="M18 70A52 52 0 0 1 112 39" fill="none" stroke="url(#wi-gl)" strokeWidth="6" strokeLinecap="round" {...draw(0.6, 1.6)} />
          <motion.g
            style={{ originX: "70px", originY: "70px", transformBox: "view-box" }}
            initial={{ rotate: lite ? 38 : -80 }}
            animate={{ rotate: 38 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.6 }}
          >
            <path d="M70 70L70 26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>
          <circle cx="70" cy="70" r="6" fill="#fff" />
        </svg>
        <div className="wi-num wi-num--l wi-acc wi-mt wi-pulse" style={{ "--pd": "2.2s" } as CSSProperties}>
          <Count to={30} prefix="−" suffix="%" delay={0.6} dur={1.6} />
        </div>
      </Tile>
      <Tile i={1}>
        <div className="wi-lbl">4 подрядчика</div>
        <div className="wi-num wi-num--m wi-mt">
          6<small>недель</small>
        </div>
      </Tile>
      <Tile i={2} className="wi-edge">
        <div className="wi-lbl">
          <Brand />
        </div>
        <div className="wi-num wi-num--m wi-acc wi-mt">
          4<small>недели</small>
        </div>
      </Tile>
    </div>
  );
}

function S13() {
  const lite = useLite();
  const tip = useAfter(1300);
  const bars = [
    { x: 0, h: 46, l: "Видео" },
    { x: 76, h: 32, l: "AI" },
    { x: 152, h: 42, l: "Сайт" },
    { x: 228, h: 38, l: "SMM" },
    { x: 304, h: 140, l: "Отдельно" },
  ];
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr" }}>
      <Tile i={0} className="wi-s2 wi-hot wi-col">
        <div className="wi-lbl">Затраты за год</div>
        <div className="wi-num wi-num--l wi-mt-s">
          <Count to={384000} suffix=" ₽" delay={0.4} />
        </div>
        <span className="wi-badge wi-pulse" style={{ "--pd": "1.8s" } as CSSProperties}>
          −20%
        </span>
        <div className="wi-chart">
          <svg viewBox="0 0 440 190" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            {bars.map((b, k) => (
              <motion.rect
                key={b.l}
                x={b.x}
                y={170 - b.h}
                width="46"
                height={b.h}
                rx="9"
                fill="url(#wi-bar)"
                style={{ transformBox: "fill-box", originY: 1 }}
                initial={{ scaleY: lite ? 1 : 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.5 + k * 0.08 }}
              />
            ))}
            <motion.rect
              x="380"
              y="58"
              width="60"
              height="112"
              rx="10"
              fill="url(#wi-barA)"
              style={{ transformBox: "fill-box", originY: 1 }}
              initial={{ scaleY: lite ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 1.0 }}
            />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: tip ? 1 : 0 }} transition={{ duration: 0.5 }}>
              <path d="M410 58V170" stroke="#fff" strokeWidth="1.4" />
              <circle cx="410" cy="58" r="8" fill="#fff" />
              <path d="M406 58l3 3 5-6" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            <path d="M0 171H440" stroke="#fff" strokeOpacity=".18" />
            <g className="wi-svgt" fontSize="10.5" textAnchor="middle">
              {bars.map((b) => (
                <text key={b.l} x={b.x + 23} y="186">
                  {b.l}
                </text>
              ))}
              <GreenDot cx={394} cy={182} r={2.4} />
              <text x="400" y="186" fill="#EC4899">
                HUD.
              </text>
            </g>
          </svg>
          <motion.div
            className="wi-glass wi-tip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: tip ? 1 : 0, y: tip ? 0 : 8 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="wi-lbl">Отдельно — 480 000 ₽</div>
            <div className="wi-lbl wi-mt-xs">
              Экономия <span className="wi-k">96 000 ₽</span>
            </div>
          </motion.div>
        </div>
      </Tile>
    </div>
  );
}

function S21() {
  const lite = useLite();
  const picked = useAfter(1500);
  const chips = ["Кафе", "Онлайн-школа", "Бьюти", "Магазин"];
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr" }}>
      <Tile i={0} className="wi-s2 wi-col">
        <div className="wi-row">
          <span className="wi-lbl">Вопрос 2 из 5</span>
          <span className="wi-steps">
            {[0, 1, 2, 3, 4].map((k) => (
              <i key={k} className={k < 2 ? "is-on" : ""} />
            ))}
          </span>
        </div>
        <div className="wi-q">
          <Reveal text="Чем занимаешься?" delay={0.4} />
        </div>
        <div className="wi-chips">
          {chips.map((c, k) => {
            const on = c === "Онлайн-школа" && picked;
            return (
              <motion.span
                key={c}
                className={`wi-chip${on ? " is-on" : ""}`}
                initial={{ opacity: 0, y: lite ? 0 : 10 }}
                animate={{ opacity: 1, y: 0, scale: on ? [1, 0.95, 1] : 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: on ? 0 : 0.6 + k * 0.08 }}
              >
                {c}
                {c === "Онлайн-школа" && (
                  <motion.svg
                    className="wi-cursor"
                    viewBox="0 0 30 34"
                    aria-hidden="true"
                    initial={lite ? { opacity: 0 } : { opacity: 0, x: 60, y: 70 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.9 }}
                  >
                    <path d="M2 2l0 22 6-5 4.5 9.5 4-2-4.5-9.5 8-1z" fill="#fff" stroke="#0a0a0b" strokeWidth="1.4" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </motion.span>
            );
          })}
        </div>
        <div className="wi-glass wi-input">
          <span>Или скажи голосом</span>
          <span className="wi-eq" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((k) => (
              <i key={k} style={{ animationDelay: `${k * 0.12}s` }} />
            ))}
          </span>
        </div>
      </Tile>
    </div>
  );
}

function S22() {
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "auto 1fr" }}>
      <Tile i={0}>
        <div className="wi-lbl">Обычный блок</div>
        <svg viewBox="0 0 104 50" className="wi-skel" aria-hidden="true">
          <g fill="#fff" fillOpacity=".16">
            <rect width="104" height="8" rx="4" />
            <rect y="13" width="104" height="18" rx="5" />
            <rect y="36" width="48" height="14" rx="5" />
            <rect x="56" y="36" width="48" height="14" rx="5" />
          </g>
        </svg>
      </Tile>
      <Tile i={1} className="wi-edge">
        <div className="wi-lbl">Твой блок</div>
        <svg viewBox="0 0 104 50" className="wi-skel" aria-hidden="true">
          {[
            { y: 0, w: 64, h: 8, f: "url(#wi-gl)", o: 1 },
            { y: 13, w: 104, h: 18, f: "#fff", o: 1 },
          ].map((r, k) => (
            <motion.rect
              key={k}
              y={r.y}
              width={r.w}
              height={r.h}
              rx={k ? 5 : 4}
              fill={r.f}
              fillOpacity={r.o}
              style={{ transformBox: "fill-box", originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.7 + k * 0.15 }}
            />
          ))}
          <rect y="36" width="48" height="14" rx="5" fill="#fff" fillOpacity=".5" />
          <rect x="56" y="36" width="48" height="14" rx="5" fill="#fff" fillOpacity=".5" />
        </svg>
      </Tile>
      <Tile i={2} className="wi-s2 wi-hotb wi-col wi-growth">
        <div className="wi-growth-n">
          <div className="wi-lbl">Эффективность страницы</div>
          <div className="wi-num wi-acc wi-mt-s">
            <Count to={80} prefix="+" suffix="%" delay={0.9} />
          </div>
          <DotArrow style={{ transform: "rotate(-35deg)", marginTop: 10 }} />
        </div>
        <div className="wi-chart">
          <svg viewBox="0 0 264 96" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M0 84C24 84 30 70 48 72C68 74 72 48 96 52C118 56 122 32 146 36C170 40 176 16 198 18C222 20 236 8 264 4V96H0Z"
              fill="url(#wi-fade)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
            />
            <motion.path
              d="M0 84C24 84 30 70 48 72C68 74 72 48 96 52C118 56 122 32 146 36C170 40 176 16 198 18C222 20 236 8 264 4"
              fill="none"
              stroke="url(#wi-gl)"
              strokeWidth="2.4"
              vectorEffect="non-scaling-stroke"
              {...draw(0.9, 1.8)}
            />
          </svg>
        </div>
      </Tile>
    </div>
  );
}

function S23() {
  const lite = useLite();
  const [sec, setSec] = useState(59 * 60 + 12);
  useEffect(() => {
    const id = window.setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "auto 1fr" }}>
      <Tile i={0} className="wi-hot wi-center">
        <svg viewBox="0 0 104 104" className="wi-ring" aria-hidden="true">
          <circle cx="52" cy="52" r="44" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="7" />
          <motion.circle
            cx="52"
            cy="52"
            r="44"
            fill="none"
            stroke="url(#wi-gl)"
            strokeWidth="7"
            strokeLinecap="round"
            transform="rotate(-90 52 52)"
            initial={{ pathLength: lite ? 0.9 : 0 }}
            animate={{ pathLength: 0.9 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
          />
          <text x="52" y="52" className="wi-svgu" fontSize="17" textAnchor="middle">
            {mm}:{ss}
          </text>
        </svg>
      </Tile>
      <div className="wi-stack">
        <Tile i={1}>
          <div className="wi-lbl">Сроки</div>
          <div className="wi-num wi-num--s wi-mt-s">
            <Count to={14} delay={0.7} />
            <small>дней</small>
          </div>
        </Tile>
        <Tile i={2} className="wi-edge">
          <div className="wi-lbl">Цена</div>
          <div className="wi-num wi-num--xs wi-acc wi-mt-s">
            <Count to={89000} suffix=" ₽" delay={0.8} />
          </div>
        </Tile>
      </div>
      <Tile i={3} className="wi-s2">
        <div className="wi-lbl">Запуск онлайн-школы</div>
        <div className="wi-list">
          {["Лендинг под курс", "8 Reels в месяц", "AI-бот для заявок"].map((t, k) => (
            <motion.div
              key={t}
              className="wi-row"
              initial={{ opacity: 0, x: lite ? 0 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 1.0 + k * 0.18 }}
            >
              <span>{t}</span>
              <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
                <motion.path d="M1.5 6l4 4L14.5 1.5" fill="none" stroke="url(#wi-gl)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...draw(1.2 + k * 0.18, 0.5)} />
              </svg>
            </motion.div>
          ))}
        </div>
      </Tile>
    </div>
  );
}

function S31() {
  const lite = useLite();
  const step1 = useAfter(800);
  const step2 = useAfter(1500);
  const icon = useAfter(2100);
  const dev1 = useAfter(2900);
  const dev2 = useAfter(3500);
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr" }}>
      <Tile i={0} className="wi-s2 wi-phone-tile">
        <svg viewBox="0 0 140 300" className="wi-phone" aria-hidden="true">
          <rect x="1" y="1" width="138" height="298" rx="28" fill="#0a0a0b" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />
          <rect x="7" y="7" width="126" height="290" rx="23" fill="#1b1b1f" />
          <rect x="50" y="14" width="40" height="12" rx="6" fill="#000" />
          <text x="20" y="24" className="wi-svgt" fontSize="8.5">
            9:41
          </text>
          <g fill="#fff" fillOpacity=".12">
            <rect x="18" y="42" width="28" height="28" rx="8" />
            <rect x="56" y="42" width="28" height="28" rx="8" />
            <rect x="94" y="42" width="28" height="28" rx="8" />
            <rect x="18" y="82" width="28" height="28" rx="8" />
            <rect x="94" y="82" width="28" height="28" rx="8" />
            <rect x="18" y="122" width="28" height="28" rx="8" />
            <rect x="56" y="122" width="28" height="28" rx="8" />
          </g>
          <rect x="56" y="82" width="28" height="28" rx="8" fill="none" stroke="#fff" strokeOpacity=".25" strokeDasharray="3 3" />
          <motion.g
            style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
            initial={{ opacity: 0, scale: lite ? 1 : 0.3 }}
            animate={{ opacity: icon ? 1 : 0, scale: icon ? 1 : lite ? 1 : 0.3 }}
            transition={lite ? { duration: 0.3 } : { type: "spring", stiffness: 220, damping: 13 }}
          >
            <rect x="56" y="82" width="28" height="28" rx="8" fill="url(#wi-gh)" />
            <GreenDot cx={61.2} cy={96} r={1.7} />
            <text x="64.6" y="98.6" fontFamily="var(--font-bebas)" fontWeight="700" fontSize="6.2" fill="#fff">
              HUD.
            </text>
          </motion.g>
        </svg>
        <motion.div
          className="wi-glass wi-sheet"
          initial={lite ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <div className={`wi-sheet-row${step1 && !step2 ? " is-on" : ""}`}>
            <span className="wi-num wi-acc wi-num--step">1</span>Поделиться
          </div>
          <div className="wi-sep" />
          <div className={`wi-sheet-row${step2 ? " is-on" : ""}`}>
            <span className="wi-num wi-acc wi-num--step">2</span>На экран «Домой»
          </div>
        </motion.div>
        <svg viewBox="0 0 150 100" className="wi-devices" aria-hidden="true">
          <rect x="1" y="6" width="62" height="84" rx="9" fill="#0a0a0b" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
          <rect x="6" y="11" width="52" height="74" rx="5" fill="#1b1b1f" />
          <rect x="79" y="26" width="70" height="46" rx="5" fill="#0a0a0b" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
          <rect x="83" y="30" width="62" height="38" rx="2" fill="#1b1b1f" />
          <path d="M70 76h86l-6 8H76z" fill="#fff" fillOpacity=".25" />
          <motion.g
            style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
            initial={{ opacity: 0, scale: lite ? 1 : 0.3 }}
            animate={{ opacity: dev1 ? 1 : 0, scale: dev1 ? 1 : lite ? 1 : 0.3 }}
            transition={lite ? { duration: 0.3 } : { type: "spring", stiffness: 220, damping: 13 }}
          >
            <rect x="21" y="38" width="22" height="22" rx="6" fill="url(#wi-gh)" />
            <GreenDot cx={26} cy={49} r={1.4} />
            <text x="28.6" y="51.2" fontFamily="var(--font-bebas)" fontWeight="700" fontSize="5" fill="#fff">
              HUD.
            </text>
          </motion.g>
          <motion.g
            style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
            initial={{ opacity: 0, scale: lite ? 1 : 0.3 }}
            animate={{ opacity: dev2 ? 1 : 0, scale: dev2 ? 1 : lite ? 1 : 0.3 }}
            transition={lite ? { duration: 0.3 } : { type: "spring", stiffness: 220, damping: 13 }}
          >
            <rect x="103" y="37" width="22" height="22" rx="6" fill="url(#wi-gh)" />
            <GreenDot cx={108} cy={48} r={1.4} />
            <text x="110.6" y="50.2" fontFamily="var(--font-bebas)" fontWeight="700" fontSize="5" fill="#fff">
              HUD.
            </text>
          </motion.g>
        </svg>
      </Tile>
    </div>
  );
}

function S32() {
  const lite = useLite();
  const notes = [
    { t: "Монтаж готов", s: "Посмотри и оставь правки", w: "сейчас" },
    { t: "Акция недели", s: "−20% на сайт-визитку", w: "2 мин" },
    { t: "Скидка выросла", s: "Теперь **10%** на все заказы", w: "1 ч" },
  ];
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr" }}>
      <Tile i={0} className="wi-s2 wi-hotb wi-lock">
        <div className="wi-lock-time">
          <div className="wi-lbl">суббота, 4 октября</div>
          <div className="wi-clock">9:41</div>
        </div>
        <div className="wi-notes">
          {notes.map((n, k) => (
            <motion.div
              key={n.t}
              className="wi-glass wi-note"
              initial={lite ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={lite ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 20, delay: 0.8 + k * 0.55 }}
            >
              <HudMark size={30} />
              <div className="wi-note-body">
                <div className="wi-row wi-lbl">
                  <span>{n.t}</span>
                  <span>{n.w}</span>
                </div>
                <div className="wi-lbl wi-lbl--soft">
                  {n.s.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
                    p.startsWith("**") ? (
                      <span key={j} className="wi-k">
                        {p.replace(/\*\*/g, "")}
                      </span>
                    ) : (
                      p
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Tile>
    </div>
  );
}

function S33() {
  const lite = useLite();
  const lv = ["3%", "5%", "10%", "15%"];
  return (
    <div className="wi-bento" style={{ gridTemplateRows: "1fr auto" }}>
      <Tile i={0} className="wi-hot wi-col wi-between">
        <div className="wi-lbl">Твоя скидка</div>
        <div className="wi-big">
          <Count to={10} delay={0.6} />
          <span className="wi-k wi-big-pct">%</span>
        </div>
      </Tile>
      <Tile i={1} className="wi-col wi-between">
        <div className="wi-lbl">Следующий уровень</div>
        <div>
          <div className="wi-num wi-num--m">15%</div>
          <div className="wi-lbl wi-mt-s">после 4-го заказа</div>
        </div>
      </Tile>
      <Tile i={2} className="wi-s2">
        <div className="wi-row wi-lbl">
          <span>Заказы</span>
          <span>3 из 4</span>
        </div>
        <div className="wi-levels">
          {lv.map((l, k) => (
            <div key={l}>
              <span className="wi-level-track">
                {k < 3 && (
                  <motion.i
                    style={{ originX: 0 }}
                    initial={{ scaleX: lite ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.8 + k * 0.35 }}
                  />
                )}
              </span>
              <span className="wi-level-l">{l}</span>
            </div>
          ))}
        </div>
      </Tile>
    </div>
  );
}

// ---------- содержание ----------

type Scene = { title: string; why: string; Body: () => ReactNode };

const WINDOWS: { label: string; scenes: Scene[] }[] = [
  {
    label: "5в1",
    scenes: [
      {
        title: "Видео, AI, сайты и SMM — **в одном сервисе**",
        why: "Один менеджер, **один договор,** одна смета.",
        Body: S11,
      },
      {
        title: "Запуск бренда **на 30% быстрее**",
        why: "Без пауз между подрядчиками — **одна команда, один процесс.**",
        Body: S12,
      },
      {
        title: "Бюджет на проект **на 20% ниже**",
        why: "Одна смета — **без наценок** четырёх подрядчиков.",
        Body: S13,
      },
    ],
  },
  {
    label: "VIBE-режим",
    scenes: [
      {
        title: "**Персонализируй** наш сервис",
        why: "5 вопросов, **1 минута** — и сервис твой.",
        Body: S21,
      },
      {
        title: "**Персонализируй** любой блок",
        why: "Блок под тебя: **удобнее, быстрее, лично.**",
        Body: S22,
      },
      {
        title: "Личное предложение **за 1 час**",
        why: "Состав, сроки и цена — **через час в окне.**",
        Body: S23,
      },
    ],
  },
  {
    label: "Приложение",
    scenes: [
      {
        title: "HUD у тебя **на экране**",
        why: "Два нажатия — и **HUD всегда под рукой.**",
        Body: S31,
      },
      {
        title: "Всё важное **в уведомлениях**",
        why: "Статусы, акции, бонусы — **приходят сами.**",
        Body: S32,
      },
      {
        title: "Скидка растёт **с каждым заказом**",
        why: "Чем больше заказов, **тем ниже цена.**",
        Body: S33,
      },
    ],
  },
];

// ---------- окно ----------

export default function WelcomeIntro({ onDone }: { onDone: () => void }) {
  // Облегчённый режим известен с первого кадра: окно монтируется уже в
  // браузере, поэтому читаем уровень устройства сразу, а не в эффекте — иначе
  // первая заставка стартовала бы тяжёлой анимацией и переключалась на ходу.
  const [lite] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || getTier() !== "high",
  );
  // Уход старой сцены: на это время снимаем размытие стекла и замираем
  // бесконечные анимации — иначе затухание всего окна идёт рывками.
  const [leaving, setLeaving] = useState(false);

  const [w, setW] = useState(0);
  const [s, setS] = useState(0);
  // Перед каждым окном на секунду встаёт его название — как знак в начале.
  const [title, setTitle] = useState(true);
  const win = WINDOWS[w];
  const scene = win.scenes[s];
  const last = w === WINDOWS.length - 1;

  useEffect(() => {
    if (!title) return;
    const id = window.setTimeout(() => setTitle(false), lite ? 2800 : TITLE_MS);
    return () => window.clearTimeout(id);
  }, [title, w, lite]);

  const goWindow = useCallback((k: number) => {
    setLeaving(true);
    setW(k);
    setS(0);
    setTitle(true);
  }, []);
  useEffect(() => {
    if (title) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- флаг ухода гаснет, когда новая сцена на месте
    setLeaving(false);
  }, [title]);

  // Выход в меню: сначала снимаем тяжёлое размытие и замираем анимации,
  // затем окно плавно гаснет (см. WelcomeOverlay) — меню не борется за кадры.
  const finish = useCallback(() => {
    setLeaving(true);
    onDone();
  }, [onDone]);

  const next = useCallback(() => {
    if (last) return finish();
    goWindow(w + 1);
  }, [last, finish, goWindow, w]);
  // Всё идёт само (Егор, 2026-10-04): три сцены окна подряд, затем следующее
  // окно, а после третьего окна — стартовое меню. «Дальше» и «Пропустить»
  // только ускоряют.
  useEffect(() => {
    if (title) return;
    const id = window.setTimeout(() => (s < 2 ? setS(s + 1) : next()), SCENE_MS);
    return () => window.clearTimeout(id);
  }, [w, s, title, next]);

  const prevScene = useCallback(() => !title && setS((v) => (v + 2) % 3), [title]);
  const nextScene = useCallback(() => !title && setS((v) => (v + 1) % 3), [title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextScene();
      else if (e.key === "ArrowLeft") prevScene();
      else if (e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, nextScene, prevScene]);

  // Свайп по сцене на телефоне листает сцены окна.
  const down = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (down.current === null) return;
    const dx = e.clientX - down.current;
    down.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) nextScene();
    else prevScene();
  };

  const key = `${w}-${s}`;
  const Body = scene.Body;

  return (
    <LiteCtx.Provider value={lite}>
      <MotionConfig reducedMotion="never">
      <motion.div
        className={`wi${leaving ? " wi-leaving" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <WiDefs />

        <AnimatePresence mode="wait">
          {title ? (
            <motion.div
              key={`t${w}`}
              className="wi-titlecard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: lite ? "none" : "blur(14px)", transition: { duration: 0.45, ease: EASE } }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`wi-tc-t${w === 1 ? " wi-vibe" : ""}`}>
                <Reveal text={`**${win.label}**`} delay={0.15} />
              </h2>
              <button type="button" className="wi-skip wi-tc-skip" onClick={finish}>
                Пропустить
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="wi-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
        <div className="wi-head">
          <span className="wi-bar" role="tablist" aria-label="Сцены">
            {[0, 1, 2].map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === s}
                aria-label={`Сцена ${k + 1}`}
                className={k < s ? "is-done" : ""}
                onClick={() => setS(k)}
              >
                {k === s && <i key={key} style={{ animationDuration: `${SCENE_MS}ms` }} />}
              </button>
            ))}
          </span>
        </div>

        <div className="wi-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              className="wi-tile wi-hot wi-title-tile"
              initial={lite ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(12px)" }}
              animate={lite ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: lite ? 0.3 : 0.9, ease: EASE }}
            >
              <div className="wi-d3" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <h2 className="wi-ttl">
                <Reveal text={scene.title} delay={0.05} />
              </h2>
              <p className="wi-why">
                <Reveal text={scene.why} delay={0.55} />
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="wi-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              className="wi-scene"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.25, ease: EASE } }}
            >
              <Body />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="wi-foot">
          <button type="button" className="wi-skip" onClick={finish}>
            Пропустить
          </button>
          <span className="wi-wdots" aria-hidden="true">
            {WINDOWS.map((x, k) => (
              <i key={x.label} className={k === w ? "is-on" : ""} />
            ))}
          </span>
          <button type="button" className="wi-next" onClick={next}>
            {last ? "К меню" : "Дальше"}
          </button>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </MotionConfig>
    </LiteCtx.Provider>
  );
}

function WiDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="wi-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="wi-gh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5310B" />
          <stop offset=".6" stopColor="#EC4899" />
          <stop offset="1" stopColor="#00D2FF" />
        </linearGradient>
        <linearGradient id="wi-gl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F5310B" />
          <stop offset=".55" stopColor="#EC4899" />
          <stop offset="1" stopColor="#00D2FF" />
        </linearGradient>
        <linearGradient id="wi-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a50" />
          <stop offset="1" stopColor="#26262a" />
        </linearGradient>
        <linearGradient id="wi-barA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5310B" />
          <stop offset=".5" stopColor="#EC4899" />
          <stop offset="1" stopColor="#00D2FF" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id="wi-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EC4899" stopOpacity=".3" />
          <stop offset="1" stopColor="#00D2FF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
