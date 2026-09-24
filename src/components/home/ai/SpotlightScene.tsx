"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Инфографика внутри развёрнутой таблички (см. ToolSpotlight.tsx).
//
// Не одна схема с подсветкой, а НЕСКОЛЬКО сцен: каждый тезис справа
// приносит свою картинку, и сюжет меняется вместе с текстом — это прямая
// просьба Егора. Правило каждой сцены: одна мысль, крупная цифра и пара
// «было → стало». Посетитель понимает выгоду, даже не читая текст рядом,
// а прочитав — получает экспертное объяснение той же мысли.
//
// Сцены нарисованы в собственных координатах 340×210 и масштабируются
// целиком, поэтому держат пропорции на любом экране.
//
// Всё движение — только opacity/transform/stroke-dashoffset: это
// composited-свойства, и сцена не заставляет стадию перерисовывать видео
// под собой на каждом кадре.

export default function SpotlightScene({
  slug,
  step,
  /** Мини-превью в закрытой полосе: без смены сцен и без подписей. */
  mini = false,
  /** Сцена на карточке карусели (см. CardCtx). */
  card = false,
}: {
  slug: string;
  step: number;
  mini?: boolean;
  card?: boolean;
}) {
  const reduced = useReducedMotion();
  const scenes = SCENES[slug] ?? GENERIC;
  const Scene = scenes[step % scenes.length] ?? scenes[0];

  // Мини-превью на закрытой полосе идёт теми же сценами и с тем же
  // кросс-фейдом, что и развёрнутое окно (просьба Егора) — отличается
  // только тем, что подписи и цифры в нём не рисуются: на 64×44 они
  // превратились бы в грязь.
  return (
    <CardCtx.Provider value={card}>
    <div className={`tool-scene relative h-full w-full ${card ? "tool-scene-card" : ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Scene mini={mini} />
        </motion.div>
      </AnimatePresence>
    </div>
    </CardCtx.Provider>
  );
}

import { In, Frame, Headline, BeforeAfter, CardCtx, type SceneProps } from "@/components/home/ai/sceneKit";
import { CONTENT_SCENES } from "@/components/home/ai/SpotlightScenesContent";
import { COMMS_SCENES } from "@/components/home/ai/SpotlightScenesComms";
import { GROWTH_SCENES } from "@/components/home/ai/SpotlightScenesGrowth";
import { SITES_SCENES } from "@/components/home/ai/SpotlightScenesSites";
import { SMM_SCENES } from "@/components/home/ai/SpotlightScenesSmm";

/* ── Сцены инструмента «Единый AI-чат» ──────────────────────────────── */

/** 01 · Обучение. Ваш прайс, FAQ и старая переписка втягиваются в ядро, и
 *  наружу выходит ответ вашими же словами. */
function SceneLearn({ mini }: SceneProps) {
  const sources = ["Прайс", "FAQ", "Переписка"];
  return (
    <Frame>
      <Headline value="24 часа" note="от брифа до запуска" mini={mini} />
      {sources.map((label, i) => (
        <In key={label} at={1 + i}>
          <rect x="16" y={72 + i * 32} width="76" height="24" rx="7" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)" />
          <rect x="24" y={80 + i * 32} width="8" height="8" rx="2" fill="var(--sp-from)" fillOpacity="0.9" />
          <text x="38" y={87 + i * 32} fill="rgba(255,255,255,0.85)" fontSize="13.2" fontFamily="inherit">
            {label}
          </text>
        </In>
      ))}
      <In at={4}>
      <path d="M 96 104 C 130 104 132 116 160 116" stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" />
      <circle cx="190" cy="116" r="40" fill="url(#sp-glow)" />
      <circle cx="190" cy="116" r="24" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.5" />
      <circle cx="190" cy="116" r="31" stroke="url(#sp-ramp)" strokeOpacity="0.8" strokeWidth="1" strokeDasharray="5 9" className="sp-spin" style={{ transformOrigin: "190px 116px" }} />
      <text x="190" y="120" textAnchor="middle" fill="#fff" fontSize="15.5" letterSpacing="1.6" fontFamily="inherit">
        AI
      </text>
      </In>
      <In at={5}>
        <rect x="228" y="92" width="100" height="34" rx="10" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <path d="M 236 122 L 232 132 L 246 124 Z" fill="rgba(255,255,255,0.08)" />
        <text x="238" y="106" fill="#fff" fontSize="11" fontFamily="inherit">
          «Да, свободно
        </text>
        <text x="238" y="117" fill="#fff" fontSize="11" fontFamily="inherit">
          завтра в 12:00»
        </text>
      </In>
      <BeforeAfter before="Шаблонные фразы" after="Ваши формулировки и ваш прайс" mini={mini} />
    </Frame>
  );
}

/** 02 · Каналы. Четыре окна — один ассистент. */
function SceneChannels({ mini }: SceneProps) {
  const channels = ["Telegram", "WhatsApp", "Instagram", "Сайт"];
  return (
    <Frame>
      <Headline value="4 в 1" note="каналов в одном окне" mini={mini} />
      {channels.map((name, i) => {
        const y = 70 + i * 30;
        return (
          <In key={name} at={1 + i}>
            <rect x="14" y={y - 11} width="86" height="22" rx="11" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" />
            <circle cx="27" cy={y} r="3.4" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.24}s` }} />
            <text x="37" y={y + 3.4} fill="rgba(255,255,255,0.85)" fontSize="13.2" fontFamily="inherit">
              {name}
            </text>
            <path
              d={`M 102 ${y} C 140 ${y} 146 115 182 115`}
              stroke="var(--sp-from)"
              strokeOpacity="0.65"
              strokeWidth="1.2"
              className="sp-flow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          </In>
        );
      })}
      <In at={5}>
      <circle cx="206" cy="115" r="38" fill="url(#sp-glow)" />
      <circle cx="206" cy="115" r="22" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.5" />
      <text x="206" y="119" textAnchor="middle" fill="#fff" fontSize="14.7" letterSpacing="1.6" fontFamily="inherit">
        AI
      </text>
      </In>
      <In at={6}>
      <path d="M 228 115 L 252 115" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      <rect x="256" y="76" width="70" height="78" rx="12" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.5" />
      <text x="266" y="92" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
        ОДНО ОКНО
      </text>
      </In>
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={7 + i}>
          <rect x="266" y={100 + i * 13} width={i % 2 ? 36 : 50} height="6" rx="3" fill="rgba(255,255,255,0.28)" />
        </In>
      ))}
      <BeforeAfter before="Пять вкладок" after="Одна лента на все мессенджеры" mini={mini} />
    </Frame>
  );
}

