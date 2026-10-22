"use client";

import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import SceneArrows from "@/components/ui/SceneArrows";
import { useChapterEntrance } from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import { spotlightFor } from "@/components/home/ai/spotlightData";

// Развёрнутая табличка услуги внизу блока — «подсказка, что об этой услуге
// можно узнать подробнее».
//
// Механика, которую задал Егор:
//   1. Внизу главы лежит узкая полоса на всю её ширину — мини-версия
//      карточки из карусели: тот же кадр, то же свечение, тот же язык
//      кнопок. Она мигает, поэтому её видно, но она не занимает экран.
//   2. Клик — полоса разворачивается вверх в окно примерно на треть
//      экрана. Сам блок под ним гаснет: акцент на окне.
//   3. В окне слева живёт инфографика (SpotlightScene), справа —
//      преимущества, которые появляются и исчезают. Текст и схема идут
//      одним шагом: активный тезис подсвечивает свою часть схемы.
//   4. Кнопка в окне ведёт уже на полную страницу инструмента.
//
// Важное про вёрстку: компонент лежит поверх главы (`absolute inset-0`) и
// никогда не забирает у неё полосу — глава не сжимается ни в закрытом, ни
// в раскрытом виде. Это общее правило сайта для наложений.
//
// Тексты не пишутся здесь: всё тянется со страницы инструмента (см.
// toolSpotlight.ts), поэтому табличка не может разойтись с тем, что
// клиент прочитает, перейдя по кнопке.

/** Сколько держится один тезис, прежде чем смениться следующим.
 *
 *  Значение ходило туда-сюда по просьбам Егора: 8.2с («медленно, как в
 *  тизере») → 3.4с («динамичнее и чаще») → 5.2с после просмотра живьём
 *  («медленнее везде»). 5.2с — середина: кадр не мельтешит, но и не
 *  застывает. Потом +1.5с: Егор попросил сбавить смену сцен и текстов. */
// Потом ×3 (Егор, 2026-10-12): тексты и графика окошек меняются в три
// раза реже.
const BEAT_MS = 18000;

/** Высота закрытой кнопки. Числом, а не по содержимому: высота окна
 *  анимируется числом (см. ниже), и второй конец этой анимации тоже
 *  обязан быть числом.
 *
 *  80: кнопке нужно дышать — при 62 название, слово-выгода и превью
 *  стояли вплотную. Высоту, которую она на это забрала, вернули, ужав
 *  собственный вертикальный ритм двух самых плотных глав (04 и 05). */
// 120 (Егор, 2026-10-12): название кнопки втрое крупнее, превью больше —
// кнопка заполнена, а не пустое тёмное поле вокруг мелкой строки.
const STRIP_HEIGHT = 72;
// Телефон: полоса выше, чтобы название, тезис и стрелка помещались целиком,
// а превью сцены читалось (Егор, 2026-10-03).
const STRIP_HEIGHT_PHONE = 76;
// Плашки без превью (глава «Именно мы» на /content): на 15% ниже, чтобы
// список из пяти пунктов над ними дышал (Егор, 2026-10-03).
const STRIP_HEIGHT_PHONE_COMPACT = 68;


/** Акцент страницы /ai — лайм→изумруд, тот же, что у заголовков глав и
 *  рельсы. Егор попросил, чтобы окно было в цвет страницы, а не в цвет
 *  инструмента: розово-оранжевый «хит месяца» посреди изумрудной главы
 *  читался как элемент с другой страницы. Проп оставлен, чтобы та же
 *  табличка на /sites или /smm могла взять цвет своей страницы. */
const PAGE_ACCENT = { from: "#c8f169", to: "#10b981" };

/** Где табличка живёт внутри блока.
 *
 *  Егор просил, чтобы на каждом блоке она стояла по-своему — «где под
 *  вёрстку блока удобнее». Поэтому форма и место — проп, а не константа:
 *
 *  · `bottom` — полоса во всю ширину внизу, окно разворачивается вверх на
 *    треть экрана. Подходит блокам, у которых низ свободен.
 *  · `right` / `left` — компактная плитка в нижнем углу, окно
 *    разворачивается квадратом (сцена сверху, текст снизу).
 *  · `top-right` / `top-left` — то же квадратное окно, но в верхнем углу:
 *    для блоков, у которых низ занят сеткой карточек целиком, а сбоку от
 *    заголовка пусто (глава 03). */
