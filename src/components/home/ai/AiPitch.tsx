"use client";

import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import { useState } from "react";
import { useLandscapePhone } from "@/lib/use-landscape-phone";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import AiDeck, { AI_PILL, AI_ROUND } from "@/components/home/ai/AiDeck";
import { EYEBROW } from "@/lib/typography";
import { TEAM } from "@/lib/team";
import TeamAskCard from "@/components/home/TeamAskCard";

// Chapter 01 of /ai's deck (see src/app/(landing)/ai/page.tsx) — rebuilt in
// the composition Egor approved on /sites (see SitesPitch for the same
// reasoning at length): copy column on the left, service carousel on the
// right, both centred against each other.
//
// The chapter runs `headless` for that reason. CinematicSection's own header
// is a separate flex child pinned above the body, which splits the chapter in
// two — title at the top of the frame, everything else floating below it —
// and leaves no way to line the copy up against a tall carousel beside it.
// Owning the whole stack is what lets both columns share one vertical centre.
//
// What changed from the previous build of this chapter:
//
//   * the ten services are no longer a static 5×2 grid of plain cells — they
//     are the cards of AiDeck's 3D coverflow, which is the "creative paging"
//     Egor asked for and puts the same ten items on screen with a fraction of
//     the visual weight;
//   * the heading is set in near-white under one soft emerald halo
//     (.chapter-neon-cool) rather than the site-wide cyan triple-neon, with
//     an explicit line break so it always sets as three lines;
//   * the actions are the flat emerald pill plus a glass circle-arrow
//     (AI_PILL / AI_ROUND, shared with AiDeck so the page has one button
//     language), not the .btn-3d pressed-key treatment;
//   * the stat row survives, but as one thin line under the column rather
//     than a four-cell bordered block — Egor's call: the numbers stay
//     visible on the first screen without competing with the carousel.
//
// "←ПРОВЕРИТЬ" marks a working default rather than a confirmed real number —
// see docs/ai-page-todo.md.

// "14+" is still a working default rather than a confirmed number — the old
// inline "←ПРОВЕРИТЬ" marker lived in the visible value and wrapped this row
// onto three lines at lg, which is why it is a comment now instead. It stays
// tracked in docs/ai-page-todo.md.
const STATS = [
  { value: "с 2024", label: "внедряем AI" },
  { value: "350+", label: "клиентов" },
  { value: "60%", label: "повторные" },
  { value: "14+", label: "AI-пилотов" },
];

export default function AiPitch() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const land = useLandscapePhone();
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="AI-решения быстрее рынка"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      column
      headless
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10 xl:gap-14 land:grid land:grid-cols-[40%_1fr] land:items-start land:gap-x-6 land:gap-y-2">
        <div className="contents lg:block lg:w-[46%] lg:shrink-0 land:block land:w-auto land:shrink-0">
          <div className="order-1 lg:order-none land:order-none">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className={`${EYEBROW} text-emerald-300`}>01</span>
              <span className="h-px w-8 bg-emerald-300/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-cool mt-3 max-w-[9.4em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] land:text-[2.1rem] lg:text-[3.5rem] xl:text-[3.9rem]">
              <span className="whitespace-nowrap"><span className="kw">AI</span>-решения</span><br />
              быстрее рынка
            </h2>
          </Appear>

          </div>
          <div className="order-3 lg:order-none land:order-none">
          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Внедряем ИИ там, где это <span className="kw">ускоряет результат</span>, а не для галочки.
            </p>
          </Appear>

          {/* The pain line, kept from the previous build (the copy brief asks
              for named pains before the pitch resumes) but trimmed to two
              sentences so the column still ends above the fold beside the
              carousel. */}
          <Appear from="up" delay={BEAT.intro} className="land:hidden">
            <p className="mt-4 max-w-[32em] text-sm leading-relaxed text-white">
              Заявки теряются, пока менеджер занят. Конкурент отвечает клиенту{" "}
              <span className="kw">через минуту</span>, вы — через два часа.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <TeamAskCard
              member={TEAM.dima}
              question="Подбираю AI-инструмент под задачу, а не для галочки"
              pitch="Подберу AI-инструмент под задачу и покажу, как это будет работать у вас."
              actionLabel="Обсудить внедрение"
              href="/brief/ai"
              compact
              className="mt-4"
            />
          </Appear>

          {/* One thin line instead of the old bordered four-cell block. */}
          <Appear from="up" delay={BEAT.cta} className="land:hidden">
            <div className="mt-9 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-paper/12 pt-4">
              {STATS.map((stat) => (
                <span key={stat.label} className="inline-flex items-baseline gap-1.5">
                  <span className="font-display text-base uppercase tabular-nums text-paper">{stat.value}</span>
                  <span className="font-display text-[10px] uppercase tracking-[0.1em] text-paper/45">{stat.label}</span>
                </span>
              ))}
            </div>
          </Appear>
          </div>
        </div>

        {/* Below lg the left column is `display: contents`, so `order` puts the
            coverflow straight under the title on a phone (FanFit inside AiDeck
            scales it to fit). */}
        <Appear from="right" delay={BEAT.content} className="order-2 mt-6 lg:order-none lg:mt-0 lg:flex-1 land:order-none land:mt-0 land:min-w-0">
          <AiDeck panelTarget={land ? slot : null} />
        </Appear>
        <div ref={setSlot} className="hidden land:col-span-2 land:block" />
      </div>
    </CinematicSection>
  );
}
