"use client";

import { useState } from "react";
import CinematicSection from "@/components/ui/CinematicSection";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";

// Chapter 06 — "why us" (brief §9) plus the FAQ (brief §10), folded into one
// screen the same way AiGuarantees.tsx pairs its terms list with an FAQ
// accordion for /ai's chapter 06.
//
// FAQ answer 2 ("Насколько быстро...") states a market-rate turnaround
// estimate, same convention as the pricing tiers in service-content.ts — not
// confirmed by Egor against a real case yet.

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
      index={5}
      chapter="06"
      title="Почему мы"
      icon="scale"
      side="left"
      entrance="unfold"
      id="guarantees"
      spacious
      intro="Покупаете не шаблон и не подписку на конструктор — покупаете свой сайт с зафиксированными сроками."
      decor={
        <SitesDecoIcon
          src="/images/icons/sites/shield.png"
          size={230}
          rotate={7}
          z={5}
          className="right-4 -top-6 opacity-90 lg:right-10"
        />
      }
    >
      <div className="lg:flex lg:items-start lg:gap-12">
        <ul className="lg:max-w-md lg:flex-1">
          {REASONS.map((reason, i) => (
            <li key={reason.title} className="border-t border-paper/20 py-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-paper/60">{reason.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 lg:mt-0 lg:w-[360px] lg:shrink-0 xl:w-[400px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">FAQ</span>
          <div className="mt-3 border-t border-paper/10">
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
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
