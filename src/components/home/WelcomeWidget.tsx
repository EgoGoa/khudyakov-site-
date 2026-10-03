"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import WelcomeBlockGraphic, { WelcomeDirectionGraphic } from "@/components/home/WelcomeBlockGraphic";
import { blockHref, blocksFor, directionCards, type BlockCard } from "@/lib/welcome-blocks";
import { InlineVoiceSphere } from "@/components/layout/VoiceAssistant";
import NanoSphere from "@/components/ui/NanoSphere";
import SphereDust from "@/components/ui/SphereDust";
import { ORB_FROM, ORB_TO } from "@/components/vibe/VibeMode";

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
// Раньше при duration 0.9 и шаге всего 0.14 каждая следующая карточка
// стартовала, пока предыдущая была ещё на середине входа — все четыре
// оказывались в движении одновременно, и глазом это читалось как «появились
// разом», а не «друг за другом» (просьба Егора после проверки живьём).
// Первая правка (0.6/0.22) всё ещё оставляла заметный overlap — Егор
// посмотрел живьём и повторил то же самое. Шаг увеличен сильнее,
// длительность каждой карточки заметно короче: окно, где соседние карточки
// движутся одновременно, теперь узкое (0.15с), и глаз явно читает «одна,
// потом другая», а не общую пачку.
const REVEAL_DURATION = 0.45;
const CARD_STAGGER = 0.3;

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

/** «Уменьшить движение» в системе: без блюра, сдвига и очереди — короткое
 *  проявление всех карточек разом. */
// Блюр и сдвиг сброшены явно: настройка читается после первого кадра, и
// карточки к этому моменту уже могли встать в скрытое состояние dissolveIn.
const fadeInReduced: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.2 } },
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

/** Стартовое окно (WelcomeOverlay): сцена свёрстана в постоянном макете
 *  FRAME_W × FRAME_H и ужимается одним масштабом, который зависит ТОЛЬКО от
 *  размера окна — не от содержимого. Прежняя подгонка по высоте содержимого
 *  пересчитывалась, когда появлялась карточка или подсказка над волной, и
 *  меню то увеличивалось, то уменьшалось (Егор: «всё в окошке статично»). */
const FRAME_W = 640;
const FRAME_H = 1040;

function useFrameFit(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0, width: FRAME_W, left: 0 });
  useEffect(() => {
    const scene = ref.current;
    const box = scene?.closest(".welcome-window__body") as HTMLElement | null;
    if (!enabled || !box) return;
    const measure = () => {
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      const wide = window.innerWidth >= 768;
      // На компьютере — постоянный макет по ширине; на телефоне сцена
      // занимает всю ширину окна, масштаб задаёт только высота.
      // На телефоне меню во весь экран, поэтому по бокам 14px воздуха —
      // иначе карточки упираются в края экрана.
      const gutter = wide ? 0 : 14;
      const scale = wide ? Math.min(1, bh / FRAME_H, bw / FRAME_W) : Math.min(1, bh / FRAME_H);
      const width = wide ? FRAME_W : (bw - gutter * 2) / scale;
      setFit({ scale, width, left: (bw - width * scale) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [enabled]);
  return [ref, fit] as const;
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
  // Safari в режиме энергосбережения не запускает видео без тапа, даже
  // беззвучное (на карточке тогда виден системный ▶). Анимированная картинка
  // такого разрешения не требует — при отказе карточка переходит на неё
  // (Егор, 2026-10-03, iPhone 14: «все видео на стопе»). Тот же кадр и тот же
  // сюжет, лежит рядом с роликом: <имя>.webp.
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || blocked) return;
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
    // React не кладёт атрибут muted в серверный HTML — он появляется только
    // после гидрации, а iOS решает про автозапуск раньше. Ставим вручную до
    // первого play().
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    const kick = () => {
      if (!el.paused || document.hidden) return;
      el.play().catch((err: unknown) => {
        if ((err as { name?: string })?.name === "NotAllowedError") setBlocked(true);
      });
    };
    const id = window.setTimeout(kick, 250);
    // Сторож: одна попытка не считается — ролик не догрузился, страницу
    // вернули из кэша; пробуем снова, пока не пойдёт.
    const watchdog = window.setInterval(kick, 400);
    // Не пошло за 1,8 с (и вкладка на виду) — это блокировка, а не загрузка.
    const giveUp = window.setTimeout(() => {
      if (el.paused && !document.hidden) setBlocked(true);
    }, 1800);
    window.addEventListener("touchend", kick, { passive: true });
    window.addEventListener("pointerup", kick, { passive: true });
    window.addEventListener("pageshow", kick);
    document.addEventListener("visibilitychange", kick);
    el.addEventListener("loadeddata", kick);
    el.addEventListener("canplay", kick);
    el.addEventListener("pause", kick);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(giveUp);
      window.clearInterval(watchdog);
      window.removeEventListener("touchend", kick);
      window.removeEventListener("pointerup", kick);
      window.removeEventListener("pageshow", kick);
      document.removeEventListener("visibilitychange", kick);
      el.removeEventListener("loadeddata", kick);
      el.removeEventListener("canplay", kick);
      el.removeEventListener("pause", kick);
    };
  }, [blocked]);

  if (blocked) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src.replace(/\.mp4$/, ".webp")} alt="" className="welcome-card-media" aria-hidden="true" />;
  }
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      autoPlay
      playsInline
      data-force-play=""
      preload="auto"
      className="welcome-card-media"
      aria-hidden="true"
    />
  );
}

