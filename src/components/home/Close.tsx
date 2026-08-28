"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { pricingByCategory } from "@/lib/service-content";
import InteractiveTierCard from "@/components/home/ai/InteractiveTierCard";
import type { InteractiveTier } from "@/components/home/ai/aiPricingTiers";

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

export default function Close({
  index = 5,
  chapter = "06",
  spacious = false,
  decor,
  dense = false,
  titleClassName,
  ctaIcon,
  interactiveTiers,
}: {
  index?: number;
  chapter?: string;
  /** See CinematicSection's own prop — /sites opts in, other pages don't. */
  spacious?: boolean;
  /** Overrides content's own decoration below for a different service's page
   *  (e.g. /ai's own glass icon) — ignored while `active === "content"`. */
  decor?: ReactNode;
  /** Shrinks the title, the tier cards' own type (name/price/team/features/
   *  button) and the closing line — everything but the chapter eyebrow/intro,
   *  which CinematicSection already keeps small — so the chapter reads as
   *  denser and leaves more open space around the content. Opt-in per page
   *  (see /ai's own call) rather than the default, since /content and /sites
   *  are tuned against the original sizes. */
  dense?: boolean;
  /** Forwarded to CinematicSection's own title sizing. */
  titleClassName?: string;
  /** Rendered right beside the closing "Начать проект сейчас" line, which is
   *  itself the link now — see that block below. Plain inline element, not
   *  CinematicSection's `decor`/`bodyDecor` slots, because those anchor to
   *  the header or the whole body rather than to this one line of text. */
  ctaIcon?: ReactNode;
  /** /ai's own richer tier data (see aiPricingTiers.ts) — checkable line
   *  items instead of a flat feature list, with the displayed price moving
   *  inside the tier's own already-published range as they're toggled. Only
   *  /ai passes this; /content, /sites, /smm keep the plain static cards
   *  built from `pricingByCategory` below. */
  interactiveTiers?: InteractiveTier[];
}) {
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
      titleClassName={titleClassName}
      icon="spark"
      side="center"
      // The payoff comes up to meet the visitor instead of sliding past.
      entrance="zoom"
      intro="Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: консультация, смета и 2–3 концепции."
      spacious={spacious}
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
        ) : (
          decor
        )
      }
    >
      <>
        {interactiveTiers ? (
          <div className="grid gap-5 sm:grid-cols-3">
            {interactiveTiers.map((tier, i) => (
              <InteractiveTierCard key={tier.name} tier={tier} index={i} spacious={spacious} />
            ))}
          </div>
        ) : (
        /* The original tier cards, restored: full feature list, the eyebrow
            tagline above the name, team size, and a "Выбрать план" button —
            with the recommended tier carried by the warm `rec` border and a
            filled button rather than by a badge. An earlier pass cut these
            down to one feature and no button to force the chapter into a
            single screen; now that a tall chapter scrolls internally (see
            CinematicStage) that compromise is unnecessary. */
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
                className={`c3-card !min-h-0 !rounded-3xl ${spacious ? "!p-5 c3-card-compact" : "!p-6"} ${
                  dense ? "c3-card-dense" : ""
                } ${tier.pro ? "c3-card-pro" : ""}`}
              >
                <span className="c3-tier-small relative">{tier.tagline}</span>
                <div className={`c3-tier-large relative ${dense ? "!text-lg" : "!text-2xl"}`}>{tier.name}</div>
                <div className={`relative mt-2 font-semibold text-paper ${dense ? "text-xs" : "text-base"}`}>
                  {tier.price}
                </div>
                <div className={`c3-team relative ${dense ? "mb-3" : "mb-6"}`}>{tier.team}</div>

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
                    className={`w-full rounded-full px-8 text-center font-semibold transition ${
                      dense ? "py-2 text-xs" : "py-2.5 text-sm"
                    } ${tier.pro ? "bg-rec text-white hover:bg-rec-light" : "bg-paper text-ink hover:bg-white"}`}
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
        )}

        {/* A closing line in the same type the chapter titles use. The line
            itself is the next step now — no separate button underneath it —
            so the cursor icon (when passed via `ctaIcon`) sits right beside
            it, and clicking anywhere on the words goes to /brief. `inline-
            flex` rather than an absolutely positioned icon: the icon has to
            stay pinned to this exact piece of text at every viewport width,
            and normal flow next to it is the only positioning that can't
            drift off it as the text reflows or resizes. */}
        <Appear from="up" delay={BEAT.cta}>
          <div className="relative flex justify-center">
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
              className={`chapter-neon group mt-6 inline-flex items-center gap-3 text-center font-display uppercase leading-[0.95] tracking-tight transition-opacity hover:opacity-80 ${
                dense ? "text-[clamp(1.05rem,3.5vw,2.4rem)]" : "text-[clamp(1.5rem,5vw,3.4rem)]"
              }`}
            >
              Начать проект сейчас
              {ctaIcon}
            </Link>
          </div>
        </Appear>
      </>
    </CinematicSection>
  );
}
