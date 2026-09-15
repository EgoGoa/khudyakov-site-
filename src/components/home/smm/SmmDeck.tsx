"use client";

import { useCallback, useState, type CSSProperties } from "react";
import Link from "next/link";
import { smmFormatPages } from "@/components/home/direction/smmFormatRegistry";

// Violet, this page's own accent — see .deck-card-glow in globals.css for
// how this hands off to the hover glow.
const CARD_GLOW_STYLE = { "--card-glow-rgb": "168, 85, 247" } as CSSProperties;

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
  /** Кому подходит формат — второй факт в окошке под деком. */
  audience: string;
  /** Почему это актуально сейчас, а не «когда-нибудь» — третий факт там же. */
  now: string;
  /** Which phone-screen mockup to draw inside the card — see FormatThumb. */
  shape: "reels" | "stories" | "carousel" | "ads" | "bloggers";
  /** Themed backdrop photo, held at low exposure behind the mockup — same
   *  treatment as AiThumb (/ai) and SiteThumb (/sites). Each is the same
   *  image that format's own page (smm-*.tsx) already opens on, so the
   *  card previews the page it links to. */
  image: string;
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
    audience: "Брендам, у которых охваты в ленте просели, а в Reels ещё нет.",
    now: "Площадка отдаёт органический охват бесплатно, пока в него не зашли все конкуренты.",
    shape: "reels",
    image: "/images/stock/smm-phone-bokeh.webp",
  },
  {
    id: "stories",
    name: "Сторис",
    blurb: "Ежедневная лента историй: анонсы, закулисье, опросы — держит аккаунт живым между роликами.",
    meta: "каждый рабочий день",
    audience: "Аккаунтам, где подписчики есть, а вовлечённость между постами проседает.",
    now: "Без ежедневного присутствия алгоритм и аудитория забывают об аккаунте за неделю.",
    shape: "stories",
    image: "/images/stock/night-lights.webp",
  },
  {
    id: "carousel",
    name: "Карусели",
    blurb: "Посты-объяснения на несколько экранов — то, что аудитория сохраняет и пересылает.",
    meta: "4–8 постов в месяц",
    audience: "Экспертам и брендам, которым есть что объяснить, а не только показать.",
    now: "Формат, который сохраняют и пересылают, приносит охват без рекламного бюджета.",
    shape: "carousel",
    image: "/images/stock/dj-neon.webp",
  },
  {
    id: "ads",
    name: "Таргет",
    blurb: "Настройка, тесты креативов и оптимизация бюджета — реклама на том же контенте, что ведём.",
    meta: "тесты каждую неделю",
    audience: "Брендам, которым органики уже недостаточно и нужен управляемый приток лидов.",
    now: "Каждая неделя без тестов — упущенные данные о том, какой креатив реально продаёт.",
    shape: "ads",
    image: "/images/stock/brain-circuit.webp",
  },
  {
    id: "bloggers",
    name: "Блогеры",
    blurb: "Подбор блогеров под аудиторию и бюджет, согласование интеграций, замер результата.",
    meta: "в пакете Full-service",
    audience: "Брендам, которым нужно доверие чужой аудитории, а не ещё один свой пост.",
    now: "Своя аудитория уже видела бренд — блогер приносит тех, кто о нём ещё не слышал.",
    shape: "bloggers",
    image: "/images/stock/vr-neon-triangle.webp",
  },
];