/** В названиях направлений градиентом набрано одно слово, остальное белое —
 *  иначе пять цветных названий подряд перенасыщают меню (Егор). */
const LABEL_ACCENT: Record<ServiceKey, string> = {
  content: "контента",
  ai: "AI",
  sites: "Vibe",
  smm: "SMM",
};

function AccentLabel({ label, word }: { label: string; word: string }) {
  const at = label.indexOf(word);
  if (at < 0) return <>{label}</>;
  return (
    <>
      {label.slice(0, at)}
      <span className="spotlight-accent">{word}</span>
      {label.slice(at + word.length)}
    </>
  );
}

/** Пятое окошко — вход в Vibe-режим (Егор, 2026-09-27). Встаёт над четырьмя
 *  направлениями последним и заметнее их: сначала четыре окошка, потом
 *  пятое выплывает из глубины (крупнее → на место) со вспышкой света по
 *  бокам, после чего свет остаётся и тихо мигает. Раскладка та же, что у
 *  соседей: название слева, справа на месте схемы — сфера (та же сборка
 *  «implode», что в самом вайб-окне). Место под окошко есть с самого
 *  начала — колода ниже не сдвигается, когда оно появляется.
 *
 *  Свет — отдельный слой за карточкой, мигает только прозрачностью:
 *  анимированный box-shadow на стекле с блюром тормозит на телефонах (см.
 *  .deck-neon-pulse). Слой стоит снаружи карточки, потому что её
 *  overflow: hidden обрезал бы свечение по краю. */
