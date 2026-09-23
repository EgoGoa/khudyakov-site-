"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import { spotlightFor } from "@/components/home/ai/spotlightData";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

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
 *  застывает. */
const BEAT_MS = 5200;

/** Высота закрытой кнопки. Числом, а не по содержимому: высота окна
 *  анимируется числом (см. ниже), и второй конец этой анимации тоже
 *  обязан быть числом.
 *
 *  80: кнопке нужно дышать — при 62 название, слово-выгода и превью
 *  стояли вплотную. Высоту, которую она на это забрала, вернули, ужав
 *  собственный вертикальный ритм двух самых плотных глав (04 и 05). */
const STRIP_HEIGHT = 80;


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
}) {
  const side = place !== "bottom";
  const top = place === "top-right" || place === "top-left";
  const right = place === "right" || place === "top-right";
  const data = spotlightFor(slug);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();

  // Затемняющий слой уходит в портал на document.body (см. ниже, у самого
  // backdrop) — без этого он не гасит и не размывает сайт. `CinematicStage`
  // двигает главы через `frame.style.transform` (свой pin/scroll-эффект), а
  // `position: fixed` внутри элемента с любым transform-предком считается не
  // от вьюпорта, а от того предка (спека CSS) — тот же баг, что уже описан и
  // решён порталом в CenterModal.tsx. Без портала затемнение накрывало
  // только площадь текущей главы: всё, что выше и ниже неё (соседняя
  // карусель, следующий блок), оставалось ярким и резким прямо под открытым
  // окном — ровно то, на что жаловался Егор. `mounted` — та же защита от
  // hydration-мисматча, что и в CenterModal: на сервере document нет.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag, same as CenterModal.tsx
  useEffect(() => setMounted(true), []);

  const steps = data?.benefits.length ?? 0;

  // Тезисы сменяются сами, пока окно открыто и на него не навели курсор:
  // это витрина, а не слайдер, который посетитель обязан листать руками.
  // Шаг идёт и в закрытом виде: мини-превью на полосе меняет сцены так же,
  // как развёрнутое окно (просьба Егора) — полоса заранее показывает, что
  // внутри есть кино, а не одна застывшая иконка.
  useEffect(() => {
    if (held || steps < 2 || reduced) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), BEAT_MS);
    return () => window.clearInterval(id);
  }, [held, steps, reduced]);

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

  // Пока окно открыто, страница за ним не должна ехать под неподвижным
  // (`position: fixed`, см. портал ниже) окном — иначе фон уползает вбок или
  // вверх у окна, которое сохраняет свою позицию во вьюпорте.
  useBodyScrollLock(open);

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
    if (r) setGeom({ left: r.left, width: r.width, height: r.height, y0: r.top, y1: r.bottom, vw: window.innerWidth, vh: window.innerHeight });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    // В режиме fill высота кнопки — это высота соседней карточки ряда, а она
    // устаканивается уже после появления главы.
    const ro = fill && wrapRef.current ? new ResizeObserver(measure) : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [measure, fill]);

  const stripH = fill && geom.height ? geom.height : STRIP_HEIGHT;
  // Телефон — отдельная раскладка, а не сжатая настольная. «Треть экрана»
  // (300–420px) на десктопе несёт сцену слева и текст справа; на 375px
  // те же 300px должны были вместить и заголовок, и слайд, и цифры — всё
  // это лезло друг на друга и за нижний край. Поэтому на узком экране окно
  // выше (почти весь экран за вычетом шапки и язычка), сцена ложится
  // полосой сверху, а текст мельче.
  const phone = geom.vw < 640;
  const openHeight = phone
    ? Math.max(380, Math.min(460, geom.vh - 150))
    : Math.min(460, Math.max(330, Math.round(geom.vh * 0.38)));
  // Как у первого окна: ширина колонки контента (max-w-7xl минус поля). На
  // телефоне поля уже — 16px с каждой стороны, а не 24.
  const openWidth = Math.min(1200, geom.vw - (phone ? 32 : 48));
  // Раскрытая панель встаёт по центру экрана, где и стоит вся глава —
  // независимо от того, у какого края (левого или правого) стоит сама
  // кнопка: обе стороны одинаково растут к этой же середине.
  const target = (geom.vw - openWidth) / 2;

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
    <div
      // Корень живёт в потоке главы: это её последний блок, а не слой
      // поверх неё. Место и форма кнопки задаются здесь же — отсюда и
      // разное выравнивание на разных блоках.
      className={`relative w-full ${
        side ? (right ? "flex justify-end" : "flex justify-start") : ""
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
          затеняется.

          В портале на document.body, а не прямо здесь: этот слой стоит
          внутри главы, которую CinematicStage двигает через
          `frame.style.transform` (её pin/scroll-эффект), а `position: fixed`
          внутри элемента с transform-предком считается не от вьюпорта, а от
          этого предка. Без портала темнота накрывала только текущую главу —
          соседняя карусель над окном и следующий блок под ним оставались
          яркими и резкими прямо за раскрытым окном, а язычок кнопки (у
          которого вырезанные уголки рассчитаны на тёмный фон под ними) резал
          по этому яркому видео как по живому. Портал — тот же приём и та же
          причина, что уже описаны в CenterModal.tsx. */}
      {mounted &&
        createPortal(
          <motion.button
            type="button"
            aria-label="Закрыть"
            tabIndex={open ? 0 : -1}
            onClick={close}
            initial={false}
            animate={{
              opacity: open ? 1 : 0,
              backdropFilter: open ? "blur(14px) saturate(80%)" : "blur(0px) saturate(100%)",
            }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed inset-0 z-40 bg-ink/80 ${open ? "" : "pointer-events-none"}`}
          />,
          document.body
        )}

      {/* Кнопка занимает в вёрстке ровно свою высоту — глава не сжимается
          ни в закрытом, ни в раскрытом виде. Раскрытое окно больше НЕ растёт
          прямо из неё (см. портал ниже): сама кнопка теперь только
          закрытая — простая, без анимации размеров. */}
      {/* Плитка занимает всю ширину своей колонки — то же место, что и
          соседние кнопки блока (askCard, ряд CTA), а не фиксированные 330px
          в углу. Раньше узкая плитка плавала мелким островком на фоне
          пустой колонки; теперь она встаёт в тот же ряд размеров, что и
          остальная вёрстка блока (просьба Егора после первого прохода по
          /smm). */}
      <div
        ref={wrapRef}
        className="relative z-50 w-full"
        style={{ height: fill ? "100%" : STRIP_HEIGHT, minHeight: fill ? STRIP_HEIGHT : undefined }}
      >
        <div
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          className={`glass-panel deck-neon-pulse spotlight-strip cursor-pointer !absolute ${
            top ? "top-0" : "bottom-0"
          } ${right ? "right-0" : "left-0"}`}
          style={
            {
              height: stripH,
              width: geom.width || undefined,
              borderRadius: side || shape === "card" ? 20 : 999,
              // Пока портал открыт, сама кнопка не нужна глазу — она под
              // ним, ровно там, откуда выросло окно (см. `initial`/`exit`
              // портала). Прячем её, а не выключаем: раскрытая копия должна
              // застать её точно в той же геометрии, иначе в первом кадре
              // будет видно смену размеров.
              visibility: open ? "hidden" : "visible",
              "--card-glow-rgb": hexToRgb(accent.to),
            } as React.CSSProperties
          }
          onClick={() => { measure(); setOpen(true); }}
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
              className="absolute inset-0 h-full w-full object-cover opacity-[0.44] [filter:grayscale(0.2)_contrast(1.05)]"
            />
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(10,12,16,0.88) 0%, rgba(10,12,16,0.6) 48%, rgba(10,12,16,0.38) 100%)",
              }}
            />
          </span>

          <div
            className={`absolute inset-0 flex min-w-0 items-center overflow-hidden ${
              side ? "gap-3.5 px-4 py-3" : "gap-5 px-5 py-3 sm:px-6"
            }`}
          >
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
            <span
              className={`relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 ${
                side ? "h-16 w-[38%]" : "hidden h-[70px] aspect-[340/210] sm:block"
              }`}
            >
              {/* Размонтирована, а не просто спрятана вместе со всей
                  полосой (`visibility` выше) — и на телефоне не монтируется
                  вовсе, даже закрытая (`hidden ... sm:block` на самой этой
                  span выше уже гасит её визуально на такой ширине). Причина
                  жёстче, чем «зачем рисовать то, что не видно»: у каждой
                  сцены свой `<Frame>` с ЖЁСТКО заданными id="sp-ramp"/
                  id="sp-glow" (sceneKit.tsx), и на странице с несколькими
                  главами одновременно смонтировано несколько таких `<svg>`
                  с ОДИНАКОВЫМ id. Браузер для `fill="url(#sp-ramp)"`
                  резолвит id глобально по всему документу и берёт первый по
                  порядку — если это окажется чья-то ещё непоказанная копия
                  (скрытая так же, `visibility` или этим самым
                  `hidden sm:block`), заливка градиентом пропадает у ВСЕХ,
                  кто ссылается на то же имя, включая наше открытое окно
                  дальше в этом же файле: подписи (обычный `fill="#fff"`)
                  остаются, а цветные полосы — нет. Не размонтировать
                  ненужное на телефоне — значит оставлять на странице лишние
                  копии `id="sp-ramp"`, которые ничего не показывают, но
                  готовы перехватить чужую заливку. */}
              {!open && (side || !phone) && <SpotlightScene slug={data.slug} step={step} mini />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                // Название переносится на вторую строку, а не режется
                // многоточием: обрезанное на полуслове название
                // Егор назвал неприемлемым.
                className="block font-display text-[12px] font-bold uppercase leading-tight tracking-[0.16em] text-white"
              >
                {data.title}
              </span>
              {/* Подзаголовок меняется вместе с графикой: это не
                  статичная цифра, а тезис текущей сцены — до клика
                  видно, о чём внутри будут говорить. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={step}
                  initial={{ opacity: 0, filter: "blur(5px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(5px)" }}
                  transition={{ duration: reduced ? 0 : 0.7 }}
                  className="spotlight-accent spotlight-sheen mt-1 block font-display text-[15px] uppercase leading-snug tracking-[0.06em]"
                >
                  {benefit.punch}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="spotlight-cta shrink-0">
              {/* В плашке-форме (глава 04) подписи-кнопки нет: место
                  нужно названию и слову-выгоде, а плашка и так целиком
                  кликабельна. Остаётся только шеврон как намёк. */}
              {!side && shape !== "card" && (
                <span>
                  <span className="hidden sm:inline">Почему это работает</span>
                  <span className="sm:hidden">Подробнее</span>
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Раскрытое окно — тоже в портале на document.body, рядом с
          затемнением, и по той же причине: иначе оно остаётся заперто
          внутри трансформируемой главы и либо обрезается, либо (что хуже)
          красится позади затемнения на body, которое теперь честно берёт
          весь экран, а до этой правки локальная кнопка и окно жили в одном
          локальном контексте наложения, поэтому их взаимный z-index (40/50)
          решал всё внутри той же главы. Как только затемнение ушло на
          настоящий верхний уровень страницы, окно должно было уйти вместе с
          ним — иначе именно оно (а не глава) оказывалось под затемнением.

          Раньше окно росло из кнопки через `x`/`y`-смещение в системе
          координат самой кнопки (`position: absolute` внутри неё). В
          портале этой системы координат нет — окно позиционируется
          `position: fixed` и координатами прямо во вьюпорте (`left`/`top`),
          которые уже посчитаны выше (`geom`, `target`, `openShiftY`) ровно
          для этого. Начальные и конечные кадры — те же самые кнопка и окно,
          что и раньше, просто без `x`/`y`-хака, который не пережил бы
          вынос в портал. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="spotlight-panel"
                initial={{
                  left: geom.left,
                  top: top ? geom.y0 : geom.y1 - stripH,
                  width: geom.width,
                  height: stripH,
                  borderRadius: side || shape === "card" ? 20 : 999,
                }}
                animate={{
                  left: target,
                  top: top ? geom.y0 + openShiftY : geom.y1 - openHeight + openShiftY,
                  width: openWidth,
                  height: openHeight,
                  borderRadius: 34,
                }}
                // Закрытие — зеркало открытия: та же кривая, та же
                // длительность, без задержек (Егор попросил повторить
                // анимацию открытия). Окно схлопывается ровно туда же, откуда
                // выросло, точно на место (снова невидимой) кнопки.
                exit={{
                  left: geom.left,
                  top: top ? geom.y0 : geom.y1 - stripH,
                  width: geom.width,
                  height: stripH,
                  borderRadius: side || shape === "card" ? 20 : 999,
                }}
                transition={{ duration: reduced ? 0 : 0.46, ease: [0.32, 0.72, 0, 1] }}
                onMouseEnter={() => setHeld(true)}
                onMouseLeave={() => setHeld(false)}
                style={
                  {
                    position: "fixed",
                    // Между затемнением (40) и шапкой сайта (50): окно
                    // должно стоять над погашенной страницей, но не поверх
                    // шапки — та же договорённость, что уже держит на
                    // телефоне отступ `openShiftY` от её высоты.
                    zIndex: 45,
                    // Портал вынес окно из-под корневого div этого
                    // компонента (там, в JSX-разметке чуть выше, объявлены
                    // --sp-from/--sp-to) прямо в document.body — а CSS-
                    // переменные наследуются по настоящему DOM-дереву, не по
                    // дереву React-компонентов. Портал рвёт именно эту
                    // связь: снаружи такого предка окно наследует то, что
                    // задано на body/html (обычно ничего), поэтому вся
                    // заливка градиентом (`url(#sp-ramp)`, чьи стопы —
                    // `var(--sp-from)`/`var(--sp-to)`) уходила в чёрный —
                    // фигуры на месте, а цвета нет. Задаём обе переменные
                    // здесь же явно, как уже сделано для --card-glow-rgb
                    // строкой ниже.
                    "--sp-from": accent.from,
                    "--sp-to": accent.to,
                    "--card-glow-rgb": hexToRgb(accent.to),
                  } as React.CSSProperties
                }
                className="glass-panel deck-neon-pulse spotlight-open"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ borderRadius: "inherit" }}
                >
                  <img
                    src={data.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.44] [filter:grayscale(0.2)_contrast(1.05)]"
                  />
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(100deg, rgba(10,12,16,0.88) 0%, rgba(10,12,16,0.6) 48%, rgba(10,12,16,0.38) 100%)",
                    }}
                  />
                </span>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4, transition: { duration: reduced ? 0 : 0.16 } }}
                  transition={{ duration: reduced ? 0 : 0.32, delay: reduced ? 0 : 0.12, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 pb-3 sm:p-5 sm:pb-4 lg:flex-row lg:items-stretch lg:gap-7 lg:p-6 lg:pb-5">
                    {/* Телефон: над графикой всегда стоит акцентный офер —
                        прямая просьба Егора. На узкой сцене подписи самой
                        схемы выключены (mini, см. ниже — при littlebox текст
                        внутри свёл бы иллюстрацию в кашу), поэтому графика
                        без единого слова читалась бы как декорация без
                        смысла. Эта строка — название услуги фирменным Bebas
                        в градиенте страницы — возвращает графике заголовок,
                        не залезая внутрь неё. */}
                    {phone && (
                      <p className="spotlight-accent shrink-0 text-center font-display text-[13px] uppercase leading-tight tracking-[0.08em] sm:text-sm">
                        {data.title}
                      </p>
                    )}

                    {/* Схема слева — ведёт за тезисом справа. */}
                    <div className="relative w-full flex-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 lg:h-auto lg:w-[34%] lg:flex-none">
                      <SpotlightScene slug={data.slug} step={step} mini={phone} />
                    </div>

                    <SpotlightCopy data={data} step={step} setStep={setStep} onClose={close} compact={phone} showSub={!phone} />
                  </div>

                  {/* Кнопка — язычок НАД окном: верхняя кромка плавно
                      выгибается и выпирает за рамку ровно по ширине текста.
                      Призыв не занимает место внутри окна и читается как его
                      продолжение. */}
                  <div className={top ? "spotlight-tab-wrap spotlight-tab-wrap-bottom" : "spotlight-tab-wrap"}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

/** "#ff4fd8" → "255, 79, 216" — свечение в globals.css собирается из
 *  каналов, чтобы можно было менять прозрачность отдельно от цвета. */
function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
