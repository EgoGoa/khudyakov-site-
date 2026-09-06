"use client";

import { AnimatePresence } from "framer-motion";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT } from "@/lib/motion";
import { PersonaChip, PersonaResult, PersonaShell } from "../PersonaBlock";
import { BUDGET_CHOICES, SPEED_CHOICES, useDirectionTask } from "../TaskContext";
import type { BlockMediaSpec } from "../types";
import { EYEBROW } from "@/lib/typography";

// Шаг 2 воронки: бюджет и срок.
//
// Стоит вплотную ПЕРЕД сметой, а не после — чтобы ответ и его последствие
// были в одном экране: посетитель нажимает «горит», прокручивает на строку
// вниз и видит в смете другой подсвеченный тариф и другой срок. Если бы блок
// стоял после сметы, изменение осталось бы за кадром и выбор снова читался
// бы как косметика.
//
// Два ряда вместо одного длинного: бюджет и срок — разные вопросы, и слепив
// их в одну строку из шести кнопок, мы заставили бы читать её как один
// список взаимоисключающих вариантов.
export default function PersonaBudget({ media }: { media?: BlockMediaSpec }) {
  const { budget, speed, setBudget, setSpeed } = useDirectionTask();
  const answered = Boolean(budget || speed);

  const speedChoice = SPEED_CHOICES.find((c) => c.id === speed);
  const budgetChoice = BUDGET_CHOICES.find((c) => c.id === budget);

  return (
    <PersonaShell
      step={2}
      prompt="Бюджет и срок"
      note="Два ответа — и смета ниже перестанет быть прайсом на всех: останется тариф под ваши деньги и график под вашу дату."
      media={media}
      answered={answered}
      result={
        <AnimatePresence mode="wait">
          {answered ? (
            <PersonaResult
              key={`${budget}-${speed}`}
              lead={
                <>
                  {budgetChoice ? (
                    <>
                      Бюджет <span className="font-medium text-orange">{budgetChoice.label.toLowerCase()}</span>
                      {speedChoice ? ", " : ". "}
                    </>
                  ) : null}
                  {speedChoice ? (
                    <>
                      график — <span className="font-medium text-orange">{speedChoice.timeline}</span>.{" "}
                    </>
                  ) : null}
                  Смета ниже собрана под это.
                </>
              }
              changed={
                // Список честный: показываем только то, что реально
                // изменилось от данных ответов, иначе обещание не сходится
                // с тем, что посетитель увидит ниже.
                [
                  budgetChoice ? "Тариф подсвечен" : null,
                  speedChoice ? "График пересчитан" : null,
                  "Финал уточнён",
                ].filter(Boolean) as string[]
              }
              onReset={() => {
                if (budget) setBudget(budget);
                if (speed) setSpeed(speed);
              }}
              resetLabel="Сбросить бюджет и срок"
            />
          ) : null}
        </AnimatePresence>
      }
    >
      <div className="space-y-8">
        <div>
          <Appear from="up" delay={DIRECTION_BEAT.content}>
            <span className={`${EYEBROW} text-white/70`}>
              Сколько готовы вложить
            </span>
          </Appear>
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-4">
            {BUDGET_CHOICES.map((c, i) => (
              <PersonaChip
                key={c.id}
                label={c.label}
                hint={c.hint}
                on={budget === c.id}
                idle={!budget}
                index={i}
                onClick={() => setBudget(c.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <Appear from="up" delay={DIRECTION_BEAT.content}>
            <span className={`${EYEBROW} text-white/70`}>
              К какой дате нужно
            </span>
          </Appear>
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-4">
            {SPEED_CHOICES.map((c, i) => (
              <PersonaChip
                key={c.id}
                label={c.label}
                hint={c.hint}
                on={speed === c.id}
                idle={!speed}
                index={i}
                onClick={() => setSpeed(c.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </PersonaShell>
  );
}
