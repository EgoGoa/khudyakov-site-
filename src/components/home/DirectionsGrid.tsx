"use client";

import Link from "next/link";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import { useStageActive, useStageStarted } from "@/components/ui/CinematicStage";
import { TelegramIcon } from "@/components/ui/Icons";
import { contentDirections, type ContentDirection } from "@/lib/service-content";
import { works } from "@/lib/data";
import type { Work } from "@/lib/types";

const TELEGRAM_URL = "https://t.me/hdkv";

// hqdefault always exists for any YouTube video; maxresdefault looks sharper
// but isn't guaranteed — same fallback dance as Works.tsx.
const maxThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
const fallbackThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

function swapToFallback(img: HTMLImageElement, youtubeId: string) {
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = fallbackThumb(youtubeId);
}

// Picks one work per direction, greedily excluding whatever an earlier
// direction already claimed. Several works[] categories share pieces via
// `tags` (e.g. a "Рекламные" work also tagged "Имиджевые и презентации"),
// so matching each direction independently used to hand two different cards
// the exact same clip — this walks the directions in order and skips
// anything already used.
function pickWorks(directions: ContentDirection[]): (Work | undefined)[] {
  const used = new Set<string>();
  return directions.map((direction) => {
    const category = direction.worksCategory;
    if (!category) return undefined;
    const match = works.find(
      (w) =>
        w.youtubeId &&
        !used.has(w.youtubeId) &&
        (w.category === category || w.tags?.includes(category))
    );
    if (match?.youtubeId) used.add(match.youtubeId);
    return match;
  });
}

// The circle: a still thumbnail everywhere, and — only while this chapter is
// the one on stage — a live autoplaying embed. This chapter lives inside
// CinematicStage, the scroll-jank-sensitive pinned deck; mounting a YouTube
// iframe per card unconditionally would keep six of them decoding off-stage
// for nothing, so the iframe only exists at all once the visitor has
// actually scrolled to this chapter (same gate SlideVideo uses on
// ServicePicker for its one background video).
function DirectionOrb({ youtubeId, active }: { youtubeId: string; active: boolean }) {
  return (
    <>
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[230%] w-[230%] -translate-x-1/2 -translate-y-1/2"
          allow="autoplay; encrypted-media"
          title=""
          aria-hidden="true"
        />
      ) : (
        <img
          src={maxThumb(youtubeId)}
          onError={(e) => swapToFallback(e.currentTarget, youtubeId)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth <= 120) swapToFallback(e.currentTarget, youtubeId);
          }}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      )}
    </>
  );
}

// A fixed-size circle in the top-right corner, not a full-height media
// panel: stretching the circle to the card's own height made its width grow
// right along with it (width = height on a circle), which left the text
// column too narrow for the description to survive at any card height that
// still fit the chapter's one-screen budget. Fixed size decouples the two —
// the card can now grow to fit three lines of copy without the circle
// growing with it.
function DirectionCard({ direction, work, active }: { direction: ContentDirection; work?: Work; active: boolean }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-ink/45 p-5 backdrop-blur-md sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] sm:text-lg">
            {direction.title}
          </h3>
          <p className="mt-2 line-clamp-5 text-xs leading-relaxed text-paper/65 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] sm:text-sm">
            {direction.description}
          </p>
        </div>

        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-ink ring-1 ring-paper/15 sm:h-20 sm:w-20">
          {/* AI-видео has no matching works[] category (no AI-generated
              piece in the portfolio to point at), so its circle plays the
              AI direction's own background loop instead — a real, local,
              already-encoded clip rather than another YouTube embed. */}
          {work?.youtubeId ? (
            <DirectionOrb youtubeId={work.youtubeId} active={active} />
          ) : (
            <video
              src="/video/bg-ai.mp4"
              muted
              loop
              playsInline
              preload="none"
              autoPlay={active}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Link
          href="/brief"
          className="whitespace-nowrap rounded-full bg-gradient-to-r from-orange-bright to-rec px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_4px_16px_-4px_rgba(245,49,11,0.55)] transition-all hover:shadow-[0_6px_20px_-4px_rgba(245,49,11,0.75)] hover:brightness-110"
        >
          Заполнить бриф
        </Link>
        <Link
          href={`/content/${direction.slug}`}
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/55 transition-colors hover:text-glow"
        >
          Подробнее ↗
        </Link>
      </div>
    </div>
  );
}

// The reference's fifth card is a manager's photo + name — we have no named
// contact person on the site yet (see CLAUDE.md: founder bio unfilled), so
// this keeps the same slot and CTA-on-a-real-channel mechanic without
// inventing a persona: a Telegram badge stands in for the avatar.
function ConsultCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-orange/15 via-ink/55 to-ink/70 p-5 backdrop-blur-md sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] sm:text-lg">
            Не знаете, какой формат нужен?
          </h3>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] sm:text-[15px]">
            Напишите — поможем выбрать формат и ответим на вопросы.
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#26A5E4]/15 ring-1 ring-[#26A5E4]/40 sm:h-20 sm:w-20">
          <TelegramIcon className="h-7 w-7 text-[#26A5E4] sm:h-8 sm:w-8" />
        </div>
      </div>

      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-fit items-center whitespace-nowrap rounded-full bg-gradient-to-r from-orange-bright to-rec px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_4px_16px_-4px_rgba(245,49,11,0.55)] transition-all hover:shadow-[0_6px_20px_-4px_rgba(245,49,11,0.75)] hover:brightness-110"
      >
        Написать в Telegram
      </a>
    </div>
  );
}

export default function DirectionsGrid() {
  // useStageActive(0) alone is true from the very first render — chapter 0
  // is "active" by the deck's default state before the visitor has
  // scrolled anywhere near it (Hero/ServicePicker sit above it) — which
  // was mounting all six cards' autoplaying YouTube embeds immediately on
  // page load. useStageStarted() only flips once the deck has actually
  // scrolled into view.
  // Both hooks are called unconditionally and combined afterwards. Written as
  // `useStageActive(0) && useStageStarted()` this broke the Rules of Hooks:
  // `&&` short-circuits, so on every render where the first returned false the
  // second was never called at all. React identifies hooks purely by call
  // order, so a render that calls one hook followed by a render that calls two
  // makes it hand the second hook's slot to the wrong state — the class of bug
  // that surfaces later as inexplicable stale values or a crash, not as an
  // error at the call site.
  const stageActive = useStageActive(0);
  const stageStarted = useStageStarted();
  const active = stageActive && stageStarted;
  const picks = pickWorks(contentDirections);

  // The six cards cascade one after another rather than arriving as a single
  // slab — the same STAGGER the lists on every other service page read on.
  // The consult card is deliberately last in that cascade as well as last in
  // the grid: it is the ask, and it should land after the five formats it
  // offers to help choose between.
  const cards = [
    ...contentDirections.map((direction, i) => (
      <DirectionCard key={direction.slug} direction={direction} work={picks[i]} active={active} />
    )),
    <ConsultCard key="consult" />,
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        // `as="article"` so each card stays a direct child of the CSS grid:
        // a plain wrapping <div> would still be the grid cell, but article
        // is what the card actually is, and it matches how /smm's own
        // cascading card grids are built.
        <Appear
          key={card.key}
          as="article"
          from="up"
          delay={BEAT.content + i * STAGGER.normal}
          duration={DUR.row}
          className="h-full"
        >
          {card}
        </Appear>
      ))}
    </div>
  );
}