/** 03 · Передача менеджеру. Ассистент доводит до предела и отдаёт человеку
 *  вместе с историей — клиент не повторяет вопрос. */
function SceneHandoff({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="0 повторов" note="клиент не объясняет заново" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="120" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={2 + i}>
          <rect x={i % 2 ? 46 : 24} y={78 + i * 26} width={i % 2 ? 76 : 62} height="18" rx="7" fill={i % 2 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"} />
          <rect x={i % 2 ? 54 : 32} y={85 + i * 26} width={i % 2 ? 52 : 40} height="4" rx="2" fill="rgba(255,255,255,0.35)" />
        </In>
      ))}
      <In at={5}>
      <path d="M 136 114 C 158 114 160 100 180 100" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={6}>
        <rect x="184" y="72" width="152" height="30" rx="15" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <circle cx="200" cy="87" r="8" fill="url(#sp-ramp)" fillOpacity="0.9" />
        <text x="214" y="90" fill="#fff" fontSize="12.4" fontFamily="inherit">
          Менеджер
        </text>
        <text x="278" y="90" fill="var(--sp-to)" fontSize="10.9" fontFamily="inherit">
          + история
        </text>
      </In>
      <In at={7}>
        <rect x="184" y="112" width="142" height="48" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
        <text x="196" y="130" fill="rgba(255,255,255,0.75)" fontSize="12.4" fontFamily="inherit">
          Горячий лид, вопрос
        </text>
        <text x="196" y="144" fill="#fff" fontSize="12.4" fontWeight="600" fontFamily="inherit">
          про монтаж и сроки
        </text>
      </In>
      <BeforeAfter before="«Повторите, пожалуйста»" after="Человек включается с полным контекстом" mini={mini} />
    </Frame>
  );
}

/** 04 · Доработка. Каждый месяц ассистент точнее: растущая кривая. */
function SceneGrowth({ mini }: SceneProps) {
  const bars = [34, 46, 58, 72, 86, 96];
  return (
    <Frame>
      <Headline value="80%+" note="обращений без менеджера" mini={mini} />
      {bars.map((h, i) => (
        <In key={i} at={1 + i}>
          <rect x={30 + i * 34} y={162 - h} width="18" height={h} rx="5" fill="url(#sp-ramp)" fillOpacity={0.25 + i * 0.13} />
          <text x={39 + i * 34} y="174" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10.1" fontFamily="inherit">
            {i + 1} мес
          </text>
        </In>
      ))}
      <In at={7}>
      <path
        d="M 39 128 C 90 120 140 96 243 68"
        stroke="var(--sp-from)"
        strokeWidth="1.6"
        strokeOpacity="0.9"
        className="sp-flow"
      />
      <circle cx="243" cy="68" r="4" fill="var(--sp-from)" className="sp-pulse" />
      </In>
      <In at={8}>
        <rect x="212" y="40" width="116" height="22" rx="11" fill="rgba(255,255,255,0.07)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="222" y="54.5" fill="#fff" fontSize="11" fontWeight="600" fontFamily="inherit">
          разбор диалогов
        </text>
      </In>
      <BeforeAfter before="Купили и забыли" after="Точнее каждый месяц, с отчётом" mini={mini} />
    </Frame>
  );
}

const CHAT_HUB = [SceneLearn, SceneChannels, SceneHandoff, SceneGrowth];


/* ── Сцены инструмента «AI-агент по заявкам» ────────────────────────── */

/** 01 · Каналы. Три разных окна — один и тот же ответ. */
function AgentChannels({ mini }: SceneProps) {
  const windows = ["Мессенджер", "Виджет на сайте", "Директ"];
  return (
    <Frame>
      <Headline value="78%" note="покупают у того, кто ответил первым" mini={mini} />
      {windows.map((name, i) => {
        const y = 68 + i * 40;
        return (
          <In key={name} at={1 + i}>
            <rect x="14" y={y - 14} width="132" height="30" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
            <text x="24" y={y - 2} fill="rgba(255,255,255,0.8)" fontSize="11.6" fontFamily="inherit">
              {name}
            </text>
            <rect x="24" y={y + 3} width="62" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
            <path d={`M 146 ${y} C 158 ${y} 162 108 176 108`} stroke="var(--sp-from)" strokeOpacity="0.65" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          </In>
        );
      })}
      <In at={4}>
        <circle cx="200" cy="108" r="36" fill="url(#sp-glow)" />
        <circle cx="200" cy="108" r="22" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.5" />
        <text x="200" y="112" textAnchor="middle" fill="#fff" fontSize="14.7" letterSpacing="1.6" fontFamily="inherit">
          AI
        </text>
      </In>
      <In at={5}>
        <rect x="232" y="82" width="96" height="52" rx="12" fill="rgba(255,255,255,0.07)" stroke="var(--sp-to)" strokeOpacity="0.55" />
        <text x="242" y="102" fill="#fff" fontSize="11.2" fontFamily="inherit">
          «Да, свободно.
        </text>
        <text x="242" y="114" fill="#fff" fontSize="11.2" fontFamily="inherit">
          Уточню пару
        </text>
        <text x="242" y="126" fill="#fff" fontSize="11.2" fontFamily="inherit">
          деталей»
        </text>
      </In>
      <BeforeAfter before="Где-то ответили, где-то нет" after="Один ответ в каждом окне" mini={mini} />
    </Frame>
  );
}

