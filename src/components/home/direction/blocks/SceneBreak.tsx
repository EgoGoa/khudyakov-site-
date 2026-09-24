"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear, { useChapterActive } from "@/components/ui/Appear";
import TeamConsultModal from "@/components/home/TeamConsultModal";
import { TEAM } from "@/lib/team";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import { EYEBROW } from "@/lib/typography";
import { BareCtx } from "@/components/home/ai/sceneKit";
import { CONTENT_SCENES, SCENE_FIGURES } from "@/components/home/ai/SpotlightScenesContent";
import { directionSpotlight } from "@/components/home/ai/spotlightDirections";
import SectionStage from "../SectionStage";
import BlockMedia from "../BlockMedia";
import { withAccent } from "../Accent";
import { BIG_SCENES } from "./sceneBreakScenes";
import type { DirectionSceneBreak } from "../types";

// Блок-перебивка между разделами страницы направления: одна сцена из окошка
// услуги, развёрнутая в постоянное окно прямо в вёрстке. Слева графика на
// всю половину окна, справа — цифра, подпись, тезис, три факта и два
// действия: проконсультироваться (форма человеку команды) и заказать (бриф).
//
// Цифра и тезис — те же, что крутятся в окошке ToolSpotlight на /content
// (SpotlightScenesContent + spotlightDirections): один источник.
//
// Сцена монтируется только когда блок попал в экран: её сборка «элемент за
// элементом» — CSS-анимация на монтировании, и без этого она отыграла бы
// где-то ниже экрана, пока посетитель читает верх страницы.

/** Как часто сцена пересобирается заново. 18с — два прохода курсора
 *  времени (9с): сцена успевает собраться, пожить и только потом
 *  начинается следующий круг. */
const LOOP_MS = 18000;

function Scene({ slug, index }: { slug: string; index: number }) {
  const active = useChapterActive();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const Big = BIG_SCENES[slug]?.[index];
  const Small = CONTENT_SCENES[slug]?.[index];

  // Сцена живёт по кругу, пока её видно: собралась → пожила → растворилась
  // → собралась снова. За экраном круг стоит и ничего не стоит странице.
  useEffect(() => {
    if (!active || !visible || reduced) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => window.clearInterval(id);
  }, [active, visible, reduced]);

  return (
    <div ref={ref} className="absolute inset-0">
      {active ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cycle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {Big ? (
              <div className="tool-scene absolute inset-0 p-3 sm:p-4">
                <Big />
              </div>
            ) : Small ? (
              <BareCtx.Provider value>
                <div className="tool-scene absolute inset-0 flex items-center p-3">
                  <div className="aspect-[340/118] w-full">
                    <Small />
                  </div>
                </div>
              </BareCtx.Provider>
            ) : null}
          </motion.div>
        </AnimatePresence>
      ) : null}
    </div>
  );
}

