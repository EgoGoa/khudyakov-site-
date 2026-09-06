"use client";

import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia, { MEDIA_TEXT } from "../BlockMedia";
import { withAccent } from "../Accent";
import { SPEED_CHOICES, useDirectionTask } from "../TaskContext";
import type { DirectionContent } from "../types";
import { EYEBROW } from "@/lib/typography";

// Процесс. Заголовок липкий слева, шаги едут мимо него справа — читается
// как «пока идёт производство, задача остаётся та же».
//
// Вместо номера в кружке — сплошная вертикальная линия через все шаги с
// точкой на каждом: это одна непрерывная работа, а не пять отдельных
// пунктов меню. Линия рисуется псевдоэлементом фона, а не отдельным
// элементом, чтобы не появлялась в разметке пустая декоративная колонка.
//
// Реакция на сквозной выбор: над шагами появляется срок именно под
// выбранную задачу. Это то, что человек хочет знать про процесс в первую
// очередь, и до выбора мы честно не знаем ответа.
export default function ProcessBlock({
  process,
}: {
  process: DirectionContent["process"];
}) {
  const { active, speed } = useDirectionTask();

  // Шаг 2 спрашивает про дату прямо, шаг 1 — только выводит срок из типа
  // задачи. Прямой ответ точнее, поэтому он перебивает.
  const timeline = SPEED_CHOICES.find((c) => c.id === speed)?.timeline ?? active?.timeline;

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {process.media ? <BlockMedia media={process.media} /> : null}

      <Container>
        <div className="lg:grid lg:grid-cols-[34%_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              head={process}
              typed={process.typed}
              titleClassName="text-[2rem] sm:text-[2.6rem] lg:text-[2.9rem]"
            />

            <AnimatePresence mode="wait">
              {timeline ? (
                <motion.div
                  key={timeline}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="glass-panel glass-panel-on mt-10 rounded-2xl p-6"
                >
                  <span className={`${EYEBROW} text-white`}>
                    Срок под вашу задачу
                  </span>
                  <p className="mt-3 font-display text-xl uppercase leading-tight tracking-tight text-orange">
                    {timeline}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <ol className="mt-14 lg:mt-0">
            {process.steps.map((step, i) => (
              <Appear
                key={step.number}
                as="li"
                from="up"
                delay={DIRECTION_BEAT.content + i * STAGGER.tight}
              >
                <div className={`relative grid gap-2 pb-12 pl-10 sm:grid-cols-[1fr] lg:pl-14 ${MEDIA_TEXT}`}>
                  {/* Линия и точка. Линия обрывается на последнем шаге,
                      иначе она уходит в пустоту под блоком. */}
                  <span
                    className={`absolute left-[7px] top-3 w-px bg-gradient-to-b from-orange/50 to-orange/10 lg:left-[11px] ${
                      i === process.steps.length - 1 ? "h-0" : "h-full"
                    }`}
                  />
                  <span className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-orange bg-ink lg:left-1" />

                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-orange">
                      {step.number}
                    </span>
                    <h3 className="font-display text-lg uppercase leading-tight tracking-tight text-white sm:text-xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 max-w-[44em] text-[15px] leading-relaxed text-white">
                    {withAccent(step.text, step.accent)}
                  </p>
                </div>
              </Appear>
            ))}
          </ol>
        </div>
      </Container>
    </SectionStage>
  );
}
