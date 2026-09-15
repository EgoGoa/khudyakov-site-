"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { servicesByCategory } from "@/lib/service-content";

// The service carousel on /ai's chapter 01.
//
// Same reference as /sites' own deck (the Russia/VR fanned rail), but built
// the other way round on purpose: Egor asked for /ai to use a *real*
// perspective rather than the flat translate+scale fake SitesDeck uses. So
// this one sets `perspective` on the rail and gives every card an actual
// `rotateY`.
//
// The reason SitesDeck avoids 3D is that a rotated `backdrop-blur` panel
// forces its own compositing layer over the reel playing underneath, and the
// whole stage stutters on every swap. The fix here is not to drop the 3D but
// to drop the glass: these cards are painted with an opaque gradient, so
// there is nothing for the compositor to re-sample per frame and the rotation
// stays cheap. Only the centre card carries any blur-free glass edging.
//
// Ten cards, not five (Egor's call): the full /ai offer is on the first
// screen. Only ±2 around the centre are drawn — the rest are unmounted, so
// card count costs nothing at runtime.
//
// Paging is buttons + click-a-card + arrow keys only. No wheel or swipe
// handler: CinematicStage owns those gestures to step chapters, and a second
// listener here would fight it.

type Card = {
  id: string;
  /** Short label for the card face — the offer list's own titles run to five
   *  words and would set as four lines at card size. The full title and the
   *  description below the rail still come from service-content.ts, so the
   *  carousel can't drift from what chapter 05 (Offer) lists. */
  short: string;
  shape: Shape;
  /** Stock frame behind the card's artwork, held at very low exposure —
   *  Egor's ask: the cards read as flat panels, and a photo underneath gives
   *  each one its own subject without competing with the diagram on top.
   *
   *  Deliberately the same frame that tool's own page uses in its hero (see
   *  components/home/direction/content/ai-*.tsx), so clicking a card lands
   *  on a page that opens with the picture the card was already wearing. */
  image: string;
  /** Route to that item's own deep-dive page, when one exists.
   *
   *  Five of the ten offer items now have a full page under /ai/[tool] (see
   *  components/home/direction/toolRegistry.ts); the other five don't yet.
   *  Egor's call on where the entry point lives: "карусель остаётся, но
   *  чтобы через кнопку можно было нажимать на неё и проходить на отдельную
   *  страницу" — the carousel itself stays exactly as it was, and a button
   *  shows up on the info row below it only for the cards that actually
   *  have somewhere to go. No `href` here means no button, not a dead
   *  link. */
  href?: string;
  /** "Хит месяца" — Egor's flagship pick. Draws the card's badge and swaps
   *  its glow/ring/CTA from the deck's default emerald to a pink→orange
   *  pair (same #ff4fd8→#ff6a3d ramp as PromoCard's badge, so it reads as
   *  the site's one established "featured" language, not a new colour
   *  invented for this card alone). */
  hit?: boolean;
};

type Shape = "video" | "chat" | "flow" | "text" | "brain" | "crm" | "voice" | "split" | "chart" | "learn" | "hub";

// Index-aligned with servicesByCategory.ai — same order, now eleven items
// (the "хит месяца" card added at the front, everything else unchanged).
const CARDS: Card[] = [
  { id: "chathub", short: "Единый AI-чат\nдля мессенджеров", shape: "hub", href: "/ai/chat-hub", hit: true, image: "/images/stock/devs-night.webp" },
  { id: "gen", short: "Генерация\nвидео и фото", shape: "video", href: "/ai/video", image: "/images/stock/holi-face.webp" },
  { id: "bots", short: "Чат-боты\nи AI-агенты", shape: "chat", href: "/ai/agent", image: "/images/stock/robot-hand-chip.webp" },
  { id: "auto", short: "Автоматизация\nкоммуникации", shape: "flow", href: "/ai/comms", image: "/images/stock/man-laptop-dark.webp" },
  { id: "text", short: "Текстовый\nконтент", shape: "text", href: "/ai/content", image: "/images/stock/ink-pink.webp" },
  { id: "inner", short: "Ассистенты\nдля процессов", shape: "brain", href: "/ai/ops", image: "/images/stock/planner-desk.webp" },
  { id: "crm", short: "AI внутри\nCRM", shape: "crm", href: "/ai/crm", image: "/images/stock/brain-circuit.webp" },
  { id: "voice", short: "Голосовые\nрешения", shape: "voice", href: "/ai/voice", image: "/images/stock/hologram-laptop.webp" },
  { id: "person", short: "Персонализация\nконтента", shape: "split", href: "/ai/personalization", image: "/images/stock/vr-neon-triangle.webp" },
  { id: "analytics", short: "AI-аналитика", shape: "chart", href: "/ai/analytics", image: "/images/stock/platform-speed.webp" },
  { id: "learn", short: "Обучение\nкоманды", shape: "learn", href: "/ai/training", image: "/images/stock/team-ideas.webp" },
];

