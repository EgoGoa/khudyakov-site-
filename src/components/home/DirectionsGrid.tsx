"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import { useStageActive, useStageStarted } from "@/components/ui/CinematicStage";
import { contentDirections, serviceMeta, type ContentDirection } from "@/lib/service-content";
import { works } from "@/lib/data";
import type { Work } from "@/lib/types";
import TeamAskCard from "@/components/home/TeamAskCard";
import { TEAM } from "@/lib/team";

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

// The circle: a short local clip, self-hosted (was a live YouTube embed —
// one less third-party origin, and no per-card iframe decoding off-stage).
// Same on-stage gate as before: this chapter lives inside CinematicStage,
// the scroll-jank-sensitive pinned deck, so the <video> only autoplays once
// the visitor has actually scrolled to this chapter (same gate SlideVideo
// uses on ServicePicker for its one background video); at rest it shows the
// poster frame instead of decoding anything.
function DirectionOrb({ youtubeId, active }: { youtubeId: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // The `autoPlay` attribute only fires the moment a <video> starts loading
  // — flipping it true after the element already exists (which is exactly
  // what happens here as `active` turns on once this chapter is scrolled
  // into view) does not retroactively start playback in any browser. This
  // element never unmounts (see the file header note on why), so play/pause
  // has to be driven imperatively off `active` instead.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <video
      ref={videoRef}
      src={`/video/directions/${youtubeId}.mp4`}
      poster={`/images/directions/${youtubeId}.jpg`}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

// A fixed-size circle in the top-right corner, not a full-height media
// panel: stretching the circle to the card's own height made its width grow
// right along with it (width = height on a circle), which left the text
// column too narrow for the description to survive at any card height that
// still fit the chapter's one-screen budget. Fixed size decouples the two —
// the card can now grow to fit three lines of copy without the circle
// growing with it.
// The whole card is the link to `/content/[slug]` now — Egor's ask: hover
// anywhere on a direction card and it should glow and lift, click anywhere
// on it (except "Заполнить бриф", its own separate offer) and it opens that
// direction's page. A <Link> can't wrap "Заполнить бриф" (its own <Link>)
// without nesting one <a> inside another, so this uses the standard
// link-behind-content card: a full-cover Link at the back (z-0) catches
// every click, the visible content sits above it with pointer-events
// disabled so clicks fall through to that Link, and "Заполнить бриф" opts
// back into pointer-events on its own to stay independently clickable. Cyan
// glow (`--card-glow-rgb`, see .deck-card-glow in globals.css) matches the
// hover colour "Подробнее ↗" already used on this exact link before this
// change folded it into the whole card.
function DirectionCard({ direction, work, active }: { direction: ContentDirection; work?: Work; active: boolean }) {
  return (
    <div
      className="deck-card-glow relative flex h-full min-h-[260px] flex-col justify-between rounded-2xl border border-transparent bg-ink/45 p-5 backdrop-blur-md sm:p-8"
      style={{ "--card-glow-rgb": "0, 210, 255" } as React.CSSProperties}
    >
      <Link
        href={`/content/${direction.slug}`}
        aria-label={`Подробнее: ${direction.title}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="direction-card-title font-display text-base uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] transition-[color] sm:text-lg">
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
              // Without a poster and with preload="none", the browser has
              // nothing to paint until the visitor scrolls this chapter into
              // view and `active` flips true — a real black circle, not a
              // still frame, for however long the fetch then takes. The same
              // still image /ai's own hero already uses as this reel's
              // poster elsewhere (serviceMeta.ai.image) covers that gap, and
              // preload="metadata" lets the browser paint a real decoded
              // frame the moment it can, without downloading the whole clip
              // up front like "auto" would.
              poster={serviceMeta.ai.image}
              muted
              loop
              playsInline
              preload="metadata"
              autoPlay={active}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-3 flex items-center gap-3">
        <span className="btn-neon pointer-events-none !px-4 !py-2 !text-[10px]">
          Узнать больше
        </span>
        <Link
          href={`/content/${direction.slug}`}
          aria-label={`Подробнее: ${direction.title}`}
          className="btn-neon pointer-events-auto grid h-9 w-9 shrink-0 !p-0 place-items-center text-paper/85 transition-colors duration-300 hover:text-orange"
          style={{ "--btn-neon-delay": "1.8s" } as React.CSSProperties}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// A real person instead of a Telegram badge — Egor's ask once every other
// "есть вопрос" card on the site got a face: this is the same slot and the
// same job (help picking a format), now answered by name. Egor himself
// rather than a specialist — "не знаете формат" is exactly the
// admin/producer question he described handling on every page.
function ConsultCard() {
  return (
    <TeamAskCard
      member={TEAM.egor}
      question="Подскажу, какой формат нужен!"
      pitch="Помогу понять задачу и проработать концепцию — в формате видеосессии или аудиоконференции."
      actionLabel="Узнать больше"
      className="h-full"
      backgroundImage="/images/blocks/stock-brainstorm.jpg"
    />
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
          // The consult card (last, i === contentDirections.length) is
          // deliberately the tall one — Egor's ask: its own row shouldn't
          // stretch the plain direction cards next to it up to match. Grid
          // rows still size to the tallest cell either way, so without
          // `self-start` the shorter cards were being pulled down to fill
          // that leftover height instead of staying their own natural size.
          className={i === contentDirections.length ? "h-full" : "self-start"}
        >
          {card}
        </Appear>
      ))}
    </div>
  );
}
