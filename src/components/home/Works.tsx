"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Appear, { useChapterActive } from "@/components/ui/Appear";
import { BEAT, EASE as MOTION_EASE, STAGGER } from "@/lib/motion";
import Eyebrow from "@/components/ui/Eyebrow";
import { CloseIcon } from "@/components/ui/Icons";
import { useService } from "@/lib/service-context";
import { worksByCategory } from "@/lib/service-content";
import type { Work } from "@/lib/types";
import { EYEBROW } from "@/lib/typography";

// hqdefault always exists for any YouTube video; maxresdefault looks much
// sharper but isn't guaranteed, so the <img> below falls back to hqdefault
// on load error rather than risk a broken thumbnail in the grid.
const maxThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
const fallbackThumb = (youtubeId: string) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

function swapToFallback(img: HTMLImageElement, youtubeId?: string) {
  if (img.dataset.fallback || !youtubeId) return;
  img.dataset.fallback = "1";
  img.src = fallbackThumb(youtubeId);
}

const ALL = "Все работы";
const ALL_SPHERES = "Все сферы";

// Segmented pill version of a filter axis, used inside a cinematic chapter.
// Only the first VISIBLE_SEGMENTS options are shown; the rest live behind a
// "+n" pill that expands in place, so thirteen formats do not eat half the
// screen but none of them are unreachable.
const VISIBLE_SEGMENTS = 7;

function SegmentedAxis({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Keep the selected option on screen even when it lives in the overflow.
  const head = options.slice(0, VISIBLE_SEGMENTS);
  const tail = options.slice(VISIBLE_SEGMENTS);
  const shown = expanded || head.includes(value) ? head : [...head.slice(0, -1), value];
  const rest = expanded ? tail : [];

  // Same tab-pill look as FaqAside's category switcher (rounded border,
  // solid orange when active) — asked to bring the two in line rather than
  // the glass/cyan .seg-pill treatment this used to have.
  const pillClass = (isActive: boolean) =>
    `rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition ${
      isActive
        ? "border-orange bg-orange text-white"
        : "border-paper/20 text-paper/60 hover:border-paper/40 hover:text-paper"
    }`;

  return (
    <div>
      <div className={`${EYEBROW} text-paper/45`}>{label}</div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {[...shown, ...rest].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={pillClass(value === option)}
          >
            {option}
          </button>
        ))}
        {tail.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={pillClass(false)}
          >
            {expanded ? "Свернуть" : `+${tail.length}`}
          </button>
        )}
      </div>
    </div>
  );
}

