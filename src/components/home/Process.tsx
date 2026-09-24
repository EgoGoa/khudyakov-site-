"use client";

import type { ReactNode } from "react";
import CinematicSection from "@/components/ui/CinematicSection";
import TeamAskCard from "@/components/home/TeamAskCard";
import Appear from "@/components/ui/Appear";
import PromoCard from "@/components/home/PromoCard";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { briefHrefFor } from "@/lib/brief";
import { TEAM } from "@/lib/team";

// Chapter 05 on /content (the deck position `index`/`chapter` default to).
// Six steps instead of the earlier three broad phases — the same path from
// brief to delivery, just told at the grain a first-time client actually
// asks about (when do we sign, when do you shoot, who approves the cut)
// rather than three headline phases. One line per step keeps six cards
// inside a single screen; the icon badge is what lets six short lines still
// read as six distinct moments instead of a list.
//
// The steps below are content's own production pipeline (quote → contract →
// preproduction → shoot → post → delivery) — genuinely shoot-specific
// wording ("Съёмки", "Препродакшн"), not the universal-across-services text
// the old comment here claimed. A page for a different service (see /ai)
// passes its own `steps`/`title`/`intro` instead of reusing these; `index`
// and `chapter` are also props (defaulted to content's own position) so the
// chapter header highlights correctly regardless of where it sits in a
// different deck.

export type ProcessStepItem = {
  title: string;
  description: string;
  icon: ReactNode;
  /** 2–3 short sub-actions that make up this step, rendered as a small
   *  looping "story" above the card text — see StepStory below. */
  beats: { icon: string; label: string }[];
};

/** The top-of-card diagram: `beats` connect left-to-right with a drawing
 *  line and close on a pulsing checkmark, staggered so each chip's own
 *  ai-seq fade-in/hold/fade-out lands at a different point in the shared
 *  5.6s loop — the same "one beat at a time" read as AiThumb's chat/text
 *  shapes, just built from text+icon chips so it scales to every step on
 *  every page's process chapter instead of needing bespoke SVG per step. */
function StepStory({ beats }: { beats: ProcessStepItem["beats"] }) {
  const stagger = 5.6 / (beats.length + 0.6);
  return (
    <div className="relative z-10 flex min-w-0 items-center justify-center gap-0.5">
      {beats.map((beat, i) => (
        <div key={beat.label} className="flex min-w-0 items-center gap-0.5">
          {i > 0 && (
            <span
              className="step-story-line block h-px w-1.5 shrink-0 sm:w-2"
              style={{
                background: "var(--process-glow-border, rgba(255,255,255,0.4))",
                animationDelay: `${i * stagger - 0.25}s`,
              }}
            />
          )}
          {/* px-1.5/gap-0.5/text-[6px], down from px-2/gap-1/text-[7px] — the
              three chips plus connecting lines and the closing checkmark
              were overflowing the card's own top panel at the original
              size (worst case ~338px of content in a ~295px box, clipped
              symmetrically on both edges since the row is centered) on
              longer labels like "Раскадровка"/"Локации"/"Кастинг". Egor's
              ask: nothing should overflow its own card, so this shrinks
              until the widest real combination on the site fits. */}
          <span
            className="step-story-chip inline-flex min-w-0 items-center gap-0.5 rounded-full bg-white/[0.07] px-1.5 py-0.5 ring-1 ring-white/[0.12]"
            style={{ animationDelay: `${i * stagger}s` }}
          >
            <span className="shrink-0 text-[9px] leading-none">{beat.icon}</span>
            <span className="truncate font-display text-[6px] uppercase leading-none tracking-[0.04em] text-white/80">
              {beat.label}
            </span>
          </span>
        </div>
      ))}
      <span
        className="step-story-check ml-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[6px] text-ink"
        style={{
          background: "var(--process-glow-border, rgba(52,211,153,0.9))",
          animationDelay: `${beats.length * stagger}s`,
        }}
      >
        ✓
      </span>
    </div>
  );
}

