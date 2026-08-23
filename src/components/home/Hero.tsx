"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Magnetic from "@/components/ui/Magnetic";
import { PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";

const SHOWREEL_YOUTUBE_ID = "HC5SMCQuoms";

const menuItems = ["Съёмка", "Монтаж", "Цветокор", "Звук", "Рендер"];

// Same numbers as Stats.tsx, but a plain inline row here — no border, no
// grid — just filling the space under the CTAs before the menu strip.
const heroStats = [
  { value: "8 лет", label: "на рынке" },
  { value: "350+", label: "клиентов" },
  { value: "450+", label: "проектов" },
  { value: "5 стран", label: "опыта" },
];

function useTimecode() {
  const [tc, setTc] = useState("00:00:00:00");

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsedMs = Date.now() - start;
      const totalFrames = Math.floor((elapsedMs / 1000) * 25);
      const frames = totalFrames % 25;
      const totalSeconds = Math.floor(totalFrames / 25);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const hours = Math.floor(totalMinutes / 60);
      const pad = (n: number) => String(n).padStart(2, "0");
      setTc(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`);
    }, 40);
    return () => clearInterval(id);
  }, []);

  return tc;
}

function useClock() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const formatted = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
      setLabel(formatted);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return label;
}

export default function Hero() {
  const timecode = useTimecode();
  const clock = useClock();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  // The YouTube embed (its own player JS + video stream) was mounting the
  // instant the page loaded, competing with the headline/CTAs — the actual
  // content of the very first screen — for bandwidth and main-thread time.
  // A static frame from the reel covers the same spot immediately; the
  // embed itself is deferred a beat so the critical content settles first,
  // then fades in once it's ready.
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
          // Laid out ~33% smaller than the visual size it ends up at (the
          // matching scale-[1.5] below stretches it back) rather than at
          // its full on-screen size directly: YouTube picks a stream
          // resolution from the iframe's actual layout box, and this was
          // requesting a needlessly high one for a video that's blurred at
          // rest and, even sharp on hover, is still just a background loop
          // behind text — CSS can't lower an already-negotiated resolution,
          // only the box size fed into that negotiation can.
          <iframe
            ref={frameRef}
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[280%] max-w-none scale-[1.5] -translate-x-1/2 -translate-y-1/2 blur-[3px] brightness-[0.85] transition-[filter] duration-500 ease-out group-hover:blur-0 group-hover:brightness-100 sm:w-[200%] md:w-[147%] lg:w-[127%]"
            src={`https://www.youtube.com/embed/${SHOWREEL_YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${SHOWREEL_YOUTUBE_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title="Шоурил HDKV.AGENCY"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
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
                <span className="hero-neon-word">DIGITAL </span>
                <span className="hero-ai-gradient-smoke">AI</span>
                <span className="hero-gradient-text">
                  {" "}- который
                  <br />
                  быстрее рынка
                </span>
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
          <Magnetic>
            <Link
              href="#works"
              className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light"
            >
              Смотреть работы
            </Link>
          </Magnetic>
          <a href="tel:+79925111812" className="btn-neon btn-neon-cycle" style={{ animationDelay: "0s" }}>
            <PhoneIcon className="animate-pulse" />
            Заказать звонок
          </a>
          <a
            href="https://t.me/+79925111812"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon btn-neon-cycle"
            style={{ animationDelay: "1.2s" }}
          >
            <TelegramIcon />
            Написать в Telegram
          </a>
          <a
            href="https://wa.me/79925111812"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon btn-neon-cycle"
            style={{ animationDelay: "2.4s" }}
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
              <span className="ml-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/50">
                {stat.label}
              </span>
            </div>
          ))}
        </Container>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="relative mt-16 h-10 shrink-0 border-y border-paper/10 bg-ink/40 backdrop-blur-md sm:mt-auto"
      >
        <Container className="flex h-full items-center justify-between gap-3 overflow-hidden text-xs">
          <div className="flex min-w-0 items-center gap-4 whitespace-nowrap text-paper/70">
            <span className="flex shrink-0 items-center gap-1.5 font-semibold text-paper">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
              HDKV.AGENCY
            </span>
            {menuItems.map((item, i) => (
              <span
                key={item}
                className={`hidden ${i <= 1 ? "sm:inline" : ""} ${i > 1 && i <= 3 ? "md:inline" : ""} ${i > 3 ? "lg:inline" : ""}`}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-paper/50">
            <span className="font-mono">{clock}</span>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
