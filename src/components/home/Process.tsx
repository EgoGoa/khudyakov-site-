"use client";

import type { ReactNode } from "react";
import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";

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

export type ProcessStepItem = { title: string; description: string; icon: ReactNode };

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
    title: "Оценка проекта",
    description: "Бриф и консультация — предлагаем 2–3 концепции бесплатно.",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4M8 12.5h8M8 16h5" />
      </StepIcon>
    ),
  },
  {
    title: "Подписание договора",
    description: "Утверждаем смету, сроки и ТЗ — работаем после согласования.",
    icon: (
      <StepIcon>
        <path d="M4 20 15.5 8.5l3.8-3.8a1.4 1.4 0 0 1 2 2L17.5 10.5 6 22H4v-2z" />
        <path d="M13 10.5 17.5 15" />
      </StepIcon>
    ),
  },
  {
    title: "Препродакшн",
    description: "Прорабатываем сценарий, локации и кастинг.",
    icon: (
      <StepIcon>
        <rect x="3.5" y="4" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17M8 4v5.5M14.5 14h3" />
      </StepIcon>
    ),
  },
  {
    title: "Съёмки",
    description: "Снимаем по утверждённому сценарию в назначенный день.",
    icon: (
      <StepIcon>
        <rect x="3" y="7" width="13" height="11" rx="2" />
        <path d="M16 10.2 21 7.5v9L16 13.8" />
      </StepIcon>
    ),
  },
  {
    title: "Постпродакшн",
    description: "Монтаж, графика, цветокоррекция и саунд-дизайн.",
    icon: (
      <StepIcon>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M3 9.5h5M3 15h5M16 9.5h5M16 15h5" />
      </StepIcon>
    ),
  },
  {
    title: "Правки и сдача",
    description: "2–3 круга правок, затем передаём готовый ролик.",
    icon: (
      <StepIcon>
        <path d="M20 6 9 17l-5-5" />
      </StepIcon>
    ),
  },
];

export default function Process({
  index = 4,
  chapter = "05",
  title = "PRO хронология",
  intro = "Шесть шагов от брифа до сдачи. На каждом вы видите прогресс и можете вносить правки.",
  steps = STEPS,
  spacious = false,
}: {
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
  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title={title}
      icon="route"
      side="right"
      entrance="slide-right"
      id="process"
      intro={intro}
      spacious={spacious}
      // Process is shared across /ai, /sites, /smm too (each passes its own
      // title/intro/steps) — this orange-red icon is content's own.
      decor={
        active === "content" ? (
          <ContentDecoIcon
            src="/images/icons/content/workflow.png"
            // Halved from 240 at Egor's request — at full size the circular
            // arrows crowded the "PRO ХРОНОЛОГИЯ" heading beside them rather
            // than sitting as a decoration next to it.
            size={120}
            rotate={10}
            variant={3}
            className="left-[7%] top-0"
          />
        ) : undefined
      }
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {steps.map((step, i) => (
          <Appear
            key={`${index}-${i}`}
            from="up"
            delay={BEAT.content + i * STAGGER.tight}
            className="rounded-2xl bg-ink/45 p-5 backdrop-blur-md"
          >
            {step.icon}
            <h3 className="mt-3 font-display text-sm uppercase leading-tight tracking-tight text-white">
              <span className="mr-1.5 text-orange">{String(i + 1).padStart(2, "0")}</span>
              {step.title}
            </h3>
            <p className="mt-1.5 text-xs leading-snug text-paper/65">{step.description}</p>
          </Appear>
        ))}
      </div>

      <Appear from="up" delay={BEAT.cta}>
        <FunnelCta
          item="brief"
          align="right"
          size="sm"
          eyebrow="Готовы начать?"
          headline="Первый шаг"
          accent="5 минут"
          pitch="Дальше — 2–3 концепции и смета за 3–5 дней, бесплатно."
          className="mt-5"
        />
      </Appear>
    </CinematicSection>
  );
}
