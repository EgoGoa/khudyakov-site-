"use client";

import { useEffect, useRef, useState } from "react";
import { getTier, onTierChange } from "@/lib/perf-tier";

// Инфографика трёх вводных слайдов вайб-окна (Егор, 2026-09-26: «к каждому
// из трёх блоков — минималистичная стильная инфографика, которая показывает,
// что происходит и для чего это нужно»). Плоская, в палитре окна.
// Подписи частей живут внутри сцены, в её стиле и тоже собираются из
// частиц (Егор: «все что снизу под графикой… давай вовнутрь графики»);
// набраны Unbounded и не мельче 11–12px даже на телефоне.
//
// Моушн-графика (Егор, 2026-09-26, анкетой): сцены рисуются на Canvas, как
// «сердце» панели (NanoSphere). Каждая часть схемы собирается из светящихся
// частиц по очереди слева направо — тот же язык, что у «схлопывания» сферы на
// заставке; частицы тонкие и мягкие, как пыль сферы, и их много, — а дальше
// вся сцена живёт в цикле: по ней проходит световая
// волна, по потокам бегут кометы, сфера вращается и дышит, результат
// достраивается частицами из сферы. На mid/low движение не выключается, а
// облегчается: меньше частиц и 30 кадров/с.

const VIEW_W = 560;
const VIEW_H = 230;
const TAU = Math.PI * 2;
/** Шаг частиц по контуру (в единицах схемы): меньше — плотнее. */
/** high — полная сцена, lite — средние устройства: частиц вдвое меньше. */
const STEP = { high: 3, lite: 5.5 };
/** Период световой волны через всю сцену. */
const WAVE_P = 8;
/** Цикл «вопрос → ответ → вопрос» в брифе. */
const SEQ_P = 4.8;

type RGB = [number, number, number];
type Pt = [number, number];
type Box = [number, number, number, number];

// Глубокий спектр окна: сине-фиолетовый → розовый → коралловый.
const STOPS: [number, RGB][] = [
  [0, [111, 134, 255]],
  [0.45, [176, 124, 255]],
  [0.8, [255, 122, 156]],
  [1, [255, 176, 122]],
];

function pal(u: number): RGB {
  const x = Math.min(1, Math.max(0, u));
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i];
    const [p0, c0] = STOPS[i - 1];
    if (x <= p1) {
      const k = (x - p0) / (p1 - p0);
      return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

type Ctx = CanvasRenderingContext2D;

// Градиенты кэшируются: за кадр их сотни, а у неподвижных частей они
// одинаковые из кадра в кадр. Альфа округляется до 1/32 — глазом не видно.
const GRADS = new WeakMap<Ctx, Map<string, CanvasGradient>>();
function grad(c: Ctx, [x, y, w, h]: Box, alpha = 1) {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 32) / 32;
  let m = GRADS.get(c);
  if (!m) GRADS.set(c, (m = new Map()));
  const key = `${Math.round(x * 2)},${Math.round(y * 2)},${Math.round(w * 2)},${Math.round(h * 2)},${a}`;
  let g = m.get(key);
  if (!g) {
    if (m.size > 600) m.clear();
    g = c.createLinearGradient(x, y, x + w, y + h);
    for (const [p, [r, gg, b]] of STOPS) g.addColorStop(p, `rgba(${r},${gg},${b},${a})`);
    m.set(key, g);
  }
  return g;
}

function rrect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
}

/** Объём элемента — «слои в глубину» (Егор выбрал вариант B): за ним
 *  стоят полупрозрачные копии со сдвигом вверх-вправо, дальняя бледнее. */
function sheets(c: Ctx, x: number, y: number, w: number, h: number, r: number, box: Box, n: number, off: number, accent: boolean, b = 0) {
  for (let k = n; k >= 1; k--) {
    rrect(c, x + off * k, y - off * k, w, h, r);
    c.fillStyle = `rgba(255,255,255,${0.03 / k})`;
    c.fill();
    c.lineWidth = 1;
    c.strokeStyle = accent ? grad(c, box, (0.5 + 0.3 * b) / k) : `rgba(255,255,255,${(0.14 + 0.2 * b) / k})`;
    c.stroke();
  }
}
/** Непрозрачная «стеклянная» основа, чтобы слои сзади не просвечивали. */
const BASE = "rgba(17,15,32,0.94)";

/** Стеклянная карточка с деталями: основа, мягкий градиент сверху вниз,
 *  тонкий блик по верхней кромке и обводка. */
function glass(c: Ctx, x: number, y: number, w: number, h: number, r: number, stroke: string | CanvasGradient, lw = 1, tint = 0.06) {
  rrect(c, x, y, w, h, r);
  c.fillStyle = BASE;
  c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(255,255,255,${tint + 0.04})`);
  g.addColorStop(0.5, `rgba(255,255,255,${tint * 0.5})`);
  g.addColorStop(1, `rgba(255,255,255,${tint * 0.2})`);
  c.fillStyle = g;
  c.fill();
  c.lineWidth = lw;
  c.strokeStyle = stroke;
  c.stroke();
  // Блик по верхней кромке — тонкая линия, гаснущая к краям.
  const hl = c.createLinearGradient(x, 0, x + w, 0);
  hl.addColorStop(0, "rgba(255,255,255,0)");
  hl.addColorStop(0.5, "rgba(255,255,255,0.32)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  c.beginPath();
  c.moveTo(x + r, y + 0.75);
  c.lineTo(x + w - r, y + 0.75);
  c.lineWidth = 0.6;
  c.strokeStyle = hl;
  c.stroke();
}

/** «Строка текста» — две полоски разной длины и яркости. */
function textLine(c: Ctx, x: number, y: number, w: number, a = 0.35, h = 3) {
  rrect(c, x, y, w * 0.62, h, h / 2);
  c.fillStyle = `rgba(255,255,255,${a})`;
  c.fill();
  rrect(c, x + w * 0.66, y, w * 0.34, h, h / 2);
  c.fillStyle = `rgba(255,255,255,${a * 0.5})`;
  c.fill();
}

/** Точки контуров задних слоёв — они тоже собираются частицами. */
function sheetPts(x: number, y: number, w: number, h: number, n: number, off: number, step: number): Pt[] {
  const out: Pt[] = [];
  for (let k = 1; k <= n; k++) out.push(...rectPts(x + off * k, y - off * k, w, h, step * 1.6));
  return out;
}

// Время: позиция в цикле (0..1) и мягкая «синусоида» 0 → 1 → 0, как
// ease-in-out у прежних CSS-циклов.
const cyc = (t: number, p: number, d = 0) => ((((t - d) / p) % 1) + 1) % 1;
const wave = (t: number, p: number, d = 0) => 0.5 - 0.5 * Math.cos(cyc(t, p, d) * TAU);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const backOut = (x: number) => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2;

// Светящаяся точка — заранее нарисованный спрайт, по одному на оттенок
// спектра: drawImage в разы дешевле shadowBlur и радиального градиента.
const HUES = 8;
let SPRITES: HTMLCanvasElement[] | null = null;
function sprites() {
  if (SPRITES) return SPRITES;
  SPRITES = Array.from({ length: HUES + 1 }, (_, i) => {
    const [r, g, b] = i === HUES ? [255, 255, 255] : pal(i / (HUES - 1));
    const s = document.createElement("canvas");
    s.width = s.height = 32;
    const x = s.getContext("2d")!;
    const rg = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    // Тонкое яркое ядро и едва заметный ореол — как пыль у сферы.
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(0.14, `rgba(${r | 0},${g | 0},${b | 0},0.85)`);
    rg.addColorStop(0.36, `rgba(${r | 0},${g | 0},${b | 0},0.16)`);
    rg.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`);
    x.fillStyle = rg;
    x.fillRect(0, 0, 32, 32);
    return s;
  });
  return SPRITES;
}
/** u — оттенок спектра 0..1, или -1 для белого. Альфа — через globalAlpha. */
function dot(c: Ctx, x: number, y: number, r: number, u: number, alpha: number) {
  if (alpha <= 0.01) return;
  const sp = sprites()[u < 0 ? HUES : Math.round(clamp01(u) * (HUES - 1))];
  c.globalAlpha = alpha;
  c.drawImage(sp, x - r * 2, y - r * 2, r * 4, r * 4);
}

// Точки контура, в которые слетаются частицы.
function rectPts(x: number, y: number, w: number, h: number, step: number): Pt[] {
  const out: Pt[] = [];
  const nx = Math.max(2, Math.round(w / step));
  const ny = Math.max(1, Math.round(h / step));
  for (let i = 0; i < nx; i++) out.push([x + (w * i) / nx, y], [x + w - (w * i) / nx, y + h]);
  for (let i = 0; i < ny; i++) out.push([x + w, y + (h * i) / ny], [x, y + h - (h * i) / ny]);
  return out;
}
function circlePts(cx: number, cy: number, r: number, step: number): Pt[] {
  const n = Math.max(8, Math.round((TAU * r) / step));
  return Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * TAU) * r, cy + Math.sin((i / n) * TAU) * r] as Pt);
}
function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 40): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const m = 1 - t;
    return [
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ] as Pt;
  });
}

/** Ломаная с доступом к точке по доле длины. */
function makePath(pts: Pt[]) {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1];
  const at = (u: number): Pt => {
    const d = clamp01(u) * total;
    let i = 1;
    while (i < len.length - 1 && len[i] < d) i++;
    const k = (d - len[i - 1]) / (len[i] - len[i - 1] || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  };
  const sample = (step: number): Pt[] => {
    const n = Math.max(2, Math.round(total / step));
    return Array.from({ length: n + 1 }, (_, i) => at(i / n));
  };
  return { pts, total, at, sample };
}

// ─── Сцена ────────────────────────────────────────────────────────────────
// Егор, 2026-09-26: «3D-шность — в самих элементах», сцена стоит на месте:
// без камеры, наклона, пола и теней. Объём — слои в глубину за каждым
// элементом. Глубина есть только у частиц: каждый элемент собирается своим
// вихрем, пыль закручивается вокруг него и прилетает из глубины.

/** Центр сцены и дистанция взгляда (для глубины частиц). */
const CAM_D = 720;
/** Вписывание сцены в холст с небольшим запасом по краям. */
const FIT = 0.96;

/** Шрифт подписей (Unbounded из next/font), берётся с холста при запуске. */
let FONT = "Unbounded, sans-serif";

type Proj = (x: number, y: number, z: number) => [number, number, number];

