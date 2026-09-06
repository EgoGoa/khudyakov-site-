"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia, { MEDIA_TEXT } from "../BlockMedia";
import { BUDGET_CHOICES, SPEED_CHOICES, useDirectionTask } from "../TaskContext";
import type { DirectionContent } from "../types";

// Смета. Заголовок прижат вправо, карточки идут под ним слева — зеркально
// блоку «под чью задачу», где заголовок стоял слева. Именно чередование
// стороны не даёт странице читаться как лента одинаковых секций.
//
// Реакция на сквозной выбор: подсвечивается тариф под выбранную задачу, а не
// тот, что помечен `pro` по умолчанию. Карточка выбранного тарифа получает
// подпись, объясняющую, почему подсвечена именно она — подсветка без
// объяснения выглядит как продажа сверху вниз.
export default function PricingBlock({
  pricing,
}: {
  pricing: DirectionContent["pricing"];
}) {
  const { active, budget, speed } = useDirectionTask();

  // Ответ про бюджет (шаг 2) сильнее ответа про задачу (шаг 1): он про
  // деньги напрямую, а задача — только косвенно. Поэтому он идёт первым в
  // цепочке, и посетитель, назвавший бюджет, видит именно свой тариф.
  //
  // Тарифы перечислены в смете по возрастанию цены, поэтому «минимальный →
  // первый, открытый → последний» — это позиция в списке, а не отдельное
  // поле в данных: иначе каждую страницу пришлось бы вручную связывать с
  // тремя вариантами бюджета.
  const byBudget =
    budget === "lean"
      ? pricing.tiers[0]?.id
      : budget === "open"
        ? pricing.tiers[pricing.tiers.length - 1]?.id
        : budget === "mid"
          ? pricing.tiers[Math.floor(pricing.tiers.length / 2)]?.id
          : undefined;

  const highlightId = byBudget ?? active?.tierId ?? pricing.tiers.find((t) => t.pro)?.id;
  const speedChoice = SPEED_CHOICES.find((c) => c.id === speed);
  const budgetChoice = BUDGET_CHOICES.find((c) => c.id === budget);

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {pricing.media ? <BlockMedia media={pricing.media} /> : null}

      <Container>
        <SectionHead head={pricing} />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {pricing.tiers.map((tier, i) => {
            const on = tier.id === highlightId;
            return (
              <Appear key={tier.id} from="up" delay={BEAT.content + i * STAGGER.normal}>
                <div
                  className={`glass-panel flex h-full flex-col rounded-3xl p-8 transition-all duration-500 ${
                    on
                      ? "glass-panel-on lg:-translate-y-3"
                      : ""
                  }`}
                >
                  <AnimatePresence>
                    {on && (active || budgetChoice) ? (
                      <motion.span
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute -top-3 left-8 rounded-full bg-orange px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white"
                      >
                        Под вашу задачу
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                    {tier.tagline}
                  </span>
                  <h3 className="mt-4 font-display text-2xl uppercase leading-none tracking-tight text-white">
                    {tier.name}
                  </h3>
                  <div
                    className={`mt-6 font-display text-2xl leading-none ${
                      on ? "text-orange" : "text-white"
                    }`}
                  >
                    {tier.price}
                  </div>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-relaxed text-white">
                        <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-orange" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/brief"
                    className={`mt-9 ${on ? "btn-neon btn-warm btn-3d" : "btn-neon btn-3d"}`}
                  >
                    Запросить смету
                  </Link>
                </div>
              </Appear>
            );
          })}
        </div>

        <Appear from="up" delay={BEAT.cta}>
          <p className={`mt-10 max-w-2xl text-xs leading-relaxed text-white ${MEDIA_TEXT}`}>{pricing.note}</p>
        </Appear>
      </Container>
    </SectionStage>
  );
}
