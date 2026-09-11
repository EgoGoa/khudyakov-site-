"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";
import { pricingByCategory } from "@/lib/service-content";
import TeamRow from "@/components/home/TeamRow";
import { PAGE_TEAM } from "@/lib/team";

// Chapter 06 of /sites — the closing chapter: three price tiers and the last
// call to action.
//
// A /sites-only component rather than the shared <Close>, so this page can
// carry its own style without moving /ai, /smm and /content with it. The
// tiers are the same pricingByCategory.sites data.
//
// The search-facing long read that used to close this chapter now follows the
// whole deck instead — see shared/SeoLongRead for why it left.
//
// This chapter is the one exception to the page's two-column skeleton
// (SitesChapterLayout). It was built that way first and Egor sent it back:
// the closing chapter is a full-width summary, not an argument with an
// illustration beside it, so the heading belongs centred over the whole frame
// and the tiers belong in a row of three under it — which is how the shared
// component had it. What stays new is everything else he asked to keep: the
// warm heading with its gradient keyword, and the flat pill plus glass
// circle-arrow for the closing action instead of the `.btn-3d` key.
//
// The tier cards keep their feature bullets. They were dropped in an earlier
// pass to buy room for the accordion; restoring them is the "тарифы как было"
// half of the same instruction. They also carry .sites-tier on top of
// .c3-card (see globals.css): the shared card has a 520px floor meant to fill
// a screen on its own, and here that floor was pure air pushing down on the
// heading.
const TIERS = pricingByCategory.sites;

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12.5l5.5 5.5L20 6.5" />
    </svg>
  );
}

export default function SitesClose() {
  return (
    <CinematicSection
      index={5}
      chapter="06"
      title={
        <>
          Персональные <span className="kw">условия</span>
        </>
      }
      side="center"
      entrance="zoom"
      id="close"
      spacious
      titleClassName="chapter-neon-warm text-[1.575rem] sm:text-[2.1rem] lg:text-[2.1rem] xl:text-[2.625rem]"
    >
      {/* The supporting line is rendered here rather than through
          CinematicSection's `intro` slot, which sets its text as tiny
          uppercase display type. Every other chapter on this page now carries
          ordinary sentence-case copy at the body scale, and this one was the
          last place still shrinking it. */}
      <Appear from="up" delay={BEAT.intro}>
        <p className={`mx-auto mb-8 max-w-[46em] text-center ${CHAPTER_INTRO}`}>
          Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: консультация, смета и 2–3
          концепции.
        </p>
      </Appear>

      <Appear from="up" delay={BEAT.content}>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-3 [@media(max-height:820px)]:max-w-4xl">
          {/* tier-glow-{i} / tier-glow-price / .btn-neon: the same per-card
              neon treatment /content's own Close.tsx cards use, recoloured
              into /sites' own orange/magenta/cyan set (see
              .sites-warm-headings in globals.css) instead of building a
              second, page-local version of the same idea. */}
          {TIERS.map((tier, i) => (
            <article
              key={tier.name}
              className={`c3-card sites-tier tier-glow-${i} ${tier.pro ? "c3-card-pro" : ""}`}
            >
              <span className="c3-tier-small relative">{tier.tagline}</span>
              <div className="c3-tier-large relative !text-xl">{tier.name}</div>
              <div className="relative tier-glow-price">{tier.price}</div>
              <div className="c3-team relative mb-5">{tier.team}</div>

              <ul className="c3-list relative">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className="c3-check text-paper">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="relative mt-auto self-stretch pt-4">
                <Link
                  href="/brief"
                  className={
                    tier.pro
                      ? "block w-full rounded-full py-2.5 text-center text-sm font-semibold transition bg-rec text-white hover:bg-rec-light"
                      : `btn-neon w-full justify-center !font-bold !py-2.5 !text-sm tier-glow-btn-${i}`
                  }
                >
                  Выбрать план
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Appear>

      <Appear from="up" delay={BEAT.content + 0.1}>
        <div className="mt-6 [@media(max-height:820px)]:hidden">
          <TeamRow members={PAGE_TEAM.sites} />
        </div>
      </Appear>

      <Appear from="up" delay={BEAT.cta}>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/brief" className={PILL}>
            Начать проект
          </Link>
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
    </CinematicSection>
  );
}
