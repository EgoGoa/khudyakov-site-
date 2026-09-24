"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import { directionDeep } from "@/components/home/ai/spotlightDirections";
import { withAccent } from "../Accent";

// Развёрнутое окошко между главами страницы направления.
//
// Отдельная сущность от ToolSpotlight (та табличка стоит внутри блока,
// свёрнута до клика и живёт своей высотой). Здесь ровно наоборот: сцена и
// текст видны сразу, без клика.
//
// Источник данных — directionDeep(slug): те же шесть тезисов (4 базовых +
// 2 расширенных), что и в раскрывающемся окне героя (ServiceDeepDive), с
// теми же нарисованными сценами (CONTENT_SCENES[`${slug}:deep`]). Ничего
// не сочиняется заново — правка тезиса в одном месте меняет и карточку на
// /content, и это окошко, и раскрывающееся окно.
//
// Каждое из четырёх окошек стартует со своего тезиса (`start`), поэтому на
// первый взгляд читается ровно тот смысл, что задуман для этого места
// страницы, а дальше само переключается на следующий — так текст и цифра
// не стоят мёртвым грузом, а сцена периодически «оживает» новым сюжетом.
// Пауза на hover — посетитель, который читает конкретный тезис, не должен
// терять место.
//
// Слабые устройства и медленная сеть (html[data-lite], см. lib/lite.ts)
// уже гасят .sp-spin/.sp-pulse и держат animation-iteration-count:1 через
// globals.css — здесь то же самое правило: сама смена тезисов
// останавливается, окошко замирает на первом кадре, сцена остаётся, лишнего
// движения нет.
const BEAT_MS = 6400;

export default function InfoWindow({
  slug,
  /** С какого тезиса начинает это окошко — 0..5 (см. directionDeep). */
  start,
  accent,
  side = "left",
  ctaHref = "/brief",
  ctaLabel = "Обсудить свой формат",
}: {
  slug: string;
  start: number;
  accent: { from: string; to: string };
  /** С какой стороны сцена: чередование даёт странице ритм, а не колонку
   *  одинаковых карточек. */
  side?: "left" | "right";
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const data = directionDeep(slug);
  const steps = data?.benefits.length ?? 0;
  const [step, setStep] = useState(start);
  const [held, setHeld] = useState(false);
  const [lite, setLite] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setLite(document.documentElement.hasAttribute("data-lite"));
  }, []);

  useEffect(() => {
    if (held || reduced || lite || steps < 2) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), BEAT_MS);
    return () => window.clearInterval(id);
  }, [held, reduced, lite, steps]);

  if (!data) return null;
  const benefit = data.benefits[step % steps];
  const reverse = side === "right";

  return (
    <SectionStage className="relative py-14 sm:py-20">
      <Container>
        <div
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
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
            {/* Смена сцены — своя AnimatePresence внутри SpotlightScene,
                кросс-фейд уже встроен, здесь дублировать не нужно. */}
            <SpotlightScene slug={data.slug} step={step} />
          </Appear>

          <Appear
            from={reverse ? "left" : "right"}
            delay={DIRECTION_BEAT.eyebrow + STAGGER.normal}
            className="min-w-0 flex-1 lg:min-h-[230px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: reduced || lite ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced || lite ? 0 : -8, transition: { duration: reduced || lite ? 0 : 0.2 } }}
                transition={{ duration: reduced || lite ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="spotlight-accent font-display text-xs uppercase tracking-[0.15em]">
                  {benefit.label}
                </span>
                <h3 className="mt-3 break-words font-display text-xl uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {benefit.punch}
                </h3>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85">
                  {withAccent(benefit.text, benefit.accent)}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Тезисы сменяются сами — точки ниже показывают, где мы в
                цикле, и дают управление руками, не дожидаясь автосмены. */}
            {steps > 1 ? (
              <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="Тезисы">
                {data.benefits.map((b, i) => (
                  <button
                    key={b.label + i}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    aria-label={b.label}
                    onClick={() => setStep(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === step ? 20 : 6,
                      background: i === step ? "var(--sp-from)" : "rgba(255,255,255,0.22)",
                    }}
                  />
                ))}
              </div>
            ) : null}

            <Link
              href={ctaHref}
              className="mt-6 inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.15em] text-white transition hover:text-orange"
            >
              {ctaLabel}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Appear>
        </div>
      </Container>
    </SectionStage>
  );
}
