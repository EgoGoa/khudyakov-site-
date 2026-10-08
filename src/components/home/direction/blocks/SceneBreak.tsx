"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear, { useChapterActive } from "@/components/ui/Appear";
import TeamConsultModal from "@/components/home/TeamConsultModal";
import { TEAM } from "@/lib/team";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import { BareCtx } from "@/components/home/ai/sceneKit";
import { CONTENT_SCENES, SCENE_FIGURES } from "@/components/home/ai/SpotlightScenesContent";
import { directionSpotlight } from "@/components/home/ai/spotlightDirections";
import SectionStage from "../SectionStage";
import BlockMedia from "../BlockMedia";
import { withAccent } from "../Accent";
import { BIG_SCENES } from "./sceneBreakScenes";
import { AI_BREAK_SCENES } from "./aiBreakScenes";
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
  const Big = (BIG_SCENES[slug] ?? AI_BREAK_SCENES[slug])?.[index];
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
              // На телефоне без внутренних полей у всех сцен (раньше только у
              // AI): схема шире — подписи крупнее. scene-big поднимает самые
              // мелкие подписи сцен «Контента» на телефоне (globals.css).
              <div className={`tool-scene absolute inset-0 p-0 sm:p-4 ${AI_BREAK_SCENES[slug] ? "" : "scene-big"}`}>
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

export default function SceneBreak({
  slug,
  index,
  spec,
  backdrop,
}: {
  slug: string;
  index: number;
  total: number;
  spec: DirectionSceneBreak;
  backdrop: { from: string; to: string };
}) {
  const [consult, setConsult] = useState(false);
  const data = directionSpotlight(slug);
  const member = TEAM[spec.memberId];
  // Страницы AI-инструментов несут текст окна в самих данных (spec.own):
  // окошка услуги на /content у них нет.
  const own = spec.own;
  const figure = own ? { value: own.value, note: own.note } : SCENE_FIGURES[slug]?.[index];
  const benefit = own ? { label: own.label, text: own.text, accent: own.accent, title: undefined } : data?.benefits[index];
  if (!figure || !benefit) return null;
  const accent = data?.accent ?? backdrop;

  return (
    <SectionStage className="relative py-10 sm:py-14">
      <BlockMedia media={{ gradient: accent, intensity: "medium" }} />

      <Container>
        <Appear from="up" delay={DIRECTION_BEAT.eyebrow}>
          <div
            style={{ "--sp-from": accent.from, "--sp-to": accent.to } as React.CSSProperties}
            className="glass-panel grid gap-6 rounded-3xl p-4 shadow-[0_0_90px_-30px_var(--sp-from)] sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-8"
          >
            {/* Графика тянется на всю высоту текстовой колонки (lg), а на
                телефоне держит пропорцию сцены 400×380. */}
            {/* У всех сцен на телефоне графика без внутренних полей и чуть
                шире колонки: вьюбокс сжимается меньше, подписи крупнее. */}
            {/* Заголовок окошка — о чём оно (Егор): вместо счётчика
                «02 / 04 · …», который он убрал со всех табличек. */}
            <h3 className="font-display text-lg uppercase leading-tight tracking-tight text-white sm:text-xl lg:col-span-2">
              <span className="spotlight-accent spotlight-sheen">{benefit.title ?? benefit.label}</span>
            </h3>
            <div
              className="relative -mx-2 aspect-[400/380] w-[calc(100%+1rem)] overflow-hidden rounded-2xl bg-white/[0.025] ring-1 ring-white/10 sm:mx-0 sm:w-full lg:aspect-auto lg:min-h-[28rem]"
            >
              <Scene slug={slug} index={index} />
            </div>

            <div className="flex min-w-0 flex-col justify-center py-1">
              <Appear from="right" delay={DIRECTION_BEAT.intro}>
                {/* Короткие цифры («60%», «450+») получают крупный кегль —
                    акцент, которого Егор попросил больше; длинные («до
                    встречи») остаются на уменьшенном, чтобы держаться одной
                    строкой (его же более ранняя правка — тут это не
                    отменяется, а сосуществует). */}
                <div
                  className={`spotlight-accent spotlight-sheen whitespace-nowrap font-display uppercase leading-[1.04] tracking-tight ${
                    figure.value.length > 6
                      ? "text-[1.7rem] sm:text-[2.05rem] xl:text-[2.4rem]"
                      : "text-[2.7rem] sm:text-[3.4rem] xl:text-[3.9rem]"
                  }`}
                >
                  {figure.value}
                </div>
                <h3 className="mt-2 font-display text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-[1.35rem]">
                  {figure.note}
                </h3>
              </Appear>

              <Appear from="up" delay={DIRECTION_BEAT.content}>
                <p className="mt-4 max-w-[34em] font-display text-[13px] leading-snug tracking-tight text-white/65 sm:text-sm">
                  {withAccent(benefit.text, benefit.accent)}
                </p>
              </Appear>

              {/* Три факта в две колонки (телефон): третий во всю ширину,
                  а не сиротой в половине ряда. */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/12 pt-4 sm:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
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
                      кнопку здесь, обычное неоновое кольцо .btn-neon.
                      .scene-cta (Егор, 2026-10-08): та же прозрачная кнопка,
                      но ярче — белый текст и кольцо в цвете страницы, иначе
                      главная кнопка окна читалась неактивной. */}
                  <button type="button" onClick={() => setConsult(true)} className="btn-neon scene-cta !py-3">
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
