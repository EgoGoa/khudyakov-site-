"use client";

import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import { directionSpotlight } from "@/components/home/ai/spotlightDirections";

// Развёрнутое окошко между главами страницы направления.
//
// Отдельная сущность от ToolSpotlight (та табличка стоит внутри блока,
// свёрнута до клика и живёт своей высотой). Здесь ровно наоборот: сцена и
// текст видны сразу, без клика — постоянная анимация самой графики
// (sp-pulse/sp-flow/sp-spin внутри SpotlightScene) и есть тот «живой»
// эффект, а не раскрытие по действию посетителя.
//
// Одно окошко = один тезис. Четыре штуки, вручную расставленные между
// главами DirectionPage, читаются как воздух между блоками, который вместо
// пустоты несёт содержание. Тезисы и сцены берутся из того же источника
// правды, что и карточки на /content (spotlightDirections.ts,
// SpotlightScenesContent.tsx) — направление, для которого там есть запись,
// получает окошки автоматически, без дублирования текста.
export default function InfoWindow({
  slug,
  index,
  accent,
  side = "left",
}: {
  slug: string;
  /** Какой из тезисов направления показать — 0..3. */
  index: number;
  accent: { from: string; to: string };
  /** С какой стороны сцена: чередование даёт странице ритм, а не колонку
   *  одинаковых карточек. */
  side?: "left" | "right";
}) {
  const data = directionSpotlight(slug);
  if (!data) return null;
  const benefit = data.benefits[index % data.benefits.length];
  const reverse = side === "right";

  return (
    <SectionStage className="relative py-14 sm:py-20">
      <Container>
        <div
          className={`glass-panel relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-7 lg:items-center lg:gap-10 lg:p-9 ${
            reverse ? "lg:flex-row-reverse" : "lg:flex-row"
          }`}
          style={{ "--sp-from": accent.from, "--sp-to": accent.to } as React.CSSProperties}
        >
          <Appear
            from={reverse ? "right" : "left"}
            delay={DIRECTION_BEAT.eyebrow}
            className="relative aspect-[340/210] w-full shrink-0 overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 lg:w-[42%]"
          >
            <SpotlightScene slug={slug} step={index} />
          </Appear>
          <Appear
            from={reverse ? "left" : "right"}
            delay={DIRECTION_BEAT.eyebrow + STAGGER.normal}
            className="min-w-0 flex-1"
          >
            <span className="spotlight-accent font-display text-xs uppercase tracking-[0.15em]">
              {benefit.label}
            </span>
            <h3 className="mt-2 break-words font-display text-2xl uppercase leading-tight text-white sm:text-3xl">
              {benefit.punch}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">{benefit.text}</p>
          </Appear>
        </div>
      </Container>
    </SectionStage>
  );
}
