"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { SMM_BEAT, SMM_DUR, SMM_STAGGER } from "@/components/home/smm/smmMotion";
import SmmChapterLayout, { SMM_PANEL } from "@/components/home/smm/SmmChapterLayout";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";
import { servicesByCategory } from "@/lib/service-content";

// Chapter 03 of /smm — "что делаем".
//
// A /smm-only component rather than the shared <Offer>. Offer is rendered
// unchanged by /ai, /sites and /content, so moving it to this page's
// two-column layout would have moved those three pages with it. The copy and
// the service list are the same data Offer reads
// (servicesByCategory.smm) — only the composition is this page's.
//
// Rows cascade one at a time via SMM_STAGGER (smmMotion.ts) instead of the
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
      icon="layers"
      side="left"
      entrance="rise"
      id="offer"
      spacious
      column
      headless
      transitionDuration={SMM_DUR.chapter}
      bodyDecor={
        <SmmDecoIcon
          src="/images/icons/smm/reels.png"
          size={230}
          rotate={7}
          className="-right-10 -top-12 xl:-right-4"
        />
      }
    >
      <SmmChapterLayout
        number="03"
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
        primary={{ href: "/brief", label: "Обсудить формат" }}
        secondary={{ href: "/smm/pricing", label: "Смотреть цены" }}
      >
        <ul className={`${SMM_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SERVICES.map((service, i) => (
            <Appear
              key={service.title}
              as="li"
              from="right"
              delay={SMM_BEAT.content + i * SMM_STAGGER}
              duration={SMM_DUR.row}
              blur
              blurPx={10}
              className="group flex items-baseline gap-3 py-3"
            >
              <span className="font-mono text-[10px] text-paper/40">
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
      </SmmChapterLayout>
    </CinematicSection>
  );
}
