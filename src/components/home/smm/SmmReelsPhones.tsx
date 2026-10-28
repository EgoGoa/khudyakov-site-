"use client";

// Карусель рилсов в главе «Что делаем» (/smm): три iPhone в ряд — активный
// по центру и по одному по бокам. Играет только центральный; боковые стоят
// постером, чтобы на экране не крутилось три декодера сразу. Ролик доиграл —
// карусель плавно переезжает к следующему. Можно листать зажатием/свайпом
// или кликом по боковому телефону. Файлы свои, в public/video/smm-reels
// (аудитория открывает сайт без VPN — внешних хостингов нет).

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import PhoneFrame from "@/components/ui/PhoneFrame";

const REELS = [1, 2, 3, 4].map((n) => ({
  src: `/video/smm-reels/reel-${n}.mp4`,
  poster: `/video/smm-reels/reel-${n}.jpg`,
}));
const N = REELS.length;

const AdvanceCtx = createContext<() => void>(() => {});

// Смещение боковых телефонов в долях ширины экрана и их масштаб.
const SIDE_X = 0.86;
const SIDE_SCALE = 0.78;

function Reel({ index, active }: { index: number; active: boolean }) {
  const reel = REELS[index];
  return (
    <PhoneFrame className="h-[var(--ph)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={reel.poster}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {active && <ActiveVideo index={index} />}
    </PhoneFrame>
  );
}

function ActiveVideo({ index }: { index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const advance = useContext(AdvanceCtx);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      v.pause();
      return;
    }
    // Вне вьюпорта — пауза, чтобы ролик не доигрывал и не листал карусель
    // у пользователя за спиной.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      key={index}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={REELS[index].src}
      poster={REELS[index].poster}
      autoPlay
      muted
      playsInline
      preload="auto"
      data-force-play=""
      tabIndex={-1}
      onEnded={advance}
    />
  );
}


export default function SmmReelsPhones() {
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const moved = useRef(false);

  const go = useCallback((delta: number) => {
    setActive((a) => (a + delta + N) % N);
  }, []);
  const next = useCallback(() => go(1), [go]);

  return (
    <AdvanceCtx.Provider value={next}>
      <div
        // --ph — высота активного телефона; всё остальное считается от неё.
        // Не больше трети высоты экрана, чтобы заголовок, подпись и карточка
        // Веры уместились в одну сцену.
        className="relative mx-auto mt-6 w-full select-none [--ph:clamp(230px,34vh,370px)] max-lg:[--ph:min(34vh,290px)] land:mt-3"
        style={{ height: "var(--ph)", touchAction: "pan-y" }}
        role="group"
        aria-roledescription="carousel"
        aria-label="Примеры рилсов"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, id: e.pointerId };
          moved.current = false;
        }}
        onPointerMove={(e) => {
          if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) moved.current = true;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {REELS.map((_, i) => {
          // -1 слева, 0 центр, 1 справа; 2 — запасной, прячется за центром.
          const rel = ((i - active + N + 1) % N) - 1;
          const hidden = rel === 2;
          const x = hidden ? 0 : rel * SIDE_X;
          const scale = hidden ? 0.6 : rel === 0 ? 1 : SIDE_SCALE;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-0 aspect-[1/2] h-[var(--ph)] cursor-grab active:cursor-grabbing"
              style={{
                transform: `translateX(calc(-50% + var(--ph) * 0.5 * ${x})) scale(${scale})`,
                opacity: hidden ? 0 : 1,
                zIndex: rel === 0 ? 3 : hidden ? 1 : 2,
                filter: rel === 0 ? "none" : "brightness(0.5) saturate(0.85)",
                pointerEvents: hidden ? "none" : "auto",
                // Пружинный подъезд без рывков: быстрое начало, мягкая посадка.
                transition:
                  "transform 780ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease, filter 780ms ease",
              }}
              aria-hidden={rel !== 0}
              onClick={() => {
                if (!moved.current && rel !== 0 && !hidden) go(rel);
              }}
            >
              <Reel index={i} active={rel === 0} />
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
        {REELS.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-6 bg-[#c4a0ff]" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </AdvanceCtx.Provider>
  );
}