/** 02 · Знания. Ответ собирается из вашего прайса, а не придумывается. */
function AgentKnowledge({ mini }: SceneProps) {
  const rows = [
    ["Монтаж под ключ", "от 60 000 ₽"],
    ["Съёмочный день", "от 90 000 ₽"],
    ["Пакет Reels ×8", "от 120 000 ₽"],
  ];
  return (
    <Frame>
      <Headline value="0 выдумок" note="цены только из вашего прайса" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="150" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        <text x="26" y="78" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ВАШ ПРАЙС
        </text>
      </In>
      {rows.map(([name, price], i) => (
        <In key={name} at={2 + i}>
          <rect x="24" y={86 + i * 22} width="130" height="18" rx="6" fill={i === 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"} />
          <text x="32" y={98 + i * 22} fill="rgba(255,255,255,0.8)" fontSize="11.6" fontFamily="inherit">
            {name}
          </text>
          <text x="148" y={98 + i * 22} textAnchor="end" fill={i === 1 ? "var(--sp-from)" : "rgba(255,255,255,0.55)"} fontSize="11.6" fontFamily="inherit">
            {price}
          </text>
        </In>
      ))}
      <In at={5}>
        <path d="M 166 108 C 190 108 194 96 214 96" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="214" y="70" width="126" height="64" rx="12" fill="rgba(255,255,255,0.07)" stroke="var(--sp-to)" strokeOpacity="0.55" />
        <text x="224" y="90" fill="#fff" fontSize="11.6" fontFamily="inherit">
          «Съёмочный день
        </text>
        <text x="224" y="102" fill="#fff" fontSize="11.6" fontFamily="inherit">
          — от 90 000 ₽,
        </text>
        <text x="224" y="114" fill="#fff" fontSize="11.6" fontFamily="inherit">
          в цену входит
        </text>
        <text x="224" y="126" fill="#fff" fontSize="11.6" fontFamily="inherit">
          монтаж»
        </text>
      </In>
      <BeforeAfter before="Модель фантазирует" after="Ответ строкой из вашего прайса" mini={mini} />
    </Frame>
  );
}

/** 03 · Вопросы. Из переписки собирается заполненная заявка. */
function AgentBrief({ mini }: SceneProps) {
  const fields = [
    ["Услуга", "Промо-ролик"],
    ["Сроки", "до 20 числа"],
    ["Бюджет", "до 150 000 ₽"],
    ["Контакт", "+7 ···· 11-18"],
  ];
  return (
    <Frame>
      <Headline value="4 вопроса" note="и заявка собрана" mini={mini} />
      {[0, 1, 2].map((i) => (
        <In key={i} at={1 + i}>
          <rect x="14" y={66 + i * 30} width={i % 2 ? 96 : 116} height="22" rx="8" fill={i % 2 ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.05)"} />
          <rect x="24" y={74 + i * 30} width={i % 2 ? 72 : 92} height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
        </In>
      ))}
      <In at={4}>
        <path d="M 136 110 C 158 110 160 104 178 104" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={5}>
        <rect x="182" y="56" width="146" height="106" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.55" />
        <text x="194" y="72" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ЗАЯВКА
        </text>
      </In>
      {fields.map(([k, v], i) => (
        <In key={k} at={6 + i}>
          <text x="194" y={90 + i * 18} fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
            {k}
          </text>
          <text x="316" y={90 + i * 18} textAnchor="end" fill="#fff" fontSize="11.6" fontFamily="inherit">
            {v}
          </text>
        </In>
      ))}
      <BeforeAfter before="Простыня переписки" after="Готовая заявка с полями" mini={mini} />
    </Frame>
  );
}

/** 04 · Воронка. Заявка падает туда же, куда все остальные. */
function AgentFunnel({ mini }: SceneProps) {
  const cols = ["Новые", "В работе", "Счёт"];
  return (
    <Frame>
      <Headline value="1 воронка" note="без отдельного окна" mini={mini} />
      {cols.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x={16 + i * 106} y="60" width="96" height="102" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
          <text x={28 + i * 106} y="76" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
            {name.toUpperCase()}
          </text>
          {[0, 1].map((j) => (
            <rect key={j} x={26 + i * 106} y={84 + j * 22} width="76" height="16" rx="5" fill="rgba(255,255,255,0.07)" />
          ))}
        </In>
      ))}
      <In at={5}>
        <rect x="26" y="128" width="76" height="16" rx="5" fill="url(#sp-ramp)" fillOpacity="0.75" />
        <text x="34" y="139" fill="#06110c" fontSize="10.9" fontWeight="700" fontFamily="inherit">
          ИЗ ЧАТА
        </text>
      </In>
      <In at={6}>
        <path d="M 64 40 L 64 122" stroke="var(--sp-from)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <BeforeAfter before="Ещё одна вкладка" after="Всё в вашей системе заявок" mini={mini} />
    </Frame>
  );
}

