"use client";

import DirectionBackdrop from "./DirectionBackdrop";
import DirectionHero from "./DirectionHero";
import { DirectionTaskProvider } from "./TaskContext";
import TaskPicker from "./blocks/TaskPicker";
import AudienceBlock from "./blocks/AudienceBlock";
import TechBlock from "./blocks/TechBlock";
import PricingBlock from "./blocks/PricingBlock";
import ProcessBlock from "./blocks/ProcessBlock";
import FaqCloseBlock from "./blocks/FaqCloseBlock";
import type { CompactToolContent } from "./types";

// Компактная страница AI-инструмента — 7 экранов вместо 12 у DirectionPage.
//
// Существует отдельно от DirectionPage, а не как его режим с флагом
// `compact`, по одной причине: DirectionPage уже держит десять принятых
// страниц (пять направлений /content и пять инструментов agent/content/
// video/voice/ops), и вплетать в него условную ветку ради следующих пяти —
// повышать риск задеть то, что уже утверждено, ради того, что ещё не
// утверждено. Два отдельных, но однотипных компонента безопаснее одного с
// развилками внутри.
//
// Экономия идёт по двум путям, оба разобраны подробно в CompactToolContent
// (types.ts):
//   1. Настоящее сокращение — один шаг персонализации вместо трёх, блока
//      «почему мы» нет вовсе.
//   2. Слияние соседних смыслов в один экран — цифры внутри героя вместо
//      отдельной главы (проп `stats` у DirectionHero), FAQ и финал на одном
//      экране (FaqCloseBlock).
//
// Итоговый маршрут: герой(+цифры) → задача → кому подходит → под капотом →
// смета → процесс → FAQ+финал.
//
// `.ai-cool-headings` — тот же лайм-изумрудный акцент, что и у первых пяти
// инструментов: это всё ещё семья страниц /ai, отличается только длина.
export default function CompactToolPage({ content }: { content: CompactToolContent }) {
  return (
    <DirectionTaskProvider tasks={content.tasks} title={content.hero.eyebrow}>
      <div className="ai-cool-headings relative [overflow-x:clip]">
        <DirectionBackdrop from={content.backdrop.from} to={content.backdrop.to} />

        <DirectionHero hero={content.hero} stats={content.stats} />

        <TaskPicker
          prompt={content.taskPrompt}
          note={content.taskNote}
          media={content.taskMedia}
          totalSteps={1}
          changed={["Смета пересчитана", "Срок уточнён", "Финал переписан"]}
        />

        <AudienceBlock audience={content.audience} />
        <TechBlock tech={content.tech} />
        <PricingBlock pricing={content.pricing} />
        <ProcessBlock process={content.process} />
        <FaqCloseBlock faq={content.faq} close={content.close} />
      </div>
    </DirectionTaskProvider>
  );
}
