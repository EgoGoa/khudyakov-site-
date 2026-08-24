"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import { StepIcon } from "@/components/home/Process";

// Chapter 02 — "no magic, just faster and cheaper than classical
// development" (brief §3) plus the constructor/studio/us comparison table
// (brief §4), folded into one screen the way /content's own chapters pair a
// short argument with the table or grid that backs it up.

const STEPS = [
  {
    title: "Вы описываете задачу",
    description: "Бриф на 10–15 минут: что за бизнес, что должен делать сайт, какие примеры «вот так нравится».",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4M8 12.5h8M8 16h5" />
      </StepIcon>
    ),
  },
  {
    title: "AI собирает черновик",
    description: "Структура страниц, тексты, визуальный стиль и вёрстка — с помощью Claude Code. Часы, не недели.",
    icon: (
      <StepIcon>
        <path d="M8.5 8L3.5 12.5 8.5 17M15.5 8l5 4.5-5 4.5" />
        <path d="M13.2 5.5l-2.4 13" />
      </StepIcon>
    ),
  },
  {
    title: "Мы доводим до продакшена",
    description: "Команда проверяет каждую деталь, дорабатывает вручную, настраивает деплой и подключает домен.",
    icon: (
      <StepIcon>
        <path d="M12 3c3 3 5 7 5 10.5a5 5 0 0 1-10 0C7 10 9 6 12 3z" />
        <circle cx="12" cy="13" r="1.6" />
      </StepIcon>
    ),
  },
];

const COMPARE_COLS = ["Конструктор (Tilda/Wix)", "Классическая студия", "HDKV.AGENCY (AI)"];

const COMPARE_ROWS = [
  {
    label: "Уникальность дизайна",
    values: ["Шаблон", "Уникальный", "Уникальный"],
  },
  {
    label: "Срок",
    values: ["Быстро, но сами", "Недели–месяцы", "Дни"],
  },
  {
    label: "Код",
    values: ["Зависите от платформы", "Свой код", "Свой код — сайт ваш"],
  },
  {
    label: "Цена",
    values: ["Низкая", "Высокая", "Ниже классической, выше конструктора"],
  },
];

export default function SitesMethod() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      title="Никакой магии"
      icon="code"
      side="right"
      entrance="slide-right"
      id="method"
      intro="Просто быстрее и дешевле классической разработки."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-2xl bg-ink/45 p-4 backdrop-blur-md">
            {step.icon}
            <h3 className="mt-3 font-display text-sm uppercase leading-tight tracking-tight text-white">
              <span className="mr-1.5 text-orange">{String(i + 1).padStart(2, "0")}</span>
              {step.title}
            </h3>
            <p className="mt-1.5 text-xs leading-snug text-paper/65">{step.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-paper/50">
        AI ускоряет черновик — качество и ответственность за результат всегда на людях.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-ink/45 backdrop-blur-md">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-paper/15">
              <th scope="col" className="p-3.5 font-mono font-normal uppercase tracking-[0.1em] text-paper/40">
                &nbsp;
              </th>
              {COMPARE_COLS.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`p-3.5 font-display font-normal uppercase leading-tight tracking-tight ${
                    i === 2 ? "text-glow" : "text-paper/70"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-paper/10 last:border-0">
                <th scope="row" className="p-3.5 font-sans font-medium text-paper/85">
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={i} className={`p-3.5 leading-snug ${i === 2 ? "text-white" : "text-paper/60"}`}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CinematicSection>
  );
}
