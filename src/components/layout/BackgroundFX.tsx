"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

// Fixed backdrop shared by the whole page: the showreel scrubbed by scroll
// position (not autoplaying — see the rAF loop below), a cinematic glow
// gradient, faint grain, and the two vertical guide lines that frame the
// content column. Also hosts the SVG noise filters used by the shiny
// gradient headlines. Every liquid-glass card backdrop-blurs this footage,
// which is what gives them their frosted-glass look.
const BG_VIDEO_SRC = "/video/bg-showreel.mp4";

export default function BackgroundFX() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll();
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.55, 0.9]);
  // She is the full-bleed backdrop for the site *below* the hero: the hero
  // keeps its own full-width showreel, so she fades in as that scrolls away
  // and then stays put behind every section — visible in the gaps between
  // glass cards and softly through their backdrop-blur.
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.04, 0.1], [0, 0, 0.6]);

  // Interaction-driven playback.
  //
  // This deliberately drives playbackRate rather than assigning currentTime
  // per frame: seeking every rAF tick starts a new seek before the previous
  // one finishes, so the decoder never lands a frame (readyState drops to 1
  // and `seeking` stays true) and the picture freezes even though
  // currentTime keeps climbing. Letting the element play and only easing its
  // rate keeps decoding continuous, which is what makes it actually smooth.
  //
  // A single rAF loop eases a 0..1 "speed" toward 1 while the visitor is
  // doing something (scrolling, moving the pointer, typing) and toward 0
  // once they stop. The easing is exponential smoothing against elapsed
  // time, so it is frame-rate independent and both the start and the stop
  // are gradual rather than switching on and off.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX_RATE = 0.5; // slow, cinematic drift at full engagement
    const MIN_RATE = 0.08; // floor before we let it settle to a stop
    const RAMP = 0.7; // seconds — time constant of the ease in/out
    const IDLE_MS = 700; // grace period before easing back down

    let speed = 0;
    let playing = false;
    let lastActivity = 0;
    let last = performance.now();
    let rafId = 0;

    const markActivity = () => {
      lastActivity = performance.now();
    };
    const events = ["scroll", "wheel", "pointermove", "touchmove", "keydown"] as const;
    events.forEach((e) =>
      window.addEventListener(e, markActivity, { passive: true })
    );

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = now - lastActivity < IDLE_MS ? 1 : 0;
      speed += (target - speed) * (1 - Math.exp(-dt / RAMP));

      if (speed > 0.02) {
        if (!playing) {
          playing = true;
          video.play().catch(() => {
            playing = false;
          });
        }
        video.playbackRate = MIN_RATE + (MAX_RATE - MIN_RATE) * speed;
      } else if (playing) {
        playing = false;
        video.pause();
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      events.forEach((e) => window.removeEventListener(e, markActivity));
      video.pause();
    };
  }, []);

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="khud-noise-headline">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
          <filter id="khud-noise-watermark">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.1" />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-ink">
        <motion.div
          style={{
            opacity: glowOpacity,
            backgroundImage:
              "radial-gradient(60% 45% at 50% 0%, rgba(0,210,255,0.12), transparent 70%), radial-gradient(45% 35% at 85% 60%, rgba(245,49,11,0.08), transparent 70%)",
          }}
          className="pointer-events-none absolute inset-0"
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />

        {/* she spans the full width as the backdrop for the whole site
            below the hero, fading in as the hero scrolls away and then
            staying put behind every section */}
        <motion.div
          style={{ opacity: portraitOpacity }}
          className="pointer-events-none absolute inset-0"
        >
          <img
            src="/images/portrait-wide.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          {/* keeps body copy legible over the photo without flattening it */}
          <div className="absolute inset-0 bg-ink/45" />
        </motion.div>

        {/* the scroll-driven graphics live in the smoky left half of the
            frame and fade out well before her, so she is never covered.
            Screen-blended so only the light/particles carry over the photo,
            and kept light so it reads as atmosphere rather than noise. */}
        <div
          className="absolute inset-y-0 left-0 w-[62%]"
          style={{
            maskImage: "linear-gradient(to right, #000 0%, #000 48%, transparent 88%)",
            WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 48%, transparent 88%)",
          }}
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover opacity-50 mix-blend-screen"
            src={BG_VIDEO_SRC}
          />
        </div>
      </div>

      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+40rem)] w-px bg-paper/[0.06] z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+40rem)] w-px bg-paper/[0.06] z-[5]" />
    </>
  );
}