const AGENT = [AgentChannels, AgentKnowledge, AgentBrief, AgentFunnel];


/* ── Сцены инструмента «AI-видеореклама и аватары» ──────────────────── */

/** 01 · Сценарий. Крючок → аргумент → действие: структура, без которой
 *  никакая картинка не продаёт. */
function VideoScript({ mini }: SceneProps) {
  const beats = [
    ["0:00", "Крючок", "«Вы платите за смену?»"],
    ["0:06", "Аргумент", "Показ результата"],
    ["0:14", "Действие", "«Забрать смету»"],
  ];
  return (
    <Frame>
      <Headline value="×4" note="CTR подачи от первого лица" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="312" height="8" rx="4" fill="rgba(255,255,255,0.07)" />
        <rect x="14" y="62" width="126" height="8" rx="4" fill="url(#sp-ramp)" className="sp-stack" />
      </In>
      {beats.map(([t, name, line], i) => (
        <In key={name} at={2 + i}>
          <rect x="14" y={82 + i * 34} width="312" height="28" rx="9" fill={i === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.045)"} stroke={i === 0 ? "var(--sp-from)" : "rgba(255,255,255,0.12)"} strokeOpacity={i === 0 ? 0.6 : 1} />
          <text x="26" y={100 + i * 34} fill="rgba(255,255,255,0.45)" fontSize="11.6" fontFamily="inherit">
            {t}
          </text>
          <text x="58" y={100 + i * 34} fill="#fff" fontSize="13.2" fontFamily="inherit">
            {name}
          </text>
          <text x="316" y={100 + i * 34} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="11.6" fontFamily="inherit">
            {line}
          </text>
        </In>
      ))}
      <BeforeAfter before="Красивая картинка" after="Структура, которая продаёт" mini={mini} />
    </Frame>
  );
}

/** 02 · Картинка. Правила изображения фиксируются до съёмки, поэтому все
 *  кадры — из одного фильма. */
function VideoLook({ mini }: SceneProps) {
  const rules = ["Оптика", "Свет", "Палитра", "Движение"];
  return (
    <Frame>
      <Headline value="1 стиль" note="во всех кадрах линейки" mini={mini} />
      {rules.map((r, i) => (
        <In key={r} at={1 + i}>
          <rect x="14" y={62 + i * 26} width="88" height="20" rx="10" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.4" />
          <circle cx="26" cy={72 + i * 26} r="3" fill="var(--sp-from)" />
          <text x="36" y={75 + i * 26} fill="rgba(255,255,255,0.8)" fontSize="12.4" fontFamily="inherit">
            {r}
          </text>
        </In>
      ))}
      {[0, 1, 2].map((i) => (
        <In key={i} at={5 + i}>
          <rect x={120 + i * 70} y="62" width="62" height="46" rx="8" fill="url(#sp-ramp)" fillOpacity={0.16 + i * 0.05} stroke="var(--sp-from)" strokeOpacity="0.35" />
          <circle cx={140 + i * 70} cy="84" r="7" fill="rgba(255,255,255,0.22)" />
          <rect x={128 + i * 70} y="98" width="46" height="4" rx="2" fill="rgba(255,255,255,0.28)" />
        </In>
      ))}
      <In at={8}>
        <rect x="120" y="118" width="212" height="40" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
        <text x="132" y="134" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ОДИН СВЕТ · ОДНА ПАЛИТРА
        </text>
        <text x="132" y="148" fill="#fff" fontSize="11.4" fontFamily="inherit">
          Кадры читаются как одна съёмка
        </text>
      </In>
      <BeforeAfter before="Каждая сцена из своего фильма" after="Линейка в одном стиле" mini={mini} />
    </Frame>
  );
}

/** 03 · Аватар. Ведущий собирается один раз и дальше выходит в каждом
 *  выпуске. */
function VideoAvatar({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="1 ведущий" note="во всех выпусках" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="104" height="98" rx="12" fill="rgba(255,255,255,0.05)" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <circle cx="66" cy="94" r="17" fill="url(#sp-ramp)" fillOpacity="0.8" />
        <path d="M 44 134 C 46 116 86 116 88 134 Z" fill="rgba(255,255,255,0.2)" />
        <text x="66" y="150" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          СОБРАН ОДИН РАЗ
        </text>
      </In>
      <In at={2}>
        <path d="M 120 108 L 146 108" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={3 + i}>
          <rect x={150 + (i % 2) * 92} y={64 + Math.floor(i / 2) * 50} width="82" height="42" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.13)" />
          <circle cx={166 + (i % 2) * 92} cy={80 + Math.floor(i / 2) * 50} r="7" fill="url(#sp-ramp)" fillOpacity="0.7" />
          <rect x={178 + (i % 2) * 92} y={77 + Math.floor(i / 2) * 50} width="42" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <text x={158 + (i % 2) * 92} y={99 + Math.floor(i / 2) * 50} fill="rgba(255,255,255,0.5)" fontSize="10.9" fontFamily="inherit">
            Выпуск {i + 1}
          </text>
        </In>
      ))}
      <BeforeAfter before="Новая съёмка под каждый ролик" after="Тот же ведущий, тот же голос" mini={mini} />
    </Frame>
  );
}

