"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

// A written, SEO-carrying version of the service below the swipe deck — the
// deck itself is built for a glance-and-decide visitor, not a search crawler
// or someone who wants to read before acting. Sits outside CinematicStage on
// purpose: ruvision's own equivalent lives below its main scroll funnel too,
// not inside it, and a stepping deck isn't the right container for a long
// read anyway (see PhotoStage's one-screen-per-chapter rule). Collapsed by
// default so it doesn't compete with the deck above for attention.

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
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-paper sm:text-3xl">
            Подробнее о AI-решениях
          </h2>
        </Reveal>

        <div className="mt-6 border-t border-paper/10">
          {SECTIONS.map((section, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={section.title} className="border-b border-paper/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 py-4 text-left"
                >
                  <span className="font-sans text-base font-medium text-paper">{section.title}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/60 transition-transform duration-200 ${
                      isOpen ? "rotate-45 border-orange/50 text-orange" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="max-w-2xl pb-5 text-sm leading-relaxed text-paper/65">{section.body}</p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
