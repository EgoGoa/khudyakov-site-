"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { works } from "@/lib/data";

const navItems = [
  { label: "Брифы", count: 3 },
  { label: "В работе", count: 5, active: true },
  { label: "На согласовании", count: 2 },
  { label: "Сдано", count: null },
  { label: "Архив", count: null },
];

const labels = [
  { name: "Реклама", color: "#F5310B" },
  { name: "Имидж", color: "#00D2FF" },
  { name: "Соцсети", color: "#F59E0B" },
  { name: "Мероприятия", color: "#10B981" },
];

const listItems = works.slice(0, 6);

const summaries: Record<string, string> = {
  "01": "Съёмка завершена, черновой монтаж готов. Осталось согласовать цветокоррекцию и звук — команда уложится в срок.",
  "02": "Отснято 3 съёмочных дня, идёт монтаж хайлайтов. Клиент утвердил превью первой версии.",
  "03": "Сценарий и раскадровка утверждены, съёмка назначена на следующей неделе.",
  "04": "Лукбук отснят, на очереди цветокоррекция и упаковка для соцсетей клиента.",
  "05": "Финальная версия отправлена клиенту, ждём комментарии по звуку.",
  "06": "Готово к сдаче: все правки внесены, файлы экспортируются в нужных форматах.",
};

export default function ProjectMockup() {
  const [activeId, setActiveId] = useState(listItems[0].id);
  const active = listItems.find((w) => w.id === activeId) ?? listItems[0];

  return (
    <section className="py-10 md:py-14">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass overflow-hidden rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-paper/10 bg-black/20 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#F5310B]" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
            </div>
            <span className="font-mono text-xs text-paper/50">KHUDYAKOV — Проекты</span>
            <span className="w-14" />
          </div>

          <div className="grid grid-cols-1 lg:h-[560px] lg:grid-cols-12">
            <div className="hidden border-b border-paper/10 bg-black/10 p-4 lg:col-span-3 lg:block lg:border-b-0 lg:border-r">
              <button className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-rec px-3 py-2 text-xs font-semibold text-white transition hover:bg-rec-light">
                + Новый проект
              </button>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                      item.active
                        ? "bg-paper/10 text-paper"
                        : "text-paper/60 hover:bg-paper/5"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.count !== null && (
                      <span className="font-mono text-xs text-paper/40">{item.count}</span>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/30">
                Категории
              </div>
              <div className="mt-3 space-y-2">
                {labels.map((label) => (
                  <div key={label.name} className="flex items-center gap-2 px-3 text-sm text-paper/60">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 lg:overflow-y-auto lg:border-r lg:border-paper/10">
              <div className="flex items-center gap-2 border-b border-paper/10 px-4 py-3 text-sm text-paper/40">
                Поиск по проектам
              </div>
              {listItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`block w-full border-b border-paper/5 px-4 py-3.5 text-left transition ${
                    activeId === item.id ? "bg-paper/[0.06]" : "hover:bg-paper/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-paper">{item.client}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-paper/70">{item.title}</div>
                  <div className="mt-1 truncate text-xs text-paper/40">
                    {item.category} · {summaries[item.id]}
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-center justify-between border-b border-paper/10 px-5 py-3">
                <div className="flex gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/40">
                  <span className="rounded-md px-2 py-1 hover:bg-paper/5">Открыть бриф</span>
                  <span className="rounded-md px-2 py-1 hover:bg-paper/5">В архив</span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/30">
                  ⋯
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl uppercase tracking-tight text-paper">
                  {active.title}
                </h3>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-glow to-glow-deep text-xs font-semibold text-white">
                    {active.client.charAt(0)}
                  </span>
                  <span className="text-sm text-paper/70">{active.client}</span>
                  <span className="ml-auto rounded-full border border-paper/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/50">
                    {active.category}
                  </span>
                </div>

                <div className="liquid-glass mt-5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-glow">
                    <span className="h-1.5 w-1.5 rounded-full bg-glow" />
                    Резюме от ИИ-ассистента
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-paper/70">
                    {summaries[active.id]}
                  </p>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-relaxed text-paper/60">
                  <p>Команда на проекте: продюсер, оператор, режиссёр монтажа.</p>
                  <p>
                    Формат — {active.category.toLowerCase()} для {active.client}. Следующий
                    шаг фиксируем в резюме выше.
                  </p>
                  <p className="text-paper/40">— команда HDKV.AGENCY</p>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/5 px-3 py-1.5 text-xs text-paper/60">
                  <span aria-hidden="true" className="text-paper/40">
                    ⌘
                  </span>
                  бриф-{active.id}.pdf
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
