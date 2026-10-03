"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LeadModal from "@/components/home/LeadModal";
import { PhoneIcon } from "@/components/ui/Icons";
import { blurAt, fanSlots, modIndex, poseAt, useDeckDrag, useDeckSpring, zFor } from "@/components/ui/deckFan";

// Карусель рилсов в первом блоке /content — на месте высокого окошка Егора.
// Те же примитивы, что у AiDeck/SitesDeck: перетаскивание с инерцией,
// пружина без рывков, размытие соседей по глубине. Отличия по просьбе Егора:
// без рамки и стекла — рилсы лежат прямо на фоне страницы, а края колоды
// гаснут маской, а не обрезаются.
const REELS = Array.from({ length: 22 }, (_, i) => String(i + 1).padStart(2, "0"));

// Плоская раскладка (без поворота): центр, два соседа, два дальних.
const POSE: Record<number, { x: number; scale: number; opacity: number }> = {
  [-3]: { x: -236, scale: 0.6, opacity: 0 },
  [-2]: { x: -156, scale: 0.72, opacity: 0.5 },
  [-1]: { x: -115, scale: 0.86, opacity: 0.92 },
  [0]: { x: 0, scale: 1, opacity: 1 },
  [1]: { x: 115, scale: 0.86, opacity: 0.92 },
  [2]: { x: 156, scale: 0.72, opacity: 0.5 },
  [3]: { x: 236, scale: 0.6, opacity: 0 },
};

/** Ход руки на одну карточку, px. */
const SPACING = 115;

/** Рилс переднего плана. Играет сразу и на телефоне тоже (Егор, 2026-10-03:
 *  «первый рилс не воспроизводится»): muted ставим руками до play() (React не
 *  кладёт его в HTML), одной попытки мало — сторож повторяет, пока не пойдёт,
 *  а возврат страницы и касание считаются разрешением iOS. Если iOS отказал
 *  совсем (энергосбережение блокирует автозапуск до тапа), сообщаем колоде —
 *  она не застревает на кадре, а листает постеры, пока не будет касания. */
function ReelVideo({
  src,
  poster,
  onEnded,
  onError,
  setBlocked,
}: {
  src: string;
  poster: string;
  onEnded: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onError: () => void;
  setBlocked: (v: boolean) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    const kick = () => {
      if (!el.paused || el.ended || document.hidden) return;
      el.play().catch((err: unknown) => {
        if ((err as { name?: string })?.name === "NotAllowedError") setBlocked(true);
      });
    };
    kick();
    const watchdog = window.setInterval(kick, 500);
    window.addEventListener("touchend", kick, { passive: true });
    window.addEventListener("pointerup", kick, { passive: true });
    window.addEventListener("pageshow", kick);
    document.addEventListener("visibilitychange", kick);
    el.addEventListener("loadeddata", kick);
    el.addEventListener("canplay", kick);
    return () => {
      window.clearInterval(watchdog);
      window.removeEventListener("touchend", kick);
      window.removeEventListener("pointerup", kick);
      window.removeEventListener("pageshow", kick);
      document.removeEventListener("visibilitychange", kick);
      el.removeEventListener("loadeddata", kick);
      el.removeEventListener("canplay", kick);
    };
  }, [setBlocked]);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      playsInline
      onPlaying={() => setBlocked(false)}
      onEnded={onEnded}
      onError={onError}
      preload="auto"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export default function ReelsDeck({ running }: { running: boolean }) {
  const count = REELS.length;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [lite, setLite] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  useEffect(() => {
    setLite(document.documentElement.hasAttribute("data-lite"));
  }, []);

  // iOS не дал запустить рилс: колода листает постеры, чтобы не стоять на
  // одном кадре; как только касание запустит видео, onPlaying снимет флаг.
  useEffect(() => {
    if (!blocked || !running) return;
    const id = window.setTimeout(() => setActive((p) => p + 1), 3200);
    return () => window.clearTimeout(id);
  }, [blocked, running, active]);

  const step = useCallback((delta: number) => setActive((p) => p + delta), []);
  const { drag, dragging, bind } = useDeckDrag({ count, spacing: SPACING, onSettle: step });
  const { lag, moving } = useDeckSpring(active, drag, dragging);
  const live = dragging || moving;
  const idx = modIndex(active, count);

  // Каждый рилс доигрывает до конца, и только потом колода сама переходит
  // к следующему (он стартует сначала). Если рилс перелистали рукой —
  // следующий тоже начинается с начала и доигрывается до конца. Пока курсор
  // на колоде, рилс крутится по кругу и не уходит. На слабых устройствах
  // (data-lite) блюр соседей снят, а сам рилс играет так же.
  const onEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (held) {
      e.currentTarget.currentTime = 0;
      void e.currentTarget.play();
    } else {
      setActive((p) => p + 1);
    }
  };
  // Если видео не загрузилось, колода не застревает на нём.
  const onFail = () => {
    window.setTimeout(() => setActive((p) => p + 1), 3200);
  };

  return (
    <div
      className="relative h-full min-h-[360px] w-full"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      <h3 className="pointer-events-none absolute inset-x-0 top-0 z-[200] text-center font-display text-lg uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] sm:text-xl">
        AI-контент <span className="kw">для вас</span>
      </h3>
      <div
        className="deck-rail absolute inset-x-0 bottom-12 top-8 select-none"
        style={{
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "pan-y",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
        {...bind}
      >
        {fanSlots(count, active, drag + lag).map(({ i, key, offset, settled }) => {
          const pose = poseAt(POSE, offset);
          const opacity = pose.opacity * pose.fade;
          const blurPx = lite ? 0 : blurAt(offset);
          const isFront = settled === 0 && !live;
          return (
            <div
              key={key}
              className={`deck-pose ${blurPx > 0 ? "deck-pose-blur" : ""} absolute left-1/2 top-1/2 h-[290px] w-[163px] ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                live ? "transition-[filter] duration-[420ms]" : "transition-[transform,opacity,filter] duration-[500ms]"
              }`}
              style={{
                ["--deck-blur" as string]: `${blurPx}px`,
                zIndex: zFor(offset),
                opacity,
                pointerEvents: "none",
                transform: `translate(-50%, -50%) translate3d(${pose.x}px, 0, 0) scale(${pose.scale})`,
                willChange: "transform, opacity",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-black shadow-[0_14px_40px_rgba(0,0,0,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/video/reels/r${REELS[i]}.jpg`}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {isFront && running && (
                  <ReelVideo
                    src={`/video/reels/r${REELS[i]}.mp4`}
                    poster={`/video/reels/r${REELS[i]}.jpg`}
                    onEnded={onEnded}
                    onError={onFail}
                    setBlocked={setBlocked}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-[200] flex items-center justify-center gap-3">
        <button type="button" onClick={() => setLeadOpen(true)} className="btn-neon inline-flex !px-3.5 !py-1.5 !text-[10px]">
          Хочу так же →
        </button>
        <button
          type="button"
          onClick={() => setLeadOpen(true)}
          aria-label="Заказать звонок"
          className="btn-neon grid h-8 w-8 shrink-0 !p-0 place-items-center text-paper/85 transition-colors duration-300 hover:text-orange"
          style={{ "--btn-neon-delay": "1.8s" } as React.CSSProperties}
        >
          <PhoneIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
      <span className="sr-only">
        Рилс {idx + 1} из {count}
      </span>
    </div>
  );
}
