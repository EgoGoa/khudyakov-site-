"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import WelcomeBlockGraphic, { WelcomeDirectionGraphic } from "@/components/home/WelcomeBlockGraphic";
import { blockHref, blocksFor, directionCards, type BlockCard } from "@/lib/welcome-blocks";

// Вступительная сцена: логотип → «Привет, с чего начнём?» → четыре карточки
// направлений → карточки блоков выбранного направления.
//
// Что изменилось по сравнению с прежним вайб-окном и почему.
//
//   · Не окно, а сцена. Раньше это был плотный стеклянный диалог со списком
//     неоновых кнопок-пилюль. Кнопка называет раздел словом; карточка
//     показывает его — за ней идёт полный ролик той самой страницы, куда
//     ведёт клик. Человек выбирает по тому, что увидит, а не по названию.
//     Поэтому подложка окна снята совсем (CenterModal bare): стекло здесь
//     несут сами карточки, а логотип и заголовок стоят на прозрачном.
//
//   · Два шага вместо трёх. Приветствие больше не отдельный экран с
//     посимвольной печатью, который нужно пересидеть: логотип и заголовок
//     появляются вместе с карточками, одной сценой. Печать и голосовая
//     волна убраны — они держали человека полторы секунды перед тем, что он
//     и пришёл нажать.
//
//   · Второй шаг — блоки страницы, а не её подстраницы. Карточки те же по
//     языку (кадр, стекло, свечение, стрелка), но показывают главы: их
//     настоящие заголовки со страницы, номер главы и лёгкую схему справа.
//     Переход — якорь на главу, его подхватывает CinematicStage при
//     загрузке.
//
//   · Язык карточек взят у раскрывающихся табличек услуг (ToolSpotlight):
//     тот же .glass-panel, то же свечение .deck-neon-pulse, тот же приём
//     «кадр под 0.44 + косой скрим». Одна сцена — один язык со страницами.

const EASE = [0.22, 1, 0.36, 1] as const;
/** Кривая входа для сцены (вопрос, карточки, логотип) — не EASE выше. EASE
 *  выбрасывает почти всё движение в первые доли секунды (y1=1 в кривой —
 *  резкий разгон), это было специально подобрано под чёткий «щелчок» букв
 *  в заставке. Здесь же нужна обратная задача — «нежно» — поэтому расфокус
 *  и прозрачность идут по симметричной кривой без рывка ни в начале, ни
 *  перед самым концом: даже длинная длительность на резком EASE читается
 *  как внезапный скачок, потому что вся видимая часть движения сжата в
 *  первые 30% времени — само число секунд тут ни при чём. */
const GENTLE_EASE = [0.45, 0, 0.15, 1] as const;

/** Ритм входа — переписан на variants/staggerChildren вместо ручных
 *  задержек d(T_X + i*STAGGER). Прежняя схема считала момент появления
 *  каждого элемента заранее угаданным числом — при любой правке длительности
 *  где-то один множитель приходилось искать и синхронизировать вручную, и
 *  разъезжалось (жалобы Егора: то пауза, то рывок, то нет плавности).
 *  Теперь порядок задаёт декларативная оркестровка Framer (родитель со
 *  staggerChildren сам расставляет детей по очереди), а логотип — самый
 *  зависимый по времени элемент — стартует не по таймеру, а по факту
 *  onAnimationComplete последней карточки. Так последовательность верна
 *  всегда, независимо от того, как позже поменяют длительности ниже.
 *
 *  Порядок остаётся тем же, что просил Егор: вопрос «Привет, с чего
 *  начнём?» проступает первым (в момент, когда гаснет знак в заставке
 *  IntroSplash), следом сверху вниз одна за другой — четыре карточки, и
 *  только когда они осели на местах — над вопросом проявляется логотип. */
const REVEAL_DURATION = 0.9;
const CARD_STAGGER = 0.14;

/** Единый стиль растворения — то же самое, чем на входе и выходе играет
 *  знак в заставке (блюр + прозрачность, минимум сдвига). Используется и
 *  вопросом, и карточками, и логотипом — поэтому вся сцена читается одним
 *  языком, а не тремя разными анимациями. */
