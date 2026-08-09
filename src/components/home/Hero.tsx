"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ShinyText from "@/components/ui/ShinyText";

const SHOWREEL_YOUTUBE_ID = "HC5SMCQuoms";

const menuItems = ["Съёмка", "Монтаж", "Цветокор", "Звук", "Рендер"];

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
  const [soundOn, setSoundOn] = useState(false);

  // YouTube's iframe accepts player commands over postMessage as long as the
  // embed was created with enablejsapi=1 — that avoids pulling in the whole
  // IFrame Player API script just to toggle audio.
  const toggleSound = () => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    const next = !soundOn;
    const send = (func: string, args: unknown[] = []) =>
      win.postMessage(JSON.stringify({ event: "command", func, args }), "*");

    if (next) {
      send("unMute");
      send("setVolume", [60]);
    } else {
      send("mute");
    }
    setSoundOn(next);
  };

  return (
    <section id="top" className="relative overflow-hidden pb-0 pt-16 text-paper sm:pt-20">
      {/* showreel behind the headline, full width across the top of the
          site — playing on a loop, softly blurred at rest so the type stays
          readable and snapping sharp on hover */}
      <div className="group absolute inset-0 -z-10 overflow-hidden">
        <iframe
          ref={frameRef}
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[420%] max-w-none -translate-x-1/2 -translate-y-1/2 blur-[6px] brightness-[0.85] transition-[filter] duration-500 ease-out group-hover:blur-0 group-hover:brightness-100 sm:w-[300%] md:w-[220%] lg:w-[190%]"
          src={`https://www.youtube.com/embed/${SHOWREEL_YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${SHOWREEL_YOUTUBE_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
          title="Шоурил KHUDYAKOV.AGENCY"
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

      <Container>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-rec">
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-rec" />
          REC {timecode}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 max-w-4xl font-sans text-3xl font-light uppercase leading-[0.95] tracking-[0.01em] text-paper sm:text-5xl md:text-6xl"
        >
          Диджитал, который
          <br />
          <ShinyText>думает быстрее рынка</ShinyText>
        </motion.h1>

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
          <Link
            href="/brief"
            className="btn-neon"
          >
            Заполнить бриф
          </Link>
        </motion.div>
      </Container>

      {/* neon audio toggle for the background showreel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="pointer-events-none absolute bottom-24 right-0 z-10 w-full"
      >
        <Container className="flex justify-end">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Выключить звук шоурила" : "Включить звук шоурила"}
            className={`pointer-events-auto group/sound relative inline-flex items-center gap-3 rounded-full border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur-md transition-all duration-300 active:scale-95 ${
              soundOn
                ? "border-glow/70 bg-glow/10 text-paper"
                : "border-paper/20 bg-ink/40 text-paper/80 hover:border-glow/60 hover:text-paper"
            }`}
            style={{
              boxShadow: soundOn
                ? "0 0 24px rgba(0,210,255,0.4), 0 0 60px rgba(0,210,255,0.15), inset 0 0 20px rgba(0,210,255,0.1)"
                : "0 0 16px rgba(0,210,255,0.12)",
            }}
          >
            <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-[2px] rounded-full transition-colors duration-300 ${
                    soundOn ? "bg-glow" : "bg-paper/45"
                  }`}
                  style={
                    soundOn
                      ? {
                          animation: `eq 1s ease-in-out ${i * 0.13}s infinite`,
                          boxShadow: "0 0 8px rgba(0,210,255,0.9)",
                        }
                      : { height: `${[6, 10, 7, 4][i]}px` }
                  }
                />
              ))}
            </span>
            {soundOn ? "Звук включён" : "Включить звук"}
          </button>
        </Container>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="relative mt-16 h-10 border-y border-paper/10 bg-ink/40 backdrop-blur-md sm:mt-20"
      >
        <Container className="flex h-full items-center justify-between gap-3 overflow-hidden text-xs">
          <div className="flex min-w-0 items-center gap-4 whitespace-nowrap text-paper/70">
            <span className="flex shrink-0 items-center gap-1.5 font-semibold text-paper">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
              KHUDYAKOV.AGENCY
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
