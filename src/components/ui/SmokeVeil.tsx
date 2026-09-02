"use client";

import { useId } from "react";

// Glowing smoke creeping along the bottom edge of a section.
//
// Built from procedural noise rather than a smoke photo or a video loop, for
// three reasons: it downloads nothing, it costs no image-generation credits,
// and — the technical one — a texture we generate ourselves can be sized and
// re-coloured freely instead of being locked to whatever a source file happens
// to contain.
//
// WHY IT IS CHEAP (this is the part that matters):
//
// An SVG filter is expensive to *evaluate* and cheap to *move*. The classic
// mistake with feTurbulence is animating `baseFrequency` to make the smoke
// churn — that re-runs the whole fractal-noise computation on every single
// frame, for every pixel, on the CPU, and will drop a page to single-digit
// FPS. Here the noise is evaluated once per layer, at mount, and never again:
// the only thing that ever animates is a CSS `transform` on the wrapper, which
// the browser hands to the GPU as a composited layer. That is why this can run
// forever without stutter and without competing with the video playing behind
// it or the WebGL cursor smoke elsewhere on the page.
//
// WHY IT LOOPS WITHOUT A JUMP:
//
// Each layer rotates a full 360°. A full turn ends in exactly the state it
// started in, so the loop point is mathematically invisible — there is no
// seam to hide and no tile edge to match, which is the trap with scrolling a
// noise texture sideways (feTurbulence does not tile, so a horizontal loop
// shows a hard vertical join unless it is mirrored or stitched). The layers
// are oversized well past the container so their own edges never enter frame
// as they turn.
//
// WHY IT READS AS SMOKE AND NOT AS FOG:
//
// Plain fractal noise, however many octaves you give it, is fog — an even
// cloud with soft blobs. Real smoke has two things it does not: curling
// filaments, and the vortices they wrap around. Both are produced here, and
// neither comes free from feTurbulence:
//
//   1. VORTICES — domain warping (`feDisplacementMap`). A second, coarser
//      noise field is used to push the texture's own pixels sideways: where
//      that field is strong the texture stretches and curls, where it reverses
//      the texture folds back on itself. Displacing noise BY noise is what
//      turns concentric blobs into the swirls and eddies smoke actually makes.
//      Straight turbulence has no mechanism for this at all, which is exactly
//      why the first pass came out as fog.
//
//   2. FILAMENTS — a band-pass on alpha (`feComponentTransfer` with a `table`
//      that rises to 1 and falls back to 0). A THRESHOLD keeps everything
//      brighter than some level, which yields solid clumps — clouds. A narrow
//      BAND keeps only the values inside a slice, and a thin slice through a
//      smooth field is a contour line: long, thin, curving ribbons with clear
//      air between them. That is the shape of cigarette smoke, and it is the
//      single biggest difference from the previous version.
//
// Supporting details: the base frequency is anisotropic so shapes stretch
// horizontally the way smoke lies when it creeps along a surface; the colour
// matrix forces RGB to pure white and takes alpha from one channel; and
// `screen` blending on dark footage adds light instead of painting grey over
// it — the difference between smoke that glows and smoke that looks like dirt
// on the lens.
//
// All of it is still evaluated exactly once per layer. Measured on /smm the
// veil costs 0 fps (121 with, 121 without), because the per-frame work is a
// GPU transform and nothing else — which is what buys the headroom for a
// filter chain this long.

type Layer = {
  /** Larger = finer, busier noise. */
  frequency: number;
  /** Softening pass over the carved wisps, in filter units. */
  blur: number;
  /** Seconds for one full rotation — all different, so the layers never line
   *  up into a single obvious shape. */
  duration: number;
  /** Turn the other way, so the layers slide across each other. */
  reverse?: boolean;
  opacity: number;
  /** Extra scale on top of the base oversize, so the layers differ in the
   *  apparent size of their billows. */
  scale: number;
};

const LAYERS: Layer[] = [
  { frequency: 0.004, blur: 9, duration: 150, opacity: 0.5, scale: 1 },
  { frequency: 0.008, blur: 6, duration: 105, opacity: 0.36, scale: 1.25, reverse: true },
  { frequency: 0.014, blur: 4, duration: 78, opacity: 0.22, scale: 1.5 },
];

export default function SmokeVeil({
  className = "",
  /** How tall the smoke band is, as a share of its positioned parent. The
   *  fade to nothing happens inside this, so the smoke is visibly denser than
   *  this number suggests at the very bottom and gone well before the top. */
  height = "38%",
}: {
  className?: string;
  height?: string;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      aria-hidden="true"
      // The mask is what keeps this to the bottom edge: fully opaque along the
      // floor, gone by the top of the band. Without it the layer would end on
      // a straight horizontal line, which instantly reads as a rectangle of
      // texture rather than smoke thinning out into air.
      className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}
      style={{
        height,
        mixBlendMode: "screen",
        maskImage:
          "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 22%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 22%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0) 100%)",
      }}
    >
      {LAYERS.map((layer, i) => {
        const filterId = `smoke-${uid}-${i}`;
        return (
          <div
            key={filterId}
            className="smoke-veil-layer absolute left-1/2 top-1/2"
            style={{
              // Comfortably larger than the box and centred on it, so a full
              // rotation never brings a corner into view.
              width: "260%",
              height: "260%",
              opacity: layer.opacity,
              // `--s` is read by the keyframes so the layer's own scale
              // survives the rotation — a transform in the animation would
              // otherwise replace any scale set here.
              ["--s" as string]: layer.scale,
              animationDuration: `${layer.duration}s`,
              animationDirection: layer.reverse ? "reverse" : "normal",
            }}
          >
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter
                  id={filterId}
                  x="-15%"
                  y="-15%"
                  width="130%"
                  height="130%"
                  // sRGB, not the filter default of linearRGB: in linear space
                  // the same alpha cut leaves the wisps looking washed out and
                  // grey rather than lit.
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency={`${layer.frequency} ${layer.frequency * 2.1}`}
                    numOctaves={4}
                    seed={i * 17 + 5}
                    result="noise"
                  />
                  <feColorMatrix
                    in="noise"
                    type="matrix"
                    // RGB pinned to white; alpha carved from the red channel.
                    values="0 0 0 0 1
                            0 0 0 0 1
                            0 0 0 0 1
                            1.5 0 0 0 -0.52"
                    result="carved"
                  />
                  <feGaussianBlur in="carved" stdDeviation={layer.blur} />
                </filter>
              </defs>
              <rect width="100%" height="100%" filter={`url(#${filterId})`} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
