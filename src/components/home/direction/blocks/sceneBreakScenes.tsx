"use client";

import { In } from "@/components/home/ai/sceneKit";

// Развёрнутые сцены для блоков-перебивок (SceneBreak).
//
// Та же мысль, что у сцены окошка, но нарисована как рабочий материал
// специалиста: реальная структура, хронометраж, сравнение — и на всю левую
// половину окна. Вьюбокс 400×380 — почти квадрат, как сама колонка окна на
// десктопе, поэтому вокруг сцены не остаётся пустых полей.
//
// Элементы приходят по очереди через <In at>; дальше сцена живёт сама
// (курсор, подсветка глав, потоки), а SceneBreak пересобирает её по кругу.
//
// Тексты сверены по ширине: каждая подпись с запасом помещается в свою
// карточку (проверено замером в браузере, а не на глаз).

const W = "rgba(255,255,255,";
const CARD = { fill: `${W}0.045)`, stroke: `${W}0.14)` } as const;
// Белый с акцентом, не приглушённо-серый — правило сайта для основного
// текста (см. .kw/Accent в остальной вёрстке): даже мелкая служебная
// подпись внутри сцены обязана читаться, а не тонуть в фоне.
const LABEL = { fill: `${W}0.94)`, fontSize: 7.8, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit" } as const;

function BigFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 380" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sb-ramp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        <linearGradient id="sb-ramp-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        <linearGradient id="sb-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--sp-from)" stopOpacity="0" />
        </linearGradient>
        <pattern id="sb-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill={`${W}0.07)`} />
        </pattern>
        <radialGradient id="sb-glow">
          <stop offset="0%" stopColor="var(--sp-from)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--sp-from)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="380" fill="url(#sb-dots)" />
      {children}
    </svg>
  );
}

/* ═══ Презентационные фильмы ════════════════════════════════════════ */

/** 01 · Сценарий. Задача зрителя → сценарий из пяти глав с хронометражем →
 *  фильм на 3 минуты; внизу — удержание внимания: фильм против слайдов.
 *  Курсор бежит по хронометражу, подсветка в сценарии идёт в такт ему. */
