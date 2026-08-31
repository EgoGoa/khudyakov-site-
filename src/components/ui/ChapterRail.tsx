"use client";

import { useContext } from "react";
import { StageContext } from "@/components/ui/CinematicStage";

// The chapter progress rail down the left edge of a cinematic page.
//
// Generalised out of SitesChapterRail, which is where the whole shape was
// worked out (see the history in that file: a numbered list, then a single
// numbered node, then this — a scale of short segments, the version Egor
// picked). Nothing about the behaviour changed here; what moved is the two
// things that differ per page — how many chapters there are, and what colour
// the rail runs in.
//
// The colour is the page's own keyword gradient rather than one flat accent,
// which is what Egor asked for: each segment takes its hue from its own
// position along `from` → `to`, so the rail literally *is* the gradient, read
// top to bottom, and scrolling the deck walks down it. /ai runs lime →
// emerald, /sites its brand orange.
//
// The lit segment used to just switch off in place and the next one switch
// on — two independent elements each animating their own width/box-shadow,
// with nothing actually travelling between them. Egor's read on that:
// "должно плавно перемещаться свечением", and on the step transition
// specifically the active segment's own glow was *dimmed* on purpose (the
// old SETTLE_MS logic below) to read as "still arriving" — which on a real
// page just looked like the glow dropping out mid-scroll rather than
// something deliberate. Rebuilt as a track of always-visible, static dim
// segments (their only job is drawing the gradient scale) plus one single
// indicator pill layered on top, whose `top` is the only thing that changes
// — a plain CSS transition on a percentage value, so the light itself slides
// from one chapter's position to the next instead of two separate elements
// crossfading in place, and it never has a "dim while moving" state to fall
// into.

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export default function ChapterRail({
  count,
  from,
  to,
}: {
  /** How many chapters the page's deck has — one segment each. */
  count: number;
  /** Gradient start (top of the rail), as #rrggbb. */
  from: string;
  /** Gradient end (bottom of the rail), as #rrggbb. */
  to: string;
}) {
  const { activeIndex, started } = useContext(StageContext);
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const [ar, ag, ab] = mix(a, b, count > 1 ? activeIndex / (count - 1) : 0);
  const activeRgb = `${ar}, ${ag}, ${ab}`;
  // One slot's share of the rail, in %. The indicator is centred on the
  // active slot's midpoint (top: (i+0.5)/count) and sized a little taller
  // than one bare slot so it visibly overlaps its neighbours rather than
  // fitting exactly between them — a glowing pill, not a ruler tick.
  const slotPct = 100 / count;

  return (
    <div
      className="pointer-events-none absolute left-6 top-1/2 z-0 hidden h-[66svh] -translate-y-1/2 lg:block xl:left-9"
      aria-hidden="true"
      style={{ opacity: started ? 1 : 0, transition: "opacity 600ms ease-out" }}
    >
      {/* The track: static, always-visible, always the same dim width — its
          only job is painting the gradient scale top to bottom. Nothing
          here ever animates, so there is nothing here that can look
          "incorrect" mid-scroll — all the motion lives in the indicator
          below. */}
      <div className="flex h-full flex-col justify-between gap-2">
        {Array.from({ length: count }, (_, i) => {
          const [r, g, bl] = mix(a, b, count > 1 ? i / (count - 1) : 0);
          return (
            <span
              key={i}
              className="block w-px flex-1 rounded-full"
              style={{ background: `rgba(${r}, ${g}, ${bl}, 0.3)` }}
            />
          );
        })}
      </div>

      {/* The indicator: the one thing that moves. A plain CSS transition on
          `top` (a percentage, so it needs no pixel measurement of the
          track) is what makes the light travel from one chapter's position
          to the next instead of two segments independently fading in
          place. */}
      <span
        className="absolute left-0 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[top,background] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          top: `${(activeIndex + 0.5) * slotPct}%`,
          height: `calc(${slotPct}% + 10px)`,
          background: `rgb(${activeRgb})`,
          boxShadow: `0 0 10px rgba(${activeRgb},0.95), 0 0 28px rgba(${activeRgb},0.6), 0 0 60px rgba(${activeRgb},0.28)`,
        }}
      />
    </div>
  );
}
