"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, DUR, STAGGER } from "@/lib/motion";
import SmmChapterLayout from "@/components/home/smm/SmmChapterLayout";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";

// Chapter 02 of /smm — "продюсерский центр, не подрядчик".
//
// Replaces the shared <Trust> this page used to render with `clients={[]}`:
// Trust is a logo wall with a supporting line, and with no client logos to
// show it was a heading over empty space. The argument it was making — one
// team shoots, edits and runs the account — is the page's main
// differentiator, so it gets the comparison table treatment /sites chapter 02
// uses, where the difference is visible in one glance rather than asserted in
// a paragraph.
//
// The three columns are the real alternatives a client is choosing between,
// and only the last one is ours. Nothing in the table is a number: per
// content/site-copy.md no figures get invented until real cases land.
//
// This chapter owns the reel's longest phase (3.60 → 13.52 — the conversation
// in the club, see the PHASES table in (landing)/smm/page.tsx), which is why
// it carries the page's densest panel: there is time on screen to read it.
//
// The table itself blurs in as one panel rather than cascading row by row.
// A per-row cascade was tried and dropped: Motion animates `transform` by
// writing an inline `transform` style, and table rows are one of the few
// elements the CSS Transforms spec doesn't guarantee support for — even an
// identity transform can misbehave across engines once it's set on a <tr>.
// The segment pills below the table, a plain flex row rather than table
// markup, carry the cascade instead — see SEGMENTS below.

const COMPARE_COLS = ["Фрилансер", "SMM-агентство", "HDKV.AGENCY"];

const COMPARE_ROWS = [
  {
    label: "Кто снимает",
    values: ["Сам, на телефон", "Подрядчик со стороны", "Свои операторы и монтажёры"],
  },
  {
    label: "Качество картинки",
    values: ["Как получится", "Зависит от подрядчика", "Уровень рекламного ролика"],
  },
  {
    label: "Кто отвечает",
    values: ["Один человек", "Аккаунт-менеджер", "Продюсер проекта"],
  },
  {
    label: "Если человек ушёл",
    values: ["Всё встало", "Ищут замену", "Команда продолжает"],
  },
  {
    label: "Отчётность",
    values: ["По запросу", "Раз в месяц", "Каждую неделю"],
  },
];

const SEGMENTS = [
  { tag: "БРЕНД", title: "Постоянная лента без простоев" },
  { tag: "ЭКСПЕРТ", title: "Личный бренд на камеру" },
  { tag: "ЛОКАЛЬНЫЙ БИЗНЕС", title: "Заявки из соцсетей" },
];

export default function SmmMethod() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      title="Не подрядчик"
      side="right"
      entrance="slide-right"
      id="method"
      spacious
      column
      headless
      /* The rule for every deco icon on this page, from Egor after seeing
         the first pass: an icon sits *beside* the elements with a slight
         overlap — never over a heading or a line of text. The first attempt
         put this one at -left-28 -top-8, which landed the megaphone straight
         across "НЕ ПОДРЯДЧИК"; the second swung it out to the right edge,
         which fixed the collision but abandoned the empty top-left corner
         Egor actually pointed at. It now sits in that corner, above the
         chapter number, with only its lower edge reaching down toward the
         heading. z-0 against the chapter's z-10 keeps even that sliver behind
         the type rather than on it. */
      bodyDecor={
        <SmmDecoIcon
          src="/images/icons/smm/influencer.png"
          size={200}
          rotate={-8}
          className="left-0 -top-32 xl:left-4"
        />
      }
    >
      <SmmChapterLayout
        number="02"
        title={
          <>
            Не
            <br />
            <span className="kw">подрядчик</span>
          </>
        }
        sub={
          <>
            Соцсети ведёт <span className="smm-accent">та же команда</span>, что снимает рекламные
            ролики: одни операторы, монтажёры и продюсер на проекте.
          </>
        }
        primary={{ href: "/smm/cases", label: "Смотреть кейсы" }}
        secondary={{ href: "/brief", label: "Обсудить задачу" }}
      >
        <Appear from="right" delay={BEAT.content} blurPx={18}>
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
                        i === 2 ? "text-[#c4a0ff]" : "text-paper/70"
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

        {/* One beat after the table (BEAT.cta lands after content), then
            each pill cascades in on its own STAGGER.normal step rather than the
            row popping in as one block. */}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {SEGMENTS.map((s, i) => (
            <Appear
              key={s.tag}
              from="up"
              delay={BEAT.cta + i * STAGGER.normal}
              duration={DUR.row}
              blur
              blurPx={8}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 backdrop-blur-md">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#c4a0ff]">
                  {s.tag}
                </span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-paper/30" />
                <span className="font-display text-[11px] uppercase leading-tight tracking-tight text-white">
                  {s.title}
                </span>
              </span>
            </Appear>
          ))}
        </div>
      </SmmChapterLayout>
    </CinematicSection>
  );
}
