"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import CinematicSection from "@/components/ui/CinematicSection";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import Appear from "@/components/ui/Appear";
import PhoneFrame from "@/components/ui/PhoneFrame";
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
  },
  {
    format: "Голосовой AI",
    title: "Запись на приём вне рабочих часов",
  },
  {
    format: "AI-видео",
    title: "Промо-ролик без съёмочной группы",
  },
  {
    format: "AI в CRM",
    title: "Автоматическая квалификация лидов",
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
    <div className="ai-thumb-live relative flex h-full min-h-[calc(132*var(--s))] w-full flex-col justify-center gap-2 overflow-hidden rounded-xl bg-paper/[0.03] p-3">
      {format === "Чат-бот" && (
        <>
          {/* Директ и Telegram отвечают сами, пока менеджер занят — та же
              переписка, что и в колоде, без счётчика "24/7": тут это уже
              сказано текстом слева. */}
          <div className="ai-a-seq flex items-start gap-1.5" style={d(0)}>
            <span className="mt-0.5 block h-4 w-4 shrink-0 rounded-full bg-paper/15" />
            <span className="block w-[70%] rounded-lg rounded-bl-sm bg-paper/10 p-1.5">
              <span className="block h-1.5 w-[85%] rounded-[calc(2*var(--s))] bg-paper/22" />
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
            <span className="block h-1.5 w-[80%] rounded-[calc(2*var(--s))] bg-emerald-200/60" />
          </span>
        </>
      )}

      {format === "Голосовой AI" && (
        <>
          {/* Запись на приём вечером — волна принимает звонок, затем слот в
              расписании подсвечивается вне рабочих часов. */}
          <span className="relative block h-9 w-full">
            <span className="absolute inset-0 flex items-center justify-center gap-[calc(3*var(--s))]">
              {[10, 22, 34, 44, 30, 40, 20, 14].map((h, i) => (
                <span key={i} className="ai-a-wave block w-[calc(3*var(--s))] rounded-full bg-emerald-300" style={{ height: `${h}%`, ...d((i % 4) * 0.16) }} />
              ))}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            {["Пн", "Вт", "Ср", "Чт"].map((day, i) => (
              <span
                key={day}
                className={`grid h-5 w-5 place-items-center rounded-[calc(3*var(--s))] font-display text-[calc(6*var(--s))] ${i === 2 ? "ai-a-blink bg-emerald-400/30 text-emerald-100 ring-1 ring-emerald-300/40" : "bg-paper/[0.07] text-paper/40"}`}
              >
                {day}
              </span>
            ))}
          </div>
          <span className="ai-a-seq flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[calc(6*var(--s))] tracking-[0.06em] text-emerald-200 ring-1 ring-emerald-300/30" style={d(1.6)}>
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
              <span className="ai-a-blink grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-[calc(8*var(--s))] text-emerald-200 ring-1 ring-emerald-300/40">▶</span>
            </span>
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`ai-a-blink block h-3 flex-1 rounded-[calc(2*var(--s))] ${i === 2 ? "bg-emerald-400/45" : "bg-paper/[0.08]"}`} style={d(i * 0.25)} />
            ))}
          </div>
          <span className="ai-a-node flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[calc(6*var(--s))] tracking-[0.06em] text-emerald-200 ring-1 ring-emerald-300/30" style={d(1.8)}>
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
              <span className="block font-display text-[calc(6*var(--s))] uppercase tracking-[0.04em] text-emerald-200">Менеджеру</span>
              <span className="ai-a-lift block h-5 rounded-[calc(3*var(--s))] bg-emerald-400/30 ring-1 ring-emerald-300/40" />
            </span>
            <span className="grid gap-1 rounded-md bg-paper/[0.06] p-1.5">
              <span className="block font-display text-[calc(6*var(--s))] uppercase tracking-[0.04em] text-paper/35">На догрев</span>
              <span className="block h-5 rounded-[calc(3*var(--s))] bg-paper/[0.08]" />
              <span className="block h-5 rounded-[calc(3*var(--s))] bg-paper/[0.05]" />
            </span>
          </div>
          <span className="ai-a-seq flex items-center gap-1.5" style={d(1.2)}>
            <span className="ai-a-blink rounded-full bg-emerald-400/25 px-1.5 py-0.5 font-display text-[calc(7*var(--s))] tracking-[0.06em] text-emerald-100 ring-1 ring-emerald-300/40">92</span>
            <span className="font-display text-[calc(6*var(--s))] tracking-[0.04em] text-paper/45">score → горячий</span>
          </span>
        </>
      )}
    </div>
  );
}

/** Ролик в экране телефона: вне вьюпорта — пауза, при reduced-motion не
 *  запускается вовсе (виден постер). Файлы — с нашего домена. */
function PortfolioLoop() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      poster="/media/portfolio-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src="/media/portfolio-loop.webm" type="video/webm" />
      <source src="/media/portfolio-loop.mp4" type="video/mp4" />
    </video>
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
      // Узкая полоса внизу главы, разворачивающаяся в окно про инструмент.
      footer={<ToolSpotlight slug="chat-hub" />}
    >
      {/* Слева телефон с роликом и заголовком, справа четыре компактные
          карточки в столбик. На ≤768px телефон сверху, карточки ниже. */}
      <div className="mx-auto grid grid-cols-1 items-center gap-6 [@media(min-width:769px)]:grid-cols-[5fr_7fr] [@media(min-width:769px)]:gap-8 [@media(min-width:769px)_and_(max-height:860px)]:gap-5">
        <Appear from="up" delay={BEAT.content} className="flex flex-col items-center gap-4 [@media(min-width:769px)]:gap-5">
          <PhoneFrame className="w-[min(70vw,300px)] [@media(min-width:769px)]:h-[clamp(280px,42vh,500px)] [@media(min-width:769px)]:w-auto">
            <PortfolioLoop />
          </PhoneFrame>
          <h3 className="max-w-[14em] text-center font-display text-[clamp(18px,2.4vw,28px)] font-bold uppercase leading-[1.1] tracking-tight text-paper [overflow-wrap:normal] [hyphens:none]">
            AI-видео <span className="kw">за дни</span>, а не месяцы
          </h3>
        </Appear>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 [@media(max-height:860px)]:gap-2.5">
          {SCENARIOS.map((s, idx) => (
            <Appear key={s.title} from="up" delay={BEAT.content + idx * STAGGER.normal}>
              <Link
                href="/brief/ai"
                className="glass-panel group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 sm:p-5 transition-[filter] duration-300 hover:brightness-110"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[calc(10*var(--s))] uppercase tracking-[0.12em] text-emerald-300">Пример · {s.format}</span>
                  <span className="mt-1.5 block text-base font-bold leading-snug text-paper">{s.title}</span>
                  <span className="mt-2 block font-display text-[calc(11*var(--s))] font-semibold uppercase tracking-[0.08em] text-emerald-200 transition-transform duration-300 group-hover:translate-x-0.5">
                    Хочу так же →
                  </span>
                </span>
                {/* Мини-схема вдвое меньше прежней: рисуется в полном размере
                    и сжимается scale-50, поэтому анимации остаются теми же. */}
                <span aria-hidden="true" className="relative h-[calc(72*var(--s))] w-[calc(104*var(--s))] shrink-0 overflow-hidden rounded-lg sm:w-[calc(116*var(--s))]">
                  <span className="absolute left-0 top-0 block h-[200%] w-[200%] origin-top-left scale-50">
                    <PilotGraphic format={s.format} />
                  </span>
                </span>
              </Link>
            </Appear>
          ))}
        </div>
      </div>
    </CinematicSection>
  );
}