function PresBriefBig() {
  const goals = [
    { t: "Тендер", s: "убедить комиссию" },
    { t: "Инвестор", s: "показать масштаб" },
    { t: "Выставка", s: "остановить взгляд" },
  ];
  // Длительность глав в секундах — в сумме 180, ровно 3:00. Эти же доли
  // зашиты в кейфреймы подсветки .sb-rows (globals.css).
  const chapters = [
    { n: "01", t: "Крючок", at: "0:00", d: 15 },
    { n: "02", t: "Задача зрителя", at: "0:15", d: 30 },
    { n: "03", t: "Ваш процесс", at: "0:45", d: 50 },
    { n: "04", t: "Масштаб и люди", at: "1:35", d: 60 },
    { n: "05", t: "Итог и контакт", at: "2:35", d: 25 },
  ];
  const X0 = 12;
  const SPAN = 376;
  const starts = chapters.map((_, i) => chapters.slice(0, i).reduce((s, c) => s + c.d, 0));

  return (
    <BigFrame>
      {/* ── Задача ───────────────────────────────────────────── */}
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ЗАДАЧА ФИЛЬМА</text>
      </In>
      {goals.map((g, i) => (
        <In key={g.t} at={0.6 + i * 0.5}>
          <rect x="12" y={28 + i * 40} width="112" height="32" rx="10" {...CARD} stroke={i === 0 ? "var(--sp-from)" : CARD.stroke} strokeOpacity={i === 0 ? 0.7 : 1} />
          <circle cx="24" cy={44 + i * 40} r="3.4" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
          <text x="33" y={41.5 + i * 40} fill="#fff" fontSize="10" fontWeight="700" fontFamily="inherit">{g.t}</text>
          <text x="33" y={53 + i * 40} fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">{g.s}</text>
          <path d={`M 126 ${44 + i * 40} C 136 ${44 + i * 40} 136 104 146 104`} stroke="var(--sp-from)" strokeOpacity="0.6" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}

      <In at={2.4}>
        <rect x="12" y="152" width="112" height="62" rx="10" fill="url(#sb-ramp)" fillOpacity="0.1" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="21" y="166" {...LABEL}>ЗАПОМНИТ</text>
        {["кто вы", "что умеете", "почему вы"].map((t, i) => (
          <g key={t}>
            <path d={`M 21 ${176 + i * 12.5} l 3 3 l 5 -6`} stroke="var(--sp-to)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <text x="33" y={180 + i * 12.5} fill="#fff" fontSize="8.4" fontFamily="inherit">{t}</text>
          </g>
        ))}
      </In>

      {/* ── Сценарий ─────────────────────────────────────────── */}
      <In at={2}>
        <rect x="146" y="12" width="138" height="202" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.45" />
        <text x="156" y="28" {...LABEL}>СЦЕНАРИЙ</text>
        <text x="274" y="29.5" textAnchor="end" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="13">3:00</text>
        <path d="M 156 36 L 274 36" stroke={`${W}0.12)`} />
        {/* Подсветка текущей главы — едет вниз в такт курсору. */}
        <g className="sb-rows">
          <rect x="151" y="41" width="128" height="26" rx="7" fill="url(#sb-ramp-x)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.55" />
        </g>
      </In>
      {chapters.map((c, i) => (
        <In key={c.n} at={2.6 + i * 0.45}>
          <text x="157" y={53 + i * 34} fill="var(--sp-from)" fontSize="7.4" fontWeight="700" fontFamily="inherit">{c.n}</text>
          <text x="170" y={53 + i * 34} fill="#fff" fontSize="8.4" fontFamily="inherit">{c.t}</text>
          <text x="274" y={53 + i * 34} textAnchor="end" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">{c.at}</text>
          <rect x="170" y={58.5 + i * 34} width="104" height="3.2" rx="1.6" fill={`${W}0.08)`} />
          <rect x="170" y={58.5 + i * 34} width={(c.d / 60) * 104} height="3.2" rx="1.6" fill="url(#sb-ramp-x)" fillOpacity={0.55 + i * 0.09} />
        </In>
      ))}

      {/* ── Фильм и выигрыш по времени ───────────────────────── */}
      <In at={5}>
        <path d="M 285 59 L 293 59" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="294" y="12" width="94" height="94" rx="12" {...CARD} />
        <text x="303" y="28" {...LABEL}>ФИЛЬМ</text>
        <circle cx="378" cy="22" r="2.6" fill="var(--sp-to)" className="sp-blink" />
        <circle cx="341" cy="56.5" r="20" fill="url(#sb-glow)" className="sp-pulse" />
        <rect x="303" y="35" width="76" height="43" rx="6" fill="url(#sb-ramp)" fillOpacity="0.2" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <circle cx="341" cy="56.5" r="10" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.3" />
        <path d="M 338 51.5 L 346.5 56.5 L 338 61.5 Z" fill="#fff" />
        <circle cx="341" cy="56.5" r="15" stroke="var(--sp-from)" strokeOpacity="0.45" strokeDasharray="3 6" className="sp-spin" style={{ transformOrigin: "341px 56.5px" }} />
        <text x="303" y="95" fill="#fff" fontSize="7.8" fontWeight="700" fontFamily="inherit">мастер + срезы</text>
      </In>
      <In at={5.6}>
        <rect x="294" y="116" width="94" height="98" rx="12" {...CARD} />
        <text x="303" y="132" {...LABEL}>НА ВСТРЕЧЕ</text>
        <text x="303" y="148" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">без фильма</text>
        <text x="379" y="148" textAnchor="end" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">30 мин</text>
        <rect x="303" y="153" width="76" height="6" rx="3" fill={`${W}0.22)`} />
        <text x="303" y="172" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">с фильмом</text>
        <text x="379" y="172" textAnchor="end" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">3 мин</text>
        <rect x="303" y="177" width="8" height="6" rx="3" fill="url(#sb-ramp-x)" />
        <text x="303" y="204" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="17">×10</text>
        <text x="345" y="204" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">быстрее</text>
      </In>

      {/* ── Удержание внимания ───────────────────────────────── */}
      <In at={6.2}>
        <text x="12" y="246" {...LABEL}>УДЕРЖАНИЕ ВНИМАНИЯ</text>
        <path d="M 262 243 L 276 243" stroke="url(#sb-ramp-x)" strokeWidth="2" />
        <text x="280" y="246" fill="#fff" fontSize="7.2" fontFamily="inherit">фильм</text>
        <path d="M 322 243 L 336 243" stroke={`${W}0.5)`} strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="340" y="246" fill={`${W}0.88)`} fontSize="7.2" fontFamily="inherit">слайды</text>
        {starts.slice(1).map((s) => (
          <path key={s} d={`M ${X0 + (s / 180) * SPAN} 258 L ${X0 + (s / 180) * SPAN} 340`} stroke={`${W}0.08)`} strokeDasharray="2 3" />
        ))}
        <path d="M 12 272 C 60 280 110 310 170 322 S 320 334 388 338" stroke={`${W}0.45)`} strokeWidth="1.3" strokeDasharray="3 3" />
        <path d="M 12 272 C 80 264 140 278 200 269 S 320 275 388 266 L 388 340 L 12 340 Z" fill="url(#sb-area)" />
        <path d="M 12 272 C 80 264 140 278 200 269 S 320 275 388 266" stroke="url(#sb-ramp-x)" strokeWidth="2.2" pathLength="1" className="sp-draw" />
      </In>
      <In at={7.2}>
        <text x="386" y="259" textAnchor="end" fill="#fff" fontSize="7.2" fontWeight="700" fontFamily="inherit">держит до конца</text>
        <text x="236" y="316" textAnchor="middle" fill={`${W}0.88)`} fontSize="7.2" fontFamily="inherit">внимание уходит</text>
      </In>
      <In at={6.8}>
        {chapters.map((c, i) => (
          <rect key={c.n} x={X0 + (starts[i] / 180) * SPAN} y="348" width={(c.d / 180) * SPAN - 2} height="4" rx="2" fill="url(#sb-ramp-x)" fillOpacity={0.35 + (i % 2) * 0.35} />
        ))}
        {["0:00", "1:00", "2:00", "3:00"].map((t, i) => (
          <text key={t} x={X0 + (i * SPAN) / 3} y="368" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">{t}</text>
        ))}
        <g className="sp-scan">
          <path d="M 12 256 L 12 355" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
          <circle cx="12" cy="256" r="2.4" fill="#fff" />
        </g>
      </In>
    </BigFrame>
  );
}

/** Сдвиг анимации-подсветки строк (sb-steps3/5) — шаг строки во вьюбоксе. */
const step = (px: number) => ({ "--step": `${px}px` }) as React.CSSProperties;
const scan = (px: number) => ({ "--scan": `${px}px` }) as React.CSSProperties;

/** 02 · Масштаб. Цех заказчика в разрезе: камера и дрон снимают то, что
 *  видно, графика показывает то, что внутри печи. Справа — план смены,
 *  внизу — смена по часам, пока линия заказчика работает не останавливаясь. */
function PresScaleBig() {
  const shots = [
    { t: "Общий план", s: "дрон над цехом" },
    { t: "Процессы", s: "у станков" },
    { t: "Люди", s: "интервью" },
    { t: "Детали", s: "макро" },
    { t: "Графика", s: "разрез печи" },
  ];
  // Смена 08:00–20:00: 376 единиц на 12 часов.
  const H = 376 / 12;
  const blocks = [
    { t: "Общий план", from: 8, to: 10 },
    { t: "Процессы", from: 10, to: 13 },
    { t: "Интервью", from: 13, to: 15.5 },
    { t: "Детали", from: 15.5, to: 18 },
    { t: "Дрон", from: 18, to: 20 },
  ];

  return (
    <BigFrame>
      {/* ── Площадка ─────────────────────────────────────────── */}
      <In at={0}>
        <rect x="12" y="12" width="262" height="204" rx="12" {...CARD} />
        <text x="22" y="28" {...LABEL}>ПЛОЩАДКА ЗАКАЗЧИКА</text>
        <path d="M 22 180 L 264 180" stroke={`${W}0.25)`} />
        <rect x="22" y="182" width="242" height="6" rx="3" fill={`${W}0.06)`} stroke={`${W}0.14)`} />
      </In>
      <In at={0.8}>
        <rect x="32" y="122" width="42" height="58" rx="4" fill={`${W}0.08)`} stroke={`${W}0.18)`} />
        <rect x="40" y="132" width="26" height="12" rx="2" fill="var(--sp-from)" fillOpacity="0.25" />
        <rect x="186" y="138" width="38" height="42" rx="4" fill={`${W}0.08)`} stroke={`${W}0.18)`} />
        <rect x="236" y="102" width="24" height="78" rx="6" fill={`${W}0.08)`} stroke={`${W}0.18)`} />
        <path d="M 248 102 L 248 84" stroke={`${W}0.25)`} strokeWidth="3" />
      </In>
      {/* Печь в разрезе — то, что камера не снимет. */}
      <In at={1.6}>
        <circle cx="130" cy="136" r="34" fill="url(#sb-glow)" className="sp-pulse" />
        <rect x="90" y="92" width="80" height="88" rx="6" fill="url(#sb-ramp)" fillOpacity="0.12" stroke="var(--sp-to)" strokeDasharray="4 3" className="sp-pulse" />
        <text x="130" y="104" textAnchor="middle" fill="#fff" fontSize="7" letterSpacing="1" fontWeight="700" fontFamily="inherit">ГРАФИКА</text>
        <circle cx="163" cy="99" r="2.4" fill="var(--sp-to)" className="sp-blink" />
        <path d="M 102 170 L 102 118 C 102 112 112 112 112 118 L 112 160 C 112 166 122 166 122 160 L 122 118 C 122 112 132 112 132 118 L 132 160 C 132 166 142 166 142 160 L 142 118 C 142 112 152 112 152 118 L 152 170" stroke="var(--sp-to)" strokeWidth="1.6" className="sp-flow" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={107 + i * 20} cy={140 + (i % 2) * 12} r="3" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </In>
      {/* Камера и дрон с конусами обзора. */}
      <In at={2.4}>
        <path d="M 46 56 L 94 120 L 30 120 Z" fill="url(#sb-ramp)" fillOpacity="0.1" className="sp-pulse" />
        <rect x="36" y="46" width="16" height="10" rx="2" fill={`${W}0.2)`} stroke="var(--sp-from)" />
        <path d="M 52 48 L 58 45 L 58 57 L 52 54 Z" fill="var(--sp-from)" />
        <text x="62" y="54" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">камера</text>
        <circle cx="43" cy="48" r="2" fill="var(--sp-from)" className="sp-blink" />
      </In>
      <In at={2.9}>
        <path d="M 206 52 L 262 136 L 176 136 Z" fill="url(#sb-ramp)" fillOpacity="0.1" className="sp-pulse" style={{ animationDelay: "0.6s" }} />
        <rect x="200" y="44" width="12" height="6" rx="2" fill={`${W}0.3)`} stroke="var(--sp-to)" />
        {[-1, 1].map((d) => (
          <g key={d}>
            <path d={`M ${206 + d * 6} 46 L ${206 + d * 12} 42`} stroke="var(--sp-to)" />
            <ellipse cx={206 + d * 13} cy="41" rx="5" ry="1.4" fill="var(--sp-to)" fillOpacity="0.6" className="sp-pulse" />
          </g>
        ))}
        <text x="222" y="50" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">дрон</text>
      </In>
      {/* Конвейер едет всё время — производство не останавливается. */}
      <In at={3.4}>
        <g className="sp-scan" style={{ ...scan(44), animationDuration: "2.4s" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-18 + i * 44} y="174" width="10" height="6" rx="1.5" fill="var(--sp-from)" fillOpacity="0.8" />
          ))}
        </g>
        <rect x="12" y="170" width="10" height="20" fill="rgba(12,13,18,1)" />
        <rect x="264" y="170" width="10" height="20" fill="rgba(12,13,18,1)" />
        <text x="143" y="204" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="inherit">производство не останавливаем</text>
      </In>

      {/* ── План смены ───────────────────────────────────────── */}
      <In at={3}>
        <rect x="284" y="12" width="104" height="204" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.45" />
        <text x="293" y="28" {...LABEL}>ПЛАН СМЕНЫ</text>
        <circle cx="373" cy="24" r="2.4" fill="var(--sp-from)" className="sp-blink" />
        <path d="M 293 36 L 379 36" stroke={`${W}0.12)`} />
        <g className="sb-steps5" style={step(34)}>
          <rect x="289" y="41" width="94" height="30" rx="7" fill="url(#sb-ramp-x)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.55" />
        </g>
      </In>
      {shots.map((s, i) => (
        <In key={s.t} at={3.4 + i * 0.4}>
          <circle cx="297" cy={53 + i * 34} r="3" fill={i === 4 ? "var(--sp-to)" : "var(--sp-from)"} />
          <text x="305" y={55 + i * 34} fill="#fff" fontSize="8" fontWeight="700" fontFamily="inherit">{s.t}</text>
          <text x="305" y={65 + i * 34} fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">{s.s}</text>
        </In>
      ))}

      {/* ── Смена по часам ───────────────────────────────────── */}
      <In at={5.4}>
        <text x="12" y="244" {...LABEL}>СЪЁМОЧНАЯ СМЕНА</text>
        {blocks.map((b, i) => (
          <g key={b.t}>
            <rect x={12 + (b.from - 8) * H} y="254" width={(b.to - b.from) * H - 2} height="22" rx="5" fill="url(#sb-ramp-x)" fillOpacity={0.18 + (i % 2) * 0.16} stroke="var(--sp-from)" strokeOpacity="0.4" />
            <text x={12 + ((b.from + b.to) / 2 - 8) * H - 1} y="268" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">{b.t}</text>
          </g>
        ))}
      </In>
      <In at={6}>
        <text x="12" y="292" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">линия заказчика</text>
        <text x="374" y="292" textAnchor="end" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">работает всю смену</text>
        <circle cx="384" cy="289" r="2.4" fill="var(--sp-to)" className="sp-blink" />
        <path d="M 12 300 L 388 300" stroke="var(--sp-to)" strokeWidth="2.2" className="sp-flow" />
        {["08:00", "11:00", "14:00", "17:00", "20:00"].map((t, i) => (
          <text key={t} x={12 + i * 3 * H} y="316" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">{t}</text>
        ))}
        <g className="sp-scan">
          <path d="M 12 250 L 12 304" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
          <circle cx="12" cy="250" r="2.4" fill="#fff" />
        </g>
      </In>
      <In at={6.6}>
        <circle cx="16" cy="340" r="3.4" fill="var(--sp-from)" />
        <text x="26" y="342.5" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">В кадре:</text>
        <text x="72" y="342.5" fill="#fff" fontSize="7.4" fontFamily="inherit">цех, люди, масштаб площадки</text>
        <circle cx="16" cy="358" r="3.4" fill="none" stroke="var(--sp-to)" strokeDasharray="2 1.5" />
        <text x="26" y="360.5" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">Дорисуем:</text>
        <text x="72" y="360.5" fill="#fff" fontSize="7.4" fontFamily="inherit">процесс внутри печи, схемы, микромир</text>
      </In>
    </BigFrame>
  );
}

