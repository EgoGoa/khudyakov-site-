import type { Metadata } from "next";
import Link from "next/link";
import Opening from "@/components/home/Opening";
import Works from "@/components/home/Works";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import Process from "@/components/home/Process";
import Close from "@/components/home/Close";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import CinematicStage, { type ChapterMeta } from "@/components/ui/CinematicStage";
import ChapterRail from "@/components/ui/ChapterRail";
import CinematicSection from "@/components/ui/CinematicSection";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
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

      {/* .content-warm-headings turns every `.kw` keyword span inside the
          stage from the site-wide magenta→cyan to /content's own
          magenta→orange (Egor's pick — see .content-warm-headings in
          globals.css). Same mechanism /ai and /sites use for their own
          accent colours. */}
      <div className="content-warm-headings">
      <CinematicStage
        src="/video/content-reel.mp4"
        poster="/images/content-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        // The left-edge rail follows the same magenta→orange gradient as the
        // keyword spans above.
        rail={<ChapterRail count={CHAPTERS.length} from="#ff4fd8" to="#ff6a3d" />}
      >
        <Opening service="content" />

        <CinematicSection
          index={1}
          chapter="02"
          title={<>Наши <span className="kw">работы</span></>}
          icon="frames"
          side="right"
          intro={<><span className="kw">78 проектов</span>: реклама, шоурилы, 3D и моушн.</>}
          // A 2×2 grid of video tiles under the default text-8xl title was
          // tall enough to clip its own bottom row on short/wide viewports
          // (the deck can't scroll a chapter internally on desktop — see
          // CinematicStage's paneRoom comment). A smaller title reclaims the
          // header space instead of shrinking the tiles themselves.
          titleClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-6xl"
          // Sits behind the title's left half (lower in the DOM/paint order
          // than the h2 below it, so the glow shows through around the
          // letters rather than covering them) rather than beside it.
          decor={
            <ContentDecoIcon
              src="/images/icons/content/process.png"
              size={216}
              rotate={-10}
              variant={2}
              z={-1}
              className="left-[20%] -top-10"
            />
          }
        >
          {/* The "нашли похожий формат" offer card that used to sit beside
              the grid on lg+ is gone — the portfolio now gets the full
              width the card used to reserve. */}
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
        </CinematicSection>

        <Trust
          title={<>Именно <span className="kw">мы</span></>}
          intro={<>Продюсерский центр полного цикла: от идеи до готового ролика. Около <span className="kw">60% заказов</span> — клиенты, которые возвращаются.</>}
        />
        <Offer
          title={<>Лучшие в <span className="kw">этом</span></>}
          intro={<>Съёмка, монтаж, графика и <span className="kw">AI-продакшн</span> — под формат и площадку.</>}
        />
        <Process
          title={<>PRO <span className="kw">хронология</span></>}
          intro={<>Шесть шагов от брифа до сдачи. На каждом вы видите <span className="kw">прогресс</span> и можете вносить правки.</>}
        />
        <Close
          title={<>Персональные <span className="kw">условия</span></>}
          intro={<>Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: <span className="kw">консультация, смета</span> и 2–3 концепции.</>}
        />
      </CinematicStage>
      </div>
    </ServiceProvider>
  );
}
