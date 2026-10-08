"use client";

import { Children, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useBootPreload } from "@/lib/boot-sequence";
import { useCinematicNavRegister } from "@/lib/cinematic-nav";
import { FIRST_CHAPTER_EVENT, reportActiveChapter, takePendingChapter } from "@/lib/page-hop";
import { sound } from "@/lib/sound";
import { StageContext, type ChapterMeta, type Phase } from "@/components/ui/CinematicStage";

// Фон-ролик, который ведёт палец (Егор, 2026-10-08). Пока только /content.
//
// В отличие от CinematicStage здесь нет колоды и пошаговых жестов: главы
// стоят друг под другом и прокручиваются обычной прокруткой страницы, а
// ролик прикреплён к экрану под ними (sticky) и сам не играет. Кадр
// вычисляется из положения прокрутки: верх первой главы — 0 с, низ блока
// тарифов — последний кадр. Вниз — ролик идёт вперёд, вверх — отматывается,
// палец остановился — кадр стоит.
//
// Привязка к главам: у каждой главы свой отрезок ролика (`phases`, те же
// ручные тайм-коды, что у колоды). Отрезок главы N проходит, пока её верх
// едет от середины экрана до середины экрана следующей главы, — так под
// главой всегда её собственная сцена, сколько бы она ни занимала по высоте.
// Первая глава начинается, когда сцена доехала до верха экрана; последняя
// заканчивается ровно в низу страницы глав.
//
// Сглаживание: колёсико мыши крутит ступеньками по ~100 px, и кадр,
// привязанный к прокрутке напрямую, прыгал бы так же. Показанное время
// догоняет целевое по экспоненте (SMOOTH_TAU) — щелчок колёсика становится
// короткой плавной перемоткой, а трекпад и палец почти не отстают.
//
// Ролик — отдельный файл с опорным кадром каждые 8 кадров и без B-кадров
// (content-reel-scrub*.mp4): в исходном их всего 7 на 43 с, и перемотка
// назад каждый раз декодировала до 7 секунд видео — рывки вместо кадров.
// На телефоне (портрет) — свой файл: вертикальная вырезка 406×720 из
// середины 720p (ровно то, что object-cover и так показывал на экране, но
// резче прежних 480p) и каждый кадр опорный: перемотка на iPhone декодирует
// один кадр, а не до восьми, и видео успевает за пальцем (Егор, 2026-10-08:
// «рывками, не хватает частоты кадров»).

const SMOOTH_TAU = 0.11; // с — постоянная времени догоняния
// Палец и инерция прокрутки на iOS отдают положение неровно; чуть более
// мягкое догоняние раскладывает скачки на соседние кадры.
const SMOOTH_TAU_TOUCH = 0.16;
const SEEK_MIN_DELTA = 1 / 50; // мельче полукадра не перематываем

