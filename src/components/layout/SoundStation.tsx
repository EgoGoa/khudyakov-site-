"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MOODS, sound, type MoodId } from "@/lib/sound";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { serviceFromPath } from "@/lib/voice/intents";
import type { ServiceKey } from "@/lib/service-content";

// «Станция HDKV» в шапке: значок звука. Наведение раскрывает плеер прямо
// под ним, нажатие включает/выключает звук (выключенный — перечёркнут;
// по умолчанию звука нет). Пока играет трек, значок пульсирует в ритм самой
// музыки (анализатор в lib/sound), а не по заготовленной анимации.
//
// Иконки монохромные линии, как у остального меню шапки; цвет — только
// свечение активного состояния (Егор: без разноцветных иконок).

function useSoundState() {
  return useSyncExternalStore(
    (cb) => sound()?.subscribe(cb) ?? (() => {}),
    () => {
      const s = sound();
      return s
        ? `${s.settings.sfx}|${s.musicPlaying}|${s.settings.mood}|${s.settings.volume}|${s.track?.src ?? ""}`
        : "false|false|focus|0.8|";
    },
    () => "false|false|focus|0.8|",
  );
}

function Glyph({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const MOOD_GLYPH: Record<MoodId, ReactNode> = {
  focus: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chill: (
    <>
      <path d="M3.5 14c2.2-2.4 4.3-2.4 6.5 0s4.3 2.4 6.5 0 3.3-1.6 4-1" />
      <path d="M3.5 9.5c2.2-2.4 4.3-2.4 6.5 0s4.3 2.4 6.5 0 3.3-1.6 4-1" />
    </>
  ),
  jazzhop: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 6.5a5.5 5.5 0 0 1 5.5 5.5" />
    </>
  ),
  nightdrive: (
    <>
      <path d="M3.5 15.5 5.4 10a2 2 0 0 1 1.9-1.4h9.4a2 2 0 0 1 1.9 1.4l1.9 5.5v2.5h-17z" />
      <circle cx="7.5" cy="15" r=".6" />
      <circle cx="16.5" cy="15" r=".6" />
    </>
  ),
  tokyo: (
    <>
      <path d="M17.5 4.5a6.5 6.5 0 1 0 2 9.8A7.5 7.5 0 0 1 17.5 4.5z" />
    </>
  ),
  soul: (
    <>
      <rect x="9" y="3.5" width="6" height="10" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" />
    </>
  ),
};

/** Тонкий регулятор громкости: заливка градиентом до текущего значения. */
function VolumeSlider({ value, className = "", from = "#38e1ff", to = "#a36bff" }: { value: number; className?: string; from?: string; to?: string }) {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={(e) => sound()?.setVolume(Number(e.target.value))}
      aria-label="Громкость"
      className={`h-1 cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-paper [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-paper ${className}`}
      style={{
        background: `linear-gradient(90deg, ${from}, ${to}) 0 / ${value * 100}% 100% no-repeat, rgba(244,244,246,0.2)`,
      }}
    />
  );
}

/** Нота в шапке, которая пульсирует в ритм музыки: масштаб берём от
 *  басов (бочка), с быстрой атакой и мягким спадом. Рисуется через
 *  style.transform по кадрам — без ререндеров React. */
function PulseNote({ playing, muted }: { playing: boolean; muted: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!playing) {
      el.style.transform = "";
      return;
    }
    const levels = [0, 0, 0, 0, 0, 0];
    let shown = 0;
    let floor = 0.3;
    let ceil = 0.6;
    let raf = 0;
    const draw = () => {
      sound()?.levels(6, levels);
      const low = (levels[0] + levels[1]) / 2;
      // Басы меряем в их собственном коридоре «тише всего — громче всего»
      // за последние секунды: так каждая доля бочки поднимает ноту почти до
      // максимума на любом треке, а между долями она опадает.
      floor = low < floor ? low : floor + (low - floor) * 0.06;
      ceil = low > ceil ? low : ceil + (low - ceil) * 0.015;
      const v = Math.max(0, Math.min(1, (low - floor) / Math.max(0.05, ceil - floor)));
      const target = v * v;
      shown += (target - shown) * (target > shown ? 0.6 : 0.14);
      el.style.transform = `scale(${1 + shown * 0.3})`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [playing]);
  return (
    <span ref={ref} className="grid place-items-center will-change-transform">
      <Glyph>
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
        {muted ? (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        ) : (
          <>
            <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
            <path d="M18 6.5a8 8 0 0 1 0 11" />
          </>
        )}
      </Glyph>
    </span>
  );
}

