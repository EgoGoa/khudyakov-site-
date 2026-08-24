"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

// A written, SEO-carrying version of the service below the deck — same
// reasoning as AiSeoText.tsx: a glance-and-decide deck isn't the right
// container for a long read or a search crawler.

const SECTIONS = [
  {
    title: "Когда сайт на AI, а когда — классическая разработка",
    body: "AI-подход закрывает задачи, где важны скорость и предсказуемый бюджет: лендинг, сайт-визитка, проверка гипотезы стартапа. Там, где нужна сложная логика, нестандартные интеграции или крупный продукт с командой разработки на годы вперёд — честно скажем, если классическая студия или штатная команда подойдёт больше.",
  },
  {
    title: "Как мы работаем с AI-инструментами",
    body: "AI не заменяет команду — ускоряет черновик. Claude Code собирает структуру страниц, тексты и первую вёрстку за часы, а не недели. Дальше в дело вступают люди: проверяют каждую деталь, дорабатывают вручную, настраивают деплой и домен. Ответственность за результат — всегда на команде, не на модели.",
  },
  {
    title: "Почему HDKV.AGENCY",
    body: "Направление сайтов на AI растёт внутри агентства с продакшн-культурой полного цикла. Фиксированные сроки на старте, гарантия возврата денег, если результат не устроит, и код, который принадлежит вам — не чужому конструктору.",
  },
];

export default function SitesSeoText() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-paper sm:text-3xl">
            Подробнее о сайтах на AI
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
