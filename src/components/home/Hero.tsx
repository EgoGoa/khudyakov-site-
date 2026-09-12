"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Magnetic from "@/components/ui/Magnetic";
import MagneticChars from "@/components/ui/MagneticChars";
import { PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";


// Same numbers as Stats.tsx, but a plain inline row here — no border, no
// grid — just filling the space under the CTAs.
const heroStats = [
  { value: "8 лет", label: "на рынке" },
  { value: "350+", label: "клиентов" },
  { value: "450+", label: "проектов" },
  { value: "5 стран", label: "опыта" },
];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  // Self-hosted now (was a YouTube embed) — one less third-party origin to
  // connect to on the very first screen. Still deferred a beat so the
  // headline/CTAs settle first: a static frame from the reel covers the
  // spot immediately, and the <video> fades in once it's ready.
  const [loadReel, setLoadReel] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setLoadReel(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setLoadReel(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  // Track the cursor as CSS custom properties (not React state) so the
  // glow can follow the mouse every frame without triggering re-renders.
  const handleTitleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = titleWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden pb-0 pt-16 text-paper sm:pt-20">
      {/* showreel behind the headline, full width across the top of the
          site — playing on a loop, softly blurred at rest so the type stays
          readable and snapping sharp on hover */}
      <div className="group absolute inset-0 -z-10 overflow-hidden">
        {/* Same still the iframe itself would show at rest — covers the spot
            immediately so there's no blank/black flash while the embed is
            deferred. */}
        <img
          src="/images/showreel-frame.jpg"
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[280%] max-w-none scale-[1.5] -translate-x-1/2 -translate-y-1/2 object-cover blur-[3px] brightness-[0.85] transition-opacity duration-500 sm:w-[200%] md:w-[147%] lg:w-[127%] ${
            loadReel ? "opacity-0" : "opacity-100"
          }`}
        />
        {loadReel && (
          <video
            ref={videoRef}
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[280%] max-w-none scale-[1.5] -translate-x-1/2 -translate-y-1/2 object-cover blur-[3px] brightness-[0.85] transition-[filter] duration-500 ease-out group-hover:blur-0 group-hover:brightness-100 sm:w-[200%] md:w-[147%] lg:w-[127%]"
            src="/video/showreel-hero.mp4"
            poster="/images/showreel-frame.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Шоурил HDKV.AGENCY"
          />
        )}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.55) 0%, rgba(11,11,16,0.35) 28%, rgba(11,11,16,0.88) 72%, #0B0B10 100%)",
          }}
        />
      </div>

      <Container className="flex flex-1 flex-col justify-center">
        <div
          ref={titleWrapRef}
          onMouseMove={handleTitleMouseMove}
          className="hero-title-wrap relative mt-6"
        >
          <div className="hero-title-glow" aria-hidden="true" />
          {/* "Монолит" (headline mockup option 03), carried over as literal
              CSS — perspective on the outer wrap, the fixed tilt as a plain
              static transform on the middle div, exactly the two mockup
              rules (.h3-wrap / .h3). That tilt has to sit on a div of its
              own rather than directly on motion.h1: framer writes its own
              opacity/y animation as an inline `transform` on whatever
              element carries `animate`, and an inline style always beats a
              CSS class — a `.hero-monolith` class placed on motion.h1
              itself would get its rotateX/scale silently overwritten the
              instant framer's animation ran. */}
          <div className="hero-monolith-wrap">
            <div className="hero-monolith">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                // No text-*/leading-*/tracking-* here on purpose: size,
                // line-height and letter-spacing come from .hero-monolith
                // so they stay exactly the mockup's values.
                className="relative max-w-4xl font-display font-extrabold uppercase"
              >
                <MagneticChars text="DIGITAL " className="hero-neon-word" />
                <span className="hero-ai-gradient-smoke">AI</span>
                {" "}
                <MagneticChars text="- который" className="hero-gradient-text" />
                <br />
                <MagneticChars text="быстрее рынка" className="hero-gradient-text" />
              </motion.h1>
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg"
        >
          Продакшн, брендинг и SMM — усиленные AI там, где это ускоряет результат, а не там, где модно. Снимаем, придумываем и запускаем контент, который бренды не могут себе позволить не заметить.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="tel:+79925111812"
            className="btn-neon !px-4 !py-2 !text-[9px]"
            style={{ "--btn-neon-delay": "0s" } as CSSProperties}
          >
            <PhoneIcon className="animate-pulse" />
            Заказать звонок
          </a>
          <a
            href="https://t.me/hdkv"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon !px-4 !py-2 !text-[9px]"
            style={{ "--btn-neon-delay": "1.2s" } as CSSProperties}
          >
            <TelegramIcon />
            Написать в Telegram
          </a>
          <a
            href="https://wa.me/79925111812"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon !px-4 !py-2 !text-[9px]"
            style={{ "--btn-neon-delay": "2.4s" } as CSSProperties}
          >
            <WhatsAppIcon />
            Написать в WhatsApp
          </a>
        </motion.div>
      </Container>

      {/* Anchored to the hero's own bottom, above the menu strip — Container
          above is flex-1/justify-center, so it absorbs the extra vertical
          space on tall viewports and this row naturally lands right where
          the CTAs used to leave empty air. justify-between stretches it
          across the full width instead of clustering left like the CTAs. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative mt-10 shrink-0"
      >
        <Container className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 pb-6">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <span className="font-display text-2xl uppercase text-paper sm:text-3xl">
                {stat.value}
              </span>
              <span className="ml-2 font-display text-xs uppercase tracking-[0.1em] text-paper/50">
                {stat.label}
              </span>
            </div>
          ))}
        </Container>
      </motion.div>

    </section>
  );
}
