"use client";

import { useEffect, useRef } from "react";

// «Сердце умного меню» — знак вайб-панели (Егор, 2026-09-26, по референсу:
// светящееся энергетическое кольцо с тёмным центром). Рисуется на canvas:
// ~18 тонких контуров вокруг одного радиуса, каждый деформирован своей
// волной и сдвинут по фазе; складываясь светом («lighter»), они дают
// объёмный переливающийся край, как у референса. Вокруг — мелкая пыль.
// Цвета — градиент страницы. При наведении на кнопку волны растут.
//
// Плоско: без глянцевого блика (3D-шары с бликом Егор отверг).
//
// Анимация постоянная и цикличная на ВСЕХ устройствах — исключение из
// правила «на средних/слабых минимум движения», как у шапки: Егор прямо
// попросил, чтобы сердце меню всегда светилось, двигалось и искрило. На
// mid/low оно облегчено (меньше линий, 30 кадров/с). Стоит только при
// системном «уменьшить движение».
const POINTS = 72;
const SPARKS = 12;

// Появление сферы (заставка вайб-окна, Егор 2026-09-26: «эффектно,
// кинематографично, натурально»). Варианты, из которых он выбирает:
// - vortex  — из центра по спирали выходит лента-вихрь, раскручивается,
//             вращение гаснет, и спираль замыкается ровно в кольцо;
// - dust    — в центре разгорается свет, мягкая пыль оседает на кольце;
// - stroke  — кольцо прорисовывается росчерком с яркой головой света;
// - implode — линии по одной прорисовываются тонкими дугами, каждая со
//             своей точки круга (золотой угол), собираются в широкую ленту,
//             и она плавно схлопывается в кольцо; редкая пыль затягивается
//             внутрь, в момент сборки — мягкая вспышка (без волны наружу).
//             Этот вариант Егор выбрал основным: «минималистично, плавно».
// Все варианты рисуют те же линии, что и живое кольцо, поэтому в конце
// сборка незаметно переходит в обычную анимацию.
export type SphereIntro = "vortex" | "dust" | "stroke" | "implode";
const INTRO_S: Record<SphereIntro, number> = { vortex: 3.1, dust: 2.8, stroke: 2.6, implode: 3.8 };
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DUST = 220;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export default function NanoSphere({
  size = 40,
  from,
  to,
  hot = false,
  pulse = 0,
  glow = 1,
  intro,
}: {
  size?: number;
  from: string;
  to: string;
  /** Держать сферу «разогретой» (как при наведении), пока true. */
  hot?: boolean;
  /** Любая смена числа — короткая яркая вспышка (ответ, шаг, клик). */
  pulse?: number;
  /** Сила ореола и размытия линий: 1 — как в баре, меньше — чище (окна). */
  glow?: number;
  /** Как сфера появляется при монтировании; без него — сразу целиком. */
  intro?: SphereIntro;
}) {
  // Холст шире знака; схлопыванию нужен запас — вихрь стартует широким.
  const boxK = intro === "implode" ? 2.6 : 1.7;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Живут в ref, а не в зависимостях эффекта: смена состояния не должна
  // пересоздавать холст и сбрасывать анимацию.
  const hotRef = useRef(hot);
  const pulseRef = useRef(pulse);
  useEffect(() => {
    hotRef.current = hot;
    pulseRef.current = pulse;
  }, [hot, pulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Холст шире знака: свечению и пыли нужно место за краем кольца.
    const box = size * boxK;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box * dpr);
    canvas.height = Math.round(box * dpr);
    const c = (box * dpr) / 2;
    const R = size * 0.4 * dpr;
    // Крупная сфера (вайб-режим, ~260px) — те же линии, но толще и шире
    // разнесены, иначе на большом радиусе кольцо читается ниткой. До 40px
    // множитель ровно 1, маленькие сферы не меняются.
    const k = Math.max(1, size / 40) ** 0.55;
    const [fr, fg, fb] = hexToRgb(from);
    const [tr, tg, tb] = hexToRgb(to);

    const html = document.documentElement;
    const light = html.hasAttribute("data-lite") || html.hasAttribute("data-mid");
    const LINES = light ? 11 : 18;

    // Искры: рождаются у кольца, улетают наружу, вспыхивают и гаснут, на их
    // месте появляются новые — вокруг всегда что-то живёт.
    type Spark = { a: number; d: number; v: number; born: number; life: number; size: number };
    const spawn = (now: number): Spark => ({
      a: Math.random() * Math.PI * 2,
      d: R * (0.9 + Math.random() * 0.25),
      v: R * (0.12 + Math.random() * 0.35),
      born: now - Math.random() * 1.5,
      life: 1.2 + Math.random() * 1.8,
      size: (0.4 + Math.random() * 0.5) * dpr * k,
    });
    const sparks: Spark[] = Array.from({ length: SPARKS }, () => spawn(0));

    // Пыль для варианта dust.
    const dustN = light ? 130 : DUST;
    const dust = Array.from({ length: dustN }, (_, i) => ({
      a: (i / dustN) * Math.PI * 2 + (Math.random() - 0.5) * 0.25,
      start: 0.25 + Math.random() * 0.55,
      dur: 0.9 + Math.random() * 0.6,
      spin: 0.25 + Math.random() * 0.45,
      over: 0.92 + Math.random() * 0.16,
      size: (0.35 + Math.random() * 0.75) * dpr * k,
      mix: Math.random(),
      tw: Math.random() * Math.PI * 2,
    }));

    // Пыль, которую затягивает в кольцо при схлопывании.
    const pullN = light ? 30 : 60;
    const pull = Array.from({ length: pullN }, () => ({
      a: Math.random() * Math.PI * 2,
      from: 1.7 + Math.random() * 1.1,
      start: Math.random() * 1.5,
      dur: 1.3 + Math.random() * 0.9,
      spin: 0.6 + Math.random() * 0.9,
      size: (0.3 + Math.random() * 0.6) * dpr * k,
      b: 0.2 + Math.random() * 0.45,
      mix: Math.random(),
    }));

    let energy = 1;
    let target = 1;
    let hover = false;
    let seenPulse = pulseRef.current;
    const excite = () => (hover = true);
    const calm = () => (hover = false);
    const host = wrap.closest("button") ?? wrap;
    host.addEventListener("pointerenter", excite);
    host.addEventListener("pointerleave", calm);

    const draw = (t: number) => {
      // Параметры линий на этом кадре. По умолчанию — готовое кольцо.
      let p = 1; // спираль → кольцо (vortex)
      let vis = 1; // какая часть ленты/окружности нарисована
      let turns = 0; // лишние витки спирали
      let rot = 0; // доворот всего узора
      let grow = 1; // масштаб радиуса
      let spread = 1; // ширина ленты из контуров
      let lineAlpha = 1;
      let ring = 1; // ореол и искры
      let blurBoost = 1; // размытие линий (схлопывание: сначала мягкий туман)
      let flare = 0; // вспышка света в момент сборки
      if (introOn) {
        if (intro === "vortex") {
          p = easeInOut(span(t, 0.05, 2.6));
          vis = easeOut(span(t, 0, 1.4));
          turns = 1.75 * (1 - p);
          rot = -3.2 * (1 - p) ** 2;
          grow = 0.2 + 0.8 * easeOut(p);
          spread = 1 + 2.2 * (1 - p);
          lineAlpha = easeOut(span(t, 0, 0.5));
          ring = easeInOut(span(t, 1.8, 3.0));
        } else if (intro === "dust") {
          ring = easeInOut(span(t, 1.0, 2.3));
          grow = 0.86 + 0.14 * ring;
          lineAlpha = ring;
        } else if (intro === "stroke") {
          vis = easeInOut(span(t, 0.15, 1.9));
          spread = 1 + 1.5 * (1 - easeOut(span(t, 1.2, 2.4)));
          lineAlpha = easeOut(span(t, 0, 0.3));
          ring = easeInOut(span(t, 1.4, 2.5));
        } else {
          // Медленный старт, ускорение, мягкая посадка без отскока.
          const q = easeInOut(span(t, 0.6, 3.1));
          grow = 1 + 1.1 * (1 - q);
          spread = 1 + 4 * (1 - q);
          rot = 2.6 * (1 - q) ** 2;
          blurBoost = 1 + 2.5 * (1 - q);
          lineAlpha = 0.55 + 0.45 * q;
          ring = easeInOut(span(t, 2.2, 3.6));
          flare = Math.sin(Math.PI * span(t, 2.5, 3.8));
        }
      }
      target = hover || hotRef.current ? 1.9 : 1;
      if (pulseRef.current !== seenPulse) {
        seenPulse = pulseRef.current;
        energy = Math.max(energy, 3);
      }
      energy += (target - energy) * 0.06;
      // Постоянное дыхание: волны и свечение плавно нарастают и спадают.
      const breath = 1 + 0.2 * Math.sin(t * 1.1) + 0.08 * Math.sin(t * 2.3);
      // Пока кольцо проявляется, волны чуть сильнее и успокаиваются к концу.
      const e = energy * breath;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = ring;

      // Мягкое общее свечение за кольцом.
      const halo = ctx.createRadialGradient(c, c, R * 0.5, c, c, R * 2.05);
      halo.addColorStop(0, `rgba(${fr},${fg},${fb},0)`);
      halo.addColorStop(0.4, `rgba(${fr},${fg},${fb},${(0.06 + 0.035 * breath * energy) * glow})`);
      halo.addColorStop(1, `rgba(${tr},${tg},${tb},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 0.55 * dpr * k;
      ctx.shadowBlur = 10 * dpr * k * glow * blurBoost;
      // Перелив по часовой стрелке (Егор: «по кругу плавно течёт»): по
      // кольцу бежит яркая голова света с длинным хвостом, напротив — вторая,
      // слабее. Конический градиент поворачивается каждый кадр; в canvas угол
      // растёт по часовой, поэтому flow просто увеличивается. Один градиент
      // на все линии — перелив ничего не стоит по нагрузке.
      const flow = t * 1.35;
      const conic = typeof ctx.createConicGradient === "function" ? ctx.createConicGradient(flow, c, c) : null;
      if (conic) {
        conic.addColorStop(0, `rgba(${tr},${tg},${tb},0.95)`);
        conic.addColorStop(0.1, `rgba(${fr},${fg},${fb},0.55)`);
        conic.addColorStop(0.3, `rgba(${fr},${fg},${fb},0.2)`);
        conic.addColorStop(0.5, `rgba(${tr},${tg},${tb},0.5)`);
        conic.addColorStop(0.62, `rgba(${fr},${fg},${fb},0.2)`);
        conic.addColorStop(0.82, `rgba(${fr},${fg},${fb},0.28)`);
        conic.addColorStop(1, `rgba(${tr},${tg},${tb},0.95)`);
      }
      ctx.strokeStyle = conic ?? `rgba(${fr},${fg},${fb},0.34)`;
      ctx.shadowColor = `rgba(${fr},${fg},${fb},0.35)`;
      const staged = introOn && intro === "implode";
      for (let j = 0; j < LINES; j++) {
        // Схлопывание: каждая линия появляется своей дугой по очереди.
        let lv = vis;
        let a0 = 0;
        ctx.globalAlpha = lineAlpha;
        if (staged) {
          const st = (j / LINES) * 1.3;
          const lq = span(t, st, st + 1.6);
          if (lq <= 0) continue;
          lv = easeInOut(lq);
          a0 = j * GOLDEN;
          ctx.globalAlpha = lineAlpha * easeOut(span(t, st, st + 0.8));
        }
        const pts = Math.max(2, Math.round(POINTS * (1 + turns) * lv));
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          // u — положение вдоль линии: от начала (0) до нарисованного края (lv).
          const u = (i / pts) * lv;
          const a = a0 + u * Math.PI * 2 * (1 + turns) + rot + j * 0.035 * (1 - p);
          // Узор волн ещё и медленно вращается (a + t·0.25).
          const aa = a + t * 0.25;
          const wave =
            0.055 * Math.sin(3 * aa + t * 1.1 + j * 0.17) +
            0.04 * Math.sin(5 * aa - t * 1.6 + j * 0.31) +
            0.025 * Math.sin(2 * aa + t * 0.7 - j * 0.12);
          // Для вихря радиус растёт вдоль ленты (спираль); при p=1 — кольцо R.
          const base = R * grow * (u + (1 - u) * p);
          const off = (j - LINES / 2) * 0.28 * dpr * k * spread * Math.min(1, u * 4 + p);
          const rr = Math.max(0, base * (1 + wave * e) + off);
          const x = c + Math.cos(a) * rr;
          const y = c + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = ring;

      // Искры: вспышка → полёт наружу → угасание → новая искра. Еле заметные
      // (Егор: «минимальные, акцент на переливе волн») — мелкие, тусклые,
      // без собственного свечения.
      ctx.shadowBlur = 0;

      if (introOn && intro && t < INTRO_S[intro] + 0.4) {
        ctx.globalAlpha = 1;
        // Точка света в центре (вихрь — слабее, пыль — ярче).
        if (intro === "vortex" || intro === "dust") {
          const peak = intro === "dust" ? 1 : 0.55;
          const core = peak * easeOut(span(t, 0, 0.5)) * (1 - easeInOut(span(t, 0.5, 1.6)));
          if (core > 0.001) {
            const cr = R * (0.12 + 0.55 * easeOut(span(t, 0, 1.4)));
            const cg = ctx.createRadialGradient(c, c, 0, c, c, cr);
            cg.addColorStop(0, `rgba(255,255,255,${0.9 * core})`);
            cg.addColorStop(0.25, `rgba(${fr},${fg},${fb},${0.45 * core})`);
            cg.addColorStop(1, `rgba(${tr},${tg},${tb},0)`);
            ctx.fillStyle = cg;
            ctx.fillRect(c - cr, c - cr, cr * 2, cr * 2);
          }
        }
        // Пыль: из центра к кольцу по мягкой дуге, мерцает и оседает.
        if (intro === "dust") {
          for (const b of dust) {
            const q = span(t, b.start, b.start + b.dur);
            if (q <= 0) continue;
            const pp = easeInOut(q);
            const a = b.a - (1 - pp) * b.spin;
            const d = R * b.over * pp;
            const x = c + Math.cos(a) * d;
            const y = c + Math.sin(a) * d;
            const al = Math.min(1, q * 5) * (1 - easeInOut(span(t, b.start + b.dur, b.start + b.dur + 0.6)));
            if (al <= 0.01) continue;
            const tw = 0.75 + 0.25 * Math.sin(t * 9 + b.tw);
            const r = Math.round(fr + (tr - fr) * b.mix);
            const gg = Math.round(fg + (tg - fg) * b.mix);
            const bb = Math.round(fb + (tb - fb) * b.mix);
            ctx.fillStyle = `rgba(${r},${gg},${bb},${0.22 * al * tw})`;
            ctx.beginPath();
            ctx.arc(x, y, b.size * 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${0.8 * al * tw})`;
            ctx.beginPath();
            ctx.arc(x, y, b.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Росчерк: яркая голова света на конце рисуемой окружности.
        if (intro === "stroke" && vis < 1) {
          const ha = vis * Math.PI * 2;
          const hx = c + Math.cos(ha) * R;
          const hy = c + Math.sin(ha) * R;
          const hr = R * 0.35;
          const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
          const hk = Math.sin(Math.PI * clamp01(vis * 1.05));
          hg.addColorStop(0, `rgba(255,255,255,${0.85 * hk})`);
          hg.addColorStop(0.3, `rgba(${tr},${tg},${tb},${0.4 * hk})`);
          hg.addColorStop(1, `rgba(${fr},${fg},${fb},0)`);
          ctx.fillStyle = hg;
          ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
        }
        // Схлопывание: пыль по спирали затягивает в кольцо, и в момент
        // сборки кольцо мягко вспыхивает изнутри.
        if (intro === "implode") {
          for (const b of pull) {
            const q = span(t, b.start, b.start + b.dur);
            if (q <= 0 || q >= 1) continue;
            const pp = easeInOut(q);
            const a = b.a + pp * b.spin;
            const d = R * (b.from + (1 - b.from) * pp);
            const x = c + Math.cos(a) * d;
            const y = c + Math.sin(a) * d;
            const al = b.b * Math.min(1, q * 4) * (1 - q) ** 0.7;
            const r = Math.round(fr + (tr - fr) * b.mix);
            const gg = Math.round(fg + (tg - fg) * b.mix);
            const bb = Math.round(fb + (tb - fb) * b.mix);
            ctx.fillStyle = `rgba(${r},${gg},${bb},${0.25 * al})`;
            ctx.beginPath();
            ctx.arc(x, y, b.size * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${0.75 * al})`;
            ctx.beginPath();
            ctx.arc(x, y, b.size, 0, Math.PI * 2);
            ctx.fill();
          }
          if (flare > 0.001) {
            const fg2 = ctx.createRadialGradient(c, c, R * 0.6, c, c, R * 1.6);
            fg2.addColorStop(0, `rgba(${fr},${fg},${fb},0)`);
            fg2.addColorStop(0.4, `rgba(255,255,255,${0.16 * flare})`);
            fg2.addColorStop(0.55, `rgba(${tr},${tg},${tb},${0.14 * flare})`);
            fg2.addColorStop(1, `rgba(${fr},${fg},${fb},0)`);
            ctx.fillStyle = fg2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
        // Световая волна в момент, когда кольцо собралось (кроме схлопывания).
        const at = intro === "vortex" ? 2.3 : intro === "dust" ? 1.7 : 1.8;
        const w = intro === "implode" ? 0 : span(t, at, at + 0.9);
        if (w > 0 && w < 1) {
          ctx.strokeStyle = `rgba(${fr},${fg},${fb},${0.35 * (1 - w) ** 2})`;
          ctx.lineWidth = (2.2 - 1.6 * w) * dpr * k;
          ctx.beginPath();
          ctx.arc(c, c, R * (1 + 0.45 * easeOut(w)), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = ring;
      for (let i = 0; i < sparks.length; i++) {
        let p = sparks[i];
        let age = (t - p.born) / p.life;
        if (age >= 1) {
          p = sparks[i] = spawn(t);
          p.born = t;
          age = 0;
        }
        const alpha = Math.sin(age * Math.PI) * 0.22;
        const d = p.d + p.v * age;
        const a = p.a + age * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, p.size * (0.6 + 0.4 * Math.sin(age * Math.PI)), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introOn = !!intro && !still;

    let raf = 0;
    if (still) {
      draw(1.3);
    } else {
      const start = performance.now();
      // На mid/low — 30 кадров/с вместо 60: движение то же, нагрузки вдвое меньше.
      const frameMs = light ? 33 : 0;
      let last = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < frameMs) return;
        last = now;
        draw((now - start) / 1000);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", excite);
      host.removeEventListener("pointerleave", calm);
    };
  }, [size, from, to, glow, intro, boxK]);

  return (
    <span ref={wrapRef} className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * boxK, height: size * boxK }}
      />
    </span>
  );
}
