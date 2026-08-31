import type { Metadata } from "next";
import CinematicStage, { type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import ChapterRail from "@/components/ui/ChapterRail";
import AiPitch from "@/components/home/ai/AiPitch";
import AiPortfolio from "@/components/home/ai/AiPortfolio";
import AiSegments from "@/components/home/ai/AiSegments";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import AiGuarantees from "@/components/home/ai/AiGuarantees";
import Process from "@/components/home/Process";
import { AI_PROCESS_STEPS } from "@/components/home/ai/aiProcessSteps";
import { AI_INTERACTIVE_TIERS } from "@/components/home/ai/aiPricingTiers";
import Close from "@/components/home/Close";
import { AI_SEO_SECTIONS } from "@/components/home/ai/aiSeoSections";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "AI-решения — HDKV.AGENCY",
  description: "Внедряем ИИ-инструменты в продакшн и коммуникацию с клиентами.",
};

// Same deck as /content: one continuous film pinned behind chapters that step
// one per gesture, each phase playing out and then holding — defocused — on
// its closing frame. See CinematicStage for the mechanics. Every section of
// the page now lives inside this one deck — none of it releases into plain
// scroll below, matching /content's own page structure.
//
// public/video/ai-reel.mp4 is the founder's second reel for this page, only
// transcoded for the web (1280×720, ~1.18 Mbps, one keyframe per second so a
// seek back to a phase start lands clean, audio dropped). 53.71s long.
//
// The founder gave the phases below in whole seconds — 8 blocks for 8
// chapters. Snapped here to the footage's own cuts instead of those round
// numbers: an ffmpeg scene-detect pass (`select='gt(scene,0.03)'`) against
// the actual file found real cuts up to ~0.4s off the whole-second reading
// at a couple of boundaries (27.58s and 39.42s, not 28s/39s) — enough to
// read as a raw splice poking out of the blur hold, since the reveal ramp on
// the new phase was timed against a boundary the footage's own cut didn't
// actually sit on. Every boundary below is one of those detected cuts:
//
//   01  0     → 7.14   AiPitch
//   02  7.14  → 10.04  AiPortfolio
//   03  10.04 → 16.85  AiSegments
//   04  16.85 → 22.08  Trust
//   05  22.08 → 27.58  Offer
//   06  27.58 → 39.42  AiGuarantees (carries the former standalone team/blog note)
//   07  39.42 → 47.21  Process
//   08  47.21 → end    Close
const PHASES: Phase[] = [
  { start: 0, end: 7.14 },
  { start: 7.14, end: 10.04 },
  { start: 10.04, end: 16.85 },
  { start: 16.85, end: 22.08 },
  { start: 22.08, end: 27.58 },
  { start: 27.58, end: 39.42 },
  { start: 39.42, end: 47.21 },
  // The reel's actual duration is 53.708s — ending the last phase right at
  // (or past) that meant the tick loop's own "remaining <= 0" hold could
  // never fire before the <video> hit its native end first, and the tick
  // loop's self-heal (see CinematicStage) then called .play() on an already-
  // ended video, which some browsers answer by restarting it from 0 instead
  // of staying put. Comfortable margin here is what makes chapter 08 hold
  // and blur on the car, same as every other chapter, instead of looping.
  { start: 47.21, end: 53.4 },
];

const CHAPTERS: ChapterMeta[] = [
  { id: "pitch" },
  { id: "portfolio" },
  { id: "segments" },
  { id: "trust" },
  { id: "offer" },
  { id: "guarantees" },
  { id: "process" },
  { id: "close" },
];

