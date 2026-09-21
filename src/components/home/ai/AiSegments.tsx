"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import { EYEBROW } from "@/lib/typography";

// Chapter 02 — who this is for (4 segments) and the cases that prove it,
// folded into one screen the way /content's own chapter 02 folds its
// portfolio grid plus a "full catalogue" link.
//
// No AI case has actually closed yet, so these cards are framed as
// illustrative pilot scenarios ("пример пилота"), not as completed real
// projects with invented outcomes — claiming a specific real result ("closed
// 40% of requests") without a real client behind it would be a false claim,
// not just an unfilled field. Budgets are the Старт/Рост tier ranges from
// AiClose's own pricing (see aiPricingTiers.ts) rather than a made-up number,
// so they stay consistent with the tariffs shown lower on the same page.
//
// Instagram gets the site's standing "*" — see Footer.tsx for the required
// disclaimer, already shown once per page there; no need to repeat it in
// each card.

const SEGMENTS = [
  {
    tag: "01 · МАЛЫЙ БИЗНЕС",
    title: "Без своего маркетинга",
    description:
      "AI закрывает роль, на которую пока нет отдельного человека в штате — отвечает клиентам, пока вы заняты делом, а не экраном телефона.",
    shape: "reply" as const,
  },
  {
    tag: "02 · E-COMMERCE",
    title: "Наполнить карточки и чат",
    description:
      "Контент под каталог и бот, который отвечает на вопросы о заказе без ручной обработки — на 200 SKU это часы, которые сейчас тратит человек.",
    shape: "catalog" as const,
  },
  {
    tag: "03 · ЛОКАЛЬНЫЙ СЕРВИС",
    title: "Не терять заявки",
    description:
      "Клиника, салон, мастерская — AI отвечает первым, пока не освободился менеджер. Каждая нетронутая заявка 10 минут — это клиент, который уже написал следующему в списке.",
    shape: "queue" as const,
  },
  {
    tag: "04 · СТАРТАП / ЛИЧНЫЙ БРЕНД",
    title: "Показать продукт",
    description:
      "Промо и контент на AI, когда классическая съёмка и студия избыточны для стадии — тестируете гипотезу за дни, не за производственный цикл.",
    shape: "reel" as const,
  },
];

const CASES = [
  {
    industry: "E-COMMERCE",
    title: "Пример пилота: чат-бот берёт на себя вопросы по наличию и доставке",
    task: "Клиенты пишут в директ с вопросами по наличию и доставке, менеджер отвечает вручную 6–8 часов в день.",
    stack: "AI-бот на базе каталога, интеграция с CRM, эскалация сложных вопросов на человека.",
    where: "Сайт, Instagram*, Telegram.",
    budget: "от 50 000 ₽ (разово)",
    image: "/images/stock/platform-speed.webp",
  },
  {
    industry: "ЛОКАЛЬНЫЙ СЕРВИС",
    title: "Пример пилота: заявки не теряются в нерабочие часы",
    task: "До 30% заявок приходит вечером и в выходные, когда администратор недоступен — часть уходит к конкурентам.",
    stack: "Голосовой/чат AI-бот, запись на приём, синхронизация с расписанием.",
    where: "Сайт, WhatsApp.",
    budget: "от 50 000 ₽ (разово)",
    image: "/images/stock/planner-desk.webp",
  },
  {
    industry: "ЛИЧНЫЙ БРЕНД / СТАРТАП",
    title: "Пример пилота: AI-контент вместо студийной съёмки на этапе гипотезы",
    task: "Нужно проверить продуктовую гипотезу без бюджета на полноценный продакшн.",
    stack: "AI-генерация промо-роликов и визуалов, серия тестовых креативов под разные аудитории.",
    where: "Instagram*, Telegram, посадочная страница.",
    budget: "от 75 000 ₽ (разово)",
    image: "/images/stock/holi-face.webp",
  },
];