// Цвет обложки каждого настроения — как у альбома в Apple Music: вся
// «пластинка» и подсветка окна берут пару цветов отсюда.
const MOOD_COLORS: Record<MoodId, [string, string]> = {
  focus: ["#38e1ff", "#3b6bff"],
  chill: ["#5eead4", "#38bdf8"],
  jazzhop: ["#ffb347", "#ff6a3d"],
  nightdrive: ["#4f7cff", "#a36bff"],
  tokyo: ["#a36bff", "#38e1ff"],
  soul: ["#f6c177", "#e8743b"],
};

// Настроение под страницу — подсказка, а не автозапуск: пока человек сам
// не выбрал настроение за этот визит, плеер открывается на подходящем, и
// его плитка помечена «к странице». По сюжетам роликов страниц: /content —
// творческая студия, /ai — работа в тишине виллы, /sites — ночная дорога,
// /smm — вечеринка.
const PAGE_MOOD: Record<ServiceKey, MoodId> = {
  content: "jazzhop",
  ai: "focus",
  sites: "nightdrive",
  smm: "tokyo",
};

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Позиция трека — опрашиваем 4 раза в секунду, пока окно открыто. */
function useProgress(active: boolean) {
  const [p, setP] = useState({ time: 0, duration: 0 });
  useEffect(() => {
    if (!active) return;
    const tick = () => setP(sound()?.progress() ?? { time: 0, duration: 0 });
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [active]);
  return p;
}

// Волна плеера (референс Егора 2026-09-27: пучок тонких линий с острыми
// пиками вверх и вниз и яркой осью). Логика профессионального спектра:
// каждая полоса частот стоит на своём месте по ширине (логарифмически,
// басы слева, верха справа) и поднимает свой пик. У каждой полосы свой
// «потолок» (адаптивная нормировка), иначе верха всегда тише басов и правая
// половина волны лежала бы плоско. Удар бочки — короткая вспышка яркости.
const BANDS = 18;
const LINES = 22;

/** Точка сплайна Катмулла — Рома: плавная кривая через контрольные точки. */
function spline(p: number[], t: number) {
  const n = p.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, t * n));
  const i = Math.floor(f);
  const u = f - i;
  const p0 = p[Math.max(0, i - 1)];
  const p1 = p[i];
  const p2 = p[i + 1];
  const p3 = p[Math.min(n, i + 2)];
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
}

