"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import { servicesByCategory } from "@/lib/service-content";

// Chapter 01 of /ai's deck (see src/app/(landing)/ai/page.tsx) — the
// ruvision-style pitch hero, folded together with its stat bar the way
// /content's own chapter header doubles up on a lead line. The site's
// universal Hero (headline + showreel) already sits above every service
// page and can't be swapped per-service — see (landing)/layout.tsx — so this
// is the actual AI-specific pitch, one level in.
//
// The "which task" row is a cell grid of our own 10 AI services (same data
// Offer.tsx's chapter 04 lists — servicesByCategory.ai), same logic and
// layout intent as /content's chapter 01 (DirectionsGrid): our own offer,
// laid out in cells, right at the top of the deck. Plainer cells than
// DirectionsGrid's — no video circle, no per-item subpage or "Подробнее"
// link exists for an individual AI service yet — title and description
// only, ten of them, so cells stay small enough to leave room for the stat
// row and CTA below on one screen.
//
// "←ПРОВЕРИТЬ" marks a working default rather than a confirmed real number
// — see docs/ai-page-todo.md.

const STATS = [
  { value: "с 2024", label: "внедряем AI-инструменты" },
  { value: "350+", label: "клиентов агентства" },
  { value: "60%", label: "заказов — повторные" },
  { value: "14+ ←ПРОВЕРИТЬ", label: "запущенных AI-пилотов" },
];

export default function AiPitch() {
  const services = servicesByCategory.ai;

  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="AI-решения быстрее рынка"
      icon="aperture"
      side="left"
      entrance="slide-left"
      id="pitch"
      intro="Внедряем ИИ-инструменты в продажи, контент и коммуникацию с клиентами — там, где это реально ускоряет результат, а не для галочки."
    >
      <div>
        {/* The pain line — named pains before the pitch resumes into the
            task grid, per the copy brief (hushflow: pain, then solution). */}
        <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-paper/55">
          Заявки теряются, пока менеджер занят. Контент под каталог собираете вручную. Отвечаете
          клиенту через два часа, когда конкурент — через минуту.
        </p>

        {/* Full page width now that the FunnelCta card that used to claim
            the right ~300px column is gone — ten cells get to breathe
            instead of being squeezed into a strip beside it. Bigger padding
            and a taller minimum height per cell (not just a wider grid) is
            what actually reads as "voluminous"; a wider grid alone would
            have just left more empty space inside the same cramped cells. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="flex min-h-[104px] flex-col rounded-2xl bg-ink/45 p-4 backdrop-blur-md"
            >
              <span className="font-mono text-[10px] text-glow/70">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-sm uppercase leading-[1.2] tracking-tight text-white">
                {service.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-paper/15 pt-5 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l border-glow/30 pl-3.5">
              <div className="font-display text-2xl uppercase tabular-nums text-paper">{stat.value}</div>
              <div className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-[0.1em] text-paper/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CinematicSection>
  );
}