/** 04 · Версии. Из одного материала — сборка под каждую площадку. */
function VideoVersions({ mini }: SceneProps) {
  const cuts = [
    ["9:16", "Reels · 15 сек", 44, 74],
    ["1:1", "Лента · 30 сек", 60, 60],
    ["16:9", "YouTube · 60 сек", 86, 50],
  ];
  return (
    <Frame>
      <Headline value="−50%" note="цена клика на такой подаче" mini={mini} />
      <In at={1}>
        <rect x="14" y="70" width="74" height="60" rx="10" fill="url(#sp-ramp)" fillOpacity="0.22" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <text x="51" y="96" textAnchor="middle" fill="#fff" fontSize="12.4" fontFamily="inherit">
          Исходник
        </text>
        <text x="51" y="110" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10.9" fontFamily="inherit">
          одна съёмка
        </text>
      </In>
      {cuts.map(([ratio, label, w, h], i) => (
        <In key={ratio as string} at={2 + i}>
          <path d={`M 92 100 C 116 100 120 ${64 + i * 40} 140 ${64 + i * 40}`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="146" y={(64 + i * 40) - (h as number) / 2} width={w as number} height={h as number} rx="7" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)" />
          <text x={150 + (w as number) + 10} y={(64 + i * 40) - 2} fill="#fff" fontSize="12.4" fontFamily="inherit">
            {ratio as string}
          </text>
          <text x={150 + (w as number) + 10} y={(64 + i * 40) + 10} fill="rgba(255,255,255,0.5)" fontSize="10.9" fontFamily="inherit">
            {label as string}
          </text>
        </In>
      ))}
      <BeforeAfter before="Переэкспорт одного ролика" after="Своя сборка под каждую площадку" mini={mini} />
    </Frame>
  );
}

const VIDEO = [VideoScript, VideoLook, VideoAvatar, VideoVersions];


/* ── Сцены инструмента «AI-контент для карточек и соцсетей» ─────────── */

/** 01 · Шаблон. Карточка выходит из утверждённого макета, а не сочиняется
 *  каждый раз заново. */
function ContentTemplate({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="−70…90%" note="себестоимость против съёмки" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="96" height="96" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-from)" strokeOpacity="0.55" strokeDasharray="5 5" />
        <text x="62" y="80" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ШАБЛОН
        </text>
        <rect x="28" y="88" width="68" height="34" rx="6" fill="rgba(255,255,255,0.1)" />
        <rect x="28" y="128" width="48" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
        <rect x="28" y="138" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
      </In>
      <In at={2}>
        <path d="M 114 110 L 138 110" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={3 + i}>
          <rect x={144 + (i % 2) * 94} y={62 + Math.floor(i / 2) * 50} width="84" height="42" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
          <rect x={152 + (i % 2) * 94} y={70 + Math.floor(i / 2) * 50} width="30" height="26" rx="5" fill="url(#sp-ramp)" fillOpacity={0.3 + i * 0.1} />
          <rect x={188 + (i % 2) * 94} y={76 + Math.floor(i / 2) * 50} width="32" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x={188 + (i % 2) * 94} y={85 + Math.floor(i / 2) * 50} width="22" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
        </In>
      ))}
      <BeforeAfter before="Каждая карточка с нуля" after="Партия из одного макета" mini={mini} />
    </Frame>
  );
}

/** 02 · Правила. Один свод — иначе каталог расползается на сто стилей. */
function ContentRules({ mini }: SceneProps) {
  const rules = ["Фон", "Ракурс", "Шрифт", "Плашки"];
  return (
    <Frame>
      <Headline value="1 каталог" note="а не сто разных стилей" mini={mini} />
      {rules.map((r, i) => (
        <In key={r} at={1 + i}>
          <rect x="14" y={62 + i * 25} width="96" height="19" rx="9.5" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.4" />
          <circle cx="27" cy={71.5 + i * 25} r="2.8" fill="var(--sp-from)" />
          <text x="37" y={74.5 + i * 25} fill="rgba(255,255,255,0.8)" fontSize="12.4" fontFamily="inherit">
            {r}
          </text>
        </In>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <In key={i} at={5 + i}>
          <rect x={128 + (i % 3) * 68} y={62 + Math.floor(i / 3) * 52} width="60" height="44" rx="8" fill="url(#sp-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.3" />
          <rect x={138 + (i % 3) * 68} y={72 + Math.floor(i / 3) * 52} width="40" height="18" rx="4" fill="rgba(255,255,255,0.18)" />
          <rect x={138 + (i % 3) * 68} y={94 + Math.floor(i / 3) * 52} width="26" height="4" rx="2" fill="rgba(255,255,255,0.28)" />
        </In>
      ))}
      <BeforeAfter before="Каждый подрядчик по-своему" after="Один свод правил на весь каталог" mini={mini} />
    </Frame>
  );
}

/** 03 · Тексты. Описания собираются из вашей товарной базы. */
function ContentTexts({ mini }: SceneProps) {
  const fields = [
    ["Материал", "хлопок 100%"],
    ["Размеры", "S · M · L · XL"],
    ["Уход", "стирка 30°"],
  ];
  return (
    <Frame>
      <Headline value="×10" note="вариантов на том же бюджете" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="130" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        <text x="26" y="76" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ТОВАРНАЯ БАЗА
        </text>
      </In>
      {fields.map(([k, v], i) => (
        <In key={k} at={2 + i}>
          <text x="26" y={96 + i * 22} fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
            {k}
          </text>
          <text x="134" y={96 + i * 22} textAnchor="end" fill="#fff" fontSize="11.6" fontFamily="inherit">
            {v}
          </text>
        </In>
      ))}
      <In at={5}>
        <path d="M 150 110 L 176 110" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="182" y="60" width="144" height="100" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="194" y="78" fill="var(--sp-to)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ОПИСАНИЕ КАРТОЧКИ
        </text>
      </In>
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={6 + i}>
          <rect x="194" y={90 + i * 15} width={i % 2 ? 96 : 120} height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
        </In>
      ))}
      <BeforeAfter before="Копирайтер пишет вручную" after="Текст из ваших же характеристик" mini={mini} />
    </Frame>
  );
}

