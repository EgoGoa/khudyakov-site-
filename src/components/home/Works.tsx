"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { CloseIcon } from "@/components/ui/Icons";
import { useService } from "@/lib/service-context";
import { worksByCategory } from "@/lib/service-content";

// hqdefault always exists for any YouTube video; maxresdefault looks much
// sharper but isn't guaranteed, so the <img> below falls back to hqdefault
// on load error rather than risk a broken thumbnail in the mosaic.
const maxThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
const fallbackThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

// Repeating span pattern that produces the collage/mosaic rhythm — a couple
// of big feature tiles among standard ones. Only col+row spans that scale
// TOGETHER (1x1, 2x2) are used — a lone col-span-2 with row-span-1 (or vice
// versa) stretches the thumbnail into a wide banner far from 16:9, which
// reads as broken video framing, so that combination is intentionally never
// produced here. Written as literal Tailwind class strings (not
// interpolated) so the JIT scanner picks them up regardless of how the
// array is indexed at runtime.
const SIZE_PATTERN = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

function sizeFor(index: number) {
  return SIZE_PATTERN[index % SIZE_PATTERN.length];
}

// collapsed height keeps the section compact (roughly two rows) — visitors
// expand it on purpose instead of the whole page being pushed down by a
// 17-tile mosaic on first load.
const COLLAPSED_HEIGHT = 520;

export default function Works() {
  const { active: activeService } = useService();
  const works = worksByCategory[activeService];
  const categories = useMemo(
    () => ["Всё", ...Array.from(new Set(works.map((w) => w.category)))],
    [works]
  );
  const [filter, setFilter] = useState("Всё");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilter("Всё");
  }, [activeService]);

  const filtered = useMemo(
    () => (filter === "Всё" ? works : works.filter((w) => w.category === filter)),
    [filter, works]
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

  // re-measure whenever the tile set changes (filter switch, image loads
  // reflowing row heights, viewport resize) so the expanded height and the
  // "does this even need a toggle" check both stay accurate.
  useLayoutEffect(() => {
    setExpanded(false);
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [filtered]);

  const needsToggle = (fullHeight ?? 0) > COLLAPSED_HEIGHT + 40;

  return (
    <section id="works" className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <Eyebrow index="01" label="Работы" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            Портфолио
          </h2>
        </Reveal>

        {works.length === 0 ? (
          <Reveal delay={0.05}>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-paper/50">
              Портфолио по этому направлению скоро появится здесь.
            </p>
          </Reveal>
        ) : (
        <>
        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`relative rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
                  filter === c
                    ? "border-glow bg-glow/15 text-paper shadow-[0_0_16px_rgba(0,210,255,0.35),0_0_40px_rgba(0,210,255,0.12)]"
                    : "border-paper/15 text-paper/60 hover:border-glow/50 hover:text-paper hover:shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div
          className="relative mt-8 overflow-hidden transition-[max-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            maxHeight: expanded ? (fullHeight ?? 4000) : Math.min(COLLAPSED_HEIGHT, fullHeight ?? COLLAPSED_HEIGHT),
          }}
        >
          <div
            ref={gridRef}
            className="grid auto-rows-[140px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[175px] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[222px] lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((work, index) => (
                <motion.button
                  key={work.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(index * 0.045, 0.4),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.015 }}
                  onClick={() => setActiveId(work.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-xl bg-ink-soft text-left transition-shadow duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_40px_-8px_rgba(0,210,255,0.3)] ${sizeFor(
                    index
                  )}`}
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    <img
                      src={work.youtubeId ? maxThumb(work.youtubeId) : ""}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallback || !work.youtubeId) return;
                        img.dataset.fallback = "1";
                        img.src = fallbackThumb(work.youtubeId);
                      }}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-ink/10 transition-colors duration-300 group-hover:bg-ink/25" />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-ink/60 text-paper shadow-[0_0_24px_rgba(0,210,255,0.5)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-100 sm:h-14 sm:w-14">
                        ▶
                      </span>
                    </span>
                  </div>

                  <div className="shrink-0 bg-paper/[0.04] px-3 py-2.5 backdrop-blur-xl backdrop-saturate-150 sm:px-4 sm:py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[9px] uppercase tracking-[0.15em] text-paper/45 transition-colors duration-300 group-hover:text-glow sm:text-[10px]">
                          {work.category}
                        </div>
                        <div className="mt-0.5 truncate font-sans text-xs font-medium uppercase tracking-[0.01em] text-paper transition-[text-shadow] duration-300 sm:text-sm group-hover:[text-shadow:0_0_14px_rgba(0,210,255,0.55)]">
                          {work.title}
                        </div>
                      </div>
                      <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40 transition-colors duration-300 group-hover:text-glow sm:inline">
                        смотреть ↗
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {!expanded && needsToggle && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
          )}
        </div>

        {needsToggle && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-paper/70 transition-all duration-300 hover:border-glow/60 hover:text-glow hover:shadow-[0_0_16px_rgba(0,210,255,0.2)]"
            >
              {expanded ? "Свернуть" : "Показать все работы"}
              <span
                className={`inline-block transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              >
                ↓
              </span>
            </button>
          </div>
        )}
        </>
        )}
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