export default function SceneBreak({ slug, index, spec }: { slug: string; index: number; spec: DirectionSceneBreak }) {
  const [consult, setConsult] = useState(false);
  const data = directionSpotlight(slug);
  const figure = SCENE_FIGURES[slug]?.[index];
  const benefit = data?.benefits[index];
  const member = TEAM[spec.memberId];
  if (!data || !figure || !benefit) return null;
  const total = data.benefits.length;

  return (
    <SectionStage className="relative py-20 sm:py-28">
      <BlockMedia media={{ gradient: data.accent, intensity: "medium" }} />

      <Container>
        <Appear from="up" delay={DIRECTION_BEAT.eyebrow}>
          <div
            style={{ "--sp-from": data.accent.from, "--sp-to": data.accent.to } as React.CSSProperties}
            className="glass-panel grid gap-6 rounded-3xl p-4 shadow-[0_0_90px_-30px_var(--sp-from)] sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-8"
          >
            {/* Графика тянется на всю высоту текстовой колонки (lg), а на
                телефоне держит пропорцию сцены 400×380. */}
            <div className="relative aspect-[400/380] w-full overflow-hidden rounded-2xl bg-white/[0.025] ring-1 ring-white/10 lg:aspect-auto lg:min-h-[28rem]">
              <Scene slug={slug} index={index} />
            </div>

            <div className="flex min-w-0 flex-col justify-center py-1">
              <Appear from="right" delay={DIRECTION_BEAT.title}>
                <span className={`${EYEBROW} flex items-center gap-2 text-sm text-rec sm:text-base`}>
                  <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full bg-rec" />
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {benefit.label}
                </span>
              </Appear>

              <Appear from="right" delay={DIRECTION_BEAT.intro}>
                {/* Короткие цифры («60%», «450+») получают крупный кегль —
                    акцент, которого Егор попросил больше; длинные («до
                    встречи») остаются на уменьшенном, чтобы держаться одной
                    строкой (его же более ранняя правка — тут это не
                    отменяется, а сосуществует). */}
                <div
                  className={`spotlight-accent spotlight-sheen mt-3 whitespace-nowrap font-display uppercase leading-[0.9] tracking-tight ${
                    figure.value.length > 6
                      ? "text-[1.7rem] sm:text-[2.05rem] xl:text-[2.4rem]"
                      : "text-[2.7rem] sm:text-[3.4rem] xl:text-[3.9rem]"
                  }`}
                >
                  {figure.value}
                </div>
                <h3 className="mt-2 font-display text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {figure.note}
                </h3>
              </Appear>

              <Appear from="up" delay={DIRECTION_BEAT.content}>
                <p className="mt-4 max-w-[34em] text-[15px] leading-relaxed text-white sm:text-base">
                  {withAccent(benefit.text, benefit.accent)}
                </p>
              </Appear>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/12 pt-4">
                {spec.facts.map((f, i) => (
                  <Appear key={f.label} from="up" delay={DIRECTION_BEAT.content + 0.15 + i * STAGGER.normal}>
                    <div className="relative pl-3">
                      <span className="absolute left-0 top-0.5 h-[calc(100%-0.25rem)] w-[3px] animate-pulse rounded-full bg-gradient-to-b from-[var(--sp-from)] via-[var(--sp-to)] to-transparent shadow-[0_0_10px_-1px_var(--sp-from)]" />
                      {/* Слова не рвутся посередине — то же правило, что у
                          цифр в SpotlightCopy: капслок на узкой колонке
                          обязан переноситься только между словами. Значение
                          длиннее «XX ЛЕТ» на телефоне (3 колонки в ~100px)
                          уже не помещается на text-lg — ступень ниже. */}
                      <div
                        className={`spotlight-accent font-display uppercase leading-none ${
                          f.value.length > 6 ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                        }`}
                        style={{ overflowWrap: "normal", wordBreak: "normal", hyphens: "none" }}
                      >
                        {f.value}
                      </div>
                      <div
                        className="mt-1.5 font-display text-[10px] uppercase leading-snug tracking-[0.06em] text-white sm:text-[11px]"
                        style={{ overflowWrap: "normal", wordBreak: "normal", hyphens: "none" }}
                      >
                        {f.label}
                      </div>
                    </div>
                  </Appear>
                ))}
              </div>

              <Appear from="up" delay={DIRECTION_BEAT.cta}>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {/* Без .btn-warm: на /content он превращается в сплошную
                      заливку розовый→оранж (content-warm-headings в
                      globals.css) — Егор попросил прозрачную минималистичную
                      кнопку здесь, обычное неоновое кольцо .btn-neon. */}
                  <button type="button" onClick={() => setConsult(true)} className="btn-neon !py-3">
                    Проконсультироваться
                  </button>
                </div>
              </Appear>
            </div>
          </div>
        </Appear>
      </Container>

      {member ? <TeamConsultModal open={consult} onClose={() => setConsult(false)} member={member} /> : null}
    </SectionStage>
  );
}
