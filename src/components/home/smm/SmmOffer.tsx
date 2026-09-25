"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import { SMM_ACCENT } from "@/components/home/ai/spotlightSmm";
import SmmChapterLayout, { SMM_PANEL } from "@/components/home/smm/SmmChapterLayout";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";
import { servicesByCategory } from "@/lib/service-content";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { TANYA_SMM } from "@/components/home/team-pulse/content/tanya-smm";
import PromoCard from "@/components/home/PromoCard";

// Chapter 03 of /smm — "что делаем".
//
// A /smm-only component rather than the shared <Offer>. Offer is rendered
// unchanged by /ai, /sites and /content, so moving it to this page's
// two-column layout would have moved those three pages with it. The copy and
// the service list are the same data Offer reads
// (servicesByCategory.smm) — only the composition is this page's.
//
// Rows cascade one at a time via STAGGER.tight (lib/motion.ts) instead of the
// whole <ul> arriving as one block — each <li> is its own Appear, `as="li"`
// so it stays a direct child of the list rather than a browser hoisting a
// wrapping <div> back out from between the <ul> and its row.
const SERVICES = servicesByCategory.smm;

export default function SmmOffer() {
  return (
    <CinematicSection
      index={2}
      chapter="03"
      title="Что делаем"
      side="left"
      entrance="rise"
      id="offer"
      spacious
      column
      headless
      bodyDecor={
        <SmmDecoIcon
          src="/images/icons/smm/reels.webp"
          size={230}
          rotate={7}
          className="-right-10 -top-12 xl:-right-4"
        />
      }
    >
      <SmmChapterLayout
        number="03"
        columnClassName="lg:w-[44%]"
        title={
          <>
            Что
            <br />
            <span className="kw">делаем</span>
          </>
        }
        sub={
          <>
            <span className="smm-accent">Полный цикл</span> ведения соцсетей — от съёмки и монтажа
            до таргета и еженедельного отчёта.
          </>
        }
        primary={{ href: "/brief/smm", label: "Обсудить формат" }}
        secondary={{ href: "/smm/pricing", label: "Смотреть цены" }}
        leftFooter={<ToolSpotlight slug="smm-stories" accent={SMM_ACCENT} place="left" />}
        askCard={
          <>
            <TeamPulse data={TANYA_SMM} compact source="/smm · глава «Форматы»" />
            {/* /smm's second September offer — sits under Таня's card
                (Egor's ask, same fix as chapter 02). Photo swapped for the
                site's stock library — a hand on a phone with like/comment
                bubbles, the closest match to community management, instead
                of the generic service-smm.jpg (Egor's ask, applied
                site-wide). PRICE STILL PENDING: Egor flagged that reusing
                the page's cheapest tariff floor here is wrong — this needs
                комьюнити-менеджмент's own real monthly price, which isn't
                published anywhere in the codebase (pricingByCategory.smm's
                tiers are packages, not per-service prices). 36 000/45 000 ₽
                below is the old placeholder, kept only until Egor gives the
                real number. */}
            <div className="mt-8">
              <PromoCard
                image="/images/stock/smm-collage-phone.webp"
                badge="Акция сентября"
                title="Комьюнити-менеджмент"
                subtitle="Отвечаем в директ и комментарии от лица бренда."
                price="36 000 ₽/мес"
                oldPrice="45 000 ₽/мес"
                href="/brief/smm"
                leadPrefill={{ format: "Комьюнити-менеджмент", wishes: "Акция сентября — от 45 000 до 36 000 ₽/мес" }}
              />
            </div>
          </>
        }
      >
        {/* The glass panel (SMM_PANEL) used to render statically, popping in
            with the chapter's own quick wipe well before the rows cascading
            inside it — empty through the whole heading pause. It now arrives
            on the same beat as the first row instead. */}
        <Appear from="right" delay={BEAT.content} blurPx={12} as="div">
        <ul className={`${SMM_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SERVICES.map((service, i) => (
            <Appear
              key={service.title}
              as="li"
              from="right"
              delay={BEAT.content + i * STAGGER.tight}
              duration={DUR.row}
              blur
              blurPx={10}
              className="group flex items-baseline gap-3 py-3"
            >
              <span className="font-display text-[10px] text-paper/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-[#c4a0ff]">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-paper/55">
                  {service.description}
                </p>
              </div>
            </Appear>
          ))}
        </ul>
        </Appear>
      </SmmChapterLayout>
    </CinematicSection>
  );
}
