"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import SmmDeck, { PILL, ROUND } from "@/components/home/smm/SmmDeck";

// Chapter 01 of /smm — the opening pitch, one level in from the site's own
// universal Hero (see (landing)/layout.tsx, and the same reasoning in
// AiPitch/SitesPitch for why the shared Hero can't be swapped per service).
// No follower or reach numbers: content/site-copy.md is explicit that until
// real cases exist, no figures get invented here.
//
// Composition is built around the footage rather than over it. This chapter's
// phase is 0 → 3.60 of smm-reel.mp4 (see the PHASES table in
// (landing)/smm/page.tsx): a night terrace, both figures right of centre
// against dark sky, so the copy stays in a left column and nothing sits in
// the lower-right quadrant.
//
// The chapter runs `headless` — it renders its own number, heading and copy
// rather than taking CinematicSection's header, which is a separate flex
// child pinned above the body and would split this chapter in two with no way
// to line the copy up against the carousel beside it. SitesPitch works
// through that in full; the same reasoning applies here unchanged.
//
// The tag pills and the glass FunnelCta bar that used to sit in this column
// are gone: the chapter now carries the format carousel instead, and both
// facts still have their own home further down the page (the cadence numbers
// on the carousel's own cards, the CTA in every chapter's action row).
//
// This chapter carries NO decorative glass icon, unlike the other five. The
// rocket was tried twice — pinned to the primary button (the way /sites pins
// its cursor there) and then moved to the frame's lower-left — and Egor cut
// it both times: /sites' cursor is *about* the button, it reads as clicking
// it, while a rocket next to "обсудить формат" is only an object in the way.
// The opening frame is already carrying a heading, a support line, two
// actions and a five-card carousel; a sticker on top of that is one element
// too many.

export default function SmmPitch() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="SMM силами продакшена"
      icon="aperture"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      column
      headless
    >
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14">
        {/* Left column: the chapter's whole stack, so it centres against the
            carousel rather than against itself. */}
        <div className="w-full shrink-0 lg:w-[46%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4a0ff]">01</span>
              <span className="h-px w-8 bg-[#a855f7]/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            {/* The explicit break is what puts "продакшена" on its own line as
                the keyword; no automatic wrap does it at every step of the
                responsive type scale, and the measure is in `em` so the shape
                survives all of them. */}
            <h2 className="chapter-neon-violet mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
              SMM силами
              <br />
              <span className="kw">продакшена</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Съёмка, монтаж и ведение соцсетей — <span className="smm-accent">одна команда</span>,
              без подрядчиков со стороны.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex items-center gap-4">
              <Link href="/brief" className={PILL}>
                Обсудить формат
              </Link>
              <Link href="/smm/pricing" aria-label="Смотреть цены" className={ROUND}>
                <svg
                  width="16"
                  height="16"
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
          </Appear>
        </div>

        {/* Hidden below lg: the fan needs the column's own width beside it to
            make sense, and there isn't a second column on a phone. The chapter
            still reads as heading + copy + CTA alone there. */}
        <div className="mt-10 hidden lg:mt-0 lg:block lg:flex-1">
          <SmmDeck />
        </div>
      </div>
    </CinematicSection>
  );
}
