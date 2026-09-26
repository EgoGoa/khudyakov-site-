"use client";

import Link from "next/link";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import { SITES_ACCENT } from "@/components/home/ai/spotlightSites";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { SASHA_SITES } from "@/components/home/team-pulse/content/sasha-sites";
import PromoCard from "@/components/home/PromoCard";

// Chapter 02 — merges the former SitesMethod and SitesAudience chapters into
// one screen. sites-reel.mp4 (Egor's second delivery for /sites) only cuts
// cleanly into 6 real scenes, not the 7 the page used to have — see the
// scene-detect + frame-by-frame check done when wiring CinematicStage below.
// Splitting a chapter mid-continuous-footage would put a blur hold where the
// film never actually cuts, which reads as a glitch rather than a beat, so
// the two chapters share the reel's one "arriving after the drive" phase
// instead. The comparison table carries the differentiation argument
// (unique to this chapter); the three "how it works" steps that used to sit
// above it are dropped since Process's own chapter covers that ground in
// more detail later on the same page. "Кому подходит" survives as a compact
// chip row rather than full cards, so the merged screen still fits one
// viewport on desktop.
//
// Laid out in chapter 01's language, which Egor asked to carry across the
// whole page: `headless`, so the chapter owns its own number and heading and
// can put them in a left column that centres against the content beside it
// rather than sitting in a header pinned above everything. Heading in the
// display face under one wide soft cyan halo, ordinary sentence-case support
// line, and the flat PILL/ROUND pair for actions instead of the site-wide
// `.btn-3d` key. The CTA is deliberately the calculator here rather than
// chapter 01's brief — this chapter's argument is about price and speed
// against the alternatives, so "рассчитать" is the question it just raised.

const COMPARE_COLS = ["Конструктор (Tilda/Wix)", "Классическая студия", "HUD.SERVICE (AI)"];

const COMPARE_ROWS = [
  {
    label: "Уникальность дизайна",
    values: ["Шаблон", "Уникальный", "Уникальный"],
  },
  {
    label: "Срок",
    values: ["Быстро, но сами", "Недели–месяцы", "Дни"],
  },
  {
    label: "Код",
    values: ["Зависите от платформы", "Свой код", "Свой код — сайт ваш"],
  },
  {
    label: "Цена",
    values: ["Низкая", "Высокая", "Ниже классической, выше конструктора"],
  },
];

const SEGMENTS = [
  { tag: "МАЛЫЙ БИЗНЕС", title: "Услуги без раздутого бюджета" },
  { tag: "ЛИЧНЫЙ БРЕНД", title: "Быстрый запуск под задачу" },
  { tag: "СТАРТАП", title: "Проверить нишу лендингом" },
];

export default function SitesMethodAudience() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      title="Никакой магии"
      side="right"
      entrance="slide-right"
      id="method"
      spacious
      column
      headless
      /* Same move as chapter 01: the bolt used to hang top-right as a sticker
         in empty frame. It now bleeds off the left edge behind the comparison
         table, whose own bg-ink/45 + backdrop-blur frosts the overlapping
         half, so it reads as a layer under the content instead of a decal
         over it. */
      bodyDecor={
        <SitesDecoIcon
          src="/images/icons/sites/bolt.webp"
          size={300}
          rotate={10}
          pulse
          delay={0.35}
          className="-left-28 -top-10 opacity-90 xl:-left-20"
        />
      }
    >
      {/* relative z-10 for the same reason as chapter 01: keep the absolutely
          positioned bodyDecor behind the content it sits under. */}
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14 land:flex land:items-start land:gap-6">
        {/* Widened from 38% — Egor's ask: with the promo card stacked under
            Саша's card, the narrower column read cramped next to the
            comparison table. */}
        <div className="w-full shrink-0 lg:w-[44%] land:w-[40%]">

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-warm max-w-[6.7em] font-display text-[2.25rem] uppercase leading-[1.09] tracking-tight sm:text-[2.925rem] lg:text-[3.24rem] xl:text-[3.6rem]">
              Никакой
              <br />
              <span className="kw">магии</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Просто быстрее и дешевле классической разработки — для малого бизнеса, личного бренда
              и стартапов.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            {/* Саша как сервис — пилот механики TeamPulse на месте прежней
                компактной карточки (решение Егора, 2026-09-24). */}
            <TeamPulse data={SASHA_SITES} className="mt-4" />
          </Appear>

          {/* /sites' own September offer — sits under Саша's card (Egor's
              ask, same fix as /smm's chapter 02). Gap bumped to mt-8 (was
              mt-4, too close to Саша's card) and the photo swapped for the
              site's own stock library — a design tablet, closer to
              "лендинг" than the generic service-sites.jpg (Egor's ask,
              applied site-wide). Priced off this service's own real tier in
              pricingByCategory.sites ("Лендинг", от 60 000 ₽) with a flat
              20% off: 60 000 → 48 000 ₽ — this one already matched its own
              service before Egor's correction, so the number is unchanged. */}
          <Appear from="up" delay={BEAT.cta} className="mt-8">
            <PromoCard
              image="/images/stock/design-tablet.webp"
              badge="Акция сентября"
              title="Лендинг под продукт"
              subtitle="Одна страница, которая доводит трафик до заявки."
              price="48 000 ₽"
              oldPrice="60 000 ₽"
              href="/brief/sites"
              leadPrefill={{ format: "Лендинг", wishes: "Акция сентября — от 60 000 до 48 000 ₽" }}
            />
          </Appear>
        </div>

        <div className="mt-10 lg:mt-0 lg:flex-1 land:mt-0 land:min-w-0 land:flex-1">
          <Appear from="right" delay={BEAT.content}>
            <div className="overflow-x-auto rounded-2xl bg-white/[0.045] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl backdrop-saturate-150">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-paper/15">
                    <th
                      scope="col"
                      className="p-3.5 font-display font-normal uppercase tracking-[0.1em] text-paper/40"
                    >
                      &nbsp;
                    </th>
                    {COMPARE_COLS.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`p-3.5 font-display font-normal uppercase leading-tight tracking-tight ${
                          i === 2 ? "text-glow" : "text-paper/70"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-paper/10 last:border-0">
                      <th scope="row" className="p-3.5 font-sans font-medium text-paper/85">
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={i}
                          className={`p-3.5 leading-snug ${i === 2 ? "text-white" : "text-paper/60"}`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Appear>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {SEGMENTS.map((s, i) => (
              <Appear
                key={s.tag}
                from="up"
                delay={BEAT.cta + i * STAGGER.tight}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 backdrop-blur-md"
              >
                <span className="font-display text-[9px] uppercase tracking-[0.15em] text-glow">
                  {s.tag}
                </span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-paper/30" />
                <span className="font-display text-[11px] uppercase leading-tight tracking-tight text-white">
                  {s.title}
                </span>
              </Appear>
            ))}
          </div>

          {/* Окошко формата — под чипами, на всю ширину правой колонки. */}
          <ToolSpotlight slug="site-landing" accent={SITES_ACCENT} shape="card" />
        </div>
      </div>
    </CinematicSection>
  );
}