/** Что получает часть схемы на кадре: время, силу световой волны (0..1),
 *  свою прозрачность (её надо вернуть в globalAlpha после точек) и
 *  проекцию — ею пользуются «свободные» части вроде потоков. */
type Env = {
  t: number;
  /** Время с начала сборки этой части. */
  lt: number;
  b: number;
  al: number;
  lite: boolean;
  P: Proj;
  /** Запустить частицы по точкам: вихрь сборки (in) или разлёт (out). */
  emit: (pts: Pt[], out?: boolean) => void;
  /** Статичный кадр (слабое устройство или «уменьшить движение»). */
  frozen: boolean;
};

type Item = {
  /** Очередь сборки, как задержки прежних SVG-частей. */
  d: number;
  box: Box;
  /** Глубина слоя: больше — дальше от зрителя. */
  z?: number;
  /** Точки, из которых часть собирается частицами; upx — единиц схемы
   *  в одном CSS-пикселе (для подписей, чтобы шрифт не мельчал). */
  pts: (step: number, upx: number) => Pt[];
  draw: (c: Ctx, e: Env) => void;
  /** Плавание вверх-вниз: [амплитуда, задержка цикла]. */
  float?: [number, number];
  /** Часть живёт в цикле брифа (появилась → держится → рассыпалась). */
  seq?: number;
  /** Часть постоянно достраивается частицами из этой точки [x, y, z]. */
  feed?: [number, number, number];
  /** Не подсвечивается волной (рамка «браузера»). */
  calm?: boolean;
  /** Рисует себя сама через проекцию (потоки между слоями разной глубины). */
  free?: boolean;
  /** Глубина точки контура для свободных частей. */
  zAt?: (x: number) => number;
};

type Particle = {
  it: number;
  sx: number;
  sy: number;
  sz: number;
  tx: number;
  ty: number;
  tz: number;
  t0: number;
  dur: number;
  /** Закрутка вихря (рад): частица подлетает по спирали. */
  spin: number;
  /** Вихрь вокруг элемента: центр и стартовый радиус; 0 — прямой полёт. */
  vortex: 0 | 1;
  vx: number;
  vy: number;
  r0: number;
  size: number;
  u: number;
  /** 0 — слетается к контуру, 1 — рассыпается от него. */
  out: 0 | 1;
};
type Spark = { x: number; y: number; z: number; born: number; life: number; size: number; u: number; vy: number };

function seqAt(p: number): [number, number] {
  if (p < 0.08) return [0, 6];
  if (p < 0.2) {
    const k = easeInOut((p - 0.08) / 0.12);
    return [k, 6 * (1 - k)];
  }
  if (p < 0.8) return [1, 0];
  if (p < 0.94) {
    const k = easeInOut((p - 0.8) / 0.14);
    return [1 - k, -4 * k];
  }
  return [0, -4];
}

const itemStart = (it: Item) => 0.35 + it.d * 0.28;

function runScene(canvas: HTMLCanvasElement, items: Item[], vw = VIEW_W, vh = VIEW_H) {
  const WX = vw / 2;
  const WY = vh / 2;
  // Волна идёт вдоль длинной стороны: на телефоне сцена вертикальная.
  const vertical = vh > vw;
  const c = canvas.getContext("2d");
  if (!c) return () => {};
  // Уровни (Егор, 2026-09-26): low — один готовый кадр без частиц и цикла,
  // mid (lite) — сборка вдвое меньшим числом частиц и тихий цикл 30 к/с без
  // волны, искр и подпитки, high — полная сцена.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let still = reduced || getTier() === "low";
  let lite = getTier() !== "high";
  const step = lite ? STEP.lite : STEP.high;
  const upx = vw / Math.max(160, canvas.clientWidth || vw);
  FONT = getComputedStyle(canvas).getPropertyValue("--font-bebas").trim() || "Unbounded, sans-serif";
  const pts = items.map((it) => it.pts(step, upx));
  const zOf = (i: number, x: number) => (items[i].zAt ? items[i].zAt!(x) : (items[i].z ?? 0));
  // Волна идёт, когда схема собралась целиком.
  const tAll = Math.max(...items.map(itemStart)) + 2.1;

  const parts: Particle[] = [];
  const sparks: Spark[] = [];
  const seqK = items.map(() => -1);
  const seqOut = items.map(() => -1);
  const dy = items.map(() => 0);
  const feedAcc = items.map(() => 0);

  const uOf = (it: Item, x: number, y: number) => {
    const [bx, by, bw, bh] = it.box;
    return clamp01(((x - bx) / (bw || 1)) * 0.7 + ((y - by) / (bh || 1)) * 0.3);
  };

  // Каждый элемент собирается своим вихрем: пыль стоит кольцом вокруг
  // элемента (и в глубине), закручивается в одну сторону и по спирали
  // садится на контур. Соседние элементы крутятся в разные стороны.
  const gather = (i: number, t0: number, spread: number, depth: number, durK: number, list = pts[i], box = items[i].box, dir = i % 2 ? -1 : 1) => {
    const it = items[i];
    const [bx, by, bw, bh] = box;
    const vx = bx + bw / 2;
    const vy = by + bh / 2;
    const R = Math.min(170, Math.max(bw, bh) / 2);
    for (const [tx, ty] of list) {
      const tz = zOf(i, tx);
      parts.push({
        it: i,
        sx: tx,
        sy: ty,
        sz: tz + (Math.random() - 0.3) * depth,
        tx,
        ty,
        tz,
        t0: t0 + Math.random() * 0.45,
        dur: durK * (0.9 + Math.random() * 0.6),
        spin: dir * Math.PI * (1.1 + Math.random() * 1.3),
        vortex: 1,
        vx,
        vy,
        r0: R * (0.8 + Math.random() * 0.7) + spread * (0.3 + Math.random() * 0.4),
        size: 0.55 + Math.random() * 0.6,
        u: uOf(it, tx, ty),
        out: 0,
      });
    }
  };
  // …и рассыпаются от него, когда часть брифа уходит.
  const scatter = (i: number, t0: number, list = pts[i], share = 0.6) => {
    const it = items[i];
    for (const [tx, ty] of list) {
      if (Math.random() > share) continue;
      const a = Math.random() * TAU;
      const dist = 18 + Math.random() * 30;
      const tz = zOf(i, tx);
      parts.push({
        it: i,
        sx: tx,
        sy: ty,
        sz: tz,
        tx: tx + Math.cos(a) * dist,
        ty: ty + Math.sin(a) * dist * 0.6 - 8,
        tz: tz - 40 - Math.random() * 80,
        t0: t0 + Math.random() * 0.2,
        dur: 0.7 + Math.random() * 0.5,
        spin: (Math.random() - 0.5) * 1.2,
        vortex: 0,
        vx: 0,
        vy: 0,
        r0: 0,
        size: 0.4 + Math.random() * 0.5,
        u: uOf(it, tx, ty),
        out: 1,
      });
    }
  };

  if (!still) items.forEach((it, i) => it.seq === undefined && gather(i, itemStart(it), 60, 320, 1.25));

  // Частицы по запросу самой части (сцена, которая трансформируется).
  const emitFor = (i: number) => (list: Pt[], out = false) => {
    if (still || !list.length) return;
    if (out) return scatter(i, lastT, list, 1);
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [x, y] of list) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    gather(i, lastT, 40, 260, 0.9, list, [x0, y0, x1 - x0, y1 - y0], Math.random() < 0.5 ? -1 : 1);
  };

  let scale = 1;
  let lastT = 0;
  // Частица не тоньше ~1 CSS-пикселя, иначе в маленьком окне вихрь не виден.
  let minR = 0.9;
  // Взгляд неподвижен: глубина только уменьшает то, что дальше.
  const P: Proj = (x, y, z) => {
    const s = CAM_D / Math.max(80, CAM_D + z);
    return [WX + (x - WX) * s * FIT, WY + (y - WY) * s * FIT, s];
  };

  const draw = (t: number) => {
    const dt = Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.setTransform(scale, 0, 0, scale, 0, 0);
    c.lineCap = "round";
    c.lineJoin = "round";

    const waveX = t > tAll ? cyc(t - tAll, WAVE_P) * ((vertical ? vh : vw) + 280) - 140 : -1e4;
    const waveOn = lite ? 0 : clamp01((t - tAll) / 1);
    const alpha = items.map(() => 0);
    const seqY = items.map(() => 0);
    const pop = items.map(() => 1);
    const bs = items.map(() => 0);

    // Состояние частей на кадре.
    items.forEach((it, i) => {
      const start = itemStart(it);
      const [bx, by, bw, bh] = it.box;
      dy[i] = it.float ? -it.float[0] * wave(t, 5, it.float[1]) : 0;
      if (it.seq !== undefined) {
        const local = t - start - it.seq;
        if (local < 0) return;
        const k = Math.floor(local / SEQ_P);
        if (!still && k !== seqK[i]) {
          seqK[i] = k;
          gather(i, start + it.seq + k * SEQ_P + 0.02, 30, 140, 0.6);
        }
        const p = cyc(local, SEQ_P);
        if (!still && p >= 0.8 && seqOut[i] !== k) {
          seqOut[i] = k;
          scatter(i, t);
        }
        const [sa, yy] = still ? [1, 0] : seqAt(p);
        alpha[i] = sa;
        seqY[i] = yy;
        pop[i] = 0.94 + 0.06 * sa;
      } else {
        const raw = still ? 1 : clamp01((t - start - 1.05) / 0.7);
        alpha[i] = raw;
        pop[i] = 0.84 + 0.16 * backOut(raw);
      }
      bs[i] = it.calm ? 0 : Math.exp(-((((vertical ? by + bh / 2 : bx + bw / 2) - waveX) / 70) ** 2)) * waveOn;
    });

    // Элементы — в порядке объявления, дальние слои рисуют себя сами.
    const order = items.map((_, i) => ({ i, d: 0 }));

    for (const { i, d } of order) {
      const it = items[i];
      const a = alpha[i];
      if (a <= 0.005) continue;
      const [bx, by, bw, bh] = it.box;
      const b = bs[i];
      const fog = 1 + d;
      const cx = bx + bw / 2;
      const cyW = by + bh / 2;
      c.save();
      c.globalAlpha = a * fog;
      if (it.free) {
        it.draw(c, { t, lt: t - itemStart(it), b, al: a * fog, lite, P, emit: emitFor(i), frozen: still });
      } else {
        const z = it.z ?? 0;
        const [p0x, p0y] = P(cx, cyW, z);
        const [p1x, p1y] = P(cx + 1, cyW, z);
        const [p2x, p2y] = P(cx, cyW + 1, z);
        const ax = p1x - p0x;
        const ay = p1y - p0y;
        const bx2 = p2x - p0x;
        const by2 = p2y - p0y;
        c.transform(ax, ay, bx2, by2, p0x - ax * cx - bx2 * cyW, p0y - ay * cx - by2 * cyW);
        c.translate(cx, cyW + dy[i] + seqY[i]);
        c.scale(pop[i], pop[i]);
        c.translate(-cx, -cyW);
        it.draw(c, { t, lt: t - itemStart(it), b, al: a * fog, lite, P, emit: emitFor(i), frozen: still });
      }
      c.restore();

      if (still || a < 1) continue;
      // Волна: по контуру части вспыхивают искры.
      const pp = pts[i];
      const rate = 9 * b + 0.3;
      if (!lite && Math.random() < rate * dt && pp.length) {
        const [x, y] = pp[(Math.random() * pp.length) | 0];
        sparks.push({ x, y: y + dy[i] + seqY[i], z: zOf(i, x), born: t, life: 0.8 + Math.random() * 0.9, size: 0.6 + Math.random() * 0.9, u: uOf(it, x, y), vy: -6 - Math.random() * 8 });
      }
      // Результат постоянно достраивается частицами из сферы.
      if (it.feed && !lite) {
        feedAcc[i] += (lite ? 4 : 11) * dt;
        while (feedAcc[i] >= 1 && pp.length) {
          feedAcc[i] -= 1;
          const [tx, ty] = pp[(Math.random() * pp.length) | 0];
          parts.push({
            it: i,
            sx: it.feed[0] + (Math.random() - 0.5) * 8,
            sy: it.feed[1] + (Math.random() - 0.5) * 8,
            sz: it.feed[2],
            tx,
            ty,
            tz: it.z ?? 0,
            t0: t,
            dur: 0.9 + Math.random() * 0.6,
            spin: (Math.random() - 0.5) * 3,
            vortex: 0,
            vx: 0,
            vy: 0,
            r0: 0,
            size: 0.4 + Math.random() * 0.45,
            u: uOf(it, tx, ty),
            out: 0,
          });
        }
      }
    }

    // Частицы и искры — поверх, в режиме сложения света.
    c.globalCompositeOperation = "lighter";
    for (let n = parts.length - 1; n >= 0; n--) {
      const p = parts[n];
      const age = t - p.t0;
      if (age < 0) continue;
      const k = age / p.dur;
      const tail = 0.45;
      if (k > 1 + tail / p.dur) {
        parts.splice(n, 1);
        continue;
      }
      const up = dy[p.it] + seqY[p.it];
      const ee = p.out ? easeOut(clamp01(k)) : easeInOut(clamp01(k));
      const tx = p.tx;
      const ty = p.ty + up;
      const tz = p.tz;
      const sy0 = p.sy + (p.out ? up : 0);
      const rest = 1 - ee;
      let wx: number;
      let wy: number;
      if (p.vortex) {
        // Вихрь вокруг элемента: угол и радиус частицы относительно центра
        // элемента плавно сходятся к её точке на контуре — спираль внутрь.
        const cx0 = p.vx;
        const cy0 = p.vy + up;
        const rT = Math.hypot(tx - cx0, ty - cy0);
        const aT = Math.atan2(ty - cy0, tx - cx0);
        const a = aT + p.spin * rest;
        const r = rT + (p.r0 - rT) * rest;
        wx = cx0 + Math.cos(a) * r;
        wy = cy0 + Math.sin(a) * r * 0.8;
      } else {
        // Прямой полёт с лёгкой закруткой (рассыпание, подпитка из сферы).
        const ang = p.spin * rest;
        const ox = p.sx - tx;
        const oy = sy0 - ty;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        wx = tx + (ox * ca - oy * sa) * rest;
        wy = ty + (ox * sa + oy * ca) * rest;
      }
      const [x, y, s] = P(wx, wy, p.sz + (tz - p.sz) * ee);
      let al: number;
      let r = p.size * s;
      if (p.out) {
        al = 0.8 * (1 - clamp01(k));
      } else if (k <= 1) {
        al = 0.2 + 0.8 * clamp01(k * 1.4);
      } else {
        // Мягкая вспышка в момент, когда частица встала на место, и угасание.
        const f = (age - p.dur) / tail;
        al = 1 - f;
        r *= 1 + 0.6 * (1 - f) * (1 - f);
      }
      dot(c, x, y, Math.max(r, minR), p.u, al * 0.85);
    }
    const cap = lite ? 20 : 50;
    if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    for (let n = sparks.length - 1; n >= 0; n--) {
      const s = sparks[n];
      const k = (t - s.born) / s.life;
      if (k >= 1) {
        sparks.splice(n, 1);
        continue;
      }
      const [x, y, ps] = P(s.x, s.y + s.vy * k * s.life, s.z);
      dot(c, x, y, s.size * ps * (0.6 + 0.4 * Math.sin(k * Math.PI)), s.u, Math.sin(k * Math.PI) * 0.85);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // Полное разрешение ретины на всех уровнях: сцена небольшая, а в 1x
    // тонкие линии и пыль мылятся (Егор: «графика не качественная»).
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    scale = canvas.width / vw;
    minR = (1.3 * vw) / Math.max(1, w);
    if (still) draw(60);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  let raf = 0;
  const offTier = onTierChange((tier) => {
    lite = tier !== "high";
    // Устройство не справилось и опустилось до low — замираем на готовом
    // кадре и отпускаем процессор.
    if (tier === "low" && !still) {
      still = true;
      cancelAnimationFrame(raf);
      parts.length = 0;
      sparks.length = 0;
    }
    resize();
  });

  if (!still) {
    const start = performance.now();
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // На mid/low — 30 кадров/с: движение то же, нагрузка вдвое меньше.
      if (lite && now - last < 33) return;
      last = now;
      draw((now - start) / 1000);
    };
    raf = requestAnimationFrame(loop);
  }
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    offTier();
  };
}

