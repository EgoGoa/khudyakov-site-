"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import SitesDeck, { PILL, ROUND } from "@/components/home/sites/SitesDeck";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";

// Chapter 01 of /sites — the opening pitch, one level in from the site's own
// universal Hero (see (landing)/layout.tsx, and the same reasoning in
// AiPitch.tsx for why the shared Hero can't be swapped per service). No
// "N сайтов запущено" stat row: the brief in content/site-copy.md is
// explicit that until real cases exist, no numbers get invented here.
//
// Composition is built around the footage rather than over it. A scene-detect
// pass on the first 3.0s of sites-reel.mp4 (this chapter's phase — see the
// PHASES table in (landing)/sites/page.tsx) puts the car and both faces right
// of centre, so the copy stays in a left column and nothing sits in the
// lower-right quadrant.
//
// The chapter runs `headless`: it renders its own number, heading and copy
// rather than taking CinematicSection's header. That header is a separate
// flex child pinned above the body, which split this chapter in two — the
// title at the top of the frame and the rest of the copy floating ~90px below
// it — and left no way to line the copy up against the carousel beside it:
// centring the body only centred the half of the block that was in it,
// pulling the two halves further apart. Owning the whole stack is what lets
// both columns sit on one shared vertical centre, which is the composition
// Egor approved.
//
// Everything else matches that approved sketch element for element:
//
//   * the title is set in its near-white #eaf6ff under one wide, soft cyan
//     halo rather than the site-wide `.chapter-neon` triple-glow;
//   * it carries an explicit line break plus a `max-w-[6.7em]` measure, which
//     together give the sketch's four lines — "САЙТЫ НА / AI — / ДНИ, НЕ /
//     МЕСЯЦЫ". The break is explicit because no automatic wrap puts "AI —"
//     alone on its own line, and the measure is in `em` rather than px so the
//     shape survives every step of the responsive type scale;
//   * the supporting line is ordinary sentence-case body copy, not the tiny
//     uppercase display type CinematicSection's `intro` slot sets;
//   * the actions are the flat gradient pill plus a glass circle-arrow (PILL
//     and ROUND, shared with SitesDeck so the chapter has one button
//     language), not the `.btn-3d` pressed-key treatment that fought the flat
//     glass everything else here is made of.
//
// The guarantee pills and the glass FunnelCta bar that used to sit in this
// column are gone with the same change — the sketch has neither, and both
// facts still have their own home further down the page (chapter 05,
// "Условия и гарантии").

export default function SitesPitch() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="Сайты на AI — дни, не месяцы"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      column
      headless
    >
      <div className="lg:flex lg:items-center lg:gap-10 xl:gap-14">
        {/* Left column: the chapter's whole stack, so it centres against the
            carousel rather than against itself. */}
        <div className="w-full shrink-0 lg:w-[46%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">01</span>
              <span className="h-px w-8 bg-glow/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-warm mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
              Сайты на <span className="kw">AI</span> —<br />
              дни, не месяцы
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Уникальный дизайн и вёрстка вместо шаблонов. Собираем AI-инструментами под контролем
              команды.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex items-center gap-4">
              {/* The cursor is anchored to the primary button rather than to
                  the heading it sat on before: its whole point is the click
                  animation (see .sites-deco-icon-click), and a cursor caught
                  mid-click reads as pointing at the thing you actually press.
                  `relative` on this wrapper is what the icon's own `absolute`
                  positions against, so it stays on the button's corner at any
                  width instead of drifting as the copy reflows. */}
              <span className="relative inline-flex">
                <Link href="/brief" className={PILL}>
                  Обсудить проект
                </Link>
                <SitesDecoIcon
                  src="/images/icons/sites/cursor.png"
                  size={72}
                  rotate={-14}
                  click
                  className="-bottom-9 right-1"
                />
              </span>
              <Link href="/calculator" aria-label="Рассчитать бюджет" className={ROUND}>
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
            make sense, and there isn't a second column on a phone. A future
            pass can give it a compact swipeable variant there — for now the
            chapter still reads as heading + copy + CTA alone. */}
        <Appear from="right" delay={BEAT.content} className="mt-10 hidden lg:mt-0 lg:block lg:flex-1">
          <SitesDeck />
        </Appear>
      </div>
    </CinematicSection>
  );
}