// The phone screen: a themed stock photo at low exposure behind the format's
// own live diagram — same trick as AiThumb (/ai) and SiteThumb (/sites).
// `animate` gates the loop via `.ai-thumb-live`, the same animation hook
// those two pages already define in globals.css, reused rather than
// duplicated a third time so all three decks share one motion system.
function FormatThumb({ shape, image, animate = false }: { shape: Format["shape"]; image: string; animate?: boolean }) {
  const bar = (w: string, dim = false, cls = "", style?: React.CSSProperties) => (
    <span className={`block h-1.5 rounded-[2px] ${dim ? "bg-paper/12" : "bg-paper/22"} ${cls}`} style={{ width: w, ...style }} />
  );
  const d = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1d1730] to-[#0c0b14]">
      {/* Themed photo — same raised-brightness recipe as AiThumb/SiteThumb:
          the image itself bright, the scrim behind it cut down rather than
          left to eat the extra light. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.85] [filter:grayscale(0.25)_contrast(1.05)_saturate(1.1)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(170deg, rgba(23,16,38,0.5) 0%, rgba(12,11,20,0.6) 55%, rgba(12,11,20,0.72) 100%)",
        }}
      />

      {/* Stories-style progress strip along the top — the one cue every
          vertical-video surface shares, so it reads as "phone" instantly.
          Kept static on Egor's call; each format's own motion lives below
          it rather than competing with this cue for attention. */}
      <div className="relative flex gap-1 px-2.5 pt-2.5">
        <span className="h-[3px] flex-1 rounded-full bg-paper/55" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
      </div>

      <div className={`relative ${animate ? "ai-thumb-live" : ""}`}>
        {shape === "reels" && (
          <div className="relative mt-2.5 h-[150px]">
            {/* No solid panel over the frame any more — Egor: it was
                blocking the photo underneath. Everything here is a small
                floating badge instead, so the picture reads through and
                each badge is its own piece of infographic: duration, play
                state, reach, an audio waveform, then the caption + scrubber
                at the very bottom. */}
            <span className="ai-a-seq absolute left-2.5 top-2 rounded-[3px] bg-ink/55 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-paper/85 backdrop-blur-sm" style={d(0)}>
              0:15
            </span>
            <span className="ai-a-blink absolute left-1/2 top-[36%] grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/25 backdrop-blur-sm">
              <span className="block h-0 w-0 translate-x-[1px] border-y-[6px] border-l-[10px] border-y-transparent border-l-white/85" aria-hidden="true" />
            </span>
            <span className="ai-a-node absolute right-3 top-3 flex flex-col items-center gap-0.5" style={d(0.8)}>
              <span className="font-display text-[11px] text-[#ff6a9a]">♥</span>
              <span className="font-display text-[6px] tracking-[0.06em] text-paper/85">2.4K</span>
            </span>
            <span className="ai-a-seq absolute right-3 top-[58%] flex flex-col items-center gap-0.5" style={d(1.3)}>
              <span className="font-display text-[10px] text-[#7dd3fc]">◉</span>
              <span className="font-display text-[6px] tracking-[0.06em] text-paper/85">148K</span>
            </span>
            {/* A little audio waveform — the format's own reach cue,
                distinct from every other card's graphic language. */}
            <div className="absolute bottom-9 left-3 flex h-3 items-end gap-[2px]">
              {[0.4, 0.8, 0.55, 1, 0.65].map((h, i) => (
                <span key={i} className="ai-a-wave block w-[2px] rounded-full bg-[#a855f7]/80" style={{ height: `${h * 100}%`, ...d(i * 0.12) }} />
              ))}
            </div>
            <span className="absolute inset-x-3 bottom-2.5 grid gap-1">
              {bar("70%", false, "ai-a-seq", d(0))}
              <span className="relative mt-0.5 block h-[3px] w-full overflow-hidden rounded-full bg-paper/15">
                <span className="ai-a-progress absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" />
              </span>
            </span>
          </div>
        )}

        {shape === "stories" && (
          <div className="relative mt-2.5 h-[150px] px-2.5">
            {/* Same fix: the two big panels are gone, replaced with more
                infographic pieces — a viewer count, next-story bubbles, a
                poll that gets tapped, a reaction popping off it. */}
            <span className="ai-a-seq absolute left-2.5 top-1 flex items-center gap-1 rounded-[3px] bg-ink/55 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-paper/85 backdrop-blur-sm" style={d(0)}>
              <span aria-hidden="true">👁</span>128
            </span>
            <div className="absolute right-2.5 top-0 flex -space-x-1.5">
              {[0, 1].map((i) => (
                <span key={i} className="ai-a-seq block h-4 w-4 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8] ring-2 ring-[#0c0b14]" style={d(1.7 + i * 0.2)} />
              ))}
            </div>
            <div className="ai-a-seq absolute inset-x-2.5 top-[46%] flex -translate-y-1/2 gap-1.5" style={d(0.3)}>
              {/* A poll that actually gets voted on, not two static pills
                  with one blinking for no reason (Egor's catch) — a tap
                  lands on "Да", then both options reveal a result fill and
                  their share, the way an IG poll sticker resolves. */}
              <span className="relative flex-1 overflow-hidden rounded-[4px] bg-white/10 py-1 text-center font-display text-[6px] uppercase tracking-[0.06em] text-white ring-1 ring-white/25 backdrop-blur-sm">
                {/* A real, fixed-width fill (not .ai-a-progress — that class
                    always sweeps 0→100%, wrong for a result capped at 73%)
                    that Egor's own poll settles on, revealed by the plain
                    fade/hold/fade .ai-a-seq beat instead. */}
                <span className="ai-a-seq absolute inset-y-0 left-0 bg-[#a855f7]/60" style={{ width: "73%", ...d(1.6) }} />
                <span className="relative">Да · 73%</span>
              </span>
              <span className="relative flex-1 overflow-hidden rounded-[4px] bg-white/10 py-1 text-center font-display text-[6px] uppercase tracking-[0.06em] text-white ring-1 ring-white/25 backdrop-blur-sm">
                <span className="ai-a-seq absolute inset-y-0 left-0 bg-[#38bdf8]/45" style={{ width: "27%", ...d(1.6) }} />
                <span className="relative">Нет · 27%</span>
              </span>
              {/* The tap that triggers the reveal above — a fingertip rings
                  outward on "Да" (ai-a-node's own breathing pulse read as a
                  tap ripple), timed to land just before the result fills
                  sweep in beneath both options. */}
              <span className="ai-a-node pointer-events-none absolute left-[18%] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-white/70 bg-white/20" style={d(0.9)} />
            </div>
            <span className="ai-a-node absolute right-6 top-[62%] font-display text-[10px] text-[#ffe08a]" style={d(1.6)}>
              ✨
            </span>
            <span className="absolute inset-x-2.5 bottom-2.5">{bar("55%")}</span>
          </div>
        )}

        {shape === "carousel" && (
          <div className="relative mt-2.5 h-[150px] px-2.5">
            {/* The two filled panels are gone — a thin frame around each
                slide now, so the photo carries the picture instead of a
                flat colour block. A save icon and a "explains" icon do the
                extra infographic work the panels used to fake. */}
            <div className="relative flex h-[104px] gap-1.5 overflow-hidden">
              <span className="rounded-[6px] border border-white/30 bg-white/[0.04]" style={{ width: "78%", flexShrink: 0 }} />
              <span className="rounded-[6px] border border-white/12 bg-white/[0.02]" style={{ width: "78%", flexShrink: 0 }} />
              <span className="ai-a-travel pointer-events-none absolute top-[52px] h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
              <span className="ai-a-node absolute left-2.5 top-2 flex items-center gap-1 rounded-[3px] bg-ink/55 px-1.5 py-0.5 font-display text-[9px] text-[#ffd27a] backdrop-blur-sm" style={d(1.5)}>
                🔖
              </span>
              <span className="ai-a-seq absolute left-2.5 bottom-2 flex items-center gap-1 rounded-[3px] bg-ink/55 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-paper/85 backdrop-blur-sm" style={d(0.9)}>
                <span aria-hidden="true">≡</span>объясняет
              </span>
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="ai-a-blink h-1 w-1 rounded-full bg-paper/70" style={d(i * 0.4)} />
              ))}
            </div>
            <div className="mt-1.5 grid gap-1">
              {bar("70%", false, "ai-a-seq", d(0.4))}
              {bar("45%", true, "ai-a-seq", d(0.6))}
            </div>
          </div>
        )}

        {shape === "ads" && (
          <div className="relative mt-2.5 h-[150px] px-2.5">
            {/* The hero panel is gone. A crosshair does the "targeting" work
                instead, an A/B badge alternates between two creatives, and
                the bar chart + reach counter carry the performance read. */}
            <div className="flex items-center justify-between">
              <span className="block font-display text-[7px] uppercase tracking-[0.14em] text-[#7dd3fc]">Реклама</span>
              <span className="ai-a-seq flex items-center gap-1 font-display text-[7px] text-[#8affc1]" style={d(1.2)}>
                <span aria-hidden="true">↑</span>охват
              </span>
            </div>
            <div className="relative mt-3 flex h-14 items-center justify-center">
              <span className="ai-a-node grid h-10 w-10 place-items-center rounded-full border border-[#a855f7]/50 font-display text-[13px] text-[#a855f7]" style={d(0.4)}>
                ⌖
              </span>
              <span className="ai-a-seq absolute left-1/2 top-0 -translate-x-1/2 rounded-[3px] bg-ink/55 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-paper/85 backdrop-blur-sm" style={d(0)}>
                A/B
              </span>
            </div>
            <div className="mt-1 flex h-6 items-end gap-1">
              {[0.4, 0.7, 0.5, 0.9, 0.65].map((h, i) => (
                <span
                  key={i}
                  className="ai-a-bar block flex-1 rounded-[2px] bg-gradient-to-t from-[#a855f7] to-[#38bdf8]"
                  style={{ height: `${h * 100}%`, transformOrigin: "bottom center", ...d(i * 0.18) }}
                />
              ))}
            </div>
          </div>
        )}

        {shape === "bloggers" && (
          <div className="relative mt-2.5 h-[150px] px-2.5">
            {/* The photo panel is gone. The avatar's live ring, a verified
                tick, a follower count climbing and the reach badge now do
                all the telling — more distinct pieces, none of them a flat
                colour block hiding the picture. */}
            <div className="flex items-center gap-1.5">
              <span className="ai-a-node relative block h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8]">
                <span className="absolute -inset-0.5 rounded-full ring-1 ring-[#a855f7]/50" />
              </span>
              <span className="grid flex-1 gap-1">
                {bar("62%")}
                {bar("36%", true)}
              </span>
              <span className="ai-a-blink block h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]" aria-hidden="true" />
            </div>
            <span className="ai-a-seq mt-3 flex w-fit items-center gap-1 rounded-full bg-ink/55 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-paper/85 backdrop-blur-sm" style={d(0.6)}>
              Reels · интеграция
            </span>
            <div className="mt-8 flex items-center gap-2">
              <span className="ai-a-node font-display text-[8px] text-[#f0a8ff]" style={d(0.5)}>♥</span>
              {bar("40%", true)}
              <span className="ai-a-seq ml-auto flex items-center gap-1 rounded-full bg-[#a855f7]/20 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-[#e4c8ff] ring-1 ring-[#a855f7]/35" style={d(2.2)}>
                <span aria-hidden="true">↑</span>+2.4К охват
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// One entry per signed distance from the centre card. Nothing beyond ±2 is
// drawn — a sixth card would sit past the container's edge and only ever be a
// sliver. Egor's call: the front card grows 30% (1 → 1.3), the immediate
// neighbours shrink a bit further than before (0.85 → 0.74), and the outer
// pair shrink further still (0.7 → 0.54) — one continuous depth step rather
// than "big card, then two flat sizes".
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; blur: number; z: number }> = {
  [-2]: { x: -204, y: 30, scale: 0.54, opacity: 0.42, blur: 1.4, z: 10 },
  [-1]: { x: -118, y: 12, scale: 0.74, opacity: 0.76, blur: 0.4, z: 20 },
  [0]: { x: 0, y: -10, scale: 1.3, opacity: 1, blur: 0, z: 30 },
  [1]: { x: 118, y: 12, scale: 0.74, opacity: 0.76, blur: 0.4, z: 20 },
  [2]: { x: 204, y: 30, scale: 0.54, opacity: 0.42, blur: 1.4, z: 10 },
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
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

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
          under it changes length — grown from 300 to fit the front card's
          new +30% size (250px tall × 1.3 = 325px) plus its upward y-nudge. */}
      <div className="relative h-[360px]">
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
          const hasPage = format.id in smmFormatPages;

          const caption = (
            <>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background: "linear-gradient(180deg, rgba(11,11,16,0) 0%, rgba(11,11,16,0.92) 70%)",
                }}
              />
              <span className="absolute inset-x-3.5 bottom-4 flex flex-col items-start gap-2">
                <span className="block font-display text-[15px] uppercase leading-none tracking-tight text-paper">
                  {format.name}
                </span>
                <span className="block font-display text-[9px] uppercase tracking-[0.12em] text-[#c4a0ff]">
                  {format.meta}
                </span>
                {/* Same pattern as /ai and /sites: a small, pulsing pill
                    living on the card itself instead of a separate button
                    below the deck. */}
                {hasPage && (
                  <span className="smm-open-pulse inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#c084fc] to-[#7e22ce] px-3 py-1.5 font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-[#1a0a2a] motion-reduce:animate-none">
                    Подробнее
                    <span aria-hidden="true">→</span>
                  </span>
                )}
              </span>
              <span className="absolute right-2.5 top-3 rounded-full bg-ink/70 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </>
          );

          // The position/transition live on a stable outer <div> that never
          // changes element type — only its child (Link vs button) swaps
          // when a card becomes front-with-a-page. Same fix as AiDeck's own
          // wrapper: a <button> and a <Link> are different tags, so if the
          // TRANSFORM sat directly on whichever one was rendered, bringing a
          // card to front would unmount the button and mount a fresh Link
          // already sitting at its final position — no transition to
          // animate, the card just snaps instead of sliding in. Wrapping
          // keeps the transform on one element that's always present, so the
          // fan animation stays smooth regardless of which control fills it.
          return (
            <div
              key={format.id}
              className="absolute left-1/2 top-1/2 h-[250px] w-[150px] transition-all duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                zIndex: pose.z,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
              }}
            >
              {/* Once a format is front AND has its own page, the whole
                  card becomes the link to it — Egor's ask: click anywhere
                  on the selected card (bar the dedicated buttons elsewhere
                  on the page) and it opens the format's page, with a hover
                  glow so the card reads as one big button rather than a
                  picture. Off-centre cards stay <button>s that page the
                  carousel; a card the visitor just brought to front by
                  clicking it fills this same wrapper with the Link on the
                  very next render, so "first click selects, second click
                  opens" falls out of the existing active/front state rather
                  than needing its own click-count tracking. */}
              {isFront && hasPage ? (
                <Link
                  href={`/smm/${format.id}`}
                  aria-current="true"
                  className={`deck-card-glow absolute inset-0 overflow-hidden text-left ${CARD_SHELL}`}
                  style={CARD_GLOW_STYLE}
                >
                  <FormatThumb shape={format.shape} image={format.image} animate />
                  {caption}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  tabIndex={isFront ? -1 : 0}
                  aria-label={`Показать формат: ${format.name}`}
                  aria-current={isFront ? "true" : undefined}
                  className={`absolute inset-0 overflow-hidden text-left ${CARD_SHELL} ${
                    isFront ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <FormatThumb shape={format.shape} image={format.image} animate={isFront} />
                  {isFront && caption}
                </button>
              )}
            </div>
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
              className="relative grid h-8 w-8 place-items-center rounded-full border bg-ink font-display text-[9px] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a855f7] motion-reduce:transition-none"
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

      {/* Окошко под деком — тот же приём, что и на /ai (AiDeck.tsx) и /sites
          (SitesDeck.tsx): стекло .glass-panel со статичной каймой в
          акценте страницы (фиолетовый /smm, не изумруд/циан соседних
          деков — Егор попросил цвет свой на каждой странице), три факта
          белым текстом вместо одной приглушённой строки. The "Подробнее"
          button lives on the card itself (see the isFront branch above),
          so this row stays text-only. */}
      <div
        className="glass-panel mt-6 flex h-[240px] items-start overflow-hidden rounded-3xl px-6 py-6"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13), inset 0 0 0 1px rgba(255,255,255,0.045), 0 0 0 1px rgba(168,85,247,0.22), 0 0 32px -6px rgba(168,85,247,0.35), 0 28px 70px -34px rgba(0,0,0,0.95)" }}
      >
        <div className="max-w-[460px]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-sm uppercase leading-snug tracking-tight text-white">{front.name}</p>
            <p className="font-display text-[11px] uppercase tracking-[0.1em] text-[#c9a4ff]">{front.meta}</p>
          </div>
          <dl className="mt-3 grid gap-2.5">
            <SmmFact label="Что даёт" text={front.blurb} />
            <SmmFact label="Кому" text={front.audience} />
            <SmmFact label="Почему сейчас" text={front.now} />
          </dl>
        </div>
      </div>
    </div>
  );
}

// Одна строка факта — тот же рисунок, что у AiDeck's Fact / SitesDeck's
// SitesFact, в акценте /smm.
function SmmFact({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[92px] shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9a4ff]/80">
        {label}
      </dt>
      <dd className="text-[13px] leading-snug text-white">{text}</dd>
    </div>
  );
}
