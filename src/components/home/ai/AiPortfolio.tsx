"use client";

import Link from "next/link";
import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";

// Chapter 02 — no AI case has actually shipped yet (worksByCategory.ai is
// empty, see service-content.ts), so this used to be a grid of video tiles
// with [TODO] placeholders standing in for a date/runtime/title that don't
// exist. Showing a "Смотреть" button next to a video that isn't there was
// the actual problem, not just the visible [TODO] text — so instead of
// filling those fields with invented numbers, the tiles became four
// illustrative pilot scenarios (clearly framed as examples, no fake
// date/runtime/"Смотреть"). Swap this whole block back for <Works> (or a
// real tile grid) the moment worksByCategory.ai has real entries.
const SCENARIOS = [
  {
    format: "Чат-бот",
    title: "AI отвечает в директе и Telegram, пока менеджер занят",
    result: "Пример пилота: первая линия ответов на вопросы по наличию и доставке.",
  },
  {
    format: "Голосовой AI",
    title: "Запись на приём вне рабочих часов",
    result: "Пример пилота: приём заявок вечером и в выходные, синхронизация с расписанием.",
  },
  {
    format: "AI-видео",
    title: "Промо-ролик без съёмочной группы",
    result: "Пример пилота: серия тестовых креативов под гипотезу за дни, не за производственный цикл.",
  },
  {
    format: "AI в CRM",
    title: "Автоматическая квалификация лидов",
    result: "Пример пилота: горячие заявки — менеджеру сразу, остальные — в очередь на догрев.",
  },
];

export default function AiPortfolio() {
  return (
    <CinematicSection
      index={1}
      chapter="02"
      // One gradient keyword per chapter heading, at most — Egor's rule for
      // this page. Here it is the noun that names the chapter's subject.
      title={<>Портфолио <span className="kw">AI-работ</span></>}
      side="right"
      entrance="rise"
      id="portfolio"
      intro={<>Первые кейсы — в работе, показываем их по мере запуска. Пока — <span className="kw">примеры пилотов</span>, которые запускаем чаще всего.</>}
    >
      <div className="mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 [@media(max-height:860px)]:sm:gap-4">
        {SCENARIOS.map((s, idx) => (
          <Appear
            key={s.title}
            from="up"
            delay={BEAT.content + idx * STAGGER.normal}
            className="relative overflow-hidden rounded-2xl border border-paper/15 bg-ink-soft/60 p-5 sm:p-6"
          >
            <span className="font-display text-[10px] uppercase tracking-[0.12em] text-emerald-300">Пример · {s.format}</span>
            <p className="mt-2 text-base font-medium leading-snug text-paper">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{s.result}</p>
            <Link
              href="/brief"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/20 px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.08em] text-paper/60 transition-colors hover:border-emerald-300/60 hover:text-emerald-300"
            >
              Хочу так же
            </Link>
          </Appear>
        ))}
      </div>

      <Appear from="up" delay={BEAT.cta} className="mt-5">
        <p className="text-xs text-paper/40">
          Первые реальные AI-кейсы появятся здесь по мере запуска пилотов — заявки уже открыты.
        </p>
      </Appear>
    </CinematicSection>
  );
}