/** Сцена; на телефоне (≤ 480px) — своя вертикальная раскладка, если есть. */
type SceneMobile = { build: () => Item[]; w: number; h: number };
const PHONE = "(max-width: 480px)";

function Scene({ build, mobile }: { build: () => Item[]; mobile?: SceneMobile }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const m = phone && mobile ? mobile : null;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Подписи собираются из частиц по форме букв — ждём шрифт.
    let dispose = () => {};
    let dead = false;
    document.fonts.ready.then(() => {
      if (!dead) dispose = m ? runScene(canvas, m.build(), m.w, m.h) : runScene(canvas, build());
    });
    return () => {
      dead = true;
      dispose();
    };
  }, [build, m]);
  return (
    // На телефоне сцена выходит на всю ширину окна — поля окна ей не нужны.
    <div className={`vibe-info relative w-full${phone ? " vibe-info--bleed" : ""}`} style={{ aspectRatio: m ? `${m.w} / ${m.h}` : `${VIEW_W} / ${VIEW_H}` }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}

// ─── Части схем ───────────────────────────────────────────────────────────

/** Мини-страница с деталями: шапка с точками меню, заголовок, блоки
 *  контента (иконка + строки текста). У страницы-результата (accent) —
 *  градиент, свечение и пробегающая строка сборки. */
function page(x: number, y: number, w: number, h: number, o: { rows?: number; accent?: boolean; d: number; z?: number; float?: [number, number]; feed?: [number, number, number] }): Item {
  const rows = o.rows ?? 4;
  const pad = 7;
  const head = 14;
  const rh = (h - pad * 2 - head - (rows - 1) * 5) / rows;
  const rowsY = Array.from({ length: rows }, (_, i) => y + pad + head + i * (rh + 5));
  const box: Box = [x, y, w, h];
  const ph = (x % 7) * 0.3;
  const off = Math.max(4, Math.min(w, h) * 0.06);
  return {
    d: o.d,
    box,
    z: o.z,
    float: o.float,
    feed: o.feed,
    pts: (s) => [...rectPts(x, y, w, h, s), ...rowsY.flatMap((ry) => rectPts(x + pad, ry, w - pad * 2, rh, s * 1.8)), ...sheetPts(x, y, w, h, 2, off, s)],
    draw(c, { t, b }) {
      sheets(c, x, y, w, h, 9, box, 2, off, !!o.accent, b);
      if (o.accent) {
        rrect(c, x, y, w, h, 9);
        c.lineWidth = 7;
        c.strokeStyle = grad(c, box, 0.1 + 0.3 * b + 0.06 * wave(t, 2.8));
        c.stroke();
      }
      glass(c, x, y, w, h, 9, o.accent ? grad(c, box, 1) : `rgba(255,255,255,${0.18 + 0.4 * b})`, o.accent ? 1.6 + 0.8 * b : 1, 0.05 + 0.04 * b);
      // Шапка: логотип-точка, заголовок, три точки меню справа.
      c.beginPath();
      c.arc(x + pad + 2.5, y + pad + 2.5, 2.5, 0, TAU);
      c.fillStyle = o.accent ? grad(c, box, 1) : "rgba(255,255,255,0.5)";
      c.fill();
      rrect(c, x + pad + 8, y + pad + 1, w * 0.3 * (0.55 + 0.45 * wave(t, 3.6, ph)), 3.2, 1.6);
      c.fillStyle = o.accent ? grad(c, box, 1) : `rgba(255,255,255,${0.35 + 0.3 * b})`;
      c.fill();
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.arc(x + w - pad - 1.5 - k * 4.5, y + pad + 2.5, 1.1, 0, TAU);
        c.fillStyle = "rgba(255,255,255,0.4)";
        c.fill();
      }
      c.beginPath();
      c.moveTo(x + 4, y + pad + 8.5);
      c.lineTo(x + w - 4, y + pad + 8.5);
      c.lineWidth = 0.5;
      c.strokeStyle = "rgba(255,255,255,0.12)";
      c.stroke();
      rowsY.forEach((ry, i) => {
        const k = wave(t, 4.5, i * 0.35 + (x % 5) * 0.2);
        const bw = w - pad * 2;
        rrect(c, x + pad, ry, bw, rh, 4);
        c.fillStyle = o.accent ? grad(c, box, 0.12 + 0.3 * k + 0.2 * b) : `rgba(255,255,255,${0.05 + 0.04 * wave(t, 4, i * 0.35 + ph) + 0.08 * b})`;
        c.fill();
        c.lineWidth = 0.5;
        c.strokeStyle = o.accent ? grad(c, box, 0.35 + 0.3 * k) : "rgba(255,255,255,0.1)";
        c.stroke();
        // Внутри блока: иконка-плитка и строки текста.
        const ic = Math.min(rh - 6, 12);
        if (ic > 4) {
          rrect(c, x + pad + 3, ry + (rh - ic) / 2, ic, ic, 3);
          c.fillStyle = o.accent ? grad(c, [x + pad + 3, ry, ic, ic], 0.9) : "rgba(255,255,255,0.22)";
          c.fill();
          const tx = x + pad + 6 + ic;
          const tw = bw - ic - 10;
          if (rh > 12) {
            textLine(c, tx, ry + rh / 2 - 4, tw * (0.9 - (i % 2) * 0.2), o.accent ? 0.65 : 0.32, 2.4);
            textLine(c, tx, ry + rh / 2 + 1.5, tw * (0.6 + (i % 3) * 0.1), o.accent ? 0.35 : 0.18, 2);
          } else textLine(c, tx, ry + rh / 2 - 1.2, tw * 0.8, o.accent ? 0.55 : 0.28, 2.4);
        }
      });
      if (o.accent) {
        // Строка сборки сверху вниз — страница «печатается».
        const p = cyc(t, 3.2, 0.4);
        if (p < 0.55) {
          const sy = y + h * easeInOut(p / 0.55);
          c.save();
          rrect(c, x, y, w, h, 9);
          c.clip();
          const g = c.createLinearGradient(0, sy - 18, 0, sy + 1);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(1, "rgba(255,255,255,0.22)");
          c.fillStyle = g;
          c.fillRect(x, sy - 18, w, 19);
          c.fillStyle = "rgba(255,255,255,0.7)";
          c.fillRect(x, sy, w, 0.8);
          c.restore();
        }
      }
    },
  };
}

