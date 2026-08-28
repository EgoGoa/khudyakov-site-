"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// The footer's own drifting-flare background (public/images/footer-flares.jpg),
// pulled out so any section that wants to visually merge into the footer —
// rather than hand off to it across a hard bg-ink seam — can carry the exact
// same texture, timing and gradient. See Footer.tsx for the original.
//
// Five blurred color-flare spots baked into one wide texture: violet, blue,
// cyan, red, green. Each layer drifts through all five in a different
// order/phase via the "flare-drift" keyframe (tailwind.config.ts) —
// background-position eases between the --p0..--p4 custom properties while
// opacity dips mid-transit and blooms at each stop, so flares read as
// smoothly appearing in different spots rather than blinking in place.
const VIOLET = "10% 18%";
const BLUE = "88% 10%";
const CYAN = "8% 82%";
const RED = "50% 48%";
const GREEN = "88% 85%";

export const FLARE_LAYERS: { stops: [string, string, string, string, string]; duration: number; baseDelay: number }[] = [
  { stops: [VIOLET, RED, CYAN, BLUE, GREEN], duration: 44, baseDelay: 0 },
  { stops: [BLUE, GREEN, VIOLET, RED, CYAN], duration: 52, baseDelay: -18 },
  { stops: [CYAN, BLUE, GREEN, VIOLET, RED], duration: 60, baseDelay: -35 },
];

/** Drop into a `relative overflow-hidden` ancestor. Renders the three
 *  drifting flare layers plus the same top-to-bottom darkening gradient the
 *  footer uses over them, so text stays legible without a heavier scrim.
 *
 *  AiSeoText and Footer each mount their own independent copy of this — a
 *  visitor scrolling from one straight into the other is meant to read it as
 *  one continuous background, but a plain `animation-delay: layer.baseDelay`
 *  only fixes each layer's phase *relative to the moment its own element
 *  mounted*, not relative to the other instance's. Two copies mounting even
 *  a few hundred ms apart (React hydration order, one being further down the
 *  page) drift out of phase — same colours, same timing, different position
 *  in the cycle — and the two sections visibly stop matching, which is
 *  exactly the seam merging their gradients (see the overlay below) was
 *  supposed to remove but couldn't on its own, since that only ever fixed
 *  darkness, not which colour is showing where.
 *
 *  The fix is a shared clock: `performance.now()` is time since the page's
 *  own navigation start, the same origin for every component on the page
 *  regardless of when each one mounts. Setting each layer's delay to
 *  `baseDelay − (mountTime / 1000)` at mount time makes its animation clock
 *  equal `elapsedPageTime − baseDelay` everywhere — two elements with the
 *  same `baseDelay` are then mathematically at the same point in the loop at
 *  any given moment, however far apart they actually mounted. */
export default function FlareBackground({ fadeTop = false }: { fadeTop?: boolean }) {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mountedAt = performance.now() / 1000;
    layerRefs.current.forEach((el, i) => {
      if (!el) return;
      const layer = FLARE_LAYERS[i];
      el.style.animationDelay = `${layer.baseDelay - mountedAt}s`;
    });
  }, []);

  return (
    <>
      {FLARE_LAYERS.map((layer, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="pointer-events-none absolute inset-0 bg-no-repeat animate-flare-drift"
          style={
            {
              backgroundImage: "url(/images/footer-flares.jpg)",
              backgroundPosition: layer.stops[0],
              // Explicit "200% 200%", not the shorthand "200%" — see
              // Footer.tsx's own note: a single value only sets width, which
              // left the texture shorter than the box on some viewports.
              backgroundSize: "200% 200%",
              animationDuration: `${layer.duration}s`,
              "--p0": layer.stops[0],
              "--p1": layer.stops[1],
              "--p2": layer.stops[2],
              "--p3": layer.stops[3],
              "--p4": layer.stops[4],
            } as CSSProperties
          }
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          // Both arcs are pinned to the exact same 0.4 value at the seam —
          // fadeTop's own last stop and the default gradient's first stop —
          // on purpose. A section using `fadeTop` (AiSeoText) hands off
          // directly into one *not* using it (Footer) immediately below,
          // and the two are rendered by separate component instances with
          // no shared element between them; even a 1% difference in opacity
          // right at that boundary painted as a visible hard edge, which is
          // exactly the seam this was built to remove. Any future edit to
          // one arc's boundary value has to carry through to the other's.
          background: fadeTop
            ? // Fades in from the section's own top edge instead of starting
              // dark immediately — for a section that hands off *into* the
              // footer below it rather than opening on it, so the seam above
              // (usually a plain page background) isn't cut hard against the
              // flare texture starting at full strength. Holds flat at 0.4
              // rather than dipping back toward black, so nothing changes
              // right as it crosses into the next section's own background.
              "linear-gradient(to bottom, rgba(11,11,16,1) 0%, rgba(11,11,16,0.4) 30%, rgba(11,11,16,0.4) 100%)"
            : // Never reaches fully opaque (1) — that used to flatten the
              // texture to solid black by 65% down the footer's own height,
              // which is most of it (the nav columns, socials and copyright
              // all sit below that point). Asked to read as one background
              // all the way to the bottom of the site, not fade out partway
              // through the footer, so this caps at 0.85: dark enough for
              // the muted nav/copyright text to stay legible, never fully
              // hides the flares underneath it.
              "linear-gradient(to bottom, rgba(11,11,16,0.4) 0%, rgba(11,11,16,0.65) 55%, rgba(11,11,16,0.85) 100%)",
        }}
      />
    </>
  );
}
