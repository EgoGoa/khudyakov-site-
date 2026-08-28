import type { Metadata } from "next";
import CinematicStage, { type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import SitesPitch from "@/components/home/sites/SitesPitch";
import SitesMethodAudience from "@/components/home/sites/SitesMethodAudience";
import Offer from "@/components/home/Offer";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import Process from "@/components/home/Process";
import { SITES_PROCESS_STEPS } from "@/components/home/sites/sitesProcessSteps";
import SitesGuarantees from "@/components/home/sites/SitesGuarantees";
import Close from "@/components/home/Close";
import SitesSeoText from "@/components/home/sites/SitesSeoText";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Vibe сайты — HDKV.AGENCY",
  description: "Сайты под ключ с помощью AI-инструментов под контролем опытной команды.",
};

// public/video/sites-reel.mp4 is Egor's second delivery for this page (his
// first, bg-sites.mp4, was only ever the small preview loop used in
// DirectionsGrid), transcoded the same way as /ai's reel: 1280×720, ~1.18
// Mbps, one keyframe per second, audio dropped. 36.625s long.
//
// The reel is a compilation-style cut (a person getting into a car, driving,
// arriving at a house) rather than one unbroken shot like /content's or
// /ai's footage, so the phase boundaries below come from an actual
// scene-detect pass (ffmpeg `select='gt(scene,0.03)'`) cross-checked frame by
// frame — several of the raw detector hits turned out to be camera motion
// (a fast zoom, a car's motion blur passing through frame) rather than real
// cuts, and were discarded. What's left is exactly 6 real cuts, one fewer
// than this page's previous 7 chapters — see SitesMethodAudience for why
// "Никакой магии" and "Кому подходит" now share one chapter instead of two:
//
//   01  0      → 8.10   SitesPitch        (into the car, out of the garage)
//   02  8.10   → 13.42  SitesMethodAudience (drive through, arrival)
//   03  13.42  → 19.21  Offer             (roadside cheetah, car passing)
//   04  19.21  → 27.13  Process           (interior, night drive, talking)
//   05  27.13  → 33.42  SitesGuarantees   (the house, arriving)
//   06  33.42  → end    Close             (out of the car, at the house)
const PHASES: Phase[] = [
  { start: 0, end: 8.1 },
  { start: 8.1, end: 13.42 },
  { start: 13.42, end: 19.21 },
  { start: 19.21, end: 27.13 },
  { start: 27.13, end: 33.42 },
  { start: 33.42, end: 36.5 },
];

const CHAPTERS: ChapterMeta[] = [
  { id: "pitch" },
  { id: "method" },
  { id: "offer" },
  { id: "process" },
  { id: "guarantees" },
  { id: "close" },
];

export default function SitesServicePage() {
  return (
    <ServiceProvider forcedValue="sites">
      <ServiceMenuOverlay service="sites" />

      <CinematicStage
        src="/video/sites-reel.mp4"
        poster="/images/sites-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        maxBlurPx={10}
        blurSeconds={0.9}
        brightness={1.1}
      >
        <SitesPitch />
        <SitesMethodAudience />
        <Offer
          index={2}
          chapter="03"
          title="Что мы делаем"
          intro="От одностраничного лендинга до сайта под ключ с интеграциями — вёрстка на React/HTML, без привязки к конструктору."
          spacious
          decor={
            <SitesDecoIcon
              src="/images/icons/sites/code.png"
              size={380}
              rotate={8}
              className="right-2 bottom-0 lg:right-8"
            />
          }
        />
        <Process
          index={3}
          chapter="04"
          title="Как проходит работа"
          intro="Пять шагов от брифа до запуска — на каждом понятный результат и точка согласования."
          steps={SITES_PROCESS_STEPS}
          spacious
        />
        <SitesGuarantees />
        <Close index={5} chapter="06" spacious />
      </CinematicStage>

      <SitesSeoText />
    </ServiceProvider>
  );
}
