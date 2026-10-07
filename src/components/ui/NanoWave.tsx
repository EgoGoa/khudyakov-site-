"use client";
import { settleAt } from "@/lib/motion";
import { frozenFor } from "@/lib/welcome-freeze";

import { useEffect, useRef } from "react";

// Спящий режим (prop `sleepy`, нижняя волна): в покое волна очень медленно
// переливается (Егор, 2026-10-03: «плавно, очень медленно, лёгкое
// переливание, без нагрузки на процессор»). Нагрузку держим малой тремя
// способами: часы волны идут в 4–5 раз медленнее, кадры в покое
// перерисовываются редко (≈18 в секунду, на телефоне ≈12), линий меньше, а на
// телефоне холст в 1x. Вне экрана, в фоновой вкладке и под окнами не
// рисуется вовсе. Курсор рядом, голос и всплеск ответа возвращают полную
// живую волну.
const SLEEP_CLOCK_S = 1.3; // первый кадр — красивая спокойная форма
const IDLE_RATE = 0.22; // скорость часов в покое
const IDLE_FRAME_MS = 40; // кадры в покое на компьютере (~25/с)
const IDLE_FRAME_MS_LITE = 55; // и на средних/слабых устройствах (~18/с)

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
// 96 точек на линию: на 64 лента читалась ломаной, особенно на ретине.
const POINTS = 96;

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
  sparkle = false,
  particles = true,
  sleepy = false,
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
  /** Большое окно: искры, как у сферы, — крупнее, чаще и от всей волны. */
  sparkle?: boolean;
  /** Пыль с концов волны. Нижней волне-кнопке — без частиц (Егор, 2026-09-27). */
  particles?: boolean;
  /** Спящий режим (нижняя волна): в покое застывший кадр без перерисовки,
   *  при наведении, голосе и всплеске — живая волна. */
  sleepy?: boolean;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotRef = useRef(hot);
  const pulseRef = useRef(pulse);
  const levelRef = useRef(level);
  // Цвета — цель, к которой волна плавно перетекает (смена страницы не
  // перезапускает холст и не даёт скачка цвета).
  const colorRef = useRef({ from, to });
  // Будильник спящей волны: перезапускает цикл кадров.
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    hotRef.current = hot;
    pulseRef.current = pulse;
    levelRef.current = level;
    colorRef.current = { from, to };
    wakeRef.current();
  }, [hot, pulse, level, from, to]);

  // Холст шире знака — ореолу и размытию нужно место за краем ленты.
  const padX = dust ? width * 0.3 : height * 0.5;
  const padY = height * 0.7;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lite0 = document.documentElement.hasAttribute("data-lite") || document.documentElement.hasAttribute("data-mid");
    // Нижняя волна — крошечный холст, поэтому чёткость (dpr до 2) ей почти
    // ничего не стоит даже на телефоне (Егор, 2026-10-03: «качество плохое»).
    void lite0;
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
    // Текущие цвета плавно догоняют целевые (~1.5 с) — между страницами
    // градиент перетекает, а не переключается.
    const curFrom = [...hexToRgb(colorRef.current.from)];
    const curTo = [...hexToRgb(colorRef.current.to)];
    let fr = 0, fg = 0, fb = 0, tr = 0, tg = 0, tb = 0;
    // Цвет ещё перетекает — спящая волна не застывает, пока не дойдёт.
    let blending = false;
    const blendColors = () => {
      const a = hexToRgb(colorRef.current.from);
      const b = hexToRgb(colorRef.current.to);
      blending = false;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(a[i] - curFrom[i]) > 1 || Math.abs(b[i] - curTo[i]) > 1) blending = true;
        curFrom[i] += (a[i] - curFrom[i]) * 0.035;
        curTo[i] += (b[i] - curTo[i]) * 0.035;
      }
      [fr, fg, fb] = curFrom.map(Math.round);
      [tr, tg, tb] = curTo.map(Math.round);
    };
    blendColors();

    const html = document.documentElement;
    const light = html.hasAttribute("data-lite") || html.hasAttribute("data-mid");
    // Не слишком плотно (Егор): лента из 13 линий, а не 20.
    // Большая волна (окно) — больше линий, чтобы не терять детализацию.
    const LINES = sleepy
      ? light ? 9 : 13
      : Math.round((light ? 9 : 13) * Math.min(1.5, Math.max(1, height / 60)));

    // Пыль на концах (Егор: «чтобы по краям она распылялась»): мелкие искры
    // рождаются у обоих концов ленты и улетают наружу, растворяясь. В
    // разговоре их больше и летят они дальше.
    type Mote = { side: -1 | 1; u: number; y: number; vx: number; vy: number; born: number; life: number; size: number; mix: number };
    const motes: Mote[] = [];
    // Искры минимальные, как у сферы (Егор: «не надо крупные частицы»).
    const MOTES_PER_S = sparkle ? (light ? 6 : 12) : light ? 5 : 9;
    let moteAcc = 0;
    let moteLast = 0;
    // Искры сферы: рождаются у волны по всей длине, вспыхивают и уходят
    // вверх-вниз и немного к курсору, белея и растворяясь.
    const spawnSpark = (t: number): Mote => {
      const u = 0.12 + Math.random() * 0.76;
      const up = Math.random() < 0.5 ? -1 : 1;
      return {
        side: up < 0 ? -1 : 1,
        u,
        y: up * Math.random() * amp * 0.25 * Math.sin(Math.PI * u),
        vx: ((Math.random() - 0.5) * 0.08 + 0.06 * pull) * len,
        vy: up * (0.35 + Math.random() * 0.9) * amp * Math.sin(Math.PI * u),
        born: t,
        life: 1.3 + Math.random() * 1.7,
        size: (0.35 + Math.random() * 0.45) * dpr,
        mix: Math.random(),
      };
    };
    const spawnMote = (t: number): Mote => {
      if (sparkle) return spawnSpark(t);
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

    // Курсор — локальный отклик, а не притяжение (Егор, 2026-09-27: «не
    // тянется к курсору, по центру, спокойно; при наведении в том месте,
    // где курсор, сразу активизация»). Как у интерактивных звуковых волн:
    //   · в точке курсора волна сразу поднимается (гауссов горб размаха);
    //   · каждое движение мыши пускает от этой точки «круги» — рябь,
    //     которая расходится по ленте в обе стороны и затухает;
    //   · там же — голова света.
    // Скорость самой волны от курсора не меняется.
    type Ripple = { u: number; born: number; amp: number };
    const ripples: Ripple[] = [];
    let inside = false;
    let cu = 0.5; // где курсор вдоль ленты, 0..1
    let cuS = 0.5;
    let hoverS = 0;
    let lastT = 0;
    let ph = 0;
    let lastRipple = -1;
    let lastX = 0;
    let lastY = 0;
    let nowT = 0;
    const boostBuf = new Float32Array(POINTS + 1);
    // Прямоугольник холста кешируется: getBoundingClientRect на каждое
    // движение мыши заставлял браузер пересчитывать вёрстку. Сбрасывается
    // при прокрутке и изменении размера.
    let rect: DOMRect | null = null;
    const dropRect = () => {
      rect = null;
    };
    window.addEventListener("scroll", dropRect, { passive: true, capture: true });
    window.addEventListener("resize", dropRect);
    const locate = (e: PointerEvent) => {
      const r = (rect ??= canvas.getBoundingClientRect());
      const u = ((e.clientX - r.left) * (W / r.width) - x0) / len;
      const dy = Math.abs(e.clientY - (r.top + r.height / 2));
      return { u, hit: u > 0.04 && u < 0.96 && dy < Math.max(28, height * 0.85) };
    };
    const ripple = (u: number, amp: number) => {
      ripples.push({ u, born: nowT, amp });
      if (ripples.length > 14) ripples.shift();
      lastRipple = nowT;
    };
    const onMove = (e: PointerEvent) => {
      const { u, hit } = locate(e);
      if (hit && !inside) {
        ripple(u, 0.4); // вход в зону — мягкий всплеск
        wakeRef.current();
      }
      inside = hit;
      if (!hit) return;
      cu = u;
      // Движение рождает рябь: чем быстрее ведёшь, тем сильнее круги.
      const moved = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      if (moved > 8 && nowT - lastRipple > 0.22) ripple(u, Math.min(0.5, 0.12 + moved / 140));
    };
    const onDown = (e: PointerEvent) => {
      const { u, hit } = locate(e);
      if (hit) {
        ripple(u, 1);
        wakeRef.current();
      }
    };
    const onOut = () => {
      inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onOut);

    let energy = 1;
    let seenPulse = pulseRef.current;
    // Для искр — тянутся с той стороны, где курсор (spawnSpark читает pull).
    let pull = 0;

    let rectAt = 0;
    const draw = (t: number) => {
      blendColors();
      nowT = t;
      // Окно может выезжать с анимацией — прямоугольник освежаем раз в 0.5 с.
      if (t - rectAt > 0.5) {
        rect = null;
        rectAt = t;
      }
      // Покой — спокойное дыхание; разговор — размах за громкостью голоса.
      const lv = levelRef.current?.() ?? 0.55;
      const dt = Math.max(0, Math.min(0.05, t - lastT));
      lastT = t;
      const target = hotRef.current ? 1.2 + lv * 1.9 : 1.15;
      if (pulseRef.current !== seenPulse) {
        seenPulse = pulseRef.current;
        energy = Math.max(energy, 1.9);
      }
      energy += (target - energy) * (hotRef.current ? 0.045 : 0.05);
      const breath = 1 + 0.14 * Math.sin(t * 0.9) + 0.05 * Math.sin(t * 2.1);
      const e = energy * breath;
      const speed = hotRef.current ? 0.85 + (energy - 1) * 0.25 : 0.8;
      // Отклик моментальный: вход — быстро, уход — мягко.
      // Мягкий отклик без рывков (Егор, 2026-10-03): вход и ход за курсором
      // плавнее.
      hoverS += ((inside ? 1 : 0) - hoverS) * (inside ? 0.06 : 0.035);
      cuS += (cu - cuS) * 0.06;
      pull = (cuS - 0.5) * 2 * hoverS;
      const glowK = 0.6 + 0.4 * hoverS;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;

      // Без ореола вокруг — свет только в самих линиях. Голова света стоит
      // в центре и мягко плавает, а при наведении переезжает под курсор.
      // Голова не подходит к краям ближе 0.3/0.7: иначе она перескакивала
      // опорные точки 0.17/0.83 и цвет у краёв менялся рывком (Егор,
      // 2026-10-03). За курсором идёт вполсилы — мягко.
      const head = Math.max(0.3, Math.min(0.7, 0.5 + 0.05 * Math.sin(t * 0.5) + (cuS - 0.5) * 0.6 * hoverS));
      const flare = 0.85 + 0.15 * hoverS;
      const lift = (c: number) => Math.min(255, Math.round(c + 90 * glowK));
      const grad = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      // Концы каждой линии уходят в полную прозрачность.
      const stops: [number, string][] = [
        // Кончики сходятся плавно, ступенькой по альфе: без неё сложенные
        // «lighter» линии давали обрывистый светлый кончик (Егор, 2026-10-03).
        [0, `rgba(${fr},${fg},${fb},0)`],
        [0.05, `rgba(${fr},${fg},${fb},0.02)`],
        [0.1, `rgba(${fr},${fg},${fb},0.14)`],
        [0.17, `rgba(${fr},${fg},${fb},0.55)`],
        [head, `rgba(${lift(tr)},${lift(tg)},${lift(tb)},${flare})`],
        [0.83, `rgba(${tr},${tg},${tb},0.55)`],
        [0.9, `rgba(${tr},${tg},${tb},0.14)`],
        [0.95, `rgba(${tr},${tg},${tb},0.02)`],
        [1, `rgba(${tr},${tg},${tb},0)`],
      ];
      for (const [o, c] of stops.sort((a, b) => a[0] - b[0])) grad.addColorStop(Math.min(1, Math.max(0, o)), c);
      ctx.strokeStyle = grad;
      // Тонкие линии при любом размере: толщина не растёт с волной, иначе
      // в большом окне рисунок терял детализацию. Без shadowBlur — он
      // самый дорогой шаг canvas; свечение дают сами линии «lighter».
      ctx.lineWidth = 0.95 * dpr * Math.min(k, 1.15);

      ph += dt * 2 * speed;

      // Рябь: фронт каждой волны уходит от точки рождения в обе стороны.
      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].born > 2.8) ripples.splice(i, 1);
      const boost = boostBuf;
      for (let i = 0; i <= POINTS; i++) {
        const u = i / POINTS;
        const du = (u - cuS) / 0.18;
        let b = 1.1 * hoverS * Math.exp(-du * du);
        for (const r of ripples) {
          const age = t - r.born;
          // Круг набирает силу за 0.3 с (без щелчка), расходится медленно и
          // широким мягким фронтом.
          const front = (Math.abs(u - r.u) - age * 0.32) / 0.085;
          const rise = Math.min(1, age / 0.3);
          b += 0.9 * r.amp * rise * Math.exp(-age * 1.3) * Math.exp(-front * front);
        }
        boost[i] = 1 + b;
      }

      for (let j = 0; j < LINES; j++) {
        const phase = j * 0.42;
        ctx.beginPath();
        for (let i = 0; i <= POINTS; i++) {
          const u = i / POINTS;
          // Сходится в точку на концах, громче всего в середине.
          const env = Math.sin(Math.PI * u) ** 2;
          const x = x0 + u * len;
          const w =
            0.42 * Math.sin(u * 9 - ph + phase) * (0.8 + 0.2 * Math.sin(t * 0.9 + phase)) +
            0.3 * Math.sin(u * 15 + ph * 1.4 + phase * 1.7) +
            0.18 * Math.sin(u * 23 + t * 2.2 * speed - phase * 0.8);
          const spread = (j - LINES / 2) * 0.032;
          // Горб и рябь поднимают и сами волны, и чуть раскрывают ленту.
          const bst = boost[i];
          const y = cy + amp * env * (w * 0.22 * Math.min(e, 4.2) * bst + spread * Math.min(e, 2) * (0.6 + 0.4 * bst));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (particles && (dust || sparkle)) {
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
          const alpha = sparkle ? Math.min(1, age * 6) * (1 - age) * 0.5 : Math.min(1, age * 5) * (1 - age) * 0.6;
          const r = fr + (tr - fr) * m.mix;
          const g = fg + (tg - fg) * m.mix;
          const b = fb + (tb - fb) * m.mix;
          ctx.fillStyle = `rgba(${Math.round(r + (255 - r) * age)},${Math.round(g + (255 - g) * age)},${Math.round(b + (255 - b) * age)},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, m.size * (1 - age * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Затухание к краям рисуем в самом холсте, а не CSS-маской: маска
      // вместе с filter на холсте при прокрутке резала левый край жёстким
      // обрезом (Егор, 2026-10-07).
      if (dust) {
        const fade = ctx.createLinearGradient(0, 0, W, 0);
        fade.addColorStop(0, "rgba(0,0,0,0)");
        fade.addColorStop(0.3, "rgba(0,0,0,1)");
        fade.addColorStop(0.7, "rgba(0,0,0,1)");
        fade.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let onScreen = true;
    const io = new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      if (onScreen) wakeRef.current();
    });
    io.observe(wrap);
    let raf = 0;
    if (still) {
      draw(1.3);
    } else {
      const frameMs = light ? 33 : 0;
      let last = 0;
      // Собственные часы волны: стоят, пока она не рисуется. Спящая волна
      // начинает с готовой спокойной формы и сразу застывает.
      let clock = sleepy ? SLEEP_CLOCK_S * 1000 : 0;
      let rate = sleepy ? IDLE_RATE : 1;
      const frozen = frozenFor(wrap);
      const settle = settleAt(wrap);
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
      // Внутри окна — только после его раскрытия (окно в два шага).
        if (now < settle) return;
        // Вне экрана и в фоновой вкладке не рисуем вовсе.
        if (!onScreen || document.hidden || frozen()) {
          last = 0;
          return;
        }
        // Спящий режим: без наведения, голоса и всплеска волна плавно
        // тормозит и застывает; тогда цикл кадров выключается совсем.
        const awake = !sleepy || hotRef.current || inside || hoverS > 0.02 || energy > 1.2 || ripples.length > 0;
        rate += ((awake ? 1 : IDLE_RATE) - rate) * (awake ? 0.15 : 0.04);
        const gap = sleepy && !awake ? (light ? IDLE_FRAME_MS_LITE : IDLE_FRAME_MS) : frameMs;
        if (now - last < gap) return;
        if (last) clock += Math.min(now - last, 100) * rate;
        last = now;
        draw(clock / 1000);
      };
      wakeRef.current = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      io.disconnect();
      window.removeEventListener("scroll", dropRect, { capture: true });
      window.removeEventListener("resize", dropRect);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onOut);
    };
  }, [width, height, padX, padY, dust, sparkle, particles, sleepy]);

  return (
    <span ref={wrapRef} className="relative block shrink-0" style={{ width, height }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="nano-wave-canvas pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: width + padX * 2,
          height: height + padY * 2,
        }}
      />
    </span>
  );
}
