"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";

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
      icon="code"
      side="right"
      entrance="slide-right"
      id="method"
      spacious
      intro="Просто быстрее и дешевле классической разработки — для малого бизнеса, личного бренда и стартапов."
      decor={
        <SitesDecoIcon
          src="/images/icons/sites/bolt.png"
          size={260}
          rotate={10}
          className="right-4 -top-2 lg:right-10"
        />
      }
    >
      <div className="overflow-x-auto rounded-2xl bg-ink/45 backdrop-blur-md">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-paper/15">
              <th scope="col" className="p-3.5 font-mono font-normal uppercase tracking-[0.1em] text-paper/40">
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
                  <td key={i} className={`p-3.5 leading-snug ${i === 2 ? "text-white" : "text-paper/60"}`}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {SEGMENTS.map((s) => (
          <span
            key={s.tag}
            className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-ink/45 px-3.5 py-2 backdrop-blur-md"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-glow">{s.tag}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-paper/30" />
            <span className="font-display text-[11px] uppercase leading-tight tracking-tight text-white">
              {s.title}
            </span>
          </span>
        ))}
      </div>
    </CinematicSection>
  );
}
