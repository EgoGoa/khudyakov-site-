"use client";

import Link from "next/link";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import SmmChapterLayout, { SMM_PANEL } from "@/components/home/smm/SmmChapterLayout";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";
import { SMM_PROCESS_STEPS } from "@/components/home/smm/smmProcessSteps";

// Chapter 04 of /smm — the five steps from audit to report.
//
// A /smm-only component rather than the shared <Process>, for the same reason
// SmmOffer exists: Process is rendered unchanged by /ai, /sites and /content.
// The steps are the same SMM_PROCESS_STEPS data the shared component was
// being handed; only the composition is this page's.
//
// The steps are numbered here rather than only iconed. In the shared
// component they sit in a row where position carries the order; stacked in a
// narrow right-hand column that cue disappears, and a process is the one kind
// of list where the order *is* the information.
//
// This is the reel's shortest phase (19.64 → 23.44, the quiet beat under the
// shooting star) — five short rows is exactly what fits a screen that is only
// on for a few seconds before the next hold.
//
// Steps cascade one at a time (STAGGER.tight, lib/motion.ts) rather than the
// whole <ol> arriving together, `as="li"` so each row stays a direct child of
// the list.

export default function SmmProcess() {
  return (
    <CinematicSection
      index={3}
      chapter="04"
      title="Как проходит работа"
      side="right"
      entrance="slide-right"
      id="process"
      spacious
      column
      headless
      /* Top-right, above the steps panel and only grazing its upper corner —
         the exact box Egor marked, measured against this chapter's own
         container (`relative mx-auto max-w-7xl`) and written in px rather
         than Tailwind's 4px steps, which could not land it. A first pass at
         -top-16 sat 54px low. It first sat at the panel's bottom-right, where
         it covered the last two steps' right edge; that corner of the frame is
         also the busiest part of this phase's footage, while the space above
         the panel is empty in both the layout and the shot. */
      bodyDecor={
        <SmmDecoIcon
          src="/images/icons/smm/strategy.png"
          size={185}
          rotate={-8}
          className="right-[18px] -top-[118px]"
        />
      }
    >
      <SmmChapterLayout
        number="04"
        title={
          <>
            Как проходит
            <br />
            <span className="kw">работа</span>
          </>
        }
        sub={
          <>
            <span className="smm-accent">Пять шагов</span> от аудита до отчёта — на каждом понятный
            результат и точка согласования.
          </>
        }
        primary={{ href: "/brief", label: "Заполнить бриф" }}
        secondary={{ href: "/smm/pricing", label: "Смотреть цены" }}
      >
        {/* Same fix as SmmOffer's list: the panel now arrives on the same
            beat as the first row instead of popping in early and empty. */}
        <Appear from="right" delay={BEAT.content} blurPx={12} as="div">
        <ol className={`${SMM_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SMM_PROCESS_STEPS.map((step, i) => (
            <Appear
              key={step.title}
              as="li"
              from="right"
              delay={BEAT.content + i * STAGGER.tight}
              duration={DUR.row}
              blur
              blurPx={10}
              className="flex items-start gap-4 py-3.5"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[10px]"
                style={{
                  borderColor: "rgba(168,85,247,0.35)",
                  color: "#e4d0ff",
                  boxShadow: "inset 0 0 10px rgba(168,85,247,0.18)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-paper/55">{step.description}</p>
              </div>
            </Appear>
          ))}
        </ol>
        </Appear>

        {/* The two link-outs to /smm/cases and /smm/pricing, as one quiet row
            under the steps. They were two full-width cards below the deck, on
            flat black with no film behind them; Egor first moved that strip
            into chapter 06 and then here, which is the better home — this
            chapter ends on "отчёт и корректировка", so "вот кейсы, вот цены"
            reads as the next thing to look at rather than as competition for
            the packages chapter 06 exists to sell. Kept as text links, not
            cards: the chapter already carries a heading, a support line, five
            steps and two actions, and two more panels would be the crowding
            he asked to avoid. */}
        <Appear from="up" delay={BEAT.cta}>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/smm/cases"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/60 transition-colors hover:text-[#c4a0ff]"
            >
              Кейсы SMM
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>

            <span className="hidden h-1 w-1 rounded-full bg-paper/25 sm:block" aria-hidden="true" />

            <Link
              href="/smm/pricing"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/60 transition-colors hover:text-[#c4a0ff]"
            >
              Все пакеты подробно
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </Appear>
      </SmmChapterLayout>
    </CinematicSection>
  );
}
