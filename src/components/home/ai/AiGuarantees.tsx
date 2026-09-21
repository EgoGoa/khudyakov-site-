"use client";

import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import CinematicSection from "@/components/ui/CinematicSection";
import AiDecoIcon from "@/components/home/ai/AiDecoIcon";
import Appear from "@/components/ui/Appear";
import TeamAskCard from "@/components/home/TeamAskCard";
import { BEAT, STAGGER } from "@/lib/motion";
import { TEAM } from "@/lib/team";

// Chapter 06 — "you're buying a system, not a post" thesis, terms (rights/
// SLA/timelines), contractual guarantees, and a compact FAQ, all folded into
// one screen the way /content's chapter 03 pairs its reasons with a FAQ
// aside. ruvision's tender/44-ФЗ guarantee point is dropped — not relevant
// to this business — and its awards/press proof points are skipped entirely
// per the no-invented-data rule.
//
// The former standalone "Команда и блог" chapter (AiTeamBlog) folded in here
// as a compact strip above the FAQ rather than keeping its own video phase —
// its content was almost entirely [TODO] placeholders (team size, blog
// posts), too thin to carry a full screen on its own once every chapter on
// this page maps 1:1 to a phase of the reel. Its dashed blog placeholder
// cards are dropped outright rather than shrunk; the one real line (team
// backing the system) earns its place next to the terms it's vouching for.
//
// Terms below (rights transfer, 2 revision rounds, fixed dates) match the
// same defaults already stated unconditionally elsewhere on the site (see
// /content's own "PRO ХРОНОЛОГИЯ" — 2–3 rounds of revisions) rather than
// hedging with a visible "verify me" flag only on this page.

const TERMS = [
  { title: "Пилот прежде масштабирования", description: "Начинаем с одного узкого места, не с внедрения всего сразу." },
  {
    title: "Права без доплат",
    description:
      "Все права на разработанную систему и созданный AI-контент переходят вам по завершении проекта — без дополнительной оплаты.",
  },
  {
    title: "Правки по SLA",
    description: "Два раунда правок в рамках пилота включены в стоимость. Дальше — по регламенту сопровождения.",
  },
  { title: "NDA до брифа", description: "Конфиденциальность подписываем до передачи внутренних данных." },
  {
    title: "Сроки закреплены",
    description: "Даты аудита, пилота и запуска фиксируются в договоре на этапе согласования — без «плавающих» сроков.",
  },
  {
    title: "Отчётность по итогам пилота",
    description: "Метрики и что сработало — фиксируем в отчёте после каждого этапа, а не рассказываем на словах.",
  },
  {
    title: "Доступы и интеграции — ваши",
    description: "API-ключи, аккаунты и настройки регистрируются на вас — система не привязана к нам после сдачи.",
  },
];

/** One mini-scene per TERMS entry, same order, same index — the whole
 *  point of the rebuild (Egor's correction on the first pass): the
 *  infographic should retell the seven terms one at a time, not run its
 *  own separate abstract animation next to them. Each scene gets its own
 *  small continuously-looping detail (dots, counters, a travelling key…),
 *  built from the same primitives AiThumb/SegmentThumb already use. */