// Compact per-segment diagram, dropped between each card's title and
// description — the same idea as AiDeck's per-shape AiThumb (reuses its
// .ai-thumb-live keyframes from globals.css), just small enough to sit
// inside a grid card instead of owning a full deck slot. Unlike the deck,
// every card's diagram runs all the time (no "only the active one" rule) —
// these sit in a static grid, not a carousel with an unmistakable "selected"
// card, so there's no ambiguity to avoid by keeping the others still.
function SegmentThumb({ shape }: { shape: "reply" | "catalog" | "queue" | "reel" }) {
  const d = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });
  return (
    <div className="ai-thumb-live relative mt-3 h-[70px] w-full overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/[0.07]">
      {shape === "reply" && (
        <div className="flex h-full flex-col justify-center gap-1.5 px-2.5">
          <span className="ai-a-blink flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[6px] tracking-[0.08em] text-emerald-200 ring-1 ring-emerald-300/30">
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
            24/7
          </span>
          <span className="ai-a-seq block h-2 w-[58%] rounded-md rounded-bl-sm bg-white/10" />
          <span
            className="ai-a-seq ml-auto flex w-fit items-center gap-1 rounded-md rounded-br-sm bg-emerald-400/20 px-1.5 py-1 ring-1 ring-emerald-300/30"
            style={d(0.8)}
          >
            <span className="ai-a-typing block h-1 w-1 rounded-full bg-emerald-300" style={d(0)} />
            <span className="ai-a-typing block h-1 w-1 rounded-full bg-emerald-300" style={d(0.18)} />
            <span className="ai-a-typing block h-1 w-1 rounded-full bg-emerald-300" style={d(0.36)} />
          </span>
        </div>
      )}
      {shape === "catalog" && (
        <div className="flex h-full flex-col justify-center gap-1.5 px-2.5">
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="ai-a-seq relative block aspect-square overflow-hidden rounded-[3px] bg-white/[0.07] ring-1 ring-white/[0.08]"
                style={d(i * 0.25)}
              >
                <span
                  className="ai-a-progress absolute inset-x-0 bottom-0 origin-bottom bg-emerald-400/45"
                  style={{ height: "100%", transform: "scaleY(0.7)" }}
                />
              </span>
            ))}
          </div>
          <span
            className="ai-a-seq flex w-fit items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-display text-[6px] tracking-[0.06em] text-emerald-200 ring-1 ring-emerald-300/30"
            style={d(1.2)}
          >
            <span className="h-1 w-1 rounded-full bg-emerald-300" />В наличии ✓
          </span>
        </div>
      )}
      {shape === "queue" && (
        <div className="flex h-full flex-col justify-center gap-1 px-2.5">
          {[
            { c: "bg-[#ff6a3d]", label: "Заявка · 22:40" },
            { c: "bg-emerald-300/60", label: "Заявка · 19:10" },
            { c: "bg-emerald-300", label: "Заявка · 09:02" },
          ].map((row, i) => (
            <span key={row.label} className="ai-a-seq flex items-center gap-1.5" style={d(i * 0.4)}>
              <span className={`ai-a-blink block h-1.5 w-1.5 shrink-0 rounded-full ${row.c}`} style={d(i * 0.3)} />
              <span className="font-display text-[6px] tracking-[0.03em] text-paper/55">{row.label}</span>
              {i === 2 && (
                <span className="ml-auto font-display text-[6px] tracking-[0.03em] text-emerald-300">отвечено</span>
              )}
            </span>
          ))}
        </div>
      )}
      {shape === "reel" && (
        <div className="relative h-full px-2.5 py-2">
          <span className="relative block h-full w-full overflow-hidden rounded-md bg-[linear-gradient(135deg,rgba(52,211,153,0.4),rgba(0,210,255,0.22))]">
            <span className="absolute left-1.5 top-1.5 rounded-[3px] bg-ink/60 px-1.5 py-0.5 font-display text-[6px] tracking-[0.1em] text-emerald-100/90">
              AI
            </span>
            <span className="absolute inset-0 grid place-items-center">
              <span className="ai-a-blink grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-[8px] text-emerald-200 ring-1 ring-emerald-300/40">
                ▶
              </span>
            </span>
            <span className="absolute inset-x-1.5 bottom-1.5 block h-0.5 overflow-hidden rounded-full bg-paper/15">
              <span
                className="ai-a-progress absolute inset-0 origin-left rounded-full bg-emerald-300/80"
                style={{ transform: "scaleX(0.5)" }}
              />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function AiSegments() {
  return (
    <CinematicSection
      index={2}
      chapter="03"
      title={<>Кому <span className="kw">подходит</span></>}
      side="right"
      entrance="rise"
      id="segments"
      intro={<>Не всем и не всегда — там, где AI <span className="kw">реально быстрее и дешевле</span> ручной работы.</>}
      // Одна услуга на блок, порядок — по приоритету топ-5 (см.
      // toolRegistry): 02 — единый AI-чат, здесь — агент по заявкам.
      // Плитка у правого края, а не полосой во всю ширину: Егор просил,
      // чтобы на каждом блоке кнопка стояла по-своему.
      footer={<ToolSpotlight slug="agent" place="right" />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTS.map((s, i) => (
          <Appear
            key={s.tag}
            from="up"
            delay={BEAT.content + i * STAGGER.tight}
            className="rounded-2xl bg-ink/45 p-3.5 backdrop-blur-md"
          >
            <span className="font-display text-[9px] uppercase tracking-[0.15em] text-emerald-300">{s.tag}</span>
            <h3 className="mt-2 font-display text-base uppercase leading-tight tracking-tight text-white">
              {s.title}
            </h3>
            <SegmentThumb shape={s.shape} />
            <p className="mt-2.5 text-xs leading-snug text-white/80">{s.description}</p>
          </Appear>
        ))}
      </div>

      {/* Cases start cascading right after the segments finish, not on the
          same beat — SEGMENTS.length steps of STAGGER.tight is roughly where
          the last segment card lands. */}
      <div className="mt-5 border-t border-paper/15 pt-4">
        <Appear from="up" delay={BEAT.content + SEGMENTS.length * STAGGER.tight}>
          <span className="inline-flex items-center gap-2">
            <span className={`${EYEBROW} text-emerald-300`}>Кейсы</span>
            <span className="h-px w-8 bg-emerald-300/40" />
          </span>
        </Appear>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
          {CASES.map((c, i) => (
            <Appear
              key={c.title}
              from="up"
              delay={BEAT.content + (SEGMENTS.length + i) * STAGGER.tight}
              className="relative overflow-hidden rounded-xl p-3.5 text-xs leading-relaxed"
            >
              {/* Low-exposure photo + dark scrim, both held to roughly half
                  strength (was opacity-80 / 0.45-0.78 scrim) — Egor's ask:
                  the page's own background reel (CinematicStage) should
                  read through this card too, same fix as AiPortfolio's
                  scenario tiles. */}
              <img
                src={c.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 [filter:grayscale(0.15)_contrast(1.05)_blur(3.5px)]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(165deg, rgba(12,22,19,0.22) 0%, rgba(10,13,16,0.3) 55%, rgba(10,13,16,0.39) 100%)",
                }}
              />
              <div className="relative">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.1em] text-emerald-200 ring-1 ring-emerald-300/30">
                  {c.industry}
                </span>
                <p className="mt-1.5 text-sm font-medium leading-snug text-white">{c.title}</p>
                <p className="mt-2 text-white/75">
                  <span className="font-display text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300/90">
                    Задача{" "}
                  </span>
                  {c.task}
                </p>
                <p className="mt-1.5 text-white/75">
                  <span className="font-display text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300/90">
                    Состав{" "}
                  </span>
                  {c.stack}
                </p>
                <p className="mt-1.5 text-white/75">
                  <span className="font-display text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300/90">
                    Где работает{" "}
                  </span>
                  {c.where}
                </p>
                <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-display text-[10px] tracking-[0.03em] text-white ring-1 ring-white/15">
                  {c.budget}
                </span>
              </div>
            </Appear>
          ))}
        </div>

      </div>
    </CinematicSection>
  );
}
