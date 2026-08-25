"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";

// Chapter 01 of /smm — same shape as SitesPitch: one level in from the
// site's own universal Hero (see (landing)/layout.tsx). No CinematicStage
// here yet — public/video/bg-smm.mp4 is only the 10s preview loop used in
// DirectionsGrid/ServicePicker, not a full cinematic reel like
// content-reel.mp4 or ai-reel.mp4 (see the same note on /sites/page.tsx).
// Once that footage lands, wrapping the chapters below in <CinematicStage>
// is the only change needed — no section here needs a rewrite for that.

export default function SmmPitch() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="SMM силами продакшена"
      icon="aperture"
      side="left"
      entrance="slide-left"
      id="pitch"
      intro="Съёмка, монтаж и ведение соцсетей — одна команда, без подрядчиков со стороны."
    >
      <div className="lg:flex lg:items-center lg:gap-12">
        <div className="lg:flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-ink/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />
              Контент-план на месяц вперёд
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-ink/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />
              Отчёт каждую неделю
            </span>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-paper/55">
            Ролики для рилс и сторис снимают те же операторы и монтажёры, что делают рекламу для других клиентов
            агентства — задача не уходит фрилансерам на стороне.
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
