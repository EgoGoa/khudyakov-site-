"use client";

import { useCallback, useState } from "react";

// The format carousel on /smm's chapter 01 — the same fanned card rail
// SitesDeck works out in detail (see that file for why the fan is built from
// flat translate+scale transforms rather than a real `rotateY`: a 3D-rotated
// backdrop-blur panel forces its own compositing layer over the reel playing
// underneath and the whole stage stutters on every swap).
//
// What differs here is the card itself. /sites fans browser windows, so its
// cards are landscape; /smm sells vertical video, so these are 9:16 phone
// frames — narrower and taller, with the fan's x-offsets pulled in to match
// the smaller width. The artwork is drawn in CSS rather than shipped as
// images: zero bytes, always on palette, and at card size it reads as the
// format. Swap for real screenshots later by replacing FormatThumb alone.

type Format = {
  id: string;
  name: string;
  blurb: string;
  meta: string;
  /** Which phone-screen mockup to draw inside the card — see FormatThumb. */
  shape: "reels" | "stories" | "carousel" | "ads" | "bloggers";
};

// Wording taken from lib/service-content.ts (servicesByCategory.smm) rather
// than rewritten here, so the carousel can't drift from what chapter 03 says
// a few screens later.
const FORMATS: Format[] = [
  {
    id: "reels",
    name: "Reels",
    blurb: "Вертикальные ролики снимаем и монтируем сами — те же операторы, что снимают рекламу.",
    meta: "8–12 роликов в месяц",
    shape: "reels",
  },
  {
    id: "stories",
    name: "Сторис",
    blurb: "Ежедневная лента историй: анонсы, закулисье, опросы — держит аккаунт живым между роликами.",
    meta: "каждый рабочий день",
    shape: "stories",
  },
  {
    id: "carousel",
    name: "Карусели",
    blurb: "Посты-объяснения на несколько экранов — то, что аудитория сохраняет и пересылает.",
    meta: "4–8 постов в месяц",
    shape: "carousel",
  },
  {
    id: "ads",
    name: "Таргет",
    blurb: "Настройка, тесты креативов и оптимизация бюджета — реклама на том же контенте, что ведём.",
    meta: "тесты каждую неделю",
    shape: "ads",
  },
  {
    id: "bloggers",
    name: "Блогеры",
    blurb: "Подбор блогеров под аудиторию и бюджет, согласование интеграций, замер результата.",
    meta: "в пакете Full-service",
    shape: "bloggers",
  },
];

