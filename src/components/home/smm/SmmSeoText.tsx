"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

// A written, SEO-carrying version of the service below the chapters —
// same shape as AiSeoText/SitesSeoText.

const SECTIONS = [
  {
    title: "Чем SMM-агентство внутри продакшна отличается от обычного",
    body: "SMM чаще всего покупают отдельно от съёмки — контент для соцсетей приходит от фрилансера, который не видел бренд вживую. HDKV.AGENCY ведёт соцсети той же командой, что снимает рекламные ролики: одни операторы, монтажёры и продюсер на проекте. Reels и сторис снимаются на том же оборудовании и в том же визуальном языке, что и остальной продакшн бренда.",
  },
  {
    title: "Как мы строим контент-план",
    body: "Начинаем с аудита аккаунта и ниши, собираем план на 90 дней и расписываем публикации на месяц вперёд — вы видите его до того, как что-либо снято. AI-инструменты ускоряют черновики сценариев и текстов, но каждый пост и рилс перед публикацией проверяет человек.",
  },
  {
    title: "Что входит в еженедельный отчёт",
    body: "Раз в неделю — что сделано, что сработало и что меняем дальше, простым языком без размытых формулировок. Фиксированный ежемесячный пакет означает отсутствие доплат за согласованный объём контента.",
  },
];

export default function SmmSeoText() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-paper sm:text-3xl">
            Подробнее о SMM
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
