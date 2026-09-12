"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CinematicSection from "@/components/ui/CinematicSection";
import FaqAside from "@/components/home/FaqAside";
import PromoCard from "@/components/home/PromoCard";
import BlockAssistant from "@/components/home/BlockAssistant";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { whyByCategory } from "@/lib/service-content";
import TeamAskCard from "@/components/home/TeamAskCard";
import { TRUST_ASK } from "@/lib/team";

// Chapter 03 on /content (the deck position `index`/`chapter` default to) —
// the old Why + Testimonials + LogoCloud folded into one screen. The client
// roster line (KIA / Федерация баскетбола / ...) that used to run under the
// three reasons is gone — Egor's call: a page this dense from a client's own
// portfolio doesn't need a name-drop line to feel credible, and it read as
// one more strip of small print in an already busy chapter.
//
// `title`/`intro` are props (defaulted to content's own copy) because they
// are genuinely content-specific — a different service reusing this chapter
// (see /ai) has no matching pitch line to show.

// One colour for every reason card — a rainbow-per-card pass came first,
// but next to FaqAside's single orange accent it read as two different
// design languages side by side. Same orange FaqAside already uses for its
// active pill and "+", so the two lists now read as one system.
const REASON_ACCENT = { solid: "#ff6a3d", dim: "rgba(255,106,61,0.32)" };

// Same "Apple-style" open/close as FaqAside's answers right next to this —
// height animated to "auto" instead of an instant mount/unmount, on the
// same curve CinematicSection's own transitions use, so both accordions on
// this chapter settle identically.
const REASON_EASE = [0.22, 1, 0.36, 1] as const;