// The phone screen. One frame, one status strip, and the block rhythm of the
// format inside it — enough to tell five cards apart at 150px wide without a
// single downloaded byte.
function FormatThumb({ shape }: { shape: Format["shape"] }) {
  const bar = (w: string, dim = false) => (
    <span
      className={`block h-1.5 rounded-[2px] ${dim ? "bg-paper/12" : "bg-paper/22"}`}
      style={{ width: w }}
    />
  );

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1d1730] to-[#0c0b14]">
      {/* Stories-style progress strip along the top — the one cue every
          vertical-video surface shares, so it reads as "phone" instantly. */}
      <div className="flex gap-1 px-2.5 pt-2.5">
        <span className="h-[3px] flex-1 rounded-full bg-paper/55" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
      </div>

      {shape === "reels" && (
        <div className="relative mt-2.5 h-[150px]">
          <span className="absolute inset-x-2.5 inset-y-0 rounded-[6px] bg-gradient-to-br from-[#a855f7]/40 via-[#6d3ff0]/25 to-[#38bdf8]/30" />
          <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/25">
            <span
              className="block h-0 w-0 translate-x-[1px] border-y-[6px] border-l-[10px] border-y-transparent border-l-white/85"
              aria-hidden="true"
            />
          </span>
          <span className="absolute inset-x-3.5 bottom-2.5 grid gap-1">
            {bar("80%")}
            {bar("50%", true)}
          </span>
        </div>
      )}

      {shape === "stories" && (
        <div className="mt-2.5 grid gap-1.5 px-2.5">
          <span className="block h-[86px] rounded-[6px] bg-gradient-to-b from-[#38bdf8]/35 to-[#a855f7]/25" />
          <div className="flex gap-1.5">
            <span className="block h-9 flex-1 rounded-[5px] bg-paper/10" />
            <span className="block h-9 flex-1 rounded-[5px] bg-paper/[0.07]" />
          </div>
          {bar("60%")}
        </div>
      )}

      {shape === "carousel" && (
        <div className="mt-2.5 px-2.5">
          {/* The next card peeking off the right edge is the whole tell of a
              carousel — a single flat panel would read as an ordinary post. */}
          <div className="flex gap-1.5 overflow-hidden">
            <span className="block h-[96px] w-[78%] shrink-0 rounded-[6px] bg-gradient-to-br from-[#a855f7]/35 to-[#38bdf8]/20" />
            <span className="block h-[96px] w-[78%] shrink-0 rounded-[6px] bg-paper/10" />
          </div>
          <div className="mt-2 flex justify-center gap-1">
            <span className="h-1 w-1 rounded-full bg-paper/70" />
            <span className="h-1 w-1 rounded-full bg-paper/25" />
            <span className="h-1 w-1 rounded-full bg-paper/25" />
          </div>
          <div className="mt-2 grid gap-1">
            {bar("70%")}
            {bar("45%", true)}
          </div>
        </div>
      )}

      {shape === "ads" && (
        <div className="mt-2.5 px-2.5">
          <span className="block font-mono text-[7px] uppercase tracking-[0.14em] text-[#7dd3fc]">
            Реклама
          </span>
          <span className="mt-1 block h-[74px] rounded-[6px] bg-gradient-to-br from-[#38bdf8]/35 to-[#a855f7]/20" />
          <div className="mt-2 grid gap-1">
            {bar("65%")}
            {bar("40%", true)}
          </div>
          <span className="mt-2 block h-3.5 w-2/3 rounded-[3px] bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" />
        </div>
      )}

      {shape === "bloggers" && (
        <div className="mt-2.5 px-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8]" />
            <span className="grid flex-1 gap-1">
              {bar("70%")}
              {bar("40%", true)}
            </span>
          </div>
          <span className="mt-2 block h-[74px] rounded-[6px] bg-paper/10" />
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[8px] text-[#f0a8ff]">♥</span>
            {bar("45%", true)}
          </div>
        </div>
      )}
    </div>
  );
}

// One entry per signed distance from the centre card. Nothing beyond ±2 is
// drawn — a sixth card would sit past the container's edge and only ever be a
// sliver. The x-offsets are tighter than /sites' (105/185 against 122/214)
// because these cards are 150px wide rather than 188.
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; blur: number; z: number }> = {
  [-2]: { x: -186, y: 26, scale: 0.7, opacity: 0.45, blur: 1.4, z: 10 },
  [-1]: { x: -106, y: 10, scale: 0.85, opacity: 0.78, blur: 0.4, z: 20 },
  [0]: { x: 0, y: -8, scale: 1, opacity: 1, blur: 0, z: 30 },
  [1]: { x: 106, y: 10, scale: 0.85, opacity: 0.78, blur: 0.4, z: 20 },
  [2]: { x: 186, y: 26, scale: 0.7, opacity: 0.45, blur: 1.4, z: 10 },
};

const CARD_SHELL =
  "rounded-[20px] border border-white/[0.14] bg-white/[0.055] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl backdrop-saturate-150";

// The page's button language: the flat gradient pill plus a glass
// circle-arrow, deliberately not the site-wide `.btn-neon.btn-3d` pressed key,
// which fights the flat glass every panel on this page is made of.
//
// The pill runs the brand ORANGE, borrowed verbatim from /sites, not this
// page's own violet. Both were built and Egor picked the orange on sight: on
// a night reel graded in purple and cold blue, a violet button sits *inside*
// the picture and stops reading as a control, while the warm pill is the one
// element on screen the footage has no colour for — so it reads as the thing
// to press. The violet stays where it belongs, on the heading keywords, the
// chapter numbers and the rail, which are type rather than controls.
export const PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

