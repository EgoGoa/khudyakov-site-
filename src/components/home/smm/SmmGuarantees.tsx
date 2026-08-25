"use client";

import { useState } from "react";
import CinematicSection from "@/components/ui/CinematicSection";

// Chapter 05 — terms and a compact FAQ folded into one screen, same shape
// as AiGuarantees/SitesGuarantees. "←ПРОВЕРИТЬ" marks a working default
// rather than a term Egor has actually confirmed.

const TERMS = [
  {
    title: "Фиксированный ежемесячный пакет",
    description: "Без доплат за «лишний» рилс в рамках согласованного объёма. ←ПРОВЕРИТЬ",
  },
  {
    title: "Контент утверждается перед публикацией",
    description: "Ничего не выходит без вашего «да» — согласование в общем чате или таск-трекере.",
  },
  {
    title: "Отказ в любой момент",
    description: "Без длинных контрактов «в клетку» — предупреждение за один расчётный период. ←ПРОВЕРИТЬ",
  },
  {
    title: "Отчёт каждую неделю",
    description: "Понятным языком: что сделано, что сработало, что меняем дальше.",
  },
];

const FAQ = [
  {
    q: "Кто снимает контент — вы или фрилансеры?",
    a: "Съёмочная команда внутри агентства: те же операторы и монтажёры, что делают рекламные ролики для других клиентов. Фрилансеры на стороне не привлекаются.",
  },
  {
    q: "Сколько стоит ведение соцсетей?",
    a: "Зависит от объёма съёмки и площадок. Ориентиры — в разделе тарифов ниже, точная смета — после короткого брифа.",
  },
  {
    q: "Как быстро появится первый контент?",
    a: "После аудита и согласования контент-плана — обычно на второй-третьей неделе работы, в зависимости от объёма съёмки.",
  },
  {
    q: "Можно начать с разового аудита?",
    a: "Да — разбираем аккаунт и показываем, что усилить в первую очередь, без обязательств по дальнейшему ведению.",
  },
];

export default function SmmGuarantees() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <CinematicSection
      index={4}
      chapter="05"
      title="Что входит и на каких условиях"
      icon="scale"
      side="left"
      entrance="unfold"
      id="guarantees"
      intro="Покупаете не пост и не рилс — покупаете систему ведения, зафиксированную в договоре."
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