export function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange/30 bg-orange/15 text-orange">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </span>
  );
}

const STEPS = [
  {
    title: "Разбор задачи",
    description:
      "Бесплатный созвон: цель, аудитория, бюджет, референсы. Дальше — 2–3 концепции со сценарной канвой, чтобы вы увидели ролик до оплаты.",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4M8 12.5h8M8 16h5" />
      </StepIcon>
    ),
    beats: [
      { icon: "🎯", label: "Цель" },
      { icon: "👥", label: "Аудитория" },
      { icon: "📋", label: "2–3 концепции" },
    ],
  },
  {
    title: "Смета и договор",
    description:
      "Фиксируем смету по строкам и даты каждого этапа. Работа стартует после договора и ТЗ. Скрытых доплат нет: всё сверх сметы — отдельно и до, не после.",
    icon: (
      <StepIcon>
        <path d="M4 20 15.5 8.5l3.8-3.8a1.4 1.4 0 0 1 2 2L17.5 10.5 6 22H4v-2z" />
        <path d="M13 10.5 17.5 15" />
      </StepIcon>
    ),
    beats: [
      { icon: "📝", label: "Концепция" },
      { icon: "💰", label: "Смета" },
      { icon: "✍️", label: "Договор" },
    ],
  },
  {
    title: "Подготовка к смене",
    description:
      "Раскадровка, локации, реквизит, кастинг. Постановочный план расписан по часам — съёмочный день идёт по нему, не по импровизации на площадке.",
    icon: (
      <StepIcon>
        <rect x="3.5" y="4" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17M8 4v5.5M14.5 14h3" />
      </StepIcon>
    ),
    beats: [
      { icon: "🎬", label: "Раскадровка" },
      { icon: "📍", label: "Локации" },
      { icon: "🎭", label: "Кастинг" },
    ],
  },
  {
    title: "Съёмочная смена",
    description:
      "Снимаем по раскадровке, свет и оборудование — под задачу кадра. Вы можете быть на площадке и видеть материал на плейбэке сразу, не через неделю в монтаже.",
    icon: (
      <StepIcon>
        <rect x="3" y="7" width="13" height="11" rx="2" />
        <path d="M16 10.2 21 7.5v9L16 13.8" />
      </StepIcon>
    ),
    beats: [
      { icon: "🎥", label: "Съёмка" },
      { icon: "💡", label: "Свет" },
      { icon: "▶", label: "Плейбэк" },
    ],
  },
  {
    title: "Монтаж и постпродакшн",
    description:
      "Собираем ролик под ритм и посыл, добавляем графику, где она усиливает историю. Цветокоррекция, диктор, музыка — сведение до уровня федеральной рекламы.",
    icon: (
      <StepIcon>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M3 9.5h5M3 15h5M16 9.5h5M16 15h5" />
      </StepIcon>
    ),
    beats: [
      { icon: "✂️", label: "Монтаж" },
      { icon: "🎨", label: "Графика" },
      { icon: "🎚", label: "Сведение" },
    ],
  },
  {
    title: "Правки и передача",
    description:
      "Показываем черновой монтаж, собираем правки — 2–3 круга включены в стоимость. Отдаём финальные файлы во всех форматах: YouTube, соцсети, ТВ, наружка.",
    icon: (
      <StepIcon>
        <path d="M20 6 9 17l-5-5" />
      </StepIcon>
    ),
    beats: [
      { icon: "👁", label: "Черновик" },
      { icon: "🔁", label: "Правки" },
      { icon: "📦", label: "Финал" },
    ],
  },
];