function VibeCard({ show, instant, onOpen }: { show: boolean; instant: boolean; onOpen: () => void }) {
  const orbRef = useRef<HTMLSpanElement>(null);
  const [inner, setInner] = useState(instant);
  useEffect(() => {
    if (!show || inner) return;
    const t = window.setTimeout(() => setInner(true), 550);
    return () => window.clearTimeout(t);
  }, [show, inner]);

  const hidden = { opacity: 0, scale: 0.86, y: 10, filter: "blur(22px)" };
  return (
    <motion.div
      className="welcome-vibe-wrap"
      initial={instant ? false : hidden}
      animate={show ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" } : hidden}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: show ? undefined : "none" }}
    >
      <span className={`welcome-vibe-halo${show ? " is-on" : ""}`} aria-hidden="true" />
      <button
        type="button"
        onClick={onOpen}
        aria-label="Vibe-режим — персонализируй наш сервис для себя"
        style={
          {
            "--sp-from": ORB_FROM,
            "--sp-to": ORB_TO,
            "--card-glow-rgb": hexToRgb("#a98bff"),
          } as CSSProperties
        }
        className="welcome-card welcome-card-vibe glass-panel deck-neon-pulse"
      >
        <motion.span
          className="welcome-card-body"
          initial={false}
          animate={inner ? { opacity: 1, filter: "blur(0px)", x: 0 } : { opacity: 0, filter: "blur(12px)", x: -10 }}
          transition={{ duration: 0.8, ease: GENTLE_EASE, delay: instant ? 0 : 0.9 }}
        >
          <span className="welcome-card-title">
            <span className="spotlight-accent">Vibe</span>-режим
          </span>
          <span className="welcome-card-sub">Персонализируй наш сервис для себя</span>
        </motion.span>
        <span ref={orbRef} className="welcome-card-vibe-orb" aria-hidden="true">
          {inner && <NanoSphere size={68} from={ORB_FROM} to={ORB_TO} glow={0.35} hot intro={instant ? undefined : "implode"} />}
        </span>
      </button>
      {/* Частицы от сферы — общая механика (ui/SphereDust); холст выступает
          за окошко на 34px, разлёт растянут по ширине окошка. */}
      {/* Втрое меньше частиц и короткий разлёт — облако только вокруг сферы
          (Егор, 2026-09-27). */}
      <SphereDust run={inner} orbRef={orbRef} bleed={34} stretch={[1.7, 0.7]} density={0.33} spread={0.35} />
    </motion.div>
  );
}

export default function WelcomeWidget({
  onClose,
  onSkip,
  onVibe,
  skipGreeting = false,
  framed = false,
}: {
  /** Сцена внутри стартового окна: постоянный макет и статичный масштаб. */
  framed?: boolean;
  /** Пятое окошко: закрыть сцену и открыть Vibe-режим. */
  onVibe?: () => void;
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

  // Страховка по времени. Сигнал «последняя карточка доиграла вход» приходит
  // не всегда: колода живёт внутри <AnimatePresence initial={false}>, а этот
  // флаг велит framer-motion пропустить вход при первом монтировании —
  // анимации нет, значит и onAnimationComplete не вызывается. Логотип в этом
  // случае навсегда оставался с opacity 0 и blur(14px): место под него в
  // вёрстке есть, а знака не видно (Егор: «не вижу лого в этом месте»).
  // Поэтому тот сигнал остаётся как точный путь, а этот таймер — гарантия,
  // что знак проявится в любом случае. Значение — полная длительность входа
  // колоды: delayChildren + шаг на каждую карточку после первой + сама
  // длительность карточки.
  const deckEntranceMs = (0.05 + CARD_STAGGER * (directionCards.length - 1) + REVEAL_DURATION) * 1000;
  useEffect(() => {
    if (instant) return;
    const t = window.setTimeout(() => setLogoReady(true), deckEntranceMs);
    return () => window.clearTimeout(t);
  }, [instant, deckEntranceMs]);

  const go = useCallback(
    (href: string) => {
      onClose();
      setTimeout(() => router.push(href), EXIT_BEFORE_ROUTE_MS);
    },
    [onClose, router]
  );

  const blocks: BlockCard[] = picked ? blocksFor(picked) : [];
  const [fitRef, fitScale, fitHeight] = useFitToHeight([picked]);
  const [frameRef, frame] = useFrameFit(framed);

  return (
    <motion.div
      className={framed ? "relative h-full w-full" : "w-full"}
      initial={false}
      animate={framed ? undefined : { height: fitHeight ? fitHeight * fitScale : "auto" }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div
        ref={framed ? frameRef : fitRef}
        className={`welcome-scene flex w-full flex-col items-center text-center ${framed ? "welcome-scene--framed" : "h-fit"}`}
        style={{
          ...(framed
            ? {
                position: "absolute",
                top: 0,
                left: frame.left,
                width: frame.width,
                height: FRAME_H,
                transform: `scale(${frame.scale})`,
                transformOrigin: "top left",
                // до первого замера сцены не видно — никакого скачка масштаба
                visibility: frame.scale ? undefined : "hidden",
              }
            : fitScale < 1
              ? { transform: `scale(${fitScale})`, transformOrigin: "top center" }
              : undefined),
          // Второй шаг (выбрано направление) поднимает лого к самому верху
          // страницы — там уже не нужен запас под шапку сайта, экран занят
          // списком блоков, и Егор попросил не терять на этом высоту.
          ...(picked && !framed ? { paddingTop: "0.75rem" } : undefined),
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
          className={framed ? "welcome-logo-band flex items-center justify-center gap-2.5" : "mb-4 flex items-center gap-2.5"}
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
        {/* Тот же баг, что у колоды карточек ниже: `initial={false}`
            глушил анимацию входа заголовка именно на первом появлении
            сцены — заголовок просто возникал сразу целиком, без плавного
            проступания, вместе с резко всплывающими карточками. */}
        <AnimatePresence mode={picked ? "sync" : "wait"}>
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
                <span className="whitespace-nowrap text-[1.26rem] sm:text-[1.6rem]">
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
              <span className="whitespace-nowrap text-[1rem] sm:text-[1.26rem]">
                Привет, с чего <span className="kw">начнём?</span>
              </span>
            )}
          </motion.h2>
        </AnimatePresence>

        {/* Карточки. Колонка, одна под другой: все четыре читаются сразу и
            выбор стоит одного клика — листаемая колода добавляла бы шаг
            ровно там, где человек ещё ничего не выбрал.

            Без `initial={false}` здесь: этот флаг у AnimatePresence
            отключает вход детей именно на ПЕРВОМ монтировании — а первое
            монтирование это и есть момент, когда колода должна красиво,
            по очереди появиться. С флагом карточки прыгали в конечное
            состояние без анимации вообще: не «слишком быстро», а вообще
            без входа, отсюда и «резко, не последовательно» (см. тот же
            баг у логотипа выше, deckEntranceMs). */}
        <AnimatePresence mode="wait">
          <motion.div
            key={picked ?? "directions"}
            variants={picked || reduced ? undefined : deckVariants}
            initial={picked ? { opacity: 0 } : "hidden"}
            animate={picked ? { opacity: 1 } : "show"}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className={`welcome-deck ${picked ? "" : "welcome-deck--root"}`}
          >
            {!picked && onVibe && <VibeCard show={logoReady} instant={instant} onOpen={onVibe} />}

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
                  variants={reduced ? fadeInReduced : dissolveIn}
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
                      <AccentLabel label={card.label} word={LABEL_ACCENT[card.key]} />
                    </span>
                    <span className="welcome-card-sub">{card.tagline}</span>
                  </span>
                  <span className="welcome-card-graphic" aria-hidden="true">
                    <WelcomeDirectionGraphic serviceKey={card.key} gid={`wdg-${card.key}`} />
                  </span>
                </motion.button>
              ))}

            {picked &&
              blocks.map((block, i) => (
                <motion.button
                  key={block.id}
                  type="button"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98, filter: "blur(9px)" }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={reduced ? { duration: 0.2 } : { duration: 0.62, ease: EASE, delay: i * 0.06 }}
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
                </motion.button>
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Голосовой ассистент — сфера внизу стартового меню (Егор,
            2026-09-26): нажал и говоришь, куда пойти или что нужно. Стоит
            в потоке сцены, а не поверх неё, — подгонка сцены под высоту
            экрана учитывает её и ничего не перекрывает. */}
        <motion.div
          // Волна ниже, отдельно от колоды (Егор, 2026-09-27).
          className={framed ? "mt-auto flex justify-center" : "mt-9 flex justify-center"}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={picked || logoReady ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: GENTLE_EASE }}
        >
          <InlineVoiceSphere
            from={PAGE_GRADIENT[picked ?? "content"].from}
            to={PAGE_GRADIENT[picked ?? "content"].to}
          />
        </motion.div>

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
