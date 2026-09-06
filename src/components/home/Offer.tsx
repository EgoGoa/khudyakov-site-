"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import CinematicSection from "@/components/ui/CinematicSection";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { servicesByCategory } from "@/lib/service-content";
import { EYEBROW } from "@/lib/typography";

// Chapter 04 — the services list plus the AI-assistant teaser and the
// calculator pitch that used to each get their own vertical slot. The list
// runs as one column stretching down the left, the way a menu reads, and the
// calculator sits as a vertical card on the right rather than another
// horizontal row underneath — the two-column split is what keeps ten
// services from pushing the calculator off the bottom of the screen.

export default function Offer({
  index = 3,
  chapter = "04",
  title = "Лучшие в этом",
  intro = "Съёмка, монтаж, графика и AI-продакшн — под формат и площадку.",
  spacious = false,
  decor,
  bodyDecor,
}: {
  index?: number;
  chapter?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** See CinematicSection's own prop — /sites opts in, other pages don't. */
  spacious?: boolean;
  /** Overrides content's own decoration below for a different service's page
   *  (e.g. /sites' own glass icon) — ignored while `active === "content"`.
   *  Must be passed through this slot rather than as a sibling element: a
   *  sibling next to a staged CinematicSection isn't gated by the deck's own
   *  active-chapter logic and renders unconditionally on every chapter. */
  decor?: ReactNode;
  /** Decoration for the body area rather than the header. `decor` renders
   *  inside <header>, which is only as tall as the title — an icon anchored
   *  to its bottom edge therefore sits at the *top* of the screen and gets
   *  clipped by the site header. Anything sized to the chapter belongs here. */
  bodyDecor?: ReactNode;
}) {
  const { active } = useService();
  const services = servicesByCategory[active];
  // /calculator computes a video-production budget specifically (type,
  // runtime, add-ons) — a fair pitch on /content's own chapter, but a wrong
  // one on /ai, /sites or /smm, which don't share that pricing model. Same
  // gating Close.tsx already applies to its own "Рассчитать" button below.
  const showCalculator = active === "content";

  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title={title}
      side="left"
      // New subject after the trust argument — it tips up into place.
      entrance="unfold"
      intro={intro}
      spacious={spacious}
      // Offer is shared across /ai, /sites, /smm too (each passes its own
      // title/intro) — this orange-red icon is content's own, so it's
      // gated the same way Trust.tsx gates its own decoration.
      decor={
        active === "content" ? (
          <ContentDecoIcon
            src="/images/icons/content/services.png"
            size={260}
            rotate={-8}
            variant={2}
            className="right-[7%] top-0"
          />
        ) : (
          decor
        )
      }
      bodyDecor={bodyDecor}
    >
      <div className="relative z-10 lg:flex lg:items-start lg:gap-16">
        {services.length === 0 ? (
          <p className="text-sm leading-relaxed text-paper/60">
            Список услуг по этому направлению скоро появится здесь.
          </p>
        ) : (
          <ul className="lg:flex-1">
            {services.map((service, i) => (
              <Appear
                key={service.title}
                as="li"
                from="up"
                delay={BEAT.content + i * STAGGER.tight}
                // The row's own air is the only thing tall enough to give
                // this chapter back a screen it fits on: ten rows at py-4
                // come to 600px, and on a 1280x800 laptop that pushed the
                // last row ("10 AI-контент и автоматизация") below the fold,
                // where the deck's desktop stepping makes it unreachable.
                // Tightened by height, not by width — the constraint is how
                // tall the screen is, not how wide.
                className="group flex items-baseline gap-3 border-t border-paper/20 py-4 [@media(max-height:860px)]:py-2.5"
              >
                <span className="font-mono text-[10px] text-paper/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-glow sm:text-lg [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                  {service.title}
                </span>
              </Appear>
            ))}
          </ul>
        )}

        {/* Vertical card, not another row: the teaser and the calculator
            pitch stacked, sitting beside the list rather than under it. */}
        <Appear
          from="right"
          delay={BEAT.content + STAGGER.normal}
          className="mt-10 rounded-2xl bg-ink/45 p-6 backdrop-blur-md lg:mt-0 lg:w-[300px] lg:shrink-0 xl:w-[320px]"
        >
          <div id="ai" className="flex items-start gap-3 border-l-2 border-glow/60 pl-4">
            <div>
              {active === "ai" ? (
                // The site's own "AI-agent coming soon" teaser reads oddly
                // advertised on the AI-services page itself — a client
                // coming here for AI work doesn't need the site's own
                // AI feature pitched at them mid-page. Same low-friction
                // offer (skip the form, get a fast answer), no self-promo.
                <p className="text-sm leading-relaxed text-paper/75">
                  Опишите задачу в двух словах — продюсер вернётся с форматом и бюджетом в течение дня.
                </p>
              ) : (
                <>
                  <div className={`${EYEBROW} text-glow`}>Скоро</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-paper/75">
                    AI-агент прикинет формат и бюджет прямо в чате — до брифа и без ожидания менеджера.
                  </p>
                </>
              )}
            </div>
          </div>

          {showCalculator && (
            <div className="mt-6 border-t border-paper/15 pt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-orange">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                Не знаете формат?
              </span>
              <p className="mt-3 font-sans text-xl leading-[1.15] text-paper">
                Калькулятор подберёт формат <span className="font-semibold text-orange">за 2 минуты</span>
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-paper/60">
                По площадке и бюджету — сразу покажет вилку цен.
              </p>
              <Link
                href="/calculator"
                className="btn-neon btn-warm btn-3d mt-4 w-full justify-center !py-3.5"
              >
                Рассчитать бюджет
              </Link>
            </div>
          )}
        </Appear>
      </div>
    </CinematicSection>
  );
}
