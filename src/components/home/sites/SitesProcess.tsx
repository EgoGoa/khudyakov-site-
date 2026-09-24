"use client";

import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import { SITES_ACCENT } from "@/components/home/ai/spotlightSites";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesChapterLayout, { SITES_PANEL } from "@/components/home/sites/SitesChapterLayout";
import { SITES_PROCESS_STEPS } from "@/components/home/sites/sitesProcessSteps";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { EGOR_SITES } from "@/components/home/team-pulse/content/egor-sites";
import PromoCard from "@/components/home/PromoCard";

// Chapter 04 of /sites — the five steps from brief to launch.
//
// A /sites-only component rather than the shared <Process>, for the same
// reason SitesOffer exists: Process is rendered unchanged by /ai, /smm and
// /content. The steps themselves are the same SITES_PROCESS_STEPS data the
// shared component was being handed; only the composition is this page's.
//
// The steps are numbered here rather than only iconed. In the shared
// component they sit in a row where position carries the order; stacked in a
// narrow right-hand column that cue disappears, and a process is the one kind
// of list where the order is the information.

export default function SitesProcess() {
  return (
    <CinematicSection
      index={3}
      chapter="04"
      title="Как проходит работа"
      side="right"
      entrance="slide-right"
      id="process"
      spacious
      column
      headless
    >
      <SitesChapterLayout
        number="04"
        columnClassName="lg:w-[44%]"
        rightFooter={<ToolSpotlight slug="site-redesign" accent={SITES_ACCENT} shape="card" />}
        title={
          <>
            Как
            <br />
            {/* "проходит" alone still didn't fit the column at the exact
                viewport width where the lg breakpoint's bigger heading
                font meets its narrower lg column (~1024–1279px) — the box
                itself, not the heading's own max-width, was the real
                constraint there, so widening max-width alone (tried first)
                did nothing. Scaling just this one word down 15% is what
                actually keeps it on one line at that width without
                touching "Как"/"работа" or any other heading on the site. */}
            <span style={{ fontSize: "0.85em" }}>проходит</span>
            <br />
            <span className="kw">работа</span>
          </>
        }
        sub="Пять шагов от брифа до запуска — на каждом понятный результат и точка согласования."
        primary={{ href: "/brief/sites", label: "Заполнить бриф" }}
        secondary={{ href: "/calculator", label: "Рассчитать бюджет" }}
        askCard={
          <>
            {/* Егор как сервис — окно линейного продюсера (TeamPulse) на
                месте прежней компактной карточки; тексты согласованы Егором. */}
            <TeamPulse data={EGOR_SITES} />
            {/* /sites' second September offer — sits under Егор's card
                (Egor's ask, same fix as /smm's chapter 02). Gap bumped to
                mt-8 and the photo swapped for the site's own stock library
                — an overhead desk shot with a "Contact us" page open on
                screen, closer to "сайт-визитка" than the generic
                service-sites.jpg (Egor's ask, applied site-wide). Priced
                off this service's OWN tier in pricingByCategory.sites
                ("Сайт-визитка", от 120 000 ₽ — not the cheaper "Лендинг"
                tier chapter 02's offer uses) with a flat 20% off:
                120 000 → 96 000 ₽. Egor's correction: every offer discounts
                its own service's real price, never the page's cheapest
                unrelated tariff. */}
            <div className="mt-8">
              <PromoCard
                image="/images/stock/desk-aerial.webp"
                badge="Акция сентября"
                title="Сайт-визитка"
                subtitle="Несколько страниц: о компании, услуги, контакты — без раздутого бюджета."
                price="96 000 ₽"
                oldPrice="120 000 ₽"
                href="/brief/sites"
                leadPrefill={{ format: "Сайт-визитка", wishes: "Акция сентября — от 120 000 до 96 000 ₽" }}
              />
            </div>
          </>
        }
      >
        {/* Same fix as SitesOffer's list: the glass panel itself now arrives
            on the same beat as the first row instead of popping in early. */}
        <Appear from="right" delay={BEAT.content} as="div">
        <ol className={`${SITES_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SITES_PROCESS_STEPS.map((step, i) => (
            <Appear
              key={step.title}
              as="li"
              from="right"
              delay={BEAT.content + i * STAGGER.tight}
              className="flex items-start gap-4 py-3.5"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-display text-[10px]"
                style={{
                  borderColor: "rgba(255,106,61,0.35)",
                  color: "#ffd0bd",
                  boxShadow: "inset 0 0 10px rgba(255,106,61,0.18)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-paper/55">{step.description}</p>
              </div>
            </Appear>
          ))}
        </ol>
        </Appear>
      </SitesChapterLayout>
    </CinematicSection>
  );
}
