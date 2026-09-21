"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
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

/** Ширина закрытой плитки в углу (варианты `right` / `left`). */
const TILE_WIDTH = 330;


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
  const [geom, setGeom] = useState({ left: 0, width: 0, height: 0, vw: 1200, vh: 900 });
  const measure = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setGeom({ left: r.left, width: r.width, height: r.height, vw: window.innerWidth, vh: window.innerHeight });
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
    ? Math.max(380, Math.min(540, geom.vh - 170))
    : Math.min(420, Math.max(300, Math.round(geom.vh * 0.36)));
  // Как у первого окна: ширина колонки контента (max-w-7xl минус поля). На
  // телефоне поля уже — 16px с каждой стороны, а не 24.
  const openWidth = Math.min(1200, geom.vw - (phone ? 32 : 48));
  // Якорь панели — левый или правый край кнопки; сдвиг ведёт её так, чтобы
  // раскрытая панель встала по центру экрана, где и стоит вся глава.
  const target = (geom.vw - openWidth) / 2;
  const openShift = right ? target - (geom.left + geom.width - openWidth) : target - geom.left;

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
          затеняется. */}
      <motion.button
        type="button"
        aria-label="Закрыть"
        tabIndex={open ? 0 : -1}
        onClick={close}
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          backdropFilter: open ? "blur(7px) saturate(85%)" : "blur(0px) saturate(100%)",
        }}
        transition={{ duration: reduced ? 0 : 0.4, ease: [0.32, 0.72, 0, 1] }}
        className={`fixed inset-0 z-40 bg-ink/75 ${open ? "" : "pointer-events-none"}`}
      />

      {/* Кнопка занимает в вёрстке ровно свою высоту, а раскрытое окно
          растёт из неё поверх блока — вверх (обычно) или вниз (для окошек в
          верхней части главы). Так блок отдаёт место элементу, но при
          раскрытии ничего не разъезжается. */}
      <div
        ref={wrapRef}
        className={`relative z-50 ${side ? "" : "w-full"}`}
        style={{ height: fill ? "100%" : STRIP_HEIGHT, minHeight: fill ? STRIP_HEIGHT : undefined, width: side ? TILE_WIDTH : undefined }}
      >
        <motion.div
          initial={false}
          animate={{
            height: open ? openHeight : stripH,
            width: open ? openWidth : geom.width || undefined,
            x: open ? openShift : 0,
            // Радиус едет вместе с размерами, а не переключается классом:
            // иначе в первом же кадре раскрытия пилюля превращалась в
            // прямоугольник, и дальше «росло» уже другое тело.
            borderRadius: open ? 34 : shape === "card" ? 22 : 999,
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
          onClick={open ? undefined : () => { measure(); setOpen(true); }}
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
                  className={`flex min-h-0 flex-1 gap-3 p-4 pb-3 sm:p-5 sm:pb-4 lg:gap-7 lg:p-6 lg:pb-5 ${
                    "max-lg:flex-col lg:items-stretch"
                  }`}
                >
                {/* Схема слева — ведёт за тезисом справа. */}
                {/* В квадратном окне сцена лежит сверху во всю ширину, в
                    полосе — слева колонкой: в обоих случаях она занимает
                    примерно треть окна, просто по разной оси. */}
                <div
                  className={`relative h-[92px] w-full shrink-0 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 sm:h-[120px] lg:h-auto lg:w-[34%]`}
                >
                  <SpotlightScene slug={data.slug} step={step} />
                </div>

                <SpotlightCopy data={data} step={step} setStep={setStep} onClose={close} compact={phone} showSub={!phone} />
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
            ) : (
              <motion.div
                key="strip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.14 } }}
                transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : 0.14 }}
                className={`absolute inset-0 flex min-w-0 items-center overflow-hidden ${
                  side ? "gap-3.5 px-4 py-3" : "gap-5 px-5 py-3 sm:px-6"
                }`}
              >
                {/* Мини-превью карточки — та же графика, что развернётся. */}
                <span
                  className={`relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 ${
                    side ? "h-14 w-16" : "hidden h-14 w-20 sm:block"
                  }`}
                >
                  <SpotlightScene slug={data.slug} step={step} mini />
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
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