export default function ScrubStage({
  src,
  mobileSrc,
  poster,
  phases,
  chapters,
  brightness = 1,
  children,
}: {
  src: string;
  /** Вертикальная версия для телефонов и планшетов в портрете. */
  mobileSrc: string;
  poster: string;
  /** Отрезок ролика на каждую главу, по порядку. */
  phases: Phase[];
  chapters: ChapterMeta[];
  /** brightness() на компьютере, как у CinematicStage. */
  brightness?: number;
  children: ReactNode;
}) {
  const bootPreload = useBootPreload();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // Сцена рядом с экраном: с этого момента грузим ролик целиком и крутим цикл.
  const [near, setNear] = useState(false);
  // Сцена на экране — для звука и для первой главы (DirectionsGrid ждёт её).
  const [started, setStarted] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const portrait = window.innerHeight > window.innerWidth;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- выбор файла зависит от экрана, известного только в браузере
    setResolvedSrc((window.innerWidth < 1024 && portrait) || saveData ? mobileSrc : src);
  }, [src, mobileSrc]);

  const activeIndexRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  });

  // html{scroll-behavior:smooth} сглаживал бы и наши прыжки к главам из меню
  // поверх собственной плавности браузера — как и в CinematicStage, на время
  // жизни сцены выключаем.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = prev;
    };
  }, []);

  // Видимость сцены: `near` — с запасом в экран (загрузка), `started` — реально видна.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const check = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      setNear(r.top < vh * 2 && r.bottom > -vh);
      setStarted(r.top < vh && r.bottom > 0);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // Карта «прокрутка → секунда ролика». knots[i] — положение прокрутки, на
  // котором начинается отрезок главы i; knots[n] — конец последнего.
  const knotsRef = useRef<number[]>([]);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      const wrapTop = wrap.getBoundingClientRect().top + y;
      const end = wrapTop + wrap.offsetHeight - vh;
      const tops = chapterRefs.current.map((el) => (el ? el.getBoundingClientRect().top + y : wrapTop));
      const knots = [wrapTop];
      for (let i = 1; i < phases.length; i++) {
        const k = (tops[i] ?? end) - vh * 0.5;
        knots.push(Math.min(end, Math.max(knots[i - 1], k)));
      }
      knots.push(Math.max(end, knots[knots.length - 1]));
      knotsRef.current = knots;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    chapterRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    // Шрифты и ленивые картинки меняют высоты глав уже после первого замера.
    const late = window.setTimeout(measure, 1500);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(late);
    };
  }, [phases]);

  // Время ролика для положения прокрутки.
  const timeAtRef = useRef<(scrollY: number) => number>(() => 0);
  useEffect(() => {
    timeAtRef.current = (scrollY: number) => {
      const knots = knotsRef.current;
      if (knots.length < 2 || !phases.length) return phases[0]?.start ?? 0;
      if (scrollY <= knots[0]) return phases[0].start;
      const last = phases.length - 1;
      for (let i = 0; i <= last; i++) {
        const a = knots[i];
        const b = knots[i + 1];
        if (scrollY < b || i === last) {
          const t = b > a ? Math.min(1, Math.max(0, (scrollY - a) / (b - a))) : 1;
          return phases[i].start + (phases[i].end - phases[i].start) * t;
        }
      }
      return phases[last].end;
    };
  }, [phases]);

  // Цикл перемотки: только пока сцена рядом с экраном.
  useEffect(() => {
    if (!near) return;
    const video = videoRef.current;
    if (!video) return;
    // Самый последний кадр файла чуть раньше его длительности: ровно на
    // duration браузер иногда показывает пустоту.
    const clampTime = (t: number) => {
      const d = video.duration;
      return Number.isFinite(d) && d > 0 ? Math.min(t, d - 0.05) : t;
    };
    let shown = timeAtRef.current(window.scrollY);
    let last = performance.now();
    let raf = 0;
    const tau = window.matchMedia("(pointer: coarse)").matches ? SMOOTH_TAU_TOUCH : SMOOTH_TAU;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = timeAtRef.current(window.scrollY);
      shown += (target - shown) * (1 - Math.exp(-dt / tau));
      if (Math.abs(target - shown) < 0.004) shown = target;
      if (video.readyState >= 1 && !video.seeking) {
        const t = clampTime(shown);
        if (Math.abs(video.currentTime - t) > SEEK_MIN_DELTA) {
          try {
            video.currentTime = t;
          } catch {
            /* метаданные ещё не готовы */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near]);

  // iOS не грузит кадры у видео, которое ни разу не запускали: один раз
  // запускаем и сразу ставим на паузу. Если запуск не разрешён (режим
  // энергосбережения), повторяем на первом касании.
  useEffect(() => {
    if (!near) return;
    const video = videoRef.current;
    if (!video) return;
    let primed = false;
    const prime = () => {
      if (primed) return;
      video
        .play()
        .then(() => {
          primed = true;
          video.pause();
        })
        .catch(() => {});
    };
    prime();
    window.addEventListener("touchend", prime, { passive: true });
    window.addEventListener("click", prime);
    return () => {
      window.removeEventListener("touchend", prime);
      window.removeEventListener("click", prime);
    };
  }, [near, resolvedSrc]);

  // Активная глава — та, что под серединой экрана.
  useEffect(() => {
    const sync = () => {
      const mid = window.innerHeight * 0.5;
      let idx = 0;
      chapterRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      });
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const activeChapterId = chapters[activeIndex]?.id ?? null;
  useEffect(() => {
    reportActiveChapter(started ? activeChapterId : null);
  }, [activeChapterId, started]);

  // Звук окружения сцены, как у CinematicStage.
  const soundPage = /\/video\/([a-z]+)-reel/.exec(src)?.[1] ?? null;
  useEffect(() => {
    if (!started || !soundPage) return;
    return () => sound()?.leaveStage();
  }, [started, soundPage]);
  useEffect(() => {
    if (started && soundPage) sound()?.enterChapter(soundPage, activeIndex);
  }, [started, soundPage, activeIndex]);

  // Меню, голос и стрелки между страницами: прыжок к главе — обычная
  // плавная прокрутка, ролик доедет сам.
  const registerGoTo = useCinematicNavRegister();
  const firstChapterId = chapters[0]?.id ?? null;
  useEffect(() => {
    const headerOffset = () =>
      window.matchMedia("(max-width: 1023px)").matches
        ? (document.querySelector("header")?.getBoundingClientRect().height ?? 0)
        : 0;
    const topOf = (i: number) => {
      const el = chapterRefs.current[i];
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    };
    const scrollToIndex = (i: number, behavior: ScrollBehavior = "smooth") => {
      const top = topOf(i);
      if (top === null) return false;
      window.scrollTo({ top: Math.max(0, top - (i === 0 ? headerOffset() : 0)), behavior });
      return true;
    };
    const goToId = (id: string) => {
      const i = chapters.findIndex((c) => c.id === id);
      return i >= 0 && scrollToIndex(i);
    };
    const onScreen = () => {
      const wrap = wrapRef.current;
      if (!wrap) return false;
      const r = wrap.getBoundingClientRect();
      return r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5;
    };
    const voiceStep = (delta: number) => {
      if (!onScreen()) return delta > 0 && firstChapterId ? goToId(firstChapterId) : false;
      const next = activeIndexRef.current + delta;
      return next >= 0 && next < chapters.length && scrollToIndex(next);
    };
    const voiceCurrent = () => (onScreen() ? (chapters[activeIndexRef.current]?.id ?? null) : null);
    registerGoTo(goToId, firstChapterId, voiceStep, voiceCurrent);

    const onFirstChapter = () => {
      scrollToIndex(0);
    };
    window.addEventListener(FIRST_CHAPTER_EVENT, onFirstChapter);

    // Пришли стрелкой с соседней страницы — сразу на ту же по смыслу главу.
    // Ссылка с #главой — тоже сразу туда.
    const pending = takePendingChapter(chapters.map((c) => c.id));
    const hashIndex = chapters.findIndex((c) => c.id === window.location.hash.slice(1));
    const hopIndex = pending > 0 ? pending : hashIndex;
    const timers: number[] = [];
    if (hopIndex > 0) {
      const jump = () => scrollToIndex(hopIndex, "instant");
      jump();
      for (const ms of [120, 300, 600]) timers.push(window.setTimeout(jump, ms));
    }
    return () => {
      window.removeEventListener(FIRST_CHAPTER_EVENT, onFirstChapter);
      timers.forEach((t) => window.clearTimeout(t));
      registerGoTo(null, null);
    };
  }, [chapters, firstChapterId, registerGoTo]);

  // staged: false — главы рисуются обычными секциями в потоке (как на
  // страницах без колоды), activeIndex/started нужны рельсе и первой главе.
  const api = useMemo(
    () => ({ activeIndex, staged: false, started, seen: new Set<number>() }),
    [activeIndex, started],
  );

  const items = Children.toArray(children);

  return (
    <StageContext.Provider value={api}>
      <div ref={wrapRef} data-stage-wrap data-scrub-stage className="relative">
        {/* Фон: прикреплён к экрану на всю высоту глав. lvh — высота экрана
            со свёрнутой адресной строкой, чтобы фон не перекладывался, когда
            Safari её прячет и показывает. */}
        <div className="scrub-frame sticky top-0 w-full overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0" style={{ filter: brightness !== 1 ? `brightness(${brightness})` : undefined }}>
            {/* Кадр-заглушка под видео: пока ролик грузится, виден он, а не чёрный фон. */}
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <video
              ref={videoRef}
              src={resolvedSrc}
              muted
              playsInline
              disablePictureInPicture
              data-self-driven=""
              preload={near ? "auto" : bootPreload}
              className="relative h-full w-full object-cover"
            />
          </div>
          {/* Затемнение: ровная вуаль и тяжелее у краёв. Плотнее, чем у
              колоды: подложки самих глав здесь выключены (globals.css,
              .scrub-chapter), иначе их край полосой виден на стыке глав.
              Телефон: /60 вместо /50 — на 20% темнее (Егор, 2026-10-08). */}
          <div className="pointer-events-none absolute inset-0 bg-ink/60 lg:bg-ink/[0.58]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,11,16,0.72) 0%, rgba(11,11,16,0.16) 26%, rgba(11,11,16,0.2) 54%, rgba(11,11,16,0.85) 100%)",
            }}
          />
        </div>

        <div className="scrub-pull relative z-10">
          {items.map((child, i) => (
            <section
              key={chapters[i]?.id ?? i}
              // Не id: Process уже несёт id="process" сам (он нужен ему на
              // других страницах), а ссылки с #главой ловит эффект ниже.
              data-chapter={chapters[i]?.id}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
              className="scrub-chapter relative flex flex-col justify-center pt-12 lg:pt-16"
            >
              {child}
            </section>
          ))}
        </div>
      </div>
    </StageContext.Provider>
  );
}
