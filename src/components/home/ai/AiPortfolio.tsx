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
] as const;

/** Живой блок справа от текста — тот же приём, что несёт AiThumb в колоде
 *  чуть выше по странице (те же .ai-a-* хуки из globals.css), но постоянно
 *  в цикле: у этих четырёх карточек нет выбора «какая активна», так что
 *  анимация не выключается ни у одной. Своя схема под каждый инструмент —
 *  не переиспользованная картинка на все четыре формата. */
function PilotGraphic({ format }: { format: (typeof SCENARIOS)[number]["format"] }) {
  const d = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });
  const dot = (cls = "bg-emerald-300/80", extra = "") => <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${cls} ${extra}`} />;

  return (
    <div className="ai-thumb-live relative flex h-full min-h-[132px] w-full flex-col justify-center gap-2 overflow-hidden rounded-xl border border-paper/10 bg-paper/[0.03] p-3">
      {format === "Чат-бот" && (
        <>
          {/* Директ и Telegram отвечают сами, пока менеджер занят — та же
              переписка, что и в колоде, без счётчика "24/7": тут это уже
              сказано текстом слева. */}
          <div className="ai-a-seq flex items-start gap-1.5" style={d(0)}>
            <span className="mt-0.5 block h-4 w-4 shrink-0 rounded-full bg-paper/15" />
            <span className="block w-[70%] rounded-lg rounded-bl-sm bg-paper/10 p-1.5">
              <span className="block h-1.5 w-[85%] rounded-[2px] bg-paper/22" />
            </span>
          </div>
          <span className="ai-a-seq ml-auto flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1.5 ring-1 ring-emerald-300/25" style={d(0.8)}>
            {dot("bg-emerald-300", "ai-a-typing")}
            {dot("bg-emerald-300", "ai-a-typing")}
            {dot("bg-emerald-300", "ai-a-typing")}
          </span>
          <span
            className="ai-a-seq ml-auto block w-[74%] rounded-lg rounded-br-sm bg-emerald-400/20 p-1.5 ring-1 ring-emerald-300/30"
            style={d(1.5)}
          >
            <span className="block h-1.5 w-[80%] rounded-[2px] bg-emerald-200/60" />
          </span>
        </>
      )}

      {format === "Голосовой AI" && (
        <>
          {/* Запись на приём вечером — волна принимает звонок, затем слот в
              расписании подсвечивается вне рабочих часов. */}
          <span className="relative block h-9 w-full">
            <span className="absolute inset-0 flex items-center justify-center gap-[3px]">
              {[10, 22, 34, 44, 30, 40, 20, 14].map((h, i) => (
                <span key={i} className="ai-a-wave block w-[3px] rounded-full bg-emerald-300" style={{ height: `${h}%`, ...d((i % 4) * 0.16) }} />
              ))}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            {["Пн", "Вт", "Ср", "Чт"].map((day, i) => (
              <span
                key={day}
                className={`grid h-5 w-5 place-items-center rounded-[3px] font-display text-[6px] ${i === 2 ? "ai-a-blink bg-emerald-400/30 text-emerald-100 ring-1 ring-emerald-300/40" : "bg-paper/[0.07] text-paper/40"}`}
              >
                {day}
              </span>
            ))}
          </div>
          <span className="ai-a-seq flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-emerald-200 ring-1 ring-emerald-300/30" style={d(1.6)}>
            <span aria-hidden="true">🕗</span>Ср, 21:40
          </span>
        </>
      )}

      {format === "AI-видео" && (
        <>
          {/* Рендер идёт без съёмочной группы: плеер играет, полоса кадров
              бежит, и в конце цикла падает бейдж "готово". */}
          <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-md bg-[linear-gradient(135deg,rgba(52,211,153,0.4),rgba(0,210,255,0.22))]">
            <span className="absolute inset-0 grid place-items-center">
              <span className="ai-a-blink grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-[8px] text-emerald-200 ring-1 ring-emerald-300/40">▶</span>
            </span>
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`ai-a-blink block h-3 flex-1 rounded-[2px] ${i === 2 ? "bg-emerald-400/45" : "bg-paper/[0.08]"}`} style={d(i * 0.25)} />
            ))}
          </div>
          <span className="ai-a-node flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-emerald-200 ring-1 ring-emerald-300/30" style={d(1.8)}>
            <span aria-hidden="true" className="ai-a-blink block h-1 w-1 rounded-full bg-emerald-300" />Креатив готов
          </span>
        </>
      )}

      {format === "AI в CRM" && (
        <>
          {/* Лид падает в воронку и сортируется сам — горячий поднимается в
              колонку "менеджеру", остальные остаются ждать очереди. */}
          <div className="grid grid-cols-2 gap-1.5">
            <span className="grid gap-1 rounded-md bg-emerald-400/15 p-1.5 ring-1 ring-emerald-300/35">
              <span className="block font-display text-[6px] uppercase tracking-[0.04em] text-emerald-200">Менеджеру</span>
              <span className="ai-a-lift block h-5 rounded-[3px] bg-emerald-400/30 ring-1 ring-emerald-300/40" />
            </span>
            <span className="grid gap-1 rounded-md bg-paper/[0.06] p-1.5">
              <span className="block font-display text-[6px] uppercase tracking-[0.04em] text-paper/35">На догрев</span>
              <span className="block h-5 rounded-[3px] bg-paper/[0.08]" />
              <span className="block h-5 rounded-[3px] bg-paper/[0.05]" />
            </span>
          </div>
          <span className="ai-a-seq flex items-center gap-1.5" style={d(1.2)}>
            <span className="ai-a-blink rounded-full bg-emerald-400/25 px-1.5 py-0.5 font-display text-[7px] tracking-[0.06em] text-emerald-100 ring-1 ring-emerald-300/40">92</span>
            <span className="font-display text-[6px] tracking-[0.04em] text-paper/45">score → горячий</span>
          </span>
        </>
      )}
    </div>
  );
}

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
            className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-2xl p-5 sm:flex-row sm:items-stretch sm:gap-5 sm:p-6"
          >
            {/* Was a stock photo behind the whole card — Egor's call after
                seeing it live: it blocked the page's own background reel
                (CinematicStage) the same way the card's old opaque fill
                did. Back to a plain frosted-glass tile (.glass-panel, the
                same blurred surface the site's other windows use) so the
                reel reads straight through. */}
            {/* Текст слева (~58%), живая схема инструмента справа (~42%) —
                Егор: весь текст в одну колонку, а освободившееся место
                отдать под инфографику конкретного инструмента, не под
                общую картинку на все четыре карточки. */}
            <div className="relative sm:w-[58%]">
              <span className="font-display text-[10px] uppercase tracking-[0.12em] text-emerald-300">Пример · {s.format}</span>
              {/* Bold — Egor's ask: this line reads as the actual headline
                  of the card and was getting lost at font-medium next to
                  the bold eyebrow above it. */}
              <p className="mt-2 text-base font-bold leading-snug text-paper">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">{s.result}</p>
              {/* Filled gradient pill + the same breathing glow AiDeck's own
                  "Открыть инструмент" CTA uses (.ai-open-pulse) — Egor's
                  ask: this button should read as the page's one CTA
                  language, not the quiet outlined ghost link it was. */}
              <Link
                href="/brief/ai"
                className="ai-open-pulse mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#5ce6b0] to-[#0fa47a] px-3.5 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.08em] text-[#03120d] transition-[filter] duration-300 hover:brightness-110"
              >
                Хочу так же
              </Link>
            </div>
            <div className="relative sm:w-[42%]">
              <PilotGraphic format={s.format} />
            </div>
          </Appear>
        ))}
      </div>
    </CinematicSection>
  );
}
