"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { briefHrefFor } from "@/lib/brief";
import { pricingByCategory } from "@/lib/service-content";
import InteractiveTierCard from "@/components/home/ai/InteractiveTierCard";
import type { InteractiveTier } from "@/components/home/ai/aiPricingTiers";
import SeoAccordion, { type SeoSection } from "@/components/ui/SeoAccordion";
import TeamRow from "@/components/home/TeamRow";
import { PAGE_TEAM } from "@/lib/team";

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

export default function Close({
  index = 5,
  chapter = "06",
  title = "Персональные условия",
  intro = "Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: консультация, смета и 2–3 концепции.",
  spacious = false,
  decor,
  dense = false,
  titleClassName,
  ctaIcon,
  interactiveTiers,
  seoSections,
  seoEyebrow,
}: {
  index?: number;
  chapter?: string;
  /** Overridable per page for a gradient keyword — /ai's own call passes its
   *  own accented copy, other pages keep the defaults above. */
  title?: ReactNode;
  intro?: ReactNode;
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
  /** The page's long-read, search-facing copy, rendered as thin rows under
   *  the tier cards. /sites and /ai each used to end on a standalone SeoText
   *  section below the deck; with the deck pinned above it that section had
   *  no film behind it and landed as a flat black slab. Folded in here it
   *  inherits the chapter's own misted reveal. */
  seoSections?: SeoSection[];
  /** Label above those rows, e.g. "Подробнее о сайтах на AI". */
  seoEyebrow?: string;
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
      title={title}
      titleClassName={titleClassName}
      side="center"
      // The payoff comes up to meet the visitor instead of sliding past.
      entrance="zoom"
      intro={intro}
      spacious={spacious}
      // Close is shared across /ai, /sites, /smm too — this orange-red icon
      // is content's own, gated the same way Trust/Offer/Process gate theirs.
      decor={
        active === "content" ? (
          <ContentDecoIcon
            src="/images/icons/content/pricing.webp"
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
          <div className="grid gap-6 sm:grid-cols-3">
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
        <div className="grid gap-6 sm:grid-cols-3">
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
                } ${tier.pro ? "c3-card-pro" : ""} tier-glow-${i}`}
              >
                <span className="c3-tier-small relative">{tier.tagline}</span>
                {/* !text-xl, not the class's own 1.9rem/!text-2xl default — a
                    long single-word tier name ("Профессиональный") has
                    nowhere to break inside a ~270px card and was clipped by
                    the card's own overflow:hidden at the larger size.
                    !text-xl is also what SitesClose/SmmClose already use for
                    this same line, so this brings /content in line with the
                    rest of the site rather than sizing it uniquely. */}
                <div className={`c3-tier-large relative ${dense ? "!text-lg" : "!text-xl"}`}>{tier.name}</div>
                <div
                  className={`relative font-semibold text-paper tier-glow-price ${dense ? "text-xs" : "text-base"}`}
                >
                  {tier.price}
                </div>
                <div className={`c3-team relative ${dense ? "mb-3" : "mb-6"}`}>{tier.team}</div>

                {/* Dropped in `dense` mode: that's the setting used where the
                    chapter also has to carry the SEO rows below (see
                    seoSections), and three feature bullets per card is the
                    one block long enough to push the whole thing off a single
                    screen. Tagline, name, price, term and the button all
                    stay, so the card still says what it is. */}
                {!dense && (
                  <ul className="c3-list relative">
                    {tier.features.map((feature) => (
                      <li key={feature}>
                        <span className="c3-check text-paper" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="relative mt-auto flex flex-col items-center gap-2 self-stretch">
                  {/* Every tier's button — pro included, on every page that
                      renders through this shared component — reads as one
                      family: same .btn-neon pill, same font, same glow
                      mechanic, no separate plain "bg-paper" style. Egor's
                      ask: this used to be /content-only (`active ===
                      "content"`), so /ai's own closing chapter showed a flat
                      white pill while its own tool sub-pages (PricingBlock)
                      already used this exact neon treatment — same fix
                      unifies both. btn-neon-breathe adds the inviting "мы на
                      связи" pulse on top, scoped to pricing + closing
                      buttons rather than the site-wide default. */}
                  <a
                    href={briefHrefFor(active)}
                    className={`btn-neon btn-neon-breathe w-[70%] justify-center !font-bold tier-glow-btn-${i} ${
                      dense ? "!py-1 !text-[8px]" : "!py-1.5 !text-[10px]"
                    }`}
                  >
                    Выбрать план
                  </a>
                  {showCalculator && (
                    <Link href="/calculator" className="btn-neon btn-neon-breathe w-[70%] justify-center !py-1.5 !text-[8px]">
                      Рассчитать
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
        )}

        {/* Real people instead of a faceless "оставьте заявку" — Egor's ask.
            Hidden on short viewports rather than shrunk: this chapter is
            already tuned to fit one screen (see the file header comment),
            and a name/photo card is the one piece here safe to drop, not
            resize, when height is tight. */}
        <Appear from="up" delay={BEAT.controls}>
          <div className="mt-6 [@media(max-height:820px)]:hidden">
            <TeamRow members={PAGE_TEAM[active]} />
          </div>
        </Appear>

        <Appear from="up" delay={BEAT.cta}>
          <div className="relative flex justify-center">
            <Link
              href={briefHrefFor(active)}
              className={`chapter-neon group relative inline-block text-center font-display uppercase leading-[0.95] tracking-tight transition-opacity hover:opacity-80 ${
                active === "content"
                  ? "mt-10 text-[clamp(0.9rem,3vw,1.9rem)]"
                  : dense
                  ? "mt-6 text-[clamp(1.05rem,3.5vw,2.4rem)]"
                  : "mt-6 text-[clamp(1.5rem,5vw,3.4rem)]"
              }`}
            >
              {/* ctaIcon used to sit inline right after "сейчас" — Egor asked
                  to move it under the "Н" of "Начать" instead, so it reads as
                  a small accent under the first letter rather than trailing
                  the line. Absolute + left-0 keeps it pinned there at every
                  width since the word "Начать" always starts flush left. */}
              {ctaIcon && (
                <span className="absolute -left-2 top-full -mt-4">{ctaIcon}</span>
              )}
              Начать проект сейчас
            </Link>
          </div>
        </Appear>

        {/* The search-facing long read, last — Egor's ask: same block, same
            pinned frame as the tier cards and team row above it (this is
            the shared component's own version of what SmmClose already
            does), not a separate flat-black section further down the page.
            Hidden on short viewports for the same reason TeamRow is: the
            chapter is tuned to fit one screen, and a collapsed accordion
            nobody has scrolled to yet is the safest thing to drop first. */}
        {seoSections && seoSections.length > 0 && (
          <Appear from="up" delay={BEAT.cta + STAGGER.normal}>
            <div className="mx-auto mt-10 w-full max-w-3xl [@media(max-height:860px)]:hidden">
              <SeoAccordion eyebrow={seoEyebrow ?? "Подробнее"} sections={seoSections} />
            </div>
          </Appear>
        )}
      </>
    </CinematicSection>
  );
}