// Одна ось фильтра: подпись + плоский список значений через слэш.
function FilterAxis({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <div className="font-sans text-sm text-paper/45">{label}</div>
      <div className="mt-3 font-mono text-[11px] uppercase leading-[1.9] tracking-[0.1em] sm:text-xs">
        {options.map((option, i) => (
          <span key={option}>
            {i > 0 && <span className="mx-1.5 text-paper/20">/</span>}
            <button
              onClick={() => onChange(option)}
              className={`transition-colors duration-300 ${
                value === option
                  ? "text-glow [text-shadow:0_0_14px_rgba(0,210,255,0.5)]"
                  : "text-paper/55 hover:text-paper"
              }`}
            >
              {option}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// How many cards are on screen before the visitor asks for more. The tiles are
// full-width 16:9 frames and the catalogue is ~80 items, so this is a count
// limit rather than the previous height clamp — it also keeps the page from
// requesting 80 thumbnails on first paint.
const PAGE_SIZE = 8;

function allCategories(work: Work) {
  return work.tags?.length ? [work.category, ...work.tags] : [work.category];
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(date?: string) {
  if (!date) return null;
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

// «1 работа», «2 работы», «5 работ» — обычные русские правила для счётного
// существительного.
function plural(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return "РАБОТ";
  if (mod10 === 1) return "РАБОТА";
  if (mod10 >= 2 && mod10 <= 4) return "РАБОТЫ";
  return "РАБОТ";
}

// `bare` drops the section's own eyebrow/heading and outer padding: on the
// service pages this block is rendered inside a CinematicSection that already
// supplies the chapter number and title, so its own would be a duplicate.
//
// `limit` caps the grid at a fixed number of tiles and hides "показать ещё" —
// on the cinematic pages the chapter has to fit one screen exactly, with no
// scrolling of its own, so it shows a filtered four rather than a catalogue.
// The full catalogue lives on /works, which has no such constraint.
export default function Works({
  bare = false,
  limit,
  filtersAside,
}: { bare?: boolean; limit?: number; filtersAside?: ReactNode } = {}) {
  const { active: activeService } = useService();
  const works = worksByCategory[activeService];
  // Основные рубрики идут в том порядке, в котором сгруппированы работы в
  // data.ts; рубрики, встречающиеся только как доп. тег, добавляются в конец,
  // чтобы тег на одной карточке не выдёргивал рубрику в начало списка.
  const categories = useMemo(() => {
    const primary: string[] = [];
    works.forEach((w) => {
      if (!primary.includes(w.category)) primary.push(w.category);
    });
    const extra: string[] = [];
    works.forEach((w) =>
      w.tags?.forEach((t) => {
        if (!primary.includes(t) && !extra.includes(t)) extra.push(t);
      })
    );
    return [ALL, ...primary, ...extra];
  }, [works]);
  // Сферы упорядочены по числу работ: сначала то, чем агентство занимается
  // чаще всего, — в data.ts порядок задан форматами, и сферы там перемешаны.
  const spheres = useMemo(() => {
    const count = new Map<string, number>();
    works.forEach((w) => {
      if (w.sphere) count.set(w.sphere, (count.get(w.sphere) ?? 0) + 1);
    });
    const sorted = Array.from(count.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
      .map(([name]) => name);
    return sorted.length ? [ALL_SPHERES, ...sorted] : [];
  }, [works]);
  const [filter, setFilter] = useState(ALL);
  const [sphere, setSphere] = useState(ALL_SPHERES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Chapter tiles autoplay a video embed each — mounting all of them the
  // moment the page loads (this chapter sits off-stage but still mounted,
  // see CinematicStage) was pulling in four YouTube players before the
  // visitor had scrolled anywhere near them. Gate on the chapter having
  // actually been on stage at least once instead, and keep it mounted after
  // that rather than tearing the players down every time it steps off stage
  // again (that would restart the loop on every return visit).
  const chapterActive = useChapterActive();
  const [chapterEverActive, setChapterEverActive] = useState(chapterActive);
  useEffect(() => {
    if (chapterActive) setChapterEverActive(true);
  }, [chapterActive]);

  useEffect(() => {
    setFilter(ALL);
    setSphere(ALL_SPHERES);
  }, [activeService]);

  // Две оси независимы и складываются: формат И сфера.
  const filtered = useMemo(
    () =>
      works.filter(
        (w) =>
          (filter === ALL || allCategories(w).includes(filter)) &&
          (sphere === ALL_SPHERES || w.sphere === sphere)
      ),
    [filter, sphere, works]
  );

  // Collapse back to the first page whenever the visible set changes, so the
  // section never stays 80 tiles tall after the visitor switches filters.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filter, sphere, activeService]);

  const shown = filtered.slice(0, limit ?? visible);
  const hasMore = !limit && filtered.length > shown.length;

  const active = works.find((w) => w.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  return (
    <section id={bare ? undefined : "works"} className={bare ? "" : "py-10 sm:py-14"}>
      <Container className={bare ? "!px-0" : ""}>
        {!bare && (
          <Reveal>
            <Eyebrow index="01" label="Работы" />
            <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
              Портфолио
            </h2>
          </Reveal>
        )}

        {works.length === 0 ? (
          <Reveal delay={0.05}>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-paper/50">
              Портфолио по этому направлению скоро появится здесь.
            </p>
          </Reveal>
        ) : (
          <>
            {!limit && (
              <Reveal delay={0.05}>
                <div className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-paper">
                  {filtered.length} {plural(filtered.length)} НАЙДЕНО
                </div>
              </Reveal>
            )}

            {/* Две оси фильтра плоскими списками через слэш, как в референсе,
                а не капсулами: при 13 рубриках капсулы занимают четыре строки.
                В режиме главы (`limit`) обе оси идут одной строкой без верхней
                линейки — иначе фильтры съедают половину экрана. */}
            <Reveal delay={0.1}>
              <div className={limit
                ? "flex flex-wrap items-end justify-between gap-x-8 gap-y-4"
                : "mt-8 grid gap-8 border-t border-paper/10 pt-6 lg:grid-cols-2 lg:gap-10"}>
                {limit ? (
                  // In a chapter only the format axis is offered: two axes of
                  // pills is more control than one screen can carry, and the
                  // sphere axis is still there on /works.
                  <Appear from="left" delay={BEAT.controls}>
                  <SegmentedAxis
                    label="По формату"
                    options={categories}
                    value={filter}
                    onChange={setFilter}
                  />
                  </Appear>
                ) : (
                  <>
                    <FilterAxis
                      label="По формату"
                      options={categories}
                      value={filter}
                      onChange={setFilter}
                    />
                    {spheres.length > 0 && (
                      <FilterAxis
                        label="По сферам"
                        options={spheres}
                        value={sphere}
                        onChange={setSphere}
                      />
                    )}
                  </>
                )}
                {limit && filtersAside && <Appear from="right" delay={BEAT.controls}>{filtersAside}</Appear>}
              </div>
            </Reveal>

            {/* The chapter variant (`limit`) is a 2x2 of tiles inside a pinned,
                one-screen chapter, so on a short laptop it gives its own gaps
                back rather than letting the bottom row be cropped by the fold.
                The full /works catalogue below has a whole page to run down
                and needs no such thing. */}
            <div className={limit
              // The width cap is what keeps the bottom row on screen on a
              // wide-but-short laptop (1366x768 is the usual one): the tiles
              // are 16:9, so every extra pixel of width costs nine sixteenths
              // of a pixel of height on both rows at once. Capping the grid
              // — not the chapter — leaves the heading and filters full width.
              ? "mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 [@media(max-height:860px)]:mt-2 [@media(max-height:860px)]:sm:gap-4 [@media(max-height:820px)]:mx-auto [@media(max-height:820px)]:max-w-[860px]"
              : "mt-10 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2"}>
              {/* In chapter mode each tile carries its own two actions, so it is
                  a plain container rather than one big button — a button cannot
                  legally contain other buttons or links. */}
              <AnimatePresence mode="popLayout">
                {shown.map((work, index) => (
                  <motion.div
                    key={work.id}
                    layout
                    initial={{ opacity: 0, y: 24, x: limit ? (index % 2 ? 40 : -40) : 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={{
                      duration: limit ? 0.8 : 0.5,
                      // In a chapter the four tiles arrive in a clear sequence
                      // rather than as a block: left, right, left, right.
                      delay: limit
                        ? BEAT.content + index * STAGGER.normal
                        : Math.min((index % PAGE_SIZE) * 0.05, 0.35),
                      ease: MOTION_EASE,
                    }}
                    onClick={limit ? undefined : () => setActiveId(work.id)}
                    className={`group relative overflow-hidden rounded-2xl bg-ink-soft text-left transition-shadow duration-300 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85),0_0_50px_-12px_rgba(0,210,255,0.3)] ${
                      limit
                        ? // A plain 16:9 card in a 2×2 grid grows tall enough
                          // on wide desktop screens to push the second row
                          // past the fold of the pinned chapter (it can't
                          // scroll internally on desktop). Wider/shorter on
                          // lg+ keeps both rows on screen without shrinking
                          // the grid itself.
                          "aspect-[4/3] sm:aspect-video lg:aspect-[16/7]"
                        : "aspect-[16/10] cursor-pointer"
                    }`}
                  >
                    {limit && work.youtubeId && chapterEverActive ? (
                      // Chapter tiles autoplay a muted loop instead of a
                      // static thumbnail — pointer-events-none so the click
                      // still reaches "Смотреть"/"Хочу так же" underneath.
                      <iframe
                        className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35] object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.42]"
                        src={`https://www.youtube.com/embed/${work.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${work.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
                        title={work.title}
                        allow="autoplay; encrypted-media"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    ) : (
                      <img
                        src={work.youtubeId ? maxThumb(work.youtubeId) : ""}
                        onError={(e) => swapToFallback(e.currentTarget, work.youtubeId)}
                        // maxresdefault отсутствует у части видео, но YouTube
                        // отвечает не пустым 404, а серой заглушкой 120×90 —
                        // onError на неё не срабатывает, поэтому подмену делаем
                        // и по факту загрузки слишком маленькой картинки.
                        onLoad={(e) => {
                          if (e.currentTarget.naturalWidth <= 120) {
                            swapToFallback(e.currentTarget, work.youtubeId);
                          }
                        }}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    )}
                    {/* Подписи лежат прямо на кадре, как в референсе, поэтому
                        затемняем только те полосы, где они стоят: сплошной
                        градиент по всей высоте читается как леттербокс. */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/75 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent" />

                    {formatDate(work.date) && (
                      <span className={`absolute left-4 top-4 font-mono tracking-[0.08em] text-white/90 sm:left-5 sm:top-5 ${limit ? "text-xs" : "text-[11px]"}`}>
                        {formatDate(work.date)}
                      </span>
                    )}

                    {!limit && (
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-ink/60 text-paper shadow-[0_0_28px_rgba(0,210,255,0.5)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
                          ▶
                        </span>
                      </span>
                    )}

                    <div className={`absolute bottom-4 gap-3 sm:bottom-5 ${
                      limit
                        ? "left-4 right-4 flex flex-col items-start sm:left-5 sm:right-5"
                        : "inset-x-4 flex items-end justify-between sm:inset-x-5"
                    }`}>
                      <div className="min-w-0">
                        {formatDuration(work.duration) && (
                          <div className={`font-mono tracking-[0.08em] text-paper/80 ${limit ? "text-xs" : "text-[11px]"}`}>
                            {formatDuration(work.duration)}
                          </div>
                        )}
                      </div>
                      <div className={`flex shrink-0 flex-wrap gap-1.5 ${
                        limit ? "mt-2 justify-start" : "justify-end"
                      }`}>
                        {/* Сфера — нейтральным чипом, чтобы не путать оси:
                            подсвеченные чипы = формат. */}
                        {work.sphere && !limit && (
                          <span className="rounded-full bg-paper/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/70 ring-1 ring-inset ring-paper/15 backdrop-blur-sm sm:text-[10px]">
                            {work.sphere}
                          </span>
                        )}
                        {(limit ? [work.category] : allCategories(work)).map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-glow/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-glow ring-1 ring-inset ring-glow/30 backdrop-blur-sm sm:text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Own row, in normal flow rather than absolutely
                          pinned beside the caption — pinning them to a fixed
                          right-hand reserve was what made "Смотреть" collide
                          with "Хочу так же" on a narrower tile. Flat pills
                          (no .btn-3d) instead of the glass/bordered pair, so
                          they read as the two clear next steps rather than
                          matching the tags underneath them. */}
                      {limit && (
                        <div className="mt-2 flex w-full flex-wrap items-center gap-2 sm:mt-3 sm:gap-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveId(work.id)}
                            className="btn-neon inline-flex items-center gap-1.5 !px-5 !py-2.5 !text-[11px]"
                          >
                            <span aria-hidden="true">▶</span>
                            Смотреть
                          </button>
                          <Link href="/brief" className="btn-neon btn-warm inline-flex items-center !px-5 !py-2.5 !text-[11px]">
                            Хочу так же
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Оси складываются, поэтому пересечение вполне может быть пустым —
                например «Обучающие» + «Авто». */}
            {filtered.length === 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <p className="text-sm text-paper/50">
                  На этом пересечении фильтров работ нет.
                </p>
                <button
                  onClick={() => {
                    setFilter(ALL);
                    setSphere(ALL_SPHERES);
                  }}
                  className="rounded-full border border-paper/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/70 transition-colors duration-300 hover:border-glow/60 hover:text-glow"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-paper/70 transition-all duration-300 hover:border-glow/60 hover:text-glow hover:shadow-[0_0_16px_rgba(0,210,255,0.2)]"
                >
                  Показать ещё
                  <span className="font-mono text-paper/40">
                    {filtered.length - shown.length}
                  </span>
                  <span className="inline-block">↓</span>
                </button>
              </div>
            )}
          </>
        )}
      </Container>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-10"
            onClick={() => setActiveId(null)}
          >
            <button
              onClick={() => setActiveId(null)}
              aria-label="Закрыть"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-rec"
            >
              <CloseIcon />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-soft">
                <iframe
                  key={active.id}
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4 text-paper">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.15em] text-rec">
                    {allCategories(active).join(" / ")}
                    {active.sphere && (
                      <span className="text-paper/40"> · {active.sphere}</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-sans text-2xl font-light uppercase tracking-[0.01em] sm:text-3xl">
                    {active.title}
                  </h3>
                  {formatDuration(active.duration) && (
                    <p className="mt-1 text-sm text-paper/60">{formatDuration(active.duration)}</p>
                  )}
                </div>
                <div className="font-mono text-xs text-paper/40">Esc закрыть</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
