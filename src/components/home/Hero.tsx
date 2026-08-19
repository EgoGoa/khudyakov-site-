"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";

const SHOWREEL_YOUTUBE_ID = "HC5SMCQuoms";

const menuItems = ["Съёмка", "Монтаж", "Цветокор", "Звук", "Рендер"];

// Same roster as LogoCloud — kept here too so the hero carries its own trust
// signal without waiting for a visitor to scroll to the dedicated section.
const clients = ["KIA", "Федерация баскетбола", "Гольф-клуб", "Ani d. Zop", "COTRIL", "OUTDOOR", "GOOD GAME"];

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
        <iframe
          ref={frameRef}
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[420%] max-w-none -translate-x-1/2 -translate-y-1/2 blur-[6px] brightness-[0.85] transition-[filter] duration-500 ease-out group-hover:blur-0 group-hover:brightness-100 sm:w-[300%] md:w-[220%] lg:w-[190%]"
          src={`https://www.youtube.com/embed/${SHOWREEL_YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${SHOWREEL_YOUTUBE_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
          title="Шоурил HDKV.AGENCY"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
        />
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.55) 0%, rgba(11,11,16,0.35) 28%, rgba(11,11,16,0.88) 72%, #0B0B10 100%)",
          }}
        />
      </div>

      <Container className="flex flex-1 flex-col justify-center">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-rec">
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-rec" />
          REC {timecode}
        </div>

        <div
          ref={titleWrapRef}
          onMouseMove={handleTitleMouseMove}
          className="hero-title-wrap relative mt-6"
        >
          <div className="hero-title-glow" aria-hidden="true" />
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative max-w-4xl font-sans text-3xl font-extrabold uppercase leading-[0.95] tracking-[0.06em] sm:text-5xl md:text-6xl"
          >
            <span className="hero-neon-word">DIGITAL AI</span>
            <span className="hero-gradient-text">
              , который
              <br />
              быстрее рынка
            </span>
          </motion.h1>
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
          <Link
            href="#works"
            className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light"
          >
            Смотреть работы
          </Link>
          <a href="tel:+79925111812" className="btn-neon">
            <PhoneIcon className="animate-pulse" />
            Заказать звонок
          </a>
          <a href="https://t.me/+79925111812" target="_blank" rel="noopener noreferrer" className="btn-neon">
            <TelegramIcon />
            Написать в Telegram
          </a>
          <a href="https://wa.me/79925111812" target="_blank" rel="noopener noreferrer" className="btn-neon">
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

      {/* Partner logos drift by on their own, slowly enough to read, never
          stopping — a strip rather than a static row, the way the reference
          hero carried its client marks along the very bottom edge. Doubled
          and rolled by exactly half its width so the loop has no seam. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="relative shrink-0 overflow-hidden border-b border-paper/10 bg-ink/40 py-4 backdrop-blur-md"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-28"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-28"
          aria-hidden="true"
        />
        <div className="reel flex">
          <div className="reel-track flex w-max shrink-0 items-center gap-12 sm:gap-16">
            {[...clients, ...clients].map((name, i) => (
              <span
                key={i}
                className="shrink-0 font-display text-lg uppercase tracking-tight text-paper/40 sm:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
