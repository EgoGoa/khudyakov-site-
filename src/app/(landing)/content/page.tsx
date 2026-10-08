import type { Metadata } from "next";
import Link from "next/link";
import Opening from "@/components/home/Opening";
import Works from "@/components/home/Works";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import Process from "@/components/home/Process";
import Close from "@/components/home/Close";
import type { ChapterMeta } from "@/components/ui/CinematicStage";
import ScrubStage from "@/components/ui/ScrubStage";
import CinematicSection from "@/components/ui/CinematicSection";
import ToolSpotlight from "@/components/home/ai/ToolSpotlight";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  // Корень сайта ведёт сюда (301), поэтому по запросу «худ сервис» эта
  // страница — главная ссылка в выдаче: заголовок про весь бренд, а
  // разделы-услуги Google подставит под ней дополнительными ссылками.
  title: { absolute: "HUD.SERVICE — видеопродакшн, сайты, SMM и AI для бизнеса" },
  description:
    "Съёмка и монтаж рекламных, имиджевых и продающих роликов, фото и AI-контент под любую площадку. Сайты под ключ, ведение соцсетей и AI-решения — одной командой.",
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
// Each phase is the slice of film that plays under its chapter while it is
// scrolled through (ScrubStage), so the picture runs continuously from 0 to
// 43.2s across a full scroll and never carries a join of ours.
// Акцент страницы /content — тот же, что у рельсы и заголовков глав.
const CONTENT_ACCENT = { from: "#ff4fd8", to: "#ff6a3d" };

const PHASES = [
  { start: 0, end: 9.6 }, // 09:15
  { start: 9.6, end: 18.36 }, // 18:09
  { start: 18.36, end: 23.2 }, // 23:05
  { start: 23.2, end: 28.2 }, // 28:05
  { start: 28.2, end: 38.4 }, // split (see above)
  { start: 38.4, end: 43.2 }, // 43:05
];

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

      {/* .content-warm-headings turns every `.kw` keyword span inside the
          stage from the site-wide magenta→cyan to /content's own
          magenta→orange (Egor's pick — see .content-warm-headings in
          globals.css). Same mechanism /ai and /sites use for their own
          accent colours. */}
      <div className="content-warm-headings">
      {/* Ролик ведёт прокрутка (Егор, 2026-10-08): главы идут обычным
          скроллом, кадр фона — от положения страницы, по тем же фазам.
          См. ScrubStage. Отдельный файл ролика с частыми опорными кадрами —
          иначе перемотка рывками. */}
      <ScrubStage
        src="/video/content-reel-scrub.mp4"
        mobileSrc="/video/content-reel-scrub-portrait.mp4"
        poster="/images/content-reel-poster.jpg"
        phases={PHASES}
        chapters={CHAPTERS}
        brightness={1.2}
      >
        <Opening />

        <CinematicSection
          index={1}
          chapter="02"
          title={<>Наши <span className="kw">работы</span></>}
          side="right"
          intro={<>Все работы <span className="kw">в открытом доступе</span> — приятного просмотра</>}
          // A 2×2 grid of video tiles under the default text-8xl title was
          // tall enough to clip its own bottom row on short/wide viewports
          // (the deck can't scroll a chapter internally on desktop — see
          // CinematicStage's paneRoom comment). A smaller title reclaims the
          // header space instead of shrinking the tiles themselves.
          titleClassName="text-[1.575rem] sm:text-[2.1rem] lg:text-[2.625rem] xl:text-[2.625rem]"
          // Was 216px sitting squarely behind "Наши" — same fix as chapter
          // 01's cluster: pulled up above the title and shrunk+dimmed so it
          // reads as a corner accent instead of a patch over the word.
          decor={
            <ContentDecoIcon
              src="/images/icons/content/process.webp"
              size={205}
              rotate={-10}
              variant={2}
              z={-1}
              className="left-[5%] top-12 opacity-70"
            />
          }
        >
          {/* The "нашли похожий формат" offer card that used to sit beside
              the grid on lg+ is gone — the portfolio now gets the full
              width the card used to reserve. */}
          <Works
            bare
            tight
            limit={4}
            filtersAside={
              <Link
                href="/works"
                className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.15em] text-paper/80 transition hover:text-glow"
              >
                Весь каталог
                <span aria-hidden="true">→</span>
              </Link>
            }
          />
        </CinematicSection>

        <Trust
          title={<>Именно <span className="kw">мы</span></>}
          // Окошки «Имиджевые видео» и «Рекламные ролики» — под FAQ, на
          // месте Макса; Макс — под пятью причинами (просьба Егора).
          teamSwap={
            <div className="flex flex-col gap-3">
              {/* Без мини-превью: в колонке 300px рядом с ним название
                  ломалось по буквам. */}
              <ToolSpotlight slug="image" accent={CONTENT_ACCENT} shape="card" noPreview className="!pt-0" />
              <ToolSpotlight slug="advertising" accent={CONTENT_ACCENT} shape="card" noPreview className="!pt-0" />
            </div>
          }
          intro={<>Продюсерский центр полного цикла: от первого созвона до файлов в вашей папке. <span className="kw">Шесть из десяти заказов</span> — от клиентов, которые уже работали с нами.</>}
        />
        {/* Not "…под формат и площадку" any more: the ServicePicker above the
            deck and chapter 01 both already used that phrase, so it landed
            three times on the way down one page. This line says what the ten
            rows below it actually are instead. */}
        <Offer
          // Два окошка услуг друг под другом под левым списком (просьба
          // Егора): правая панель получает всю высоту главы и больше воздуха.
          listAside={
            <>
              <ToolSpotlight slug="graphics" accent={CONTENT_ACCENT} place="left" className="!pt-0" />
              <ToolSpotlight slug="ai-video" accent={CONTENT_ACCENT} place="left" className="!pt-0" />
            </>
          }
          // Десять строк + виджет + окошко делят одну высоту экрана.
          titleClassName="text-[1.575rem] sm:text-[2.1rem] lg:text-[2.625rem] xl:text-[2.625rem]"
          title={<>Сильные в <span className="kw">этом</span></>}
          intro={<>Десять задач, которые закрываем своей командой — от рекламного ролика до 3D-графики и <span className="kw">AI-контента</span>.</>}
        />
        <Process
          middleSlot={<ToolSpotlight slug="presentation" accent={CONTENT_ACCENT} shape="card" fill className="!pt-0 h-full" />}
          title={<>PRO <span className="kw">хронология</span></>}
          intro={<>Шесть шагов от брифа до сдачи. На каждом видно <span className="kw">прогресс</span> и есть точка, где можно вмешаться.</>}
        />
        {/* Блок тарифов: без окошка услуги (перенесено в блок 04) и с
            полным списком тезисов-преимуществ на каждой карточке — Егор
            попросил вернуть как было и больше не трогать этот блок без
            отдельного разрешения. */}
        <Close
          // Карточки тарифов ниже — Егор попросил уменьшить элементы и
          // текст на 30%, сохранив список тезисов на месте (см. правку в
          // Close.tsx и .c3-card-dense в globals.css).
          dense
          titleClassName="text-[1.12rem] sm:text-[1.82rem] lg:text-[1.82rem] xl:text-[2.205rem]"
          title={<>Персональные <span className="kw">условия</span></>}
          intro={<>Ценообразование индивидуальное — считаем по ТЗ. Бесплатно: <span className="kw">консультация, смета</span> и 2–3 концепции до договора.</>}
        />
      </ScrubStage>
      </div>
    </ServiceProvider>
  );
}
