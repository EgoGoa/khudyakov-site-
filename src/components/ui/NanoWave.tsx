"use client";

import { useEffect, useRef } from "react";

// Знак голосового ассистента (Егор, 2026-09-26): «в стиле нашей сферы, но
// другая иконка — полоса частот, горизонтальная, вибрирует, а когда
// слушает или говорит, вибрация усиливается».
//
// Тот же почерк, что у NanoSphere: ~14 тонких контуров, каждый со своей
// волной и сдвигом фазы, складываются светом («lighter») в объёмную
// переливающуюся ленту; по ней течёт градиент страницы, вокруг мягкий
// ореол. Только лента не замкнута в кольцо, а вытянута по горизонтали и
// сходится в точку на обоих концах — как голосовая волна.
//
// Плоско, без бликов. На mid/low — меньше линий и 30 кадров/с; при
// «уменьшить движение» — один неподвижный кадр.
const POINTS = 64;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export default function NanoWave({
  width = 64,
  height = 28,
  from,
  to,
  hot = false,
  pulse = 0,
  dust = true,
  level,
}: {
  width?: number;
  height?: number;
  from: string;
  to: string;
  /** Слушает или говорит — волны раскачиваются сильнее. */
  hot?: boolean;
  /** Любая смена числа — короткий яркий всплеск (ответ). */
  pulse?: number;
  /** Растворение по краям: лента гаснет к концам, с концов летит пыль. */
  dust?: boolean;
  /** Громкость голоса 0..1 каждый кадр — волна качается в такт речи. */
  level?: () => number;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotRef = useRef(hot);
  const pulseRef = useRef(pulse);
  const levelRef = useRef(level);
  useEffect(() => {
    hotRef.current = hot;
    pulseRef.current = pulse;
    levelRef.current = level;
  }, [hot, pulse, level]);

  // Холст шире знака — ореолу и размытию нужно место за краем ленты.
  const padX = dust ? width * 0.3 : height * 0.5;
  const padY = height * 0.7;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (width + padX * 2) * dpr;
    const H = (height + padY * 2) * dpr;
    canvas.width = Math.round(W);
    canvas.height = Math.round(H);
    // Линии длиннее самого знака: хвосты заходят в поля холста и там
    // плавно уходят в прозрачность (Егор: «края чуть удлинить»).
    const x0 = (dust ? padX * 0.35 : padX) * dpr;
    const len = (dust ? width + padX * 1.3 : width) * dpr;
    const cy = H / 2;
    const amp = (height / 2) * dpr;
    const k = Math.max(1, height / 28) ** 0.55;
    const [fr, fg, fb] = hexToRgb(from);
    const [tr, tg, tb] = hexToRgb(to);

    const html = document.documentElement;
    const light = html.hasAttribute("data-lite") || html.hasAttribute("data-mid");
    // Плотнее (Егор): больше линий и ближе друг к другу.
    const LINES = light ? 12 : 20;

    // Пыль на концах (Егор: «чтобы по краям она распылялась»): мелкие искры
    // рождаются у обоих концов ленты и улетают наружу, растворяясь. В
    // разговоре их больше и летят они дальше.
    type Mote = { side: -1 | 1; u: number; y: number; vx: number; vy: number; born: number; life: number; size: number; mix: number };
    const motes: Mote[] = [];
    const MOTES_PER_S = light ? 5 : 9;
    let moteAcc = 0;
    let moteLast = 0;
    const spawnMote = (t: number): Mote => {
      // С той стороны, где курсор, пыли больше.
      const side = Math.random() < 0.5 + 0.35 * pull ? 1 : -1;
      return {
        side,
        u: side < 0 ? 0.12 + Math.random() * 0.14 : 0.74 + Math.random() * 0.14,
        y: (Math.random() - 0.5) * amp * 0.7,
        vx: side * (0.05 + Math.random() * 0.12) * len,
        vy: (Math.random() - 0.5) * amp * 0.9,
        born: t,
        life: 0.9 + Math.random() * 1.3,
        size: (0.4 + Math.random() * 0.55) * dpr * k,
        mix: Math.random(),
      };
    };

    // Курсор (Егор: «за мышкой следуют волны»): волна не ускоряется, а
    // медленно тянется к нему — гребень смещается в его сторону, с той
    // стороны выше размах и ярче свет, волны текут туда. bias — где курсор
    // по горизонтали (-1 слева … 1 справа), near — насколько он близко.
    let bias = 0;
    let near = 0;
    let biasS = 0;
    let nearS = 0;
    let pull = 0;
    let ph1 = 0;
    let ph2 = 0;
    let lastT = 0;
    let hoverS = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      bias = Math.max(-1, Math.min(1, dx / (r.width * 0.5 + 220)));
      near = Math.max(0, Math.min(1, 1 - Math.hypot(dx, dy) / 720));
    };
    const onOut = () => {
      near = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onOut);

    let energy = 1;
    // Всегда яркая, как при наведении (Егор) — наведение больше не нужно.
    const hover = true;
    let seenPulse = pulseRef.current;

    const draw = (t: number) => {
      // Покой — тихое дыхание; наведение — чуть живее; разговор — в полную силу.
      // В разговоре размах идёт за громкостью голоса: тишина — спокойная
      // волна, слог — всплеск. Без источника громкости — ровно «горячая».
      const lv = levelRef.current?.() ?? 0.55;
      const dt = Math.max(0, Math.min(0.05, t - lastT));
      lastT = t;
      // Медленно, без рывков: курсор «притягивает», а не дёргает.
      biasS += (bias - biasS) * 0.035;
      nearS += (near - nearS) * 0.03;
      pull = biasS * (0.3 + 0.7 * nearS);
      const target = hotRef.current ? 1.2 + lv * 3.6 : hover ? 1.8 : 1 + 0.9 * nearS;
      if (pulseRef.current !== seenPulse) {
        seenPulse = pulseRef.current;
        energy = Math.max(energy, 4.2);
      }
      // В разговоре откликается быстро (каждый слог), в покое — плавно.
      energy += (target - energy) * (hotRef.current ? 0.3 : 0.07);
      const breath = 1 + 0.18 * Math.sin(t * 1.1) + 0.07 * Math.sin(t * 2.3);
      const e = energy * breath;
      // Скорость меняет только разговор (речь). Наведение и курсор скорость
      // не трогают (Егор: «скорость та же, но импульс больше и ярче») —
      // от них растут размах, яркость и пыль.
      const speed = hotRef.current ? 1 + (energy - 1) * 0.55 : 1;
      hoverS += ((hover ? 1 : 0) - hoverS) * 0.06;
      const glowK = Math.max(nearS, hoverS);

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;

      // Без ореола вокруг (Егор: свечение за волной читалось рамкой и
      // «нехорошим фоном») — свет только в самих линиях.
      // Перелив: по ленте слева направо бежит яркая голова света.
      // Голова света стоит там, куда тянет курсор, и чуть пульсирует.
      const head = Math.max(0.2, Math.min(0.8, 0.5 + 0.34 * pull + 0.03 * Math.sin(t * 0.8)));
      const flare = 0.8 + 0.2 * glowK + 0.1 * Math.sin(t * 2.6) * glowK;
      const lift = (c: number) => Math.min(255, Math.round(c + 90 * glowK));
      const grad = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      // Концы каждой линии уходят в полную прозрачность — лента растворяется
      // к краям сама, а не обрезается маской.
      const stops: [number, string][] = [
        [0, `rgba(${fr},${fg},${fb},0)`],
        [0.16, `rgba(${fr},${fg},${fb},${0.45 + 0.4 * Math.max(0, -pull)})`],
        [head, `rgba(${lift(tr)},${lift(tg)},${lift(tb)},${flare})`],
        [0.84, `rgba(${tr},${tg},${tb},${0.45 + 0.4 * Math.max(0, pull)})`],
        [1, `rgba(${tr},${tg},${tb},0)`],
      ];
      for (const [o, c] of stops.sort((a, b) => a[0] - b[0])) grad.addColorStop(Math.min(1, Math.max(0, o)), c);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.8 * dpr * k;
      ctx.shadowBlur = 3 * dpr * k;
      ctx.shadowColor = `rgba(${fr},${fg},${fb},0.4)`;

      // Волны текут к курсору: фаза набегает в его сторону. В разговоре
      // добавляется собственное движение речи.
      const drift = speed * (1.9 * pull + (hotRef.current ? 1.2 : 0.18) * (pull < 0 ? -1 : 1));
      ph1 += dt * 2.1 * drift;
      ph2 += dt * 3.3 * drift;
      // Гребень смещается к курсору: середина огибающей едет в его сторону.
      const u0 = 0.5 + 0.24 * pull;
      const lean = Math.abs(pull);
      const toward = pull < 0 ? -1 : 1;

      for (let j = 0; j < LINES; j++) {
        const phase = j * 0.42;
        ctx.beginPath();
        for (let i = 0; i <= POINTS; i++) {
          const u = i / POINTS;
          // Сходится в точку на концах, громче всего в середине.
          const uw = u < u0 ? (0.5 * u) / u0 : 0.5 + (0.5 * (u - u0)) / (1 - u0);
          const side = 1 + 0.8 * lean * Math.max(0, (u - 0.5) * 2 * toward);
          const env = Math.sin(Math.PI * uw) ** 2 * side;
          const x = x0 + u * len;
          const w =
            0.42 * Math.sin(u * 9 - ph1 + phase) * (0.8 + 0.2 * Math.sin(t * 0.9 + phase)) +
            0.3 * Math.sin(u * 15 - ph2 + phase * 1.7) +
            0.18 * Math.sin(u * 23 + t * 2.6 * speed - phase * 0.8);
          const spread = (j - LINES / 2) * 0.032;
          const y = cy + amp * env * (w * 0.3 * Math.min(e, 4.6) + spread * Math.min(e, 2));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (dust) {
        ctx.shadowBlur = 0;
        moteAcc += MOTES_PER_S * (0.6 + 0.4 * energy) * (1 + 1.6 * glowK) * Math.max(0, t - moteLast);
        moteLast = t;
        while (moteAcc >= 1) {
          moteAcc -= 1;
          motes.push(spawnMote(t));
        }
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          const age = (t - m.born) / m.life;
          if (age >= 1) {
            motes.splice(i, 1);
            continue;
          }
          const ease = 1 - (1 - age) ** 2;
          const x = x0 + m.u * len + m.vx * ease * (0.7 + 0.3 * energy);
          const y = cy + m.y + m.vy * ease;
          const alpha = Math.min(1, age * 5) * (1 - age) * 0.6;
          const r = fr + (tr - fr) * m.mix;
          const g = fg + (tg - fg) * m.mix;
          const b = fb + (tb - fb) * m.mix;
          ctx.fillStyle = `rgba(${Math.round(r + (255 - r) * age)},${Math.round(g + (255 - g) * age)},${Math.round(b + (255 - b) * age)},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, m.size * (1 - age * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (still) {
      draw(1.3);
    } else {
      const start = performance.now();
      const frameMs = light ? 33 : 0;
      let last = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < frameMs) return;
        last = now;
        draw(Math.max(0, now - start) / 1000);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onOut);
    };
  }, [width, height, from, to, padX, padY, dust]);

  return (
    <span ref={wrapRef} className="relative block shrink-0" style={{ width, height }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: width + padX * 2,
          height: height + padY * 2,
          ...(dust
            ? {
                maskImage: "linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
              }
            : null),
        }}
      />
    </span>
  );
}
