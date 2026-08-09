"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { CloseIcon } from "@/components/ui/Icons";
import { works } from "@/lib/data";

const thumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

export default function Works() {
  const categories = useMemo(
    () => ["Всё", ...Array.from(new Set(works.map((w) => w.category)))],
    []
  );
  const [filter, setFilter] = useState("Всё");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "Всё" ? works : works.filter((w) => w.category === filter)),
    [filter]
  );

  const active = works.find((w) => w.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  return (
    <section id="works" className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <Eyebrow index="01" label="Работы" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
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

        <Reveal delay={0.1}>
          <div className="mt-8 -mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0">
            {filtered.map((work) => (
              <button
                key={work.id}
                onClick={() => setActiveId(work.id)}
                className="group relative aspect-video w-[260px] shrink-0 snap-start overflow-hidden rounded-xl bg-ink-soft text-left ring-1 ring-paper/10 transition hover:ring-glow sm:w-[300px]"
              >
                <img
                  src={thumb(work.youtubeId)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/60">
                    {work.category}
                  </div>
                  <div className="mt-1 font-sans text-base font-medium uppercase tracking-[0.01em] text-paper">
                    {work.title}
                  </div>
                </div>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/50 text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  ▶
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </Container>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-10"
            onClick={() => setActiveId(null)}
          >
            <button
              onClick={() => setActiveId(null)}
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
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-soft">
                <iframe
                  key={active.id}
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4 text-paper">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.15em] text-rec">
                    {active.category}
                  </div>
                  <h3 className="mt-2 font-sans text-2xl font-light uppercase tracking-[0.01em] sm:text-3xl">
                    {active.title}
                  </h3>
                  <p className="mt-1 text-sm text-paper/60">{active.client}</p>
                </div>
                <div className="font-mono text-xs text-paper/40">Esc закрыть</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
