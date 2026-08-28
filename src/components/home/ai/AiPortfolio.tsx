"use client";

import CinematicSection from "@/components/ui/CinematicSection";

// Chapter 02 — same logic and layout as /content's own chapter 02 (see that
// page: <Works bare limit={4} filtersAside=.../>): a 2×2 grid of portfolio
// tiles plus a "full catalogue" link. Not built on <Works> itself — that
// component is driven entirely by real YouTube-hosted work entries
// (worksByCategory), and worksByCategory.ai is empty (no AI case has been
// produced yet, see servicesByCategory vs. worksByCategory in
// service-content.ts). Reusing it here would render either broken empty
// filters or nothing at all. This mirrors its tile proportions and caption
// layout with honest [TODO] placeholders instead, so swapping in real AI
// case videos later is a content change, not a rebuild — replace `TILES`
// below with real work entries (or switch back to <Works> once
// worksByCategory.ai has enough in it).

const TILES = [1, 2, 3, 4];

export default function AiPortfolio() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      title="Портфолио AI-работ"
      icon="frames"
      side="right"
      entrance="rise"
      id="portfolio"
      intro="Первые кейсы — в работе. [TODO] — сюда встанут реальные AI-проекты по мере запуска."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {TILES.map((i) => (
          <div
            key={i}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-paper/20 bg-ink-soft/60 sm:aspect-video lg:aspect-[16/7]"
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent" />

            <span className="absolute left-4 top-4 font-mono text-xs tracking-[0.08em] text-paper/40 sm:left-5 sm:top-5">
              [TODO ДАТА]
            </span>

            <div className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-2 sm:inset-x-5 sm:bottom-5">
              <span className="font-mono text-xs tracking-[0.08em] text-paper/45">[TODO ХРОНОМЕТРАЖ]</span>
              <span className="rounded-full bg-paper/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/50 ring-1 ring-inset ring-paper/15 sm:text-[10px]">
                [TODO ФОРМАТ]
              </span>
              <span className="text-sm font-medium leading-snug text-paper/70">[TODO название кейса]</span>
              <div className="mt-1 flex w-full flex-wrap items-center gap-2">
                <span className="rounded-none bg-orange px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.08em] text-white">
                  Смотреть
                </span>
                <span className="rounded-none border border-paper/20 px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.08em] text-paper/60">
                  Хочу так же
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-paper/40">
          Весь каталог AI-работ — [TODO]
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </CinematicSection>
  );
}
