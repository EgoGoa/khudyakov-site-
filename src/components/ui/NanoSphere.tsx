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
}: {
  size?: number;
  from: string;
  to: string;
  /** Держать сферу «разогретой» (как при наведении), пока true. */
  hot?: boolean;
  /** Любая смена числа — короткая яркая вспышка (ответ, шаг, клик). */
  pulse?: number;
}) {
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
    const box = size * 1.7;
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
      target = hover || hotRef.current ? 1.9 : 1;
      if (pulseRef.current !== seenPulse) {
        seenPulse = pulseRef.current;
        energy = Math.max(energy, 3);
      }
      energy += (target - energy) * 0.06;
      // Постоянное дыхание: волны и свечение плавно нарастают и спадают.
      const breath = 1 + 0.2 * Math.sin(t * 1.1) + 0.08 * Math.sin(t * 2.3);
      const e = energy * breath;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      // Мягкое общее свечение за кольцом.
      const halo = ctx.createRadialGradient(c, c, R * 0.5, c, c, R * 2.05);
      halo.addColorStop(0, `rgba(${fr},${fg},${fb},0)`);
      halo.addColorStop(0.4, `rgba(${fr},${fg},${fb},${0.06 + 0.035 * breath * energy})`);
      halo.addColorStop(1, `rgba(${tr},${tg},${tb},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 0.55 * dpr * k;
      ctx.shadowBlur = 10 * dpr * k;
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
      for (let j = 0; j < LINES; j++) {
        ctx.beginPath();
        for (let i = 0; i <= POINTS; i++) {
          const a = (i / POINTS) * Math.PI * 2;
          // Узор волн ещё и медленно вращается (a + t·0.25).
          const aa = a + t * 0.25;
          const wave =
            0.055 * Math.sin(3 * aa + t * 1.1 + j * 0.17) +
            0.04 * Math.sin(5 * aa - t * 1.6 + j * 0.31) +
            0.025 * Math.sin(2 * aa + t * 0.7 - j * 0.12);
          const rr = R * (1 + wave * e) + (j - LINES / 2) * 0.28 * dpr * k;
          const x = c + Math.cos(a) * rr;
          const y = c + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Искры: вспышка → полёт наружу → угасание → новая искра. Еле заметные
      // (Егор: «минимальные, акцент на переливе волн») — мелкие, тусклые,
      // без собственного свечения.
      ctx.shadowBlur = 0;
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
  }, [size, from, to]);

  return (
    <span ref={wrapRef} className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 1.7, height: size * 1.7 }}
      />
    </span>
  );
}
