"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import { PILL, ROUND } from "@/components/home/smm/SmmDeck";
import SeoAccordion from "@/components/ui/SeoAccordion";
import { SMM_SEO_SECTIONS } from "@/components/home/smm/smmSeoSections";
import { pricingByCategory } from "@/lib/service-content";

// Chapter 06 of /smm — the closing chapter: three monthly packages, the SEO
// long-read, and the last call to action.
//
// A /smm-only component rather than the shared <Close>, so this page can
// carry its own style without moving /ai, /sites and /content with it. The
// tiers are the same pricingByCategory.smm data and the long-read the same
// copy the standalone SmmSeoText used to hold.
//
// This chapter is the page's one exception to the two-column skeleton
// (SmmChapterLayout), matching the decision Egor made on /sites: the closing
// chapter is a full-width summary, not an argument with an illustration
// beside it, so the heading sits centred over the whole frame and the tiers
// run in a row of three under it.
//
// The cards carry .smm-tier on top of .c3-card (see globals.css): the shared
// card has a 520px floor meant to fill a screen on its own, and here that
// floor is pure air pushing down on the heading, since the accordion and the
// closing CTA also live on this screen.
//
// The /smm/cases and /smm/pricing link-outs are deliberately NOT here. They
// were two full-width cards below the deck, on flat black with no film behind
// them; folding them into this chapter was tried first and Egor moved them on
// again — chapter 04 ends on "отчёт и корректировка", so "вот кейсы, вот
// цены" follows from what the reader has just finished rather than competing
// with the packages that are the whole point of this screen. See the row at
// the bottom of SmmProcess.
const TIERS = pricingByCategory.smm;

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

export default function SmmClose() {
  return (
    <CinematicSection
      index={5}
      chapter="06"
      title={
        <>
          Пакеты <span className="kw">ведения</span>
        </>
      }
      icon="spark"
      side="center"
      entrance="zoom"
      id="close"
      spacious
      titleClassName="chapter-neon-violet text-4xl sm:text-5xl lg:text-5xl xl:text-6xl"
    >
      {/* The supporting line is rendered here rather than through
          CinematicSection's `intro` slot, which sets its text as tiny
          uppercase display type — every other chapter on this page carries
          ordinary sentence-case copy at the body scale. */}
      <Appear from="up" delay={BEAT.intro}>
        <p className={`mx-auto mb-8 max-w-[46em] text-center ${CHAPTER_INTRO}`}>
          Точная смета — после короткого брифа. <span className="smm-accent">Бесплатно</span>:
          аудит аккаунта и разбор, что усилить в первую очередь.
        </p>
      </Appear>

      <Appear from="up" delay={BEAT.content}>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <article key={tier.name} className={`c3-card smm-tier ${tier.pro ? "c3-card-pro" : ""}`}>
              <span className="c3-tier-small relative">{tier.tagline}</span>
              <div className="c3-tier-large relative !text-xl">{tier.name}</div>
              <div className="relative mt-2 text-base font-semibold text-paper">{tier.price}</div>
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
                  className={`block w-full rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    tier.pro
                      ? "bg-rec text-white hover:bg-rec-light"
                      : "bg-paper text-ink hover:bg-white"
                  }`}
                >
                  Выбрать пакет
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Appear>

      <Appear from="up" delay={BEAT.cta}>
        <SeoAccordion eyebrow="Подробнее о SMM" sections={SMM_SEO_SECTIONS} />
      </Appear>

      <Appear from="up" delay={BEAT.cta}>
        <div className="mt-7 flex items-center justify-center gap-4">
          <Link href="/brief" className={PILL}>
            Начать вести соцсети
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

    </CinematicSection>
  );
}
