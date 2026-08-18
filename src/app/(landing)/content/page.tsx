import type { Metadata } from "next";
import Link from "next/link";
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
          {/* The offer used to sit under the grid, which meant the tiles had
              to leave room for it above the fold — now it sits beside the
              grid instead, so the tiles get the space and can run bigger. */}
          <div className="lg:flex lg:items-start lg:gap-8">
            <div className="lg:min-w-0 lg:flex-1">
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
            </div>

            <Appear from="up" delay={1.0} className="mt-6 lg:mt-0 lg:w-[280px] lg:shrink-0 xl:w-[300px]">
              <div className="rounded-2xl bg-ink/45 p-5 backdrop-blur-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-orange">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                  Нашли похожий формат?
                </span>
                <p className="mt-3 font-sans text-xl leading-[1.15] text-paper">
                  Пришлите ссылку в брифе <span className="font-semibold text-orange">бесплатно</span>
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-paper/60">
                  Соберём смету и 2–3 концепции — без предоплаты за идею.
                </p>
                <Link href="/brief" className="btn-neon btn-warm btn-3d mt-4 w-full justify-center !py-3.5">
                  Заполнить бриф
                </Link>
              </div>
            </Appear>
          </div>
        </CinematicSection>

        <Trust />
        <Offer />
        <Process />
        <Close />
      </CinematicStage>
    </ServiceProvider>
  );
}