/** 03 · Версии. Одна съёмка → мастер-монтаж → три экрана (монитор,
 *  вертикаль, стенд без звука) → матрица, где какая версия работает. */
function PresVersionsBig() {
  const cols = ["Сайт", "Встреча", "Соцсети", "Стенд", "Тендер"];
  const rows = [
    { t: "Мастер · 3:00", on: [1, 1, 0, 0, 1] },
    { t: "Срез · 0:45", on: [1, 0, 1, 0, 0] },
    { t: "Loop без звука", on: [0, 1, 0, 1, 0] },
  ];
  const cut = [1, 4, 7, 10];
  const loop = [3, 4, 5, 6];

  return (
    <BigFrame>
      {/* ── Исходник ─────────────────────────────────────────── */}
      <In at={0}>
        <rect x="12" y="12" width="88" height="108" rx="12" {...CARD} />
        <text x="21" y="28" {...LABEL}>ИСХОДНИК</text>
        {[2, 1, 0].map((i) => (
          <rect key={i} x={24 + i * 6} y={40 + i * 6} width="50" height="34" rx="4" fill={`${W}${0.05 + (2 - i) * 0.04})`} stroke={i === 0 ? "var(--sp-from)" : `${W}0.18)`} />
        ))}
        <circle cx="49" cy="57" r="12" fill="url(#sb-glow)" className="sp-pulse" />
        <path d="M 44 52 L 54 57 L 44 62 Z" fill="#fff" />
        <text x="21" y="100" fill="#fff" fontSize="9" fontWeight="700" fontFamily="inherit">1 съёмка</text>
        <text x="21" y="111" fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">2–3 смены</text>
      </In>
      <In at={0.6}>
        <path d="M 100 64 L 110 64" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>

      {/* ── Мастер-монтаж ────────────────────────────────────── */}
      <In at={1}>
        <rect x="110" y="12" width="278" height="108" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.45" />
        <text x="120" y="28" {...LABEL}>МАСТЕР-МОНТАЖ</text>
        <text x="378" y="29.5" textAnchor="end" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="13">3:00</text>
      </In>
      {Array.from({ length: 12 }).map((_, i) => (
        <In key={i} at={1.3 + i * 0.12}>
          <rect x={120 + i * 21.5} y="40" width="19.5" height="28" rx="3" fill={`${W}${0.06 + (i % 3) * 0.03})`} stroke={`${W}0.16)`} />
          <path d={`M ${122 + i * 21.5} ${58 - (i % 3) * 3} L ${137.5 + i * 21.5} ${56 - (i % 2) * 4}`} stroke={`${W}0.25)`} />
        </In>
      ))}
      <In at={3}>
        {cut.map((i) => (
          <rect key={`c${i}`} x={120 + i * 21.5} y="74" width="19.5" height="4" rx="2" fill="var(--sp-from)" />
        ))}
        <rect x={120 + loop[0] * 21.5} y="82" width={loop.length * 21.5 - 2} height="4" rx="2" fill="var(--sp-to)" />
        <rect x="120" y="100" width="10" height="4" rx="2" fill="var(--sp-from)" />
        <text x="134" y="104.5" fill="#fff" fontSize="7" fontFamily="inherit">срез 0:45</text>
        <rect x="196" y="100" width="10" height="4" rx="2" fill="var(--sp-to)" />
        <text x="210" y="104.5" fill="#fff" fontSize="7" fontFamily="inherit">loop без звука</text>
        <g className="sp-scan" style={scan(256)}>
          <path d="M 120 36 L 120 90" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
          <circle cx="120" cy="36" r="2.2" fill="#fff" />
        </g>
      </In>

      {/* ── Три экрана ───────────────────────────────────────── */}
      <In at={3.6}>
        <path d="M 180 120 C 180 130 76 126 76 136" stroke="var(--sp-from)" strokeOpacity="0.6" strokeWidth="1.1" className="sp-flow" />
        <rect x="12" y="136" width="128" height="72" rx="6" fill="url(#sb-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <circle cx="76" cy="172" r="19" fill="url(#sb-glow)" className="sp-pulse" />
        <circle cx="76" cy="172" r="11" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.3" />
        <path d="M 72.5 166.5 L 82 172 L 72.5 177.5 Z" fill="#fff" />
        <text x="19" y="148" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">3:00</text>
        <path d="M 66 208 L 62 216 L 90 216 L 86 208" stroke={`${W}0.25)`} />
        <text x="12" y="230" {...LABEL}>МАСТЕР</text>
        <text x="12" y="242" fill="#fff" fontSize="7" fontFamily="inherit">сайт · встреча · тендер</text>
      </In>
      <In at={4.2}>
        <path d="M 240 120 C 240 128 195 124 195 132" stroke="var(--sp-from)" strokeOpacity="0.6" strokeWidth="1.1" className="sp-flow" />
        <rect x="172" y="132" width="46" height="82" rx="8" fill="url(#sb-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <rect x="188" y="136" width="14" height="3" rx="1.5" fill={`${W}0.3)`} />
        <text x="195" y="152" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">0:45</text>
        <rect x="180" y="190" width="30" height="3" rx="1.5" fill={`${W}0.6)`} />
        <rect x="184" y="196" width="22" height="3" rx="1.5" fill={`${W}0.4)`} />
        <circle cx="195" cy="170" r="7" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.2" />
        <path d="M 193 166.5 L 199 170 L 193 173.5 Z" fill="#fff" />
        <text x="195" y="230" textAnchor="middle" {...LABEL}>СРЕЗ</text>
        <text x="195" y="242" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="inherit">соцсети · рассылка</text>
      </In>
      <In at={4.8}>
        <path d="M 310 120 C 310 128 324 128 324 136" stroke="var(--sp-to)" strokeOpacity="0.7" strokeWidth="1.1" className="sp-flow" />
        <rect x="260" y="136" width="128" height="72" rx="6" fill="url(#sb-ramp)" fillOpacity="0.16" stroke="var(--sp-to)" strokeOpacity="0.7" />
        <rect x="286" y="192" width="76" height="4" rx="2" fill={`${W}0.6)`} />
        <rect x="298" y="199" width="52" height="4" rx="2" fill={`${W}0.4)`} />
        <g className="sp-pulse">
          <path d="M 364 146 L 368 146 L 373 142 L 373 156 L 368 152 L 364 152 Z" fill="#fff" />
          <path d="M 376 146 L 382 152 M 382 146 L 376 152" stroke="var(--sp-to)" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <circle cx="300" cy="146" r="2.6" fill="var(--sp-to)" className="sp-blink" />
        <text x="324" y="176" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="inherit">LOOP</text>
        <path d="M 320 208 L 316 216 L 332 216 L 328 208" stroke={`${W}0.25)`} />
        <text x="260" y="230" {...LABEL}>СТЕНД</text>
        <text x="260" y="242" fill="#fff" fontSize="7" fontFamily="inherit">выставка · без звука</text>
      </In>

      {/* ── Где работает ─────────────────────────────────────── */}
      <In at={5.4}>
        <text x="12" y="268" {...LABEL}>ГДЕ РАБОТАЕТ</text>
        {cols.map((c, j) => (
          <text key={c} x={176 + j * 46} y="268" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">{c}</text>
        ))}
        <path d="M 12 276 L 388 276" stroke={`${W}0.12)`} />
        <g className="sb-steps3" style={step(28)}>
          <rect x="8" y="280" width="384" height="24" rx="8" fill="url(#sb-ramp-x)" fillOpacity="0.12" stroke="var(--sp-from)" strokeOpacity="0.45" />
        </g>
      </In>
      {rows.map((r, i) => (
        <In key={r.t} at={5.8 + i * 0.5}>
          <text x="16" y={295 + i * 28} fill="#fff" fontSize="8" fontWeight="700" fontFamily="inherit">{r.t}</text>
          {r.on.map((on, j) =>
            on ? (
              <circle key={j} cx={176 + j * 46} cy={292 + i * 28} r="5" fill="url(#sb-ramp)" className="sp-pulse" style={{ animationDelay: `${(i + j) * 0.25}s` }} />
            ) : (
              <circle key={j} cx={176 + j * 46} cy={292 + i * 28} r="4.5" stroke={`${W}0.2)`} />
            ),
          )}
        </In>
      ))}
      <In at={7.4}>
        <text x="12" y="372" fill="#fff" fontSize="7.4" fontFamily="inherit">Все версии — из одной съёмки, без пересъёмок и доплат за смену.</text>
      </In>
    </BigFrame>
  );
}

/** 04 · Доверие. Путь до встречи: ссылка → просмотр → пересылка → встреча;
 *  кто у клиента посмотрел, с чем приходят на встречу и сколько её времени
 *  уходит на задачу клиента, а не на рассказ о себе. */
function PresTrustBig() {
  const path = [
    { t: "ссылка", d: "день 1" },
    { t: "просмотр", d: "день 1" },
    { t: "пересылка", d: "день 2" },
    { t: "встреча", d: "день 3" },
  ];
  const viewers = ["Директор", "Закупки", "Техотдел"];
  const known = ["кто вы", "что умеете", "ваш масштаб"];
  // Шкала первой встречи: 0–30 минут на 290 единиц.
  const M = 290 / 30;

  return (
    <BigFrame>
      {/* ── Путь до встречи ──────────────────────────────────── */}
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ПУТЬ ДО ВСТРЕЧИ</text>
        <path d="M 30 36 L 370 36" stroke={`${W}0.18)`} strokeWidth="1.2" />
        <path d="M 30 36 L 370 36" stroke="url(#sb-ramp-x)" strokeWidth="1.6" pathLength="1" className="sp-draw" />
      </In>
      {path.map((p, i) => (
        <In key={p.t} at={0.5 + i * 0.4}>
          <circle cx={30 + i * 113.3} cy="36" r="5" fill={i === 3 ? "var(--sp-to)" : "var(--sp-from)"} />
          <text x={30 + i * 113.3} y="52" textAnchor="middle" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">{p.t}</text>
          <text x={30 + i * 113.3} y="62" textAnchor="middle" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">{p.d}</text>
        </In>
      ))}
      <In at={2.2}>
        <g className="sp-scan" style={scan(340)}>
          <circle cx="30" cy="36" r="7" fill="url(#sb-ramp)" fillOpacity="0.35" />
          <circle cx="30" cy="36" r="3" fill="#fff" />
        </g>
      </In>

      {/* ── Сообщение со ссылкой ─────────────────────────────── */}
      <In at={2}>
        <rect x="12" y="78" width="128" height="158" rx="12" {...CARD} />
        <text x="21" y="94" {...LABEL}>СООБЩЕНИЕ</text>
        <rect x="21" y="102" width="110" height="100" rx="10" fill={`${W}0.06)`} />
        <text x="29" y="117" fill="#fff" fontSize="7.2" fontFamily="inherit">Добрый день! О нас —</text>
        <text x="29" y="127" fill="#fff" fontSize="7.2" fontFamily="inherit">за три минуты:</text>
        <rect x="29" y="134" width="94" height="40" rx="6" fill="url(#sb-ramp)" fillOpacity="0.2" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <circle cx="46" cy="154" r="14" fill="url(#sb-glow)" className="sp-pulse" />
        <circle cx="46" cy="154" r="8" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.2" />
        <path d="M 43.5 150 L 50 154 L 43.5 158 Z" fill="#fff" />
        <text x="60" y="152" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">О компании</text>
        <text x="60" y="163" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">фильм · 3:00</text>
        <text x="123" y="194" textAnchor="end" fill="var(--sp-to)" fontSize="6.8" fontWeight="700" fontFamily="inherit" className="sp-blink">✓✓ прочитано</text>
        <text x="21" y="226" fill="#fff" fontSize="7" fontFamily="inherit">вместо сорока слайдов</text>
      </In>

      {/* ── Кто посмотрел ────────────────────────────────────── */}
      <In at={3}>
        <path d="M 140 157 L 150 157" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="150" y="78" width="112" height="158" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.45" />
        <text x="159" y="94" {...LABEL}>ПЕРЕСЛАЛИ ВНУТРИ</text>
        <g className="sb-steps3" style={step(38)}>
          <rect x="155" y="102" width="102" height="34" rx="7" fill="url(#sb-ramp-x)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.55" />
        </g>
      </In>
      {viewers.map((v, i) => (
        <In key={v} at={3.4 + i * 0.5}>
          <circle cx="170" cy={119 + i * 38} r="8" fill={`${W}0.1)`} stroke="var(--sp-from)" strokeOpacity="0.7" className="sp-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
          <circle cx="170" cy={116 + i * 38} r="2.8" fill="#fff" fillOpacity="0.85" />
          <path d={`M 164.5 ${124.5 + i * 38} C 165.5 ${120 + i * 38} 174.5 ${120 + i * 38} 175.5 ${124.5 + i * 38}`} fill="#fff" fillOpacity="0.85" />
          <text x="183" y={115 + i * 38} fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">{v}</text>
          <path d={`M 183 ${122 + i * 38} L 250 ${122 + i * 38}`} stroke={`${W}0.1)`} strokeWidth="3.4" strokeLinecap="round" />
          <path d={`M 183 ${122 + i * 38} L 250 ${122 + i * 38}`} stroke="url(#sb-ramp-x)" strokeWidth="3.4" strokeLinecap="round" pathLength="1" className="sp-draw" />
          <text x="183" y={132 + i * 38} fill={`${W}0.88)`} fontSize="6.4" fontFamily="inherit">досмотрел до конца</text>
        </In>
      ))}
      <In at={5}>
        <text x="159" y="226" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">решение принимают вместе</text>
      </In>

      {/* ── Встреча ──────────────────────────────────────────── */}
      <In at={5.2}>
        <path d="M 262 157 L 272 157" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="272" y="78" width="116" height="158" rx="12" {...CARD} />
        <text x="281" y="94" {...LABEL}>ВСТРЕЧА</text>
        <text x="281" y="110" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">уже знают:</text>
        {known.map((k, i) => (
          <g key={k}>
            <path d={`M 281 ${119 + i * 14} l 3 3 l 5 -6`} stroke="var(--sp-to)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <text x="293" y={123 + i * 14} fill="#fff" fontSize="7.8" fontFamily="inherit">{k}</text>
          </g>
        ))}
        <path d="M 281 166 L 379 166" stroke={`${W}0.12)`} />
        <text x="281" y="180" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">сразу к делу:</text>
        {["смета", "сроки"].map((t, i) => (
          <g key={t}>
            <rect x={281 + i * 50} y="187" width="46" height="18" rx="9" fill="url(#sb-ramp-x)" fillOpacity="0.2" stroke="var(--sp-from)" strokeOpacity="0.7" className="sp-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
            <text x={304 + i * 50} y="198.5" textAnchor="middle" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">{t}</text>
          </g>
        ))}
        <text x="281" y="226" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">разговор о задаче</text>
      </In>

      {/* ── Первая встреча по минутам ────────────────────────── */}
      <In at={6}>
        <text x="12" y="262" {...LABEL}>ПЕРВАЯ ВСТРЕЧА</text>
        <text x="12" y="285" fill="#fff" fontSize="7.4" fontFamily="inherit">без фильма</text>
        <rect x="90" y="276" width={20 * M - 1.5} height="13" rx="4" fill={`${W}0.16)`} />
        <text x={90 + 10 * M} y="285.5" textAnchor="middle" fill="#fff" fontSize="6.8" fontFamily="inherit">рассказ о компании</text>
        <rect x={90 + 20 * M} y="276" width={10 * M} height="13" rx="4" fill="url(#sb-ramp-x)" fillOpacity="0.45" />
        <text x={90 + 25 * M} y="285.5" textAnchor="middle" fill="#fff" fontSize="6.8" fontFamily="inherit">задача</text>
      </In>
      <In at={6.6}>
        <text x="12" y="311" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">с фильмом</text>
        <rect x="90" y="302" width={30 * M} height="13" rx="4" fill="url(#sb-ramp-x)" fillOpacity="0.75" />
        <text x={90 + 15 * M} y="311.5" textAnchor="middle" fill="#fff" fontSize="6.8" fontWeight="700" fontFamily="inherit">вся встреча — о задаче клиента</text>
        {[0, 10, 20, 30].map((m, i) => (
          <text key={m} x={90 + m * M} y="330" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">{m === 30 ? "30 мин" : m}</text>
        ))}
        <g className="sp-scan" style={scan(290)}>
          <path d="M 90 270 L 90 320" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" />
        </g>
      </In>
      <In at={7.2}>
        {/* Разнесены по X, а не только по Y: цифра «×3» и две строки текста
            не должны делить одну вертикальную полосу — раньше текст
            садился поверх глифа цифры. */}
        <circle cx="24" cy="350" r="24" fill="url(#sb-glow)" className="sp-pulse" />
        <text x="12" y="362" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="26">×3</text>
        <text x="60" y="352" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">больше времени на задачу клиента</text>
        <text x="60" y="364" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">знакомство случилось до встречи — по ссылке</text>
      </In>
    </BigFrame>
  );
}

/* ═══ Рекламные ролики ═════════════════════════════════════════════ */

/** 01 · Крючок. Лента соцсети: часть зрителей листает дальше на первой
 *  секунде, часть остаётся — курсор идёт по кривой удержания и показывает,
 *  где решение принято. Слева сравнение «без идеи» / «с идеей». */
function AdHookBig() {
  const frames = [
    { t: "0:00", d: "первый кадр" },
    { t: "0:01", d: "конфликт/вопрос" },
    { t: "0:03", d: "решение принято" },
  ];
  return (
    <BigFrame>
      {/* ── Лента ────────────────────────────────────────────── */}
      <In at={0}>
        <rect x="12" y="12" width="94" height="356" rx="16" {...CARD} />
        <text x="22" y="28" {...LABEL}>ЛЕНТА</text>
        <rect x="22" y="36" width="74" height="120" rx="10" fill="url(#sb-ramp)" fillOpacity="0.18" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <circle cx="59" cy="96" r="14" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.3" />
        <path d="M 55 90 L 65 96 L 55 102 Z" fill="#fff" />
      </In>
      <In at={0.8}>
        <path d="M 22 160 L 96 160" stroke={`${W}0.14)`} strokeDasharray="3 3" />
        <path d="M 30 172 L 88 172 M 30 182 L 78 182" stroke={`${W}0.18)`} strokeWidth="3" strokeLinecap="round" className="sp-blink" />
        <text x="22" y="204" fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">палец листает</text>
      </In>
      <In at={1.4}>
        <path d="M 40 220 L 40 300" stroke="var(--sp-to)" strokeWidth="1.4" strokeDasharray="2 3" className="sp-flow" />
        <path d="M 30 220 L 50 220 L 40 232 Z" fill="var(--sp-to)" className="sp-pulse" />
        <text x="22" y="316" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">80% пролистнут</text>
        <text x="22" y="326" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">в первые 3 сек</text>
      </In>

      {/* ── Кривая удержания ─────────────────────────────────── */}
      <In at={0.6}>
        <rect x="118" y="12" width="270" height="150" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.4" />
        <text x="128" y="28" {...LABEL}>УДЕРЖАНИЕ ЗРИТЕЛЯ</text>
        <path d="M 128 34 L 128 140 L 378 140" stroke={`${W}0.18)`} />
      </In>
      <In at={1.4}>
        <path d="M 128 50 C 150 90 170 128 220 134 S 340 138 378 139" stroke={`${W}0.4)`} strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="378" y="132" textAnchor="end" fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">без идеи</text>
      </In>
      <In at={2}>
        <path d="M 128 50 C 145 56 160 62 190 68 S 340 82 378 88" stroke="url(#sb-ramp-x)" strokeWidth="2.2" pathLength="1" className="sp-draw" />
        <text x="378" y="80" textAnchor="end" fill="#fff" fontSize="6.8" fontWeight="700" fontFamily="inherit">с идеей</text>
        <circle cx="128" cy="50" r="4" fill="var(--sp-to)" className="sp-blink" />
        <g className="sp-scan" style={scan(250)}>
          <circle cx="128" cy="50" r="7" fill="url(#sb-glow)" />
        </g>
      </In>
      <In at={2.8}>
        <path d="M 200 34 L 200 140" stroke={`${W}0.16)`} strokeDasharray="2 4" />
        <text x="200" y="152" textAnchor="middle" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">3 сек — точка решения</text>
      </In>

      {/* ── Три кадра крючка ─────────────────────────────────── */}
      <In at={3.2}>
        <text x="118" y="182" {...LABEL}>ПЕРВЫЕ ТРИ СЕКУНДЫ</text>
      </In>
      {frames.map((f, i) => (
        <In key={f.t} at={3.6 + i * 0.5}>
          <rect x={118 + i * 92} y="190" width="82" height="66" rx="8" fill="url(#sb-ramp)" fillOpacity={0.1 + i * 0.06} stroke={i === 2 ? "var(--sp-to)" : "var(--sp-from)"} strokeOpacity="0.55" />
          <text x={124 + i * 92} y="204" fill="#fff" fontSize="8" fontWeight="700" fontFamily="inherit">{f.t}</text>
          <text x={124 + i * 92} y="248" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">{f.d}</text>
          {i === 2 && <circle cx="190" cy="200" r="3" fill="var(--sp-to)" className="sp-blink" />}
        </In>
      ))}
      <In at={5.4}>
        <g className="sp-scan" style={scan(184)}>
          <path d="M 118 190 L 118 256" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
        </g>
      </In>

      {/* ── Идея вместо списка преимуществ ───────────────────── */}
      <In at={5.6}>
        <text x="118" y="278" {...LABEL}>БЫЛО: ПЕРЕЧЕНЬ ПРЕИМУЩЕСТВ</text>
        {["дёшево", "быстро", "качественно", "надёжно"].map((t, i) => (
          <rect key={t} x={118 + i * 66} y="284" width="60" height="18" rx="9" fill={`${W}0.05)`} stroke={`${W}0.16)`} />
        ))}
        {["дёшево", "быстро", "качественно", "надёжно"].map((t, i) => (
          <text key={t} x={148 + i * 66} y="296" textAnchor="middle" fill={`${W}0.88)`} fontSize="6.2" fontFamily="inherit">{t}</text>
        ))}
      </In>
      <In at={6.2}>
        <path d="M 250 312 L 250 322" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <text x="118" y="336" {...LABEL}>СТАЛО: ОДНА ИДЕЯ</text>
        <rect x="118" y="342" width="270" height="30" rx="10" fill="url(#sb-ramp)" fillOpacity="0.16" stroke="var(--sp-to)" strokeOpacity="0.7" className="sp-pulse" />
        <text x="253" y="361.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="inherit">«Даже если не разбираетесь — поймёте за 3 сек»</text>
      </In>
    </BigFrame>
  );
}

/** 02 · Ритм. Три площадки — три хронометража и три плотности монтажа;
 *  внизу — звуковая дорожка, которая подстраивается под каждую площадку. */
function AdPlatformBig() {
  const rows = [
    { name: "Соцсети", cuts: 9, len: "15 сек", w: 15 },
    { name: "Digital", cuts: 6, len: "30 сек", w: 30 },
    { name: "ТВ", cuts: 4, len: "60 сек", w: 60 },
  ];
  const SPAN = 300;
  const MAXLEN = 60;

  return (
    <BigFrame>
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ХРОНОМЕТРАЖ ПОД ПЛОЩАДКУ</text>
      </In>
      {rows.map((r, i) => {
        const y = 32 + i * 60;
        const barW = (r.w / MAXLEN) * SPAN;
        const step = barW / r.cuts;
        return (
          <In key={r.name} at={0.6 + i * 0.6}>
            <text x="12" y={y + 12} fill="#fff" fontSize="9.4" fontWeight="700" fontFamily="inherit">{r.name}</text>
            <text x="388" y={y + 12} textAnchor="end" fill={`${W}0.88)`} fontSize="7.6" fontFamily="inherit">{r.len}</text>
            <rect x="12" y={y + 18} width={SPAN} height="20" rx="6" fill={`${W}0.05)`} stroke={`${W}0.14)`} />
            {Array.from({ length: r.cuts }).map((_, k) => (
              <rect key={k} x={13 + k * step} y={y + 19} width={step - 1.6} height="18" rx="2" fill="url(#sb-ramp-x)" fillOpacity={0.25 + (k % 3) * 0.16} />
            ))}
            <g className="sp-scan" style={{ ...scan(barW - 10), animationDuration: `${2 + i}s` }}>
              <rect x="12" y={y + 17} width="8" height="22" rx="2" fill="#fff" fillOpacity="0.5" />
            </g>
          </In>
        );
      })}

      {/* ── Звуковая дорожка ──────────────────────────────────── */}
      <In at={3}>
        <text x="12" y="232" {...LABEL}>ЗВУК ПОД РИТМ МОНТАЖА</text>
        <path d="M 12 246 L 388 246" stroke={`${W}0.1)`} />
        {Array.from({ length: 40 }).map((_, i) => (
          <rect key={i} x={13 + i * 9.6} y={246 - (8 + (i * 37) % 26)} width="5" height={16 + (i * 37) % 26} rx="2" fill="url(#sb-ramp-x)" fillOpacity={0.2 + ((i * 13) % 40) / 100} className="sp-pulse" style={{ animationDelay: `${(i % 6) * 0.15}s` }} />
        ))}
      </In>
      <In at={3.6}>
        <g className="sp-scan" style={scan(376)}>
          <path d="M 12 214 L 12 250" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
        </g>
      </In>

      {/* ── Один материал → три сборки ────────────────────────── */}
      <In at={4}>
        <text x="12" y="272" {...LABEL}>ОДИН МАТЕРИАЛ — ТРИ СБОРКИ</text>
        <rect x="12" y="278" width="56" height="72" rx="8" fill="url(#sb-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <circle cx="40" cy="314" r="10" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.2" />
        <path d="M 37 309 L 45.5 314 L 37 319 Z" fill="#fff" />
      </In>
      {rows.map((r, i) => (
        <In key={`o${r.name}`} at={4.4 + i * 0.4}>
          <path d={`M 68 ${314} C 86 314 86 ${300 + i * 26} 104 ${300 + i * 26}`} stroke="var(--sp-from)" strokeOpacity="0.55" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="104" y={288 + i * 26} width="272" height="20" rx="10" {...CARD} />
          <text x="114" y={302 + i * 26} fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">{r.name}</text>
          <text x="240" y={302 + i * 26} fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">{r.cuts} склеек</text>
          <text x="368" y={302 + i * 26} textAnchor="end" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">{r.len}</text>
        </In>
      ))}
    </BigFrame>
  );
}

/** 03 · Адаптации. Одна съёмка → четыре формата → карта площадок, где
 *  какой формат живёт. */
function AdFormatsBig() {
  const outs = [
    { l: "9:16", w: 42, h: 74, plat: "Сторис, Reels" },
    { l: "1:1", w: 60, h: 60, plat: "Лента, карусель" },
    { l: "4:5", w: 50, h: 62, plat: "Instagram, VK" },
    { l: "16:9", w: 84, h: 47, plat: "YouTube, ТВ, сайт" },
  ];
  return (
    <BigFrame>
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ОДНА СЪЁМКА</text>
        <rect x="12" y="28" width="96" height="70" rx="10" fill="url(#sb-ramp)" fillOpacity="0.18" stroke="var(--sp-from)" strokeOpacity="0.65" />
        <circle cx="60" cy="63" r="15" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.3" className="sp-pulse" />
        <path d="M 55 56 L 68 63 L 55 70 Z" fill="#fff" />
        <text x="12" y="112" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">1 смена</text>
      </In>

      {outs.map((o, i) => (
        <In key={o.l} at={0.8 + i * 0.5}>
          <path d={`M 108 63 C ${140 + i * 4} ${63} ${150} ${40 + i * 24} ${188} ${40 + i * 24}`} stroke="var(--sp-from)" strokeOpacity="0.55" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="188" y={16 + i * 24} width={o.w} height={o.h > 20 ? 20 : o.h} rx="6" fill="url(#sb-ramp-x)" fillOpacity={0.16 + i * 0.05} stroke="var(--sp-to)" strokeOpacity="0.6" />
          <text x="194" y={30 + i * 24} fill="#fff" fontSize="8" fontWeight="700" fontFamily="inherit">{o.l}</text>
          <text x="388" y={30 + i * 24} textAnchor="end" fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">{o.plat}</text>
        </In>
      ))}

      {/* ── Форматы в масштабе рядом ──────────────────────────── */}
      <In at={3.2}>
        <text x="12" y="140" {...LABEL}>ФОРМАТЫ В МАСШТАБЕ</text>
      </In>
      {outs.map((o, i) => {
        const x = [16, 76, 148, 212][i];
        return (
          <In key={`f${o.l}`} at={3.6 + i * 0.4}>
            <rect x={x} y={216 - o.h} width={o.w} height={o.h} rx="6" fill="url(#sb-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.55" />
            <text x={x + o.w / 2} y="228" textAnchor="middle" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">{o.l}</text>
          </In>
        );
      })}
      <In at={5.4}>
        <circle cx="34" cy="188" r="2.6" fill="var(--sp-to)" className="sp-blink" />
      </In>

      {/* ── Где какой формат живёт ────────────────────────────── */}
      <In at={5}>
        <text x="12" y="256" {...LABEL}>ГДЕ РАБОТАЕТ</text>
        {["Stories", "Лента", "YouTube", "ТВ", "Сайт"].map((c, j) => (
          <text key={c} x={140 + j * 50} y="256" textAnchor="middle" fill="#fff" fontSize="6.8" fontWeight="700" fontFamily="inherit">{c}</text>
        ))}
        <path d="M 12 264 L 388 264" stroke={`${W}0.12)`} />
        <g className="sb-steps4" style={step(24)}>
          <rect x="8" y="267" width="384" height="21" rx="8" fill="url(#sb-ramp-x)" fillOpacity="0.12" stroke="var(--sp-from)" strokeOpacity="0.45" />
        </g>
      </In>
      {outs.map((o, i) => {
        const on = [
          [1, 0, 0, 0, 0],
          [1, 1, 0, 0, 1],
          [1, 1, 0, 0, 1],
          [0, 0, 1, 1, 1],
        ][i];
        return (
          <In key={`m${o.l}`} at={5.6 + i * 0.4}>
            <text x="16" y={280.5 + i * 24} fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">{o.l}</text>
            {on.map((v, j) =>
              v ? (
                <circle key={j} cx={140 + j * 50} cy={277.5 + i * 24} r="4.6" fill="url(#sb-ramp)" className="sp-pulse" style={{ animationDelay: `${(i + j) * 0.2}s` }} />
              ) : (
                <circle key={j} cx={140 + j * 50} cy={277.5 + i * 24} r="4.2" stroke={`${W}0.2)`} />
              ),
            )}
          </In>
        );
      })}
      <In at={7.6}>
        <text x="12" y="372" fill="#fff" fontSize="7.4" fontFamily="inherit">Все форматы — из одной смены, без пересъёмок под каждую площадку.</text>
      </In>
    </BigFrame>
  );
}

/** 04 · Под ключ. Конвейер от идеи до цвета — пять узлов, сроки по дням,
 *  одна команда и одна смета вместо пяти подрядчиков. */
function AdPipelineBig() {
  const nodes = [
    { n: "Идея", d: "1–2 дня" },
    { n: "Кастинг", d: "2–3 дня" },
    { n: "Съёмка", d: "1 смена" },
    { n: "Монтаж", d: "3–4 дня" },
    { n: "Цвет", d: "1–2 дня" },
  ];
  const X0 = 24;
  const STEP = 84;

  return (
    <BigFrame>
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ОДНА КОМАНДА, ОДИН СРОК</text>
        <path d="M 24 60 L 360 60" stroke={`${W}0.14)`} strokeWidth="1.3" />
        <path d="M 24 60 L 360 60" stroke="url(#sb-ramp-x)" strokeWidth="2" pathLength="1" className="sp-draw" />
        <g className="sp-scan" style={scan(336)}>
          <circle cx="24" cy="60" r="6" fill="url(#sb-glow)" />
        </g>
      </In>
      {nodes.map((n, i) => (
        <In key={n.n} at={0.6 + i * 0.5}>
          <circle cx={X0 + i * STEP} cy="60" r="17" fill="rgba(10,13,16,0.92)" stroke="url(#sb-ramp)" strokeWidth="1.5" className={i === 2 ? "sp-pulse" : undefined} />
          <text x={X0 + i * STEP} y="64.5" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="inherit">{i + 1}</text>
          <text x={X0 + i * STEP} y="94" textAnchor="middle" fill="#fff" fontSize="8.2" fontWeight="700" fontFamily="inherit">{n.n}</text>
          <text x={X0 + i * STEP} y="105" textAnchor="middle" fill={`${W}0.88)`} fontSize="6.8" fontFamily="inherit">{n.d}</text>
        </In>
      ))}

      {/* ── Одна команда вместо пяти подрядчиков ─────────────── */}
      <In at={3.4}>
        <text x="12" y="136" {...LABEL}>БЫЛО: ПЯТЬ ПОДРЯДЧИКОВ</text>
        {["Продакшн", "Кастинг", "Монтаж", "Звук", "Цвет"].map((t, i) => (
          <g key={t}>
            <rect x={12 + i * 76} y="142" width="70" height="22" rx="8" fill={`${W}0.05)`} stroke={`${W}0.16)`} />
            <text x={47 + i * 76} y="156" textAnchor="middle" fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">{t}</text>
          </g>
        ))}
      </In>
      <In at={4}>
        <path d="M 200 174 L 200 184" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <text x="12" y="198" {...LABEL}>СТАЛО: ОДНА КОМАНДА</text>
        <rect x="12" y="204" width="376" height="34" rx="12" fill="url(#sb-ramp)" fillOpacity="0.16" stroke="var(--sp-to)" strokeOpacity="0.7" className="sp-pulse" />
        <text x="200" y="225.5" textAnchor="middle" fill="#fff" fontSize="9.4" fontWeight="700" fontFamily="inherit">Один договор · одна смета · один ответственный</text>
      </In>

      {/* ── Календарь производства ────────────────────────────── */}
      <In at={4.8}>
        <text x="12" y="264" {...LABEL}>КАЛЕНДАРЬ ПРОИЗВОДСТВА</text>
        <path d="M 12 272 L 388 272" stroke={`${W}0.12)`} />
        {["день 1", "день 5", "день 9", "день 13"].map((t, i) => (
          <text key={t} x={12 + i * 125.3} y="288" textAnchor={i === 0 ? "start" : "middle"} fill={`${W}0.88)`} fontSize="6.6" fontFamily="inherit">{t}</text>
        ))}
      </In>
      {(() => {
        let acc = 0;
        const days = [
          { n: "Идея", d: 2 },
          { n: "Кастинг", d: 3 },
          { n: "Съёмка", d: 1 },
          { n: "Монтаж", d: 4 },
          { n: "Цвет", d: 2 },
        ];
        const SPAN = 376;
        const TOTAL = 12;
        return days.map((d, i) => {
          const x = 12 + (acc / TOTAL) * SPAN;
          const w = (d.d / TOTAL) * SPAN - 2;
          acc += d.d;
          return (
            <In key={d.n} at={5.4 + i * 0.35}>
              <rect x={x} y="296" width={w} height="20" rx="6" fill="url(#sb-ramp-x)" fillOpacity={0.35 + (i % 2) * 0.25} />
              <text x={x + w / 2} y="309.5" textAnchor="middle" fill="#fff" fontSize="6.6" fontWeight="700" fontFamily="inherit">{d.n}</text>
            </In>
          );
        });
      })()}
      <In at={7.2}>
        <g className="sp-scan" style={scan(376)}>
          <path d="M 12 292 L 12 320" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
        </g>
        {/* Разнесены по X, как «×3» на сцене 04 презентаций: цифра и
            подпись не делят одну вертикальную полосу. */}
        <text x="12" y="342" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="22">12 дней</text>
        <text x="126" y="335" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">от идеи до готового ролика</text>
        <text x="126" y="347" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">без простоя между этапами</text>
      </In>
    </BigFrame>
  );
}

/* ═══ Имиджевые видео ═════════════════════════════════════════════ */

/** 01 · Чувство. Слева — карточка характеристик, которую забывают, справа —
 *  эмоциональная кривая, которая остаётся: пик чувства держится дольше
 *  пика внимания к фактам. Внизу — что помнит зритель через неделю. */
function ImgMoodBig() {
  const facts = ["Хронометраж 45 с", "Формат 16:9", "Бюджет от Х ₽", "Команда 6 человек"];
  const memory = [
    { t: "Факты", v: 12 },
    { t: "Логотип", v: 24 },
    { t: "Настроение", v: 81 },
  ];
  return (
    <BigFrame>
      {/* ── Карточка характеристик ───────────────────────────── */}
      <In at={0}>
        <rect x="12" y="12" width="150" height="150" rx="12" {...CARD} />
        <text x="22" y="28" {...LABEL}>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</text>
      </In>
      {facts.map((f, i) => (
        <In key={f} at={0.5 + i * 0.35}>
          <rect x="22" y={40 + i * 26} width="11" height="11" rx="3" fill="url(#sb-ramp)" fillOpacity="0.28" stroke="var(--sp-from)" strokeOpacity="0.75" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <text x="40" y={49.5 + i * 26} fill="#fff" fontSize="7.8" fontWeight="700" fontFamily="inherit">{f}</text>
        </In>
      ))}
      <In at={2.2}>
        <path d="M 24 46 L 150 146" stroke={`${W}0.35)`} strokeWidth="1.2" />
        <text x="30" y="158" fill={`${W}0.72)`} fontSize="6.8" fontFamily="inherit">забывается за неделю</text>
      </In>

      {/* ── Эмоциональная кривая ─────────────────────────────── */}
      <In at={1}>
        <rect x="174" y="12" width="214" height="150" rx="12" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.4" />
        <text x="184" y="28" {...LABEL}>ЧТО ОСТАЁТСЯ У ЗРИТЕЛЯ</text>
      </In>
      <In at={1.8}>
        <path d="M 184 130 C 210 132 230 134 250 132 S 300 120 320 100" stroke={`${W}0.35)`} strokeWidth="1.3" strokeDasharray="3 3" />
        <text x="378" y="128" textAnchor="end" fill={`${W}0.72)`} fontSize="6.6" fontFamily="inherit">факты</text>
      </In>
      <In at={2.6}>
        <circle cx="240" cy="88" r="44" fill="url(#sb-glow)" className="sp-pulse" />
        <path d="M 184 128 C 200 90 216 68 240 64 S 300 70 320 60 S 360 46 378 40" stroke="url(#sb-ramp-x)" strokeWidth="2.2" pathLength="1" className="sp-draw" />
        <text x="378" y="52" textAnchor="end" fill="#fff" fontSize="6.8" fontWeight="700" fontFamily="inherit">настроение</text>
        <g className="sp-scan" style={scan(194)}>
          <circle cx="184" cy="128" r="6" fill="#fff" fillOpacity="0.7" />
        </g>
      </In>
      <In at={3.4}>
        <path d="M 184 142 L 378 142" stroke={`${W}0.14)`} />
        <text x="184" y="154" fill={`${W}0.75)`} fontSize="6.6" fontFamily="inherit">0 сек</text>
        <text x="378" y="154" textAnchor="end" fill={`${W}0.75)`} fontSize="6.6" fontFamily="inherit">через неделю</text>
      </In>

      {/* ── Что помнит зритель ────────────────────────────────── */}
      <In at={3.8}>
        <text x="12" y="188" {...LABEL}>ЧТО ПОМНИТ ЗРИТЕЛЬ ЧЕРЕЗ НЕДЕЛЮ</text>
      </In>
      {memory.map((m, i) => (
        <In key={m.t} at={4.2 + i * 0.4}>
          <text x="12" y={210 + i * 34} fill="#fff" fontSize="8.6" fontWeight="700" fontFamily="inherit">{m.t}</text>
          <rect x="100" y={200 + i * 34} width="288" height="18" rx="9" fill={`${W}0.06)`} />
          <rect x="100" y={200 + i * 34} width={2.88 * m.v} height="18" rx="9" fill="url(#sb-ramp-x)" fillOpacity={i === 2 ? 0.85 : 0.4} className={i === 2 ? "sp-pulse" : undefined} />
          <text x={388} y={213 + i * 34} textAnchor="end" fill="#fff" fontSize="8.2" fontWeight="700" fontFamily="inherit">{m.v}%</text>
        </In>
      ))}

      <In at={5.8}>
        <text x="12" y="336" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">Продаём не характеристику, а ощущение.</text>
        <text x="12" y="348" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">Такой ролик не пересказывают словами — просто выбирают вас.</text>
      </In>
    </BigFrame>
  );
}

/** 02 · Язык бренда. Палитра, шрифт и композиция кадра складываются в
 *  «гайдлайн», по которому бренд узнают ещё до появления логотипа —
 *  показаны три разных кадра, снятых по одним и тем же правилам. */
function ImgLanguageBig() {
  const palette = ["#ff4fd8", "#ff6a3d", "#1a0a04", "#ffe8d9"];
  const frames = ["Продукт", "Человек", "Процесс"];
  return (
    <BigFrame>
      {/* ── Гайдлайн бренда ──────────────────────────────────── */}
      <In at={0}>
        <rect x="12" y="12" width="140" height="356" rx="14" {...CARD} />
        <text x="22" y="28" {...LABEL}>ВИЗУАЛЬНЫЙ ЯЗЫК</text>
      </In>
      <In at={0.6}>
        <text x="22" y="48" fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">палитра</text>
        {palette.map((c, i) => (
          <rect key={c} x={22 + i * 30} y="54" width="26" height="26" rx="6" fill={c} stroke={`${W}0.2)`} className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </In>
      <In at={1.4}>
        <text x="22" y="108" fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">шрифт</text>
        <rect x="22" y="114" width="118" height="52" rx="8" fill={`${W}0.04)`} stroke={`${W}0.14)`} />
        <text x="34" y="154" fill="#fff" fontSize="34" fontWeight="700" fontFamily="inherit">Aa</text>
        <rect x="86" y="130" width="42" height="5" rx="2.5" fill={`${W}0.4)`} />
        <rect x="86" y="142" width="30" height="5" rx="2.5" fill={`${W}0.24)`} />
        <rect x="86" y="152" width="36" height="5" rx="2.5" fill={`${W}0.24)`} />
      </In>
      <In at={2.2}>
        <text x="22" y="192" fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">композиция</text>
        <rect x="22" y="198" width="118" height="70" rx="8" fill={`${W}0.04)`} stroke={`${W}0.14)`} />
        <path d="M 61 198 L 61 268 M 100 198 L 100 268 M 22 232 L 140 232" stroke={`${W}0.14)`} strokeDasharray="2 3" />
        <circle cx="100" cy="232" r="9" fill="url(#sb-ramp)" fillOpacity="0.4" className="sp-pulse" />
      </In>
      <In at={3}>
        <text x="22" y="292" fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">свет</text>
        <rect x="22" y="298" width="118" height="24" rx="12" fill={`${W}0.06)`} />
        <rect x="22" y="298" width="80" height="24" rx="12" fill="url(#sb-ramp-x)" fillOpacity="0.35" />
        <circle cx="102" cy="310" r="7" fill="#fff" stroke="var(--sp-from)" strokeWidth="1.4" />
      </In>

      {/* ── Три кадра по одним правилам ───────────────────────── */}
      <In at={1}>
        <text x="164" y="20" {...LABEL}>ОДНИ ПРАВИЛА — РАЗНЫЕ КАДРЫ</text>
      </In>
      {frames.map((f, i) => (
        <In key={f} at={1.6 + i * 0.6}>
          <path d="M 152 190 L 164 116" stroke={`${W}0.14)`} style={i > 0 ? { opacity: 0 } : undefined} />
          <rect x="164" y={28 + i * 116} width="212" height="100" rx="10" fill="url(#sb-ramp)" fillOpacity={0.1 + i * 0.03} stroke="var(--sp-from)" strokeOpacity="0.5" />
          <path d={`M 204 ${28 + i * 116} L 204 ${128 + i * 116} M 336 ${28 + i * 116} L 336 ${128 + i * 116}`} stroke={`${W}0.12)`} strokeDasharray="2 3" />
          <circle cx="270" cy={78 + i * 116} r="16" fill="url(#sb-ramp)" fillOpacity="0.45" className="sp-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
          <text x="174" y={44 + i * 116} fill="#fff" fontSize="7.8" fontWeight="700" fontFamily="inherit">{f}</text>
          <circle cx="366" cy={38 + i * 116} r="2.6" fill="var(--sp-to)" className="sp-blink" style={{ animationDelay: `${i * 0.4}s` }} />
        </In>
      ))}
      <In at={4}>
        <text x="164" y="352" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">Три разных сюжета — один узнаваемый почерк.</text>
        <text x="164" y="364" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">Компанию узнают по кадру ещё до появления логотипа.</text>
      </In>
    </BigFrame>
  );
}

/** 03 · Тон. Три ползунка настройки (тепло/контраст/насыщенность) и
 *  звуковая дорожка ведут себя как один инструмент — и результат
 *  одинаково звучит и выглядит на разных площадках показа. */
function ImgToneBig() {
  const sliders = [
    { l: "Тепло", v: 0.68 },
    { l: "Контраст", v: 0.44 },
    { l: "Насыщенность", v: 0.8 },
  ];
  const outs = ["Сайт", "Соцсети", "Реклама", "Встреча"];
  return (
    <BigFrame>
      {/* ── Настройка тона ────────────────────────────────────── */}
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ОДИН ТОН НА ВСЁ</text>
      </In>
      {sliders.map((s, i) => (
        <In key={s.l} at={0.5 + i * 0.4}>
          <text x="12" y={40 + i * 30} fill="#fff" fontSize="8.2" fontWeight="700" fontFamily="inherit">{s.l}</text>
          <rect x="12" y={46 + i * 30} width="180" height="5" rx="2.5" fill={`${W}0.12)`} />
          <rect x="12" y={46 + i * 30} width={180 * s.v} height="5" rx="2.5" fill="url(#sb-ramp-x)" />
          <circle cx={12 + 180 * s.v} cy={48.5 + i * 30} r="7" fill="#fff" stroke="var(--sp-from)" strokeWidth="1.6" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}

      {/* ── Кадр и звук ───────────────────────────────────────── */}
      <In at={1.6}>
        <rect x="204" y="16" width="184" height="96" rx="10" fill="url(#sb-ramp)" fillOpacity="0.18" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <circle cx="240" cy="50" r="14" fill="#fff" fillOpacity="0.5" className="sp-pulse" />
        <path d="M 268 76 L 300 42 L 322 62 L 352 30 L 388 68 L 268 68 Z" fill="rgba(10,13,16,0.4)" />
        <text x="212" y="102" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">кадр под тон</text>
      </In>
      <In at={2.4}>
        <text x="12" y="132" {...LABEL}>ЗВУК ПОД ТОТ ЖЕ ТОН</text>
      </In>
      {Array.from({ length: 34 }).map((_, i) => (
        <In key={i} at={2.8 + i * 0.08}>
          <rect x={13 + i * 11} y={172 - (8 + (i * 37) % 42)} width="6" height={16 + (i * 37) % 42} rx="3" fill="url(#sb-ramp-x)" fillOpacity={0.3 + ((i * 13) % 40) / 90} className="sp-pulse" style={{ animationDelay: `${(i % 6) * 0.15}s` }} />
        </In>
      ))}
      <In at={5.4}>
        <g className="sp-scan" style={scan(360)}>
          <path d="M 13 122 L 13 176" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
        </g>
      </In>

      {/* ── Одинаково смотрится на всех площадках ────────────── */}
      <In at={5.8}>
        <text x="12" y="196" {...LABEL}>ОДИНАКОВО НА ВСЕХ ПЛОЩАДКАХ</text>
      </In>
      {outs.map((o, i) => (
        <In key={o} at={6.2 + i * 0.3}>
          <rect x={12 + i * 95} y="202" width="86" height="60" rx="8" fill="url(#sb-ramp)" fillOpacity={0.14 + (i % 2) * 0.06} stroke="var(--sp-from)" strokeOpacity="0.45" />
          <circle cx={55 + i * 95} cy="224" r="9" fill="#fff" fillOpacity="0.4" />
          <text x={22 + i * 95} y="252" fill="#fff" fontSize="7.2" fontWeight="700" fontFamily="inherit">{o}</text>
        </In>
      ))}
      <In at={7.6}>
        <path d="M 12 274 L 388 274" stroke={`${W}0.1)`} />
        <path d="M 12 274 L 388 274" stroke="url(#sb-ramp-x)" strokeWidth="1.6" pathLength="1" className="sp-draw" />
        <text x="12" y="290" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">один грейд, одна музыкальная тема — везде</text>
      </In>

      <In at={8}>
        <text x="12" y="330" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">Тон — как подпись: он не меняется от площадки к площадке.</text>
        <text x="12" y="342" fill={`${W}0.88)`} fontSize="7" fontFamily="inherit">Музыка и цветокоррекция настроены на характер бренда.</text>
      </In>
    </BigFrame>
  );
}

/** 04 · Доверие. Один ролик расходится по точкам контакта — сайт, соцсети,
 *  первая встреча — и в каждой точке усиливает одно и то же впечатление. */
function ImgTrustBig() {
  const points = [
    { t: "Сайт", d: "первый заход" },
    { t: "Соцсети", d: "лента, сторис" },
    { t: "Встреча", d: "до звонка" },
  ];
  return (
    <BigFrame>
      {/* ── Источник ──────────────────────────────────────────── */}
      <In at={0}>
        <text x="12" y="20" {...LABEL}>ОДИН РОЛИК</text>
        <rect x="12" y="26" width="110" height="130" rx="12" fill="url(#sb-ramp)" fillOpacity="0.18" stroke="var(--sp-from)" strokeOpacity="0.65" />
        <circle cx="67" cy="91" r="22" fill="url(#sb-glow)" className="sp-pulse" />
        <circle cx="67" cy="91" r="15" fill="rgba(10,13,16,0.85)" stroke="url(#sb-ramp)" strokeWidth="1.3" />
        <path d="M 62 84 L 76 91 L 62 98 Z" fill="#fff" />
        <text x="22" y="170" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">одно впечатление</text>
      </In>

      {/* ── Три точки контакта ────────────────────────────────── */}
      {points.map((p, i) => (
        <In key={p.t} at={0.8 + i * 0.5}>
          <path d={`M 122 91 C 160 91 170 ${40 + i * 60} 208 ${40 + i * 60}`} stroke="var(--sp-from)" strokeOpacity="0.55" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="208" y={22 + i * 60} width="168" height="44" rx="10" {...CARD} />
          <circle cx="226" cy={38 + i * 60} r="4" fill="var(--sp-to)" className="sp-blink" style={{ animationDelay: `${i * 0.4}s` }} />
          <text x="238" y={41 + i * 60} fill="#fff" fontSize="9" fontWeight="700" fontFamily="inherit">{p.t}</text>
          <text x="238" y={54 + i * 60} fill={`${W}0.75)`} fontSize="6.8" fontFamily="inherit">{p.d}</text>
        </In>
      ))}

      {/* ── Хронология знакомства ─────────────────────────────── */}
      <In at={2.6}>
        <text x="12" y="212" {...LABEL}>ПУТЬ КЛИЕНТА ДО ВСТРЕЧИ</text>
        <path d="M 22 236 L 366 236" stroke={`${W}0.16)`} />
        <path d="M 22 236 L 366 236" stroke="url(#sb-ramp-x)" strokeWidth="1.6" pathLength="1" className="sp-draw" />
      </In>
      {["сайт", "соцсети", "поиск отзывов", "встреча"].map((t, i) => (
        <In key={t} at={3.2 + i * 0.35}>
          <circle cx={22 + i * 114.6} cy="236" r="5" fill={i === 3 ? "var(--sp-to)" : "var(--sp-from)"} className={i === 3 ? "sp-pulse" : undefined} />
          <text x={22 + i * 114.6} y="252" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill="#fff" fontSize="7.2" fontWeight="700" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <In at={4.6}>
        <g className="sp-scan" style={scan(344)}>
          <circle cx="22" cy="236" r="8" fill="url(#sb-glow)" />
        </g>
      </In>

      {/* ── Итог ──────────────────────────────────────────────── */}
      <In at={5}>
        <rect x="12" y="272" width="376" height="54" rx="14" fill="url(#sb-ramp)" fillOpacity="0.14" stroke="var(--sp-to)" strokeOpacity="0.6" className="sp-pulse" />
        <text x="200" y="294" textAnchor="middle" fill="#fff" fontSize="9.4" fontWeight="700" fontFamily="inherit">К встрече клиент уже чувствует, каково с вами работать</text>
        <text x="200" y="312" textAnchor="middle" fill={`${W}0.88)`} fontSize="7.4" fontFamily="inherit">и это не пересказ слов — прямое впечатление от кадра</text>
      </In>

      <In at={5.8}>
        <text x="12" y="352" fill="#fff" fontSize="7.6" fontWeight="700" fontFamily="inherit">Один ролик работает везде, где о компании складывается мнение.</text>
      </In>
    </BigFrame>
  );
}

export const BIG_SCENES: Record<string, (React.ComponentType | undefined)[]> = {
  presentation: [PresBriefBig, PresScaleBig, PresVersionsBig, PresTrustBig],
  advertising: [AdHookBig, AdPlatformBig, AdFormatsBig, AdPipelineBig],
  image: [ImgMoodBig, ImgLanguageBig, ImgToneBig, ImgTrustBig],
};
