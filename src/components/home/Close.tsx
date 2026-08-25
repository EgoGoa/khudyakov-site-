"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import AiDecoIcon from "@/components/home/ai/AiDecoIcon";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { pricingByCategory } from "@/lib/service-content";

// Chapter 06 — pricing, the closing pitch and the contact form, which used to
// be three consecutive full sections. Reading a price, deciding, and typing
// are one continuous motion for the visitor, so they are now one chapter.
//
// The footage under this chapter is the reel's neon finale, the one part that
// leaves the site's cyan range — it earns that here as the payoff frame.
//
// The inline contact form that used to live here has moved back to /brief:
// three full tier cards plus five form fields is about 800px of content, and
// this chapter has to fit one screen without scrolling. The cards are the part
// worth keeping in the frame; filling in a form deserves its own page.

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function Close({ index = 5, chapter = "06" }: { index?: number; chapter?: string }) {
  const { active } = useService();
  const tiers = pricingByCategory[active];
  // /calculator computes a video-production budget specifically — a fair
  // second action on /content's own pricing cards, but a wrong one to offer
  // alongside a different service's tiers.
  const showCalculator = active === "content";

  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title="Персональные условия"
      icon="spark"
      side="center"
      // The payoff comes up to meet the visitor instead of sliding past.
      entrance="zoom"
      intro="Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: консультация, смета и 2–3 концепции."
      // Close is shared across /ai, /sites, /smm too — this orange-red icon
      // is content's own, gated the same way Trust/Offer/Process gate theirs.
      decor={
        active === "content" ? (
          <ContentDecoIcon
            src="/images/icons/content/pricing.png"
            size={220}
            rotate={-14}
            variant={4}
            className="left-[4%] top-0"
          />
        ) : undefined
      }
    >
      <>
        {/* The original tier cards, restored: full feature list, the eyebrow
            tagline above the name, team size, and a "Выбрать план" button —
            with the recommended tier carried by the warm `rec` border and a
            filled button rather than by a badge. An earlier pass cut these
            down to one feature and no button to force the chapter into a
            single screen; now that a tall chapter scrolls internally (see
            CinematicStage) that compromise is unnecessary. */}
        <div className="grid gap-5 sm:grid-cols-3">
          {tiers.length === 0 ? (
            <p className="text-sm leading-relaxed text-paper/50">
              Тарифы по этому направлению скоро появятся здесь.
            </p>
          ) : (
            tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 28, x: i === 0 ? -40 : i === 2 ? 40 : 0, scale: i === 1 ? 0.94 : 1 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                // Outer cards slide in from their own edge, the recommended one
                // in the middle grows into place — three different arrivals so
                // the row does not land as a single slab.
                transition={{ duration: 0.8, delay: BEAT.content + i * STAGGER.normal, ease: EASE }}
                className={`c3-card !min-h-0 !rounded-3xl !p-6 ${tier.pro ? "c3-card-pro" : ""}`}
              >
                <span className="c3-tier-small relative">{tier.tagline}</span>
                <div className="c3-tier-large relative !text-2xl">{tier.name}</div>
                <div className="relative mt-2 text-base font-semibold text-paper">{tier.price}</div>
                <div className="c3-team relative mb-6">{tier.team}</div>

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

                <div className="relative mt-auto flex flex-col items-center gap-2 self-stretch">
                  <a
                    href="/brief"
                    className={`w-full rounded-full px-8 py-2.5 text-center text-sm font-semibold transition ${
                      tier.pro ? "bg-rec text-white hover:bg-rec-light" : "bg-paper text-ink hover:bg-white"
                    }`}
                  >
                    Выбрать план
                  </a>
                  {showCalculator && (
                    <Link href="/calculator" className="btn-neon w-full justify-center !py-2.5 !text-[12px]">
                      Рассчитать
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* The one card in the deck that isn't a card: a plain, huge
            statement in the same type the chapter titles already use, so it
            reads as the page raising its voice rather than one more panel
            competing with the pricing grid above it. */}
        <Appear from="up" delay={BEAT.cta}>
          <div className="relative">
            {active === "content" && (
              <ContentDecoIcon
                src="/images/icons/content/contact.png"
                size={110}
                rotate={-10}
                variant={1}
                z={10}
                className="left-[26%] top-full mt-1"
              />
            )}
            <Link
              href="/brief"
              className="chapter-neon chapter-neon-pulse mt-6 block text-center font-display uppercase leading-[0.88] tracking-tight text-[clamp(2.2rem,7.5vw,5rem)] transition-opacity hover:opacity-80"
            >
              Начать проект сейчас
            </Link>
          </div>
        </Appear>
      </>
    </CinematicSection>
  );
}
