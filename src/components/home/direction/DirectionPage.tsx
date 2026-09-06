"use client";

import DirectionBackdrop from "./DirectionBackdrop";
import DirectionHero from "./DirectionHero";
import { DirectionTaskProvider } from "./TaskContext";
import StatsBand from "./blocks/StatsBand";
import TaskPicker from "./blocks/TaskPicker";
import PersonaBudget from "./blocks/PersonaBudget";
import PersonaAssets from "./blocks/PersonaAssets";
import AudienceBlock from "./blocks/AudienceBlock";
import CasesBlock from "./blocks/CasesBlock";
import PricingBlock from "./blocks/PricingBlock";
import WhyBlock from "./blocks/WhyBlock";
import ProcessBlock from "./blocks/ProcessBlock";
import FaqBlock from "./blocks/FaqBlock";
import CloseBlock from "./blocks/CloseBlock";
import type { DirectionContent } from "./types";

// Страница направления внутри /content — одна на все направления.
//
// Механика взята с ruvision.ru, фирстиль наш. Ключевые решения, о которых
// стоит помнить при правках:
//
// 1. Между блоками нет разделительных линий. Границу держат воздух и смена
//    раскладки: заголовок то слева и липкий, то по центру, то справа. Егор
//    убрал линии как «съедающие лёгкость», и вернуть их — значит вернуть
//    ощущение ленты одинаковых секций.
// 2. Ни один блок не появляется целиком. Внутри каждого работает общая
//    хореография BEAT: надзаголовок → заголовок → поясняющая строка →
//    содержание → действие. Триггером служит попадание блока в экран (см.
//    SectionStage), а сами анимации — те же <Appear>, что на /content, /ai,
//    /sites и /smm.
// 3. Ровно один печатающийся элемент на страницу — либо заголовок героя,
//    либо заголовок процесса. Курсор в нескольких местах читается как шум.
// 4. Фон есть у КАЖДОГО блока: длинный отрывок нашей работы или стоковый
//    кадр, сильно притушенные. Блоков без фона больше нет — пустая секция
//    читалась как широкая чёрная полоса между картинками, и Егор просил их
//    убрать. Ритм держится не пустотой, а чередованием: содержательные
//    блоки идут на работах, «бумажные» (смета, процесс, FAQ) — на стоке.
//    Соседние фоны перекрываются и растворяются друг в друге (см.
//    BlockMedia), поэтому стыка между блоками не видно вообще.
// 5. Персонализация разнесена по странице тремя шагами: задача вверху,
//    бюджет со сроком вплотную перед сметой, материалы клиента перед
//    финалом. Каждый шаг спрашивает НОВОЕ — три одинаковых вопроса читались
//    бы как три формы заявки подряд. Ответы живут в одном контексте (см.
//    TaskContext), на них реагируют смета, кейсы, срок и финал, а в конце из
//    них собирается готовое сообщение для Telegram.
//
// Обёртка .content-warm-headings переводит все .kw на странице в
// магента→оранжевый — родной градиент /content (см. globals.css).
export default function DirectionPage({ content }: { content: DirectionContent }) {
  return (
    <DirectionTaskProvider tasks={content.tasks} title={content.hero.eyebrow}>
      <div className="content-warm-headings relative">
        <DirectionBackdrop from={content.backdrop.from} to={content.backdrop.to} />

        <DirectionHero hero={content.hero} />
        <StatsBand stats={content.stats} media={content.statsMedia} />
        <TaskPicker
          prompt={content.taskPrompt}
          note={content.taskNote}
          media={content.taskMedia}
        />
        <AudienceBlock audience={content.audience} />
        <CasesBlock cases={content.cases} />
        <PersonaBudget media={content.budgetMedia} />
        <PricingBlock pricing={content.pricing} />
        {content.why ? <WhyBlock why={content.why} /> : null}
        <ProcessBlock process={content.process} />
        <FaqBlock faq={content.faq} />
        <PersonaAssets media={content.assetsMedia} />
        <CloseBlock close={content.close} />
      </div>
    </DirectionTaskProvider>
  );
}
