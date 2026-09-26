"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOODS, sound, type MoodId } from "@/lib/sound";

// «Станция HDKV» в шапке: две отдельные кнопки. Динамик — звук сайта
// (интерфейс + окружение сцен), включён по умолчанию. Нота — музыка:
// по клику открывается список настроений, а пока трек играет, рядом с нотой
// бежит дорожка, которая пульсирует в такт самой музыке (анализатор в
// lib/sound), а не по заготовленной анимации.
//
// Иконки монохромные линии, как у остального меню шапки; цвет — только
// свечение активного состояния (Егор: без разноцветных иконок).

function useSoundState() {
  return useSyncExternalStore(
    (cb) => sound()?.subscribe(cb) ?? (() => {}),
    () => {
      const s = sound();
      return s ? `${s.settings.sfx}|${s.musicPlaying}|${s.settings.mood}|${s.settings.volume}` : "true|false|focus|0.8";
    },
    () => "true|false|focus|0.8",
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
  confident: (
    <>
      <path d="M6 5h12l-1.4 13.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z" />
      <path d="M6.7 11h10.6" />
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
  classic: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="M8 5v9M12 5v9M16 5v9M6.8 5v6M10.8 5v6" />
    </>
  ),
};

/** Тонкий регулятор громкости: заливка градиентом до текущего значения. */
function VolumeSlider({ value, className = "" }: { value: number; className?: string }) {
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
        background: `linear-gradient(90deg, #38e1ff, #a36bff) 0 / ${value * 100}% 100% no-repeat, rgba(244,244,246,0.2)`,
      }}
    />
  );
}

const BARS = 14;

/** Дорожка в такт музыке. Рисуется в canvas по кадрам — без ререндеров React. */
function Waveform({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = 44;
    const h = 18;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const g = canvas.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    const levels = new Array<number>(BARS).fill(0);
    const shown = new Array<number>(BARS).fill(0);
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#38e1ff");
    grad.addColorStop(1, "#a36bff");
    let raf = 0;
    const draw = () => {
      sound()?.levels(BARS, levels);
      g.clearRect(0, 0, w, h);
      g.fillStyle = grad;
      const bw = 2;
      const gap = (w - BARS * bw) / (BARS - 1);
      for (let i = 0; i < BARS; i++) {
        // Спокойная дорожка (Егор: «всегда на пределе пиков»): уровень
        // приглушён, потолок — две трети высоты, атака и спад плавные,
        // так что полоски дышат, а не бьются в край.
        const target = Math.min(1, levels[i] * 0.8);
        shown[i] += (target - shown[i]) * (target > shown[i] ? 0.3 : 0.08);
        const bh = Math.max(2, shown[i] * h * 0.68);
        const x = i * (bw + gap);
        g.beginPath();
        g.roundRect(x, (h - bh) / 2, bw, bh, 1);
        g.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (playing) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return <canvas ref={ref} style={{ width: 44, height: 18 }} aria-hidden="true" />;
}

export default function SoundStation() {
  const state = useSoundState();
  const [sfxOn, musicOn, moodId, vol] = state.split("|") as ["true" | "false", "true" | "false", MoodId, string];
  const volume = Number(vol);
  const sfx = sfxOn === "true";
  const playing = musicOn === "true";
  const mood = MOODS.find((m) => m.id === moodId) ?? MOODS[0];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
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

  const toggleOpen = () => {
    setOpen((v) => !v);
    sound()?.play(open ? "close" : "open");
  };

  const pickMood = (id: MoodId) => {
    const s = sound();
    if (!s) return;
    s.setMood(id);
    if (!s.musicPlaying) s.toggleMusic(true);
    s.play("click");
  };

  const hasTracks = mood.tracks.length > 0;

  return (
    <div ref={wrapRef} className="relative flex items-center land:pointer-events-auto" data-sound="off">
      {/* Одна кнопка на звук и музыку (просьба Егора, 2026-09-26 — вместо
          двух отдельных): динамик открывает весь проигрыватель, а в нём уже
          музыка, настроения, громкость и звуки сайта. Пока играет музыка,
          рядом бежит дорожка в такт. На компьютере при наведении выезжает
          громкость. */}
      <div className="group/vol flex items-center">
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Звук и музыка сайта"
          aria-expanded={open}
          title={sfx || playing ? "Звук и музыка" : "Звук выключен"}
          className={`relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-full transition-[color,padding] duration-300 sm:h-11 ${
            playing
              ? "px-2.5 text-glow"
              : `w-10 sm:w-11 ${sfx ? "text-paper/80 hover:text-paper" : "text-paper/45 hover:text-paper/80"}`
          }`}
        >
          <Glyph>
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
            {sfx || playing ? (
              <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
            ) : (
              <path d="M16 9.5l5 5M21 9.5l-5 5" />
            )}
          </Glyph>
          {playing && <Waveform playing={playing} />}
        </button>
        <div className="hidden w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-300 ease-out group-hover/vol:w-[76px] group-hover/vol:opacity-100 group-focus-within/vol:w-[76px] group-focus-within/vol:opacity-100 lg:flex">
          <VolumeSlider value={volume} className="mx-1 w-[68px]" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="station"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-3 top-14 z-20 w-[min(88vw,300px)] origin-top-right overflow-hidden rounded-2xl bg-ink/80 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:absolute sm:right-0 sm:top-full sm:mt-3 land:top-11"
          >
            {/* Сейчас играет */}
            <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3.5">
              <button
                type="button"
                onClick={() => {
                  sound()?.toggleMusic();
                  sound()?.play("click");
                }}
                disabled={!hasTracks}
                aria-label={playing ? "Пауза" : "Включить музыку"}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/15 disabled:opacity-40"
              >
                <Glyph size={18}>
                  {playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5.5 18.5 12 8 18.5z" />}
                </Glyph>
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold leading-tight text-paper">Музыка сайта</div>
                <div className="truncate text-[12px] font-semibold leading-tight text-paper">
                  {hasTracks ? `${mood.label} · ${mood.genre}` : `${mood.label} · скоро`}
                </div>
              </div>
              {playing && <Waveform playing={playing} />}
            </div>

            <nav className="flex flex-col p-1.5 pt-0" aria-label="Настроения">
              {MOODS.map((m) => {
                const active = m.id === mood.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => pickMood(m.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "bg-glow/10 text-glow" : "text-paper/85 hover:bg-paper/5 hover:text-paper"
                    }`}
                  >
                    <Glyph size={18}>{MOOD_GLYPH[m.id]}</Glyph>
                    <span className="flex-1 font-semibold">{m.label}</span>
                    <span className="text-[12px] font-semibold text-paper">{m.tracks.length ? m.genre : "скоро"}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 border-t border-paper/10 px-3.5 pb-1 pt-3">
              <span className="text-[13px] font-semibold text-paper">Громкость</span>
              <VolumeSlider value={volume} className="flex-1" />
            </div>
            <div className="flex items-center justify-between gap-3 px-3.5 py-3">
              <span className="text-[13px] font-semibold text-paper">Звуки сайта</span>
              <button
                type="button"
                role="switch"
                aria-checked={sfx}
                onClick={() => sound()?.setSfx(!sfx)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                  sfx ? "bg-gradient-to-r from-[#38e1ff] to-[#a36bff]" : "bg-paper/15"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-paper transition-[left] duration-200 ${sfx ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