/** Верхний блок плеера: волна в такт музыке прямо на стекле окна. */
function Artwork({ moodId }: { moodId: MoodId }) {
  const [from, to] = MOOD_COLORS[moodId];
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const g = canvas.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    const raw = new Array<number>(BANDS).fill(0);
    const ceil = new Array<number>(BANDS).fill(0.2);
    const shown = new Array<number>(BANDS).fill(0.2);
    const pts = new Array<number>(BANDS + 2).fill(0);
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, from);
    grad.addColorStop(0.5, to);
    grad.addColorStop(1, from);
    const axis = g.createLinearGradient(0, 0, w, 0);
    axis.addColorStop(0, "rgba(255,255,255,0)");
    axis.addColorStop(0.5, "rgba(255,255,255,0.95)");
    axis.addColorStop(1, "rgba(255,255,255,0)");
    const mid = h / 2;
    let raf = 0;
    let phase = 0;
    let t = 0;
    let lowAvg = 0;
    let kick = 0;
    let energy = 0;
    const draw = () => {
      t += 1;
      sound()?.levels(BANDS, raw);
      let sum = 0;
      for (let i = 0; i < BANDS; i++) {
        // Потолок полосы быстро подстраивается под её громкость — так и
        // тихие верха, и громкие басы раскачивают волну в полную силу.
        ceil[i] = Math.max(raw[i], ceil[i] * 0.985, 0.05);
        // Смесь «относительно себя» и «как есть»: каждая полоса живая, но
        // громкие частоты всё равно выше тихих — пики разной высоты.
        const rel = Math.pow(Math.min(1, raw[i] / ceil[i]), 1.8);
        const norm = Math.min(1, rel * 0.6 + raw[i] * 0.7);
        // Волна никогда не лежит: даже в тишине дышит на четверть высоты.
        const target = Math.max(0.22 + 0.08 * Math.sin(t * 0.021 + i * 0.7), norm);
        shown[i] += (target - shown[i]) * (target > shown[i] ? 0.6 : 0.16);
        sum += shown[i];
      }
      energy += (sum / BANDS - energy) * 0.1;
      // Бочка: низы резко выше своего среднего → толчок амплитуды и света.
      const low = (raw[0] + raw[1] + raw[2]) / 3;
      if (low > lowAvg * 1.25 && low > 0.2) kick = 1;
      lowAvg += (low - lowAvg) * 0.06;
      kick *= 0.86;
      // Волна всё время бежит; чем громче музыка, тем быстрее.
      phase += 0.035 + energy * 0.09 + kick * 0.05;

      pts[0] = shown[0] * 0.6;
      pts[BANDS + 1] = shown[BANDS - 1] * 0.6;
      for (let i = 0; i < BANDS; i++) pts[i + 1] = shown[i];

      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      g.lineWidth = 0.8;
      g.strokeStyle = grad;
      const gain = (mid - 2) * (0.92 + kick * 0.12);
      for (let k = 0; k < LINES; k++) {
        const q = k / (LINES - 1);
        // Пучок: линии с разной фазой и высотой, скрученные в ленту.
        const twist = (q - 0.5) * 2.4;
        const scale = 0.35 + 0.65 * Math.cos((q - 0.5) * Math.PI * 0.9);
        g.globalAlpha = (0.14 + scale * 0.3) * (1 + kick * 0.5);
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          const env = Math.pow(Math.sin(u * Math.PI), 0.7); // сходится к краям
          // Несущая «чирпом»: на басах волны широкие, к верхам — всё чаще.
          const arg = Math.PI * 2 * (1.6 * u + 2.6 * u * u) - phase;
          // Вторая гармоника со своим ходом ломает ровную синусоиду.
          const carrier = Math.sin(arg + twist) * 0.78 + Math.sin(arg * 1.9 + phase * 0.6 - twist * 0.5) * 0.3;
          const amp = spline(pts, u) * carrier * env * scale * gain;
          if (x === 0) g.moveTo(x, mid - amp);
          else g.lineTo(x, mid - amp);
        }
        g.stroke();
      }
      // Яркая ось по центру.
      g.globalAlpha = 0.55 + kick * 0.35;
      g.strokeStyle = axis;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, mid);
      g.lineTo(w, mid);
      g.stroke();
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };
    // Рисуем, пока окно открыто (компонент живёт только в нём): волна
    // дышит и на паузе, а с музыкой раскачивается в такт.
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  return <canvas ref={ref} className="block h-[96px] w-full" aria-hidden="true" />;
}

function TransportIcon({ kind }: { kind: "play" | "pause" | "prev" | "next" }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {kind === "play" && <path d="M7 4.8c0-1 1.1-1.6 1.9-1.1l11 7.2c.8.5.8 1.7 0 2.2l-11 7.2c-.8.5-1.9-.1-1.9-1.1z" />}
      {kind === "pause" && (
        <>
          <rect x="5.5" y="4" width="4.5" height="16" rx="1.4" />
          <rect x="14" y="4" width="4.5" height="16" rx="1.4" />
        </>
      )}
      {kind === "next" && (
        <>
          <path d="M2.5 6.6c0-.8.9-1.3 1.6-.8l7.4 5.4c.5.4.5 1.2 0 1.6l-7.4 5.4c-.7.5-1.6 0-1.6-.8z" />
          <path d="M12 6.6c0-.8.9-1.3 1.6-.8l7.4 5.4c.5.4.5 1.2 0 1.6l-7.4 5.4c-.7.5-1.6 0-1.6-.8z" />
        </>
      )}
      {kind === "prev" && (
        <>
          <path d="M21.5 6.6c0-.8-.9-1.3-1.6-.8l-7.4 5.4c-.5.4-.5 1.2 0 1.6l7.4 5.4c.7.5 1.6 0 1.6-.8z" />
          <path d="M12 6.6c0-.8-.9-1.3-1.6-.8L3 11.2c-.5.4-.5 1.2 0 1.6l7.4 5.4c.7.5 1.6 0 1.6-.8z" />
        </>
      )}
    </svg>
  );
}

