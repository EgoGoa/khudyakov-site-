"use client";

import { useState } from "react";
import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";

// Chapter 05 — "why us" (brief §9) plus the FAQ (brief §10), folded into one
// screen the same way AiGuarantees.tsx pairs its terms list with an FAQ
// accordion for /ai's chapter 06.
//
// FAQ answer 2 ("Насколько быстро...") states a market-rate turnaround
// estimate, same convention as the pricing tiers in service-content.ts — not
// confirmed by Egor against a real case yet.
//
// Laid out in chapter 01's language, which Egor asked to carry across the
// page: `headless`, so the chapter renders its own number and heading into a
// left column that centres against the content beside it instead of a header
// pinned above everything; the heading in the display face under one wide
// soft cyan halo; and the flat PILL/ROUND pair for actions rather than the
// site-wide `.btn-3d` key. The reasons list and the FAQ move into one glass
// panel on the right, the same material as chapter 01's cards and chapter
// 02's comparison table.

const REASONS = [
  {
    title: "Фиксированные сроки",
    description: "Точно знаете дату запуска, без «плавающих» дедлайнов классической разработки.",
  },
  {
    title: "Гарантия возврата",
    description: "Не понравится результат — вернём деньги. Риск на нас, а не на вас.",
  },
  {
    title: "AI ускоряет, люди отвечают за качество",
    description: "Контроль на каждом этапе, не автогенерация «как получится».",
  },
  {
    title: "Сайт — ваш",
    description: "Код на React/HTML, без привязки к чужому конструктору.",
  },
];

const FAQ = [
  {
    q: "Чем сайт на AI отличается от сайта на конструкторе?",
    a: "Это не шаблон — уникальный код (React/HTML), который целиком принадлежит вам и не привязан к чужой платформе.",
  },
  {
    q: "Насколько быстро вы делаете сайт?",
    a: "От нескольких рабочих дней на лендинг до пары недель на сайт под ключ — за счёт AI на этапе черновика сроки короче, чем в классической разработке.",
  },
  {
    q: "Что если результат не понравится?",
    a: "Возвращаем деньги — это наша гарантия.",
  },
  {
    q: "Кто отвечает за качество — AI или люди?",
    a: "AI ускоряет черновик — тексты, структуру, первый вариант вёрстки. Финальное качество, доработку и деплой контролирует команда.",
  },
  {
    q: "На чём технически собран сайт?",
    a: "Claude Code превращает прототип в файловый проект (HTML/React), хостится на Vercel или Netlify — быстро и без затрат на серверы.",
  },
  {
    q: "Что с формами и AI-ассистентом на сайте — это безопасно?",
    a: "Формы работают через готовый сервис (Formspree и аналоги) без своего backend. AI-ассистент на сайте — отдельная опция через защищённую serverless-функцию, ключи API никогда не хранятся в коде браузера.",
  },
];

export default function SitesGuarantees() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <CinematicSection
      index={4}
      chapter="05"
      title="Почему мы"
      side="left"
      entrance="unfold"
      id="guarantees"
      spacious
      column
      headless
      bodyDecor={
        <SitesDecoIcon
          src="/images/icons/sites/shield.png"
          size={230}
          rotate={7}
          z={0}
          className="-right-6 -top-10 opacity-80 lg:right-0"
        />
      }
    >
      <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14">
        <div className="w-full shrink-0 lg:w-[38%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">05</span>
              <span className="h-px w-8 bg-glow/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-warm mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
              Почему
              <br />
              <span className="kw">мы</span>
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Покупаете не шаблон и не подписку на конструктор — покупаете свой сайт с
              зафиксированными сроками.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex items-center gap-4">
              <Link href="/brief" className={PILL}>
                Обсудить проект
              </Link>
              <Link href="/calculator" aria-label="Рассчитать бюджет" className={ROUND}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </Link>
            </div>
          </Appear>
        </div>

      <div className="mt-10 lg:mt-0 lg:flex-1 lg:flex lg:items-start lg:gap-8">
        <ul className="lg:max-w-md lg:flex-1">
          {REASONS.map((reason, i) => (
            <Appear
              key={reason.title}
              as="li"
              from="up"
              delay={BEAT.content + i * STAGGER.tight}
              className="border-t border-paper/20 py-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-paper/60">{reason.description}</p>
                </div>
              </div>
            </Appear>
          ))}
        </ul>

        <div className="mt-8 lg:mt-0 lg:w-[320px] lg:shrink-0 xl:w-[360px]">
          <Appear from="up" delay={BEAT.cta} className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
            FAQ
          </Appear>
          <Appear from="up" delay={BEAT.cta} className="mt-3 border-t border-paper/10">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="border-b border-paper/10">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  >
                    <span className="text-sm font-medium leading-snug text-paper">{item.q}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/60 transition-transform duration-200 ${
                        isOpen ? "rotate-45 border-orange/50 text-orange" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="max-w-sm pb-3.5 text-xs leading-relaxed text-paper/55">{item.a}</p>
                  )}
                </div>
              );
            })}
          </Appear>
        </div>
      </div>
      </div>
    </CinematicSection>
  );
}
