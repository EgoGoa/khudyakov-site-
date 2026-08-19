"use client";

import { useEffect, useRef } from "react";

// The site's "vibe" mark: a luminous sphere — a hairline limb sweeping
// pink→violet→cyan around two wisps of light winding into a hot core.
//
// Drawn on a canvas rather than played back from the reference clip, because
// the mark has to sit on a *transparent* background: the source video is on
// solid black with no alpha channel, and the only way to key that out in the
// browser (mix-blend-mode: screen) only works over surfaces at least as dark
// as the video's black — it would fail over the glass rail, over light
// sections and over any photo. Canvas gives real alpha, one file instead of
// 230 KB of video, any size without resampling, and a hover state that can
// change the drawing rather than just filter it.
//
// Everything is additive ('lighter'): overlapping light adds up the way it
// does in the reference's bloom, and nothing ever paints an opaque disc.
// There is no background layer anywhere in here by design.

// Sphere-diameter multiplier for the canvas box. The halo needs room to fade
// out *inside* the canvas — without the headroom it gets clipped square at
// the element's edge, which is visible as a faint box on dark backgrounds.
const PAD = 1.9;

// Sampled off the reference clip: pink → violet → blue → cyan → violet, back
// round to pink. Same family as GLASS_BTN.vibe (#ec4899/#a855f7/#38bdf8), a
// touch more saturated so the limb keeps its hue instead of blowing to white
// once the additive passes stack.
const RIM: [number, number, number][] = [
  [255, 105, 170],
  [190, 105, 255],
  [92, 150, 255],
  [120, 220, 255],
  [200, 130, 255],
  [255, 105, 170],
];