export default function Process({
  footer,
  middleSlot,
  index = 4,
  chapter = "05",
  title = "PRO хронология",
  intro = "Шесть шагов от брифа до сдачи. На каждом вы видите прогресс и можете вносить правки.",
  steps = STEPS,
  spacious = false,
}: {
  /** Окошко услуги внизу главы — см. ToolSpotlight. Необязательно:
   *  эту главу используют несколько страниц, и окошко есть не у всех. */
  footer?: ReactNode;
  /** /content: замена средней карточки нижнего ряда (вместо карточки Вадима). */
  middleSlot?: ReactNode;
  index?: number;
  chapter?: string;
  /** ReactNode rather than string so a page can put a gradient keyword
   *  span inside its heading — /ai does (see its page.tsx). */
  title?: ReactNode;
  intro?: ReactNode;
  steps?: ProcessStepItem[];
  /** See CinematicSection's own prop — /sites opts in, other pages don't. */
  spacious?: boolean;
}) {
  const { active } = useService();
  // A third specialist per page (past the two Close.tsx already carries),
  // tied to what this chapter is actually about — production/edit timeline.
  // /ai already has Dima on Close, so Process picks Max there instead, to
  // spread across three different faces rather than repeating one.
  const processPerson = active === "ai" ? TEAM.max : TEAM.dima;
  return (
    <CinematicSection
      footer={footer}
      index={index}
      chapter={chapter}
      title={title}
      side="right"
      entrance="slide-right"
      id="process"
      intro={intro}
      spacious={spacious}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {steps.map((step, i) => (
          <Appear
            key={`${index}-${i}`}
            from="up"
            delay={BEAT.content + i * STAGGER.tight}
            className="process-step-card flex h-full flex-col overflow-hidden rounded-2xl bg-ink/45 backdrop-blur-md"
          >
            {/* Top graphic: a looping, self-contained diagram rather than the
                small corner badge this used to be — Egor's ask, same spirit
                as the carousel decks (AiDeck etc.) where every card animates
                on its own loop. Was a ghost step number + sweeping scan
                light + pulse ring; now a small "story" of the step's own
                sub-actions (see StepStory) so the top of the card actually
                explains what happens in this step, not just decorates it.
                The step's own icon badge used to sit above the story and
                doubled its height for no extra information (the beat chips
                already say what the step does) — Egor's ask: drop it, let
                the story sit right under the border on its own, so six
                cards read as compact rows again instead of pushing the
                team/promo row below the fold. */}
            <div className="process-step-visual relative flex h-14 shrink-0 items-center justify-center overflow-hidden border-b border-white/10 px-3">
              <StepStory beats={step.beats} />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                <span className="mr-1.5 text-orange">{String(i + 1).padStart(2, "0")}</span>
                {step.title}
              </h3>
              <p className="body-small mt-2">{step.description}</p>
            </div>
          </Appear>
        ))}
      </div>

      {/* The step grid above leaves the row under it mostly empty — six
          short cards plus a right-aligned FunnelCta bar never fill the
          chapter's own width. On /content that space now holds a second
          promo card (Egor's ask: the September offer PromoCard already
          carries on chapter 03 fits here too, for a different service —
          image video instead of AI-video, cyan instead of the page's warm
          magenta→orange so the two banners don't read as one repeated).
          Other pages keep the original single centred/right FunnelCta bar
          untouched. */}
      {active === "content" ? (
        // Same three-column grid the step cards above use — Egor's ask: the
        // promo card and the two team cards read as one row, same width as
        // the steps, not a wide banner plus a narrow sidebar.
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Appear from="up" delay={BEAT.cta} className="h-full">
            <PromoCard
              palette="cyan"
              image="/images/service-video.jpg"
              badge="Акция только в сентябре"
              title="Имиджевое видео"
              subtitle="Что входит в акцию сентября:"
              details={[
                "— имиджевое видео по вашему сценарию;",
                "— адаптация под вертикаль и горизонталь;",
                "— 2 круга правок без доплаты;",
                "— обложки и нарезки под Reels, сразу готовые к публикации.",
              ]}
              price="42 000 ₽"
              oldPrice="60 000 ₽"
              href="/content/image"
              leadPrefill={{
                format: "Имиджевое видео",
                wishes: "Акция сентября — 30-секундный имиджевый ролик за 42 000 ₽",
              }}
              decor={
                <span className="process-promo-deco pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
                  <span className="process-promo-deco-icon process-promo-deco-1">✋</span>
                  <span className="process-promo-deco-icon process-promo-deco-2">✨</span>
                  <span className="process-promo-deco-icon process-promo-deco-3">🎬</span>
                </span>
              }
            />
          </Appear>
          <Appear from="up" delay={BEAT.cta} className="h-full">
            {middleSlot ?? <TeamAskCard
              member={processPerson}
              // Compact variant only shows `question`, not `pitch` — the
              // whole reply has to live in one string here.
              question="Создаю то, что снять камерой невозможно. На связи!"
              pitch="Отвечу быстрее, чем вы заполните бриф — вопросы по монтажу и срокам."
              actionLabel="Заполнить бриф"
              href={briefHrefFor(active)}
              compact
              glow={false}
              className="h-full"
            />}
          </Appear>
          <Appear from="up" delay={BEAT.cta} className="h-full">
            <TeamAskCard
              member={TEAM.egor}
              // Card already shows "Егор · генеральный продюсер" above this
              // line (member.name/role) — no need to repeat his name here.
              question="Работаем индивидуально — раскрываем именно ваш потенциал, а не шаблон."
              pitch="Готов созвониться — разберём проект голосом, если так удобнее."
              actionLabel="Созвониться"
              compact
              glow={false}
              className="h-full"
            />
          </Appear>
        </div>
      ) : active === "ai" ? (
        // Max's card sits beside the September offer, on the same plane,
        // instead of stacked above it (Egor's ask) — the same side-by-side
        // row /content's chapter already uses for its own team+promo
        // pairing, just two columns since /ai only carries one team card
        // here. Photo is a stock shot actually showing AI-generated
        // visuals (was the generic service-ai.jpg, Egor's ask, applied
        // site-wide). Priced off the same real budget figure already
        // published on this page's own portfolio chapter (AiPortfolio's
        // "Личный бренд / Стартап" case — AI-generated promo content —
        // "от 75 000 ₽") rather than the unrelated cheapest tariff:
        // 75 000 → 60 000 ₽ at 20% off.
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Appear from="up" delay={BEAT.cta} className="h-full">
            <TeamAskCard
              member={processPerson}
              question="Отвечу по этапам быстрее, чем вы заполните бриф — прямо в переписке"
              pitch="Отвечу быстрее, чем вы заполните бриф — прямо сейчас, в переписке."
              actionLabel="Заполнить бриф"
              href={briefHrefFor(active)}
              compact
              className="h-full"
            />
          </Appear>
          <Appear from="up" delay={BEAT.cta} className="h-full">
            <PromoCard
              image="/images/stock/hologram-laptop.webp"
              badge="Акция сентября"
              title="AI-генерация видео и фото"
              subtitle="Контент под бренд без съёмочной группы: продуктовые ролики, аватары, визуалы для соцсетей."
              price="60 000 ₽"
              oldPrice="75 000 ₽"
              href={briefHrefFor(active)}
              leadPrefill={{ format: "AI-генерация видео и фото", wishes: "Акция сентября — пилот за 60 000 ₽ вместо 75 000 ₽" }}
            />
          </Appear>
        </div>
      ) : (
        <Appear from="up" delay={BEAT.cta}>
          <TeamAskCard
            member={processPerson}
            question="Отвечу по этапам быстрее, чем вы заполните бриф — прямо в переписке"
            pitch="Отвечу быстрее, чем вы заполните бриф — прямо сейчас, в переписке."
            actionLabel="Заполнить бриф"
            href={briefHrefFor(active)}
            compact
            className="mt-5 lg:ml-auto lg:max-w-sm"
          />
        </Appear>
      )}
    </CinematicSection>
  );
}