/** 04 · Отбор. Часть партии отбраковывается — это норма, а не сбой. */
function ContentPick({ mini }: SceneProps) {
  const keep = [1, 3, 4, 7];
  return (
    <Frame>
      <Headline value="3 дня" note="до первой партии карточек" mini={mini} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const on = keep.includes(i);
        return (
          <In key={i} at={1 + i}>
            <rect
              x={16 + (i % 4) * 80}
              y={62 + Math.floor(i / 4) * 54}
              width="70"
              height="46"
              rx="9"
              fill={on ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.03)"}
              stroke={on ? "var(--sp-from)" : "rgba(255,255,255,0.1)"}
              strokeOpacity={on ? 0.7 : 1}
            />
            <rect x={26 + (i % 4) * 80} y={72 + Math.floor(i / 4) * 54} width="34" height="20" rx="4" fill="url(#sp-ramp)" fillOpacity={on ? 0.4 : 0.08} />
            {on ? (
              <path d={`M ${66 + (i % 4) * 80} ${82 + Math.floor(i / 4) * 54} l 4 4 l 8 -9`} stroke="var(--sp-from)" strokeWidth="1.6" fill="none" />
            ) : (
              <path d={`M ${66 + (i % 4) * 80} ${78 + Math.floor(i / 4) * 54} l 9 9 m 0 -9 l -9 9`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" fill="none" />
            )}
          </In>
        );
      })}
      <BeforeAfter before="Правим один вариант по кругу" after="Берём лучшее из партии" mini={mini} />
    </Frame>
  );
}

const CONTENT = [ContentTemplate, ContentRules, ContentTexts, ContentPick];


/* ── Сцены инструмента «Озвучка и локализация» ──────────────────────── */

/** 01 · Расшифровка. Реплики разбираются по таймкодам, а не переносятся
 *  дословно. */
function VoiceTranscript({ mini }: SceneProps) {
  const lines = [
    ["00:02", "Что мы делаем за смену"],
    ["00:09", "Сколько это стоит"],
    ["00:17", "Как забрать смету"],
  ];
  return (
    <Frame>
      <Headline value="часы" note="вместо недель на пакет версий" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="150" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <rect key={i} x={26 + i * 11} y={78 - (i % 3) * 6} width="4" height={16 + (i % 3) * 12} rx="2" fill="url(#sp-ramp)" fillOpacity="0.45" />
        ))}
        <text x="26" y="150" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">
          ИСХОДНАЯ ДОРОЖКА
        </text>
      </In>
      {lines.map(([t, line], i) => (
        <In key={t} at={2 + i}>
          <rect x="178" y={62 + i * 32} width="148" height="26" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
          <text x="188" y={79 + i * 32} fill="var(--sp-from)" fontSize="10.9" fontFamily="inherit">
            {t}
          </text>
          <text x="218" y={79 + i * 32} fill="#fff" fontSize="11.6" fontFamily="inherit">
            {line}
          </text>
        </In>
      ))}
      <BeforeAfter before="Дословный перенос" after="Реплики по таймкодам" mini={mini} />
    </Frame>
  );
}

/** 02 · Перевод. Машинный подстрочник выдаёт себя с первой фразы. */
function VoiceTranslate({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="×10" note="разница в цене со студией" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="140" height="42" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
        <text x="26" y="82" fill="rgba(255,255,255,0.4)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ПОДСТРОЧНИК
        </text>
        <text x="26" y="98" fill="rgba(255,255,255,0.55)" fontSize="11.6" fontFamily="inherit">
          «Мы делают видео»
        </text>
      </In>
      <In at={2}>
        <rect x="14" y="116" width="140" height="42" rx="10" fill="rgba(255,255,255,0.07)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="26" y="132" fill="var(--sp-from)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ПЕРЕПИСАНО ПОД ЯЗЫК
        </text>
        <text x="26" y="148" fill="#fff" fontSize="11.6" fontFamily="inherit">
          «We ship video fast»
        </text>
      </In>
      {["EN", "DE", "ES", "AR"].map((lang, i) => (
        <In key={lang} at={3 + i}>
          <rect x={176 + (i % 2) * 76} y={66 + Math.floor(i / 2) * 50} width="66" height="40" rx="9" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.4" />
          <text x={209 + (i % 2) * 76} y={84 + Math.floor(i / 2) * 50} textAnchor="middle" fill="#fff" fontSize="15.5" fontFamily="inherit">
            {lang}
          </text>
          <rect x={190 + (i % 2) * 76} y={92 + Math.floor(i / 2) * 50} width="38" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
        </In>
      ))}
      <BeforeAfter before="Машинный подстрочник" after="Живая речь на каждом языке" mini={mini} />
    </Frame>
  );
}

