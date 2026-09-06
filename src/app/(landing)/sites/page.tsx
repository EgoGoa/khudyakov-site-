import type { Metadata } from "next";
import CinematicStage, { type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import SitesPitch from "@/components/home/sites/SitesPitch";
import ChapterRail from "@/components/ui/ChapterRail";
import SitesMethodAudience from "@/components/home/sites/SitesMethodAudience";
import SitesOffer from "@/components/home/sites/SitesOffer";
import SitesProcess from "@/components/home/sites/SitesProcess";
import SitesGuarantees from "@/components/home/sites/SitesGuarantees";
import SitesClose from "@/components/home/sites/SitesClose";
import SeoLongRead from "@/components/home/shared/SeoLongRead";
import { SITES_SEO_SECTIONS } from "@/components/home/sites/sitesSeoSections";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Vibe сайты — HDKV.AGENCY",
  description: "Сайты под ключ с помощью AI-инструментов под контролем опытной команды.",
};

// public/video/sites-reel.mp4 is Egor's second delivery for this page (his
// first, bg-sites.mp4, was only ever the small preview loop used in
// DirectionsGrid), transcoded the same way as /ai's reel: 1280×720, ~1.18
// Mbps, one keyframe per second, audio dropped.
//
// It is not the delivered file untouched: one half-second, 15.5–16.05, is
// slowed 2.5x in the file (ffmpeg trim/setpts/concat). That is the whip-pan
// as the cheetah launches — at source speed it is 13 frames of unreadable
// smear that looked like a decode fault. Stretched it plays as motion blur,
// which is what it always was. The re-encode makes the reel 37.50s instead
// of 36.625s, and every timestamp after 16.05 therefore sits +0.875s later
// than in the original — the boundaries below are already in the new file's
// timebase, so don't cross-check them against the delivered .mov.
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
// Two of those six boundaries were then moved off their cut for reasons the
// notes below each explain — 01 for composition, 03 to bury a whip-pan:
//
//   01  0      → 3.00   SitesPitch          (garage exit, cabin)
//   02  3.00   → 13.42  SitesMethodAudience (drive through, arrival)
//   03  13.42  → 20.09  Offer               (the whole cheetah scene)
//   04  20.09  → 28.01  Process             (night drive, interior)
//   05  28.01  → 34.30  SitesGuarantees     (the house, arriving)
//   06  34.30  → end    Close               (out of the car, at the house)
// Chapter 01 ends at 3.00, not at the 8.10 cut and not at the 4.40 that was
// tried before it.
//
// 8.10 was rejected on composition: from ~4.4s the car fills the frame on a
// close side-pan, so chapter 01's copy would have had to lie across it.
// 4.40 fixed that but broke something more visible — a frame-by-frame check
// either side of it (4.30 vs 4.50, and 5.00 vs 5.15) shows one continuous
// exterior pan with no cut anywhere near, so the hold was freezing the film
// mid-move and starting it again mid-move. That reads as a jolt, because
// nothing in the footage justifies a stop there.
//
// 3.00 is the only real edit inside 0–8.10: the detector flags it, and 2.90
// vs 3.05 confirms it by eye — the in-car camera jumps. Stopping on the
// film's own edit means the blur covers an event the footage already has,
// which is the whole premise of the hold. Chapter 01 keeps the garage exit
// and the cabin (left of frame is dark door and dashboard, both faces sit
// right of centre — the left column stays clear), and chapter 02 takes the
// pan it was already authored against. No footage is skipped.
const PHASES: Phase[] = [
  { start: 0, end: 3.0 },
  { start: 3.0, end: 13.42 },
  // Chapter 03 owns the cheetah scene end to end: 13.42 is the film's cut
  // into it and 19.21 the cut out of it. Everything the animal does — sitting
  // by the roadside, the car passing, the launch, the run, leaving frame —
  // plays inside this one chapter, and the chapter ends exactly where the
  // cheetah footage does.
  //
  // Two earlier attempts trimmed this scene and both were rejected: ending
  // at 15.40 cut the run off before it started, and running 15.95→17.15
  // showed only the run, dropping the sitting shot the scene opens on. The
  // scene is meant to be seen whole.
  //
  // Showing the scene whole meant the 15.5–16.05 whip-pan played in the
  // open, and at 24fps it was pure smear — it read as a broken file rather
  // than as a camera move. Rather than hide it behind a boundary (tried, and
  // it cost the scene), that half second was slowed 2.5x in the file itself,
  // so it now lasts long enough to be read as motion blur on a launching
  // animal. See the reel note at the top for the re-encode.
  { start: 13.42, end: 20.085 },
  { start: 20.085, end: 28.005 },
  { start: 28.005, end: 34.295 },
  { start: 34.295, end: 37.35 },
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

      {/* .sites-warm-headings turns every chapter heading inside the stage
          from the site's cyan neon to the brand orange (see globals.css).
          All six chapters are now this page's own components and set the warm
          class directly, so this wrapper is belt-and-braces rather than the
          only route — it stays because it is also what would catch any shared
          component dropped back into this stage later. A plain div: no
          overflow, transform or filter, so it does not become a containing
          block and the stage's `position: sticky` still resolves against the
          same scroll ancestor it did before. */}
      <div className="sites-warm-headings">

      <CinematicStage
        src="/video/sites-reel.mp4"
        poster="/images/sites-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        maxBlurPx={10}
        blurSeconds={0.9}
        brightness={1.1}
        // The left-edge rail runs in the same magenta→cyan gradient the
        // chapter keyword spans use (the logo mark's own gradient, shared
        // site-wide, unlike /ai's page-specific lime→emerald) — Egor's call,
        // matching the rail's colour to the actual keyword accent rather than
        // to the page's separate orange halo.
        rail={<ChapterRail count={CHAPTERS.length} from="#ff4fd8" to="#00d2ff" />}
      >
        <SitesPitch />
        <SitesMethodAudience />
        <SitesOffer />
        <SitesProcess />
        <SitesGuarantees />
        <SitesClose />
      </CinematicStage>
      </div>

      <SeoLongRead eyebrow="Подробнее о сайтах на AI" sections={SITES_SEO_SECTIONS} />

    </ServiceProvider>
  );
}