const SERVICES = servicesByCategory.ai;

// Card artwork: a stock frame held at very low exposure underneath, and the
// tool's own diagram drawn in CSS on top of it — zero extra bytes for the
// diagram, always on palette, readable at card size. One primitive set,
// re-arranged per shape — the same trick SiteThumb uses on /sites.
function AiThumb({
  shape,
  image,
  /** Only the card currently up front plays its diagram — every animation
   *  in `.ai-thumb-live` (globals.css) is scoped under this flag, so the
   *  off-centre cards hold their diagrams still. */
  animate = false,
}: {
  shape: Shape;
  image: string;
  animate?: boolean;
}) {
  const bar = (w: string, dim = false, cls = "", style?: React.CSSProperties) => (
    <span
      className={`block h-1.5 rounded-[2px] ${dim ? "bg-paper/12" : "bg-paper/22"} ${cls}`}
      style={{ width: w, ...style }}
    />
  );
  const chip = (w: string, dim = false) => (
    <span
      className={`block h-3.5 rounded-full ring-1 ${
        dim ? "bg-paper/[0.06] ring-paper/15" : "bg-emerald-400/25 ring-emerald-300/40"
      }`}
      style={{ width: w }}
    />
  );
  /** Tiny status dot — the detail that turns a plain chip into something
   *  that reads as a live row rather than a placeholder block. */
  const dot = (cls = "bg-emerald-300/80", extra = "", style?: React.CSSProperties) => (
    <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${cls} ${extra}`} style={style} />
  );
  /** Stagger inside the shared 5.6s beat. */
  const d = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });

  return (
    <div className="absolute inset-0 bg-[linear-gradient(160deg,#16241f_0%,#0c1013_58%,#0a0d10_100%)]">
      {/* The subject photo, at low exposure — Egor's ask. Two layers rather
          than one low-opacity image: the frame itself is dimmed and
          desaturated, then a dark scrim sits over it so the diagram above
          keeps its contrast no matter how busy the picture underneath is. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        // Raised twice on Егор's call: 0.34 → 0.41 (+20%) → 0.53 (+30%).
        // The scrim below still carries the diagram's contrast.
        className="absolute inset-0 h-full w-full object-cover opacity-[0.53] [filter:grayscale(0.35)_contrast(1.05)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, rgba(12,22,19,0.72) 0%, rgba(10,13,16,0.86) 55%, rgba(10,13,16,0.94) 100%)",
        }}
      />

      {/* A faint emerald aurora in the corner so every card reads as part of
          the /ai icon set rather than as a grey box. */}
      <span
        className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl ${
          shape === "hub" ? "bg-[#ff6a3d]/25" : "bg-emerald-400/20"
        }`}
      />

      <div className={`relative grid gap-2 p-3.5 pt-4 ${animate ? "ai-thumb-live" : ""}`}>
        {shape === "video" && (
          <>
            {/* A clip playing: the ▶ blinks, the scrubber runs start to end
                over the beat, and the keyframe strip flickers frame by frame
                as the playhead passes it. */}
            <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-md bg-[linear-gradient(135deg,rgba(52,211,153,0.45),rgba(0,210,255,0.25))]">
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-[3px] bg-ink/60 px-1.5 py-0.5 font-display text-[7px] tracking-[0.12em] text-emerald-100/90">
                <span className="ai-a-blink block h-1 w-1 rounded-full bg-[#ff6a3d]" />
                4K
              </span>
              <span className="absolute inset-0 grid place-items-center">
                <span className="ai-a-blink grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-[9px] text-emerald-200 ring-1 ring-emerald-300/40">
                  ▶
                </span>
              </span>
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="relative block h-1 flex-1 overflow-hidden rounded-full bg-paper/10">
                <span
                  className="ai-a-progress absolute inset-0 origin-left rounded-full bg-emerald-300/80"
                  style={{ transform: "scaleX(0.58)" }}
                />
              </span>
              <span className="block h-2.5 w-0.5 rounded-full bg-emerald-200" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className={`ai-a-blink block h-4 flex-1 rounded-[2px] ${i === 3 ? "bg-emerald-400/45" : "bg-paper/[0.08]"}`}
                  style={d(i * 0.23)}
                />
              ))}
            </div>
            {bar("62%", true)}
          </>
        )}
        {shape === "chat" && (
          <>
            {/* A conversation happening: the client writes, the agent
                answers, the client writes again, then the agent starts
                typing — and the whole thread clears and replays. */}
            <div className="ai-a-seq flex items-start gap-1.5" style={d(0)}>
              <span className="mt-0.5 block h-4 w-4 shrink-0 rounded-full bg-paper/15" />
              <span className="block w-[72%] rounded-lg rounded-bl-sm bg-paper/10 p-2">{bar("90%")}</span>
            </div>
            <span
              className="ai-a-seq ml-auto block w-[74%] rounded-lg rounded-br-sm bg-emerald-400/20 p-2 ring-1 ring-emerald-300/30"
              style={d(0.7)}
            >
              {bar("78%")}
              <span className="mt-1 block h-1.5 w-[52%] rounded-[2px] bg-paper/20" />
            </span>
            <div className="ai-a-seq flex items-start gap-1.5" style={d(1.4)}>
              <span className="mt-0.5 block h-4 w-4 shrink-0 rounded-full bg-paper/15" />
              <span className="block w-[56%] rounded-lg rounded-bl-sm bg-paper/10 p-2">{bar("80%", true)}</span>
            </div>
            <span
              className="ai-a-seq ml-auto flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1.5 ring-1 ring-emerald-300/25"
              style={d(2.1)}
            >
              {dot("bg-emerald-300", "ai-a-typing", d(0))}
              {dot("bg-emerald-300", "ai-a-typing", d(0.18))}
              {dot("bg-emerald-300", "ai-a-typing", d(0.36))}
            </span>
          </>
        )}
        {shape === "flow" && (
          <>
            {/* The stream walks down the filter row by row: inbound, then
                the split into passed / held, then only the passed branch
                arriving at the bottom. */}
            <span className="ai-a-seq flex items-center gap-1.5" style={d(0)}>
              {dot("bg-paper/40", "ai-a-blink")}
              {chip("100%", true)}
            </span>
            <span className="ai-a-seq mx-auto block h-3 w-px bg-emerald-300/40" style={d(0.5)} />
            <div className="ai-a-seq grid grid-cols-2 gap-2" style={d(0.9)}>
              <span className="flex items-center gap-1">
                {dot("bg-emerald-300/90", "ai-a-blink")}
                {chip("100%")}
              </span>
              <span className="flex items-center gap-1 opacity-45">
                {dot("bg-paper/30")}
                {chip("100%", true)}
              </span>
            </div>
            <div className="ai-a-seq grid grid-cols-2 gap-2" style={d(1.4)}>
              <span className="mx-auto block h-3 w-px bg-emerald-300/40" />
              <span className="mx-auto block h-3 w-px bg-paper/10" />
            </div>
            <span className="ai-a-seq flex items-center gap-1.5" style={d(1.8)}>
              {dot("bg-emerald-300/90", "ai-a-blink")}
              {chip("62%")}
            </span>
          </>
        )}
        {shape === "text" && (
          <>
            {/* A document being written line by line, caret blinking at the
                end of the line currently being typed. */}
            <span className="ai-a-seq block h-2.5 w-[58%] rounded-[3px] bg-paper/35" style={d(0)} />
            <span className="mt-0.5" />
            {bar("100%", false, "ai-a-seq", d(0.35))}
            {bar("92%", false, "ai-a-seq", d(0.6))}
            {bar("96%", true, "ai-a-seq", d(0.85))}
            {bar("84%", false, "ai-a-seq", d(1.1))}
            {bar("64%", true, "ai-a-seq", d(1.35))}
            <span className="ai-a-seq flex items-center gap-1" style={d(1.6)}>
              {bar("38%")}
              <span className="ai-a-caret block h-3 w-[2px] rounded-[1px] bg-emerald-300" />
            </span>
            <span className="ai-a-seq mt-1 flex items-center gap-1.5" style={d(1.9)}>
              <span className="block h-3 w-1/3 rounded-[3px] bg-emerald-400/60" />
              <span className="block h-3 w-[18%] rounded-[3px] bg-paper/10" />
            </span>
          </>
        )}
        {shape === "brain" && (
          <>
            {/* The core breathes while its satellites circle the orbit —
                the assistant working through the processes around it. */}
            <span className="relative mx-auto block h-[74px] w-[74px]">
              <span className="absolute inset-0 rounded-full border border-emerald-300/30" />
              <span className="absolute inset-[13px] rounded-full border border-emerald-300/45 bg-emerald-400/10" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="ai-a-node block h-4 w-4 rounded-full bg-emerald-400/70 ring-1 ring-emerald-200/60" />
              </span>
              <span className="ai-a-orbit absolute inset-0">
                <span className="absolute -top-0.5 left-[calc(50%-4px)] h-2 w-2 rounded-full bg-emerald-300" />
                <span className="absolute -right-0.5 top-[calc(50%-4px)] h-2 w-2 rounded-full bg-emerald-300/70" />
                <span className="absolute -bottom-0.5 left-[calc(50%-4px)] h-2 w-2 rounded-full bg-emerald-300/45" />
                <span className="absolute -left-0.5 top-[calc(50%-4px)] h-2 w-2 rounded-full bg-emerald-300/70" />
              </span>
            </span>
            <span className="mt-1" />
            <span className="ai-a-seq flex items-center gap-1.5" style={d(0.4)}>
              {dot("bg-emerald-300/80", "ai-a-blink")}
              {bar("74%")}
            </span>
            <span className="ai-a-seq flex items-center gap-1.5" style={d(1)}>
              {dot("bg-paper/25")}
              {bar("52%", true)}
            </span>
          </>
        )}
        {shape === "crm" && (
          <>
            {/* The graded lead lifts out of its column and settles again,
                while its score pulses on the row below. */}
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((col) => (
                <span
                  key={col}
                  className={`block space-y-1 rounded-md p-1.5 ${
                    col === 1 ? "bg-emerald-400/15 ring-1 ring-emerald-300/35" : "bg-paper/[0.07]"
                  }`}
                >
                  <span className={`block h-1 rounded-[2px] ${col === 1 ? "bg-emerald-300/70" : "bg-paper/20"}`} />
                  <span className="block h-5 rounded-[3px] bg-paper/[0.09]" />
                  <span
                    className={`block h-5 rounded-[3px] ${col === 1 ? "ai-a-lift bg-emerald-400/30 ring-1 ring-emerald-300/40" : "bg-paper/[0.09]"}`}
                  />
                  {col !== 2 && <span className="block h-5 rounded-[3px] bg-paper/[0.06]" />}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1.5">
              <span className="ai-a-blink rounded-full bg-emerald-400/25 px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-emerald-100 ring-1 ring-emerald-300/40">
                92
              </span>
              {bar("58%")}
            </span>
            {bar("40%", true)}
          </>
        )}
        {shape === "voice" && (
          <>
            {/* Live audio: every bar of the waveform pumps on its own offset
                and the playhead sweeps across it. */}
            <span className="relative block h-[70px] w-full">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-emerald-300/20" />
              <span className="absolute inset-0 flex items-center justify-center gap-[3px]">
                {[8, 16, 28, 20, 40, 52, 38, 58, 44, 30, 22, 34, 14, 10].map((h, i) => (
                  <span
                    key={i}
                    className="ai-a-wave block w-[3px] rounded-full bg-emerald-300"
                    style={{ height: `${h}%`, opacity: 0.35 + (h / 58) * 0.55, ...d((i % 5) * 0.14) }}
                  />
                ))}
              </span>
              <span className="ai-a-travel absolute left-[58%] top-0 h-full w-px bg-emerald-100/70" />
            </span>
            <span className="flex items-center gap-1.5">
              {dot("bg-emerald-300/80", "ai-a-blink")}
              {bar("70%")}
            </span>
            {bar("46%", true)}
          </>
        )}
        {shape === "split" && (
          <>
            {/* One message arrives, forks, and two tailored versions come out
                of it — one after the other. */}
            <span className="ai-a-seq mx-auto block h-7 w-[62%] rounded-md bg-paper/12 ring-1 ring-paper/15" style={d(0)} />
            <div className="ai-a-seq grid grid-cols-2 gap-1.5" style={d(0.5)}>
              <span className="mx-auto block h-3 w-px bg-emerald-300/40" />
              <span className="mx-auto block h-3 w-px bg-glow/40" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <span
                className="ai-a-seq block space-y-1 rounded-md bg-emerald-400/20 p-1.5 ring-1 ring-emerald-300/30"
                style={d(0.9)}
              >
                <span className="block h-1 w-full rounded-[2px] bg-emerald-200/60" />
                <span className="block h-1 w-[70%] rounded-[2px] bg-paper/20" />
              </span>
              <span className="ai-a-seq block space-y-1 rounded-md bg-glow/20 p-1.5 ring-1 ring-glow/30" style={d(1.3)}>
                <span className="block h-1 w-[80%] rounded-[2px] bg-glow/60" />
                <span className="block h-1 w-full rounded-[2px] bg-paper/20" />
              </span>
            </div>
            {bar("86%", false, "ai-a-seq", d(1.7))}
            {bar("58%", true, "ai-a-seq", d(2))}
          </>
        )}
        {shape === "chart" && (
          <>
            {/* The bars rise and fall out of step with each other, and the
                anomaly marker flashes over the one that broke the trend. */}
            <span className="relative block h-[70px] w-full">
              <span className="absolute inset-x-0 bottom-0 h-px bg-paper/15" />
              <span className="absolute inset-0 flex items-end gap-1.5">
                {[34, 52, 28, 64, 46, 72].map((h, i) => (
                  <span
                    key={i}
                    className={`ai-a-bar block flex-1 rounded-t-[3px] ${
                      i === 2
                        ? "bg-[linear-gradient(180deg,rgba(255,106,61,0.85),rgba(255,106,61,0.12))]"
                        : "bg-[linear-gradient(180deg,rgba(52,211,153,0.85),rgba(52,211,153,0.15))]"
                    }`}
                    style={{ height: `${h}%`, ...d(i * 0.32) }}
                  />
                ))}
              </span>
              <span className="ai-a-blink absolute left-[38%] top-[44%] h-2 w-2 -translate-x-1/2 rounded-full bg-[#ff6a3d] ring-2 ring-[#ff6a3d]/25" />
            </span>
            <span className="flex items-center gap-1.5">
              {dot("bg-[#ff6a3d]", "ai-a-blink")}
              {bar("64%")}
            </span>
            {bar("42%", true)}
          </>
        )}
        {shape === "hub" && (
          <>
            {/* Messages landing in each channel in turn — the four chips
                light up one after another — while the single inbox node they
                all feed keeps pulsing. */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "bg-[#ff4fd8]/20 ring-[#ff4fd8]/35",
                "bg-[#ff6a3d]/20 ring-[#ff6a3d]/35",
                "bg-[#ff6a3d]/20 ring-[#ff6a3d]/35",
                "bg-[#ff4fd8]/20 ring-[#ff4fd8]/35",
              ].map((cls, i) => (
                <span
                  key={i}
                  className={`ai-a-blink flex h-9 items-center gap-1.5 rounded-md px-1.5 ring-1 ${cls}`}
                  style={d(i * 0.4)}
                >
                  <span className="block h-2 w-2 shrink-0 rounded-full bg-white/70" />
                  <span className="block h-1 flex-1 rounded-[2px] bg-white/25" />
                </span>
              ))}
            </div>
            <div className="relative h-4">
              <span className="absolute left-1/4 top-0 h-2 w-px bg-[#ff8a5c]/40" />
              <span className="absolute right-1/4 top-0 h-2 w-px bg-[#ff8a5c]/40" />
              <span className="absolute left-1/4 right-1/4 top-2 h-px bg-[#ff8a5c]/40" />
              <span className="absolute left-1/2 top-2 h-2 w-px bg-[#ff8a5c]/60" />
            </div>
            <span className="ai-a-node relative mx-auto block h-7 w-7">
              <span className="absolute -inset-1.5 rounded-full bg-[#ff6a3d]/20 blur-[6px]" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ff8a5c] to-[#ff4fd8]" />
            </span>
            {bar("84%")}
            {bar("52%", true)}
          </>
        )}
        {shape === "learn" && (
          <>
            {/* The team joins one by one, the course bar fills, and the
                lessons tick in down the list. */}
            <div className="flex items-center gap-1.5">
              <span className="ai-a-seq block h-6 w-6 rounded-full bg-emerald-400/30 ring-1 ring-emerald-300/40" style={d(0)} />
              <span
                className="ai-a-seq -ml-3 block h-6 w-6 rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/25"
                style={d(0.3)}
              />
              <span className="ai-a-seq -ml-3 block h-6 w-6 rounded-full bg-paper/10 ring-1 ring-paper/15" style={d(0.6)} />
              <span
                className="ai-a-seq ml-1 rounded-full bg-paper/[0.08] px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-paper/60"
                style={d(0.9)}
              >
                +6
              </span>
            </div>
            <span className="relative mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
              <span
                className="ai-a-progress absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,rgba(52,211,153,0.9),rgba(52,211,153,0.5))]"
                style={{ transform: "scaleX(0.64)" }}
              />
            </span>
            <div className="mt-1 space-y-1.5">
              <span className="ai-a-seq flex items-center gap-1.5" style={d(1.2)}>
                {dot("bg-emerald-300/80", "ai-a-blink")}
                {bar("86%")}
              </span>
              <span className="ai-a-seq flex items-center gap-1.5" style={d(1.7)}>
                {dot()}
                {bar("68%", true)}
              </span>
              <span className="ai-a-seq flex items-center gap-1.5" style={d(2.2)}>
                {dot("bg-paper/20")}
                {bar("54%", true)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Where each card sits relative to the active one. Real 3D: the neighbours
// turn to face the centre, so the rail curves away instead of just shrinking.
// The cards themselves grew 1.3x (Egor's ask); x/z did NOT grow with them.
// Scaling the spread by the same 1.3 put the outer pair ~400px from the
// rail's centre inside a column only ~510px wide, so they hung off the edge
// of the chapter and raised a horizontal scrollbar along the bottom of the
// page — and a scrollbar that appears and disappears as cards swap resizes
// the pane, which is what made the headings' letters jump. Held near the
// original spread instead: bigger cards over the same width simply overlap
// more, which is what a coverflow wants anyway. (CinematicSection now also
// closes the x axis outright, so a narrow viewport clips rather than pans —
// this keeps it from needing to.)
const POSE: Record<number, { x: number; z: number; ry: number; scale: number; opacity: number; blur?: number; zi: number }> = {
  [-2]: { x: -246, z: -390, ry: 40, scale: 0.74, opacity: 0.34, blur: 1.4, zi: 10 },
  [-1]: { x: -148, z: -195, ry: 32, scale: 0.87, opacity: 0.72, zi: 20 },
  [0]: { x: 0, z: 0, ry: 0, scale: 1, opacity: 1, zi: 30 },
  [1]: { x: 148, z: -195, ry: -32, scale: 0.87, opacity: 0.72, zi: 20 },
  [2]: { x: 246, z: -390, ry: -40, scale: 0.74, opacity: 0.34, blur: 1.4, zi: 10 },
};

// The chapter's button language, shared with the rest of /ai the way
// SitesDeck's PILL/ROUND are shared across /sites. Emerald rather than the
// site's orange: /ai's whole icon set and accent is emerald, and an orange
// key here read as borrowed from the neighbouring page.
export const AI_PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#5ce6b0] to-[#0fa47a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#03120d] shadow-[0_12px_30px_-8px_rgba(16,185,129,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

export const AI_ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-colors duration-300 hover:border-emerald-300/70 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

export default function AiDeck() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const count = CARDS.length;

  const step = useCallback(
    (delta: number) => setActive((prev) => (prev + delta + count) % count),
    [count],
  );

  // Arrow keys, but only while the rail itself has focus inside it — the
  // page's own left/right gestures stay untouched everywhere else.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [step]);

  const front = SERVICES[active];

  return (
    <div className="w-full max-w-[728px]">
      <div
        ref={railRef}
        className="relative h-[416px]"
        style={{ perspective: "1430px", perspectiveOrigin: "50% 50%" }}
      >
        {/* The pool of light the whole deck sits in — without it the rail
            reads as five boxes floating on flat black. One big, slow-breathing
            emerald glow, well behind every card (z-0). */}
        <span
          aria-hidden="true"
          className="ai-deck-ambient-glow pointer-events-none absolute left-1/2 top-1/2 z-0 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.38) 0%, rgba(52,211,153,0.14) 45%, rgba(52,211,153,0) 72%)",
            filter: "blur(6px)",
          }}
        />

        {CARDS.map((card, i) => {
          // Signed, wrapped distance from the active card, so card 10 sits to
          // the *left* of card 01 instead of looping the long way round.
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const pose = POSE[offset];
          if (!pose) return null;

          const isFront = offset === 0;
          const dist = Math.abs(offset);

          return (
            // One posed element per card, carrying the 3D transform, the
            // depth opacity and the distance blur — with BOTH the glow and
            // the card itself as its children.
            //
            // This replaces a version where the glow was a sibling of the
            // card with its own copy of the same transform string. Two
            // elements animating two separate transforms cannot be kept in
            // step: they were started by different style writes, and the
            // browser is free to schedule them on different frames, so the
            // light visibly lagged the card it belonged to on every swap —
            // "карточки меняются, а свечение остаётся". Nesting removes the
            // problem by construction rather than by tuning: a child cannot
            // desync from a transform it does not own, it is simply carried
            // by it.
            <div
              key={card.id}
              className="absolute left-1/2 top-1/2 h-[348px] w-[265px] transition-[transform,opacity,filter] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                zIndex: pose.zi,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%, -50%) translate3d(${pose.x}px, 0, ${pose.z}px) rotateY(${pose.ry}deg) scale(${pose.scale})`,
                willChange: "transform",
              }}
            >
              {/* Back cards: a faint flickering rim in the page's own
                  emerald — the further from centre, the paler, which is what
                  reads as "receding" rather than just blurred. Front card:
                  same soft flicker, but brighter and in a violet→blue
                  gradient, so the chosen one is unmistakably a different
                  kind of light, not just a bigger version of the same one.
                  Only the colours change on a swap now; the position is the
                  parent's business. */}
              <span
                aria-hidden="true"
                className="ai-deck-glow pointer-events-none absolute -inset-3 -z-10 rounded-[30px]"
                style={
                  {
                    filter: "blur(24px)",
                    // The "хит месяца" card keeps this same pink→orange glow
                    // at every distance from centre, not only when active —
                    // Egor's ask was for the card itself to read as lit
                    // while scrolling past it, not just once it's front.
                    background: card.hit
                      ? isFront
                        ? "radial-gradient(circle, rgba(255,79,216,0.95) 0%, rgba(255,106,61,0.6) 55%, rgba(255,106,61,0) 75%)"
                        : `radial-gradient(circle, rgba(255,106,61,${dist === 1 ? 0.45 : 0.24}) 0%, rgba(255,79,216,0) 70%)`
                      : isFront
                        ? "radial-gradient(circle, rgba(167,139,250,0.95) 0%, rgba(56,189,248,0.55) 55%, rgba(56,189,248,0) 75%)"
                        : `radial-gradient(circle, rgba(52,211,153,${dist === 1 ? 0.4 : 0.2}) 0%, rgba(52,211,153,0) 70%)`,
                    "--flicker-min": isFront ? 0.65 : dist === 1 ? 0.25 : 0.12,
                    "--flicker-max": isFront ? 1 : dist === 1 ? 0.5 : 0.3,
                    "--flicker-duration": isFront ? "3.2s" : "3.8s",
                    "--flicker-delay": `${i * 0.3}s`,
                  } as React.CSSProperties
                }
              />

              {/* "Хит месяца" — same badge language as PromoCard's own
                  featured pill (.promo-card-badge-lift: pink→orange
                  shimmer + blink glow), reused rather than invented, so the
                  site has one "featured" visual vocabulary and not two.
                  Lives on the posed wrapper (not inside AiThumb), so it
                  moves/blurs with the card like the glow above it. */}
              {card.hit && (
                <span
                  className="promo-card-badge-lift pointer-events-none absolute -top-2.5 left-3.5 z-20 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.14em] text-white"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
                  Хит месяца
                </span>
              )}

              {/* The front card is not a paging control — clicking it was
                  always a no-op (tabIndex -1, onClick re-selecting the
                  already-active index). That's what made it safe to stop
                  rendering it as a <button> once it needed to carry a real
                  navigation link: off-centre cards (which DO page the
                  carousel) keep the <button>, the front card is the link
                  itself now — the whole surface opens the tool, not just the
                  pill inside it (Egor's ask: click anywhere on the selected
                  card, not only its button). A <Link>'s <a> can't nest
                  inside another <a> any more than inside a <button>, so the
                  pill below is a plain <span> styled the same — decoration,
                  not a second link. */}
              {isFront ? (
                <Link
                  href={card.href ?? "#"}
                  aria-current="true"
                  className={`deck-card-glow absolute inset-0 overflow-hidden rounded-[26px] text-left shadow-[0_38px_90px_-28px_rgba(0,0,0,0.9)] ring-1 ${
                    card.hit ? "ring-[#ff8a5c]/45" : "ring-emerald-300/40"
                  }`}
                  style={{ "--card-glow-rgb": card.hit ? "255, 106, 61" : "16, 185, 129" } as React.CSSProperties}
                >
                  <AiThumb shape={card.shape} image={card.image} animate />

                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
                    style={{ background: "linear-gradient(180deg, rgba(10,13,16,0) 0%, rgba(10,13,16,0.96) 62%)" }}
                  />
                  <span className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-3">
                    <span className="block whitespace-pre-line font-display text-lg uppercase leading-[1.15] tracking-tight text-paper">
                      {card.short}
                    </span>
                    {/* Was a small pill on the info row below the deck —
                        Егор: "кнопки перемести во внутрь карточек и сделай
                        их заметнее и пусть они пульсируют". Living on the
                        card itself, it reads as the card's own action
                        instead of a footnote under it; the pulse is what
                        makes it read as clickable rather than as more
                        label text next to the title above it. */}
                    {card.href && (
                      <span
                        // ~30% smaller than the first pass (px-4 py-2.5
                        // text-[11px]) — Егор: the pill was outweighing the
                        // card title above it.
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[8px] font-semibold uppercase tracking-[0.14em] motion-reduce:animate-none ${
                          card.hit
                            ? "ai-open-pulse-hit bg-gradient-to-b from-[#ff8a5c] to-[#ff4fd8] text-[#1a0a04]"
                            : "ai-open-pulse bg-gradient-to-b from-[#5ce6b0] to-[#0fa47a] text-[#03120d]"
                        }`}
                      >
                        Открыть инструмент
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </span>
                  <span className="absolute right-3.5 top-3.5 rounded-full bg-ink/70 px-2.5 py-1 font-display text-[10px] tracking-[0.12em] text-paper/70">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    setActive(i);
                    // Restore focus ourselves, without the scroll-into-view a
                    // plain click's native focus would trigger — see the
                    // onMouseDown comment below for why that scroll happens
                    // and why it matters. `preventScroll` is what keeps the
                    // arrow keys usable right after a mouse click without
                    // bringing the jump back.
                    e.currentTarget.focus({ preventScroll: true });
                  }}
                  // A card sitting off-centre is rotated in 3D (rotateY,
                  // inside the rail's own `perspective`). Focusing it on
                  // click — the browser's default for a <button> — makes
                  // Chrome/Safari run their native scroll-into-view against
                  // that rotated geometry, which they sometimes get wrong
                  // and answer by scrolling the whole page. CinematicStage's
                  // own scroll listener then reads that stray scroll as a
                  // real gesture and can swap the chapter under you — the
                  // "вся вёрстка прыгает" bug. Blocking focus on mousedown
                  // (the click itself still fires via mouseup, and onClick
                  // above re-focuses safely) removes the trigger entirely.
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={0}
                  aria-label={`Показать: ${SERVICES[i].title}`}
                  className="absolute inset-0 overflow-hidden rounded-[26px] text-left shadow-[0_38px_90px_-28px_rgba(0,0,0,0.9)] ring-1 ring-white/10 cursor-pointer transition-[box-shadow] duration-[560ms] motion-reduce:transition-none"
                >
                  <AiThumb shape={card.shape} image={card.image} />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={(e) => {
            step(-1);
            e.currentTarget.focus({ preventScroll: true });
          }}
          // See the matching comment on the card button above — same
          // focus-triggered scroll-jump risk, since this sits inside the
          // rail's own `perspective` context too.
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Предыдущая услуга"
          className={`absolute left-0 top-1/2 z-40 -translate-y-1/2 ${AI_ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            step(1);
            e.currentTarget.focus({ preventScroll: true });
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Следующая услуга"
          className={`absolute right-0 top-1/2 z-40 -translate-y-1/2 ${AI_ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* The lit track. Ten nodes would crowd at 32px each, so these are bare
          dots with the active one stretched into a capsule — same idea as
          /sites' numbered rail, sized for twice as many items. */}
      <div className="relative mx-auto mt-6 flex max-w-[420px] items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(52,211,153,0) 0%, rgba(52,211,153,0.4) 10%, rgba(52,211,153,0.4) 90%, rgba(52,211,153,0) 100%)",
          }}
        />
        {CARDS.map((card, i) => {
          const on = i === active;
          return (
            <button
              key={card.id}
              type="button"
              onClick={(e) => {
                setActive(i);
                e.currentTarget.focus({ preventScroll: true });
              }}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={SERVICES[i].title}
              aria-current={on ? "true" : undefined}
              className="relative grid h-7 place-items-center rounded-full border bg-ink transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 motion-reduce:transition-none"
              style={{
                width: on ? 34 : 12,
                borderColor: on ? "#34d399" : "rgba(52,211,153,0.3)",
                boxShadow: on ? "0 0 12px rgba(52,211,153,0.9), 0 0 34px rgba(52,211,153,0.45)" : "none",
              }}
            >
              <span className="font-display text-[9px] text-emerald-100" style={{ opacity: on ? 1 : 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {/* The reference's pill toolbar: the full name and, below it, three
          short facts about whichever card is up front — что даёт / кому /
          почему сейчас. Раньше здесь стояла одна строка описания без ответа
          на "кому" и "почему сейчас", и карточка читалась как список
          инструментов без объяснения, зачем конкретно этот нужен именно
          сейчас — Егор попросил разложить это тезисами, а не абзацем.

          A *fixed* height, not a min-height. The eleven titles and facts run
          different lengths, so at this width they set to a different number
          of lines from one card to the next. Under `min-h` the block was
          free to grow past it, and because this whole chapter is centred
          against the copy column beside it (`lg:items-center` in AiPitch),
          every extra line re-centred the entire row — the heading beside it
          visibly shifted on a swap. A hard height means the tallest entry
          defines the box once and nothing below or beside it ever moves
          again. */}
      {/* The "Открыть" button used to live here, in its own pill beside the
          title. Moved onto the card itself (see isFront branch above) per
          Егор's ask — this row is text-only again, same as before that
          button existed. */}
      {/* Окошко — тот же `.glass-panel`, что несут шапки блоков на страницах
          направлений (SectionHead), плюс статичная (без пульса — рядом уже
          дышит эмбиент-свечение самого дека, вторая анимация спорила бы с
          ней) кайма в emerald дека. Раньше факты лежали прямо на фоне
          страницы и читались тише самого дека — теперь у них своя рамка и
          свой свет, а тезисы набраны белым, а не приглушённым paper/70. */}
      <div
        className="glass-panel mt-6 flex h-[226px] items-start overflow-hidden rounded-3xl px-6 py-6"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13), inset 0 0 0 1px rgba(255,255,255,0.045), 0 0 0 1px rgba(52,211,153,0.22), 0 0 32px -6px rgba(52,211,153,0.35), 0 28px 70px -34px rgba(0,0,0,0.95)" }}
      >
        <div className="max-w-[460px]">
          <p className="font-display text-sm uppercase leading-snug tracking-tight text-white">{front.title}</p>
          <dl className="mt-3 grid gap-2.5">
            <Fact label="Что даёт" text={front.description} />
            {front.audience && <Fact label="Кому" text={front.audience} />}
            {front.now && <Fact label="Почему сейчас" text={front.now} />}
          </dl>
        </div>
      </div>
    </div>
  );
}

// Одна строка факта: короткая emerald-подпись слева (та же гарнитура и
// трекинг, что у EYEBROW по сайту, но не самим компонентом — здесь не
// нужен ни индекс, ни точка перед подписью) и сам тезис справа, белым по
// основному — Егор попросил убрать притушенный paper/70, факты должны
// читаться так же чётко, как заголовок над ними, а не как подпись к нему.
function Fact({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[92px] shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/80">
        {label}
      </dt>
      <dd className="text-[13px] leading-snug text-white">{text}</dd>
    </div>
  );
}