/** Частицы внутри сферы: три спиральных рукава медленно крутятся, пыль
 *  рождается у центра, по спирали уходит к кольцу и понемногу вылетает
 *  наружу, растворяясь (Егор: «внутри… по кругу, спирали… постепенно
 *  выходят, не сильно много, не сильно мало»). */
function spiral(c: Ctx, cx: number, cy: number, r: number, t: number, al: number, n: number) {
  for (let i = 0; i < n; i++) {
    const arm = i % 3;
    const p = cyc(t, 4.2, (i / n) * 4.2);
    const rr = r * (0.08 + 1.5 * p);
    const a = (arm * TAU) / 3 + p * 4.2 + t * 0.5;
    const fade = Math.sin(Math.PI * Math.min(1, p * 1.1)) * (p > 0.62 ? 1 - (p - 0.62) / 0.38 : 1);
    dot(c, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.55 + 0.5 * (1 - p), (arm / 2) * 0.8 + 0.1, al * 0.85 * fade);
  }
}

/** Кольцо-сфера в центре схем: дыхание ореола, пульс кольца, вращение
 *  пунктира и встречных дуг, три искры на орбите. */
function orb(cx: number, cy: number, r: number, d: number, z = 0): Item {
  const box: Box = [cx - r, cy - r, r * 2, r * 2];
  const local: Box = [-r, -r, r * 2, r * 2];
  return {
    d,
    box,
    z,
    pts: (s) => [...circlePts(cx, cy, r, s), ...circlePts(cx, cy, r - 5, s * 1.6)],
    draw(c, { t, b, al, lite }) {
      const br = wave(t, 3.2);
      const hr = r * (1.8 + 0.3 * br + 0.5 * b);
      const g = c.createRadialGradient(cx, cy, r * 0.2, cx, cy, hr);
      g.addColorStop(0, `rgba(176,124,255,${0.14 + 0.14 * br + 0.3 * b})`);
      g.addColorStop(0.55, `rgba(255,122,156,${0.05 + 0.05 * br + 0.12 * b})`);
      g.addColorStop(1, "rgba(176,124,255,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, hr, 0, TAU);
      c.fill();
      // Объём сферы — внешние слои-кольца.
      for (let k = 2; k >= 1; k--) {
        c.beginPath();
        c.arc(cx, cy, r + 6 * k, 0, TAU);
        c.lineWidth = 1;
        c.strokeStyle = grad(c, box, (0.32 + 0.2 * b) / k);
        c.stroke();
      }
      c.beginPath();
      c.arc(cx, cy, r, 0, TAU);
      c.lineWidth = 8;
      c.strokeStyle = grad(c, box, 0.08 + 0.3 * b);
      c.stroke();
      c.lineWidth = 2.2 + b;
      c.strokeStyle = grad(c, box, 0.45 + 0.55 * wave(t, 2.8));
      c.stroke();
      // Шкала-циферблат вокруг кольца: тонкие риски, каждая пятая длиннее.
      c.save();
      c.translate(cx, cy);
      c.rotate((-t * TAU) / 40);
      c.lineWidth = 0.6;
      c.strokeStyle = grad(c, local, 0.45);
      c.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU;
        const l = i % 6 === 0 ? 4 : 2;
        c.moveTo(Math.cos(a) * (r + 15), Math.sin(a) * (r + 15));
        c.lineTo(Math.cos(a) * (r + 15 + l), Math.sin(a) * (r + 15 + l));
      }
      c.stroke();
      c.restore();
      // Мягкое ядро.
      const core = c.createRadialGradient(cx, cy, 0, cx, cy, r - 6);
      core.addColorStop(0, `rgba(255,255,255,${0.1 + 0.06 * br})`);
      core.addColorStop(0.5, "rgba(176,124,255,0.06)");
      core.addColorStop(1, "rgba(176,124,255,0)");
      c.fillStyle = core;
      c.beginPath();
      c.arc(cx, cy, r - 6, 0, TAU);
      c.fill();
      c.save();
      c.translate(cx, cy);
      c.rotate((t * TAU) / 12);
      c.beginPath();
      c.arc(0, 0, r - 5, 0, TAU);
      c.setLineDash([3, 7]);
      c.lineWidth = 1;
      c.strokeStyle = grad(c, local, 0.9);
      c.stroke();
      c.setLineDash([]);
      c.rotate(-(t * TAU) / 12 * 2.8);
      c.lineWidth = 1.6;
      c.strokeStyle = grad(c, local, 0.85);
      for (let i = 0; i < 2; i++) {
        c.beginPath();
        c.arc(0, 0, r - 10, i * Math.PI, i * Math.PI + 1.2);
        c.stroke();
      }
      c.restore();
      c.globalCompositeOperation = "lighter";
      spiral(c, cx, cy, r, t, al, lite ? 12 : 24);
      for (let i = 0; i < 3; i++) {
        const a = t * (0.9 + i * 0.3) + (i * TAU) / 3;
        dot(c, cx + Math.cos(a) * (r + 5), cy + Math.sin(a) * (r + 5), 1.8 + 1.4 * b, i / 2, al * (0.55 + 0.45 * Math.sin(t * 2 + i)));
      }
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = al;
    },
  };
}

/** Пунктирный путь и бегущая по нему комета с хвостом — поток между слоями.
 *  Концы потока лежат на разной глубине (z0 → z1), поэтому он рисуется
 *  через проекцию точка за точкой, а не плоским слоем. */
function flow(line: Pt[], d: number, delay: number, z0: number, z1: number): Item {
  const P0 = makePath(line);
  const xs = line.map((p) => p[0]);
  const ys = line.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const w = Math.max(...xs) - x0 || 1;
  const box: Box = [x0, Math.min(...ys), w, Math.max(...ys) - Math.min(...ys)];
  const zAt = (x: number) => z0 + (z1 - z0) * clamp01((x - x0) / w);
  return {
    d,
    box,
    free: true,
    zAt,
    pts: (s) => P0.sample(s * 1.2),
    draw(c, { t, b, al, lite, P }) {
      c.beginPath();
      line.forEach(([x, y], i) => {
        const [px, py] = P(x, y, zAt(x));
        if (i) c.lineTo(px, py);
        else c.moveTo(px, py);
      });
      c.setLineDash([2, 4]);
      c.lineWidth = 1;
      c.strokeStyle = `rgba(255,255,255,${0.22 + 0.35 * b})`;
      c.stroke();
      c.setLineDash([]);
      // Узлы на концах потока — кольцо с точкой.
      for (const [ex, ey] of [line[0], line[line.length - 1]]) {
        const [px, py] = P(ex, ey, zAt(ex));
        c.beginPath();
        c.arc(px, py, 2.4, 0, TAU);
        c.lineWidth = 0.7;
        c.strokeStyle = "rgba(255,255,255,0.45)";
        c.stroke();
        c.beginPath();
        c.arc(px, py, 0.9, 0, TAU);
        c.fillStyle = "rgba(255,255,255,0.8)";
        c.fill();
      }
      c.globalCompositeOperation = "lighter";
      const head = cyc(t, 2.4, delay);
      const n = lite ? 7 : 12;
      for (let k = 0; k < n; k++) {
        const u = head - k * 0.014;
        if (u < 0) break;
        const [wx, wy] = P0.at(u);
        const [px, py, s] = P(wx, wy, zAt(wx));
        const f = 1 - k / n;
        dot(c, px, py, (0.8 + 1.8 * f) * (1 + 0.5 * b) * s, u, al * f);
      }
      if (!lite) {
        for (let i = 0; i < 2; i++) {
          const u = cyc(t, 3.6, delay + 0.5 + i * 1.7);
          const [wx, wy] = P0.at(u);
          const [px, py, s] = P(wx, wy, zAt(wx));
          dot(c, px, py, 1.1 * s, u, al * 0.5 * Math.sin(u * Math.PI));
        }
      }
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = al;
    },
  };
}


// ─── Подписи внутри сцены ─────────────────────────────────────────────────

// Заголовки подписей — в разных фирменных градиентах направлений сайта
// (SMM, сайты, контент, AI — как PAGE_GRADIENT), строки под ними белые.
const LABEL_GRADS: [string, string][] = [
  ["#a855f7", "#38bdf8"],
  ["#ff4fd8", "#00d2ff"],
  ["#ff4fd8", "#ff6a3d"],
  ["#c8f169", "#10b981"],
];
/** Высота полосы подписей в сцене (единицы схемы). */
const LABEL_H = 50;

type Line = { text: string; y: number; size: number; head: boolean };

function wrap(c: Ctx, text: string, maxW: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && c.measureText(next).width > maxW) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

/** Подпись части: заголовок градиентом направления и строка белым. Стоит в
 *  плоскости своей части (та же глубина) и собирается из частиц по форме
 *  букв. Кегль задан в CSS-пикселях, поэтому на телефоне не мельчает; если
 *  строка не влезает по высоте, она уходит — заголовок остаётся всегда. */