const dissolveIn: Variants = {
  hidden: { opacity: 0, y: -14, filter: "blur(16px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: REVEAL_DURATION, ease: GENTLE_EASE } },
};

/** Колода карточек — сама себе оркестратор: получив "show" через `animate`,
 *  тут же по цепочке раскрывает своих детей с собственным шагом. Так
 *  «сверху вниз одна за другой» задаётся одним числом (CARD_STAGGER), а не
 *  пересчитывается вручную на каждую карточку. */
const deckVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: CARD_STAGGER, delayChildren: 0.05 } },
};

/** Пауза перед роутингом. Переход и закрытие, запущенные в один кадр, спорят
 *  за главный поток: рендер новой страницы съедает середину исчезновения, и
 *  сцена уходит рывком. Пауза чуть короче самого исчезновения. */
const EXIT_BEFORE_ROUTE_MS = 200;

/** Сцена не прокручивается ни на каком экране (требование Егора). На низком
 *  экране она не обрезается и не заводит скролл, а целиком ужимается одним
 *  transform: пропорции и попадание пальцем сохраняются. При нормальной
 *  высоте множитель равен единице и не делает ничего. */
const CHROME_PX = 72;
const MIN_FIT_SCALE = 0.52;

function useFitToHeight(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const natural = el.scrollHeight;
      if (!natural) return;
      const available = window.innerHeight * 0.94 - CHROME_PX;
      const scale = natural > available ? Math.max(MIN_FIT_SCALE, available / natural) : 1;
      setFit((prev) =>
        Math.abs(prev.scale - scale) < 0.001 && prev.height === natural ? prev : { scale, height: natural }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- пересчёт на смене шага, содержимое там другой высоты
  }, deps);

  // Кортежем, а не объектом: правило react-hooks/refs считает обращением к
  // ref любое чтение свойства у объекта, в котором ref лежит.
  return [ref, fit.scale, fit.height] as const;
}

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Яркая середина градиента названия. Прямой переход между двумя цветами
 *  страницы проходит через грязный серо-синий (розовый → голубой у /sites,
 *  фиолетовый → голубой у /smm) — середина буквы темнеет. Промежуточный
 *  цвет берётся из той же гаммы, но такой же яркости, как края. */
const GRADIENT_MID: Record<ServiceKey, string> = {
  content: "#ff5a90",
  ai: "#6fe58a",
  sites: "#a27bff",
  smm: "#7d8cfb",
};

function accentVars(key: ServiceKey): CSSProperties {
  const g = PAGE_GRADIENT[key];
  return {
    "--sp-from": g.from,
    "--sp-mid": GRADIENT_MID[key],
    "--sp-to": g.to,
    "--card-glow-rgb": hexToRgb(g.to),
  } as CSSProperties;
}

/** Стрелка «перейти» у правого края карточки — тот же кружок со стрелкой,
 *  что у призыва в табличках услуг. */
function GoArrow() {
  return (
    <span className="welcome-card-go" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M5 12h13M12 5l7 7-7 7" />
      </svg>
    </span>
  );
}

/** Фон карточки направления: ролик страницы, куда она ведёт.
 *
 *  Играет всегда и на всех четырёх карточках, включая телефон — прямое
 *  требование Егора. Воспроизведение запускается кодом, а не атрибутом
 *  autoPlay: если браузер откажет в автозапуске (это возможно даже для
 *  беззвучного видео при экономии энергии), у нас останется промах промиса,
 *  который видно в отладке, а не молча застывший постер.
 *
 *  Цена решения названа честно: четыре ролика одновременно нагружают слабый
 *  телефон и вместе с ним дымный след курсора, чей шаг считается по
 *  реальному времени кадра. Облегчает это общесайтовый MediaGovernor: он же
 *  подменяет ролик на лёгкий «-mobile» файл на экранах уже 1024px и в
 *  режиме экономии трафика, он же снимает видео с паузы, когда вкладка
 *  возвращается на передний план. Своей копии этой логики здесь нет
 *  намеренно — два механизма на один <video> разошлись бы порогами. */
function CardVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Небольшая пауза перед play(), а не сразу на монтировании. Разница
    // Егора между «откатом на направления — анимация верная» и «первым
    // появлением после заставки — её нет» была не в разметке (код карточек
    // один и тот же в обоих случаях), а в нагрузке: при первом заходе
    // декодирование четырёх видео стартует в тот же момент, что и
    // гидратация всей страницы, и ещё не погасший дымовой фильтр заставки —
    // три тяжёлые вещи одновременно съедают кадры ровно во время
    // расфокуса карточек. При возврате кнопкой видео уже в кэше браузера, и
    // вокруг всё уже простаивает — отсюда и разница. Здесь видео не
    // отменяются, а просто не встают в очередь на декодирование в первые
    // ~250мс, пока идёт критичная часть входной анимации.
    const id = window.setTimeout(() => {
      void el.play().catch(() => {});
    }, 250);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      className="welcome-card-media"
      aria-hidden="true"
    />
  );
}

export default function WelcomeWidget({
  onClose,
  onSkip,
  skipGreeting = false,
}: {
  /** Посетитель закончил со сценой: выбрал блок или закрыл её. */
  onClose: () => void;
  /** Только «Перейти на сайт →» — когда вызывающему нечего делать отдельно,
   *  совпадает с onClose. */
  onSkip?: () => void;
  /** Открыть без вступительной паузы. Сцена собирается по шагам один раз —
   *  при входе на сайт; когда её же открывают с боковой панели, чтобы
   *  куда-то перейти, ждать сборку заново незачем. */
  skipGreeting?: boolean;
}) {
  const router = useRouter();
  const [reduced, setReduced] = useState(false);
  const [picked, setPicked] = useState<ServiceKey | null>(null);
  const skip = onSkip ?? onClose;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- разовая проверка, matchMedia существует только в браузере
    setReduced(mq.matches);
  }, []);

  // Логотип — самый зависимый по времени элемент сцены: он должен появиться
  // не по угаданной задержке, а по факту, что последняя карточка уже отыграла
  // свой вход (см. onAnimationComplete на ней ниже). skipGreeting и
  // reduced-motion пропускают всю сборку — сцена в этих случаях должна
  // стоять на месте сразу, без повторной анимации при каждом ре-рендере.
  const instant = skipGreeting || reduced;
  const [logoReady, setLogoReady] = useState(instant);
  useEffect(() => {
    if (instant) setLogoReady(true);
  }, [instant]);

  const go = useCallback(
    (href: string) => {
      onClose();
      setTimeout(() => router.push(href), EXIT_BEFORE_ROUTE_MS);
    },
    [onClose, router]
  );

  const blocks: BlockCard[] = picked ? blocksFor(picked) : [];
  const [fitRef, fitScale, fitHeight] = useFitToHeight([picked]);

  return (
    <motion.div
      className="w-full"
      initial={false}
      animate={{ height: fitHeight ? fitHeight * fitScale : "auto" }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div
        ref={fitRef}
        className="welcome-scene flex h-fit w-full flex-col items-center text-center"
        style={{
          ...(fitScale < 1 ? { transform: `scale(${fitScale})`, transformOrigin: "top center" } : undefined),
          // Второй шаг (выбрано направление) поднимает лого к самому верху
          // страницы — там уже не нужен запас под шапку сайта, экран занят
          // списком блоков, и Егор попросил не терять на этом высоту.
          ...(picked ? { paddingTop: "0.75rem" } : undefined),
        }}
      >
        {/* Логотип стоит первым в разметке (визуально сверху), но по времени
            появляется последним: проявляется только когда
            onAnimationComplete последней карточки переключит logoReady. Не
            завязан на угаданную задержку — если длительность карточек ниже
            когда-нибудь поменяется, логотип сам подстроится, ничего вручную
            пересчитывать не нужно. На втором шаге (выбрано направление) он
            уже готов — не перезаходит, а просто стоит выше (см. paddingTop
            ниже). */}
        <motion.div
          className="mb-4 flex items-center gap-2.5"
          initial={{ opacity: 0, filter: "blur(14px)" }}
          animate={logoReady ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(14px)" }}
          transition={{ duration: REVEAL_DURATION * 0.85, ease: GENTLE_EASE }}
          aria-hidden="true"
        >
          <span className="h-3 w-3 shrink-0 animate-pulse-rec rounded-full brand-dot sm:h-3.5 sm:w-3.5" />
          <span className="font-display text-2xl uppercase leading-none tracking-tight text-paper sm:text-3xl">
            HUD<span className="brand-word">.SERVICE</span>
          </span>
        </motion.div>

        {/* Заголовок — растворяется первым, в тот же момент, когда сцена
            монтируется (без задержки: заставка IntroSplash сама решает,
            когда её открыть — см. T_REVEAL там). На втором шаге (выбрано
            направление) заголовок и вопрос встают сразу, без своего
            плавного появления: раньше AnimatePresence в режиме "wait"
            держал экран пустым, пока дожидался исчезновения прежнего
            заголовка, и список блоков приезжал позже и отдельно от него —
            теперь заголовок блока появляется в тот же кадр, что и
            карточки, одной сценой. */}
        <AnimatePresence mode={picked ? "sync" : "wait"} initial={false}>
          <motion.h2
            key={picked ?? "root"}
            initial={picked ? false : { opacity: 0, y: -14, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.2, ease: EASE } }}
            transition={{ duration: REVEAL_DURATION, ease: GENTLE_EASE }}
            className={`welcome-head font-display text-[1.44rem] uppercase leading-[1.21] tracking-tight text-paper sm:text-[1.89rem] ${
              picked ? "welcome-head--flat" : ""
            }`}
          >
            {picked ? (
              <>
                {/* Вопрос — главный заголовок того же размера, что и на
                    первом шаге: Егор просил, чтобы он читался как заголовок,
                    а не как подпись. Название направления ушло в строку
                    над ним — оно уточняет вопрос, а не спорит с ним. */}
                <span style={accentVars(picked)} className="welcome-head-eyebrow">
                  {serviceMeta[picked].label}
                </span>
                {/* Меньше базового кегля и в одну строку (Егор) — «С какого
                    блока начнём?» на базовом 1.6/2.1rem переносилось на
                    два слова второй строкой. */}
                <span className="whitespace-nowrap text-[1.05rem] sm:text-[1.6rem]">
                  С какого блока{" "}
                  <span style={accentVars(picked)} className="welcome-head-kw">
                    начнём?
                  </span>
                </span>
              </>
            ) : (
              // Егор попросил вопрос в одну строку. На узком экране
              // 1.6rem-заголовок в верхнем регистре не помещался в ширину
              // окна одной строкой — отдельный, чуть меньший размер только
              // для этой фразы (на sm+ она и так уже помещалась в 2.1rem).
              <span className="whitespace-nowrap text-[0.73rem] sm:text-[1.26rem]">
                Привет, с чего <span className="kw">начнём?</span>
              </span>
            )}
          </motion.h2>
        </AnimatePresence>

        {/* Карточки. Колонка, одна под другой: все четыре читаются сразу и
            выбор стоит одного клика — листаемая колода добавляла бы шаг
            ровно там, где человек ещё ничего не выбрал. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={picked ?? "directions"}
            variants={picked ? undefined : deckVariants}
            initial={picked ? { opacity: 0 } : "hidden"}
            animate={picked ? { opacity: 1 } : "show"}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="welcome-deck"
          >
            {!picked &&
              directionCards.map((card, i) => (
                <motion.button
                  key={card.key}
                  type="button"
                  // Правка Егора: карточки растворяются сверху вниз, одна за
                  // другой — та же природа, что и у логотипа в заставке: не
                  // прилетает, а проступает из блюра, слегка опускаясь на
                  // место, а не всплывая. Порядок и шаг задаёт родительский
                  // deckVariants (staggerChildren) — не руками на каждой
                  // карточке. Последняя карточка сигналит: как только она
                  // сама доиграла вход, можно проявлять логотип.
                  variants={dissolveIn}
                  onAnimationComplete={i === directionCards.length - 1 ? () => setLogoReady(true) : undefined}
                  onClick={() => {
                    setLogoReady(true);
                    setPicked(card.key);
                  }}
                  // Имя задано явно: название карточки набрано градиентом
                  // во вложенных span'ах, и на них же висит кадр — читалке
                  // проще получить одну внятную строку, чем собирать её.
                  aria-label={`${card.label}. ${card.tagline}`}
                  style={accentVars(card.key)}
                  className="welcome-card glass-panel deck-neon-pulse"
                >
                  <span className="welcome-card-frame" aria-hidden="true">
                    <CardVideo src={card.video} poster={card.poster} />
                    <span className="welcome-card-scrim" />
                  </span>

                  <span className="welcome-card-body">
                    {/* Градиент живёт на вложенном span, а не на самом
                        заголовке: `.welcome-card-title` задаёт белый цвет и
                        объявлен в файле ниже `.spotlight-accent`, поэтому на
                        одном элементе он просто затирал бы прозрачную
                        заливку под градиентом. */}
                    <span className="welcome-card-title">
                      <span className="spotlight-accent">{card.label}</span>
                    </span>
                    <span className="welcome-card-sub">{card.tagline}</span>
                  </span>
                  <span className="welcome-card-graphic" aria-hidden="true">
                    <WelcomeDirectionGraphic serviceKey={card.key} gid={`wdg-${card.key}`} />
                  </span>
                  <GoArrow />
                </motion.button>
              ))}

            {picked &&
              blocks.map((block, i) => (
                <motion.button
                  key={block.id}
                  type="button"
                  initial={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(9px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.62, ease: EASE, delay: reduced ? 0 : i * 0.06 }}
                  onClick={() => go(blockHref(picked, block))}
                  aria-label={`Блок ${block.num}. ${block.title}. ${block.subtitle}`}
                  style={accentVars(picked)}
                  className="welcome-card welcome-card-block glass-panel deck-neon-pulse"
                >
                  <span className="welcome-card-frame" aria-hidden="true">
                    <img src={block.image} alt="" loading="lazy" className="welcome-card-media" />
                    <span className="welcome-card-scrim" />
                  </span>

                  <span className="welcome-card-num" aria-hidden="true">
                    {block.num}
                  </span>
                  <span className="welcome-card-body">
                    <span className="welcome-card-title">
                      {renderTitle(block)}
                    </span>
                    <span className="welcome-card-sub">{block.subtitle}</span>
                  </span>
                  <span className="welcome-card-graphic" aria-hidden="true">
                    <WelcomeBlockGraphic role={block.role} gid={`wbg-${picked}-${block.id}`} />
                  </span>
                  <GoArrow />
                </motion.button>
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Нижний ряд: назад к направлениям и тихий выход на сайт. Появляется
            вместе с логотипом (тот же logoReady) — оба идут последними в
            сцене, никакой отдельной задержки под них считать не нужно. */}
        <motion.div
          className="mt-5 flex w-full items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: picked || logoReady ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <AnimatePresence initial={false}>
            {picked && (
              <motion.button
                key="back"
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
                onClick={() => setPicked(null)}
                className="welcome-quiet"
              >
                ← Направления
              </motion.button>
            )}
          </AnimatePresence>

          <button type="button" onClick={skip} className="welcome-quiet">
            Перейти на сайт →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Заголовок главы с тем же словом-акцентом, каким он набран на самой
 *  странице: человек встретит там ровно ту же строку тем же цветом. */
function renderTitle(block: BlockCard) {
  const at = block.title.indexOf(block.keyword);
  if (at < 0) return block.title;
  return (
    <>
      {block.title.slice(0, at)}
      <span className="spotlight-accent">{block.keyword}</span>
      {block.title.slice(at + block.keyword.length)}
    </>
  );
}
