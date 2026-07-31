"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import VideoPlayer from "@/components/ui/VideoPlayer";

const SHOWREEL_SRC =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

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

export default function Hero() {
  const timecode = useTimecode();

  return (
    <section id="top" className="relative overflow-hidden bg-ink pb-16 pt-32 text-paper sm:pb-24 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background:repeating-linear-gradient(0deg,rgba(220,221,239,0.05)_0px,rgba(220,221,239,0.05)_1px,transparent_1px,transparent_48px)]" />

      <Container>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-rec">
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-rec" />
          REC {timecode}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 max-w-4xl font-display text-5xl uppercase leading-[0.95] tracking-tight text-paper sm:text-7xl md:text-8xl"
        >
          Видеопродакшн, который не пропускают
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg"
        >
          Пробиваемся через информационный шум, цепляем внимание и держим
          зрителя до конца — снимаем видео, которое повышает узнаваемость и
          запоминаемость бренда.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="#works"
            className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light"
          >
            Смотреть работы
          </Link>
          <Link
            href="#contact"
            className="rounded-full border border-paper/25 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/60"
          >
            Обсудить проект
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 sm:mt-16"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
            Шоурил 2025
          </div>
          <VideoPlayer
            src={SHOWREEL_SRC}
            autoPlay
            muted
            className="aspect-video w-full"
          />
        </motion.div>
      </Container>
    </section>
  );
}