export const ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-colors duration-300 hover:border-orange/60 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

export default function SmmDeck() {
  const [active, setActive] = useState(0);
  const count = FORMATS.length;

  const step = useCallback(
    (delta: number) => setActive((prev) => (prev + delta + count) % count),
    [count],
  );

  const front = FORMATS[active];

  return (
    <div className="w-full max-w-[560px]">
      {/* Fixed height so the chapter's layout doesn't shift as the description
          under it changes length. */}
      <div className="relative h-[300px]">
        {FORMATS.map((format, i) => {
          // Signed, wrapped distance from the active card: -2..+2, so the last
          // card sits to the *left* of the first rather than looping the long
          // way round.
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const pose = FAN[offset];
          if (!pose) return null;

          const isFront = offset === 0;

          return (
            <button
              key={format.id}
              type="button"
              onClick={() => setActive(i)}
              tabIndex={isFront ? -1 : 0}
              aria-label={`Показать формат: ${format.name}`}
              aria-current={isFront ? "true" : undefined}
              className={`absolute left-1/2 top-1/2 h-[250px] w-[150px] overflow-hidden text-left transition-all duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${CARD_SHELL} ${
                isFront ? "cursor-default" : "cursor-pointer"
              }`}
              style={{
                zIndex: pose.z,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
              }}
            >
              <FormatThumb shape={format.shape} />

              {/* Caption on the centre card only. On a card at 70% behind a
                  blur it would be unreadable noise. */}
              {isFront && (
                <>
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                    style={{
                      background: "linear-gradient(180deg, rgba(11,11,16,0) 0%, rgba(11,11,16,0.92) 70%)",
                    }}
                  />
                  <span className="absolute inset-x-3.5 bottom-4 block">
                    <span className="block font-display text-[15px] uppercase leading-none tracking-tight text-paper">
                      {format.name}
                    </span>
                    <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#c4a0ff]">
                      {format.meta}
                    </span>
                  </span>
                  <span className="absolute right-2.5 top-3 rounded-full bg-ink/70 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                </>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Предыдущий формат"
          className={`absolute left-0 top-1/2 z-40 -translate-y-1/2 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Следующий формат"
          className={`absolute right-0 top-1/2 z-40 -translate-y-1/2 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* The lit track: one node per format, the active one flaring the page's
          violet. It looks like the chapter rail down the left edge on purpose,
          but the two never share state — that one walks chapters, this one
          walks formats. */}
      <div className="relative mx-auto mt-7 flex max-w-[340px] items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(168,85,247,0) 0%, rgba(168,85,247,0.45) 10%, rgba(56,189,248,0.45) 90%, rgba(56,189,248,0) 100%)",
          }}
        />
        {FORMATS.map((format, i) => {
          const on = i === active;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={format.name}
              aria-current={on ? "true" : undefined}
              className="relative grid h-8 w-8 place-items-center rounded-full border bg-ink font-mono text-[9px] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a855f7] motion-reduce:transition-none"
              style={{
                borderColor: on ? "#a855f7" : "rgba(168,85,247,0.28)",
                color: on ? "#e4d0ff" : "rgba(220,221,239,0.45)",
                boxShadow: on
                  ? "0 0 12px rgba(168,85,247,0.95), 0 0 34px rgba(168,85,247,0.5), inset 0 0 10px rgba(168,85,247,0.3)"
                  : "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {/* What the selected format is and at what cadence. No button of its own
          — the chapter's single "Обсудить формат" lives in the copy column
          beside the fan, and a second copy here read as the same offer made
          twice. */}
      <div className="mt-6">
        <p className="min-h-[38px] max-w-[420px] text-[13px] leading-snug text-paper/55">{front.blurb}</p>
      </div>
    </div>
  );
}
