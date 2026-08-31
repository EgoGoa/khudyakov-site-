"use client";

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
};

type Shape = "video" | "chat" | "flow" | "text" | "brain" | "crm" | "voice" | "split" | "chart" | "learn";

// Index-aligned with servicesByCategory.ai — same order, same ten items.
const CARDS: Card[] = [
  { id: "gen", short: "Генерация\nвидео и фото", shape: "video" },
  { id: "bots", short: "Чат-боты\nи AI-агенты", shape: "chat" },
  { id: "auto", short: "Автоматизация\nкоммуникации", shape: "flow" },
  { id: "text", short: "Текстовый\nконтент", shape: "text" },
  { id: "inner", short: "Ассистенты\nдля процессов", shape: "brain" },
  { id: "crm", short: "AI внутри\nCRM", shape: "crm" },
  { id: "voice", short: "Голосовые\nрешения", shape: "voice" },
  { id: "person", short: "Персонализация\nконтента", shape: "split" },
  { id: "analytics", short: "AI-аналитика", shape: "chart" },
  { id: "learn", short: "Обучение\nкоманды", shape: "learn" },
];

const SERVICES = servicesByCategory.ai;

// Card artwork drawn in CSS, not shipped as images: zero bytes, always on
// palette, and readable at card size. One primitive set, re-arranged per
// shape — the same trick SiteThumb uses on /sites.
function AiThumb({ shape }: { shape: Shape }) {
  const bar = (w: string, dim = false) => (
    <span className={`block h-1.5 rounded-[2px] ${dim ? "bg-paper/12" : "bg-paper/22"}`} style={{ width: w }} />
  );
  const chip = (w: string) => (
    <span className="block h-3.5 rounded-full bg-emerald-400/25 ring-1 ring-emerald-300/40" style={{ width: w }} />
  );

  return (
    <div className="absolute inset-0 bg-[linear-gradient(160deg,#16241f_0%,#0c1013_58%,#0a0d10_100%)]">
      {/* A faint emerald aurora in the corner so every card reads as part of
          the /ai icon set rather than as a grey box. */}
      <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />

      <div className="relative grid gap-2 p-3.5 pt-4">
        {shape === "video" && (
          <>
            <span className="block aspect-[16/10] w-full rounded-md bg-[linear-gradient(135deg,rgba(52,211,153,0.45),rgba(0,210,255,0.25))]" />
            <span className="mx-auto -mt-[38%] grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-[10px] text-emerald-200">▶</span>
            <span className="mt-[26%]" />
            {bar("74%")}
            {bar("48%", true)}
          </>
        )}
        {shape === "chat" && (
          <>
            <span className="block w-[76%] rounded-lg rounded-bl-sm bg-paper/10 p-2">{bar("90%")}</span>
            <span className="ml-auto block w-[76%] rounded-lg rounded-br-sm bg-emerald-400/20 p-2 ring-1 ring-emerald-300/30">{bar("70%")}</span>
            <span className="block w-[56%] rounded-lg rounded-bl-sm bg-paper/10 p-2">{bar("80%", true)}</span>
          </>
        )}
        {shape === "flow" && (
          <>
            {chip("100%")}
            <span className="mx-auto block h-4 w-px bg-emerald-300/40" />
            <div className="grid grid-cols-2 gap-2">
              {chip("100%")}
              {chip("100%")}
            </div>
            <span className="mx-auto block h-4 w-px bg-emerald-300/40" />
            {chip("60%")}
          </>
        )}
        {shape === "text" && (
          <>
            {bar("100%")}
            {bar("92%")}
            {bar("96%", true)}
            {bar("70%")}
            <span className="mt-1 block h-3 w-1/3 rounded-[3px] bg-emerald-400/60" />
          </>
        )}
        {shape === "brain" && (
          <>
            <span className="mx-auto block h-14 w-14 rounded-full border border-emerald-300/45 bg-emerald-400/10" />
            <span className="mx-auto -mt-11 block h-8 w-8 rounded-full border border-emerald-200/60" />
            <span className="mt-6" />
            {bar("80%")}
            {bar("55%", true)}
          </>
        )}
        {shape === "crm" && (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              <span className="block h-16 rounded-md bg-paper/[0.07] p-1.5">{bar("100%", true)}</span>
              <span className="block h-16 rounded-md bg-emerald-400/15 p-1.5 ring-1 ring-emerald-300/35">{bar("100%")}</span>
              <span className="block h-16 rounded-md bg-paper/[0.07] p-1.5">{bar("100%", true)}</span>
            </div>
            {bar("70%")}
            {bar("40%", true)}
          </>
        )}
        {shape === "voice" && (
          <>
            <div className="flex h-16 items-center justify-center gap-1">
              {[10, 22, 38, 26, 46, 30, 18, 34, 12].map((h, i) => (
                <span key={i} className="block w-1 rounded-full bg-emerald-300/70" style={{ height: h }} />
              ))}
            </div>
            {bar("82%")}
            {bar("50%", true)}
          </>
        )}
        {shape === "split" && (
          <>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="block h-10 rounded-md bg-emerald-400/20 ring-1 ring-emerald-300/30" />
              <span className="block h-10 rounded-md bg-glow/20 ring-1 ring-glow/30" />
            </div>
            {bar("90%")}
            {bar("64%", true)}
            {bar("44%", true)}
          </>
        )}
        {shape === "chart" && (
          <>
            <div className="flex h-16 items-end gap-1.5">
              {[34, 52, 28, 64, 46, 72].map((h, i) => (
                <span
                  key={i}
                  className="block flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,rgba(52,211,153,0.85),rgba(52,211,153,0.15))]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            {bar("76%")}
            {bar("46%", true)}
          </>
        )}
        {shape === "learn" && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="block h-6 w-6 rounded-full bg-emerald-400/30 ring-1 ring-emerald-300/40" />
              <span className="block h-6 w-6 rounded-full bg-paper/10" />
              <span className="block h-6 w-6 rounded-full bg-paper/10" />
            </div>
            {bar("94%")}
            {bar("72%", true)}
            {bar("58%", true)}
            <span className="mt-1 block h-3 w-2/5 rounded-[3px] bg-emerald-400/55" />
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
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#5ce6b0] to-[#0fa47a] px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#03120d] shadow-[0_12px_30px_-8px_rgba(16,185,129,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

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
                    background: isFront
                      ? "radial-gradient(circle, rgba(167,139,250,0.95) 0%, rgba(56,189,248,0.55) 55%, rgba(56,189,248,0) 75%)"
                      : `radial-gradient(circle, rgba(52,211,153,${dist === 1 ? 0.4 : 0.2}) 0%, rgba(52,211,153,0) 70%)`,
                    "--flicker-min": isFront ? 0.65 : dist === 1 ? 0.25 : 0.12,
                    "--flicker-max": isFront ? 1 : dist === 1 ? 0.5 : 0.3,
                    "--flicker-duration": isFront ? "3.2s" : "3.8s",
                    "--flicker-delay": `${i * 0.3}s`,
                  } as React.CSSProperties
                }
              />

              <button
                type="button"
                onClick={(e) => {
                  setActive(i);
                  // Restore focus ourselves, without the scroll-into-view a
                  // plain click's native focus would trigger — see the
                  // onMouseDown comment below for why that scroll happens and
                  // why it matters. `preventScroll` is what keeps the arrow
                  // keys usable right after a mouse click without bringing
                  // the jump back.
                  e.currentTarget.focus({ preventScroll: true });
                }}
                // A card sitting off-centre is rotated in 3D (rotateY, inside
                // the rail's own `perspective`). Focusing it on click — the
                // browser's default for a <button> — makes Chrome/Safari run
                // their native scroll-into-view against that rotated
                // geometry, which they sometimes get wrong and answer by
                // scrolling the whole page. CinematicStage's own scroll
                // listener then reads that stray scroll as a real gesture and
                // can swap the chapter under you — the "вся вёрстка прыгает"
                // bug. Blocking focus on mousedown (the click itself still
                // fires via mouseup, and onClick above re-focuses safely)
                // removes the trigger entirely.
                onMouseDown={(e) => e.preventDefault()}
                tabIndex={isFront ? -1 : 0}
                aria-label={`Показать: ${SERVICES[i].title}`}
                aria-current={isFront ? "true" : undefined}
                className={`absolute inset-0 overflow-hidden rounded-[26px] text-left shadow-[0_38px_90px_-28px_rgba(0,0,0,0.9)] ring-1 transition-[box-shadow] duration-[560ms] motion-reduce:transition-none ${
                  isFront ? "cursor-default ring-emerald-300/40" : "cursor-pointer ring-white/10"
                }`}
              >
                <AiThumb shape={card.shape} />

                {/* Only the centre card is labelled, as in the reference. On a
                    card turned 32° and scaled to 87% the type would be noise. */}
                {isFront && (
                  <>
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
                      style={{ background: "linear-gradient(180deg, rgba(10,13,16,0) 0%, rgba(10,13,16,0.94) 68%)" }}
                    />
                    <span className="absolute inset-x-5 bottom-5 block">
                      <span className="block whitespace-pre-line font-display text-lg uppercase leading-[1.15] tracking-tight text-paper">
                        {card.short}
                      </span>
                    </span>
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-paper/70">
                      {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                    </span>
                  </>
                )}
              </button>
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
              <span className="font-mono text-[9px] text-emerald-100" style={{ opacity: on ? 1 : 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {/* The reference's pill toolbar: the full name and the sentence for
          whichever card is up front.

          A *fixed* height, not a min-height. The ten titles run 19–38
          characters and the descriptions 48–97, so at this width they set to
          a different number of lines from one card to the next. Under
          `min-h` the block was free to grow past it, and because this whole
          chapter is centred against the copy column beside it
          (`lg:items-center` in AiPitch), every extra line re-centred the
          entire row — the heading beside it visibly shifted on a swap. A
          hard height means the tallest entry defines the box once and
          nothing below or beside it ever moves again. */}
      <div className="mt-6 h-[86px] overflow-hidden">
        <p className="font-display text-sm uppercase leading-snug tracking-tight text-white">{front.title}</p>
        <p className="mt-2 max-w-[420px] text-[13px] leading-snug text-paper/55">{front.description}</p>
      </div>
    </div>
  );
}
