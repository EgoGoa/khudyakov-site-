import type { Metadata } from "next";
import Link from "next/link";
import FunnelCta from "@/components/ui/FunnelCta";
import Appear from "@/components/ui/Appear";
import Opening from "@/components/home/Opening";
import Works from "@/components/home/Works";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import Process from "@/components/home/Process";
import Close from "@/components/home/Close";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import CinematicStage, { type ChapterMeta } from "@/components/ui/CinematicStage";
import CinematicSection from "@/components/ui/CinematicSection";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Создание контента — HDKV.AGENCY",
  description: "Съёмка и монтаж роликов под ваш формат и площадку.",
};

// public/video/content-reel.mp4 is the source reel whole and unedited — no
// segments joined, no dissolves added. Two earlier passes cut it up (first
// butt-joined, then cross-dissolved) and both read as the film breaking; the
// footage carries its own edit, and anything layered on top of that shows.
//
// The phases below are just where playback rests. The boundaries are the
// timecodes chosen by hand against the footage, given as seconds:frames at
// 25fps — 09:15, 18:09, 23:05, 28:05, 43:05 — converted to seconds here.
// (43:05 lands exactly on the file's 43.2s duration, which confirms the
// reading.)
//
// Those are five boundaries for six chapters, so the last stretch is split at
// 38.4s — a scene change in the film itself — to give chapter 06 the neon
// finale. Everything before that is exactly as specified.
//
// A chapter holds on its closing frame and scrolling on resumes straight
// through, so the picture runs continuously from 0 to 43.2s across a full
// scroll and never carries a join of ours.
const PHASES = [
  { start: 0, end: 9.6 }, // 09:15
  { start: 9.6, end: 18.36 }, // 18:09
  { start: 18.36, end: 23.2 }, // 23:05
  { start: 23.2, end: 28.2 }, // 28:05
  { start: 28.2, end: 38.4 }, // split (see above)
  { start: 38.4, end: 43.2 }, // 43:05
];

// One viewport-height of runway per chapter, so every chapter costs the same
// gesture to pass and each is its own snap step.
const CHAPTERS: ChapterMeta[] = [
  { id: "opening" },
  { id: "works" },
  { id: "why" },
  { id: "services" },
  { id: "process" },
  { id: "contact" },
];

// The Hero and ServicePicker above these chapters live in the shared
// (landing)/layout.tsx and are deliberately left untouched.
export default function ContentServicePage() {
  return (
    <ServiceProvider forcedValue="content">
      <ServiceMenuOverlay service="content" />

      <CinematicStage
        src="/video/content-reel.mp4"
        poster="/images/content-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
      >
        <Opening service="content" />

        <CinematicSection
          index={1}
          chapter="02"
          title="Работы"
          icon="frames"
          side="right"
          intro="78 проектов: реклама, шоурилы, 3D и моушн."
        >
          {/* The works run edge to edge in two columns; everything that serves
              them is arranged around that grid rather than stacked into one
              side column, which left the tiles looking penned in. Filters take
              the left of the row above, the catalogue link the right, and the
              offer sits underneath the grid across the full width. */}
          <Works
            bare
            limit={4}
            filtersAside={
              <Link
                href="/works"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-paper/80 transition hover:text-glow"
              >
                Весь каталог — 78 работ
                <span aria-hidden="true">→</span>
              </Link>
            }
          />

          <Appear from="up" delay={1.0}>
            <FunnelCta
              item="brief"
              layout="row"
              pitch="Нашли похожий формат? Пришлите ссылку в брифе — соберём смету и 2–3 концепции бесплатно."
              className="mt-4"
            />
          </Appear>
        </CinematicSection>

        <Trust />
        <Offer />
        <Process />
        <Close />
      </CinematicStage>
    </ServiceProvider>
  );
}