function label(cx: number, y: number, maxW: number, head: string, line: string, gi: number, o: { d: number; z?: number; hs?: number; ls?: number }): Item {
  let lines: Line[] = [];
  const [g0, g1] = LABEL_GRADS[gi % LABEL_GRADS.length];
  const box: Box = [cx - maxW / 2, y, maxW, LABEL_H];
  const fontOf = (l: Line) => `${l.head ? 800 : 600} ${l.size}px ${FONT}`;
  const BW = maxW + 20;
  let bmp: HTMLCanvasElement | null = null;
  let bmpRes = 0;
  const layout = (upx: number) => {
    const m = document.createElement("canvas").getContext("2d")!;
    const hs = (o.hs ?? 12) * upx;
    const ls = (o.ls ?? 10.5) * upx;
    const out: Line[] = [];
    let yy = 0;
    m.font = `800 ${hs}px ${FONT}`;
    for (const t of wrap(m, head.toUpperCase(), maxW)) {
      out.push({ text: t, y: yy, size: hs, head: true });
      yy += hs * 1.2;
    }
    yy += 3 * upx;
    m.font = `600 ${ls}px ${FONT}`;
    for (const t of wrap(m, line, maxW)) {
      if (yy + ls > LABEL_H) break;
      out.push({ text: t, y: yy, size: ls, head: false });
      yy += ls * 1.3;
    }
    return out;
  };
  const paint = (c: Ctx, ox: number, oy: number, a = 1) => {
    c.textAlign = "center";
    c.textBaseline = "top";
    for (const l of lines) {
      c.font = fontOf(l);
      if (l.head) {
        const w = c.measureText(l.text).width;
        const g = c.createLinearGradient(ox - w / 2, 0, ox + w / 2, 0);
        g.addColorStop(0, g0);
        g.addColorStop(1, g1);
        c.fillStyle = g;
      } else c.fillStyle = `rgba(255,255,255,${a})`;
      c.fillText(l.text, ox, oy + l.y);
    }
  };
  return {
    d: o.d,
    z: o.z,
    box,
    pts(step, upx) {
      lines = layout(upx);
      // Форма букв → точки: рисуем подпись во временный холст и берём
      // непрозрачные пиксели с шагом.
      const res = 2;
      const W = maxW + 20;
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(W * res);
      cv.height = Math.ceil(LABEL_H * res);
      const x = cv.getContext("2d", { willReadFrequently: true })!;
      x.scale(res, res);
      paint(x, W / 2, 0);
      const data = x.getImageData(0, 0, cv.width, cv.height).data;
      const out: Pt[] = [];
      const gap = Math.max(1.4, step * 0.62);
      for (let py = 0; py < LABEL_H; py += gap)
        for (let px = 0; px < W; px += gap) {
          const jx = px + (Math.random() - 0.5) * gap * 0.6;
          const jy = py + (Math.random() - 0.5) * gap * 0.6;
          const i = (Math.round(jy * res) * cv.width + Math.round(jx * res)) * 4 + 3;
          if (data[i] > 110) out.push([cx - W / 2 + jx, y + jy]);
        }
      return out;
    },
    draw(c, { b }) {
      // Подпись рисуется из готовой картинки: fillText каждый кадр дорогой.
      const res = Math.max(1, Math.round(c.getTransform().a * 2) / 2);
      if (!bmp || bmpRes !== res) {
        bmpRes = res;
        bmp = document.createElement("canvas");
        bmp.width = Math.ceil(BW * res);
        bmp.height = Math.ceil(LABEL_H * res);
        const x = bmp.getContext("2d")!;
        x.scale(res, res);
        paint(x, BW / 2, 0);
      }
      c.drawImage(bmp, cx - BW / 2, y, BW, LABEL_H);
      if (b > 0.05) {
        // Волна подсвечивает подпись мягким свечением.
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha *= 0.35 * b;
        c.drawImage(bmp, cx - BW / 2, y, BW, LABEL_H);
        c.restore();
      }
    },
  };
}

// ─── 01 — Что такое Vibe-режим ────────────────────────────────────────────
// Страницы сайта (у каждой — слои в глубину); потоки из них сходятся в
// сферу, и из неё частицами собирается одна страница под тебя.
// Всё на одной оси y = 85: центр левой группы, сфера, правая страница.
const WHAT_IN = [52, 74, 96, 118];
const WHAT_OUT = [37, 69, 101, 133];
const buildWhat = (): Item[] => [
  ...[0, 1, 2, 3].map((i) => page(40 + i * 26, 32 + (i % 2) * 14, 62, 92, { rows: 3, d: i * 0.4, float: [4, i * 0.6] })),
  ...WHAT_IN.map((y, i) => flow(bezier([186, y], [222, y], [228, 85], [254, 85]), 1.8 + i * 0.1, i * 0.3, 0, 0)),
  orb(280, 85, 26, 2.3),
  ...WHAT_OUT.map((y, i) => flow(bezier([306, 85], [336, 85], [350, y], [390, y]), 2.9 + i * 0.1, 1.2 + i * 0.3, 0, 0)),
  page(394, 12, 112, 146, { accent: true, d: 3.4, float: [4, 1.2], feed: [306, 85, 0] }),
  label(110, 176, 176, "Весь сайт", "Десятки страниц", 0, { d: 4.6}),
  label(280, 176, 150, "Vibe-режим", "Отбирает нужное тебе", 1, { d: 4.9}),
  label(450, 176, 170, "Одна страница", "Только твой проект", 2, { d: 5.2}),
];

// Телефон: та же композиция, но сцена уже (300 вместо 560 единиц) —
// элементы крупнее на узком экране, а окно помещается без прокрутки.
// Подписи на одной линии под центрами своих частей.
const PHONE_LABEL = { hs: 10.5, ls: 9.5 };
const buildWhatPhone = (): Item[] => [
  ...[0, 1, 2, 3].map((i) => page(12 + i * 13, 30 + (i % 2) * 6, 34, 50, { rows: 3, d: i * 0.4, float: [2, i * 0.6] })),
  ...[42, 52, 64, 74].map((y, i) => flow(bezier([92, y], [110, y], [112, 58], [130, 58]), 1.8 + i * 0.1, i * 0.3, 0, 0)),
  orb(150, 58, 20, 2.3),
  ...[28, 48, 68, 88].map((y, i) => flow(bezier([170, 58], [186, 58], [190, y], [208, y]), 2.9 + i * 0.1, 1.2 + i * 0.3, 0, 0)),
  page(210, 6, 78, 104, { accent: true, d: 3.4, float: [2, 1.2], feed: [170, 58, 0] }),
  label(49, 124, 98, "Весь сайт", "Десятки страниц", 0, { d: 4, ...PHONE_LABEL }),
  label(150, 124, 98, "Vibe-режим", "Отбирает нужное тебе", 1, { d: 4.3, ...PHONE_LABEL }),
  label(249, 124, 98, "Лендинг", "Только твой проект", 2, { d: 4.6, ...PHONE_LABEL }),
];
const WHAT_PHONE: SceneMobile = { build: buildWhatPhone, w: 300, h: 180 };

export function InfoWhat() {
  return <Scene build={buildWhat} mobile={WHAT_PHONE} />;
}

