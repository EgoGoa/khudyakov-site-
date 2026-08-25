"use client";

import { useState } from "react";
import CinematicSection from "@/components/ui/CinematicSection";
import AiDecoIcon from "@/components/home/ai/AiDecoIcon";

// Chapter 05 — "you're buying a system, not a post" thesis, terms (rights/
// SLA/timelines), contractual guarantees, and a compact FAQ, all folded into
// one screen the way /content's chapter 03 pairs its reasons with a FAQ
// aside. ruvision's tender/44-ФЗ guarantee point is dropped — not relevant
// to this business — and its awards/press proof points are skipped entirely
// per the no-invented-data rule.
//
// "←ПРОВЕРИТЬ" marks a working default rather than a term Egor has actually
// confirmed — see docs/ai-page-todo.md.

const TERMS = [
  { title: "Пилот прежде масштабирования", description: "Начинаем с одного узкого места, не с внедрения всего сразу." },
  {
    title: "Права без доплат",
    description:
      "Все права на разработанную систему и созданный AI-контент переходят вам по завершении проекта — без дополнительной оплаты. ←ПРОВЕРИТЬ",
  },
  {
    title: "Правки по SLA",
    description: "Два раунда правок в рамках пилота включены в стоимость. Дальше — по регламенту сопровождения. ←ПРОВЕРИТЬ",
  },
  { title: "NDA до брифа", description: "Конфиденциальность подписываем до передачи внутренних данных." },
  {
    title: "Сроки закреплены",
    description: "Даты аудита, пилота и запуска фиксируются в договоре на этапе согласования — без «плавающих» сроков. ←ПРОВЕРИТЬ",
  },
];

const FAQ = [
  {
    q: "Сколько стоит AI-решение?",
    a: "От разовой настройки одного инструмента до месячного сопровождения — зависит от процесса и охвата. Точная смета — после аудита. Ориентиры — в разделе тарифов ниже.",
  },
  {
    q: "Чем AI-агент отличается от обычного сайта?",
    a: "Сайт — статичная витрина. AI-агент ведёт диалог, отвечает на вопросы клиента и передаёт менеджеру только тёплые заявки — работает как первая линия продаж, а не просто отображает информацию.",
  },
  {
    q: "Кому подходит внедрение AI?",
    a: "Бизнесу с потоком однотипных обращений — заявки, вопросы по каталогу, первичная квалификация лида. Если обращений мало и они все разные, эффект слабее.",
  },
  {
    q: "Какие сроки на пилот?",
    a: "Аудит и первый пилот на одном процессе — обычно 1–2 недели. Дальше расширяем только там, где пилот показал результат.",
  },
  {
    q: "Кому принадлежат права на AI-контент?",
    a: "Все права переходят вам по завершении проекта — без дополнительной оплаты за лицензию. ←ПРОВЕРИТЬ",
  },
  {
    q: "Куда уходят наши данные?",
    a: "Конфиденциальность фиксируем в NDA до начала работы, а не после. Что можно использовать, а что остаётся строго внутри проекта — прописываем в договоре заранее. ←ПРОВЕРИТЬ",
  },
];

export default function AiGuarantees() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <CinematicSection
      index={5}
      chapter="06"
      title="Условия и гарантии"
      icon="scale"
      side="left"
      entrance="unfold"
      id="guarantees"
      intro="Покупаете не пост и не ролик — покупаете работающую систему, зафиксированную в договоре."
      decor={
        <AiDecoIcon
          src="/images/icons/ai/guarantees.png?v=2"
          size={240}
          rotate={8}
          variant={2}
          z={-1}
          className="-left-16 -top-10 lg:-left-6"
        />
      }
    >
      <div className="lg:flex lg:items-start lg:gap-12">
        <ul className="lg:max-w-md lg:flex-1">
          {TERMS.map((term, i) => (
            <li key={term.title} className="border-t border-paper/20 py-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                    {term.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-paper/60">{term.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 lg:mt-0 lg:w-[360px] lg:shrink-0 xl:w-[400px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">FAQ</span>
          <div className="mt-3 border-t border-paper/10">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="border-b border-paper/10">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  >
                    <span className="text-sm font-medium leading-snug text-paper">{item.q}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/60 transition-transform duration-200 ${
                        isOpen ? "rotate-45 border-orange/50 text-orange" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="max-w-sm pb-3.5 text-xs leading-relaxed text-paper/55">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
