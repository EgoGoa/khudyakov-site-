"use client";

import DirectionBackdrop from "./DirectionBackdrop";
import DirectionHero from "./DirectionHero";
import { DirectionTaskProvider } from "./TaskContext";
import TechBlock from "./blocks/TechBlock";
import PricingBlock from "./blocks/PricingBlock";
import ProcessBlock from "./blocks/ProcessBlock";
import FaqCloseBlock from "./blocks/FaqCloseBlock";
import type { SmmServiceContent } from "./types";

// Страница одной услуги SMM — /smm/[service]. Пять экранов вместо семи у
// CompactToolPage: герой(+цифры) → рынок → смета → процесс → FAQ+финал.
//
// Нет TaskPicker и, соответственно, DirectionTaskProvider получает пустой
// список задач — Егор попросил свести страницу до пяти блоков, и первым
// уходит именно шаг персонализации, а не один из содержательных блоков.
// PricingBlock/ProcessBlock/FaqCloseBlock всё равно читают контекст (через
// useDirectionTask) ради подсветки тарифа по умолчанию и т.п. — с пустыми
// tasks они падают на дефолтное поведение («задача ещё не выбрана»), это
// штатный случай самого провайдера (см. его комментарий в TaskContext.tsx).
//
// TechBlock рендерит `market` — тот же компонент, что «под капотом» у
// компактных AI-инструментов, но по смыслу это не техническая спецификация,
// а рыночный контекст услуги (см. SmmServiceContent в types.ts).
export default function SmmServicePage({
  content,
  headingClass = "smm-violet-headings",
}: {
  content: SmmServiceContent;
  headingClass?: string;
}) {
  return (
    <DirectionTaskProvider title={content.hero.eyebrow}>
      <div className={`${headingClass} relative [overflow-x:clip]`}>
        <DirectionBackdrop from={content.backdrop.from} to={content.backdrop.to} />

        <DirectionHero hero={content.hero} stats={content.stats} />
        <TechBlock tech={content.market} />
        <PricingBlock pricing={content.pricing} />
        <ProcessBlock process={content.process} />
        <FaqCloseBlock faq={content.faq} close={content.close} />
      </div>
    </DirectionTaskProvider>
  );
}