function lerpStops(stops: [number, number, number][], u: number) {
  const n = stops.length - 1;
  const i = Math.min(n - 1, Math.floor(u * n));
  const f = u * n - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

type FilamentOpts = {
  color: string;
  /** Angle the wisp enters at. */
  a0: number;
  /** How far round it winds, signed — negative winds the other way. */
  span: number;
  /** Radius (fraction of R) at the outer end and at the core end. */
  rOut: number;
  rIn: number;
  width: number;
  alpha: number;
  wob: number;
  phase: number;
};

// Glow is built by drawing each stroke a few times — wide and faint, then
// narrower and brighter — and letting the additive composite stack them into
// a halo. Deliberately NOT canvas shadowBlur: shadowBlur re-blurs its whole
// region on every single stroke call, and at ~90 tapered segments a frame it
// measured 25ms, which pinned the page to 30fps. That in turn wrecked the
// WebGL smoke trail behind it, whose advection step is driven by real frame
// time — a slower frame means a coarser step and visibly mushier vortices.
// Plain strokes cost essentially nothing and read the same at these sizes.
const FILAMENT_PASSES = [
  { w: 4.2, a: 0.05 },
  { w: 2.1, a: 0.13 },
  { w: 1.0, a: 1.0 },
];

// A wisp is a spiral, not a ring segment: it enters near the limb and winds
// inward to the core, tapering to nothing at both ends. The inward wind is
// what makes it read as fluid being drawn into the centre rather than as a
// crescent moon sitting inside a circle.
function filament(ctx: CanvasRenderingContext2D, C: number, R: number, o: FilamentOpts) {
  const STEPS = 28;
  const radiusAt = (p: number) =>
    (o.rIn + (o.rOut - o.rIn) * (1 - p)) * (1 + o.wob * Math.sin(p * 5.1 + o.phase));
  ctx.lineCap = "round";
  for (const pass of FILAMENT_PASSES) {
    for (let i = 0; i < STEPS; i++) {
      const p = i / STEPS;
      const q = (i + 1) / STEPS;
      const taper = Math.pow(Math.sin(Math.PI * p), 0.7);
      const a0 = o.a0 + o.span * p;
      const a1 = o.a0 + o.span * q;
      const r0 = radiusAt(p);
      const r1 = radiusAt(q);
      ctx.beginPath();
      ctx.moveTo(C + Math.cos(a0) * r0 * R, C + Math.sin(a0) * r0 * R);
      ctx.lineTo(C + Math.cos(a1) * r1 * R, C + Math.sin(a1) * r1 * R);
      ctx.lineWidth = Math.max(0.5, o.width * pass.w * R * taper);
      ctx.strokeStyle = `rgba(${o.color},${o.alpha * pass.a * taper})`;
      ctx.stroke();
    }
  }
}

// The limb's colour sweep, built once per canvas rather than per frame: 37
// addColorStop calls every frame is pure waste when the only thing that
// changes is the start angle, which the context transform handles instead.
function makeSweep(ctx: CanvasRenderingContext2D, C: number) {
  const cg = ctx.createConicGradient(0, C, C);
  const STOPS = 36;
  for (let i = 0; i <= STOPS; i++) {
    const u = i / STOPS;
    // Fades to nothing on the far side rather than closing into an even
    // ring — the limb is lit from one direction, like a real sphere.
    const env = Math.pow(Math.sin(Math.PI * u), 1.5);
    const [r, gg, b] = lerpStops(RIM, u);
    cg.addColorStop(u, `rgba(${r},${gg},${b},${env})`);
  }
  return cg;
}

// Same cheap-bloom trick as the filaments: three concentric strokes instead
// of one blurred one.
const RIM_PASSES = [
  { w: 0.30, a: 0.04 },
  { w: 0.125, a: 0.1 },
  { w: 0.038, a: 0.8 },
];

function drawOrb(
  ctx: CanvasRenderingContext2D,
  S: number,
  t: number,
  lit: number,
  sweep: CanvasGradient | string
) {
  const C = S / 2;
  const R = S / (2 * PAD);
  const boost = 1 + 0.5 * lit;
  const breath = 0.5 + 0.5 * Math.sin(t * 0.62);
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.5);

  ctx.clearRect(0, 0, S, S);
  ctx.globalCompositeOperation = "lighter";

  // Halo. Starts at the limb, not at the centre: the interior has to stay
  // unlit so the wisps read against dark, and so the mark stays honestly
  // transparent instead of carrying a tinted disc around with it.
  const g = ctx.createRadialGradient(C, C, R * 0.5, C, C, R * (1.55 + 0.14 * breath));
  g.addColorStop(0, "rgba(236,72,153,0.03)");
  g.addColorStop(0.24, `rgba(236,72,153,${(0.2 + 0.07 * breath) * boost})`);
  g.addColorStop(0.52, `rgba(168,85,247,${0.12 * boost})`);
  g.addColorStop(0.76, `rgba(56,189,248,${0.06 * boost})`);
  g.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // The limb: one continuous stroke filled by a conic gradient, deliberately
  // not a loop of arc segments — under 'lighter' each segment's ends overlap
  // its neighbour's and add up, beading the hairline into a dotted line.
  // The sweep is a fixed gradient; the rotation is applied to the context, so
  // nothing has to be rebuilt per frame.
  ctx.save();
  ctx.translate(C, C);
  ctx.rotate(t * 0.26);
  ctx.translate(-C, -C);
  ctx.lineCap = "butt";
  ctx.strokeStyle = sweep;
  for (const pass of RIM_PASSES) {
    ctx.globalAlpha = pass.a * boost;
    ctx.lineWidth = Math.max(0.6, pass.w * R);
    ctx.beginPath();
    ctx.arc(C, C, R, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Two wisps on deliberately different radius bands at incommensurate
  // rates: matched ones drift into mirror symmetry every few seconds and
  // momentarily read as a heart.
  filament(ctx, C, R, {
    color: "188,228,255",
    a0: t * 0.42,
    span: 2.4,
    rOut: 0.7,
    rIn: 0.1,
    width: 0.075,
    alpha: 0.85 * boost,
    wob: 0.09,
    phase: t * 0.9,
  });
  filament(ctx, C, R, {
    color: "255,132,196",
    a0: -t * 0.23 + 3.2,
    span: -1.7,
    rOut: 0.82,
    rIn: 0.34,
    width: 0.055,
    alpha: 0.6 * boost,
    wob: 0.14,
    phase: -t * 1.1 + 2,
  });

  // Hot core where the wisps converge.
  const cr = R * (0.11 + 0.05 * pulse);
  const cg2 = ctx.createRadialGradient(C, C, 0, C, C, cr * 2.6);
  cg2.addColorStop(0, `rgba(255,248,255,${(0.7 + 0.3 * pulse) * boost})`);
  cg2.addColorStop(0.4, `rgba(255,184,232,${0.3 * boost})`);
  cg2.addColorStop(1, "rgba(255,184,232,0)");
  ctx.fillStyle = cg2;
  ctx.beginPath();
  ctx.arc(C, C, cr * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

export default function VibeOrb({
  size = 22,
  className = "",
}: {
  /** Diameter of the sphere itself. The glow renders outside it, unclipped. */
  size?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const S = Math.round(size * PAD);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    canvas.style.width = `${S}px`;
    canvas.style.height = `${S}px`;
    ctx.scale(dpr, dpr);

    // Safari < 16 has no conic gradient; a flat violet limb loses the sweep
    // but keeps the shape rather than dropping the mark entirely.
    const sweep =
      typeof ctx.createConicGradient === "function"
        ? makeSweep(ctx, S / 2)
        : "rgba(190,120,255,0.75)";

    // One still frame and nothing else for visitors who ask for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawOrb(ctx, S, 0, 0, sweep);
      return;
    }

    // The lit state follows :hover/:focus-visible on the nearest trigger (the
    // whole button, not just the 22px circle), read straight off the DOM each
    // frame rather than mirrored into React state — the orb is already
    // repainting anyway, and this keeps the CSS the single owner of "hovered"
    // for both the scale-up and the brightening. `lit` is eased rather than
    // switched, so the light ramps in and out instead of snapping.
    const trigger = wrap.closest(".vibe-orb-trigger") ?? wrap;
    // Probed once, not per frame: `matches` throws on a selector the engine
    // doesn't know, and pre-15.4 Safari would throw on every single frame.
    let litSelector = ":hover, :focus-visible";
    try {
      wrap.matches(litSelector);
    } catch {
      litSelector = ":hover";
    }
    let lit = 0;
    let onScreen = true;
    let raf = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen || document.hidden) return;
      const target = trigger.matches(litSelector) ? 1 : 0;
      lit += (target - lit) * 0.12;
      drawOrb(ctx, S, (now - t0) / 1000, lit, sweep);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "80px" }
    );
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size]);

  return (
    <span
      ref={wrapRef}
      aria-hidden="true"
      // The layout box is the sphere; the canvas is wider and centred on it,
      // so the halo spills outside without pushing anything around.
      className={`vibe-orb pointer-events-none relative block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  );
}