// ─── 02 — Как это работает ────────────────────────────────────────────────
// Бриф в цикле (вопрос → выбранный ответ → следующий вопрос; каждый пузырь
// собирается вихрем частиц и рассыпается) → сборка в сфере → лендинг.
function bubble(x: number, y: number, w: number, h: number, seq: number, o: { bar: [number, number, number]; answer?: boolean; fill: number; line: number }): Item {
  const box: Box = [x, y, w, h];
  return {
    d: 0,
    seq,
    box,
    float: [4, 0],
    pts: (s) => [...rectPts(x, y, w, h, s), ...sheetPts(x, y, w, h, 1, 5, s)],
    draw(c, { t, b }) {
      sheets(c, x, y, w, h, h / 2, box, 1, 5, !!o.answer, b);
      glass(c, x, y, w, h, h / 2, o.answer ? grad(c, box, 1) : `rgba(255,255,255,${o.line + 0.35 * b})`, o.answer ? 1.5 : 1, o.fill + 0.04 * b);
      if (!o.answer) {
        // Аватар «собеседника» слева в пузыре вопроса.
        c.beginPath();
        c.arc(x + h / 2, y + h / 2, h / 2 - 6, 0, TAU);
        c.fillStyle = grad(c, [x, y, h, h], 0.55);
        c.fill();
      }
      if (o.answer) {
        const cx = x + 18;
        const cy = y + h / 2;
        c.beginPath();
        c.arc(cx, cy, 7, 0, TAU);
        c.fillStyle = grad(c, [cx - 7, cy - 7, 14, 14], 1);
        c.fill();
        c.beginPath();
        c.moveTo(cx - 3.5, cy);
        c.lineTo(cx - 1, cy + 2.5);
        c.lineTo(cx + 3.5, cy - 2.5);
        c.lineWidth = 1.6;
        c.strokeStyle = "#fff";
        c.stroke();
      }
      const [bx, bw, by] = o.bar;
      rrect(c, bx, by, bw * (0.55 + 0.45 * wave(t, 3.6, seq)), 6, 3);
      c.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * b})`;
      c.fill();
    },
  };
}

const buildHow = (): Item[] => [
  bubble(46, 31, 96, 30, 0, { bar: [74, 52, 43], fill: 0.07, line: 0.16 }),
  bubble(70, 73, 96, 30, 0.8, { bar: [102, 48, 85], answer: true, fill: 0.04, line: 0 }),
  bubble(46, 115, 70, 24, 1.6, { bar: [68, 36, 124], fill: 0.05, line: 0.12 }),
  flow([[186, 85], [250, 85]], 1, 0, 0, 0),
  orb(280, 85, 28, 1.5),
  flow([[310, 85], [384, 85]], 2, 0.6, 0, 0),
  page(392, 15, 116, 140, { accent: true, d: 2.5, float: [4, 0.8], feed: [308, 85, 0] }),
  label(110, 176, 170, "Бриф", "3 минуты, по вопросу", 0, { d: 3.2}),
  label(280, 176, 150, "Сборка", "Под задачу и бюджет", 1, { d: 3.5}),
  label(450, 176, 170, "Лендинг", "Открывается сразу", 2, { d: 3.8}),
];

// Телефон: бриф → сборка → лендинг в узкой сцене, подписи под частями.
const buildHowPhone = (): Item[] => [
  bubble(8, 18, 80, 24, 0, { bar: [30, 42, 28], fill: 0.07, line: 0.16 }),
  bubble(22, 48, 80, 24, 0.8, { bar: [48, 38, 58], answer: true, fill: 0.04, line: 0 }),
  bubble(8, 78, 62, 20, 1.6, { bar: [26, 30, 85], fill: 0.05, line: 0.12 }),
  flow([[106, 58], [130, 58]], 1, 0, 0, 0),
  orb(150, 58, 20, 1.5),
  flow([[170, 58], [206, 58]], 2, 0.6, 0, 0),
  page(210, 6, 78, 104, { accent: true, d: 2.5, float: [2, 0.8], feed: [170, 58, 0] }),
  label(55, 124, 98, "Бриф", "3 минуты, по вопросу", 0, { d: 3.2, ...PHONE_LABEL }),
  label(150, 124, 98, "Сборка", "Под задачу и бюджет", 1, { d: 3.5, ...PHONE_LABEL }),
  label(249, 124, 98, "Лендинг", "Открывается сразу", 2, { d: 3.8, ...PHONE_LABEL }),
];
const HOW_PHONE: SceneMobile = { build: buildHowPhone, w: 300, h: 180 };

export function InfoHow() {
  return <Scene build={buildHow} mobile={HOW_PHONE} />;
}

// ─── 03 — Что будет на лендинге ───────────────────────────────────────────
// Одна живая сцена (Егор, 2026-09-26: «не этапами, а в одной сцене… больше
// интерфейсов, как человек видит сайт»): окно браузера с персональной
// страницей. Страница сама листается, курсор наводит и нажимает, а каждый
// раздел, въезжая в окно, собирается вихрем частиц. Кейсы стоят по диагонали,
// тарифы — колонками, заказ — форма, после отправки разлетается пыль.
// Внизу окна — вкладки разделов, подсветка едет за прокруткой.

const IN_BOX: Box = [4, 10, 552, 212];
/** Окно страницы внутри браузера. */
const VX = 16;
const VY = 42;
const VW = 522;
const VH = 142;
/** Центры вкладок-подписей. */
const TABS = [82, 214, 346, 478];
const TAB_Y = 192;

/** Один круг сцены и его отметки времени (секунды). */
const LOOP = 15;
/** Когда раздел k встаёт в окно. */
const ARRIVE = [0, 3.4, 7.2, 10.8];
/** Прокрутка: [начало, конец, откуда, куда] — в разделах. */
const SCROLLS: [number, number, number, number][] = [
  [2.6, 3.4, 0, 1],
  [6.4, 7.2, 1, 2],
  [10.0, 10.8, 2, 3],
  [14.0, 15.0, 3, 0],
];
/** Курсор: [время, x, y] в координатах сцены. */
const CURSOR: [number, number, number][] = [
  [0, 470, 176],
  [0.9, 470, 176],
  [1.8, 262, 164],
  [2.8, 262, 164],
  [4.0, 272, 116],
  [6.0, 272, 116],
  [6.6, 320, 170],
  [7.6, 320, 170],
  [8.2, 264, 166],
  [9.8, 264, 166],
  [10.4, 330, 150],
  [11.0, 318, 78],
  [11.8, 318, 78],
  [12.0, 318, 106],
  [12.5, 318, 106],
  [12.9, 280, 142],
  [14.2, 280, 142],
  [15, 470, 176],
];
const CLICKS = [8.4, 11.0, 12.0, 12.9];

function scrollAt(tl: number) {
  for (const [a, b, f, to] of SCROLLS) {
    if (tl < a) return f * VH;
    if (tl <= b) return (f + (to - f) * easeInOut((tl - a) / (b - a))) * VH;
  }
  return 0;
}
function cursorAt(tl: number): Pt {
  for (let i = 1; i < CURSOR.length; i++) {
    const [t1, x1, y1] = CURSOR[i];
    if (tl <= t1) {
      const [t0, x0, y0] = CURSOR[i - 1];
      const k = easeInOut(clamp01((tl - t0) / (t1 - t0 || 1)));
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
  }
  return [CURSOR[0][1], CURSOR[0][2]];
}

// Геометрия разделов в собственных координатах раздела (x — по сцене,
// y — от верха раздела). Нужна и для рисования, и для точек вихря.
type R = [number, number, number, number];
const S0 = {
  chip: [30, 10, 132, 18] as R,
  title: [30, 40, 214, 13] as R,
  sub: [30, 60, 150, 9] as R,
  checks: [0, 1, 2].map((i) => [36, 86 + i * 18] as Pt),
  checkW: [118, 94, 106],
  hero: [292, 10, 226, 122] as R,
};
const S1 = {
  cards: [0, 1, 2].map((i) => [44 + i * 156, 8 + i * 24, 148, 86] as R),
};
const S2 = {
  cols: [0, 1, 2].map((i) => (i === 1 ? ([204, 4, 124, 134] as R) : ([62 + (i === 2 ? 286 : 0), 16, 116, 118] as R))),
};
const S3 = {
  card: [148, 8, 240, 128] as R,
  f1: [168, 24, 200, 22] as R,
  f2: [168, 54, 200, 22] as R,
  btn: [168, 88, 200, 28] as R,
};

function sectionPts(k: number, step: number): Pt[] {
  const y = VY;
  const rp = ([x, yy, w, h]: R, s = step) => rectPts(x, y + yy, w, h, s);
  if (k === 0)
    return [
      ...rp(S0.chip),
      ...rp(S0.title),
      ...rp(S0.sub, step * 1.4),
      ...S0.checks.flatMap(([cx, cy], i) => [...circlePts(cx, y + cy, 6, step), ...rectPts(cx + 12, y + cy - 3, S0.checkW[i], 6, step * 1.4)]),
      ...rp(S0.hero),
      ...circlePts(S0.hero[0] + S0.hero[2] / 2, y + S0.hero[1] + S0.hero[3] / 2, 17, step),
    ];
  if (k === 1) return S1.cards.flatMap((r) => rp(r));
  if (k === 2) return S2.cols.flatMap((r) => [...rp(r), ...rp([r[0] + 12, r[1] + r[3] - 30, r[2] - 24, 20])]);
  return [...rp(S3.card), ...rp(S3.f1), ...rp(S3.f2), ...rp(S3.btn)];
}

function check(c: Ctx, cx: number, cy: number, r: number, p = 1) {
  c.beginPath();
  c.moveTo(cx - r * 0.5, cy);
  if (p < 0.5) c.lineTo(cx - r * 0.5 + r * 0.36 * (p / 0.5), cy + r * 0.36 * (p / 0.5));
  else {
    c.lineTo(cx - r * 0.14, cy + r * 0.36);
    const q = (p - 0.5) / 0.5;
    c.lineTo(cx - r * 0.14 + r * 0.64 * q, cy + r * 0.36 - r * 0.72 * q);
  }
}

function cursorShape(c: Ctx, x: number, y: number) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, 15);
  c.lineTo(4, 11.4);
  c.lineTo(7, 17.5);
  c.lineTo(9.6, 16.3);
  c.lineTo(6.7, 10.4);
  c.lineTo(11.6, 10.4);
  c.closePath();
  c.fillStyle = "#fff";
  c.fill();
  c.lineWidth = 1.1;
  c.strokeStyle = "#0b0a14";
  c.stroke();
  c.restore();
}

function pageScene(): Item {
  const box: Box = [VX, VY, VW, VH];
  let step = STEP.high;
  const fired = new Set<string>();
  return {
    d: 0,
    box,
    calm: true,
    pts(s) {
      step = s;
      return sectionPts(0, s);
    },
    draw(c, { t, lt, al, emit, frozen }) {
      // Страница оживает, когда собралась; в статичном кадре — первый раздел.
      const tl0 = frozen ? -1 : lt - 1.9;
      const loop = tl0 < 0 ? -1 : Math.floor(tl0 / LOOP);
      const tl = tl0 < 0 ? 0 : tl0 - loop * LOOP;
      const live = tl0 >= 0;
      const scroll = live ? scrollAt(tl) : 0;

      // Раздел въехал — собираем его вихрем (первый раздел в первом круге
      // уже собран общей сборкой сцены).
      if (live) {
        ARRIVE.forEach((at, k) => {
          const key = `${loop}:${k}`;
          if (tl >= at && tl < at + 0.5 && !fired.has(key) && !(k === 0 && loop === 0)) {
            fired.add(key);
            emit(sectionPts(k, step * 1.3));
          }
        });
        if (tl >= 13.0 && tl < 13.5 && !fired.has(`${loop}:ok`)) {
          fired.add(`${loop}:ok`);
          const [bx, by, bw, bh] = S3.btn;
          emit(rectPts(bx, VY + by - scroll + 3 * VH, bw, bh, step), true);
        }
      }
      /** Прозрачность раздела: пока не собран — едва виден контур. */
      const secA = (k: number) => {
        if (!live) return k === 0 ? 1 : 0;
        if (k === 0) {
          if (tl >= 14) return 0.14;
          if (loop === 0) return 1;
        }
        return 0.14 + 0.86 * clamp01((tl - ARRIVE[k] - 0.45) / 0.7);
      };
      const top = (k: number) => VY + k * VH - scroll;

      // Подсветка вкладки текущего раздела — едет за прокруткой.
      const f = scroll / VH;
      const i0 = Math.floor(f);
      const tx = TABS[Math.min(3, i0)] + (TABS[Math.min(3, i0 + 1)] - TABS[Math.min(3, i0)]) * (f - i0);
      rrect(c, tx - 54, TAB_Y - 6, 108, 26, 13);
      c.fillStyle = grad(c, [tx - 54, TAB_Y - 6, 108, 26], 0.16);
      c.fill();
      rrect(c, tx - 22, TAB_Y + 22, 44, 2.5, 1.25);
      c.fillStyle = grad(c, [tx - 22, TAB_Y + 22, 44, 3], 1);
      c.fill();

      c.save();
      rrect(c, VX, VY, VW, VH, 10);
      c.clip();

      // 0 — Решение: персональная плашка, заголовок, пункты, видео-герой.
      {
        const y = top(0);
        const a = secA(0);
        if (y > VY - VH && a > 0) {
          c.globalAlpha = al * a;
          const [cx, cy, cw, ch] = S0.chip;
          rrect(c, cx, y + cy, cw, ch, 9);
          c.lineWidth = 1.2;
          c.strokeStyle = grad(c, [cx, y + cy, cw, ch], 1);
          c.stroke();
          c.beginPath();
          c.arc(cx + 11, y + cy + 9, 3.2, 0, TAU);
          c.fillStyle = grad(c, [cx, y + cy, cw, ch], 1);
          c.fill();
          rrect(c, cx + 22, y + cy + 6.5, 88 * (0.6 + 0.4 * wave(t, 3.6)), 5, 2.5);
          c.fillStyle = "rgba(255,255,255,0.6)";
          c.fill();
          const [ttx, tty, ttw, tth] = S0.title;
          rrect(c, ttx, y + tty, ttw, tth, 6);
          c.fillStyle = grad(c, [ttx, y + tty, ttw, tth], 1);
          c.fill();
          const [sx, sy, sw, sh] = S0.sub;
          rrect(c, sx, y + sy, sw, sh, 4.5);
          c.fillStyle = "rgba(255,255,255,0.45)";
          c.fill();
          S0.checks.forEach(([px, py], i) => {
            const hot = live && tl > 1.6 + i * 0.25 && tl < 2.9;
            c.beginPath();
            c.arc(px, y + py, 6, 0, TAU);
            c.fillStyle = grad(c, [px - 6, y + py - 6, 12, 12], hot ? 1 : 0.6);
            c.fill();
            check(c, px, y + py, 7.5);
            c.lineWidth = 1.4;
            c.strokeStyle = "#fff";
            c.stroke();
            rrect(c, px + 12, y + py - 3, S0.checkW[i], 6, 3);
            c.fillStyle = `rgba(255,255,255,${hot ? 0.6 : 0.3})`;
            c.fill();
          });
          const [hx, hy, hw, hh] = S0.hero;
          sheets(c, hx, y + hy, hw, hh, 12, [hx, y + hy, hw, hh], 1, 5, true);
          glass(c, hx, y + hy, hw, hh, 12, grad(c, [hx, y + hy, hw, hh], 0.9), 1.4, 0.04);
          rrect(c, hx, y + hy, hw, hh, 12);
          c.fillStyle = grad(c, [hx, y + hy, hw, hh], 0.2);
          c.fill();
          // Кадр видео: горизонт и «солнце» — намёк на картинку.
          c.save();
          rrect(c, hx, y + hy, hw, hh, 12);
          c.clip();
          c.beginPath();
          c.moveTo(hx, y + hy + hh * 0.72);
          c.bezierCurveTo(hx + hw * 0.3, y + hy + hh * 0.55, hx + hw * 0.55, y + hy + hh * 0.8, hx + hw, y + hy + hh * 0.6);
          c.lineTo(hx + hw, y + hy + hh);
          c.lineTo(hx, y + hy + hh);
          c.closePath();
          c.fillStyle = "rgba(255,255,255,0.06)";
          c.fill();
          c.beginPath();
          c.arc(hx + hw * 0.8, y + hy + hh * 0.3, 10, 0, TAU);
          c.fillStyle = "rgba(255,255,255,0.1)";
          c.fill();
          c.restore();
          // Метка «в эфире» в углу кадра.
          c.beginPath();
          c.arc(hx + 12, y + hy + 12, 2.6, 0, TAU);
          c.fillStyle = `rgba(255,122,156,${0.5 + 0.5 * wave(t, 1.4)})`;
          c.fill();
          rrect(c, hx + 18, y + hy + 10.5, 22, 3, 1.5);
          c.fillStyle = "rgba(255,255,255,0.45)";
          c.fill();
          const pcx = hx + hw / 2;
          const pcy = y + hy + hh / 2;
          const pr = 17 * (1 + 0.06 * wave(t, 2.4));
          c.beginPath();
          c.arc(pcx, pcy, pr + 7, 0, TAU);
          c.fillStyle = `rgba(255,255,255,${0.06 + 0.06 * wave(t, 2.4)})`;
          c.fill();
          c.beginPath();
          c.arc(pcx, pcy, pr, 0, TAU);
          c.fillStyle = "rgba(255,255,255,0.9)";
          c.fill();
          c.beginPath();
          c.moveTo(pcx - 4, pcy - 7);
          c.lineTo(pcx + 8, pcy);
          c.lineTo(pcx - 4, pcy + 7);
          c.closePath();
          c.fillStyle = "#1a1530";
          c.fill();
          // Полоса прогресса видео.
          rrect(c, hx + 14, y + hy + hh - 14, hw - 28, 3, 1.5);
          c.fillStyle = "rgba(255,255,255,0.18)";
          c.fill();
          rrect(c, hx + 14, y + hy + hh - 14, (hw - 28) * cyc(t, 6), 3, 1.5);
          c.fillStyle = grad(c, [hx, y + hy, hw, hh], 1);
          c.fill();
        }
      }

      // 1 — Кейсы: карточки каскадом по диагонали, за ними — стрелка роста.
      // Курсор наводит на среднюю: она приподнимается, график рисуется.
      {
        const y = top(1);
        const a = secA(1);
        if (y < VY + VH && y > VY - VH && a > 0) {
          c.globalAlpha = al * a;
          const [ax, ay] = [S1.cards[0][0] + 20, y + S1.cards[0][1] + 70];
          const [bx, by] = [S1.cards[2][0] + S1.cards[2][2] - 10, y + S1.cards[2][1] + 10];
          c.beginPath();
          c.moveTo(ax, ay + 40);
          c.lineTo(bx, by - 2);
          c.setLineDash([3, 6]);
          c.lineWidth = 1.2;
          c.strokeStyle = grad(c, [ax, by, bx - ax, ay - by], 0.5);
          c.stroke();
          c.setLineDash([]);
          S1.cards.forEach(([x, yy, w, h], i) => {
            const hover = i === 1 && live ? clamp01((tl - 4.0) / 0.3) * (1 - clamp01((tl - 6.0) / 0.3)) : 0;
            const drawP = i === 1 ? (live ? clamp01((tl - 4.2) / 1.0) : 0) : 1;
            const cy0 = y + yy - 6 * hover;
            c.save();
            c.translate(x + w / 2, cy0 + h / 2);
            c.rotate(-0.07);
            c.scale(1 + 0.04 * hover, 1 + 0.04 * hover);
            c.translate(-(x + w / 2), -(cy0 + h / 2));
            const r: Box = [x, cy0, w, h];
            sheets(c, x, cy0, w, h, 10, r, 2, 4, true, hover);
            glass(c, x, cy0, w, h, 10, grad(c, r, 0.55 + 0.45 * hover), 1.2 + hover, 0.05);
            // Превью работы.
            rrect(c, x + 8, cy0 + 8, w - 16, h * 0.52, 7);
            c.fillStyle = grad(c, r, 0.2 + 0.1 * i + 0.15 * hover);
            c.fill();
            // График результата внутри превью: сетка, заливка, точки.
            const gx = x + 16;
            const gy = cy0 + 8 + h * 0.52 - 8;
            const gw = w - 32;
            const gh = h * 0.52 - 18;
            c.lineWidth = 0.5;
            c.strokeStyle = "rgba(255,255,255,0.12)";
            c.beginPath();
            for (let k = 0; k < 3; k++) {
              c.moveTo(gx, gy - (gh * k) / 2);
              c.lineTo(gx + gw, gy - (gh * k) / 2);
            }
            c.stroke();
            const pts: Pt[] = [
              [0, 0.1],
              [0.25, 0.3],
              [0.45, 0.22],
              [0.7, 0.6],
              [1, 0.95],
            ];
            c.beginPath();
            const n = Math.max(1, Math.ceil(drawP * (pts.length - 1)));
            for (let k = 0; k <= n; k++) {
              const [px, py] = pts[k];
              const X = gx + px * gw;
              const Y = gy - py * (h * 0.52 - 18);
              if (k === 0) c.moveTo(X, Y);
              else c.lineTo(X, Y);
            }
            c.lineWidth = 1.6;
            c.strokeStyle = "rgba(255,255,255,0.92)";
            c.stroke();
            // Заливка под линией графика.
            const lastK = Math.min(pts.length - 1, n);
            c.lineTo(gx + pts[lastK][0] * gw, gy);
            c.lineTo(gx, gy);
            c.closePath();
            const ag = c.createLinearGradient(0, gy - gh, 0, gy);
            ag.addColorStop(0, "rgba(255,255,255,0.22)");
            ag.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = ag;
            c.fill();
            for (let k = 0; k <= lastK; k++) {
              c.beginPath();
              c.arc(gx + pts[k][0] * gw, gy - pts[k][1] * gh, k === lastK ? 2.4 : 1.4, 0, TAU);
              c.fillStyle = "#fff";
              c.fill();
            }
            // Строка названия и плашка результата со стрелкой вверх.
            // Аватар клиента и название кейса.
            c.beginPath();
            c.arc(x + 15, cy0 + h * 0.52 + 21, 5, 0, TAU);
            c.fillStyle = grad(c, [x + 10, cy0 + h * 0.52 + 16, 10, 10], 0.9);
            c.fill();
            textLine(c, x + 24, cy0 + h * 0.52 + 16, w * 0.38, 0.55, 3);
            textLine(c, x + 24, cy0 + h * 0.52 + 23, w * 0.26, 0.3, 2.4);
            const pw = 40;
            rrect(c, x + w - pw - 10, cy0 + h * 0.52 + 14, pw, 14, 7);
            c.fillStyle = grad(c, [x + w - pw - 10, 0, pw, 14], 0.35 + 0.65 * (i === 1 ? drawP : 0.6));
            c.fill();
            c.beginPath();
            c.moveTo(x + w - pw - 2, cy0 + h * 0.52 + 24);
            c.lineTo(x + w - pw + 2, cy0 + h * 0.52 + 18);
            c.lineTo(x + w - pw + 6, cy0 + h * 0.52 + 24);
            c.lineWidth = 1.4;
            c.strokeStyle = "#fff";
            c.stroke();
            c.restore();
          });
        }
      }

      // 2 — Тарифы: три колонки, средняя выше. Курсор нажимает «Выбрать» —
      // она выбрана: кнопка заливается, появляется галочка.
      {
        const y = top(2);
        const a = secA(2);
        if (y < VY + VH && y > VY - VH && a > 0) {
          c.globalAlpha = al * a;
          const sel = live ? clamp01((tl - 8.4) / 0.35) : 0;
          S2.cols.forEach(([x, yy, w, h], i) => {
            const mid = i === 1;
            const r: Box = [x, y + yy, w, h];
            sheets(c, x, y + yy, w, h, 12, r, mid ? 2 : 1, 4, mid, mid ? sel : 0);
            if (mid) {
              rrect(c, x, y + yy, w, h, 12);
              c.lineWidth = 7;
              c.strokeStyle = grad(c, r, 0.08 + 0.25 * sel);
              c.stroke();
            }
            glass(c, x, y + yy, w, h, 12, mid ? grad(c, r, 0.5 + 0.5 * sel) : "rgba(255,255,255,0.18)", mid ? 1.6 + sel : 1, 0.05);
            if (mid) {
              // Плашка «хит» по центру верхней кромки.
              rrect(c, x + w / 2 - 20, y + yy - 6, 40, 12, 6);
              c.fillStyle = grad(c, [x + w / 2 - 20, 0, 40, 12], 1);
              c.fill();
              rrect(c, x + w / 2 - 11, y + yy - 1.5, 22, 3, 1.5);
              c.fillStyle = "rgba(255,255,255,0.85)";
              c.fill();
            }
            // Цена — крупная полоса, под ней пункты.
            rrect(c, x + 14, y + yy + 16, w * 0.5, 10, 5);
            c.fillStyle = mid ? grad(c, r, 1) : "rgba(255,255,255,0.55)";
            c.fill();
            // Период рядом с ценой и пункты с галочками.
            rrect(c, x + 18 + w * 0.5, y + yy + 21, 16, 4, 2);
            c.fillStyle = "rgba(255,255,255,0.3)";
            c.fill();
            for (let k = 0; k < 3; k++) {
              const ky = y + yy + 44 + k * 14;
              c.beginPath();
              c.arc(x + 18, ky, 4, 0, TAU);
              c.fillStyle = mid ? grad(c, [x + 14, ky - 4, 8, 8], 0.9) : "rgba(255,255,255,0.14)";
              c.fill();
              check(c, x + 18, ky, 5);
              c.lineWidth = 1;
              c.strokeStyle = mid ? "#fff" : "rgba(255,255,255,0.6)";
              c.stroke();
              textLine(c, x + 27, ky - 1.5, w * (0.6 - k * 0.08), 0.35, 3);
            }
            const bb: Box = [x + 12, y + yy + h - 30, w - 24, 20];
            rrect(c, bb[0], bb[1], bb[2], bb[3], 10);
            if (mid) {
              c.fillStyle = grad(c, bb, 0.25 + 0.75 * sel);
              c.fill();
            } else {
              c.lineWidth = 1;
              c.strokeStyle = "rgba(255,255,255,0.25)";
              c.stroke();
            }
            if (mid && sel > 0) {
              const cx = x + w - 12;
              const cy = y + yy + 12;
              c.beginPath();
              c.arc(cx, cy, 9 * sel, 0, TAU);
              c.fillStyle = grad(c, [cx - 9, cy - 9, 18, 18], 1);
              c.fill();
              check(c, cx, cy, 11, sel);
              c.lineWidth = 1.6;
              c.strokeStyle = "#fff";
              c.stroke();
            }
          });
        }
      }

      // 3 — Заказ: форма печатается, курсор жмёт «Заказать» — галочка и
      // разлёт пыли.
      {
        const y = top(3);
        const a = secA(3);
        if (y < VY + VH && a > 0) {
          c.globalAlpha = al * a;
          const done = live ? clamp01((tl - 13.0) / 0.5) * (tl < 14.6 ? 1 : 0) : 0;
          const [fx, fy, fw, fh] = S3.card;
          const r: Box = [fx, y + fy, fw, fh];
          sheets(c, fx, y + fy, fw, fh, 14, r, 2, 5, true, done);
          glass(c, fx, y + fy, fw, fh, 14, grad(c, r, 0.6 + 0.4 * done), 1.4 + done, 0.05);
          c.globalAlpha = al * a * (1 - done);
          const typing = (p: number, [x, yy, w, h]: R, max: number, active: boolean, icon: 0 | 1) => {
            rrect(c, x, y + yy, w, h, 7);
            c.fillStyle = "rgba(255,255,255,0.04)";
            c.fill();
            c.lineWidth = active ? 1.4 : 1;
            c.strokeStyle = active ? grad(c, [x, y + yy, w, h], 1) : "rgba(255,255,255,0.22)";
            c.stroke();
            // Иконка поля: человек (имя) или трубка (телефон).
            const ix = x + 11;
            const iy = y + yy + h / 2;
            c.lineWidth = 1;
            c.strokeStyle = "rgba(255,255,255,0.55)";
            c.beginPath();
            if (icon === 0) {
              c.arc(ix, iy - 2.2, 2.2, 0, TAU);
              c.moveTo(ix - 4, iy + 4.5);
              c.quadraticCurveTo(ix, iy - 0.5, ix + 4, iy + 4.5);
            } else {
              rrect(c, ix - 3, iy - 5, 6, 10, 1.6);
            }
            c.stroke();
            const x0 = x + 22;
            if (p > 0) {
              rrect(c, x0, y + yy + h / 2 - 2.5, max * p, 5, 2.5);
              c.fillStyle = "rgba(255,255,255,0.75)";
              c.fill();
            } else {
              textLine(c, x0, y + yy + h / 2 - 1.5, max * 0.8, 0.16, 3);
            }
            if (active && wave(t, 0.9) > 0.5) {
              c.fillStyle = "#fff";
              c.fillRect(x0 + 2 + max * p, y + yy + 5, 1.2, h - 10);
            }
          };
          const p1 = live ? clamp01((tl - 11.1) / 0.7) : 0;
          const p2 = live ? clamp01((tl - 12.05) / 0.45) : 0;
          typing(p1, S3.f1, 120, live && tl >= 11 && tl < 12, 0);
          typing(p2, S3.f2, 88, live && tl >= 12 && tl < 12.9, 1);
          const press = live ? Math.max(0, Math.sin(clamp01((tl - 12.9) / 0.18) * Math.PI)) : 0;
          const [bx, by, bw, bh] = S3.btn;
          c.save();
          c.translate(bx + bw / 2, y + by + bh / 2);
          c.scale(1 - 0.05 * press, 1 - 0.05 * press);
          rrect(c, -bw / 2, -bh / 2, bw, bh, bh / 2);
          c.fillStyle = grad(c, [-bw / 2, -bh / 2, bw, bh], 1);
          c.fill();
          c.beginPath();
          c.moveTo(-6, 0);
          c.lineTo(6, 0);
          c.moveTo(1, -5);
          c.lineTo(6, 0);
          c.lineTo(1, 5);
          c.lineWidth = 1.8;
          c.strokeStyle = "#fff";
          c.stroke();
          c.restore();
          if (done > 0) {
            c.globalAlpha = al * a * done;
            const cx = fx + fw / 2;
            const cy = y + fy + fh / 2 - 8;
            c.beginPath();
            c.arc(cx, cy, 24, 0, TAU);
            c.fillStyle = grad(c, [cx - 24, cy - 24, 48, 48], 1);
            c.fill();
            check(c, cx, cy, 26, done);
            c.lineWidth = 3;
            c.strokeStyle = "#fff";
            c.stroke();
            rrect(c, cx - 50, cy + 36, 100, 6, 3);
            c.fillStyle = "rgba(255,255,255,0.55)";
            c.fill();
          }
        }
      }

      // Полоса прокрутки справа.
      c.globalAlpha = al;
      const thumbH = VH / 4;
      rrect(c, VX + VW - 7, VY + 6, 3, VH - 12, 1.5);
      c.fillStyle = "rgba(255,255,255,0.08)";
      c.fill();
      rrect(c, VX + VW - 7, VY + 6 + ((VH - 12 - thumbH) * scroll) / (3 * VH), 3, thumbH, 1.5);
      c.fillStyle = grad(c, box, 0.9);
      c.fill();

      // Курсор и круг нажатия.
      if (live) {
        const [mx, my] = cursorAt(tl);
        for (const ck of CLICKS) {
          const k = (tl - ck) / 0.6;
          if (k >= 0 && k < 1) {
            c.beginPath();
            c.arc(mx, my, 4 + 16 * easeOut(k), 0, TAU);
            c.lineWidth = 1.4;
            c.strokeStyle = grad(c, [mx - 20, my - 20, 40, 40], 1 - k);
            c.stroke();
          }
        }
        const cin = clamp01(tl / 0.5) * (tl > 14.6 ? 1 - (tl - 14.6) / 0.4 : 1);
        c.globalAlpha = al * cin;
        cursorShape(c, mx, my);
      }
      c.restore();
    },
  };
}

const buildInside = (): Item[] => [
  {
    d: -0.8,
    box: IN_BOX,
    calm: true,
    pts: (s) => [...rectPts(4, 10, 552, 212, s * 1.4), ...sheetPts(4, 10, 552, 212, 1, 7, s * 1.4), ...rectPts(90, 17, 380, 16, s * 1.4)],
    draw(c, { t }) {
      sheets(c, 4, 10, 552, 212, 16, IN_BOX, 1, 7, true);
      rrect(c, 4, 10, 552, 212, 16);
      c.fillStyle = BASE;
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.03)";
      c.fill();
      c.lineWidth = 1.2;
      c.strokeStyle = grad(c, IN_BOX, 0.6 + 0.4 * wave(t, 4));
      c.stroke();
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(22 + i * 11, 25, 3, 0, TAU);
        c.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * wave(t, 2.4, i * 0.4)})`;
        c.fill();
      }
      // Адресная строка персональной страницы: замок и адрес.
      rrect(c, 90, 17, 380, 16, 8);
      c.fillStyle = "rgba(255,255,255,0.05)";
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = "rgba(255,255,255,0.12)";
      c.stroke();
      c.beginPath();
      c.arc(102, 25, 3, 0, TAU);
      c.fillStyle = grad(c, [99, 22, 6, 6], 1);
      c.fill();
      rrect(c, 112, 22.5, 150, 5, 2.5);
      c.fillStyle = "rgba(255,255,255,0.4)";
      c.fill();
      rrect(c, 266, 22.5, 70, 5, 2.5);
      c.fillStyle = grad(c, [266, 22, 70, 5], 1);
      c.fill();
    },
  },
  pageScene(),
  label(TABS[0], TAB_Y, 120, "Решение", "", 0, { d: 2.2 }),
  label(TABS[1], TAB_Y, 120, "Кейсы", "", 1, { d: 2.4 }),
  label(TABS[2], TAB_Y, 120, "Тарифы", "", 2, { d: 2.6 }),
  label(TABS[3], TAB_Y, 120, "Заказ", "", 3, { d: 2.8 }),
];

export function InfoInside() {
  return <Scene build={buildInside} />;
}
