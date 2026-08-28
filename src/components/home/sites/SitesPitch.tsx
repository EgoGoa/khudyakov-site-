"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";

// Chapter 01 of /sites — the opening pitch, one level in from the site's own
// universal Hero (see (landing)/layout.tsx, and the same reasoning in
// AiPitch.tsx for why the shared Hero can't be swapped per service). No
// "N сайтов запущено" stat row: the brief in content/site-copy.md is
// explicit that until real cases exist, no numbers get invented here.

export default function SitesPitch() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="Сайты на AI — дни, не месяцы"
      icon="aperture"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      intro="Уникальный дизайн и вёрстка вместо шаблонов и конструкторов. Без штата разработчиков — HDKV.AGENCY собирает сайт с помощью AI-инструментов под контролем опытной команды."
      decor={
        <SitesDecoIcon
          src="/images/icons/sites/cursor.png"
          size={92}
          rotate={-14}
          click
          className="right-[24%] top-[58px] lg:top-[66px]"
        />
      }
    >
      <div className="lg:flex lg:items-center lg:gap-12">
        <div className="lg:flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-ink/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />
              Фиксированные сроки
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-ink/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />
              Гарантия возврата денег
            </span>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-paper/55">
            Не понравится результат — вернём деньги. AI ускоряет черновик: структуру, тексты и первую вёрстку.
            Качество, доработку и деплой всегда контролирует команда.
          </p>
        </div>

        <div className="mt-6 lg:mt-0 lg:w-[300px] lg:shrink-0 xl:w-[320px]">
          <FunnelCta
            item="discuss"
            align="right"
            size="sm"
            spacious
            eyebrow="Опишите задачу"
            headline="Обсудим формат"
            accent="и бюджет"
            pitch="Ответит продюсер — не отдел продаж."
          />
        </div>
      </div>
    </CinematicSection>
  );
}