export default function Trust({
  index = 2,
  chapter = "03",
  title = "Именно мы",
  intro = "Продюсерский центр полного цикла: от идеи до готового ролика. Около 60% заказов — клиенты, которые возвращаются.",
}: {
  index?: number;
  chapter?: string;
  title?: ReactNode;
  intro?: ReactNode;
}) {
  const { active } = useService();
  const why = whyByCategory[active];
  const [openReason, setOpenReason] = useState<number | null>(null);

  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title={title}
      side="right"
      // The argument continues here, so it rises rather than cutting in sideways.
      entrance="rise"
      intro={intro}
    >
      {/* Both rows below used to span the chapter's full width independently
          — the search bar centred itself in that whole width (672px in
          ~1100px of room), and the grid's 1fr second column let the
          reasons/Promo block stretch wide with empty space past its own
          470px content. That's what read as "everything pressed to the
          left": neither row's right edge actually reached anywhere near the
          chapter's right edge. Egor's ask: pin the five-reasons/Promo
          column's right edge to the search bar's right edge, and shift the
          whole two-column block off the left edge doing it. Wrapping both
          rows in one fixed-width, centred container is what makes that
          hold at every breakpoint instead of two independent pixel guesses
          drifting apart — the grid's columns are fixed px now (not 1fr), so
          this wrapper's width is exactly their sum, and the search bar
          (`ml-auto` in BlockAssistant.tsx, was `mx-auto`) right-aligns
          inside the same width instead of centring short of it. */}
      <div className="lg:mx-auto lg:w-[850px] xl:w-[890px]">
      <div className="mb-3 lg:flex lg:items-stretch lg:gap-3">
        <Appear from="left" delay={BEAT.content} className="hidden lg:flex lg:shrink-0">
          <span className="inline-flex h-full items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-4 font-display text-[11px] uppercase tracking-[0.18em] text-orange">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
            FAQ · до старта
          </span>
        </Appear>
        <Appear from="up" delay={BEAT.content} className="lg:min-w-0 lg:flex-1">
          <BlockAssistant context={`Страница /content (Создание контента), блок «${why.badge}». ${why.description}`} />
        </Appear>
      </div>

      {/* A real 2-column grid, not two independent flex columns — Egor's
          ask: PromoCard and the Telegram card (row 2) sit at the same Y in
          both columns regardless of whether FaqAside or the reasons list
          (row 1) happens to run taller, which two separate flex columns
          could never guarantee. DOM order here IS the grid order: FAQ,
          reasons, Promo, Telegram — one cell per grid line. Columns are
          fixed px (300/340 then 470), not `1fr` — the reasons/Promo column
          used to stretch past its own 470px content to fill whatever room
          was left in the old full-width grid, which is what let it end up
          short of the search bar's right edge above. Fixed columns make
          this grid's own width exactly 850/890px, matching the wrapper
          above pixel for pixel. */}
      <div className="lg:grid lg:grid-cols-[300px_470px] lg:gap-x-20 xl:grid-cols-[340px_470px]">
        {/* Row 1 (FAQ, reasons) opts out of the grid's default stretch —
            row 2 (Promo, Telegram) needs it: with no lg:self-start, both
            of those cells stretch to match the row's own tallest cell, so
            the two cards come out exactly the same height regardless of
            which one's copy happens to run longer, rather than needing
            their text hand-tuned to match. */}
        {/* Wrapped in the same glass surface every other block on the site
            uses (bg-ink/45 + backdrop-blur-md) — Egor's ask: it used to sit
            directly on the film with no card of its own, which read as
            unfinished next to the reason cards and Promo/Telegram pair
            beside it. */}
        <Appear from="left" delay={BEAT.content} className="hidden lg:block lg:self-start">
          {/* `lg:h-[380px] overflow-hidden` — the actual guarantee that
              this card never grows or shrinks. The tab-collapse trick in
              FaqAside (hiding the other three category pills while an
              answer is open) gets most of the way there on its own, but
              measured across all 12 questions it still swings from 306px
              (closed, tabs wrapped to two rows) to 375px (the longest
              open answer) — a 40-70px difference that used to shift the
              Promo/Telegram row underneath it. 380px is that measured max
              plus a few px of headroom; overflow-hidden clips the rare
              case that isn't accounted for instead of growing past it. */}
          <div className="rounded-2xl border border-paper/10 bg-ink/45 p-4 backdrop-blur-md sm:p-5 lg:h-[380px] lg:overflow-hidden">
            <FaqAside />
          </div>
        </Appear>

        {/* Narrowed ~30% (was max-w-2xl/672px) and left-aligned, extra mt
            below the search bar — Egor's ask: the five reasons read as
            cramped edge-to-edge with the search bar above; less width and
            more breathing room per row is what makes the block "dышать",
            and left-aligning keeps it flush with the Telegram/Promo pair
            underneath instead of centered off from them. */}
        <div className="mt-10 lg:mt-8 lg:max-w-[470px] lg:self-start">
          {/* Five separate cards, one shared accent (orange, the same one
              FaqAside's own pills and "+" use right next to this) instead
              of a rainbow per card — Egor's call after the multicolour pass
              read as a different system from the FAQ beside it. */}
          {/* Row gap +50% (was gap-3/12px, now 18px) and short-screen
              fallback scaled the same way (gap-1.5/6px -> 9px) — Egor's ask
              for more air between rows. */}
          <div className="flex flex-col gap-[18px] [@media(max-height:760px)]:gap-[9px]">
            {why.reasons.map((reason, i) => {
              const isOpen = openReason === i;
              return (
                <Appear key={reason.title} from="up" delay={BEAT.content + i * STAGGER.tight}>
                  <div
                    className="rounded-lg bg-ink/45 backdrop-blur-md transition-[border-color]"
                    style={{ borderLeft: `3px solid ${isOpen ? REASON_ACCENT.solid : REASON_ACCENT.dim}` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenReason(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 px-3.5 py-1 text-left"
                    >
                      <span
                        className="shrink-0 font-display text-[10px] tracking-[0.2em]"
                        style={{ color: isOpen ? REASON_ACCENT.solid : "rgba(220,221,239,0.45)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-xs uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                        {reason.title}
                      </span>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] text-paper/60 transition-transform duration-200"
                        style={
                          isOpen
                            ? { transform: "rotate(45deg)", borderColor: `${REASON_ACCENT.solid}80`, color: REASON_ACCENT.solid }
                            : { borderColor: "rgba(220,221,239,0.2)" }
                        }
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="description"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: REASON_EASE }}
                          className="max-w-lg overflow-hidden"
                        >
                          <p className="px-3.5 pb-2.5 pl-[3rem] text-xs leading-relaxed text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                            {reason.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Appear>
              );
            })}
          </div>
        </div>

        {/* Swapped with PromoCard below — Egor's ask. Now sits under FAQ in
            column 1, so the 300/340px width it already had (see the note
            it carried before the swap) is exactly right for its new spot
            without changing. */}
        <Appear from="up" delay={BEAT.cta} className="mt-2 lg:h-full lg:max-w-[300px] xl:max-w-[340px]">
          {(() => {
            const ask = TRUST_ASK[active === "ai" ? "ai" : "content"];
            return (
              <TeamAskCard
                member={ask.member}
                question={ask.question}
                pitch={ask.pitch}
                actionLabel={ask.actionLabel}
                compact
                className="h-full"
              />
            );
          })()}
        </Appear>

        {/* Swapped with the Telegram card above — Egor's ask. Now sits under
            the five reasons in column 2, so its width is pinned to match
            theirs (470px, see that block's own note) instead of stretching
            to the old 672px column. `promo-card-pulse-glow` (globals.css)
            adds the same slow breathing glow BlockAssistant's search bar
            has, in the card's own magenta→orange pair, since Egor asked
            for this card specifically to pulse the way that bar does. */}
        <Appear from="up" delay={BEAT.cta} className="hidden lg:mt-2 lg:block lg:h-full lg:max-w-[470px]">
          {active === "content" && (
            <PromoCard
              glow
              image="/images/service-ai.jpg"
              video="/video/ai-reel.mp4"
              badge="Акция только в сентябре"
              title="AI-видеоконтент"
              subtitle="AI Reels на актуальных моделях генерации. Не просто красивый кадр: внутри сценарий и маркетинговая логика — зацеп в первую секунду, удержание до конца, понятное действие в финале. Десять секунд, которые работают на заявки."
              price="9 500 ₽"
              oldPrice="17 500 ₽"
              href="/content/ai-video"
              leadPrefill={{ format: "AI-видео", wishes: "Акция сентября — 10-секундный ролик за 9 500 ₽" }}
            />
          )}
        </Appear>
      </div>
      </div>
    </CinematicSection>
  );
}