// Открыть плеер снаружи — из строки «Музыка» в меню на телефоне, где
// кнопки в шапке нет.
const OPEN_EVENT = "hdkv:open-sound";
export function openSoundStation() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function SoundStation() {
  const state = useSoundState();
  const [sfxOn, musicOn, moodId, vol] = state.split("|") as ["true" | "false", "true" | "false", MoodId, string, string];
  const volume = Number(vol);
  const sfx = sfxOn === "true";
  const playing = musicOn === "true";
  const mood = MOODS.find((m) => m.id === moodId) ?? MOODS[0];
  const track = sound()?.track ?? null;
  const [from, to] = MOOD_COLORS[mood.id];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 64, right: 12 });
  const { time, duration } = useProgress(open);
  const pathname = useCleanPathname();
  const svc = serviceFromPath(pathname ?? "/");
  const pageMood = svc ? PAGE_MOOD[svc] : null;
  const [scrub, setScrub] = useState<number | null>(null);

  // Окно висит в портале (иначе стекло шапки «запирает» fixed внутри себя),
  // поэтому место считаем от кнопки: правый край окна — под динамиком.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      let r = wrapRef.current?.getBoundingClientRect();
      // Кнопка скрыта (телефон, плеер открыли из меню) — окно под шапкой.
      if (!r || r.height === 0) r = document.querySelector("[data-site-header]")?.getBoundingClientRect();
      if (!r) return;
      const right = window.innerWidth < 640 ? 12 : Math.max(12, window.innerWidth - r.right - 8);
      setPos({ top: r.bottom + 12, right });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPlayer = () => {
    if (open) return;
    const s = sound();
    if (s && pageMood && !s.moodPicked && !s.musicPlaying) {
      const m = MOODS.find((x) => x.id === pageMood);
      if (m?.tracks.length) s.setMood(pageMood);
    }
    setOpen(true);
    sound()?.play("open");
  };

  // Наведение раскрывает плеер под значком, уход курсора (с небольшой
  // задержкой, чтобы успеть перейти в окно) закрывает.
  const closeTimer = useRef<number | null>(null);
  const canHover = () => window.matchMedia("(hover: hover)").matches;
  const hoverIn = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (canHover()) openPlayer();
  };
  const hoverOut = () => {
    if (!canHover()) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 280);
  };

  const onIconClick = () => {
    const s = sound();
    if (!s) return;
    // Есть наведение — клик включает/выключает звук; на сенсорных экранах
    // клик открывает плеер, а звук включается переключателем в нём.
    if (!canHover()) {
      toggleOpen();
      return;
    }
    if (s.settings.sfx || s.musicPlaying) {
      s.toggleMusic(false);
      s.setSfx(false);
    } else {
      s.setSfx(true);
    }
  };

  const toggleOpen = () => {
    const s = sound();
    if (!open && s && pageMood && !s.moodPicked && !s.musicPlaying) {
      const m = MOODS.find((x) => x.id === pageMood);
      if (m?.tracks.length) s.setMood(pageMood);
    }
    setOpen((v) => !v);
    sound()?.play(open ? "close" : "open");
  };

  useEffect(() => {
    const onOpen = () => {
      if (!open) toggleOpen();
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  });

  const pickMood = (id: MoodId) => {
    const s = sound();
    if (!s) return;
    const m = MOODS.find((x) => x.id === id);
    if (!m?.tracks.length) return;
    s.moodPicked = true;
    s.setMood(id);
    if (!s.settings.sfx) s.setSfx(true);
    if (!s.musicPlaying) s.toggleMusic(true);
    s.play("click");
  };

  const hasTracks = mood.tracks.length > 0;
  const shownTime = scrub ?? time;
  const pct = duration ? (shownTime / duration) * 100 : 0;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="music-dim"
            className="music-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            key="music-player"
            ref={panelRef}
            role="dialog"
            aria-label="Музыка сайта"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="music-player"
            style={{ top: pos.top, right: pos.right, "--m-from": from, "--m-to": to } as CSSProperties}
            data-sound="off"
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {/* Подсветка окна цветом обложки — как фон плеера Apple Music. */}
            <div className="music-player__ambient" aria-hidden="true" />

            <div className="relative flex flex-col gap-4">
              <Artwork moodId={mood.id} />

              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[18px] font-bold leading-tight text-white">
                    {track?.title ?? "Скоро здесь"}
                  </div>
                  <div className="music-grad-text truncate text-[14px] font-semibold leading-snug">
                    {track ? `${track.artist} · ${mood.label}` : `${mood.label} · треки подбираем`}
                  </div>
                </div>
              </div>

              {/* Полоса прогресса: тянется за пальцем, отпустил — перемотка. */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={shownTime}
                  disabled={!duration}
                  onChange={(e) => setScrub(Number(e.target.value))}
                  onPointerUp={() => {
                    if (scrub != null) sound()?.seek(scrub);
                    setScrub(null);
                  }}
                  onKeyUp={() => {
                    if (scrub != null) sound()?.seek(scrub);
                    setScrub(null);
                  }}
                  aria-label="Позиция трека"
                  className="music-scrub w-full"
                  style={{
                    background: `linear-gradient(90deg, ${from}, ${to}) 0 / ${pct}% 100% no-repeat, rgba(255,255,255,0.18)`,
                  }}
                />
                <div className="mt-1.5 flex justify-between text-[11px] font-bold tabular-nums text-white">
                  <span>{fmt(shownTime)}</span>
                  <span>−{fmt(Math.max(0, duration - shownTime))}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-9">
                <button
                  type="button"
                  onClick={() => sound()?.skip(-1)}
                  disabled={!hasTracks}
                  aria-label="Предыдущий трек"
                  className="music-btn h-7 w-7"
                >
                  <TransportIcon kind="prev" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = sound();
                    if (s && !s.musicPlaying && !s.settings.sfx) s.setSfx(true);
                    s?.toggleMusic();
                    s?.play("click");
                  }}
                  disabled={!hasTracks}
                  aria-label={playing ? "Пауза" : "Играть"}
                  className="music-btn h-11 w-11"
                >
                  <TransportIcon kind={playing ? "pause" : "play"} />
                </button>
                <button
                  type="button"
                  onClick={() => sound()?.skip(1)}
                  disabled={!hasTracks}
                  aria-label="Следующий трек"
                  className="music-btn h-7 w-7"
                >
                  <TransportIcon kind="next" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 text-white">
                <Glyph size={15}>
                  <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
                </Glyph>
                <VolumeSlider value={volume} from={from} to={to} className="flex-1" />
                <Glyph size={15}>
                  <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
                  <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
                </Glyph>
              </div>

              <div>
                <div className="music-kicker">Настроение</div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Настроения">
                  {MOODS.map((m) => {
                    const active = m.id === mood.id;
                    const [a, b] = MOOD_COLORS[m.id];
                    const soon = !m.tracks.length;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => pickMood(m.id)}
                        className={`music-mood ${active ? "is-active" : ""} ${soon ? "is-soon" : ""}`}
                        style={{ "--a": a, "--b": b } as CSSProperties}
                      >
                        <span className="music-mood__dot">
                          <Glyph size={14}>{MOOD_GLYPH[m.id]}</Glyph>
                        </span>
                        <span className="text-[12px] font-bold leading-none">{m.label}</span>
                        <span className="text-[10px] font-semibold leading-none">{soon ? "скоро" : m.genre}</span>
                        {m.id === pageMood && !soon && <span className="music-mood__page">к странице</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <span className="text-[13px] font-bold text-white">Звуки сайта</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sfx}
                  aria-label="Звуки сайта"
                  onClick={() => sound()?.setSfx(!sfx)}
                  className="relative h-6 w-11 rounded-full transition-colors duration-200"
                  style={{ background: sfx ? `linear-gradient(90deg, ${from}, ${to})` : "rgba(255,255,255,0.15)" }}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-[left] duration-200 ${sfx ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center land:pointer-events-auto"
      data-sound="off"
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
      {/* Одна кнопка на звук и музыку: динамик открывает плеер. Пока играет
          музыка, рядом бежит дорожка в такт; на компьютере при наведении
          выезжает громкость. */}
      <div className="group/vol flex items-center">
        <button
          type="button"
          onClick={onIconClick}
          aria-label={sfx || playing ? "Выключить звук" : "Включить звук"}
          aria-expanded={open}
          title={sfx || playing ? "Звук включён" : "Звук выключен"}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-11 sm:w-11 ${
            playing ? "text-glow" : sfx ? "text-paper/80 hover:text-paper" : "text-paper/45 hover:text-paper/80"
          }`}
        >
          {/* Значок звука линией, как остальные иконки шапки: наведение
              раскрывает плеер, клик включает/выключает звук (выключенный
              перечёркнут). Пока играет музыка, пульсирует в ритм. */}
          <PulseNote playing={playing} muted={!sfx && !playing} />
        </button>
        <div className="hidden w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-300 ease-out group-hover/vol:w-[76px] group-hover/vol:opacity-100 group-focus-within/vol:w-[76px] group-focus-within/vol:opacity-100 lg:flex">
          <VolumeSlider value={volume} className="mx-1 w-[68px]" />
        </div>
      </div>
      {typeof document !== "undefined" && createPortal(panel, document.body)}
    </div>
  );
}
