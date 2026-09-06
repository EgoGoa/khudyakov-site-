"use client";

import Link from "next/link";
import CinematicSection, { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import AiDeck, { AI_PILL, AI_ROUND } from "@/components/home/ai/AiDeck";

// Chapter 01 of /ai's deck (see src/app/(landing)/ai/page.tsx) — rebuilt in
// the composition Egor approved on /sites (see SitesPitch for the same
// reasoning at length): copy column on the left, service carousel on the
// right, both centred against each other.
//
// The chapter runs `headless` for that reason. CinematicSection's own header
// is a separate flex child pinned above the body, which splits the chapter in
// two — title at the top of the frame, everything else floating below it —
// and leaves no way to line the copy up against a tall carousel beside it.
// Owning the whole stack is what lets both columns share one vertical centre.
//
// What changed from the previous build of this chapter:
//
//   * the ten services are no longer a static 5×2 grid of plain cells — they
//     are the cards of AiDeck's 3D coverflow, which is the "creative paging"
//     Egor asked for and puts the same ten items on screen with a fraction of
//     the visual weight;
//   * the heading is set in near-white under one soft emerald halo
//     (.chapter-neon-cool) rather than the site-wide cyan triple-neon, with
//     an explicit line break so it always sets as three lines;
//   * the actions are the flat emerald pill plus a glass circle-arrow
//     (AI_PILL / AI_ROUND, shared with AiDeck so the page has one button
//     language), not the .btn-3d pressed-key treatment;
//   * the stat row survives, but as one thin line under the column rather
//     than a four-cell bordered block — Egor's call: the numbers stay
//     visible on the first screen without competing with the carousel.
//
// "←ПРОВЕРИТЬ" marks a working default rather than a confirmed real number —
// see docs/ai-page-todo.md.

// "14+" is still a working default rather than a confirmed number — the old
// inline "←ПРОВЕРИТЬ" marker lived in the visible value and wrapped this row
// onto three lines at lg, which is why it is a comment now instead. It stays
// tracked in docs/ai-page-todo.md.
const STATS = [
  { value: "с 2024", label: "внедряем AI" },
  { value: "350+", label: "клиентов" },
  { value: "60%", label: "повторные" },
  { value: "14+", label: "AI-пилотов" },
];

export default function AiPitch() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title="AI-решения быстрее рынка"
      side="left"
      entrance="slide-left"
      id="pitch"
      spacious
      column
      headless
    >
      <div className="lg:flex lg:items-center lg:gap-10 xl:gap-14">
        <div className="w-full shrink-0 lg:w-[46%]">
          <Appear from="up" delay={BEAT.eyebrow}>
            <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-300">01</span>
              <span className="h-px w-8 bg-emerald-300/40" />
            </div>
          </Appear>

          <Appear from="up" delay={BEAT.title}>
            <h2 className="chapter-neon-cool mt-3 max-w-[9.4em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.5rem] xl:text-[3.9rem]">
              <span className="whitespace-nowrap"><span className="kw">AI</span>-решения</span><br />
              быстрее рынка
            </h2>
          </Appear>

          <Appear from="up" delay={BEAT.intro}>
            <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>
              Внедряем ИИ там, где это <span className="kw">ускоряет результат</span>, а не для галочки.
            </p>
          </Appear>

          {/* The pain line, kept from the previous build (the copy brief asks
              for named pains before the pitch resumes) but trimmed to two
              sentences so the column still ends above the fold beside the
              carousel. */}
          <Appear from="up" delay={BEAT.intro}>
            <p className="mt-4 max-w-[32em] text-sm leading-relaxed text-paper/55">
              Заявки теряются, пока менеджер занят. Конкурент отвечает клиенту через минуту, вы —
              через два часа.
            </p>
          </Appear>

          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-8 flex items-center gap-4">
              {/* The cursor is anchored to the primary button, not to the
                  heading it floated near before: the icon's whole point is
                  its click animation, and a cursor caught mid-click reads as
                  pointing at the thing you actually press. `relative` here is
                  what its own `absolute` positions against, so it holds the
                  button's corner as the copy reflows. */}
              <span className="relative inline-flex">
                <Link href="/brief" className={AI_PILL}>
                  Обсудить внедрение
                </Link>
                {/* Three rings blooming from the cursor's actual tip — not
                    the button's center — like ripples spreading from the
                    point where something touches water. The anchor span is
                    zero-size, planted at the tip's on-screen position (see
                    the close.png tip-fraction math on .ai-deco-icon-click
                    below: with the box at -bottom-8/right-1/w-14, the 81%/4%
                    tip lands ~15px from the right edge and ~17px above the
                    bottom edge); each ring is centered on it with a static
                    translate(-50%,-50%) so the animated scale never fights
                    that centering. The three share one 2.4s loop, delayed by
                    a third of a beat each, so they trail one another
                    outward instead of pulsing in unison. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[17px] right-[15px] h-0 w-0"
                >
                  {[0, 0.28, 0.56].map((delay) => (
                    <span key={delay} className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
                      <span
                        className="ai-icon-ripple block h-3 w-3 rounded-full"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    </span>
                  ))}
                </span>
                <img
                  src="/images/icons/ai/close.png?v=2"
                  alt=""
                  aria-hidden="true"
                  width={64}
                  // close.png's painted tip points ~28deg right of vertical
                  // in the source file itself (measured from its alpha
                  // channel), not straight up like a plain arrow. -50deg
                  // cancelled that built-in tilt to land on the classic
                  // up-left pointer angle (~-22deg from vertical); -65deg
                  // tilts it 15deg further left from there, per Egor's call.
                  className="ai-deco-icon-click pointer-events-none absolute -bottom-8 right-1 w-14 rounded-[12px]"
                  style={{ "--r": "-65deg" } as React.CSSProperties}
                />
              </span>
              <Link href="/calculator" aria-label="Рассчитать бюджет" className={AI_ROUND}>
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

          {/* One thin line instead of the old bordered four-cell block. */}
          <Appear from="up" delay={BEAT.cta}>
            <div className="mt-9 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-paper/12 pt-4">
              {STATS.map((stat) => (
                <span key={stat.label} className="inline-flex items-baseline gap-1.5">
                  <span className="font-display text-base uppercase tabular-nums text-paper">{stat.value}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">{stat.label}</span>
                </span>
              ))}
            </div>
          </Appear>
        </div>

        {/* Hidden below lg: the coverflow needs the column beside it to make
            sense, and there is no second column on a phone. Same call as
            SitesDeck — a compact swipeable variant is a later pass. */}
        <Appear from="right" delay={BEAT.content} className="mt-10 hidden lg:mt-0 lg:block lg:flex-1">
          <AiDeck />
        </Appear>
      </div>
    </CinematicSection>
  );
}
