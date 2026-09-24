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
const LABEL = { fill: `${W}0.62)`, fontSize: 7.2, letterSpacing: 1, fontFamily: "inherit" } as const;

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
          <text x="33" y={53 + i * 40} fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">{g.s}</text>
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
          <text x="274" y={53 + i * 34} textAnchor="end" fill={`${W}0.72)`} fontSize="7" fontFamily="inherit">{c.at}</text>
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
        <text x="303" y="148" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">без фильма</text>
        <text x="379" y="148" textAnchor="end" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">30 мин</text>
        <rect x="303" y="153" width="76" height="6" rx="3" fill={`${W}0.22)`} />
        <text x="303" y="172" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">с фильмом</text>
        <text x="379" y="172" textAnchor="end" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">3 мин</text>
        <rect x="303" y="177" width="8" height="6" rx="3" fill="url(#sb-ramp-x)" />
        <text x="303" y="205" className="sp-figure" fill="url(#sb-ramp-x)" fontSize="19">×10</text>
        <text x="330" y="204" fill="#fff" fontSize="7.4" fontWeight="700" fontFamily="inherit">быстрее</text>
      </In>

      {/* ── Удержание внимания ───────────────────────────────── */}
      <In at={6.2}>
        <text x="12" y="246" {...LABEL}>УДЕРЖАНИЕ ВНИМАНИЯ</text>
        <path d="M 262 243 L 276 243" stroke="url(#sb-ramp-x)" strokeWidth="2" />
        <text x="280" y="246" fill="#fff" fontSize="7.2" fontFamily="inherit">фильм</text>
        <path d="M 322 243 L 336 243" stroke={`${W}0.5)`} strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="340" y="246" fill={`${W}0.78)`} fontSize="7.2" fontFamily="inherit">слайды</text>
        {starts.slice(1).map((s) => (
          <path key={s} d={`M ${X0 + (s / 180) * SPAN} 258 L ${X0 + (s / 180) * SPAN} 340`} stroke={`${W}0.08)`} strokeDasharray="2 3" />
        ))}
        <path d="M 12 272 C 60 280 110 310 170 322 S 320 334 388 338" stroke={`${W}0.45)`} strokeWidth="1.3" strokeDasharray="3 3" />
        <path d="M 12 272 C 80 264 140 278 200 269 S 320 275 388 266 L 388 340 L 12 340 Z" fill="url(#sb-area)" />
        <path d="M 12 272 C 80 264 140 278 200 269 S 320 275 388 266" stroke="url(#sb-ramp-x)" strokeWidth="2.2" pathLength="1" className="sp-draw" />
      </In>
      <In at={7.2}>
        <text x="386" y="259" textAnchor="end" fill="#fff" fontSize="7.2" fontWeight="700" fontFamily="inherit">держит до конца</text>
        <text x="236" y="316" textAnchor="middle" fill={`${W}0.78)`} fontSize="7.2" fontFamily="inherit">внимание уходит</text>
      </In>
      <In at={6.8}>
        {chapters.map((c, i) => (
          <rect key={c.n} x={X0 + (starts[i] / 180) * SPAN} y="348" width={(c.d / 180) * SPAN - 2} height="4" rx="2" fill="url(#sb-ramp-x)" fillOpacity={0.35 + (i % 2) * 0.35} />
        ))}
        {["0:00", "1:00", "2:00", "3:00"].map((t, i) => (
          <text key={t} x={X0 + (i * SPAN) / 3} y="368" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill={`${W}0.72)`} fontSize="7" fontFamily="inherit">{t}</text>
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
          <text x="305" y={65 + i * 34} fill={`${W}0.75)`} fontSize="6.8" fontFamily="inherit">{s.s}</text>
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
        <text x="12" y="292" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">линия заказчика</text>
        <text x="374" y="292" textAnchor="end" fill="#fff" fontSize="7" fontWeight="700" fontFamily="inherit">работает всю смену</text>
        <circle cx="384" cy="289" r="2.4" fill="var(--sp-to)" className="sp-blink" />
        <path d="M 12 300 L 388 300" stroke="var(--sp-to)" strokeWidth="2.2" className="sp-flow" />
        {["08:00", "11:00", "14:00", "17:00", "20:00"].map((t, i) => (
          <text key={t} x={12 + i * 3 * H} y="316" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fill={`${W}0.72)`} fontSize="7" fontFamily="inherit">{t}</text>
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
        <text x="21" y="111" fill={`${W}0.75)`} fontSize="6.8" fontFamily="inherit">2–3 смены</text>
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
          <text x={30 + i * 113.3} y="62" textAnchor="middle" fill={`${W}0.75)`} fontSize="6.6" fontFamily="inherit">{p.d}</text>
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
        <text x="60" y="163" fill={`${W}0.78)`} fontSize="6.6" fontFamily="inherit">фильм · 3:00</text>
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
          <text x="183" y={132 + i * 38} fill={`${W}0.75)`} fontSize="6.4" fontFamily="inherit">досмотрел до конца</text>
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
        <text x="281" y="110" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">уже знают:</text>
        {known.map((k, i) => (
          <g key={k}>
            <path d={`M 281 ${119 + i * 14} l 3 3 l 5 -6`} stroke="var(--sp-to)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <text x="293" y={123 + i * 14} fill="#fff" fontSize="7.8" fontFamily="inherit">{k}</text>
          </g>
        ))}
        <path d="M 281 166 L 379 166" stroke={`${W}0.12)`} />
        <text x="281" y="180" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">сразу к делу:</text>
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
          <text key={m} x={90 + m * M} y="330" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill={`${W}0.72)`} fontSize="6.8" fontFamily="inherit">{m === 30 ? "30 мин" : m}</text>
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
        <text x="60" y="364" fill={`${W}0.78)`} fontSize="7" fontFamily="inherit">знакомство случилось до встречи — по ссылке</text>
      </In>
    </BigFrame>
  );
}

export const BIG_SCENES: Record<string, (React.ComponentType | undefined)[]> = {
  presentation: [PresBriefBig, PresScaleBig, PresVersionsBig, PresTrustBig],
};
