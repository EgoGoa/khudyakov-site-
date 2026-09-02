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

/** Scales a colour up until its brightest channel is maxed, leaving hue and
 *  saturation untouched (this is HSV value-normalisation).
 *
 *  The lit dot takes its colour from its own position along the page's
 *  gradient, which is what makes scrolling walk down the gradient — but the
 *  two ends of a gradient are rarely equally bright, so the SAME lit dot
 *  looked strong on one chapter and washed out on the next. /ai is the worst
 *  case: lime #c8f169 runs to emerald #10b981, whose brightest channel is
 *  0xb9 against the lime's 0xf1, so the lower chapters' dot was rendering at
 *  roughly three quarters the brightness of the upper ones — read as "the
 *  indicator dimmed", not as "the colour changed".
 *
 *  Normalising the value fixes the brightness while keeping each position's
 *  own hue, so the rail still reads as the page's gradient top to bottom and
 *  every chapter's dot lights up equally. Applied to the indicator only —
 *  the dim track dots are the scale itself, and evening them out would flatten
 *  the gradient they exist to draw. */
function brighten([r, g, b]: RGB): RGB {
  const peak = Math.max(r, g, b);
  if (peak === 0) return [r, g, b];
  const k = 255 / peak;
  return [Math.round(r * k), Math.round(g * k), Math.round(b * k)];
}

/** Perceived brightness (Rec. 709 relative luminance), 0..1. The channels are
 *  weighted very unevenly — green 0.72, red 0.21, blue 0.07 — because the eye
 *  is far more sensitive to green light than to blue. */
function luminance([r, g, b]: RGB): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Blends a colour toward white by exactly as much as it takes to reach
 *  `target` perceived brightness, and no further.
 *
 *  Maxing the brightest channel (brighten, above) equalises how *saturated*
 *  a colour is, not how bright it looks: measured across the four pages'
 *  gradients, value-normalised colours still spanned 0.46 to 0.92 luminance —
 *  /ai's lime read twice as bright as /smm's violet, because a maxed blue
 *  contributes barely a tenth of what a maxed green does. Blue and violet
 *  simply cannot reach a high luminance while staying fully saturated, so the
 *  only way to make every chapter's dot equally bright is to let the dark
 *  hues carry some white.
 *
 *  Solving for the blend factor rather than using a fixed one is what keeps
 *  that honest: already-bright hues are left essentially untouched, and only
 *  the hues that need it are lifted. The page's colour survives as a clear
 *  tint, and the saturated version still paints the glow around the dot — so
 *  identity comes from the halo, brightness from the core. */
function lift(c: RGB, target = 0.88): RGB {
  const l = luminance(c);
  if (l >= target) return c;
  const t = (target - l) / (1 - l);
  return [
    Math.round(c[0] + (255 - c[0]) * t),
    Math.round(c[1] + (255 - c[1]) * t),
    Math.round(c[2] + (255 - c[2]) * t),
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
  // Two colours for the lit dot, on purpose: `glowRgb` is the saturated hue
  // (so the halo still says which chapter of the gradient you are on), and
  // `coreRgb` is that same hue lifted to a constant perceived brightness (so
  // the dot itself never looks dimmer on one chapter than another).
  const saturated = brighten(mix(a, b, count > 1 ? activeIndex / (count - 1) : 0));
  const [gr, gg, gb] = saturated;
  const [ar, ag, ab] = lift(saturated);
  const glowRgb = `${gr}, ${gg}, ${gb}`;
  const coreRgb = `${ar}, ${ag}, ${ab}`;
  // One slot's share of the rail, in %. The indicator is centred on the
  // active slot's midpoint (top: (i+0.5)/count) and sized a little taller
  // than one bare slot so it visibly overlaps its neighbours rather than
  // fitting exactly between them — a glowing pill, not a ruler tick.
  const slotPct = 100 / count;

  return (
    <div
      // 210px. Down from 66svh (≈627px — two thirds of the viewport), and
      // deliberately shorter than the ~308px VibeRail this was first matched
      // to while the rail was drawn as line segments.
      //
      // The dots are why. Segments are continuous, so stretching them over
      // 320px still read as one connected scale; six 5px dots over that same
      // height sit 53px apart and stop reading as one control at all — just
      // specks scattered down the edge. At 210px the gap is ~35px, about
      // seven times the dot, which is close enough to group them and open
      // enough that they never look like a dashed line.
      //
      // Fixed px rather than an svh fraction on purpose: this spacing is the
      // whole point of the shape, and a viewport-relative height would
      // re-scatter the dots on every other screen size.
      className="pointer-events-none absolute left-6 top-1/2 z-0 hidden h-[210px] -translate-y-1/2 lg:block xl:left-9"
      aria-hidden="true"
      style={{ opacity: started ? 1 : 0, transition: "opacity 600ms ease-out" }}
    >
      {/* The track: static, always-visible, always the same dim width — its
          only job is painting the gradient scale top to bottom. Nothing
          here ever animates, so there is nothing here that can look
          "incorrect" mid-scroll — all the motion lives in the indicator
          below. */}
      {/* Dots rather than segments. Each dot sits centred in its own
          equal-height flex-1 slot rather than the column being
          `justify-between`: with justify-between the first and last dots
          are pinned to the container's edges, so their centres are NOT at
          (i+0.5)/count and the indicator below — which is positioned by
          exactly that formula — would drift off them, worst at the ends.
          Equal slots keep the two in agreement by construction, so the
          moving light always lands dead on a dot. */}
      <div className="flex h-full flex-col">
        {Array.from({ length: count }, (_, i) => {
          const [r, g, bl] = mix(a, b, count > 1 ? i / (count - 1) : 0);
          return (
            <span key={i} className="flex flex-1 items-center justify-center">
              <span
                className="block h-[5px] w-[5px] rounded-full"
                // 0.45, not the segments' old 0.3: a 5px dot has a fraction
                // of a 45px bar's area, so the same alpha that read as a
                // present-but-quiet line reads as almost nothing as a dot.
                style={{ background: `rgba(${r}, ${g}, ${bl}, 0.45)` }}
              />
            </span>
          );
        })}
      </div>

      {/* The indicator: the one thing that moves. A plain CSS transition on
          `top` (a percentage, so it needs no pixel measurement of the
          track) is what makes the light travel from one chapter's position
          to the next instead of two segments independently fading in
          place. */}
      <span
        // A round dot now, not a pill — a fixed 10px circle rather than a
        // slot-proportional height, so it reads as "this dot is lit" and
        // stays the same size whether the page has six chapters or eight.
        // Centred on the column's midline (left-1/2) so it sits squarely on
        // the dot it marks.
        className="absolute left-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[top,background] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          top: `${(activeIndex + 0.5) * slotPct}%`,
          background: `rgb(${coreRgb})`,
          boxShadow: `0 0 10px rgba(${glowRgb},0.95), 0 0 26px rgba(${glowRgb},0.6), 0 0 54px rgba(${glowRgb},0.3)`,
        }}
      />
    </div>
  );
}
