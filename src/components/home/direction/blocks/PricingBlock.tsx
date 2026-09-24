"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia, { MEDIA_TEXT } from "../BlockMedia";
import { BUDGET_CHOICES, SPEED_CHOICES, useDirectionTask } from "../TaskContext";
import TeamAskCard from "@/components/home/TeamAskCard";
import { PAGE_TEAM } from "@/lib/team";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { TEAM_PULSE } from "@/components/home/team-pulse/registry";
import type { DirectionContent } from "../types";
import { CHAPTER_INTRO, EYEBROW } from "@/lib/typography";

// Смета. Заголовок прижат вправо, карточки идут под ним слева — зеркально
// блоку «под чью задачу», где заголовок стоял слева. Именно чередование
// стороны не даёт странице читаться как лента одинаковых секций.
//
// Карточки тарифов теперь несут ту же вёрстку, что и .c3-card на /content,
// /ai, /sites и /smm (Close.tsx): та же стеклянная плашка с бордером,
// подъём и синее свечение по hover, тот же вход motion веером — Егор
// сравнил и заметил, что раньше сюда перенесли только кнопку, а карточка
// осталась на старом .glass-panel. .c3-card и цветное tier-glow-0/1/2 уже
// зашиты в globals.css под каждый акцент страницы (content/ai/sites/smm —
// см. .content-warm-headings, .ai-cool-headings и т.д.), поэтому подключение
// здесь просто подхватывает готовую тему по classList страницы.
//
// tier-glow-0/1/2 висит на всех трёх карточках всегда — ровно как на
// Close.tsx, где условие `active === "content"` истинно для всей страницы
// целиком, а не для одного тарифа. Первая версия здесь красила только
// подсвеченный под задачу тариф — свой, более «умный» вариант, который
// выглядел как «работает только средний тариф»: два других вообще не
// светились. Егор поймал это и попросил вернуть механику 1:1: три тарифа
// светятся все три, а персонализация (см. `on` ниже) добавляет к своему
// тарифу только бейдж «Под вашу задачу» и усиленный акцент у цены — сверху,
// а не вместо.
//
// Реакция на сквозной выбор: подсвечивается тариф под выбранную задачу, а не
// тот, что помечен `pro` по умолчанию. Карточка выбранного тарифа получает
// подпись, объясняющую, почему подсвечена именно она — подсветка без
// объяснения выглядит как продажа сверху вниз.
const TEAM_KEY_BY_HEADING: Record<string, keyof typeof PAGE_TEAM> = {
  "content-warm-headings": "content",
  "ai-cool-headings": "ai",
  "sites-warm-headings": "sites",
  "smm-violet-headings": "smm",
};

export default function PricingBlock({
  pricing,
  headingClass = "content-warm-headings",
}: {
  pricing: DirectionContent["pricing"];
  /** Класс заголовков текущей страницы — определяет, какую акцентную тему
   *  .c3-card подхватит (см. globals.css), и какая пара из команды встанет
   *  под смету (тот же PAGE_TEAM, что и на Close.tsx). */
  headingClass?: string;
}) {
  const { active, budget, speed } = useDirectionTask();
  const [primaryMember, secondaryMember] = PAGE_TEAM[TEAM_KEY_BY_HEADING[headingClass] ?? "content"];

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
    <div className={headingClass}>
    <SectionStage className="relative py-24 sm:py-32">
      {pricing.media ? <BlockMedia media={pricing.media} /> : null}

      <Container>
        <SectionHead head={pricing} />

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {pricing.tiers.map((tier, i) => {
            const on = tier.id === highlightId;
            return (
              // Appear, а не голый motion.div: у motion.div свой initial/
              // animate стартует в момент монтирования компонента, а
              // страница направления рендерит все блоки сразу и монтирует
              // их задолго до того, как посетитель до них долистает — вход
              // успевал доиграть ещё на подгрузке страницы, и к моменту
              // прокрутки у экрана оставалась только средняя карточка (у
              // неё смена tier-glow-класса при подсветке ловила отдельный
              // CSS-transition и читалась как «единственная анимация»).
              // Appear подписан на тот же ChapterActive от SectionStage,
              // что и остальные блоки страницы, — вход играет ровно тогда,
              // когда блок реально появился в кадре, у всех трёх карточек
              // одинаково.
              <Appear
                key={tier.id}
                from={i === 0 ? "left" : i === 2 ? "right" : "scale"}
                delay={DIRECTION_BEAT.content + i * STAGGER.normal}
                className={`c3-card tier-glow-${i} relative !min-h-0 !rounded-3xl !p-7 transition-transform ${
                  tier.pro ? "c3-card-pro" : ""
                } ${on ? "lg:-translate-y-2" : ""}`}
              >
                <AnimatePresence>
                  {on && (active || budgetChoice) ? (
                    <motion.span
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="absolute -top-3 left-8 z-10 rounded-full bg-orange px-3 py-1 font-display text-[9px] uppercase tracking-[0.16em] text-white"
                    >
                      Под вашу задачу
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                <span className={`${EYEBROW} c3-tier-small relative text-white`}>{tier.tagline}</span>
                <h3 className="c3-tier-large relative font-display uppercase leading-none tracking-tight">
                  {tier.name}
                </h3>
                <div className="tier-glow-price relative font-semibold text-paper text-2xl leading-none">
                  {tier.price}
                </div>

                <ul className="c3-list relative mt-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature}>
                      <span className="c3-check text-paper" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/brief"
                  className={`btn-neon btn-neon-breathe tier-glow-btn-${i} relative mt-2 w-full justify-center !font-bold`}
                >
                  Запросить смету
                </Link>
              </Appear>
            );
          })}
        </div>

        {/* Живая команда сразу под карточками — та же идея, что несёт
            Close.tsx на /content, /ai, /sites и /smm, но с настоящим
            вопросом и кнопкой у каждого, а не просто именем и стрелкой.
            Стоит выше сноски: это следующий шаг, а не мелкий текст внизу. */}
        <Appear from="up" delay={DIRECTION_BEAT.cta}>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
            <TeamAskCard
              compact
              member={primaryMember}
              question="Не уверены в бюджете?"
              pitch="Разберём задачу и посчитаем вилку бесплатно, до брифа."
              actionLabel={`Написать ${primaryMember.nameDative}`}
              href="/brief"
            />
            {/* Участник «как сервис» стоит своим уведомлением (TeamPulse) —
                Егор: «Сашу меняем везде». */}
            {TEAM_PULSE[secondaryMember.id] ? (
              <TeamPulse data={TEAM_PULSE[secondaryMember.id]} compact source="блок цен на странице формата" />
            ) : (
              <TeamAskCard
                compact
                member={secondaryMember}
                question="Какой тариф вам подойдёт?"
                pitch={`Помогу с ${secondaryMember.helpsWith}.`}
                actionLabel={`Написать ${secondaryMember.nameDative}`}
              />
            )}
          </div>
        </Appear>

        {/* Сноска про ориентировочные цифры — раньше мелкий текст внизу,
            теперь набрана тем же подзаголовочным начертанием (CHAPTER_INTRO),
            что несёт `sub` у каждой шапки блока на этой странице. */}
        <Appear from="up" delay={DIRECTION_BEAT.cta}>
          <p className={`mt-10 max-w-2xl ${CHAPTER_INTRO} ${MEDIA_TEXT}`}>
            <span className="text-orange">Важно: </span>
            {pricing.note}
          </p>
        </Appear>
      </Container>
    </SectionStage>
    </div>
  );
}

