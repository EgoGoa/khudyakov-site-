"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesChapterLayout, { SITES_PANEL } from "@/components/home/sites/SitesChapterLayout";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import { servicesByCategory } from "@/lib/service-content";

// Chapter 03 of /sites — "what we actually build".
//
// A /sites-only component rather than the shared <Offer>. Offer is rendered
// unchanged by /ai, /smm and /content, so moving it to this page's two-column
// layout would have moved those three pages with it. The copy and the service
// list are the same data Offer reads (servicesByCategory.sites); only the
// composition is this page's.
const SERVICES = servicesByCategory.sites;

export default function SitesOffer() {
  return (
    <CinematicSection
      index={2}
      chapter="03"
      title="Что мы делаем"
      icon="layers"
      side="left"
      entrance="rise"
      id="offer"
      spacious
      column
      headless
      bodyDecor={
        <SitesDecoIcon
          src="/images/icons/sites/code.png"
          size={210}
          rotate={8}
          className="-right-4 bottom-0 opacity-70 lg:right-2"
        />
      }
    >
      <SitesChapterLayout
        number="03"
        title={
          <>
            Что мы
            <br />
            <span className="kw">делаем</span>
          </>
        }
        sub="От одностраничного лендинга до сайта под ключ с интеграциями — вёрстка на React/HTML, без привязки к конструктору."
        primary={{ href: "/brief", label: "Обсудить проект" }}
        secondary={{ href: "/calculator", label: "Рассчитать бюджет" }}
      >
        {/* The glass panel (SITES_PANEL) used to render statically and pop in
            with the chapter's own quick wipe, empty, well before the rows
            cascading inside it — now it arrives on the same beat as the
            first row instead of sitting there alone through the pause. */}
        <Appear from="right" delay={BEAT.content} as="div">
        <ul className={`${SITES_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SERVICES.map((service, i) => (
            <Appear
              key={service.title}
              as="li"
              from="right"
              delay={BEAT.content + i * STAGGER.tight}
              className="group flex items-baseline gap-3 py-3"
            >
              <span className="font-mono text-[10px] text-paper/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-glow">
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
      </SitesChapterLayout>
    </CinematicSection>
  );
}
