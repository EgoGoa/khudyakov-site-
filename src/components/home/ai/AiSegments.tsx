"use client";

import CinematicSection from "@/components/ui/CinematicSection";
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
  },
  {
    tag: "02 · E-COMMERCE",
    title: "Наполнить карточки и чат",
    description:
      "Контент под каталог и бот, который отвечает на вопросы о заказе без ручной обработки — на 200 SKU это часы, которые сейчас тратит человек.",
  },
  {
    tag: "03 · ЛОКАЛЬНЫЙ СЕРВИС",
    title: "Не терять заявки",
    description:
      "Клиника, салон, мастерская — AI отвечает первым, пока не освободился менеджер. Каждая нетронутая заявка 10 минут — это клиент, который уже написал следующему в списке.",
  },
  {
    tag: "04 · СТАРТАП / ЛИЧНЫЙ БРЕНД",
    title: "Показать продукт",
    description:
      "Промо и контент на AI, когда классическая съёмка и студия избыточны для стадии — тестируете гипотезу за дни, не за производственный цикл.",
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
  },
  {
    industry: "ЛОКАЛЬНЫЙ СЕРВИС",
    title: "Пример пилота: заявки не теряются в нерабочие часы",
    task: "До 30% заявок приходит вечером и в выходные, когда администратор недоступен — часть уходит к конкурентам.",
    stack: "Голосовой/чат AI-бот, запись на приём, синхронизация с расписанием.",
    where: "Сайт, WhatsApp.",
    budget: "от 50 000 ₽ (разово)",
  },
  {
    industry: "ЛИЧНЫЙ БРЕНД / СТАРТАП",
    title: "Пример пилота: AI-контент вместо студийной съёмки на этапе гипотезы",
    task: "Нужно проверить продуктовую гипотезу без бюджета на полноценный продакшн.",
    stack: "AI-генерация промо-роликов и визуалов, серия тестовых креативов под разные аудитории.",
    where: "Instagram*, Telegram, посадочная страница.",
    budget: "от 75 000 ₽ (разово)",
  },
];

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
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTS.map((s, i) => (
          <Appear
            key={s.tag}
            from="up"
            delay={BEAT.content + i * STAGGER.tight}
            className="rounded-2xl bg-ink/45 p-4 backdrop-blur-md"
          >
            <span className="font-display text-[9px] uppercase tracking-[0.15em] text-emerald-300">{s.tag}</span>
            <h3 className="mt-2 font-display text-base uppercase leading-tight tracking-tight text-white">
              {s.title}
            </h3>
            <p className="mt-1.5 text-xs leading-snug text-paper/65">{s.description}</p>
          </Appear>
        ))}
      </div>

      {/* Cases start cascading right after the segments finish, not on the
          same beat — SEGMENTS.length steps of STAGGER.tight is roughly where
          the last segment card lands. */}
      <div className="mt-6 border-t border-paper/15 pt-5">
        <Appear from="up" delay={BEAT.content + SEGMENTS.length * STAGGER.tight}>
          <span className={`${EYEBROW} text-paper/45`}>Кейсы</span>
        </Appear>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {CASES.map((c, i) => (
            <Appear
              key={c.title}
              from="up"
              delay={BEAT.content + (SEGMENTS.length + i) * STAGGER.tight}
              className="rounded-xl bg-ink/40 p-3.5 text-xs leading-relaxed text-paper/65"
            >
              <div className="font-display text-[10px] uppercase tracking-[0.1em] text-emerald-300">{c.industry}</div>
              <p className="mt-1 text-sm font-medium leading-snug text-white">{c.title}</p>
              <p className="mt-1.5 text-paper/60">
                <span className="text-paper/40">Задача:</span> {c.task}
              </p>
              <p className="mt-1 text-paper/60">
                <span className="text-paper/40">Состав:</span> {c.stack}
              </p>
              <p className="mt-1 text-paper/60">
                <span className="text-paper/40">Где работает:</span> {c.where}
              </p>
              <p className="mt-1.5 text-paper/45">Ориентировочный бюджет — {c.budget}</p>
            </Appear>
          ))}
        </div>

      </div>
    </CinematicSection>
  );
}
