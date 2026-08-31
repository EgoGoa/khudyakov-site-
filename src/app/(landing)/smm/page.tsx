import type { Metadata } from "next";
import CinematicStage, { type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import ChapterRail from "@/components/ui/ChapterRail";
import SmmPitch from "@/components/home/smm/SmmPitch";
import SmmMethod from "@/components/home/smm/SmmMethod";
import SmmOffer from "@/components/home/smm/SmmOffer";
import SmmProcess from "@/components/home/smm/SmmProcess";
import SmmGuarantees from "@/components/home/smm/SmmGuarantees";
import SmmClose from "@/components/home/smm/SmmClose";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "SMM — HDKV.AGENCY",
  description:
    "SMM силами продакшена: съёмка, монтаж и ведение соцсетей одной командой, без подрядчиков со стороны.",
};

// public/video/smm-reel.mp4 is Egor's delivery for this page (bg-smm.mp4 was
// only ever the 10s preview loop used in DirectionsGrid/ServicePicker),
// transcoded the same way as /ai's and /sites' reels: 1280×720, ~1.18 Mbps,
// one keyframe per second, audio dropped. Unlike /sites' reel it is the
// delivered file untouched — no fragment needed re-timing, so every timestamp
// below is the source's own.
//
// The reel is a night sequence — a terrace, a club, a shooting star, a
// sunrise terrace — cut from several shots rather than one unbroken take, so
// the phase boundaries come from a scene-detect pass (ffmpeg
// `select='gt(scene,0.02)'`) cross-checked frame by frame either side of
// every hit. The detector reports ten cuts; the six chapters use five of
// them, and the five it uses are the ones nearest Egor's own timecodes.
//
// Egor's timecodes were 4 / 13 / 20 / 23 / 29. Each was moved by at most half
// a second onto the film's own edit:
//
//   его 4   → 3.60   терраса ночью → клуб
//   его 13  → 13.52  крупный план → широкий танцпол
//   его 20  → 19.64  танцпол → бассейн ночью
//   его 23  → 23.44  звездопад → танец в клубе
//   его 29  → 28.50  силуэты в клубе → терраса на закате
//
// The move is the whole point rather than a liberty taken with the brief: the
// blur hold has to land on a cut the footage already has, so the defocus
// covers an event that is in the film anyway. Stopping at a round 4.00 —
// four tenths into a shot that has already started — freezes the picture
// mid-scene and starts it again mid-scene, which reads as a stutter with
// nothing in the frame to justify it. That exact mistake was made and
// reverted on /sites (see the 4.40 note in that page's own comments).
//
// Frame-by-frame confirmation of all five, 0.15s either side: 3.45/3.75,
// 13.40/13.65, 19.50/19.80, 23.30/23.60, 28.35/28.65 — every pair is a
// different shot, so none of the five is camera motion mistaken for an edit.
//
//   01  0      → 3.60   SmmPitch       (терраса ночью, двое)
//   02  3.60   → 13.52  SmmMethod      (разговор в клубе — самая длинная фаза)
//   03  13.52  → 19.64  SmmOffer       (танцпол)
//   04  19.64  → 23.44  SmmProcess     (бассейн, падающая звезда — тихая доля)
//   05  23.44  → 28.50  SmmGuarantees  (танец, крупные планы)
//   06  28.50  → end    SmmClose       (терраса на закате)
const PHASES: Phase[] = [
  { start: 0, end: 3.6 },
  { start: 3.6, end: 13.52 },
  { start: 13.52, end: 19.64 },
  { start: 19.64, end: 23.44 },
  { start: 23.44, end: 28.5 },
  // Ends a shade before the file's 32.583 so the last chapter holds on a real
  // frame rather than on whatever the decoder leaves at the very tail.
  //
  // Brightness is lifted for this phase alone. Egor's timecode of 29 stands —
  // the boundary is not moved — but the fragment it opens is by far the
  // darkest in the reel (a terrace after sunset), and at the page's 1.16 the
  // closing chapter read as an unlit black page rather than as film. 1.5 is
  // the phase's own multiplier; every other chapter keeps 1.16.
  { start: 28.5, end: 32.5, brightness: 1.5 },
];

const CHAPTERS: ChapterMeta[] = [
  { id: "pitch" },
  { id: "method" },
  { id: "offer" },
  { id: "process" },
  { id: "guarantees" },
  { id: "close" },
];

export default function SmmServicePage() {
  return (
    <ServiceProvider forcedValue="smm">
      <ServiceMenuOverlay service="smm" />

      {/* .smm-violet-headings repaints every chapter heading inside the stage
          from the site's cyan neon to this page's violet, and carries the
          tier cards' accent in chapter 06 (see globals.css). All six chapters
          are this page's own components and set the violet classes directly,
          so the wrapper is belt-and-braces — it stays because it is also what
          would catch any shared component dropped back into this stage later.
          A plain div: no overflow, transform or filter, so it does not become
          a containing block and the stage's `position: sticky` still resolves
          against the same scroll ancestor. */}
      <div className="smm-violet-headings">
        <CinematicStage
          src="/video/smm-reel.mp4"
          poster="/images/smm-reel-poster.jpg"
          phases={PHASES}
          chapters={CHAPTERS}
          // Deepened and lengthened from the page's first pass (10 / 0.9) —
          // Egor asked for the chapter-to-chapter stitch to read richer too,
          // not just the reveal inside each chapter. The shortest phase on
          // this reel is 3.8s (19.64→23.44); at 1.15s the ramp in and out
          // together take 2.3s, still leaving ~1.5s of a clear frame before
          // the next hold starts — checked against that phase specifically
          // rather than assumed safe.
          maxBlurPx={14}
          blurSeconds={1.15}
          // The reel is a night shoot and grades darker than /sites' footage,
          // so it is lifted a little further to keep the chapters' body copy
          // off a near-black frame.
          brightness={1.16}
          // The rail runs in the page's own violet → sky, the same gradient
          // the chapter keyword spans use — matching the rail to the actual
          // keyword accent rather than to a separate halo, which is how /ai
          // and /sites do it too.
          rail={<ChapterRail count={CHAPTERS.length} from="#a855f7" to="#38bdf8" />}
        >
          <SmmPitch />
          <SmmMethod />
          <SmmOffer />
          <SmmProcess />
          <SmmGuarantees />
          <SmmClose />
        </CinematicStage>
      </div>
    </ServiceProvider>
  );
}
