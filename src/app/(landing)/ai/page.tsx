import type { Metadata } from "next";
import CinematicStage, { type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import AiPitch from "@/components/home/ai/AiPitch";
import AiPortfolio from "@/components/home/ai/AiPortfolio";
import AiSegments from "@/components/home/ai/AiSegments";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import AiGuarantees from "@/components/home/ai/AiGuarantees";
import Process from "@/components/home/Process";
import { AI_PROCESS_STEPS } from "@/components/home/ai/aiProcessSteps";
import AiTeamBlog from "@/components/home/ai/AiTeamBlog";
import Close from "@/components/home/Close";
import AiSeoText from "@/components/home/ai/AiSeoText";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "AI-решения — HDKV.AGENCY",
  description: "Внедряем ИИ-инструменты в продакшн и коммуникацию с клиентами.",
};

// Same deck as /content: one continuous film pinned behind chapters that step
// one per gesture, each phase playing out and then holding — defocused — on
// its closing frame. See CinematicStage for the mechanics.
//
// public/video/ai-reel.mp4 is the supplied footage whole and unedited, only
// transcoded for the web (1280×720, ~1.2 Mbps, one keyframe per second so a
// seek back to a phase start lands clean, audio dropped). 31.625s long.
//
// The phases below are where playback rests. Boundaries were read off the
// footage itself — its hard cuts at 2.375, 4.292, 6.625, 9.958 and the flash
// at 26.083, plus the points where motion drops to a standstill (7.0–9.9,
// 14.5–20.5, 25.5–26.0) — so each chapter both opens on a cut and freezes on
// a frame the film had already settled onto:
//
//   01  0     → 4.29   the android, two quick cuts
//   02  4.29  → 9.96   the glass office, holding on the man at the laptop
//   03  9.96  → 14.5   the chameleon reveal, settling
//   04  14.5  → 21.0   the canopy overhead, near-still (the push carries it)
//   05  21.0  → 26.08  the android close-up, resting just before the flash
//   06  26.08 → 31.63  flash, hands on the keys, the last look up
//
// Six phases is what the film holds, so the deck is six chapters — the last
// three sections of the page (process, team, close) sit below it in ordinary
// scroll rather than stretching a seventh phase out of footage that hasn't
// got one.
const PHASES: Phase[] = [
  { start: 0, end: 4.292 },
  { start: 4.292, end: 9.958 },
  { start: 9.958, end: 14.5 },
  { start: 14.5, end: 21.0 },
  { start: 21.0, end: 26.083 },
  { start: 26.083, end: 31.625 },
];

const CHAPTERS: ChapterMeta[] = [
  { id: "pitch" },
  { id: "portfolio" },
  { id: "segments" },
  { id: "trust" },
  { id: "offer" },
  { id: "guarantees" },
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
      <CinematicStage
        src="/video/ai-reel.mp4"
        poster="/images/ai-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        maxBlurPx={6.5}
        blurSeconds={0.9}
        brightness={1.12}
        push
      >
        <AiPitch />
        <AiPortfolio />
        <AiSegments />
        <Trust
          index={3}
          chapter="04"
          title="Продюсерский центр, не коробка"
          intro="AI-инструменты внедряем с 2024 года внутри агентства полного цикла. Около 60% заказов — клиенты, которые возвращаются."
          clients={[]}
        />
        <Offer index={4} chapter="05" />
        <AiGuarantees />
      </CinematicStage>

      {/* Below the deck the page releases into ordinary scroll. These are the
          same CinematicSection components, which render always-visible and in
          normal flow outside a stage (see useIsStaged there) — the `index`
          props are inert here and only keep the chapter numbering honest. */}
      <Process
        index={6}
        chapter="07"
        title="Как проходит внедрение"
        intro="Шесть шагов от аудита до сопровождения. На каждом — понятный результат и точка согласования."
        steps={AI_PROCESS_STEPS}
      />
      <AiTeamBlog />
      <Close index={8} chapter="09" />

      <AiSeoText />
    </ServiceProvider>
  );
}