const TERM_SCENES: { icon: string; render: () => React.ReactNode }[] = [
  {
    icon: "🎯",
    render: () => (
      <>
        <div className="flex items-end justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={
                i === 0
                  ? "ai-a-blink block h-10 w-10 rounded-lg bg-emerald-400/70 ring-1 ring-emerald-200/70"
                  : "block h-5 w-5 rounded-[4px] bg-white/10"
              }
            />
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">Один процесс — узкое место найдено</p>
        {/* Второй бит, 4s хватает показать вывод, а не только завязку. */}
        <p className="ai-a-seq mt-1 text-center text-[11px] text-emerald-300" style={{ animationDelay: "1.7s" }}>
          Результат есть → масштабируем дальше
        </p>
      </>
    ),
  },
  {
    icon: "📄",
    render: () => (
      <>
        <div className="flex items-center justify-center gap-3">
          <span className="ai-a-node grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-xl ring-1 ring-white/15">📄</span>
          <span className="ai-a-blink text-lg text-emerald-300">→</span>
          <span className="ai-a-node grid h-11 w-11 place-items-center rounded-full bg-emerald-400/20 text-xl ring-1 ring-emerald-300/45">🙋</span>
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">
          Права переходят вам — <span className="text-paper/35 line-through">доплата</span>
        </p>
        <span
          className="ai-a-seq mx-auto mt-1.5 flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-200 ring-1 ring-emerald-300/30"
          style={{ animationDelay: "1.8s" }}
        >
          ✓ Система и контент — ваши
        </span>
      </>
    ),
  },
  {
    icon: "🔁",
    render: () => (
      <>
        <div className="flex items-center justify-center gap-3">
          {[1, 2].map((n) => (
            <span
              key={n}
              className="ai-a-seq grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 font-display text-sm text-emerald-200 ring-1 ring-emerald-300/40"
              style={{ animationDelay: `${n * 0.7}s` }}
            >
              {n}
            </span>
          ))}
          <span className="ai-a-node text-xl">⏱</span>
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">2 раунда правок включены в пилот</p>
        <p className="ai-a-seq mt-1 text-center text-[11px] text-emerald-300" style={{ animationDelay: "2.1s" }}>
          Дальше — по регламенту сопровождения
        </p>
      </>
    ),
  },
  {
    icon: "🔒",
    render: () => (
      <>
        <div className="flex items-center justify-center gap-2">
          <span className="ai-a-seq rounded-full bg-white/10 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.06em] text-paper/60" style={{ animationDelay: "0s" }}>
            Ваши данные
          </span>
          <span className="ai-a-progress relative block h-px w-5 origin-left bg-emerald-300/60" style={{ animationDelay: "0.6s" }} />
          <span className="ai-a-node text-2xl">🔒</span>
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">Конфиденциальность — до передачи данных</p>
        <p className="ai-a-seq mt-1 text-center text-[11px] text-emerald-300" style={{ animationDelay: "1.9s" }}>
          Подписываем NDA раньше брифа
        </p>
      </>
    ),
  },
  {
    icon: "📅",
    render: () => (
      <div className="flex flex-col items-center gap-1.5">
        {["Аудит", "Пилот", "Запуск"].map((label, i) => (
          <span
            key={label}
            className="ai-a-seq flex w-[150px] items-center gap-2 rounded-full bg-white/[0.06] px-2.5 py-1"
            style={{ animationDelay: `${i * 1.1}s` }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
            <span className="font-display text-[10px] uppercase tracking-[0.05em] text-paper/70">{label}</span>
            <span className="ml-auto text-[9px] text-paper/35">дата в договоре</span>
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: "📊",
    render: () => (
      <>
        <div className="flex h-12 items-end justify-center gap-1.5">
          {[40, 65, 50, 80].map((h, i) => (
            <span
              key={i}
              className="ai-a-bar block w-3 rounded-t-[3px] bg-[linear-gradient(180deg,rgba(200,241,105,0.85),rgba(16,185,129,0.2))]"
              style={{ height: `${h}%`, animationDelay: `${i * 0.25}s` }}
            />
          ))}
          <span className="ai-a-node ml-2 grid h-6 w-6 place-items-center self-center rounded-full bg-emerald-400/25 text-[10px] text-emerald-200 ring-1 ring-emerald-300/40">✓</span>
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">Отчёт после каждого этапа</p>
        <p className="ai-a-seq mt-1 text-center text-[11px] text-emerald-300" style={{ animationDelay: "2s" }}>
          Что сработало — фактами, не на словах
        </p>
      </>
    ),
  },
  {
    icon: "🔑",
    render: () => (
      <>
        <div className="relative flex h-10 items-center justify-between px-2">
          <span className="font-display text-[10px] uppercase tracking-[0.06em] text-paper/50">Мы</span>
          <span className="relative mx-2 h-px flex-1 bg-emerald-300/30">
            <span className="ai-a-travel absolute -top-2.5 text-base">🔑</span>
          </span>
          <span className="font-display text-[10px] uppercase tracking-[0.06em] text-emerald-300">Вы</span>
        </div>
        <p className="mt-3 text-center text-[11px] text-paper/55">Ключи и доступы — на вашем имени</p>
        <span
          className="ai-a-seq mx-auto mt-1.5 flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-200 ring-1 ring-emerald-300/30"
          style={{ animationDelay: "2.2s" }}
        >
          ✓ Система не привязана к нам
        </span>
      </>
    ),
  },
];

/** 28s loop, 4s per term (7 × 4s) — one full pass through TERMS, in the
 *  same order as the list on the left, then repeats. All seven slides
 *  share `guar-slide` (globals.css) at the same 28s duration, offset by
 *  `i * 4s` — the same "one shared keyframe, staggered by delay" trick
 *  ai-seq uses elsewhere, so the slides stay locked to each other without
 *  needing seven bespoke keyframes. 4s (was 2s, Egor's second round) gives
 *  each scene room for a two-beat story — a setup and then its own payoff
 *  line — instead of just sitting there for the extra time. */
function GuaranteeInfographic() {
  return (
    <div className="ai-thumb-live relative h-full w-full overflow-hidden rounded-2xl border border-emerald-300/15 bg-white/[0.025]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,241,105,0.16) 0%, rgba(16,185,129,0.1) 55%, transparent 75%)" }}
      />
      {TERMS.map((term, i) => (
        <div
          key={term.title}
          className="guar-term-slide absolute inset-0 flex flex-col items-center justify-center px-5 py-4"
          style={{ animationDelay: `${i * 4}s` }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[28px] leading-none">{TERM_SCENES[i].icon}</span>
            <h3 className="kw max-w-[11em] text-left font-display text-base uppercase leading-[1.1] tracking-tight">
              {term.title}
            </h3>
          </div>
          <div className="mt-4 w-full">{TERM_SCENES[i].render()}</div>
        </div>
      ))}

      {/* Пагинация — семь точек, та же раскладка, что и номера слева, читается
          как «сейчас показываем пункт N из 7». */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {TERMS.map((term, i) => (
          <span
            key={term.title}
            className="guar-dot h-1.5 w-1.5 rounded-full bg-white/15"
            style={{ animationDelay: `${i * 4}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AiGuarantees() {
  return (
    <CinematicSection
      footer={<ToolSpotlight slug="voice" place="right" />}
      index={5}
      chapter="06"
      title={<>Условия и <span className="kw">гарантии</span></>}
      side="left"
      entrance="unfold"
      id="guarantees"
      intro={<>Покупаете не пост и не ролик — покупаете <span className="kw">работающую систему</span>, зафиксированную в договоре.</>}
      decor={
        <AiDecoIcon
          src="/images/icons/ai/guarantees.webp?v=2"
          size={240}
          rotate={8}
          variant={2}
          z={-1}
          className="-left-16 -top-10 lg:-left-6"
        />
      }
    >
      <div className="lg:flex lg:items-start lg:gap-12">
        <ul className="lg:max-w-md lg:flex-1">
          {TERMS.map((term, i) => (
            <Appear
              key={term.title}
              as="li"
              from="up"
              delay={BEAT.content + i * STAGGER.tight}
              className="border-t border-paper/20 py-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[10px] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  {/* Page's own lime→emerald gradient (`.kw`, scoped to this
                      gradient by `.ai-cool-headings` further up the page) —
                      Egor's ask: these seven titles should read in the
                      page's brand colour, not plain white. */}
                  <h3 className="kw font-display text-sm uppercase leading-tight tracking-tight">
                    {term.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-paper/60">{term.description}</p>
                </div>
              </div>
            </Appear>
          ))}
        </ul>

        {/* Команда + FAQ dropped — Egor's call: both repeated near-identical
            content already sitting elsewhere on this page (and across other
            service pages), and read as filler next to the seven terms.
            Replaced with a wide TeamAskCard for Egor himself — discussing
            collaboration terms and this specific project's details is
            exactly what this chapter is about. The bottom half, left empty
            at first, now carries a 14s looping infographic (GuaranteeInfographic)
            that retells the seven terms one at a time, ~2s each, same order
            as the list beside it. */}
        <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:h-[560px] lg:w-[360px] lg:shrink-0 xl:w-[400px]">
          <Appear from="right" delay={BEAT.content + TERMS.length * STAGGER.tight} className="lg:h-[calc(50%-8px)]">
            <TeamAskCard
              member={TEAM.egor}
              question="Обсудим условия сотрудничества и детали проекта"
              pitch="Голосом или в переписке — как удобнее. Отвечу по цене, срокам и что войдёт в пилот."
              actionLabel="Обсудить детали"
              className="h-full"
              backgroundImage="/images/blocks/stock-brainstorm.jpg"
              dense
            />
          </Appear>
          <Appear
            from="right"
            delay={BEAT.content + TERMS.length * STAGGER.tight + STAGGER.tight}
            className="lg:h-[calc(50%-8px)]"
          >
            <GuaranteeInfographic />
          </Appear>
        </div>
      </div>
    </CinematicSection>
  );
}
