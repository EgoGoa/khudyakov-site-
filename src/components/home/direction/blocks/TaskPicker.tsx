"use client";

import { AnimatePresence } from "framer-motion";
import { PersonaChip, PersonaResult, PersonaShell } from "../PersonaBlock";
import { useDirectionTask } from "../TaskContext";
import type { BlockMediaSpec } from "../types";

// Шаг 1 воронки персонализации: зачем посетитель пришёл.
//
// Самый первый и самый широкий вопрос — он один меняет сразу четыре блока
// ниже (смету, порядок кейсов, срок в процессе и финальное обещание), и
// именно поэтому стоит сразу под полосой цифр, до всякого содержания.
//
// Оболочка, кнопки и подтверждение общие для всех трёх шагов (PersonaBlock):
// три блока персонализации на странице обязаны читаться как один механизм, а
// не как три разные формы заявки.
export default function TaskPicker({
  prompt,
  note,
  media,
  /** Сколько всего шагов персонализации на странице — пробрасывается в
   *  PersonaShell. По умолчанию 3 (полный шаблон); компактные страницы
   *  AI-инструментов передают 1, потому что у них нет отдельных шагов
   *  «бюджет и срок» и «что у вас уже есть» — см. CompactToolContent. */
  totalSteps = 3,
  /** Что именно пересобралось после выбора — список меняется вместе с
   *  тем, какие блоки вообще есть на странице. Полный шаблон трогает
   *  смету, порядок кейсов, срок и финал; компактный не показывает кейсы
   *  отдельным блоком, поэтому эта строка там не подтвердится, если её не
   *  убрать. */
  changed = ["Смета пересчитана", "Кейсы переставлены", "Срок уточнён", "Финал переписан"],
}: {
  prompt: string;
  note: string;
  media?: BlockMediaSpec;
  totalSteps?: number;
  changed?: string[];
}) {
  const { tasks, active, select } = useDirectionTask();

  return (
    <PersonaShell
      step={1}
      totalSteps={totalSteps}
      prompt={prompt}
      note={note}
      media={media}
      answered={Boolean(active)}
      result={
        <AnimatePresence mode="wait">
          {active ? (
            <PersonaResult
              key={active.id}
              lead={
                <>
                  Страница пересобрана:{" "}
                  <span className="font-medium text-orange">{active.promise}</span>
                </>
              }
              changed={changed}
              onReset={() => select(active.id)}
            />
          ) : null}
        </AnimatePresence>
      }
    >
      <div className="flex flex-wrap items-stretch justify-center gap-4">
        {tasks.map((task, i) => (
          <PersonaChip
            key={task.id}
            label={task.label}
            hint={task.hint}
            on={active?.id === task.id}
            idle={!active}
            index={i}
            onClick={() => select(task.id)}
          />
        ))}
      </div>
    </PersonaShell>
  );
}
