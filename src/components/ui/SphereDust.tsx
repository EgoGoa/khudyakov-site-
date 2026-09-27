"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { isWelcomeOpen } from "@/lib/welcome-freeze";

// Частицы от сферы Vibe-режима — одна механика на весь сайт (Егор,
// 2026-09-27: «по этой же логике, с этой же интенсивностью»): пятое окошко
// стартового меню, вайб-окно и сфера в вайб-баре.
//
// Мелкие мягкие звёздочки без обводок, почти белые с лёгким оттенком
// палитры. Выходят с внешней стороны кольца сферы, тормозят до спокойного
// дрейфа и расходятся. У каждой своя дальность полёта: большинство гаснет
// недалеко, единицы уходят через всю площадь и за её край — поэтому у сферы
// густо, дальше всё реже. Холст может выступать за родителя на `bleed` px со
// всех сторон: там частицы плавно растворяются, а не обрезаются.
//
// На слабых устройствах пыли нет, на средних её меньше и 30 кадров/с. За
// открытым стартовым окном замирает (lib/welcome-freeze).

const TINTS = ["235,238,255", "245,240,255", "255,255,255", "255,255,255", "200,205,255", "225,200,255", "255,215,225"];

export default function SphereDust({
  orbRef,
  run = true,
  bleed = 0,
  density = 1,
  stretch = [1, 1],
  speed = 1,
  brightness = 1,
  scale = 1,
  className = "",
}: {
  /** Элемент сферы (или обёртка, внутри которой первый span — сама сфера). */
  orbRef: RefObject<HTMLElement | null>;
  run?: boolean;
  /** На сколько px холст выступает за родителя со всех сторон. */
  bleed?: number;
  /** Множитель количества и частоты выпуска. 1 — как в стартовом окошке. */
  density?: number;
  /** Растяжение разлёта по x и y: широкому низкому окошку — [1.7, 0.7]. */
  stretch?: [number, number];
  /** Множитель скорости вылета: маленькой сфере в баре — меньше. */
  speed?: number;
  /** Множитель яркости частиц. */
  brightness?: number;
  /** Множитель размера частиц. */
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [sx, sy] = stretch;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!run || !canvas || !ctx) return;
    const html = document.documentElement;
    if (html.hasAttribute("data-lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mid = html.hasAttribute("data-mid");
    const behindWelcome = !canvas.closest(".welcome-shell");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, ox = 0, oy = 0, or = 26;
    const measure = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    // Центр сферы — отдельно и чаще: окно доезжает на место, сфера меняет
    // место между экранами — холст идёт за ней.
    const locate = () => {
      const r = canvas.getBoundingClientRect();
      // getBoundingClientRect учитывает scale предков — делим обратно на него
      const k = w ? r.width / w : 1;
      const el = orbRef.current;
      const orb = (el?.querySelector("span") as HTMLElement | null) ?? el;
      const o = orb?.getBoundingClientRect();
      if (!o || !o.width) return;
      ox = (o.left + o.width / 2 - r.left) / k;
      oy = (o.top + o.height / 2 - r.top) / k;
      or = (o.width / k) * 0.36;
    };
    measure();
    locate();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);

    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (c: string) => {
      let sp = sprites.get(c);
      if (!sp) {
        sp = document.createElement("canvas");
        sp.width = sp.height = 32;
        const g = sp.getContext("2d")!;
        const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        gr.addColorStop(0, `rgba(${c},1)`);
        gr.addColorStop(0.18, `rgba(${c},0.85)`);
        gr.addColorStop(0.45, `rgba(${c},0.18)`);
        gr.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gr;
        g.fillRect(0, 0, 32, 32);
        sprites.set(c, sp);
      }
      return sp;
    };

    type P = { x: number; y: number; vx: number; vy: number; drift: number; born: number; r: number; b: number; c: string; ph: number; reach: number };
    // В полтора раза меньше прежнего (Егор, 2026-09-27): 140 → 93 частицы.
    const MAX = Math.round((mid ? 40 : 93) * density);
    const RATE = (mid ? 8 : 17) * density;
    const emit = (t: number): P => {
      const a = Math.random() * Math.PI * 2;
      const roll = Math.random();
      const size = roll < 0.7 ? 0.35 + Math.random() * 0.35 : roll < 0.93 ? 0.7 + Math.random() * 0.35 : 1.05 + Math.random() * 0.4;
      const sp = (22 + 55 * Math.random() ** 1.5) * speed;
      return {
        x: ox + Math.cos(a) * or * 1.1,
        y: oy + Math.sin(a) * or * 1.1,
        vx: Math.cos(a) * sp * sx,
        vy: Math.sin(a) * sp * sy,
        drift: (9 + Math.random() * 14) * speed,
        born: t,
        r: size,
        b: (0.75 + Math.random() * 0.25) * brightness,
        c: TINTS[Math.floor(Math.random() * TINTS.length)],
        ph: Math.random() * Math.PI * 2,
        // Большинство — недалеко (степень сжимает к нулю), единицы — через
        // всю площадь и за край.
        reach: or * 1.3 + Math.max(w, h) * Math.random() ** 2.6,
      };
    };

    const ps: P[] = [];
    let acc = 0;
    let prevT = performance.now() / 1000;
    let raf = 0;
    let last = 0;
    let frame = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (behindWelcome && isWelcomeOpen()) return;
      if (mid && now - last < 33) return;
      last = now;
      if (frame++ % 6 === 0) locate();
      const t = now / 1000;
      const dt = Math.min(0.05, t - prevT);
      prevT = t;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      acc += RATE * dt;
      while (acc >= 1) {
        acc -= 1;
        if (ps.length < MAX) ps.push(emit(t));
      }
      const edgeFade = Math.max(bleed, 24);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        const v = Math.hypot(p.vx, p.vy);
        const k = v > p.drift ? 1 - 0.5 * dt : 1;
        const turn = Math.sin(t * 0.35 + p.ph) * 0.4 * dt;
        const vx = (p.vx * Math.cos(turn) - p.vy * Math.sin(turn)) * k;
        const vy = (p.vx * Math.sin(turn) + p.vy * Math.cos(turn)) * k;
        p.vx = vx;
        p.vy = vy;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const edge = Math.min(p.x, p.y, w - p.x, h - p.y);
        const left = p.reach - Math.hypot(p.x - ox, p.y - oy);
        if (edge < 0 || left < 0) {
          ps.splice(i, 1);
          continue;
        }
        // Проявляется у кольца, гаснет на краю своего пути и у края холста.
        const fade = Math.min(1, (t - p.born) * 2) * Math.min(1, edge / edgeFade) * Math.min(1, left / 30);
        const al = p.b * fade * (0.7 + 0.3 * Math.sin(t * 1.6 + p.ph));
        const d = p.r * 5 * scale;
        ctx.globalAlpha = al;
        ctx.drawImage(sprite(p.c), p.x - d / 2, p.y - d / 2, d, d);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [run, orbRef, bleed, density, sx, sy, speed, brightness, scale]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ inset: -bleed, width: `calc(100% + ${bleed * 2}px)`, height: `calc(100% + ${bleed * 2}px)` }}
    />
  );
}
