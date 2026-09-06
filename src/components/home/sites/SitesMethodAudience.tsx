"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";
import { EYEBROW } from "@/lib/typography";

// Chapter 02 — merges the former SitesMethod and SitesAudience chapters into
// one screen. sites-reel.mp4 (Egor's second delivery for /sites) only cuts
// cleanly into 6 real scenes, not the 7 the page used to have — see the
// scene-detect + frame-by-frame check done when wiring CinematicStage below.
// Splitting a chapter mid-continuous-footage would put a blur hold where the
// film never actually cuts, which reads as a glitch rather than a beat, so
// the two chapters share the reel's one "arriving after the drive" phase
// instead. The comparison table carries the differentiation argument
// (unique to this chapter); the three "how it works" steps that used to sit
// above it are dropped since Process's own chapter covers that ground in
// more detail later on the same page. "Кому подходит" survives as a compact
// chip row rather than full cards, so the merged screen still fits one
// viewport on desktop.
//
// Laid out in chapter 01's language, which Egor asked to carry across the
// whole page: `headless`, so the chapter owns its own number and heading and
// can put them in a left column that centres against the content beside it
// rather than sitting in a header pinned above everything. Heading in the
// display face under one wide soft cyan halo, ordinary sentence-case support
// line, and the flat PILL/ROUND pair for actions instead of the site-wide
// `.btn-3d` key. The CTA is deliberately the calculator here rather than
// chapter 01's brief — this chapter's argument is about price and speed
// against the alternatives, so "рассчитать" is the question it just raised.

const COMPARE_COLS = ["Конструктор (Tilda/Wix)", "Классическая студия", "HDKV.AGENCY (AI)"];

const COMPARE_ROWS = [
  {
    label: "Уникальность дизайна",
    values: ["Шаблон", "Уникальный", "Уникальный"],
  },
  {
    label: "Срок",
    values: ["Быстро, но сами", "Недели–месяцы", "Дни"],
  },
  {
    label: "Код",
    values: ["Зависите от платформы", "Свой код", "Свой код — сайт ваш"],
  },
  {
    label: "Цена",
    values: ["Низкая", "Высокая", "Ниже классической, выше конструктора"],
  },
];

const SEGMENTS = [
  { tag: "МАЛЫЙ БИЗНЕС", title: "Услуги без раздутого бюджета" },
  { tag: "ЛИЧНЫЙ БРЕНД", title: "Быстрый запуск под задачу" },
  { tag: "СТАРТАП", title: "Проверить нишу лендингом" },
];

export default function SitesMethodAudience() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      title="Никакой магии"
      side="right"
      entrance="slide-right"
      id="method"
      spacious
      column
      headless
      /* Same move as chapter 01: the bolt used to hang top-right as a sticker
         in empty frame. It now bleeds off the left edge behind the comparison
         table, whose own bg-ink/45 + backdrop-blur frosts the overlapping
         half, so it reads as a layer under the content instead of a decal
         over it. */
      bodyDecor={
        <SitesDecoIcon
          src="/images/icons/sites/bolt.png"
          size={300}
          rotate={10}
          pulse
          delay={0.35}
          className="-left-28 -top-10 opacity-90 xl:-left-20"
        />
      }
    >
      {/* relative z-10 for the same reason as chapter 01: keep the absolutely
          positioned bodyDecor behind the content it sits under. */}
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14">
        <div className="w-full shrink-0 lg:w-[38%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className={`${EYEBROW} text-glow`}>02</span>
              <span className="h-px w-8 bg-glow/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-warm mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
              Никакой
              <br />
              <span className="kw">магии</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Просто быстрее и дешевле классической разработки — для малого бизнеса, личного бренда
              и стартапов.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex items-center gap-4">
              <Link href="/calculator" className={PILL}>
                Рассчитать бюджет
              </Link>
              <Link href="/brief" aria-label="Заполнить бриф" className={ROUND}>
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

        <div className="mt-10 lg:mt-0 lg:flex-1">
          <Appear from="right" delay={BEAT.content}>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.12] bg-white/[0.045] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl backdrop-saturate-150">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-paper/15">
                    <th
                      scope="col"
                      className="p-3.5 font-mono font-normal uppercase tracking-[0.1em] text-paper/40"
                    >
                      &nbsp;
                    </th>
                    {COMPARE_COLS.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`p-3.5 font-display font-normal uppercase leading-tight tracking-tight ${
                          i === 2 ? "text-glow" : "text-paper/70"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-paper/10 last:border-0">
                      <th scope="row" className="p-3.5 font-sans font-medium text-paper/85">
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={i}
                          className={`p-3.5 leading-snug ${i === 2 ? "text-white" : "text-paper/60"}`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Appear>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {SEGMENTS.map((s, i) => (
              <Appear
                key={s.tag}
                from="up"
                delay={BEAT.cta + i * STAGGER.tight}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 backdrop-blur-md"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-glow">
                  {s.tag}
                </span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-paper/30" />
                <span className="font-display text-[11px] uppercase leading-tight tracking-tight text-white">
                  {s.title}
                </span>
              </Appear>
            ))}
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
