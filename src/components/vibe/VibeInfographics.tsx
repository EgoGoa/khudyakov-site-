"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Инфографика трёх вводных слайдов вайб-окна (Егор, 2026-09-26: «к каждому
// из трёх блоков — минималистичная стильная инфографика, которая показывает,
// что происходит и для чего это нужно»). Плоская, в палитре окна, движение
// тихое и бесконечное. Текста внутри графики нет — подписи стоят HTML-строкой
// под каждой частью, чтобы читались и на телефоне.

const A = "#6f86ff";
const B = "#b07cff";
const C = "#ff7a9c";
const D = "#ffb07a";

// Заголовки подписей — в разных фирменных градиентах направлений сайта
// (SMM, сайты, контент, AI — как PAGE_GRADIENT), строки под ними белые.
const LABEL_GRADS = [
  "linear-gradient(95deg, #a855f7, #38bdf8)",
  "linear-gradient(95deg, #ff4fd8, #00d2ff)",
  "linear-gradient(95deg, #ff4fd8, #ff6a3d)",
  "linear-gradient(95deg, #c8f169, #10b981)",
];

/** Подпись части схемы; x — центр этой части по ширине схемы (0–560). */
type Label = { h: string; t: string; x: number };
const VIEW_W = 560;

// Подписи стоят ровно под центрами своих частей схемы (Егор: «выровнять
// текст по инфографике, ровнее»), а не равными колонками.
// Схема «формируется» (Егор: «рисуется по линиям, как будто формирование»,
// а не шторкой слева направо): контуры по очереди прорисовываются, заливки
// проявляются следом, пунктирные потоки загораются последними.
const DRAW_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
function useDrawIn(ref: React.RefObject<HTMLDivElement | null>, start: number) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    if (html.hasAttribute("data-lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shapes = Array.from(root.querySelectorAll<SVGGeometryElement>("svg rect, svg circle, svg path"));
    const n = shapes.length;
    shapes.forEach((el, i) => {
      const delay = start + (i / n) * 1.4;
      const dashed = el.hasAttribute("stroke-dasharray");
      const stroked = !!el.getAttribute("stroke") && el.getAttribute("stroke") !== "none";
      if (stroked && !dashed) {
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        el.style.transition = `stroke-dashoffset 1.2s ${DRAW_EASE} ${delay}s, fill-opacity 0.9s ease ${delay + 0.6}s`;
      } else if (dashed) {
        el.style.transition = `stroke-opacity 0.9s ease ${start + 1.5 + (i / n) * 0.4}s, fill-opacity 0.9s ease ${delay}s`;
        el.style.strokeOpacity = "0";
      } else {
        el.style.transition = `fill-opacity 0.9s ease ${delay + 0.3}s`;
      }
      el.style.fillOpacity = "0";
    });
    // Следующий кадр — запускаем переходы к финальному виду.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        shapes.forEach((el) => {
          if (el.style.strokeDashoffset) el.style.strokeDashoffset = "0";
          if (el.style.strokeOpacity) el.style.strokeOpacity = "1";
          el.style.fillOpacity = "1";
        })
      )
    );
    return () => cancelAnimationFrame(raf);
  }, [ref, start]);
}