/** 03 · Голос. Тембр спикера остаётся тем же во всех версиях. */
function VoiceTimbre({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="голос" note="спикера на всех языках" mini={mini} />
      <In at={1}>
        <circle cx="64" cy="106" r="30" fill="url(#sp-glow)" />
        <circle cx="64" cy="106" r="19" fill="rgba(10,13,16,0.9)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <path d="M 58 98 q 6 -6 12 0 v 12 q -6 6 -12 0 z" fill="var(--sp-from)" fillOpacity="0.75" />
        <text x="64" y="150" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ВАШ СПИКЕР
        </text>
      </In>
      {["EN", "DE", "ES"].map((lang, i) => (
        <In key={lang} at={2 + i}>
          <path d={`M 94 106 C 122 106 126 ${72 + i * 34} 148 ${72 + i * 34}`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="154" y={(72 + i * 34) - 14} width="172" height="28" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.13)" />
          <text x="166" y={(72 + i * 34) + 4} fill="var(--sp-from)" fontSize="12.4" fontFamily="inherit">
            {lang}
          </text>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
            <rect key={j} x={192 + j * 13} y={(72 + i * 34) - (2 + (j % 3) * 3)} width="3" height={5 + (j % 3) * 7} rx="1.5" fill="rgba(255,255,255,0.35)" />
          ))}
        </In>
      ))}
      <BeforeAfter before="Чужой диктор в каждой версии" after="Один и тот же тембр везде" mini={mini} />
    </Frame>
  );
}

/** 04 · Тайминг. Речь держится картинки, а не опаздывает за ней. */
function VoiceTiming({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="в кадр" note="речь держит картинку" mini={mini} />
      <In at={1}>
        <text x="16" y="66" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ВИДЕО
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={16 + i * 63} y="72" width="58" height="30" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
        ))}
      </In>
      <In at={2}>
        <text x="16" y="122" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          БЕЗ ПОДГОНКИ
        </text>
        <rect x="16" y="128" width="250" height="10" rx="5" fill="rgba(255,255,255,0.12)" />
        <path d="M 266 133 l 14 0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x="284" y="136" fill="rgba(255,255,255,0.4)" fontSize="10.9" fontFamily="inherit">
          +3 сек
        </text>
      </In>
      <In at={3}>
        <text x="16" y="156" fill="var(--sp-from)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          С ПОДГОНКОЙ
        </text>
        <rect x="16" y="162" width="309" height="10" rx="5" fill="url(#sp-ramp)" fillOpacity="0.55" />
      </In>
      {[0, 1, 2, 3, 4].map((i) => (
        <In key={i} at={4 + i}>
          <path d={`M ${45 + i * 63} 104 L ${45 + i * 63} 160`} stroke="var(--sp-to)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 4" />
        </In>
      ))}
      <BeforeAfter before="Речь уезжает от кадра" after="Реплики совпадают со сценами" mini={mini} />
    </Frame>
  );
}

const VOICE = [VoiceTranscript, VoiceTranslate, VoiceTimbre, VoiceTiming];


/* ── Сцены инструмента «AI внутри операционки» ──────────────────────── */

