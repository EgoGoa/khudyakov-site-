"use client";

import { useEffect, useRef, useState } from "react";
import { blurAt, fanSlots, modIndex, poseAt, useDeckSpring, zFor } from "@/components/ui/deckFan";

// Вертикальная колода с примерами визуала сайтов — в первом блоке /sites,
// под заголовком. Карточки сменяются сверху вниз каждые 6 секунд, с той же
// пружиной и размытием соседей, что у остальных колод; края гаснут маской.
//
// Референсы с Pinterest — это НЕ наши работы, и подпись под колодой говорит
// об этом прямо. Клипы обрезаны до интерфейса сайта (public/video/sites-refs);
// на слабых устройствах (data-lite) — только кадр.
const SHOTS = Array.from({ length: 10 }, (_, i) => `/video/sites-refs/s${String(i + 1).padStart(2, "0")}`);
const AUTO_MS = 6000;

// Пять карточек плотной стопкой: у соседей виден только край (~30%) за
// главной, дальше — ещё мельче, прозрачнее и размытее.
// y — в долях высоты карточки; плюс — выше центра (следующая заходит сверху).
const POSE: Record<number, { y: number; scale: number; opacity: number }> = {
  [-3]: { y: -0.8, scale: 0.64, opacity: 0 },
  [-2]: { y: -0.61, scale: 0.76, opacity: 0.4 },
  [-1]: { y: -0.32, scale: 0.88, opacity: 0.72 },
  [0]: { y: 0, scale: 1, opacity: 1 },
  [1]: { y: 0.32, scale: 0.88, opacity: 0.72 },
  [2]: { y: 0.61, scale: 0.76, opacity: 0.4 },
  [3]: { y: 0.8, scale: 0.64, opacity: 0 },
};

export default function SitesWorksDeck() {
  const count = SHOTS.length;
  const [active, setActive] = useState(0);
  const [lite, setLite] = useState(false);
  const [held, setHeld] = useState(false);
  // Карточка подгоняется под ширину колонки.
  const box = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(340);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardW(Math.round(Math.min(360, el.clientWidth * 0.86))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cardH = Math.round(cardW / 1.6);
  useEffect(() => {
    setLite(document.documentElement.hasAttribute("data-lite"));
  }, []);

  const { lag, moving } = useDeckSpring(active, 0, false);
  const idx = modIndex(active, count);

  // Раз в 6 секунд; пока курсор на колоде — стоим, клик по соседней карточке
  // переключает на неё и сбрасывает отсчёт.
  useEffect(() => {
    if (held) return;
    const t = window.setTimeout(() => setActive((p) => p + 1), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, held]);

  return (
    <div className="mt-12" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
      <span className="inline-block rounded-full border border-white/30 px-3 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-white">
        Референсы
      </span>
      <p className="mt-2 font-display text-2xl uppercase leading-tight tracking-tight text-white sm:text-3xl">
        Сделаем <span className="kw">так же</span>
      </p>
      <div ref={box} className="relative mt-3 w-full" style={{ height: Math.round(cardH * 2.2) }}>
        <div
          className="absolute inset-0 select-none"
          style={{
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
          }}
        >
          {fanSlots(count, active, lag).map(({ i, key, offset, settled }) => {
            const pose = poseAt(POSE, offset);
            const blurPx = lite ? 0 : blurAt(offset) * 4.2;
            const isFront = settled === 0 && !moving;
            return (
              <div
                key={key}
                onClick={() => offset !== 0 && setActive((p) => p + Math.round(offset))}
                className={`deck-pose ${blurPx > 0 ? "deck-pose-blur" : ""} absolute left-1/2 top-1/2 ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                  moving ? "transition-[filter] duration-[420ms]" : "transition-[transform,opacity,filter] duration-[500ms]"
                }`}
                style={{
                  ["--deck-blur" as string]: `${blurPx}px`,
                  width: cardW,
                  height: cardH,
                  zIndex: zFor(offset),
                  opacity: pose.opacity * pose.fade,
                  cursor: offset === 0 ? "default" : "pointer",
                  transform: `translate(-50%, -50%) translate3d(0, ${-pose.y * cardH}px, 0) scale(${pose.scale})`,
                  willChange: "transform, opacity",
                }}
              >
                {/* Размытие — прямо на карточке: общее правило .deck-pose-blur
                    целит в вложенные <a>/<button>, а здесь их нет. */}
                <div
                  className="relative h-full w-full overflow-hidden rounded-[16px] bg-black shadow-[0_14px_40px_rgba(0,0,0,0.5)] transition-[filter] duration-500"
                  style={{ filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${SHOTS[i]}.jpg`}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {isFront && (
                    <video
                      src={`${SHOTS[i]}.mp4`}
                      poster={`${SHOTS[i]}.jpg`}
                      autoPlay
                      data-force-play=""
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <span className="sr-only">
          Пример {idx + 1} из {count}
        </span>
      </div>
      <p className="mt-2 text-[10px] font-semibold leading-snug text-white/50">
        Референсы с Pinterest — работы их авторов, не наши. Такой уровень делаем и для вас.
      </p>
    </div>
  );
}
