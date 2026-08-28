"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import FlareBackground from "@/components/ui/FlareBackground";

// A written, SEO-carrying version of the service below the swipe deck — the
// deck itself is built for a glance-and-decide visitor, not a search crawler
// or someone who wants to read before acting. Sits outside CinematicStage on
// purpose: ruvision's own equivalent lives below its main scroll funnel too,
// not inside it, and a stepping deck isn't the right container for a long
// read anyway (see PhotoStage's one-screen-per-chapter rule). Collapsed by
// default so it doesn't compete with the deck above for attention.
//
// Carries the footer's own drifting-flare background (see FlareBackground)
// rather than a bare bg-ink — this section was the last thing before the
// footer's own flare-lit CTA band, and the hard cut from flat black straight
// into that texture read as two unrelated blocks stacked back to back
// instead of one hand-off into the footer. `fadeTop` opens the gradient from
// solid black at this section's own top (where the deck above it is still
// flat black) so the texture builds in rather than starting at full
// strength, and by the time it reaches the bottom edge it's at the same
// strength the footer's own background carries — the seam between this
// section and the footer disappears because both sides now match.

const SECTIONS = [
  {
    title: "Когда выбирать AI, а когда — классический подход",
    body: "AI-инструменты закрывают задачи, где важны скорость и объём: поток однотипных заявок, продуктовый контент под соцсети и маркетплейсы, первичная квалификация лида. Там, где решает эмоция, доверие к бренду или штучная работа — предложим то, что действительно лучше сработает, даже если это не AI. Мы продюсерский центр полного цикла, а не только AI-подрядчик, поэтому не подгоняем задачу под инструмент.",
  },
  {
    title: "Как мы работаем с AI-инструментами",
    body: "Начинаем не с внедрения технологии, а с аудита процесса: продаж, контента или коммуникации с клиентами. Находим 1–2 узких места, где эффект будет измеримым, и запускаем пилот именно там — не на всей воронке сразу. Пилот показал результат — расширяем на другие процессы; не показал — говорим прямо и меняем подход. NDA подписываем до передачи внутренних данных.",
  },
  {
    title: "Почему HDKV.AGENCY",
    body: "AI-направление растёт внутри агентства с полным циклом видеопродакшна и продакшн-культурой — 8 лет на рынке, 350+ клиентов, около 60% заказов — от тех, кто возвращается. AI-инструменты внедряем с 2024 года: не потому что модно, а там, где они реально ускоряют результат клиента.",
  },
];

export default function AiSeoText() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    // Less padding at the bottom than the top: this hands off straight into
    // the footer's own CTA band immediately below (same background, see
    // FlareBackground) — the two are meant to read as one compact block, not
    // sit apart with a slab of empty space between them.
    <section className="relative overflow-hidden bg-ink pb-6 pt-14 sm:pb-8 sm:pt-16">
      <FlareBackground fadeTop />

      <Container className="relative max-w-3xl">
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">
            Вопросы и подход
          </span>
          <h2 className="mt-2.5 font-display text-2xl uppercase leading-tight tracking-tight sm:text-3xl">
            <span className="bg-orange px-2 py-0.5 text-ink [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              Подробнее о AI-решениях
            </span>
          </h2>
        </Reveal>

        <div className="mt-5 border-t border-paper/10">
          {SECTIONS.map((section, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={section.title} className="border-b border-paper/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-glow/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-base font-medium text-paper">{section.title}</span>
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/60 transition-transform duration-200 ${
                      isOpen ? "rotate-45 border-glow/50 text-glow" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="max-w-2xl pb-4 pl-7 text-sm leading-relaxed text-paper/65">
                    {section.body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
