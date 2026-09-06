"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import { CHAPTER_INTRO, EYEBROW } from "@/lib/typography";
import SectionStage from "./SectionStage";
import BlockMedia, { MEDIA_TEXT } from "./BlockMedia";
import type { BlockMediaSpec } from "./types";

// Общая оболочка блока персонализации.
//
// Таких блоков на странице три (задача → бюджет и срок → материалы), и они
// обязаны выглядеть как один механизм, а не как три разные формы. Поэтому
// шапка, кнопки, световая волна активации и подтверждение живут здесь, а
// каждый конкретный блок отдаёт только свои вопросы и свой итог.
//
// Решения, за которыми стоит прямая просьба Егора:
//
// 1. Вопрос набран заголовком главы. Персонализация — смысловой центр
//    страницы, а не подпись над чипами: «этот блок он основной, прям нужно
//    сделать как заголовок».
// 2. Кнопки светятся неоном и пульсируют, ПОКА на шаг не ответили.
//    Пульсация — приглашение нажать; после ответа она гаснет, иначе блок
//    продолжал бы дёргать внимание уже без причины.
// 3. Под кнопками стоит объяснение, что произойдёт после нажатия. Без него
//    непонятно, зачем нажимать, и блок читается как ещё один фильтр.
// 4. После нажатия по ряду кнопок проходит световая волна. Это ответ на
//    «после нажатия должна происходить активация интересная»: посетитель
//    должен видеть, что страница откликнулась, а не просто подсветила
//    кнопку.

/** Номер шага воронки. Показывается в надзаголовке — так три блока читаются
 *  как один маршрут, а не как три независимые формы. */
export type PersonaStepNo = 1 | 2 | 3;

export function PersonaShell({
  step,
  prompt,
  note,
  media,
  /** Прошёл ли шаг — от этого гаснет пульсация кнопок. */
  answered,
  children,
  result,
}: {
  step: PersonaStepNo;
  prompt: string;
  note: string;
  media?: BlockMediaSpec;
  answered: boolean;
  children: ReactNode;
  result?: ReactNode;
}) {
  return (
    <SectionStage className="relative py-20 sm:py-24">
      {media ? <BlockMedia media={media} /> : null}

      <Container className={`text-center ${MEDIA_TEXT}`}>
        <Appear from="up" delay={BEAT.eyebrow}>
          {/* Прогресс воронки — полосками, а не строкой «шаг 1 из 3».
              Раньше номер шага стоял цифрой прямо в надзаголовке; на узком
              экране строка переносилась и число повисало отдельной строкой
              под словом «ИЗ» — Егор показал это на скриншоте. Три полоски
              не участвуют в переносе текста и одновременно показывают
              больше: сколько шагов позади и сколько осталось. */}
          <span className={`${EYEBROW} inline-flex flex-wrap items-center justify-center gap-3 text-rec`}>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rec" />
              Персонализация
            </span>
            <span className="inline-flex items-center gap-1" aria-hidden="true">
              {([1, 2, 3] as const).map((n) => (
                <span
                  key={n}
                  className={`h-[3px] w-6 rounded-full transition-colors duration-300 ${
                    n <= step ? "bg-[linear-gradient(90deg,#ff4fd8,#ff6a3d)]" : "bg-paper/20"
                  }`}
                />
              ))}
            </span>
            <span className="sr-only">{`Шаг ${step} из 3`}</span>
            <span aria-hidden="true" className="tabular-nums text-white/60">
              {step} / 3
            </span>
          </span>
        </Appear>

        <Appear from="up" delay={BEAT.title}>
          <h2 className="chapter-neon-warm mx-auto mt-4 max-w-4xl break-words font-display text-[1.7rem] uppercase leading-[0.98] tracking-tight sm:text-[2.8rem] lg:text-[3.2rem]">
            {prompt}
          </h2>
        </Appear>

        <Appear from="up" delay={BEAT.intro}>
          <p className={`mx-auto mt-6 max-w-[34em] ${CHAPTER_INTRO}`}>{note}</p>
        </Appear>

        {/* Обёртка нужна ради волны: она рисуется поверх всего ряда кнопок,
            а не внутри одной из них. */}
        <div className="relative mx-auto mt-10 max-w-4xl">
          <AnimatePresence>
            {answered ? (
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0.9, x: "-120%" }}
                animate={{ opacity: 0, x: "120%" }}
                transition={{ duration: 0.9, ease: EASE }}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-orange/35 to-transparent blur-xl"
              />
            ) : null}
          </AnimatePresence>

          {children}
        </div>

        {result}
      </Container>
    </SectionStage>
  );
}

/** Одна кнопка выбора. Общая для всех трёх шагов — включая внешний вид
 *  «применено», чтобы состояние читалось одинаково по всей странице. */
export function PersonaChip({
  label,
  hint,
  on,
  idle,
  index,
  onClick,
}: {
  label: string;
  hint: string;
  on: boolean;
  /** Пульсировать ли — то есть звать нажать. */
  idle: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <Appear from="up" delay={BEAT.content + index * STAGGER.normal}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className={`task-chip glass-panel group h-full min-w-[12rem] rounded-2xl px-6 py-5 text-left transition duration-300 ${
          on ? "task-chip-on glass-panel-on" : idle ? "task-chip-idle" : ""
        }`}
        // Разбег, чтобы кнопки пульсировали волной, а не хором.
        style={{ animationDelay: `${index * 0.45}s` }}
      >
        <span
          className={`block font-display text-base uppercase leading-tight tracking-tight sm:text-lg ${
            on ? "text-orange" : "text-white"
          }`}
        >
          {label}
        </span>
        <span className="mt-2 block text-[13px] leading-snug text-white">{hint}</span>

        {/* Явная метка состояния: одного цвета обводки мало, чтобы понять,
            какой именно ответ сейчас применён. */}
        <span
          className={`mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
            on ? "text-orange" : "text-white/70 group-hover:text-orange"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-orange" : "bg-paper/40"}`} />
          {on ? "Применено" : "Выбрать"}
        </span>
      </button>
    </Appear>
  );
}

/** Список того, что пересобралось после ответа. Списком, а не одной фразой:
 *  посетитель должен видеть масштаб, иначе выбор читается как косметика. */
export function PersonaResult({
  lead,
  changed,
  onReset,
  resetLabel = "Сбросить и посмотреть всё",
  children,
}: {
  lead: ReactNode;
  changed: string[];
  onReset?: () => void;
  resetLabel?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto mt-10 max-w-[42em]"
    >
      <p className="text-[15px] leading-relaxed text-white">{lead}</p>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {changed.map((label, i) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.35, ease: EASE }}
            className="rounded-full border border-orange/40 bg-orange/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-orange"
          >
            {label}
          </motion.li>
        ))}
      </ul>

      {children}

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 underline-offset-4 transition hover:text-orange hover:underline"
        >
          {resetLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
