"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import { useState } from "react";
import { useLandscapePhone } from "@/lib/use-landscape-phone";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import SmmDeck, { PILL, ROUND } from "@/components/home/smm/SmmDeck";
import { EYEBROW } from "@/lib/typography";
import { TEAM } from "@/lib/team";
import TeamAskCard from "@/components/home/TeamAskCard";

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
// Timing: this chapter, like the other five, reads on the shared BEAT/DUR
// scale in lib/motion.ts. The slower, blur-in pace Egor asked for on this
// page is now that shared scale — every service page settles at it.
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
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const land = useLandscapePhone();
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="SMM силами продакшена"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      column
      headless
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:gap-10 xl:gap-14 land:grid land:grid-cols-[40%_1fr] land:items-start land:gap-x-6 land:gap-y-2">
        {/* Left column: the chapter's whole stack, so it centres against the
            carousel rather than against itself. */}
        <div className="contents lg:block lg:w-[46%] lg:shrink-0 land:block land:w-auto land:shrink-0">
          <div className="order-1 lg:order-none land:order-none">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className={`${EYEBROW} text-[#c4a0ff]`}>01</span>
              <span className="h-px w-8 bg-[#a855f7]/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            {/* The explicit break is what puts "продакшена" on its own line as
                the keyword; no automatic wrap does it at every step of the
                responsive type scale, and the measure is in `em` so the shape
                survives all of them.
                "продакшена" (10 letters) still didn't fit its own line at
                the width around the lg breakpoint, where the column narrows
                and the heading font jumps at the same time — `.font-display`'s
                site-wide `overflow-wrap: break-word` then force-broke the
                word itself ("ПРОДАКШ"/"ЕНА"). Scaling just this word down
                keeps it on one line there without touching "SMM силами" or
                any other heading's size. */}
            <h2 className="chapter-neon-violet mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] land:text-[2.1rem] lg:text-[3.6rem] xl:text-[4rem]">
              SMM силами
              <br />
              <span className="kw" style={{ fontSize: "0.72em" }}>
                продакшена
              </span>
            </h2>
          </Appear>

          </div>
          <div className="order-3 lg:order-none land:order-none">
          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Съёмка, монтаж и ведение соцсетей — <span className="smm-accent">одна команда</span>,
              без подрядчиков со стороны.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <TeamAskCard
              member={TEAM.egor}
              question="Расскажу, что войдёт в пакет — съёмка, монтаж и ведение одной командой"
              pitch="Съёмка, монтаж и ведение — расскажу, что войдёт в ваш пакет и сколько это займёт."
              actionLabel="Обсудить формат"
              href="/brief/smm"
              compact
              className="mt-4"
            />
          </Appear>
          </div>
        </div>

        {/* Below lg the left column is `display: contents`, so `order` puts the
            carousel straight under the title on a phone (FanFit inside SmmDeck
            scales the fan to fit).

            The carousel gets its own Appear beat (content) rather than
            arriving with the chapter's own slide-in — the copy establishes
            what this is first, then the thing itself comes into focus a beat
            later, which is the "последовательно" part of the brief. */}
        <div className="order-2 mt-6 lg:order-none lg:mt-0 lg:flex-1 land:order-none land:mt-0 land:min-w-0">
          <Appear from="right" delay={BEAT.content} blurPx={18}>
            <SmmDeck panelTarget={land ? slot : null} />
          </Appear>
        </div>

        <div ref={setSlot} className="hidden land:col-span-2 land:block" />      </div>
    </CinematicSection>
  );
}