export default function AiServicePage() {
  return (
    <ServiceProvider forcedValue="ai">
      <ServiceMenuOverlay service="ai" />

      {/* `push` is the slow zoom across the whole film — chapters 04 and 06
          sit on footage that is nearly frozen, and without it those screens
          look like a still. maxBlurPx started at 26px, was halved to 13px,
          then halved again to 6.5px. brightness went 1x → 1.3 → 1.69 (blew
          the footage out) → 1.4 (still read too hot, washing out detail) →
          1.12, 20% down from 1.4 — per the founder's own reports each round,
          so the film's texture stays visible instead of flattening out. */}
      {/* .ai-cool-headings turns every chapter heading inside the stage
          emerald, including the chapters whose components are shared with the
          other service pages (Trust, Offer, Process, Close) and so can't take
          a per-page class through props. Same mechanism /sites uses for its
          warm headings — see .ai-cool-headings in globals.css. */}
      <div className="ai-cool-headings">
      <CinematicStage
        src="/video/ai-reel.mp4"
        poster="/images/ai-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        maxBlurPx={6.5}
        // 0.9 → 1.15s: a little more cushion on top of the corrected phase
        // boundaries above, so a soft/flickery cut (the film has one such
        // stretch, not a single clean frame) still reads as covered by the
        // blur rather than poking out of it mid-reveal.
        blurSeconds={1.15}
        brightness={1.12}
        push
        // The left-edge chapter rail, in /ai's own lime→emerald gradient —
        // each of the eight segments takes its hue from its position down the
        // ramp, so scrolling the deck walks the gradient. Same component
        // /sites uses, only with its own colours and chapter count.
        rail={<ChapterRail count={CHAPTERS.length} from="#c8f169" to="#10b981" />}
      >
        {/* No icon on chapter 01 (pitch) by request — icons start from
            chapter 02. AiPortfolio/AiSegments/AiGuarantees each carry their
            own emerald icon via their own `decor` prop; Trust/Offer/Process
            are shared across services and only show their own content-only
            icon (gated on `active === "content"`), so /ai renders no icon on
            those three; Close takes /ai's icon via its own `ctaIcon` prop,
            pinned beside its closing line rather than floating in the
            header. Every icon lives inside its own CinematicSection rather
            than as a sibling here — CinematicStage pins every chapter in the
            same viewport and only each CinematicSection's own active-chapter
            gating hides the ones not currently showing. A sibling icon
            outside that gating rendered unconditionally, bleeding through
            on top of whichever chapter was actually active. */}
        <AiPitch />
        <AiPortfolio />
        <AiSegments />
        <Trust
          index={3}
          chapter="04"
          title={<>Продюсерский центр, <span className="kw">не коробка</span></>}
          intro={<>AI-инструменты внедряем с 2024 года внутри агентства полного цикла. Около <span className="kw">60% заказов</span> — клиенты, которые возвращаются.</>}
          clients={[]}
        />
        <Offer
          index={4}
          chapter="05"
          title={<>Лучшие в <span className="kw">AI</span></>}
          intro={<>Съёмка, монтаж, графика и <span className="kw">AI-продакшн</span> — под формат и площадку.</>}
        />
        <AiGuarantees />
        <Process
          index={6}
          chapter="07"
          title={<>Как проходит <span className="kw">внедрение</span></>}
          intro={<>Шесть шагов от аудита до сопровождения. На каждом — понятный результат и <span className="kw">точка согласования</span>.</>}
          steps={AI_PROCESS_STEPS}
        />
        <Close
          index={7}
          chapter="08"
          title={<>Персональные <span className="kw">условия</span></>}
          intro={<>Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: <span className="kw">консультация, смета</span> и 2–3 концепции.</>}
          dense
          interactiveTiers={AI_INTERACTIVE_TIERS}
          seoEyebrow="Подробнее о AI-решениях"
          seoSections={AI_SEO_SECTIONS}
          titleClassName="text-[1.6rem] sm:text-[2.6rem] lg:text-[2.6rem] xl:text-[3.15rem]"
          // The cursor used to float in the header corner via `decor`,
          // unrelated to any particular piece of copy. Moved here instead —
          // Close renders it right beside "Начать проект сейчас" (its own
          // `ctaIcon` slot, see that component) so it reads as clicking that
          // exact line, at every viewport rather than only lg+ (no `hidden
          // lg:block` here, unlike AiDecoIcon's other placements — the ask
          // was for it to hold there "at any breakpoint").
          ctaIcon={
            <img
              // Keyed even though this is a single element and not part of a
              // list here. Close drops it into a <Link> beside the closing
              // line, and next/link runs its children through an array — at
              // which point React sees an element created in this file with
              // no key and warns ("Check the render method of LinkComponent…
              // It was passed a child from AiServicePage"). A key on the
              // element itself is the contained fix; the alternative is
              // restructuring Close's own markup for every page that uses it.
              key="cta-icon"
              src="/images/icons/ai/close.png?v=2"
              alt=""
              aria-hidden="true"
              width={34}
              className="ai-deco-icon-click inline-block w-7 shrink-0 rounded-[10px] sm:w-9"
              style={{ "--r": "-7deg" } as React.CSSProperties}
            />
          }
        />
      </CinematicStage>
      </div>

    </ServiceProvider>
  );
}