export type SpotlightPlace = "bottom" | "right" | "left" | "top-right" | "top-left";

export default function ToolSpotlight({
  slug,
  accent = PAGE_ACCENT,
  place = "bottom",
  shape = "pill",
  className = "",
  fill = false,
  noPreview = false,
  leftAlign = false,
}: {
  slug: string;
  accent?: { from: string; to: string };
  place?: SpotlightPlace;
  /** Форма закрытой кнопки. `pill` — капсула (по умолчанию), `card` — та
   *  же плашка, что у карточек блока: для глав, где кнопка встаёт в один
   *  ряд с окошками контента и обязана совпасть с ними по геометрии. */
  shape?: "pill" | "card";
  /** Ширина/выравнивание корня. Нужна главам с собственной сеткой
   *  фиксированной ширины (Trust), где кнопка должна попасть ровно в её
   *  колонки, а не в общую `max-w-7xl`. */
  className?: string;
  /** Закрытая кнопка занимает всю высоту ячейки, в которую её положили
   *  (нижний ряд карточек главы 05 /content), а не фиксированные 80px. */
  fill?: boolean;
  /** Закрытая кнопка без мини-превью сцены — для узких колонок, где
   *  название иначе ломается по буквам. */
  noPreview?: boolean;
  /** Компактная плашка прижата вправо (по умолчанию) или влево — под сторону блока. */
  leftAlign?: boolean;
}) {
  const side = place !== "bottom";
  const top = place === "top-right" || place === "top-left";
  const right = place === "right" || place === "top-right";
  const data = spotlightFor(slug);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  // Кнопки услуг приходят вместе с остальными блоками главы, а не вместе с
  // заголовком (Егор, 2026-10-03): появление по тому же ритму BEAT.cta, что и
  // у остальных окошек, и без повтора при возврате на главу.
  const { active, instant } = useChapterEntrance();

  const steps = data?.benefits.length ?? 0;

  // Тезисы сменяются сами, пока окно открыто и на него не навели курсор:
  // это витрина, а не слайдер, который посетитель обязан листать руками.
  // Шаг идёт и в закрытом виде: мини-превью на полосе меняет сцены так же,
  // как развёрнутое окно (просьба Егора) — полоса заранее показывает, что
  // внутри есть кино, а не одна застывшая иконка.
  useEffect(() => {
    if (held || steps < 2 || reduced || !inView) return;
    // Таймер перезапускается на каждом шаге: после клика по стрелке новая
    // сцена стоит полный такт, а не сменяется через долю секунды.
    const id = window.setTimeout(() => setStep((s) => (s + 1) % steps), BEAT_MS);
    return () => window.clearTimeout(id);
  }, [held, steps, reduced, step, inView]);

  // Вне экрана смена сцен стоит: невидимые окна не должны греть процессор.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Esc закрывает — то же, чего ждут от любого окна поверх содержимого.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  // Гашение главы всегда ровно по экрану (Егор, 2026-10-04: на телефоне
  // часть сайта за окошком не темнела и тап мимо не закрывал). Слой `fixed`
  // внутри главы с will-change/transform считается не от экрана, а от самой
  // главы, и при её прокрутке или въезде съезжал. Пока окошко открыто,
  // сверяем его прямоугольник с экраном и подгоняем смещением и размером;
  // там, где `fixed` честный (компьютер), поправка нулевая и ничего не меняет.
  // Шапка при этом тоже притухает (data-spotlight-open, globals.css).
  const dimRef = useRef<HTMLButtonElement>(null);
  // Раскрытое окно — над всей главой (Егор, 2026-10-12: окошко Кирилла
  // ложилось поверх окна услуги). Окно сидит внутри обёрток с transform, и
  // z-index дальше ближайшей из них не работает, поэтому на время открытия
  // поднимаем z-index у каждой обёртки на пути до слоя главы. Только
  // z-index: position и filter не трогаем — они сдвигали бы вёрстку.
  const lowerTimer = useRef(0);
  useEffect(() => {
    if (!open) return;
    window.clearTimeout(lowerTimer.current);
    const host = dimRef.current?.parentElement;
    const stop = host?.closest(".chapter-layer");
    if (!host || !stop) return;
    const raised: [HTMLElement, string][] = [];
    // Всё остальное в главе — соседи на пути от окна до слоя главы — уходит
    // в расфокус фильтром (.spotlight-defocus). Блюр «за стеклом» здесь не
    // работает: глава лежит на отдельном слое (will-change: opacity), и
    // backdrop-filter затемнения видит под собой пустоту. filter вёрстку не
    // трогает — размеры и места блоков те же.
    const dimmed: HTMLElement[] = [];
    for (let el: HTMLElement | null = host; el && el !== stop; el = el.parentElement) {
      if (el !== host) {
        raised.push([el, el.style.zIndex]);
        // 70, не 60: карточки команды поднимаются на 60 правилом
        // [data-appear]:has([data-raise]) и шли бы поверх окна.
        el.style.zIndex = "70";
      }
      const parent: HTMLElement | null = el.parentElement;
      if (!parent) break;
      for (const sib of Array.from(parent.children)) {
        if (sib !== el && sib instanceof HTMLElement && !sib.contains(host)) {
          sib.classList.add("spotlight-defocus-fx");
          dimmed.push(sib);
        }
      }
    }
    // Класс-переход ставится кадром раньше самого блюра, чтобы он проявился
    // плавно, а не включился сразу.
    const raf = requestAnimationFrame(() => dimmed.forEach((e) => e.classList.add("spotlight-defocus")));
    return () => {
      cancelAnimationFrame(raf);
      dimmed.forEach((e) => e.classList.remove("spotlight-defocus"));
      // Опускаем, когда окно уже ушло, иначе на закрытии оно на миг
      // провалится под соседей.
      lowerTimer.current = window.setTimeout(() => {
        for (const [e, z] of raised) e.style.zIndex = z;
        dimmed.forEach((e) => e.classList.remove("spotlight-defocus-fx"));
      }, 480);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    document.documentElement.setAttribute("data-spotlight-open", "");
    let raf = 0;
    const fit = () => {
      const el = dimRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (Math.abs(r.left) > 0.5 || Math.abs(r.top) > 0.5 || Math.abs(r.width - vw) > 0.5 || Math.abs(r.height - vh) > 0.5) {
          // Глава на невысоком телефоне ужимается CSS-зумом (paneRoom в
          // CinematicSection, напр. 0.85) — вместе с ней ужимался и этот
          // слой: справа и снизу оставалась незатемнённая полоса (Егор,
          // 2026-10-08). Обратный зум на самом слое возвращает ему масштаб
          // экрана, дальше подгонка ниже работает в честных пикселях.
          let zoom = 1;
          for (let a = el.parentElement; a; a = a.parentElement) {
            const z = parseFloat(getComputedStyle(a).zoom);
            if (z && z !== 1) zoom *= z;
          }
          const unzoom = Math.abs(zoom - 1) > 0.001 ? String(1 / zoom) : "";
          if (el.style.zoom !== unzoom) el.style.zoom = unzoom;
          const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
          const tx = (m ? parseFloat(m[1]) : 0) - r.left;
          const ty = (m ? parseFloat(m[2]) : 0) - r.top;
          el.style.transform = `translate(${tx}px, ${ty}px)`;
          el.style.width = `${vw}px`;
          el.style.height = `${vh}px`;
          el.style.right = "auto";
          el.style.bottom = "auto";
        }
      }
      raf = requestAnimationFrame(fit);
    };
    raf = requestAnimationFrame(fit);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-spotlight-open");
    };
  }, [open]);

  // Открыто только одно окошко на странице: когда окошки стоят рядом
  // (глава «Сильные в этом» — два друг под другом), клик по соседнему
  // закрывает текущее, а не открывает второе поверх.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== slug) setOpen(false);
    };
    window.addEventListener("spotlight-open", onOther);
    return () => window.removeEventListener("spotlight-open", onOther);
  }, [slug]);

  // Высота раскрытого окна — «примерно треть экрана», но посчитанная, а не
  // заданная классом.
  //
  // Раньше высоту задавал CSS (`clamp` в классе), а сглаживал её
  // framer-motion'овский `layout`. Со схлопыванием это не работало: layout
  // сравнивает геометрию ДО и ПОСЛЕ смены класса, и задержка, нужная чтобы
  // рамка поехала после растворения содержимого, ломала само измерение —
  // окно дёргалось. Теперь высота — обычное анимируемое число, и порядок
  // «сначала растворилось, потом схлопнулось» задаётся обычной задержкой.
  // Все раскрытые окна — ОДНОЙ формы, как первое (просьба Егора): широкая
  // панель примерно на треть экрана. Кнопки-триггеры остаются разными и
  // стоят каждая на своём месте, но растут они в одинаковое окно.
  //
  // Окно вырастает из своей кнопки и по ширине расходится на всю главу,
  // поэтому нужна геометрия кнопки: где она стоит и какой ширины. Снимается
  // в момент клика (тем же батчем, что и `open`), а не в эффекте после него
  // — иначе первый кадр раскрытия шёл бы по устаревшим числам.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState({ left: 0, width: 0, height: 0, y0: 0, y1: 0, vw: 1200, vh: 900 });
  const measure = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    // Ширина и высота — по раскладке (offset*), а не по getBoundingClientRect:
    // глава на телефоне въезжает с 3D-наклоном (rotateX в stage-frame), и
    // в этот момент прямоугольник сжат — кнопка запоминала ~85% ширины и
    // навсегда оставалась уже соседних окошек (Егор, 2026-10-03).
    const el = wrapRef.current;
    if (r && el) setGeom({ left: r.left, width: el.offsetWidth, height: el.offsetHeight, y0: r.top, y1: r.bottom, vw: window.innerWidth, vh: window.innerHeight });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    // Ширина колонки устаканивается уже после монтирования (глава въезжает,
    // подгружаются шрифты), а в режиме fill так же ведёт себя и высота —
    // без наблюдателя кнопка навсегда оставалась на ширине первого замера
    // и была уже соседних окошек (Егор, 2026-10-03).
    const ro = wrapRef.current ? new ResizeObserver(measure) : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [measure]);

  // Автоподгонка кегля: название и слово-выгода на закрытой плашке всегда в
  // одну строку и целиком. Не влезает по ширине — кегль уменьшается ровно
  // настолько, чтобы влезло (Егор, 2026-10-22). Слежение: размер плашки,
  // смена тезиса (текст подменяется), загрузка шрифтов.
  useEffect(() => {
    if (open) return;
    const root = wrapRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => fit());
    const watched = new Set<Element>();
    // Подгоняем только когда поменялась ширина строки или текст: иначе
    // смена кегля, дёргая наблюдатель, зациклила бы подгонку.
    function fit() {
      root!.querySelectorAll<HTMLElement>(".spotlight-strip-title,.spotlight-strip-punch").forEach((el) => {
        if (!watched.has(el)) {
          watched.add(el);
          ro.observe(el);
        }
        const cw = el.clientWidth;
        const key = `${cw}|${el.textContent}`;
        if (cw <= 0 || el.dataset.fk === key) return;
        el.dataset.fk = key;
        el.style.fontSize = "";
        const sw = el.scrollWidth;
        if (sw > cw) {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = `${Math.max(7, Math.floor(((fs * cw) / sw) * 10) / 10 - 0.3)}px`;
        }
      });
    }
    fit();
    document.fonts?.ready.then(() => {
      root.querySelectorAll<HTMLElement>("[data-fk]").forEach((el) => delete el.dataset.fk);
      fit();
    });
    ro.observe(root);
    const mo = new MutationObserver(fit);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [open, step, geom.width, geom.vw]);

  // Телефон — отдельная раскладка, а не сжатая настольная. «Треть экрана»
  // (300–420px) на десктопе несёт сцену слева и текст справа; на 375px
  // те же 300px должны были вместить и заголовок, и слайд, и цифры — всё
  // это лезло друг на друга и за нижний край. Поэтому на узком экране окно
  // выше (почти весь экран за вычетом шапки и язычка), сцена ложится
  // полосой сверху, а текст мельче.
  const phone = geom.vw < 640;
  const baseH = phone ? (noPreview ? STRIP_HEIGHT_PHONE_COMPACT : STRIP_HEIGHT_PHONE) : STRIP_HEIGHT;
  const stripH = fill && geom.height ? geom.height : baseH;
  const openHeight = phone
    ? Math.max(380, Math.min(460, geom.vh - 150))
    : Math.min(460, Math.max(330, Math.round(geom.vh * 0.38)));
  // Как у первого окна: ширина колонки контента (max-w-7xl минус поля). На
  // телефоне поля уже — 16px с каждой стороны, а не 24.
  const openWidth = Math.min(1200, geom.vw - (phone ? 32 : 48));
  // Якорь панели — левый или правый край кнопки; сдвиг ведёт её так, чтобы
  // раскрытая панель встала по центру экрана, где и стоит вся глава.
  const target = (geom.vw - openWidth) / 2;
  const openShift = right ? target - (geom.left + geom.width - openWidth) : target - geom.left;

  // Окно растёт из кнопки вверх (или вниз у верхних плиток), а кнопка стоит
  // где угодно по высоте главы. На десктопе места хватает, на телефоне —
  // нет: высокое окно, выросшее вверх от кнопки в середине экрана, уходило
  // под шапку сайта и обрезалось. Поэтому на телефоне окно сдвигается
  // по вертикали ровно настолько, чтобы целиком встать между шапкой и
  // нижним краем экрана. Запас в 40px — на язычок «Открыть: …», который
  // торчит за рамку окна с той стороны, откуда оно растёт.
  let openShiftY = 0;
  if (phone) {
    const TAB = 40;
    const minTop = 68 + (top ? 0 : TAB);
    const maxBottom = geom.vh - 12 - (top ? TAB : 0);
    const panelTop = top ? geom.y0 : geom.y1 - openHeight;
    if (panelTop < minTop) openShiftY = minTop - panelTop;
    const panelBottom = panelTop + openShiftY + openHeight;
    if (panelBottom > maxBottom) openShiftY -= panelBottom - maxBottom;
  }

  if (!data) return null;

  const benefit = data.benefits[step] ?? data.benefits[0];

  return (
    <motion.div
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: active || instant ? 1 : 0 }}
      transition={{ duration: instant || reduced ? 0 : 0.8, delay: instant || reduced || !active ? 0 : BEAT.cta, ease: [0.22, 1, 0.36, 1] }}
      // Корень живёт в потоке главы: это её последний блок, а не слой
      // поверх неё. Место и форма кнопки задаются здесь же — отсюда и
      // разное выравнивание на разных блоках.
      className={`relative w-full ${
        fill ? "" : `max-w-[min(100%,calc(520*var(--s)))] ${right || (!side && !leftAlign) ? "ml-auto" : ""}`
      } ${top ? "pb-3" : "pt-3"} ${className}`}
      style={
        {
          "--sp-from": accent.from,
          "--sp-to": accent.to,
        } as React.CSSProperties
      }
    >
      {/* Гашение главы под развёрнутым окном. Слой во весь экран, но не
          часть вёрстки: он появляется только когда окно раскрыто и исчезает
          вместе с ним, поэтому ничего не двигает и ни на что не давит.
          Темнеет И размывается — глава уходит из фокуса, а не просто
          затеняется. */}
      <motion.button
        type="button"
        ref={dimRef}
        aria-label="Закрыть"
        tabIndex={open ? 0 : -1}
        onClick={close}
        initial={false}
        // Та же подложка, что у всех окон (.spotlight-scrim = .site-scrim):
        // проявляется своей прозрачностью, блюр не анимируется.
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: [0.32, 0.72, 0, 1] }}
        className={`spotlight-scrim fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      />

      {/* Кнопка занимает в вёрстке ровно свою высоту, а раскрытое окно
          растёт из неё поверх блока — вверх (обычно) или вниз (для окошек в
          верхней части главы). Так блок отдаёт место элементу, но при
          раскрытии ничего не разъезжается. */}
      {/* Плитка занимает всю ширину своей колонки — то же место, что и
          соседние кнопки блока (askCard, ряд CTA), а не фиксированные 330px
          в углу. Раньше узкая плитка плавала мелким островком на фоне
          пустой колонки; теперь она встаёт в тот же ряд размеров, что и
          остальная вёрстка блока (просьба Егора после первого прохода по
          /smm). */}
      <div
        ref={wrapRef}
        data-raise={open ? "top" : undefined}
        // Открытое окно — на слой выше соседних: пока соседнее ещё
        // схлопывается (0.46с), новое уже растёт поверх, а не сквозь него.
        className={`relative w-full ${open ? "z-[55]" : "z-50"}`}
        style={{ height: fill ? "100%" : baseH, minHeight: fill ? baseH : undefined }}
      >
        <motion.div
          initial={false}
          animate={{
            height: open ? openHeight : stripH,
            width: open ? openWidth : geom.width || undefined,
            x: open ? openShift : 0,
            y: open ? openShiftY : 0,
            // Радиус едет вместе с размерами, а не переключается классом:
            // иначе в первом же кадре раскрытия пилюля превращалась в
            // прямоугольник, и дальше «росло» уже другое тело.
            // Полностью скруглённые торцы (999 — форма таблетки) остаются
            // только у полосы во всю ширину главы (`place="bottom"`,
            // `shape="pill"` — единственная кнопка «на всю страницу»).
            // Плитки под левый/правый блок (`side`) и плашки-карточки
            // (`shape="card"`) теперь прямоугольные, как таблички команды
            // (TeamAskCard, rounded-2xl): полный овал на кнопке, выровненной
            // по ширине соседнего блока, читался чужеродно рядом с его
            // прямыми углами (просьба Егора).
            borderRadius: open ? 24 : 16,
          }}
          // Разворот бодрый, схлопывание — мягче, дольше и с задержкой: к
          // моменту, когда едет рамка, содержимое уже растворилось в
          // блюре, поэтому глаз видит одно движение, а не два разом.
          // Закрытие — зеркало открытия: та же кривая, та же длительность,
          // без задержек (Егор попросил повторить анимацию открытия). Окно
          // схлопывается ровно так же, как выросло, только в обратную
          // сторону.
          transition={{ duration: reduced ? 0 : 0.46, ease: [0.32, 0.72, 0, 1] }}
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          // overflow видимый: над окном торчит язычок с кнопкой, и клип по
          // рамке срезал бы его. Кадр и скрим поэтому живут в собственном
          // клипованном слое ниже, а не на самом контейнере.
          // Закрытая кнопка — почти капсула (999px), раскрытое окно —
          // крупный, но всё ещё мягкий радиус: Егор просил уйти от
          // прямоугольности. Радиус меняется вместе с состоянием, поэтому
          // кнопка «разворачивается» из пилюли в окно, а не превращается в
          // другой объект.
          // `!absolute` с восклицательным знаком не для красоты: `.glass-panel`
          // объявлен вне слоёв Tailwind и задаёт `position: relative`, из-за
          // чего обычный класс `absolute` он перебивал — окно вырастало
          // вниз, за край экрана, вместо того чтобы подниматься над кнопкой.
          className={`glass-panel deck-neon-pulse !absolute ${
            top ? "top-0" : "bottom-0"
          } ${right ? "right-0" : "left-0"} ${
            open ? "spotlight-open" : "spotlight-strip cursor-pointer"
          }`}
          style={{ "--card-glow-rgb": hexToRgb(accent.to) } as React.CSSProperties}
          onClick={open ? undefined : () => { measure(); setOpen(true); window.dispatchEvent(new CustomEvent("spotlight-open", { detail: slug })); }}
        >
          {/* Тот же кадр, что на карточке карусели и в шапке страницы
              инструмента: окно читается как выросшая карточка, а не как
              новый, ниоткуда взявшийся элемент. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            <img
              src={data.image}
              alt=""
              loading="lazy"
              // 0.28 → 0.44 по просьбе Егора: кадр должен читаться, а не
              // угадываться. Скрим под текстом ослаблен на столько же,
              // иначе поднятая экспозиция снова съедается им.
              // Размыт (Егор, 2026-10-12): картинка — фон, текст поверх читается.
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.44] [filter:grayscale(0.2)_contrast(1.05)_blur(8px)]"
            />
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(10,12,16,0.88) 0%, rgba(10,12,16,0.6) 48%, rgba(10,12,16,0.38) 100%)",
              }}
            />
          </span>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                // Уход зеркалит появление — то же смещение в обратную
                // сторону. Блюр на слое такого размера рендерился рывками,
                // поэтому движение держат только opacity и transform.
                exit={{ opacity: 0, y: 4, transition: { duration: reduced ? 0 : 0.16 } }}
                transition={{ duration: reduced ? 0 : 0.32, delay: reduced ? 0 : 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 flex flex-col"
              >
                <div
                  className="flex min-h-0 flex-1 flex-col gap-3 p-4 pb-3 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5 sm:pb-4 lg:gap-7 lg:p-6 lg:pb-5"
                >
                {/* Телефон: над графикой всегда стоит акцентный офер —
                    прямая просьба Егора. На узкой сцене подписи самой схемы
                    выключены (mini, см. ниже — при littlebox текст внутри
                    свёл бы иллюстрацию в кашу), поэтому графика без единого
                    слова читалась бы как декорация без смысла. Эта строка —
                    название услуги фирменным Bebas в градиенте страницы —
                    возвращает графике заголовок, не залезая внутрь неё. */}
                {phone && (
                  <p className="spotlight-accent shrink-0 text-center font-display text-[calc(13*var(--s))] uppercase leading-tight tracking-[0.08em] sm:text-sm">
                    {data.title}
                  </p>
                )}

                {/* Схема слева — ведёт за тезисом справа. */}
                {/* В квадратном окне сцена лежит сверху во всю ширину, в
                    полосе — слева колонкой: в обоих случаях она занимает
                    примерно треть окна, просто по разной оси. */}
                <div
                  // Телефон: сцена — ровно половина окна, а не узкая полоса сверху.
                  // Раньше высота была фиксированной (110px) при том, что окно на
                  // телефоне выросло почти на весь экран — картинка терялась в
                  // маленьком прямоугольнике, а под текстом снизу оставалась
                  // пустая дыра (см. ниже). `flex-1` без базовой высоты делит
                  // свободное место 50/50 с текстовой колонкой (у неё тоже
                  // flex-1) — тот же приём, каким flex обычно делит колонки.
                  className="relative w-full flex-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 sm:h-auto sm:w-[36%] sm:flex-none lg:w-[34%]"
                >
                  {/* На телефоне сцена стоит полосой ~110px: в таком масштабе подписи и
                      цифры внутри неё нечитаемы, поэтому только фигуры (mini), а
                      слова несёт текст ниже. */}
                  <SpotlightScene slug={data.slug} step={step} mini={phone} clean />
                  {steps > 1 && (
                    <SceneArrows onPrev={() => setStep((s) => (s - 1 + steps) % steps)} onNext={() => setStep((s) => (s + 1) % steps)} />
                  )}
                </div>

                <SpotlightCopy data={data} step={step} setStep={setStep} onClose={close} compact={phone} showSub={!phone} large={!phone} />
                </div>

                {/* Кнопка — язычок НАД окном: верхняя кромка плавно
                    выгибается и выпирает за рамку ровно по ширине текста.
                    Призыв не занимает место внутри окна и читается как его
                    продолжение. Центрирование — обычным flex-контейнером, а не
                    `translateX(-50%)`: framer-motion пишет свой transform в
                    тот же элемент, которому задаёт анимацию, и затирает
                    им любое смещение из CSS. Поэтому позиционирует
                    контейнер, а анимируется вложенная кнопка. */}
                <div className={top ? "spotlight-tab-wrap spotlight-tab-wrap-bottom" : "spotlight-tab-wrap"}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.2 }}
                  >
                    <Link href={data.href} className="spotlight-tab">
                      {/* С названием услуги: «Открыть инструмент» само по
                          себе не отвечает на вопрос, какой именно. */}
                      <span className="spotlight-open-cta-text">Открыть: {data.short}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
                        <path d="M5 12h13M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="strip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.14 } }}
                transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : 0.14 }}
                className={`absolute inset-0 flex min-w-0 overflow-hidden ${
                  // `fill` — единственный узкий вызов (плитка в ячейке сетки
                  // "05 хронология"): там название в общей строке с картинкой
                  // упиралось в узкую колонку и переносилось по буквам
                  // (`.font-display`'s `overflow-wrap: break-word` как
                  // последний рубеж). Названию отдана своя строка на всю
                  // ширину плитки — там ему хватает места на одну строку —
                  // а картинка с тезисом и стрелкой встали ниже. Egor's ask.
                  fill ? (side ? "items-center gap-5 px-5 py-3" : "flex-col justify-center gap-3 px-5 py-4") : "items-center " + (side ? "gap-4 px-4 py-3" : "gap-3 px-4 py-3 sm:gap-4")
                }`}
              >
                {fill && (
                  // Боковая плитка (side): текст слева, превью справа на всю
                  // высоту — под текстом ему не хватало места (Егор, 2026-10-12).
                  <span className={side ? "block min-w-0 flex-1" : "block w-full shrink-0"}>
                    <span className="spotlight-strip-title block font-display font-bold uppercase text-white">
                      {data.title}
                    </span>
                    {/* Тезис поднят сюда же — в узкой колонке рядом с
                        картинкой ему точно так же не хватало ширины и
                        слово ломалось на буквы ("МАСШТ"/"АБ"). На всю
                        ширину плитки он тоже умещается в одну строку. */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={step}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.7 }}
                        className="spotlight-accent spotlight-sheen spotlight-strip-punch mt-1 block font-display uppercase"
                      >
                        {benefit.punch}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                )}
                <span className={fill ? (side ? "flex h-full shrink-0 items-center gap-4" : "flex min-w-0 flex-1 items-center gap-5") : "contents"}>
                {/* Мини-превью карточки — та же графика, что развернётся.
                    Раньше квадрат ~64px тонул в пустом тёмном поле плитки;
                    Егор попросил растянуть его минимум на треть кнопки — на
                    боковых плитках теперь под превью почти вся высота полосы
                    и больше трети её ширины.

                    На широкой нижней полосе (place="bottom") 30% от почти
                    полной ширины главы всё равно оставляли саму картинку
                    маленькой: сцена рисуется в холсте 340×210 (соотношение
                    ~1.6:1), а коробка получалась в разы шире, и браузер
                    вписывает SVG по короткой стороне (высоте) — рисунок
                    занимал только середину коробки, а остальное оставалось
                    пустым тёмным полем вокруг него. Именно это Егор и
                    показал: «окошко растянула, а саму графику — нет».
                    `aspect-[340/210]` держит коробку в пропорциях самого
                    холста, поэтому вписанная картинка заполняет её
                    целиком, без полей, на любой ширине строки. */}
                {!noPreview && (
                <span
                  className={`relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 ${
                    side
                      ? fill
                        ? "hidden h-[calc(84*var(--s))] w-[calc(136*var(--s))] sm:block sm:h-full sm:max-h-[calc(96*var(--s))] sm:w-auto sm:aspect-[340/210]"
                        : "hidden h-[calc(96*var(--s))] w-[calc(150*var(--s))] sm:block sm:h-[calc(96*var(--s))] sm:w-[42%]"
                      : "hidden h-[calc(54*var(--s))] aspect-[340/210] sm:block"
                  }`}
                >
                  <SpotlightScene slug={data.slug} step={step} mini />
                </span>
                )}
                {/* В `fill`-режиме название и тезис уже стоят своей строкой
                    над этим рядом (см. выше) — здесь остаётся только
                    картинка и стрелка, эта колонка целиком лишняя. */}
                {!fill && (
                  <span className="min-w-0 flex-1 pr-1">
                    <span
                      // Название переносится на вторую строку, а не режется
                      // многоточием: обрезанное на полуслове название
                      // Егор назвал неприемлемым.
                      className="spotlight-strip-title block font-display font-bold uppercase text-white"
                    >
                      {data.title}
                    </span>
                    {/* Подзаголовок меняется вместе с графикой: это не
                        статичная цифра, а тезис текущей сцены — до клика
                        видно, о чём внутри будут говорить. */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={step}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.7 }}
                        className="spotlight-accent spotlight-sheen spotlight-strip-punch mt-1 block font-display uppercase"
                      >
                        {benefit.punch}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                )}
                {fill && !side && <span className="flex-1" />}
                <span className="spotlight-cta shrink-0">
                  {/* В плашке-форме (глава 04) подписи-кнопки нет: место
                      нужно названию и слову-выгоде, а плашка и так целиком
                      кликабельна. Остаётся только шеврон как намёк. */}
                  <svg width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** "#ff4fd8" → "255, 79, 216" — свечение в globals.css собирается из
 *  каналов, чтобы можно было менять прозрачность отдельно от цвета. */
function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