/** 01 · Вход. Ассистент читает то, что у вас уже есть. */
function OpsInput({ mini }: SceneProps) {
  const sources = ["Договоры", "Регламенты", "Переписка", "Таблицы"];
  return (
    <Frame>
      <Headline value="2 недели" note="до первого рабочего процесса" mini={mini} />
      {sources.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x="14" y={62 + i * 26} width="104" height="20" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
          <rect x="24" y={68 + i * 26} width="7" height="9" rx="1.5" fill="var(--sp-from)" fillOpacity="0.8" />
          <text x="37" y={75.5 + i * 26} fill="rgba(255,255,255,0.8)" fontSize="12.4" fontFamily="inherit">
            {name}
          </text>
          <path d={`M 122 ${72 + i * 26} C 146 ${72 + i * 26} 150 110 172 110`} stroke="var(--sp-to)" strokeOpacity="0.55" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.28}s` }} />
        </In>
      ))}
      <In at={5}>
        <circle cx="196" cy="110" r="34" fill="url(#sp-glow)" />
        <circle cx="196" cy="110" r="21" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <text x="196" y="114" textAnchor="middle" fill="#fff" fontSize="14.0" letterSpacing="1.4" fontFamily="inherit">
          AI
        </text>
      </In>
      <In at={6}>
        <rect x="232" y="82" width="104" height="56" rx="10" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="242" y="100" fill="#fff" fontSize="11" fontFamily="inherit">
          «Срок по
        </text>
        <text x="242" y="112" fill="#fff" fontSize="11" fontFamily="inherit">
          этому договору
        </text>
        <text x="242" y="124" fill="#fff" fontSize="11" fontFamily="inherit">
          — 14 дней»
        </text>
      </In>
      <BeforeAfter before="Заводить базу с нуля" after="Работает с тем, что уже есть" mini={mini} />
    </Frame>
  );
}

/** 02 · База. Ответ со ссылкой на документ, а не «нейросеть сказала». */
function OpsSource({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="со ссылкой" note="на конкретный документ" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="180" height="50" rx="10" fill="rgba(255,255,255,0.07)" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <text x="26" y="80" fill="#fff" fontSize="12.4" fontFamily="inherit">
          «Оплата — 50% аванс,
        </text>
        <text x="26" y="94" fill="#fff" fontSize="12.4" fontFamily="inherit">
          остаток в 5 дней»
        </text>
      </In>
      <In at={2}>
        <path d="M 104 116 L 104 134" stroke="var(--sp-to)" strokeWidth="1.2" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="14" y="138" width="180" height="26" rx="8" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.45" />
        <rect x="26" y="146" width="7" height="9" rx="1.5" fill="var(--sp-to)" />
        <text x="40" y="155" fill="var(--sp-to)" fontSize="11.6" fontFamily="inherit">
          Договор №14, пункт 4.2
        </text>
      </In>
      <In at={4}>
        <rect x="208" y="62" width="118" height="102" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="220" y="80" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ИСТОЧНИК
        </text>
      </In>
      {[0, 1, 2, 3, 4].map((i) => (
        <In key={i} at={5 + i}>
          <rect x="220" y={90 + i * 14} width={i === 2 ? 94 : 70} height="5" rx="2.5" fill={i === 2 ? "var(--sp-from)" : "rgba(255,255,255,0.22)"} fillOpacity={i === 2 ? 0.9 : 1} />
        </In>
      ))}
      <BeforeAfter before="«Нейросеть сказала»" after="Ответ с пунктом документа" mini={mini} />
    </Frame>
  );
}

/** 03 · Доступы. Каждый видит только своё. */
function OpsAccess({ mini }: SceneProps) {
  const roles = [
    ["Продюсер", "Сметы · сроки", true],
    ["Монтажёр", "Задачи · ТЗ", true],
    ["Подрядчик", "Только свой проект", false],
  ];
  return (
    <Frame>
      <Headline value="46%" note="компаний в России уже внедряют" mini={mini} />
      <In at={1}>
        <circle cx="52" cy="110" r="26" fill="url(#sp-glow)" />
        <circle cx="52" cy="110" r="17" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.3" />
        <path d="M 46 106 v -4 a 6 6 0 0 1 12 0 v 4" stroke="var(--sp-from)" strokeWidth="1.3" fill="none" />
        <rect x="45" y="106" width="14" height="11" rx="2.5" fill="var(--sp-from)" fillOpacity="0.7" />
      </In>
      {roles.map(([role, scope, full], i) => (
        <In key={role as string} at={2 + i}>
          <path d={`M 80 110 C 104 110 108 ${72 + i * 38} 130 ${72 + i * 38}`} stroke={full ? "var(--sp-to)" : "rgba(255,255,255,0.25)"} strokeOpacity="0.6" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="136" y={(72 + i * 38) - 15} width="190" height="30" rx="9" fill="rgba(255,255,255,0.05)" stroke={full ? "var(--sp-to)" : "rgba(255,255,255,0.12)"} strokeOpacity={full ? 0.45 : 1} />
          <text x="148" y={(72 + i * 38) + 3} fill="#fff" fontSize="12.4" fontFamily="inherit">
            {role as string}
          </text>
          <text x="316" y={(72 + i * 38) + 3} textAnchor="end" fill={full ? "var(--sp-from)" : "rgba(255,255,255,0.45)"} fontSize="11.6" fontFamily="inherit">
            {scope as string}
          </text>
        </In>
      ))}
      <BeforeAfter before="Одна папка на всех" after="Каждый видит только своё" mini={mini} />
    </Frame>
  );
}

/** 04 · Выход. Ответ приходит туда, где команда уже работает. */
function OpsOutput({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="70%+" note="компаний уже встроили ИИ в процесс" mini={mini} />
      <In at={1}>
        <circle cx="52" cy="108" r="30" fill="url(#sp-glow)" />
        <circle cx="52" cy="108" r="19" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <text x="52" y="112" textAnchor="middle" fill="#fff" fontSize="14.0" letterSpacing="1.4" fontFamily="inherit">
          AI
        </text>
      </In>
      {["Телеграм команды", "Таск-трекер", "Почта"].map((place, i) => (
        <In key={place} at={2 + i}>
          <path d={`M 82 108 C 106 108 110 ${70 + i * 38} 132 ${70 + i * 38}`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="138" y={(70 + i * 38) - 15} width="188" height="30" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.13)" />
          <circle cx="152" cy={70 + i * 38} r="4" fill="var(--sp-from)" />
          <text x="164" y={(70 + i * 38) + 3} fill="#fff" fontSize="12.4" fontFamily="inherit">
            {place}
          </text>
        </In>
      ))}
      <In at={5}>
        <text x="138" y="176" fill="rgba(255,255,255,0.45)" fontSize="10.9" fontFamily="inherit">
          Отдельного окна не появляется
        </text>
      </In>
      <BeforeAfter before="Ещё один сервис" after="Ответ там, где вы уже работаете" mini={mini} />
    </Frame>
  );
}

const OPS = [OpsInput, OpsSource, OpsAccess, OpsOutput];




/** Реестр сцен по инструменту. Новый инструмент — новая четвёрка здесь, и
 *  больше ничего трогать не нужно. */
const SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  "chat-hub": CHAT_HUB,
  agent: AGENT,
  video: VIDEO,
  content: CONTENT,
  voice: VOICE,
  ops: OPS,
  ...CONTENT_SCENES,
  ...COMMS_SCENES,
  ...GROWTH_SCENES,
  ...SITES_SCENES,
  ...SMM_SCENES,
};

/* ── Запасная сцена ─────────────────────────────────────────────────── */

/** Пока под инструмент не нарисованы свои сцены: цепочка «источник →
 *  ассистент → результат», где на каждом шаге горит своё звено. Нужна,
 *  чтобы табличку можно было повесить на любой блок хоть сегодня. */
function makeGenericScene(step: number) {
  function GenericScene({ mini }: SceneProps) {
    return (
      <Frame>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} style={{ opacity: i === step ? 1 : 0.3 }}>
            <rect x={18 + i * 80} y="88" width="64" height="34" rx="10" fill="rgba(255,255,255,0.05)" stroke="url(#sp-ramp)" strokeOpacity="0.6" />
            <circle cx={30 + i * 80} cy="105" r="3.4" fill="var(--sp-from)" className={i === step ? "sp-pulse" : undefined} />
            {i < 3 && <path d={`M ${82 + i * 80} 105 L ${98 + i * 80} 105`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" />}
          </g>
        ))}
        <BeforeAfter before="Вручную" after="Автоматически" mini={mini} />
      </Frame>
    );
  }
  return GenericScene;
}

const GENERIC = [0, 1, 2, 3].map(makeGenericScene);
