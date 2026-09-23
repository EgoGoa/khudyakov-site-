// Сцены форматов /smm: Reels, Сторис, Карусели, Таргет, Блогеры — по
// четыре на формат, в том же порядке, что тезисы в spotlightSmm.ts.
//
// Общие детали (появление по очереди, рамка, крупная цифра, «было → стало»)
// лежат в sceneKit.tsx — те же, что несут сцены /ai и /sites, поэтому
// окошко /smm ведёт себя одинаково с остальными тремя страницами.
//
// Правило Егора после первого прохода по /smm: сцена не должна оставлять
// пустых углов — фигуры крупнее и заполняют всю полосу y = 56…170, а не
// висят мелким пятном посреди рамки.

import { In, Frame, Headline, BeforeAfter, type SceneProps } from "@/components/home/ai/sceneKit";

/* ── Reels ───────────────────────────────────────────────────────────── */

/** 01 · Сценарий. Крючок → аргумент → действие — тот же принцип, что у
 *  видео-рекламы: без структуры даже красивая картинка не держит досмотр. */
function ReelsScript({ mini }: SceneProps) {
  const beats = [
    ["0:00", "Крючок", "«Смена без вопроса\n«сколько это стоит»?»"],
    ["0:06", "Аргумент", "Показ результата"],
    ["0:14", "Действие", "Призыв в сторис"],
  ];
  return (
    <Frame>
      <Headline value="×2" note="охват выше любого другого поста" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="8" rx="4" fill="rgba(255,255,255,0.07)" />
        <rect x="14" y="60" width="140" height="8" rx="4" fill="url(#sp-ramp)" className="sp-stack" />
      </In>
      {beats.map(([t, name, line], i) => (
        <In key={name} at={2 + i}>
          <rect x="14" y={80 + i * 32} width="312" height="26" rx="9" fill={i === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.045)"} stroke={i === 0 ? "var(--sp-from)" : "rgba(255,255,255,0.12)"} strokeOpacity={i === 0 ? 0.6 : 1} />
          <text x="26" y={97 + i * 32} fill="rgba(255,255,255,0.45)" fontSize="11.6" fontFamily="inherit">
            {t}
          </text>
          <text x="58" y={97 + i * 32} fill="#fff" fontSize="13.2" fontFamily="inherit">
            {name}
          </text>
          <text x="316" y={97 + i * 32} textAnchor="end" fill="rgba(255,255,255,0.55)" fontSize="11.6" fontFamily="inherit">
            {line as string}
          </text>
        </In>
      ))}
      <BeforeAfter before="Импровизация на камеру" after="Раскадровка под каждый ролик" mini={mini} />
    </Frame>
  );
}

