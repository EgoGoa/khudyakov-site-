"use client";

import { useState } from "react";
import Link from "next/link";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import { SITES_ACCENT } from "@/components/home/ai/spotlightSites";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { EGOR_SITES } from "@/components/home/team-pulse/content/egor-sites";

// Chapter 05 — "why us" (brief §9) plus the FAQ (brief §10), folded into one
// screen the same way AiGuarantees.tsx pairs its terms list with an FAQ
// accordion for /ai's chapter 06.
//
// FAQ answer 2 ("Насколько быстро...") states a market-rate turnaround
// estimate, same convention as the pricing tiers in service-content.ts — not
// confirmed by Egor against a real case yet.
//
// Laid out in chapter 01's language, which Egor asked to carry across the
// page: `headless`, so the chapter renders its own number and heading into a
// left column that centres against the content beside it instead of a header
// pinned above everything; the heading in the display face under one wide
// soft cyan halo; and the flat PILL/ROUND pair for actions rather than the
// site-wide `.btn-3d` key. The reasons list and the FAQ move into one glass
// panel on the right, the same material as chapter 01's cards and chapter
// 02's comparison table.

// Тексты ужаты, чтобы блок «дышал» (Егор, 2026-09-29). Вопросы, которые
// повторяли гарантии («чем отличается от конструктора», «что если не
// понравится»), убраны; смыслы бывшего SEO-блока «Подробнее о сайтах на AI»
// из финальной главы переехали сюда вопросами.
const REASONS = [
  { title: "Фиксированные сроки", description: "Дата запуска известна с первого дня." },
  { title: "Гарантия возврата", description: "Не понравится результат — вернём деньги." },
  { title: "AI ускоряет, люди отвечают", description: "Контроль на каждом этапе, а не «как получится»." },
  { title: "Сайт — ваш", description: "Свой код, без привязки к конструктору." },
];

const FAQ = [
  {
    q: "Когда сайт на AI, а когда — классическая разработка?",
    a: "Лендинг, визитка, проверка гипотезы — AI: быстро и в понятный бюджет. Сложная логика и продукт на годы вперёд — честно посоветуем классическую студию.",
  },
  {
    q: "Насколько быстро вы делаете сайт?",
    a: "Лендинг — несколько рабочих дней, сайт под ключ — до пары недель: черновик собирает AI.",
  },
  {
    q: "Кто отвечает за качество — AI или люди?",
    a: "AI собирает черновик за часы, люди проверяют каждую деталь и отвечают за результат.",
  },
  {
    q: "На чём технически собран сайт?",
    a: "Код на React/HTML, хостинг на Vercel или Netlify — быстро и без затрат на серверы.",
  },
  {
    q: "Формы и AI-ассистент — это безопасно?",
    a: "Формы работают через готовый сервис, ассистент — через защищённую функцию. Ключи API не лежат в коде браузера.",
  },
];

export default function SitesGuarantees() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <CinematicSection
      index={4}
      chapter="05"
      title="Почему мы"
      side="left"
      entrance="unfold"
      id="guarantees"
      spacious
      column
      headless
      bodyDecor={
        <SitesDecoIcon
          src="/images/icons/sites/shield.webp"
          size={230}
          rotate={7}
          z={0}
          className="-right-6 -top-10 opacity-80 lg:right-0"
        />
      }
    >
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14 land:flex land:items-start land:gap-6">
        <div className="w-full shrink-0 lg:w-[38%] land:w-[40%]">

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-warm max-w-[6.7em] font-display text-[2.25rem] uppercase leading-[1.09] tracking-tight sm:text-[2.925rem] lg:text-[3.24rem] xl:text-[3.6rem]">
              Почему
              <br />
              <span className="kw">мы</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Покупаете не шаблон и не подписку на конструктор — покупаете свой сайт с
              зафиксированными сроками.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
{/* Егор как сервис — уведомление на месте прежней карточки. */}
            <div className="mt-4">
              <TeamPulse data={EGOR_SITES} compact source="/sites · глава «Почему мы»" />
            </div>
          </Appear>
          <ToolSpotlight slug="site-card" accent={SITES_ACCENT} place="left" />
          {/* AI-ассистент переехал сюда с главы 06 (Close) — Егор попросил
              вторым окошком под «Сайт-визиткой», тем же приёмом (place=left). */}
          <ToolSpotlight slug="site-assistant" accent={SITES_ACCENT} place="left" />
        </div>

      {/* Гарантии и FAQ — друг под другом в едином стиле (Егор, 2026-09-29):
          одинаковые подписи, линии, фирменный шрифт и белый текст. */}
      <div className="mt-10 lg:mt-0 lg:min-w-0 lg:flex-1 land:mt-0 land:min-w-0 land:flex-1">
        <Appear from="up" delay={BEAT.content} className="font-display text-[13px] uppercase tracking-[0.14em] sm:text-[15px]">
          <span className="kw">Гарантии</span>
        </Appear>
        <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
          {REASONS.map((reason, i) => (
            <Appear
              key={reason.title}
              as="li"
              from="up"
              delay={BEAT.content + i * STAGGER.tight}
              className="border-t border-paper/15 py-2.5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[11px] text-white">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-[12.5px] uppercase leading-tight tracking-tight text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-0.5 font-display text-[12px] leading-snug tracking-tight text-white">{reason.description}</p>
                </div>
              </div>
            </Appear>
          ))}
        </ul>

        <Appear from="up" delay={BEAT.cta} className="mt-7 font-display text-[13px] uppercase tracking-[0.14em] sm:text-[15px]">
          <span className="kw">Частые вопросы</span>
        </Appear>
        <Appear from="up" delay={BEAT.cta} className="mt-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-t border-paper/15">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-baseline gap-3 py-2.5 text-left"
                >
                  <span className="font-display text-[11px] text-white">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-display text-[12.5px] uppercase leading-tight tracking-tight text-white">{item.q}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 text-[12px] items-center justify-center self-center rounded-full border border-paper/25 text-white transition-transform duration-200 ${
                      isOpen ? "rotate-45 border-orange/60 text-orange" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {/* Ответы всегда в разметке (для поисковиков — бывший SEO-текст),
                    закрытые просто скрыты. */}
                <p hidden={!isOpen} className="-mt-1 max-w-[46em] pb-3 pl-[1.9rem] font-display text-[12px] leading-snug tracking-tight text-white">{item.a}</p>
              </div>
            );
          })}
        </Appear>
      </div>
      </div>
    </CinematicSection>
  );
}
