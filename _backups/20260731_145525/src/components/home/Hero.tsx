"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Container from "@/components/ui/Container";
import VideoPlayer from "@/components/ui/VideoPlayer";

const SHOWREEL_SRC =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

export default function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.96]);

  return (
    <section className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(55%_45%_at_15%_0%,rgba(124,111,239,0.16),transparent),radial-gradient(50%_40%_at_85%_10%,rgba(255,122,69,0.16),transparent)]" />

      <Container>
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-accent"
          >
            <span className="h-1.5 w-1.5 animate-pulse-rec rounded-full bg-accent" />
            Видеопродакшн полного цикла
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-bold uppercase leading-[1.05] tracking-tightest text-ink sm:text-6xl md:text-7xl"
          >
            Мы команда профессионалов в индустрии — сделаем как надо
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base text-neutral-600 sm:text-lg"
          >
            Пробиваемся через информационный шум, цепляем внимание, разжигаем
            эмоции и держим зрителя до конца — снимаем видео, которое повышает
            узнаваемость и запоминаемость бренда.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/portfolio"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white transition hover:bg-accent"
            >
              Смотреть работы
            </Link>
            <Link
              href="/brief"
              className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-medium text-ink transition hover:border-black/40"
            >
              Обсудить проект
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-16 sm:mt-20"
        >
          <motion.div ref={mediaRef} style={{ y: mediaY, scale: mediaScale }}>
            <VideoPlayer
              src={SHOWREEL_SRC}
              autoPlay
              muted
              className="aspect-video w-full"
            />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