/** 02 · Съёмка. Одна команда — и рекламные ролики, и Reels аккаунта. */
function ReelsCrew({ mini }: SceneProps) {
  const crew = ["Оператор", "Свет", "Монтаж"];
  return (
    <Frame>
      <Headline value="1 команда" note="снимает и рекламу, и Reels" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="118" height="106" rx="14" fill="rgba(255,255,255,0.06)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <rect x="30" y="76" width="86" height="60" rx="8" fill="rgba(255,255,255,0.08)" />
        <circle cx="73" cy="106" r="16" fill="url(#sp-glow)" />
        <path d="M 63 96 l 20 10 l -20 10 z" fill="rgba(255,255,255,0.75)" />
        <text x="73" y="150" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          РЕКЛАМНЫЙ РОЛИК
        </text>
      </In>
      {crew.map((name, i) => (
        <In key={name} at={2 + i}>
          <path d={`M 132 108 C 156 108 158 ${72 + i * 32} 182 ${72 + i * 32}`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.28}s` }} />
          <rect x="188" y={(72 + i * 32) - 13} width="138" height="26" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
          <circle cx="204" cy={72 + i * 32} r="4" fill="var(--sp-from)" />
          <text x="216" y={(72 + i * 32) + 3} fill="#fff" fontSize="12.4" fontFamily="inherit">
            {name}
          </text>
        </In>
      ))}
      <BeforeAfter before="Фрилансер на телефон" after="Продакшн уровня рекламы" mini={mini} />
    </Frame>
  );
}

/** 03 · Монтаж. Ритм удержания — кривая досматриваемости растёт к финалу. */
function ReelsRetention({ mini }: SceneProps) {
  const bars = [42, 58, 70, 88, 96];
  return (
    <Frame>
      <Headline value="30,8%" note="средний охват Reels" mini={mini} />
      {bars.map((h, i) => (
        <In key={i} at={1 + i}>
          <rect x={26 + i * 60} y={162 - h} width="42" height={h} rx="8" fill="url(#sp-ramp)" fillOpacity={0.24 + i * 0.15} />
          <text x={47 + i * 60} y="174" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10.9" fontFamily="inherit">
            сек {i * 3}
          </text>
        </In>
      ))}
      <In at={6}>
        <path d="M 47 128 C 110 108 220 84 300 66" stroke="var(--sp-from)" strokeWidth="1.6" strokeOpacity="0.9" className="sp-flow" />
        <circle cx="300" cy="66" r="5" fill="var(--sp-from)" className="sp-pulse" />
      </In>
      <BeforeAfter before="Ролик без ритма" after="Удержание растёт к финалу" mini={mini} />
    </Frame>
  );
}

/** 04 · Публикация. Время выхода подобрано под то, когда аудитория онлайн. */
function ReelsSchedule({ mini }: SceneProps) {
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const on = [1, 3, 5];
  return (
    <Frame>
      <Headline value="8–12" note="роликов в месяц в пакете" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="70" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
      </In>
      {days.map((d, i) => {
        const active = on.includes(i);
        return (
          <In key={d} at={2 + i}>
            <rect x={26 + i * 42} y={active ? 76 : 92} width="34" height={active ? 40 : 24} rx="8" fill={active ? "url(#sp-ramp)" : "rgba(255,255,255,0.08)"} fillOpacity={active ? 0.85 : 1} />
            <text x={43 + i * 42} y="142" textAnchor="middle" fill={active ? "#fff" : "rgba(255,255,255,0.4)"} fontSize="11.6" fontFamily="inherit">
              {d}
            </text>
          </In>
        );
      })}
      <In at={9}>
        <text x="14" y="158" fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
          Выход — когда аудитория аккаунта онлайн
        </text>
      </In>
      <BeforeAfter before="Публикация как получится" after="Расписание под пики активности" mini={mini} />
    </Frame>
  );
}

const REELS = [ReelsScript, ReelsCrew, ReelsRetention, ReelsSchedule];

/* ── Сторис ──────────────────────────────────────────────────────────── */

/** 01 · Съёмка. Снимается в день выхода, тем же оборудованием. */
function StoriesSameDay({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="0 ₽" note="за отдельную съёмочную группу" mini={mini} />
      <In at={1}>
        <circle cx="70" cy="108" r="46" fill="none" stroke="url(#sp-ramp)" strokeWidth="4" />
        <circle cx="70" cy="108" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeDasharray="4 10" />
        <circle cx="70" cy="108" r="30" fill="rgba(10,13,16,0.92)" />
        <text x="70" y="112" textAnchor="middle" fill="#fff" fontSize="14.0" fontFamily="inherit">
          СЕГОДНЯ
        </text>
      </In>
      <In at={2}>
        <path d="M 122 108 L 150 108" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      {["Тот же телефон", "Тот же свет", "Тот же оператор"].map((label, i) => (
        <In key={label} at={3 + i}>
          <rect x="156" y={70 + i * 30} width="170" height="24" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
          <circle cx="170" cy={82 + i * 30} r="3.4" fill="var(--sp-from)" />
          <text x="182" y={85.5 + i * 30} fill="rgba(255,255,255,0.85)" fontSize="12.4" fontFamily="inherit">
            {label}
          </text>
        </In>
      ))}
      <BeforeAfter before="Отдельный съёмочный день" after="Снято в день выхода" mini={mini} />
    </Frame>
  );
}

/** 02 · Форматы. Весь набор интерактивных стикеров платформы. */
function StoriesStickers({ mini }: SceneProps) {
  const stickers = ["Опрос", "Вопрос", "Отсчёт", "Реакция"];
  return (
    <Frame>
      <Headline value="Диалог" note="а не односторонний пост" mini={mini} />
      {stickers.map((s, i) => (
        <In key={s} at={1 + i}>
          <rect x={16 + (i % 2) * 158} y={60 + Math.floor(i / 2) * 56} width="148" height="46" rx="14" fill="rgba(255,255,255,0.06)" stroke="var(--sp-from)" strokeOpacity="0.5" />
          <circle cx={40 + (i % 2) * 158} cy={83 + Math.floor(i / 2) * 56} r="11" fill="url(#sp-glow)" />
          <circle cx={40 + (i % 2) * 158} cy={83 + Math.floor(i / 2) * 56} r="6" fill="url(#sp-ramp)" fillOpacity="0.85" />
          <text x={58 + (i % 2) * 158} y={87 + Math.floor(i / 2) * 56} fill="#fff" fontSize="14.0" fontFamily="inherit">
            {s}
          </text>
        </In>
      ))}
      <BeforeAfter before="Фото с подписью" after="Полный набор стикеров платформы" mini={mini} />
    </Frame>
  );
}

/** 03 · Периодичность. Выходят в дни без крупного релиза — ритм без пустот. */
function StoriesRhythm({ mini }: SceneProps) {
  const week = [1, 1, 0, 1, 1, 0, 1];
  return (
    <Frame>
      <Headline value="Ежедневно" note="между Reels и каруселями" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="312" height="60" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
      </In>
      {week.map((big, i) => (
        <In key={i} at={2 + i}>
          <rect x={26 + i * 42} y={big ? 76 : 92} width="34" height={big ? 38 : 22} rx="8" fill={big ? "url(#sp-ramp)" : "rgba(255,255,255,0.1)"} fillOpacity={big ? 0.4 : 1} />
          {big === 0 && <text x={43 + i * 42} y="106" textAnchor="middle" fill="var(--sp-from)" fontSize="10.9" fontFamily="inherit">Reels</text>}
        </In>
      ))}
      <In at={9}>
        <text x="14" y="146" fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
          Лента не выглядит то живой, то заброшенной
        </text>
      </In>
      <BeforeAfter before="Публикации волнами" after="Ровный ежедневный контакт" mini={mini} />
    </Frame>
  );
}

/** 04 · Архив. Актуальное закреплено в хайлайтах на первый экран. */
function StoriesHighlights({ mini }: SceneProps) {
  const items = ["Цены", "Отзывы", "Кейсы", "О нас"];
  return (
    <Frame>
      <Headline value="1 секунда" note="хайлайты видны сразу на профиле" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="46" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="88" fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
          ПРОФИЛЬ АККАУНТА
        </text>
      </In>
      {items.map((label, i) => (
        <In key={label} at={2 + i}>
          <circle cx={56 + i * 74} cy="132" r="26" fill="none" stroke="url(#sp-ramp)" strokeWidth="3" />
          <circle cx={56 + i * 74} cy="132" r="18" fill="rgba(255,255,255,0.08)" />
          <text x={56 + i * 74} y="164" textAnchor="middle" fill="#fff" fontSize="12.4" fontFamily="inherit">
            {label}
          </text>
        </In>
      ))}
      <BeforeAfter before="Истории исчезают за 24 часа" after="Главное остаётся в хайлайтах" mini={mini} />
    </Frame>
  );
}

const STORIES = [StoriesSameDay, StoriesStickers, StoriesRhythm, StoriesHighlights];

/* ── Карусели ────────────────────────────────────────────────────────── */

/** 01 · Структура. Слайды планируются заранее — до оформления. */
function CarouselStructure({ mini }: SceneProps) {
  const slides = ["Проблема", "Разбор", "Пример", "Вывод", "Призыв"];
  return (
    <Frame>
      <Headline value="0,50–0,55%" note="вовлечённость выше, чем у Reels" mini={mini} />
      {slides.map((label, i) => (
        <In key={label} at={1 + i}>
          <rect x={16 + i * 63} y="62" width="56" height="86" rx="10" fill={i === 0 ? "url(#sp-ramp)" : "rgba(255,255,255,0.05)"} fillOpacity={i === 0 ? 0.3 : 1} stroke="var(--sp-from)" strokeOpacity={i === 0 ? 0.7 : 0.3} />
          <text x={44 + i * 63} y="80" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10.9" fontFamily="inherit">
            {String(i + 1).padStart(2, "0")}
          </text>
          <text x={44 + i * 63} y="132" textAnchor="middle" fill="#fff" fontSize="11.6" fontFamily="inherit">
            {label}
          </text>
          {i < 4 && <path d={`M ${72 + i * 63} 105 L ${79 + i * 63} 105`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.3" className="sp-flow" />}
        </In>
      ))}
      <BeforeAfter before="Слайды собраны на глаз" after="Порядок продуман заранее" mini={mini} />
    </Frame>
  );
}

/** 02 · Текст. Короткие тезисы, а не абзацы, которые не читают на весу. */
function CarouselText({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="3–4×" note="дольше держит внимание, чем видео 15 сек" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="140" height="98" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="80" fill="rgba(255,255,255,0.4)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          АБЗАЦ
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="26" y={90 + i * 13} width={i % 2 ? 90 : 112} height="5" rx="2.5" fill="rgba(255,255,255,0.16)" />
        ))}
      </In>
      <In at={2}>
        <path d="M 158 110 L 182 110" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="188" y="62" width="138" height="98" rx="12" fill="rgba(255,255,255,0.07)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="200" y="80" fill="var(--sp-from)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ТЕЗИС
        </text>
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={4 + i}>
          <rect x="200" y={92 + i * 24} width="112" height="18" rx="7" fill="rgba(255,255,255,0.1)" />
          <text x="210" y={104 + i * 24} fill="#fff" fontSize="12.4" fontFamily="inherit">
            {["Коротко", "Крупно", "По делу"][i]}
          </text>
        </In>
      ))}
      <BeforeAfter before="Абзац на весу в ленте" after="Тезис, который читают долистывая" mini={mini} />
    </Frame>
  );
}

/** 03 · Дизайн. Единый стиль по слайдам — читается как один пост. */
function CarouselStyle({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="1 пост" note="а не набор случайных картинок" mini={mini} />
      {[0, 1, 2, 3, 4].map((i) => (
        <In key={i} at={1 + i}>
          <rect x={16 + i * 63} y="70" width="56" height="70" rx="10" fill="url(#sp-ramp)" fillOpacity={0.14 + i * 0.05} stroke="var(--sp-from)" strokeOpacity="0.35" />
          <rect x={26 + i * 63} y="80" width="36" height="26" rx="5" fill="rgba(255,255,255,0.18)" />
          <rect x={26 + i * 63} y="112" width="30" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x={26 + i * 63} y="120" width="20" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
        </In>
      ))}
      <In at={6}>
        <rect x="14" y="150" width="312" height="4" rx="2" fill="url(#sp-ramp)" fillOpacity="0.6" />
        <text x="14" y="166" fill="rgba(255,255,255,0.5)" fontSize="10.2" fontFamily="inherit">
          Один шрифт, одна палитра, одна сетка на всех слайдах
        </text>
      </In>
      <BeforeAfter before="Каждый слайд по-своему" after="Единый визуальный стиль" mini={mini} />
    </Frame>
  );
}

/** 04 · Обложка. Первый слайд решает, долистают ли до конца. */
function CarouselCover({ mini }: SceneProps) {
  const variants = [
    { label: "A", pct: 34 },
    { label: "B", pct: 61 },
  ];
  return (
    <Frame>
      <Headline value="4–8" note="постов в месяц в пакете" mini={mini} />
      {variants.map((v, i) => (
        <In key={v.label} at={1 + i}>
          <rect x={16 + i * 166} y="60" width="150" height="80" rx="12" fill="rgba(255,255,255,0.05)" stroke={v.pct > 50 ? "var(--sp-from)" : "rgba(255,255,255,0.16)"} strokeOpacity={v.pct > 50 ? 0.7 : 1} />
          <text x={26 + i * 166} y="82" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
            ВАРИАНТ {v.label}
          </text>
          <rect x={26 + i * 166} y="92" width="130" height="34" rx="6" fill={v.pct > 50 ? "url(#sp-ramp)" : "rgba(255,255,255,0.08)"} fillOpacity={v.pct > 50 ? 0.3 : 1} />
          <text x={26 + i * 166} y="149" fill={v.pct > 50 ? "var(--sp-from)" : "rgba(255,255,255,0.4)"} fontSize="20.2" fontWeight="700" fontFamily="inherit">
            {v.pct}%
          </text>
          <text x={64 + i * 166} y="149" fill="rgba(255,255,255,0.4)" fontSize="11.6" fontFamily="inherit">
            долистали
          </text>
        </In>
      ))}
      <BeforeAfter before="Обложка наугад" after="Заголовок протестирован" mini={mini} />
    </Frame>
  );
}

const CAROUSEL = [CarouselStructure, CarouselText, CarouselStyle, CarouselCover];

/* ── Таргет ──────────────────────────────────────────────────────────── */

/** 01 · Площадки. VK и Telegram Ads — там, где реально сидит аудитория. */
function AdsPlatforms({ mini }: SceneProps) {
  const platforms = ["VK Реклама", "Telegram Ads"];
  return (
    <Frame>
      <Headline value="93,6 млн" note="пользователей Telegram в России" mini={mini} />
      {platforms.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x="14" y={62 + i * 52} width="150" height="42" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-from)" strokeOpacity="0.5" />
          <circle cx="40" cy={83 + i * 52} r="14" fill="url(#sp-glow)" />
          <circle cx="40" cy={83 + i * 52} r="8" fill="url(#sp-ramp)" fillOpacity="0.85" />
          <text x="62" y={87 + i * 52} fill="#fff" fontSize="14.0" fontFamily="inherit">
            {name}
          </text>
          <path d={`M 164 ${83 + i * 52} C 188 ${83 + i * 52} 192 108 216 108`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}
      <In at={3}>
        <rect x="220" y="82" width="106" height="52" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="232" y="100" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          €3–10
        </text>
        <text x="232" y="114" fill="#fff" fontSize="11.6" fontFamily="inherit">
          CPM по
        </text>
        <text x="232" y="126" fill="#fff" fontSize="11.6" fontFamily="inherit">
          тематике
        </text>
      </In>
      <BeforeAfter before="Реклама везде подряд" after="Только там, где аудитория" mini={mini} />
    </Frame>
  );
}

/** 02 · Креативы. Еженедельные тесты на том же контенте, что снимает SMM. */
function AdsCreatives({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="Еженедельно" note="тесты, а не запуск и забыли" mini={mini} />
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={1 + i}>
          <rect x={16 + i * 79} y="62" width="70" height="70" rx="10" fill="url(#sp-ramp)" fillOpacity={0.14 + i * 0.08} stroke="var(--sp-from)" strokeOpacity="0.4" />
          <text x={51 + i * 79} y="82" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10.9" fontFamily="inherit">
            неделя {i + 1}
          </text>
          <rect x={26 + i * 79} y="92" width="50" height="30" rx="6" fill="rgba(255,255,255,0.14)" />
        </In>
      ))}
      <In at={5}>
        <path d="M 51 128 C 130 148 250 140 306 118" stroke="var(--sp-to)" strokeWidth="1.5" strokeOpacity="0.85" className="sp-flow" />
      </In>
      <In at={6}>
        <text x="14" y="158" fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
          Тот же контент, что снимаем для остального SMM
        </text>
      </In>
      <BeforeAfter before="Настроили и забыли" after="Тесты каждую неделю" mini={mini} />
    </Frame>
  );
}

/** 03 · Воронка. Ведём в канал, бота или Mini App — не на внешний сайт. */
function AdsFunnel({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="до 90%" note="теряется на переходе на внешний сайт" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="96" height="30" rx="9" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <text x="24" y="81" fill="#fff" fontSize="12.4" fontFamily="inherit">
          Реклама
        </text>
      </In>
      <In at={2}>
        <path d="M 62 92 L 62 118" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="3 4" />
        <path d="M 62 118 L 40 138 M 62 118 L 84 138" stroke="rgba(255,255,255,0.2)" strokeWidth="1.1" />
        <text x="14" y="152" fill="rgba(255,255,255,0.35)" fontSize="10.9" fontFamily="inherit">
          внешний сайт — уход
        </text>
      </In>
      <In at={3}>
        <path d="M 118 76 C 150 76 154 76 184 76" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={4}>
        <rect x="188" y="60" width="138" height="100" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.55" />
        <text x="200" y="78" fill="var(--sp-to)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          ВНУТРИ ПЛОЩАДКИ
        </text>
      </In>
      {["Канал", "Бот", "Mini App"].map((label, i) => (
        <In key={label} at={5 + i}>
          <rect x="200" y={86 + i * 22} width="112" height="17" rx="6" fill="url(#sp-ramp)" fillOpacity="0.28" />
          <text x="210" y={98 + i * 22} fill="#fff" fontSize="11.6" fontFamily="inherit">
            {label}
          </text>
        </In>
      ))}
      <BeforeAfter before="Уходят на переход" after="Остаются внутри площадки" mini={mini} />
    </Frame>
  );
}

/** 04 · Бюджет. Оптимизация по факту недели, а не разовая настройка. */
function AdsBudget({ mini }: SceneProps) {
  const weeks = [30, 44, 62, 82];
  return (
    <Frame>
      <Headline value="+" note="бюджет растёт туда, где результат" mini={mini} />
      {weeks.map((h, i) => (
        <In key={i} at={1 + i}>
          <rect x={26 + i * 75} y={158 - h} width="52" height={h} rx="9" fill="url(#sp-ramp)" fillOpacity={0.22 + i * 0.16} />
          <text x={52 + i * 75} y="172" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10.9" fontFamily="inherit">
            неделя {i + 1}
          </text>
        </In>
      ))}
      <In at={5}>
        <path d="M 52 128 C 130 116 240 96 300 60" stroke="var(--sp-from)" strokeWidth="1.6" strokeOpacity="0.9" className="sp-flow" />
      </In>
      <BeforeAfter before="Настроили один раз" after="Донастройка каждую неделю" mini={mini} />
    </Frame>
  );
}

const ADS = [AdsPlatforms, AdsCreatives, AdsFunnel, AdsBudget];

/* ── Блогеры ─────────────────────────────────────────────────────────── */

/** 01 · Подбор. Состав аудитории и вовлечённость, а не число подписчиков. */
function BloggersFit({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="94%" note="блогеров РФ работают с бюджетом до 100 тыс. ₽" mini={mini} />
      <In at={1}>
        <circle cx="66" cy="106" r="34" fill="url(#sp-glow)" />
        <circle cx="66" cy="106" r="22" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.5" />
        <text x="66" y="110" textAnchor="middle" fill="#fff" fontSize="14.0" fontFamily="inherit">
          БЛОГЕР
        </text>
      </In>
      <In at={2}>
        <circle cx="120" cy="106" r="34" fill="none" stroke="var(--sp-to)" strokeOpacity="0.5" strokeWidth="1.3" />
        <text x="120" y="152" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10.9" fontFamily="inherit">
          АУДИТОРИЯ
        </text>
      </In>
      <In at={3}>
        <path d="M 156 90 C 180 90 184 90 208 90" stroke="var(--sp-to)" strokeWidth="1.2" className="sp-flow" />
      </In>
      {["Совпадение интересов", "Живая вовлечённость", "Не только охват"].map((label, i) => (
        <In key={label} at={4 + i}>
          <rect x="212" y={62 + i * 30} width="114" height="24" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
          <text x="222" y={78 + i * 30} fill="#fff" fontSize="11.6" fontFamily="inherit">
            {label}
          </text>
        </In>
      ))}
      <BeforeAfter before="Смотрим на подписчиков" after="Смотрим на аудиторию" mini={mini} />
    </Frame>
  );
}

/** 02 · Бриф. Задача и ограничения фиксируются до съёмки интеграции. */
function BloggersBrief({ mini }: SceneProps) {
  const fields = [
    ["Задача", "Заявки из сторис"],
    ["Формат", "Обзор + промокод"],
    ["Ограничения", "Без сравнений с брендами"],
  ];
  return (
    <Frame>
      <Headline value="57 млрд ₽" note="рынок инфлюенс-маркетинга РФ" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="106" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="78" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          БРИФ ИНТЕГРАЦИИ
        </text>
      </In>
      {fields.map(([k, v], i) => (
        <In key={k} at={2 + i}>
          <text x="26" y={100 + i * 22} fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
            {k}
          </text>
          <text x="314" y={100 + i * 22} textAnchor="end" fill="#fff" fontSize="11.6" fontFamily="inherit">
            {v}
          </text>
        </In>
      ))}
      <BeforeAfter before="Правки после съёмки" after="Договорено до старта" mini={mini} />
    </Frame>
  );
}

/** 03 · Согласование. Сценарий утверждён до публикации — без сюрпризов. */
function BloggersApproval({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="+20%" note="рост рынка блогеров за 2025 год" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="150" height="98" rx="12" fill="rgba(255,255,255,0.05)" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <text x="26" y="80" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">
          СЦЕНАРИЙ
        </text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="26" y={92 + i * 20} width={i === 1 ? 96 : 118} height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        ))}
      </In>
      <In at={2}>
        <path d="M 168 110 L 190 110" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={3}>
        <circle cx="222" cy="110" r="28" fill="url(#sp-ramp)" fillOpacity="0.85" />
        <path d="M 210 110 l 8 8 l 18 -18" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </In>
      <In at={4}>
        <text x="258" y="98" fill="#fff" fontSize="12.4" fontFamily="inherit">
          Утверждено
        </text>
        <text x="258" y="112" fill="#fff" fontSize="12.4" fontFamily="inherit">
          до публикации
        </text>
      </In>
      <BeforeAfter before="Сюрприз в готовом ролике" after="Согласовано заранее" mini={mini} />
    </Frame>
  );
}

/** 04 · Метрики. Охват, переходы и заявки — сверяем с обещанным. */
function BloggersMetrics({ mini }: SceneProps) {
  const rows = [
    ["Охват", "обещано 40 000", "48 200"],
    ["Переходы", "обещано 800", "910"],
    ["Заявки", "обещано 25", "31"],
  ];
  return (
    <Frame>
      <Headline value="⅓" note="россиян покупали по рекомендации блогера" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="106" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
      </In>
      {rows.map(([label, promised, real], i) => (
        <In key={label} at={2 + i}>
          <text x="26" y={84 + i * 26} fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">
            {label}
          </text>
          <text x="180" y={84 + i * 26} fill="rgba(255,255,255,0.4)" fontSize="10.9" fontFamily="inherit">
            {promised}
          </text>
          <text x="314" y={84 + i * 26} textAnchor="end" fill="var(--sp-from)" fontSize="12.4" fontWeight="700" fontFamily="inherit">
            {real}
          </text>
        </In>
      ))}
      <BeforeAfter before="«Блогер обещал охваты»" after="Сверено с фактом" mini={mini} />
    </Frame>
  );
}

const BLOGGERS = [BloggersFit, BloggersBrief, BloggersApproval, BloggersMetrics];

/** Реестр сцен по формату /smm — те же ключи, что в spotlightSmm.ts
 *  (`smm-<формат>`), включается в общий SCENES в SpotlightScene.tsx. */
export const SMM_SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  "smm-reels": REELS,
  "smm-stories": STORIES,
  "smm-carousel": CAROUSEL,
  "smm-ads": ADS,
  "smm-bloggers": BLOGGERS,
};