function Frame({ children, labels }: { children: ReactNode; labels: Label[] }) {
  const width = labels.length > 3 ? 23 : 31;
  const ref = useRef<HTMLDivElement>(null);
  useDrawIn(ref, 0.5);
  return (
    <div className="w-full">
      <div ref={ref} className="vibe-info">
        {children}
      </div>
      <div className="vibe-info__labels relative mt-3 h-[46px] w-full">
        {labels.map((l, i) => (
          <div
            key={l.h}
            className="absolute top-0 -translate-x-1/2 text-center"
            style={{ left: `${(l.x / VIEW_W) * 100}%`, width: `${width}%` }}
          >
            <p className="vibe-info__h" style={{ backgroundImage: LABEL_GRADS[i % LABEL_GRADS.length] }}>
              {l.h}
            </p>
            <p className="vibe-info__t">{l.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={A} />
        <stop offset="0.45" stopColor={B} />
        <stop offset="0.8" stopColor={C} />
        <stop offset="1" stopColor={D} />
      </linearGradient>
      <linearGradient id={`${id}-flow`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={A} stopOpacity="0" />
        <stop offset="0.5" stopColor={B} />
        <stop offset="1" stopColor={C} stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/** Часть схемы влетает мягким «попом» по очереди — как моушн-графика. */
function Part({ d, children }: { d: number; children: ReactNode }) {
  return (
    <g className="vibe-info__part" style={{ animationDelay: `${0.5 + d * 0.28}s` }}>
      {children}
    </g>
  );
}

/** Мини-страница: рамка и полоски-блоки. */
function Page({ x, y, w, h, accent, rows = 4, id }: { x: number; y: number; w: number; h: number; accent?: boolean; rows?: number; id: string }) {
  const pad = 7;
  const rh = (h - pad * 2 - 10 - (rows - 1) * 5) / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="rgba(255,255,255,0.05)" stroke={accent ? `url(#${id}-g)` : "rgba(255,255,255,0.16)"} strokeWidth={accent ? 1.6 : 1} />
      <rect
        x={x + pad}
        y={y + pad}
        width={w * 0.35}
        height={4}
        rx={2}
        fill={accent ? `url(#${id}-g)` : "rgba(255,255,255,0.3)"}
        className="vibe-info__type"
        style={{ animationDelay: `${(x % 7) * 0.3}s` }}
      />
      {Array.from({ length: rows }, (_, i) => (
        <rect
          key={i}
          x={x + pad}
          y={y + pad + 10 + i * (rh + 5)}
          width={w - pad * 2}
          height={rh}
          rx={4}
          fill={accent ? `url(#${id}-g)` : "rgba(255,255,255,0.1)"}
          opacity={accent ? 0.25 + 0.2 * ((i + 1) % 2) : 1}
          className={accent ? "vibe-info__reveal" : "vibe-info__dim"}
          style={{ animationDelay: `${i * 0.35 + (x % 5) * 0.2}s` }}
        />
      ))}
    </g>
  );
}

/** Кольцо-сфера в центре схем. */
function Orb({ cx, cy, r, id }: { cx: number; cy: number; r: number; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.7} fill={`url(#${id}-g)`} opacity={0.08} className="vibe-info__breathe" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${id}-g)`} strokeWidth={2.2} className="vibe-info__glow" />
      <circle
        cx={cx}
        cy={cy}
        r={r - 5}
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth={1}
        strokeDasharray="3 7"
        className="vibe-info__spin"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </g>
  );
}

/** Пунктирный путь и бегущий по нему свет — поток между частями схемы. */
function Flow({ d, id, delay = 0 }: { d: string; id: string; delay?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1} strokeDasharray="2 4" strokeLinecap="round" />
      <path d={d} fill="none" stroke={`url(#${id}-g)`} strokeWidth={1.6} strokeLinecap="round" pathLength={100} strokeDasharray="14 86" className="vibe-info__flow" style={{ animationDelay: `${delay}s` }} />
    </g>
  );
}

// 01 — Что такое Vibe-режим: пунктирные потоки со всех страниц обычного
// сайта сходятся в сферу и расходятся по блокам одной страницы под тебя.
const WHAT_IN = [50, 72, 94, 116];
const WHAT_OUT = [42, 74, 106, 138];
export function InfoWhat() {
  const id = "vi-what";
  return (
    <Frame
      labels={[
        { h: "Весь сайт", t: "4 направления, десятки страниц", x: 110 },
        { h: "Vibe-режим", t: "Отбирает нужное тебе", x: 280 },
        { h: "Одна страница", t: "Только твой проект", x: 450 },
      ]}
    >
      <svg viewBox="0 0 560 170" className="h-auto w-full" aria-hidden="true">
        <Defs id={id} />
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} d={i * 0.5}>
            <g className="vibe-info__float" style={{ animationDelay: `${i * 0.6}s` }}>
              <Page id={id} x={40 + i * 26} y={22 + (i % 2) * 14} w={62} h={92} rows={3} />
            </g>
          </Part>
        ))}
        <Part d={2.5}>
          {WHAT_IN.map((y, i) => (
            <Flow key={`in-${i}`} id={id} d={`M 186 ${y} C 222 ${y}, 228 85, 254 85`} delay={i * 0.3} />
          ))}
        </Part>
        <Part d={3}>
          <Orb id={id} cx={280} cy={85} r={24} />
        </Part>
        <Part d={3.5}>
          {WHAT_OUT.map((y, i) => (
            <Flow key={`out-${i}`} id={id} d={`M 306 85 C 336 85, 350 ${y}, 390 ${y}`} delay={1.2 + i * 0.3} />
          ))}
        </Part>
        <Part d={4}>
          <g className="vibe-info__float" style={{ animationDelay: "1.2s" }}>
            <Page id={id} accent x={394} y={12} w={112} h={146} rows={4} />
          </g>
        </Part>
      </svg>
    </Frame>
  );
}

// 02 — Как это работает: бриф → сборка → лендинг, по линии бежит свет.
export function InfoHow() {
  const id = "vi-how";
  return (
    <Frame
      labels={[
        { h: "Бриф", t: "3 минуты, по вопросу", x: 110 },
        { h: "Сборка", t: "Под задачу и бюджет", x: 280 },
        { h: "Лендинг", t: "Открывается сразу", x: 450 },
      ]}
    >
      <svg viewBox="0 0 560 170" className="h-auto w-full" aria-hidden="true">
        <Defs id={id} />
        {/* Бриф: два пузыря-вопроса и выбранный ответ. */}
        {/* Бриф в цикле: вопрос → выбранный ответ → следующий вопрос. */}
        <Part d={0}>
          <g className="vibe-info__float">
            <g className="vibe-info__seq">
              <rect x={46} y={36} width={96} height={30} rx={15} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.16)" />
              <rect x={60} y={48} width={52} height={6} rx={3} fill="rgba(255,255,255,0.35)" className="vibe-info__type" />
            </g>
            <g className="vibe-info__seq" style={{ animationDelay: "0.8s" }}>
              <rect x={70} y={78} width={96} height={30} rx={15} fill="rgba(255,255,255,0.04)" stroke={`url(#${id}-g)`} strokeWidth={1.5} />
              <circle cx={88} cy={93} r={7} fill={`url(#${id}-g)`} />
              <path d="M 84.5 93 l 2.5 2.5 l 4.5 -5" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={102} y={90} width={48} height={6} rx={3} fill="rgba(255,255,255,0.35)" className="vibe-info__type" style={{ animationDelay: "0.8s" }} />
            </g>
            <g className="vibe-info__seq" style={{ animationDelay: "1.6s" }}>
              <rect x={46} y={120} width={70} height={24} rx={12} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
              <rect x={58} y={129} width={36} height={6} rx={3} fill="rgba(255,255,255,0.3)" className="vibe-info__type" style={{ animationDelay: "1.6s" }} />
            </g>
          </g>
        </Part>
        <Part d={1}>
          <Flow id={id} d="M 186 90 L 250 90" />
        </Part>
        <Part d={1.5}>
          <Orb id={id} cx={280} cy={90} r={26} />
        </Part>
        <Part d={2}>
          <Flow id={id} d="M 310 90 L 384 90" delay={0.6} />
        </Part>
        <Part d={2.5}>
          <g className="vibe-info__float" style={{ animationDelay: "0.8s" }}>
            <Page id={id} accent x={392} y={20} w={116} h={140} rows={4} />
          </g>
        </Part>
      </svg>
    </Frame>
  );
}

