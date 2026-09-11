"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import CinematicSection from "@/components/ui/CinematicSection";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import Appear from "@/components/ui/Appear";
import BlockAssistant from "@/components/home/BlockAssistant";
import { DocumentIcon, UserIcon, ClockIcon, RubleIcon } from "@/components/ui/Icons";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { servicesByCategory } from "@/lib/service-content";
import { EYEBROW } from "@/lib/typography";
import { TEAM } from "@/lib/team";
import TeamAskCard from "@/components/home/TeamAskCard";

// Chapter 04 — the services list plus, on /content, an interactive widget
// beside it (Egor's ask): pick any of the ten services and the panel on the
// right adapts — a BlockAssistant search bar scoped to that one service on
// top, its budget/timeline/audience below, two lead-capture buttons at the
// foot. /ai, /sites and /smm keep the old static teaser+calculator card
// (their services have no budget/timeline/audience copy yet — see
// data.ts's own note on where those numbers came from), gated the same way
// showCalculator already was.

export default function Offer({
  index = 3,
  chapter = "04",
  title = "Лучшие в этом",
  intro = "Съёмка, монтаж, графика и AI-продакшн — под формат и площадку.",
  spacious = false,
  decor,
  bodyDecor,
}: {
  index?: number;
  chapter?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** See CinematicSection's own prop — /sites opts in, other pages don't. */
  spacious?: boolean;
  /** Overrides content's own decoration below for a different service's page
   *  (e.g. /sites' own glass icon) — ignored while `active === "content"`.
   *  Must be passed through this slot rather than as a sibling element: a
   *  sibling next to a staged CinematicSection isn't gated by the deck's own
   *  active-chapter logic and renders unconditionally on every chapter. */
  decor?: ReactNode;
  /** Decoration for the body area rather than the header. `decor` renders
   *  inside <header>, which is only as tall as the title — an icon anchored
   *  to its bottom edge therefore sits at the *top* of the screen and gets
   *  clipped by the site header. Anything sized to the chapter belongs here. */
  bodyDecor?: ReactNode;
}) {
  const { active } = useService();
  const services = servicesByCategory[active];
  // /calculator computes a video-production budget specifically (type,
  // runtime, add-ons) — a fair pitch on /content's own chapter, but a wrong
  // one on /ai, /sites or /smm, which don't share that pricing model. Same
  // gating Close.tsx already applies to its own "Рассчитать" button below.
  const showCalculator = active === "content";
  // The interactive widget only has real copy on /content right now (see
  // data.ts) — everywhere else falls back to the old static card below.
  const interactive = active === "content";
  const [selected, setSelected] = useState(0);
  const selectedService = services[selected];

  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title={title}
      side="left"
      // New subject after the trust argument — it tips up into place.
      entrance="unfold"
      intro={intro}
      spacious={spacious}
      // Offer is shared across /ai, /sites, /smm too (each passes its own
      // title/intro) — this orange-red icon is content's own, so it's
      // gated the same way Trust.tsx gates its own decoration.
      decor={
        active === "content" ? (
          <ContentDecoIcon
            src="/images/icons/content/services.png"
            size={260}
            rotate={-8}
            variant={2}
            className="right-[7%] top-0"
          />
        ) : (
          decor
        )
      }
      bodyDecor={bodyDecor}
    >
      {/* `lg:min-h-[68svh]` + `lg:items-stretch` only when interactive — the
          widget's `lg:h-full` (see its own note) needs an ancestor with a
          real height to resolve against, and the row's natural height
          (driven by the ten-row list, the shorter of the two children)
          wouldn't give it one. Off for the static card on /ai, /sites,
          /smm, which was sized for the old `items-start` baseline. */}
      <div
        className={`relative z-10 lg:flex lg:gap-16 ${
          interactive ? "lg:min-h-[68svh] lg:items-stretch" : "lg:items-start"
        }`}
      >
        {services.length === 0 ? (
          <p className="text-sm leading-relaxed text-paper/60">
            Список услуг по этому направлению скоро появится здесь.
          </p>
        ) : (
          <ul className={interactive ? "lg:flex-1 lg:self-start" : "lg:flex-1"}>
            {services.map((service, i) => {
              const isSelected = interactive && selected === i;
              // Interactive rows are real buttons (select the service for
              // the widget beside them); non-interactive pages keep the
              // plain static row they always had — same markup either way,
              // just a click handler and an active state layered on top.
              return (
                <Appear
                  key={service.title}
                  as="li"
                  from="up"
                  delay={BEAT.content + i * STAGGER.tight}
                  // The row's own air is the only thing tall enough to give
                  // this chapter back a screen it fits on: ten rows at py-4
                  // come to 600px, and on a 1280x800 laptop that pushed the
                  // last row ("10 AI-контент и автоматизация") below the fold,
                  // where the deck's desktop stepping makes it unreachable.
                  // Tightened by height, not by width — the constraint is how
                  // tall the screen is, not how wide.
                  className="border-t border-paper/20 [@media(max-height:860px)]:py-0"
                >
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => setSelected(i)}
                    aria-pressed={isSelected}
                    className={`group flex w-full items-baseline gap-3 py-4 text-left transition-colors [@media(max-height:860px)]:py-2.5 ${
                      interactive ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`font-display text-[10px] transition-colors ${
                        isSelected ? "text-orange" : "text-paper/40"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-base uppercase leading-tight tracking-tight transition-colors sm:text-lg [text-shadow:0_2px_16px_rgba(11,11,16,0.9)] ${
                        isSelected ? "text-orange" : "text-white group-hover:text-glow"
                      }`}
                    >
                      {service.title}
                    </span>
                  </button>
                </Appear>
              );
            })}
          </ul>
        )}

        {/* Vertical card beside the list rather than under it — ten rows
            would push a card underneath off the bottom of the screen.
            Interactive: half the row's width and stretched to the row's
            full height (`lg:w-1/2 lg:h-full`, row itself `lg:items-stretch
            lg:min-h-[...]` above) — Egor's ask, the widget now reads as the
            chapter's second half rather than a small card tucked beside
            the list. */}
        <Appear
          from="right"
          delay={BEAT.content + STAGGER.normal}
          className={`mt-10 rounded-2xl bg-ink/45 backdrop-blur-md lg:mt-0 lg:shrink-0 ${
            interactive ? "flex flex-col p-6 lg:h-full lg:w-1/2" : "p-6 lg:w-[300px] xl:w-[320px]"
          }`}
        >
          {interactive && selectedService ? (
            <>
              {/* Same search bar as /content's chapter 03 (BlockAssistant),
                  scoped to whichever service is selected — Egor's ask: "любой
                  вопрос по данной услуге", answered by the same agent/producer
                  flow rather than a new mechanism. */}
              <BlockAssistant
                context={`Страница /content (Создание контента), услуга «${selectedService.title}». ${selectedService.description}`}
              />

              {/* Что это → Для кого → Сроки → Бюджет — Egor's order. Each
                  subheading is the same font-display/uppercase treatment
                  the service list on the left uses (not the small EYEBROW
                  caption style these used to have), with a stroke icon
                  beside it, so the widget reads as authored rather than a
                  generic spec sheet. Body copy is full-opacity `text-paper`
                  throughout — the site's standing rule is white body text,
                  never dimmed grey (it "сливается"), and that applies here
                  too even though these values sit inside a quieter card. */}
              <div className="mt-6 flex-1 space-y-6 overflow-y-auto border-t border-paper/15 pt-6">
                <div>
                  <div className="flex items-center gap-2.5 text-glow">
                    <DocumentIcon className="h-5 w-5 shrink-0" />
                    <span className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
                      Что это
                    </span>
                  </div>
                  <p className="mt-2 pl-[30px] text-sm leading-relaxed text-paper">{selectedService.description}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 text-glow">
                    <UserIcon className="h-5 w-5 shrink-0" />
                    <span className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
                      Для кого
                    </span>
                  </div>
                  <p className="mt-2 pl-[30px] text-sm leading-relaxed text-paper">{selectedService.audience}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 text-glow">
                    <ClockIcon className="h-5 w-5 shrink-0" />
                    <span className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
                      Сроки
                    </span>
                  </div>
                  <p className="mt-2 pl-[30px] text-sm font-medium text-paper">{selectedService.timeline}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 text-glow">
                    <RubleIcon className="h-5 w-5 shrink-0" />
                    <span className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
                      Бюджет
                    </span>
                  </div>
                  <p className="mt-2 pl-[30px] text-sm font-medium text-paper">{selectedService.budget}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-paper/15 pt-6">
                {/* One window instead of two buttons — Egor's ask: every ask
                    on the site should read as written to a specific person,
                    with a real question, not a form. Max (creative
                    scriptwriter) fits directly — concepts are his own work. */}
                <TeamAskCard
                  member={TEAM.max}
                  question={`Привет, давай обсудим «${selectedService.title}»?`}
                  pitch="Подготовлю 2–3 концепции под вашу задачу — бесплатно, до брифа."
                  actionLabel="Получить 3 концепции"
                  compact
                />
              </div>
            </>
          ) : (
            <>
              <div id="ai" className="flex items-start gap-3 border-l-2 border-glow/60 pl-4">
                <div>
                  {active === "ai" ? (
                    // The site's own "AI-agent coming soon" teaser reads oddly
                    // advertised on the AI-services page itself — a client
                    // coming here for AI work doesn't need the site's own
                    // AI feature pitched at them mid-page. Same low-friction
                    // offer (skip the form, get a fast answer), no self-promo.
                    <p className="text-sm leading-relaxed text-paper/75">
                      Опишите задачу в двух словах — продюсер вернётся с форматом и бюджетом в течение дня.
                    </p>
                  ) : (
                    <>
                      <div className={`${EYEBROW} text-glow`}>Скоро</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-paper/75">
                        AI-агент прикинет формат и бюджет прямо в чате — до брифа и без ожидания менеджера.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {showCalculator && (
                <div className="mt-6 border-t border-paper/15 pt-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.18em] text-orange">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                    Не знаете формат?
                  </span>
                  <p className="mt-3 font-sans text-xl leading-[1.15] text-paper">
                    Калькулятор подберёт формат <span className="font-semibold text-orange">за 2 минуты</span>
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-paper/60">
                    По площадке и бюджету — сразу покажет вилку цен.
                  </p>
                  <Link
                    href="/calculator"
                    className="btn-neon btn-warm btn-3d mt-4 w-full justify-center !py-3.5"
                  >
                    Рассчитать бюджет
                  </Link>
                </div>
              )}
            </>
          )}
        </Appear>
      </div>
    </CinematicSection>
  );
}
