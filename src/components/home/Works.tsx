"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { CloseIcon } from "@/components/ui/Icons";
import { works } from "@/lib/data";

const swatches = [
  "bg-rec/20",
  "bg-glow/15",
  "bg-paper/10",
  "bg-ink-soft",
  "bg-rec/10",
];

export default function Works() {
  const categories = useMemo(
    () => ["Все", ...Array.from(new Set(works.map((w) => w.category)))],
    []
  );
  const [filter, setFilter] = useState("Все");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "Все" ? works : works.filter((w) => w.category === filter)),
    [filter]
  );

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, filtered.length]);

  return (
    <section id="works" className="border-b border-paper/10 py-16 sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow index="01" label="Работы" />
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
            Портфолио
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition ${
                  filter === c
                    ? "border-paper bg-paper text-ink"
                    : "border-paper/15 text-paper/60 hover:border-paper/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((work, index) => (
            <Reveal key={work.id} delay={(index % 6) * 0.06}>
              <button
                onClick={() => setLightboxIndex(index)}
                className={`group relative aspect-video w-full overflow-hidden rounded-xl text-left ${
                  swatches[index % swatches.length]
                } ring-1 ring-paper/10 transition hover:ring-glow`}
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/60">
                    {work.category} · {work.year}
                  </div>
                  <div className="mt-1 font-display text-lg uppercase text-paper">
                    {work.title}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-10"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              aria-label="Закрыть"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-rec"
            >
              <CloseIcon />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <VideoPlayer
                key={active.id}
                src={active.videoSrc}
                autoPlay
                className="aspect-video w-full"
              />
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4 text-paper">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.15em] text-rec">
                    {active.category} · {active.year}
                  </div>
                  <h3 className="mt-2 font-display text-2xl uppercase sm:text-3xl">
                    {active.title}
                  </h3>
                  <p className="mt-1 text-sm text-paper/60">{active.client}</p>
                </div>
                <div className="font-mono text-xs text-paper/40">
                  ← / → навигация · Esc закрыть
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
