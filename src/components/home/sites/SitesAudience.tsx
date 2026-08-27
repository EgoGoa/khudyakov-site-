"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";

// Chapter 03 — "who this is for" (brief §5). No case cards here on purpose:
// worksByCategory.sites is empty and the brief is explicit that an empty
// portfolio with placeholder cards works against trust more than skipping the
// section entirely (see §6 of content/site-copy.md) — so unlike AiSegments,
// this chapter stays to the three segments alone until real cases exist.

const SEGMENTS = [
  {
    tag: "01 · МАЛЫЙ БИЗНЕС",
    title: "Услуги без раздутого бюджета",
    description: "Нужен сайт-визитка или лендинг — без штата разработчиков и без долгого ожидания.",
  },
  {
    tag: "02 · ЛИЧНЫЙ БРЕНД",
    title: "Быстрый запуск под задачу",
    description: "Курс, консультации, портфолио — сайт нужен сейчас, а не через два месяца согласований.",
  },
  {
    tag: "03 · СТАРТАП",
    title: "Проверить нишу лендингом",
    description: "Тестируете гипотезу одной страницей, не вкладываясь в полноценную разработку с нуля.",
  },
];

export default function SitesAudience() {
  return (
    <CinematicSection
      index={2}
      chapter="03"
      title="Кому подходит"
      icon="target"
      side="left"
      entrance="rise"
      id="audience"
      spacious
      intro="Малому бизнесу, личному бренду и стартапам, которым нужен результат быстрее классической разработки."
      decor={
        <SitesDecoIcon
          src="/images/icons/sites/target.png"
          size={210}
          rotate={-9}
          pulse
          z={5}
          className="right-2 -top-4 opacity-90 lg:right-6"
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {SEGMENTS.map((s) => (
          <div key={s.tag} className="rounded-2xl bg-ink/45 p-5 backdrop-blur-md">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-glow">{s.tag}</span>
            <h3 className="mt-2.5 font-display text-lg uppercase leading-tight tracking-tight text-white">
              {s.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-paper/65">{s.description}</p>
          </div>
        ))}
      </div>
    </CinematicSection>
  );
}