// 03 — Что будет на лендинге: одна длинная страница из четырёх частей.
export function InfoInside() {
  const id = "vi-in";
  return (
    <Frame
      labels={[
        { h: "Решение", t: "Что сделаем", x: 76 },
        { h: "Кейсы", t: "Из твоей сферы", x: 215 },
        { h: "Тарифы", t: "Под бюджет", x: 346 },
        { h: "Заказ", t: "В один клик", x: 486 },
      ]}
    >
      <svg viewBox="0 0 560 170" className="h-auto w-full" aria-hidden="true">
        <Defs id={id} />
        {/* Рамка «браузера». */}
        <rect x={4} y={10} width={552} height={150} rx={16} fill="rgba(255,255,255,0.035)" stroke={`url(#${id}-g)`} strokeWidth={1.2} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={22 + i * 11} cy={25} r={3} fill="rgba(255,255,255,0.4)" className="vibe-info__blink" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        {/* Решение: пункты с галочками. */}
        <Part d={0}>
          {[0, 1, 2].map((i) => (
            <g key={i} className="vibe-info__reveal" style={{ animationDelay: `${i * 0.3}s` }}>
              <circle cx={30} cy={62 + i * 28} r={7} fill={`url(#${id}-g)`} opacity={0.9} />
              <path d={`M 26.5 ${62 + i * 28} l 2.5 2.5 l 4.5 -5`} fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={44} y={58 + i * 28} width={[80, 64, 72][i]} height={8} rx={4} fill="rgba(255,255,255,0.3)" className="vibe-info__type" style={{ animationDelay: `${i * 0.5}s` }} />
            </g>
          ))}
        </Part>
        {/* Кейсы: три превью. */}
        <Part d={1}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={152 + i * 42}
            y={50}
            width={36}
            height={88}
            rx={8}
            fill={`url(#${id}-g)`}
            opacity={0.18 + i * 0.12}
            className="vibe-info__float"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        </Part>
        {/* Тарифы: средний выше и подсвечен, крайние покачиваются. */}
        <Part d={2}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={290 + i * 40}
            y={i === 1 ? 46 : 62}
            width={32}
            height={i === 1 ? 96 : 80}
            rx={8}
            fill={i === 1 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)"}
            stroke={i === 1 ? `url(#${id}-g)` : "rgba(255,255,255,0.14)"}
            strokeWidth={i === 1 ? 1.6 : 1}
            className={i === 1 ? "vibe-info__glow" : "vibe-info__float"}
            style={i === 1 ? undefined : { animationDelay: `${i * 0.7}s` }}
          />
        ))}
        </Part>
        {/* Заказ: кнопка с пульсом, стрелка подталкивает. */}
        <Part d={3}>
          <rect x={436} y={82} width={100} height={34} rx={17} fill={`url(#${id}-g)`} opacity={0.25} className="vibe-info__breathe" style={{ transformOrigin: "486px 99px" }} />
          <rect x={442} y={86} width={88} height={26} rx={13} fill="#fff" />
          <path d="M 478 99 h 14 m -5 -5 l 5 5 l -5 5" fill="none" stroke="#07070b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="vibe-info__nudge" />
        </Part>
      </svg>
    </Frame>
  );
}
