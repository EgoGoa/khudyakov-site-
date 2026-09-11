"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Smooth open/close for the answer text below — Egor's ask, "в стиле
// Apple": animating to height "auto" (framer-motion measures it) rather
// than the plain mount/unmount this used to be, with the same easeOutExpo-
// ish curve CinematicSection's own chapter transitions use, so every open
// interaction on the page settles the same way.
const ANSWER_EASE = [0.22, 1, 0.36, 1] as const;

// Fills the empty desktop-only margin beside the "Why us" reasons — a short
// FAQ answers the concrete questions a visitor has before they'll act on any
// of those reasons, so it belongs next to them rather than as its own
// separate chapter. Placeholder questions until real ones replace them, one
// set per category so switching tabs actually changes what's on screen
// rather than just relabelling the same three items.
const CATEGORIES = [
  {
    label: "Стоимость и сроки",
    items: [
      {
        q: "Сколько стоит видеоролик?",
        a: "Считаем по ТЗ: формат, хронометраж и сложность производства. Ориентир — в калькуляторе, точная смета — после брифа.",
      },
      {
        q: "Сколько времени занимает съёмка?",
        a: "От брифа до готового ролика — обычно 5–15 рабочих дней, в зависимости от формата и числа правок.",
      },
      {
        q: "Можно уложиться в ограниченный бюджет?",
        a: "Да — предложим формат под бюджет: от простого эксплейнера до полной постановочной съёмки.",
      },
    ],
  },
  {
    label: "Процесс работы",
    items: [
      {
        q: "Сколько времени займёт моё участие в проекте?",
        a: "Обычно 2–3 созвона: бриф, утверждение концепции, приёмка. Остальное — на нашей стороне.",
      },
      {
        q: "Как проходит согласование этапов?",
        a: "Показываем прогресс на каждом шаге — сценарий, черновой монтаж, финальную версию — и собираем правки письменно.",
      },
      {
        q: "Нужно ли присутствовать на съёмках?",
        a: "Не обязательно, но можно — подключим онлайн-трансляцию площадки, если удобнее следить удалённо.",
      },
    ],
  },
  {
    label: "Задачи и форматы",
    items: [
      {
        q: "Какой формат подойдёт для привлечения клиентов?",
        a: "Чаще всего — короткий рекламный ролик или серия для соцсетей; подберём формат под площадку на брифе.",
      },
      {
        q: "У нас есть только идея — поможете с концепцией?",
        a: "Да, это часть работы: разрабатываем 2–3 творческие концепции бесплатно, до подписания договора.",
      },
      {
        q: "Чем вы отличаетесь от фрилансеров и агентств?",
        a: "Продюсерский центр полного цикла — от идеи до сдачи, с одной командой и одним ответственным за результат.",
      },
    ],
  },
  {
    label: "Результат и правки",
    items: [
      {
        q: "Сколько правок можно внести?",
        a: "2–3 круга правок включены в смету — этого обычно достаточно, чтобы довести ролик до нужного вида.",
      },
      {
        q: "Передаёте ли вы исходники?",
        a: "Да, финальные исходники и проектные файлы передаются вместе с готовым роликом.",
      },
      {
        q: "Есть поэтапная оплата?",
        a: "Да: старт, съёмка, финальная сдача — отдельными этапами, без предоплаты за саму идею.",
      },
    ],
  },
];

export default function FaqAside() {
  const [category, setCategory] = useState(0);
  const [open, setOpen] = useState<number | null>(0);

  const selectCategory = (i: number) => {
    setCategory(i);
    setOpen(0);
  };

  return (
    <div>
      {/* The "FAQ · до старта" badge and the subtitle both moved out —
          Egor's ask: the badge now sits above this card, level with the
          search bar (see Trust.tsx), and the subtitle just went (it wasn't
          saying anything the title didn't already). Removing both is most
          of what makes this card short enough to sit level with the five
          reasons opposite it. */}
      <h3 className="font-display text-lg uppercase leading-[0.95] tracking-tight text-paper">
        Отвечаем на вопросы до старта
      </h3>

      {/* Collapses to just the active pill while an answer is open — Egor's
          ask: an open answer needs the room the other three tabs were
          taking, not a scrollbar. Closing the answer brings the full row
          back. This (not a fixed height + internal scroll, tried and
          rejected) is what keeps the card's total height constant without
          ever showing a scroll affordance. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat, i) => {
          if (open !== null && i !== category) return null;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => selectCategory(i)}
              aria-pressed={category === i}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition ${
                category === i
                  ? "border-orange bg-orange text-white shadow-[0_0_16px_rgba(255,106,61,0.45)]"
                  : "border-paper/20 text-paper/60 hover:border-paper/40 hover:text-paper"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-paper/10">
        {CATEGORIES[category].items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-paper/10">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
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
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: ANSWER_EASE }}
                    className="max-w-sm overflow-hidden"
                  >
                    <p className="pb-3 text-xs leading-relaxed text-paper/55">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
