"use client";

import { useState } from "react";
import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";
import { PILL, ROUND } from "@/components/home/smm/SmmDeck";

// Chapter 05 — the terms plus a compact FAQ folded into one screen, the same
// shape AiGuarantees and SitesGuarantees use.
//
// Terms below are working defaults rather than ones Egor has confirmed
// against a real contract.
//
// Rebuilt in the page's chapter language: `headless`, so it renders its own
// number and heading into a left column that centres against the content
// beside it instead of a header pinned above everything; the heading in the
// display face under one wide violet bloom; and the flat PILL/ROUND pair for
// actions rather than the site-wide `.btn-3d` pressed key. It keeps its own
// two-panel right column (terms + FAQ side by side) rather than going through
// SmmChapterLayout, which takes a single child panel — same exception
// SitesGuarantees makes for the same reason.
//
// Both the terms list and the FAQ cascade one row at a time (STAGGER.tight,
// lib/motion.ts) rather than arriving as two blocks — they run on the same
// stagger step so the two columns settle together instead of one finishing
// well before the other.

const TERMS = [
  {
    title: "Фиксированный ежемесячный пакет",
    description: "Без доплат за «лишний» рилс в рамках согласованного объёма.",
  },
  {
    title: "Контент утверждается перед публикацией",
    description: "Ничего не выходит без вашего «да» — согласование в общем чате или таск-трекере.",
  },
  {
    title: "Отказ в любой момент",
    description: "Без длинных контрактов «в клетку» — предупреждение за один расчётный период.",
  },
  {
    title: "Отчёт каждую неделю",
    description: "Понятным языком: что сделано, что сработало, что меняем дальше.",
  },
];

const FAQ = [
  {
    q: "Кто снимает контент — вы или фрилансеры?",
    a: "Съёмочная команда внутри агентства: те же операторы и монтажёры, что делают рекламные ролики для других клиентов. Фрилансеры на стороне не привлекаются.",
  },
  {
    q: "Сколько стоит ведение соцсетей?",
    a: "Зависит от объёма съёмки и площадок. Ориентиры — в тарифах в следующей главе, точная смета — после короткого брифа.",
  },
  {
    q: "Как быстро появится первый контент?",
    a: "После аудита и согласования контент-плана — обычно на второй-третьей неделе работы, в зависимости от объёма съёмки.",
  },
  {
    q: "Можно начать с разового аудита?",
    a: "Да — разбираем аккаунт и показываем, что усилить в первую очередь, без обязательств по дальнейшему ведению.",
  },
];

export default function SmmGuarantees() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <CinematicSection
      index={4}
      chapter="05"
      title="Что входит"
      side="left"
      entrance="unfold"
      id="guarantees"
      spacious
      column
      headless
      /* Placed to the exact box Egor drew: the empty pocket above the
         heading, right of the "05" marker, its lower edge just reaching the
         top of "ВХОДИТ" — the slight overlap he asked for, and nothing more.
         Two earlier positions were rejected — beside the FAQ's first question
         (straight across a line of text, the one thing ruled out) and under
         the FAQ column (clear of the text but in the busiest corner of this
         phase's footage).
         The offsets are in px against the chapter's own container (`relative
         mx-auto max-w-7xl`, measured live) rather than in Tailwind's spacing
         steps, because a step of 4px could not land the box he marked. The
         container caps at max-w-7xl, so the pair holds from lg up. */
      bodyDecor={
        <SmmDecoIcon
          src="/images/icons/smm/handshake.png"
          size={160}
          rotate={7}
          className="left-[148px] -top-[42px]"
        />
      }
    >
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14">
        <div className="w-full shrink-0 lg:w-[38%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4a0ff]">05</span>
              <span className="h-px w-8 bg-[#a855f7]/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-violet mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
              Что
              <br />
              <span className="kw">входит</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Покупаете не пост и не рилс — покупаете <span className="smm-accent">систему
              ведения</span>, зафиксированную в договоре.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex items-center gap-4">
              <Link href="/brief" className={PILL}>
                Обсудить задачу
              </Link>
              <Link href="/smm/pricing" aria-label="Смотреть цены" className={ROUND}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </Link>
            </div>
          </Appear>
        </div>

        <div className="mt-10 lg:mt-0 lg:flex-1 lg:flex lg:items-start lg:gap-8">
          <ul className="lg:max-w-md lg:flex-1">
            {TERMS.map((term, i) => (
              <Appear
                key={term.title}
                as="li"
                from="left"
                delay={BEAT.content + i * STAGGER.tight}
                duration={DUR.row}
                blur
                blurPx={10}
                className="border-t border-paper/20 py-3"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-paper/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                      {term.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-paper/60">{term.description}</p>
                  </div>
                </div>
              </Appear>
            ))}
          </ul>

          <div className="mt-8 lg:mt-0 lg:w-[320px] lg:shrink-0 xl:w-[360px]">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">FAQ</span>
            <div className="mt-3 border-t border-paper/10">
              {FAQ.map((item, i) => {
                const isOpen = open === i;
                return (
                  <Appear
                    key={item.q}
                    from="right"
                    delay={BEAT.content + i * STAGGER.tight}
                    duration={DUR.row}
                    blur
                    blurPx={10}
                    className="border-b border-paper/10"
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 py-3 text-left"
                    >
                      <span className="text-sm font-medium leading-snug text-paper">{item.q}</span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/60 transition-transform duration-200 ${
                          isOpen ? "rotate-45 border-[#a855f7]/60 text-[#c4a0ff]" : ""
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="max-w-sm pb-3.5 text-xs leading-relaxed text-paper/55">{item.a}</p>
                    )}
                  </Appear>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
