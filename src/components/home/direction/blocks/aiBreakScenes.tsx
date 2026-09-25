"use client";

import { In } from "@/components/home/ai/sceneKit";

// Сцены блоков-перебивок (SceneBreak) для страниц AI-инструментов /ai/[tool]
// и форматов сайтов /sites/[format] и SMM /smm/[format].
//
// Отличие от сцен /content (sceneBreakScenes.tsx) — в центре один крупный
// понятный «герой» (телефон, чип агента, чат), вокруг него карточки слоями
// и свечение бренда. Всё плоское: ровные градиенты, без бликов и глянцевых
// сфер — Егор их отверг. Вьюбокс тот же
// 400×380, анимации — те же классы .tool-scene (sp-in/sp-flow/sp-rise…),
// поэтому сцена ничего не стоит странице: только transform и opacity.
//
// Шрифт не мельче 9 единиц: на телефоне вьюбокс сжимается до ~340px, и
// более мелкий текст перестаёт читаться.

const W = "rgba(255,255,255,";
const INK = "#0b0d0c";
const WARN = "#fbbf24";
const LABEL = { fill: "url(#ab-ramp-x)", fontSize: 11, fontWeight: 700, letterSpacing: 0.8, className: "sp-figure" } as const;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 380" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ab-ramp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        <linearGradient id="ab-ramp-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        {/* Стеклянная карточка: светлее сверху, как будто свет падает сверху. */}
        <linearGradient id="ab-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.035" />
        </linearGradient>
        <linearGradient id="ab-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#262b27" />
          <stop offset="100%" stopColor="#090a0a" />
        </linearGradient>
        <linearGradient id="ab-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141816" />
          <stop offset="100%" stopColor="#0a0c0b" />
        </linearGradient>
        <radialGradient id="ab-glow">
          <stop offset="0%" stopColor="var(--sp-from)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--sp-to)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--sp-to)" stopOpacity="0" />
        </radialGradient>
        {/* Плоская заливка «чипа» — ровный градиент бренда без бликов:
            Егор отверг глянцевую сферу («как в старом учебнике»). */}
        <linearGradient id="ab-orb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        <filter id="ab-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <pattern id="ab-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill={`${W}0.07)`} />
        </pattern>
      </defs>
      <rect width="400" height="380" fill="url(#ab-dots)" />
      {children}
    </svg>
  );
}

/** Карточка со «слоем»: мягкая тень под ней + стекло + светлая грань сверху. */
function Card({ x, y, w, h, r = 14, hot = false }: { x: number; y: number; w: number; h: number; r?: number; hot?: boolean }) {
  return (
    <>
      <rect x={x + 5} y={y + 9} width={w} height={h} rx={r} fill="#000" opacity="0.3" filter="url(#ab-shadow)" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#0d100e" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={hot ? "url(#ab-ramp)" : "url(#ab-glass)"} fillOpacity={hot ? 0.16 : 1} stroke={hot ? "var(--sp-from)" : `${W}0.18)`} strokeOpacity={hot ? 0.75 : 1} />
      <path d={`M ${x + r} ${y + 0.6} H ${x + w - r}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
    </>
  );
}

function Check({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x} ${y} l 3 3 l 5.5 -6.5`} stroke="var(--sp-from)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
}

/** Пузырь чата. mine — ответ агента/менеджера: залит фирменным градиентом. */
function Bubble({ x, y, w, lines, mine = false, tone }: { x: number; y: number; w: number; lines: string[]; mine?: boolean; tone?: string }) {
  const h = 14 + lines.length * 14;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={mine ? tone ?? "url(#ab-ramp)" : `${W}0.1)`} stroke={mine ? "none" : `${W}0.14)`} />
      {lines.map((t, i) => (
        <text key={t} x={x + 9} y={y + 18 + i * 14} fill={mine ? INK : "#fff"} fontSize="10" fontWeight={mine ? "700" : undefined}>
          {t}
        </text>
      ))}
    </>
  );
}


/* ═══ Шаблоны сцен ═════════════════════════════════════════════════
   Шесть раскладок на 33 окна: у каждой свой «герой» (телефон, ядро, чат,
   исходник с веером, график, фильтр). Страница отдаёт только слова —
   так все окна AI-раздела выглядят одной системой, а длины строк
   ограничены самой раскладкой (лимиты — в комментариях к пропсам). */

type Msg = { lines: string[]; mine?: boolean };

/** Высота пузыря — та же формула, что в Bubble. */
const bubbleH = (m: Msg) => 14 + m.lines.length * 14;

/** Кегль крупного слова, чтобы оно влезло в ширину maxW (замер: заглавная
 *  дисплейного шрифта ≈ 0.95 кегля; смешанный текст с цифрами и строчными
 *  уже — для него коэффициент k меньше). */
const fit = (s: string, maxW: number, max: number, k = 0.95) => Math.min(max, Math.floor(maxW / (s.length * k)));

/** Телефон-герой в наклоне с перепиской и три карточки вокруг.
 *  Пузырь — до 18 знаков в строке, всего строк в трёх сообщениях ≤ 5. */
type ChatProps = {
  time: string;
  header: string;
  msgs: [Msg, Msg, Msg];
  note: string;
  result: { title: string; rows: [string, string] };
  left: { big: string; sub: string; icon: "moon" | "dot" };
  ring: { value: string; unit: string; sub: string };
  dest: { big: string; sub: string };
};

/** Корпус телефона в наклоне — общий для ChatScene и FeedScene. */
function PhoneShell({ time, header }: { time: string; header: string }) {
  return (
    <In at={0}>
      <g transform="rotate(-5 200 195)">
        <rect x="124" y="30" width="170" height="330" rx="30" fill="#000" opacity="0.35" filter="url(#ab-shadow)" transform="translate(6 10)" />
        <rect x="112" y="20" width="170" height="330" rx="30" fill="url(#ab-body)" stroke="url(#ab-ramp)" strokeWidth="1.4" />
        <rect x="121" y="29" width="152" height="312" rx="23" fill="url(#ab-screen)" />
        <rect x="176" y="35" width="42" height="10" rx="5" fill="#000" />
        <text x="133" y="62" fill={`${W}0.85)`} fontSize="10" fontWeight="700">{time}</text>
        <circle cx="137" cy="78" r="3.4" fill="var(--sp-from)" className="sp-pulse" />
        <text x="145" y="81.5" fill="#fff" fontSize="10" fontWeight="700">{header}</text>
        <path d="M 129 90 H 265" stroke={`${W}0.1)`} />
      </g>
    </In>
  );
}

type Sides = Pick<ChatProps, "left" | "ring" | "dest">;

/** Три карточки вокруг телефона: слева факт, справа кольцо и итог. */
function PhoneSides({ left, ring, dest }: Sides) {
  return (
    <>
      <In at={0.8}>
        <g className="sp-rise">
          <g transform="rotate(-6 60 270)">
            <Card x={8} y={236} w={132} h={70} />
            {left.icon === "moon" ? (
              <path d="M 30 254 a 10 10 0 1 0 10 13 a 8 8 0 0 1 -10 -13 Z" fill={WARN} opacity="0.9" />
            ) : (
              <circle cx="32" cy="262" r="7" fill="var(--sp-from)" className="sp-pulse" />
            )}
            <text x="46" y="268" className="sp-figure" fill="#fff" fontSize={fit(left.big, 86, 20)}>{left.big}</text>
            <text x="21" y="292" fill={`${W}0.9)`} fontSize="9.5">{left.sub}</text>
          </g>
        </g>
      </In>

      <In at={1.6}>
        <g className="sp-glide" style={{ animationDelay: "0.8s" }}>
          <Card x={296} y={44} w={92} h={112} />
          <circle cx="342" cy="88" r="26" stroke={`${W}0.12)`} strokeWidth="6" />
          <circle cx="342" cy="88" r="26" stroke="url(#ab-ramp)" strokeWidth="6" strokeLinecap="round" pathLength="1" className="sp-draw" transform="rotate(-90 342 88)" />
          <text x="342" y="95" textAnchor="middle" className="sp-figure" fill="#fff" fontSize="22">{ring.value}</text>
          <text x="342" y="131" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">{ring.unit}</text>
          <text x="342" y="145" textAnchor="middle" fill={`${W}0.85)`} fontSize="9">{ring.sub}</text>
        </g>
      </In>

      <In at={5.6}>
        <path d="M 272 300 C 300 300 300 262 318 256" stroke="var(--sp-from)" strokeOpacity="0.8" strokeWidth="1.4" className="sp-flow" />
        <g className="sp-rise" style={{ animationDelay: "1.2s" }}>
          <Card x={284} y={214} w={110} h={48} hot />
          <text x="339" y="235" textAnchor="middle" className="sp-figure" fill="#fff" fontSize={fit(dest.big, 94, 18)}>{dest.big}</text>
          <text x="339" y="251" textAnchor="middle" fill={`${W}0.9)`} fontSize="9">{dest.sub}</text>
        </g>
      </In>
    </>
  );
}

function ChatScene({ time, header, msgs, note, result, left, ring, dest }: ChatProps) {
  const y1 = 100;
  const y2 = y1 + bubbleH(msgs[0]) + 6;
  const yNote = y2 + bubbleH(msgs[1]) + 12;
  const y3 = yNote + 8;
  return (
    <Frame>
      <circle cx="200" cy="200" r="190" fill="url(#ab-glow)" opacity="0.6" />

      <PhoneShell time={time} header={header} />

      <g transform="rotate(-5 200 195)">
        <In at={1}>
          <Bubble x={129} y={y1} w={124} lines={msgs[0].lines} />
        </In>
        <In at={2.4}>
          <Bubble x={141} y={y2} w={124} lines={msgs[1].lines} mine />
          <text x="143" y={yNote} fill="var(--sp-from)" fontSize="9.5" fontWeight="700">{note}</text>
        </In>
        <In at={3.6}>
          <Bubble x={129} y={y3} w={112} lines={msgs[2].lines} />
        </In>
        <In at={4.8}>
          <rect x="129" y="250" width="136" height="74" rx="14" fill="url(#ab-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.6" />
          <text x="139" y="268" {...LABEL} fontSize="10">{result.title}</text>
          {result.rows.map((t, i) => (
            <g key={t}>
              <Check x={140} y={281 + i * 16} />
              <text x="153" y={286 + i * 16} fill="#fff" fontSize="9.5">{t}</text>
            </g>
          ))}
        </In>
      </g>

      <PhoneSides left={left} ring={ring} dest={dest} />
    </Frame>
  );
}

/** Объёмное ядро в центре: слева четыре входа (до 9 знаков), справа три
 *  источника знаний (до 11), внизу — собранный результат и куда он уходит. */
type HubProps = {
  inputs: [string, string, string, string];
  knowsLabel: string;
  knows: [string, string, string];
  core?: string;
  caption: string;
  outTitle: string;
  outRows: [string, string, string, string];
  dest: { big: string; sub: string };
};

function HubScene({ inputs, knowsLabel, knows, core = "AI", caption, outTitle, outRows, dest }: HubProps) {
  return (
    <Frame>
      <circle cx="200" cy="160" r="150" fill="url(#ab-glow)" opacity="0.75" />

      {inputs.map((c, i) => (
        <In key={c} at={0.3 + i * 0.4}>
          <Card x={12} y={30 + i * 48} w={104} h={38} r={12} />
          <circle cx="31" cy={49 + i * 48} r="8" fill="url(#ab-ramp)" opacity="0.9" />
          <text x="31" y={52.5 + i * 48} textAnchor="middle" fill={INK} fontSize="9" fontWeight="700">{c[0]}</text>
          <text x="45" y={53 + i * 48} fill="#fff" fontSize="10" fontWeight="700">{c}</text>
          <path d={`M 118 ${49 + i * 48} C 140 ${49 + i * 48} 138 160 158 160`} stroke="var(--sp-from)" strokeOpacity="0.7" strokeWidth="1.3" className="sp-flow" style={{ animationDelay: `${i * 0.35}s` }} />
        </In>
      ))}

      <In at={1.2}>
        <text x="390" y="24" textAnchor="end" {...LABEL}>{knowsLabel}</text>
      </In>
      {knows.map((k, i) => (
        <In key={k} at={1.5 + i * 0.4}>
          <Card x={280} y={34 + i * 42} w={110} h={34} r={10} />
          <rect x="292" y={45 + i * 42} width="12" height="12" rx="3" fill="url(#ab-ramp)" />
          <text x="312" y={55 + i * 42} fill="#fff" fontSize="10" fontWeight="700">{k}</text>
          <path d={`M 278 ${51 + i * 42} C 262 ${51 + i * 42} 266 160 244 160`} stroke="var(--sp-to)" strokeOpacity="0.7" strokeWidth="1.3" className="sp-flow" style={{ animationDelay: `${0.5 + i * 0.35}s` }} />
        </In>
      ))}

      <In at={0}>
        <circle cx="200" cy="160" r="66" stroke="var(--sp-from)" strokeOpacity="0.35" strokeDasharray="3 7" className="sp-spin" style={{ transformOrigin: "200px 160px" }} />
        <circle cx="200" cy="160" r="50" stroke="url(#ab-ramp)" strokeOpacity="0.6" strokeWidth="1.5" />
        <rect x="162" y="122" width="76" height="76" rx="22" fill="url(#ab-orb)" className="sp-pulse" />
        <text x="200" y={core.length > 2 ? 167 : 170} textAnchor="middle" className="sp-figure" fill={INK} fontSize={core.length > 2 ? 20 : 28}>{core}</text>
      </In>
      <In at={0.6}>
        <text x="200" y="246" textAnchor="middle" {...LABEL}>{caption}</text>
      </In>

      <In at={3.2}>
        <path d="M 200 252 V 272" stroke="var(--sp-from)" strokeWidth="1.4" className="sp-flow" />
        <Card x={12} y={274} w={254} h={90} hot />
        <text x="26" y="295" {...LABEL}>{outTitle}</text>
        {outRows.map((f, i) => (
          <g key={f}>
            <Check x={27 + (i % 2) * 118} y={313 + Math.floor(i / 2) * 22} />
            <text x={41 + (i % 2) * 118} y={318 + Math.floor(i / 2) * 22} fill="#fff" fontSize="10.5">{f}</text>
          </g>
        ))}
      </In>
      <In at={4.2}>
        <path d="M 268 319 H 288" stroke="var(--sp-from)" strokeWidth="1.4" className="sp-flow" />
        <g className="sp-rise">
          <Card x={288} y={286} w={102} h={66} r={16} />
          <text x="339" y="317" textAnchor="middle" className="sp-figure" fill="url(#ab-ramp-x)" fontSize={fit(dest.big, 80, 24)}>{dest.big}</text>
          <text x="339" y="336" textAnchor="middle" fill={`${W}0.9)`} fontSize="9">{dest.sub}</text>
        </g>
      </In>
    </Frame>
  );
}

/** Чат идёт до границы (флажок-причина), дальше подключается человек и
 *  видит всю переписку; внизу — полоса пилота/доработки с тремя метриками. */
type GateProps = {
  title: string;
  msgs: [Msg, Msg, Msg];
  flag: string;
  gateLabel: string;
  reply: { lines: [string, string]; letter: string; note: string };
  side: { title: string; sub: string; check: string };
  bottom: { label: string; metrics: [string, string, string] };
};

function GateScene({ title, msgs, flag, gateLabel, reply, side, bottom }: GateProps) {
  // Ширина заголовка — замер в браузере: ≈8.8 единицы на знак при кегле 11.
  const barX = Math.round(40 + bottom.label.length * 8.8);
  return (
    <Frame>
      <circle cx="150" cy="150" r="170" fill="url(#ab-glow)" opacity="0.5" />

      <In at={0}>
        <Card x={12} y={14} w={236} h={272} r={20} />
        <circle cx="30" cy="36" r="4" fill="var(--sp-from)" className="sp-pulse" />
        <text x="40" y="40" fill="#fff" fontSize="10.5" fontWeight="700">{title}</text>
        <path d="M 22 52 H 238" stroke={`${W}0.1)`} />
      </In>
      <In at={0.9}>
        <Bubble x={22} y={62} w={130} lines={msgs[0].lines} />
      </In>
      <In at={1.8}>
        <Bubble x={98} y={94} w={140} lines={msgs[1].lines} mine />
      </In>
      <In at={2.8}>
        <Bubble x={22} y={140} w={130} lines={msgs[2].lines} />
        <rect x="158" y="146" width="56" height="18" rx="9" fill={WARN} fillOpacity="0.18" stroke={WARN} strokeOpacity="0.8" className="sp-blink" />
        <text x="186" y="158.5" textAnchor="middle" fill={WARN} fontSize="9" fontWeight="700">{flag}</text>
      </In>
      <In at={3.6}>
        <path d="M 22 184 H 238" stroke={WARN} strokeWidth="1.6" strokeDasharray="6 5" className="sp-flow" />
        <rect x="56" y="176" width="148" height="16" rx="8" fill="#0d100e" />
        <text x="130" y="187.5" textAnchor="middle" fill={WARN} fontSize="9" fontWeight="700">{gateLabel}</text>
      </In>
      <In at={4.6}>
        <Bubble x={60} y={200} w={178} lines={reply.lines} mine tone="#fff" />
        <text x="62" y="253" fill={`${W}0.85)`} fontSize="9">{reply.note}</text>
        <circle cx="38" cy="219" r="12" fill="url(#ab-orb)" />
        <text x="38" y="223" textAnchor="middle" fill={INK} fontSize="10" fontWeight="700">{reply.letter}</text>
      </In>

      <In at={5.2}>
        <path d="M 240 190 C 256 190 252 120 266 116" stroke={WARN} strokeOpacity="0.8" strokeWidth="1.3" className="sp-flow" />
        <g className="sp-rise">
          <g transform="rotate(4 326 130)">
            <Card x={264} y={46} w={124} h={170} r={18} />
            <circle cx="326" cy="86" r="22" fill="url(#ab-orb)" />
            <text x="326" y="92" textAnchor="middle" className="sp-figure" fill={INK} fontSize="20">{reply.letter}</text>
            <text x="326" y="126" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="700">{side.title}</text>
            <text x="326" y="140" textAnchor="middle" fill={`${W}0.85)`} fontSize="9">{side.sub}</text>
            {[0, 1, 2].map((i) => (
              <rect key={i} x={278} y={154 + i * 11} width={96 - i * 18} height="6" rx="3" fill={`${W}0.18)`} />
            ))}
            <Check x={278} y={196} />
            <text x="292" y="201" fill="var(--sp-from)" fontSize="9" fontWeight="700">{side.check}</text>
          </g>
        </g>
      </In>

      <In at={1.4}>
        <Card x={12} y={298} w={376} h={70} r={16} />
        <text x="26" y="318" {...LABEL}>{bottom.label}</text>
        <rect x={barX} y="310" width={374 - barX} height="8" rx="4" fill={`${W}0.1)`} />
        <rect x={barX} y="310" width={374 - barX} height="8" rx="4" fill="url(#ab-ramp-x)" opacity="0.85" />
        <g className="sp-scan" style={{ "--scan": `${366 - barX - 8}px` } as React.CSSProperties}>
          <circle cx={barX + 4} cy="314" r="6" fill="#fff" />
        </g>
        {bottom.metrics.map((m, i) => (
          <g key={m}>
            <circle cx={30 + i * 124} cy="345" r="3.5" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
            <text x={39 + i * 124} y="348.5" fill="#fff" fontSize="9.5">{m}</text>
          </g>
        ))}
      </In>
    </Frame>
  );
}

/** Картинка-исходник внутри карточки: фото товара, ролик, письмо или звук. */
function SourceArt({ kind }: { kind: "photo" | "video" | "mail" | "audio" }) {
  if (kind === "photo")
    return (
      <>
        <rect x="26" y="62" width="110" height="112" rx="12" fill="url(#ab-ramp)" fillOpacity="0.22" />
        <ellipse cx="81" cy="160" rx="30" ry="6" fill="#000" opacity="0.5" />
        <rect x="66" y="96" width="30" height="62" rx="9" fill="url(#ab-orb)" />
        <rect x="73" y="84" width="16" height="14" rx="3" fill={`${W}0.85)`} />
      </>
    );
  if (kind === "video")
    return (
      <>
        <rect x="26" y="62" width="110" height="112" rx="12" fill="url(#ab-ramp)" fillOpacity="0.22" />
        <circle cx="81" cy="112" r="24" fill="url(#ab-orb)" />
        <path d="M 75 101 L 92 112 L 75 123 Z" fill={INK} />
        <rect x="36" y="158" width="90" height="4" rx="2" fill={`${W}0.2)`} />
        <rect x="36" y="158" width="40" height="4" rx="2" fill="var(--sp-from)" />
      </>
    );
  if (kind === "mail")
    return (
      <>
        <rect x="26" y="62" width="110" height="112" rx="12" fill="url(#ab-ramp)" fillOpacity="0.22" />
        <rect x="42" y="86" width="78" height="56" rx="8" fill="url(#ab-orb)" />
        <path d="M 44 90 L 81 118 L 118 90" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        {[0, 1].map((i) => (
          <rect key={i} x="42" y={152 + i * 9} width={78 - i * 26} height="4" rx="2" fill={`${W}0.3)`} />
        ))}
      </>
    );
  return (
    <>
      <rect x="26" y="62" width="110" height="112" rx="12" fill="url(#ab-ramp)" fillOpacity="0.22" />
      {[14, 28, 44, 22, 52, 34, 18, 40, 26, 12].map((h, i) => (
        <rect key={i} x={38 + i * 9} y={118 - h / 2} width="5" height={h} rx="2.5" fill="url(#ab-ramp)" className="sp-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </>
  );
}

/** Один исходник слева → веер из пяти версий справа (подписи до 13 знаков)
 *  и крупный счётчик внизу. */
type FanProps = {
  caption: string;
  src: { title: string; sub: string; kind: "photo" | "video" | "mail" | "audio" };
  variants: [string, string, string, string, string];
  counter: string;
  counterSub: [string, string];
};

function FanScene({ caption, src, variants, counter, counterSub }: FanProps) {
  const dx = [0, 22, 34, 22, 0];
  const rot = [-5, -2.5, 0, 2.5, 5];
  return (
    <Frame>
      <circle cx="140" cy="170" r="170" fill="url(#ab-glow)" opacity="0.6" />

      <In at={0}>
        <text x="16" y="28" {...LABEL}>{caption}</text>
      </In>
      <In at={0.3}>
        <g className="sp-rise">
          <Card x={16} y={50} w={130} h={186} r={18} hot />
          <SourceArt kind={src.kind} />
          <text x="28" y="200" fill="#fff" fontSize="11" fontWeight="700">{src.title}</text>
          <text x="28" y="216" fill={`${W}0.85)`} fontSize="9">{src.sub}</text>
        </g>
      </In>

      {variants.map((v, i) => {
        const x = 212 + dx[i];
        const y = 22 + i * 68;
        return (
          <In key={v} at={1.2 + i * 0.45}>
            <path d={`M 148 143 C 176 143 180 ${y + 30} ${x - 2} ${y + 30}`} stroke="var(--sp-from)" strokeOpacity="0.55" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
            <g transform={`rotate(${rot[i]} ${x + 70} ${y + 30})`}>
              <Card x={x} y={y} w={146} h={60} r={14} />
              <rect x={x + 10} y={y + 10} width="40" height="40" rx="9" fill="url(#ab-ramp)" fillOpacity={0.35 + i * 0.12} />
              <circle cx={x + 30} cy={y + 30} r="9" fill="url(#ab-orb)" />
              <text x={x + 60} y={y + 27} fill="#fff" fontSize="10.5" fontWeight="700">{v}</text>
              <text x={x + 60} y={y + 42} fill={`${W}0.75)`} fontSize="9">{`версия ${String(i + 1).padStart(2, "0")}`}</text>
            </g>
          </In>
        );
      })}

      <In at={3.8}>
        <Card x={16} y={258} w={180} h={96} r={18} />
        <rect x="30" y="278" width="56" height="56" rx="17" fill="url(#ab-orb)" className="sp-pulse" />
        <text x="58" y="313" textAnchor="middle" className="sp-figure" fill={INK} fontSize={fit(counter, 46, 20)}>{counter}</text>
        {counterSub.map((t, i) => (
          <text key={t} x="98" y={302 + i * 14} fill="#fff" fontSize="9.5" fontWeight={i === 0 ? "700" : undefined}>{t}</text>
        ))}
      </In>
    </Frame>
  );
}

/** Панель-график: линия (up/down/dip) с отметкой события либо сравнение
 *  полосами; под ней три KPI (значение до 8 знаков, подпись до 18) и
 *  строка-вывод. */
type DashProps = {
  title: string;
  series?: "up" | "down" | "dip";
  marker?: string;
  bars?: { label: string; w: number; text: string }[];
  kpis: [{ v: string; s: string }, { v: string; s: string }, { v: string; s: string }];
  footer: { text: string };
};

const SERIES = {
  up: { d: "M 26 176 C 80 170 110 150 150 142 S 230 110 270 96 S 340 70 374 62", at: [270, 96] },
  down: { d: "M 26 70 C 80 76 110 96 150 104 S 230 140 270 150 S 340 168 374 172", at: [150, 104] },
  dip: { d: "M 26 110 C 70 104 110 100 150 106 S 200 170 230 172 S 300 118 374 112", at: [230, 172] },
} as const;

function DashScene({ title, series = "up", marker, bars, kpis, footer }: DashProps) {
  const s = SERIES[series];
  const [mx, my] = s.at;
  const tipW = marker ? Math.round(marker.length * 5.6 + 24) : 0;
  const tipX = Math.min(Math.max(mx - tipW / 2, 20), 380 - tipW);
  const tipY = my > 120 ? my - 44 : my + 16;
  return (
    <Frame>
      <circle cx="200" cy="130" r="180" fill="url(#ab-glow)" opacity="0.55" />

      <In at={0}>
        <Card x={12} y={14} w={376} h={206} r={20} />
        <circle cx="30" cy="36" r="4" fill="var(--sp-from)" className="sp-pulse" />
        <text x="40" y="40" {...LABEL}>{title}</text>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M 26 ${70 + i * 40} H 374`} stroke={`${W}0.06)`} />
        ))}
      </In>

      {bars ? (
        bars.map((b, i) => (
          <In key={b.label} at={0.8 + i * 0.6}>
            <text x="26" y={84 + i * 56} fill="#fff" fontSize="10.5" fontWeight="700">{b.label}</text>
            <rect x="26" y={92 + i * 56} width="300" height="20" rx="10" fill={`${W}0.07)`} />
            <rect x="26" y={92 + i * 56} width={Math.max(24, b.w * 250)} height="20" rx="10" fill="url(#ab-ramp-x)" opacity={i === 0 ? 1 : 0.55} />
            <text x={26 + Math.max(24, b.w * 250) + 10} y={106 + i * 56} fill={i === 0 ? "var(--sp-from)" : "#fff"} fontSize="11" fontWeight="700">{b.text}</text>
          </In>
        ))
      ) : (
        <In at={0.6}>
          <path d={`${s.d} L 374 206 L 26 206 Z`} fill="url(#ab-glass)" opacity="0.6" />
          <path d={s.d} stroke="url(#ab-ramp-x)" strokeWidth="3" strokeLinecap="round" pathLength="1" className="sp-draw" />
          <circle cx={mx} cy={my} r="11" fill="var(--sp-from)" opacity="0.25" className="sp-pulse" />
          <circle cx={mx} cy={my} r="5" fill="#fff" />
        </In>
      )}
      {marker && !bars ? (
        <In at={2.2}>
          <g className="sp-blink">
            <rect x={tipX} y={tipY} width={tipW} height="24" rx="12" fill="#0d100e" stroke="var(--sp-from)" strokeOpacity="0.8" />
            <text x={tipX + tipW / 2} y={tipY + 15.5} textAnchor="middle" fill="var(--sp-from)" fontSize="9.5" fontWeight="700">{marker}</text>
          </g>
        </In>
      ) : null}

      {kpis.map((k, i) => (
        <In key={k.s} at={2.8 + i * 0.4}>
          <g className="sp-rise" style={{ animationDelay: `${i * 0.5}s` }}>
            <Card x={12 + i * 128} y={232} w={120} h={62} r={14} hot={i === 0} />
            <text x={24 + i * 128} y="260" className="sp-figure" fill={i === 0 ? "#fff" : "url(#ab-ramp-x)"} fontSize={fit(k.v, 96, 21, 0.8)}>{k.v}</text>
            <text x={24 + i * 128} y="280" fill={`${W}0.9)`} fontSize="9">{k.s}</text>
          </g>
        </In>
      ))}

      <In at={4.4}>
        <Card x={12} y={306} w={376} h={58} r={16} />
        <Check x={28} y={334} />
        <text x="44" y="339" fill="#fff" fontSize="10.5" fontWeight="700">{footer.text}</text>
      </In>
    </Frame>
  );
}

/** Поток слева (до 15 знаков) → объёмный фильтр → три дорожки справа
 *  (название до 12 знаков, значение до 9) → вывод внизу. */
type SortProps = {
  inLabel: string;
  items: [string, string, string, string, string];
  core?: string;
  coreLabel: string;
  lanes: [Lane, Lane, Lane];
  footer: string;
};
type Lane = { title: string; value: string; tone: "ok" | "warn" | "mute" };

function SortScene({ inLabel, items, core = "AI", coreLabel, lanes, footer }: SortProps) {
  const toneFill = { ok: "var(--sp-from)", warn: WARN, mute: `${W}0.45)` } as const;
  return (
    <Frame>
      <circle cx="200" cy="160" r="160" fill="url(#ab-glow)" opacity="0.65" />

      <In at={0}>
        <text x="14" y="26" {...LABEL}>{inLabel}</text>
      </In>
      {items.map((t, i) => (
        <In key={t} at={0.3 + i * 0.35}>
          <g className="sp-glide" style={{ animationDelay: `${i * 0.4}s` }}>
            <Card x={12} y={38 + i * 46} w={124} h={36} r={11} />
            <circle cx="28" cy={56 + i * 46} r="4" fill={i % 2 ? `${W}0.5)` : "var(--sp-from)"} />
            <text x="38" y={59.5 + i * 46} fill="#fff" fontSize="9.5">{t}</text>
          </g>
          <path d={`M 138 ${56 + i * 46} C 156 ${56 + i * 46} 150 156 166 156`} stroke="var(--sp-from)" strokeOpacity="0.55" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}

      <In at={0}>
        <circle cx="206" cy="156" r="56" stroke="var(--sp-from)" strokeOpacity="0.35" strokeDasharray="3 7" className="sp-spin" style={{ transformOrigin: "206px 156px" }} />
        <rect x="170" y="120" width="72" height="72" rx="21" fill="url(#ab-orb)" className="sp-pulse" />
        <text x="206" y={core.length > 2 ? 162 : 165} textAnchor="middle" className="sp-figure" fill={INK} fontSize={core.length > 2 ? 18 : 26}>{core}</text>
        <text x="200" y="270" textAnchor="middle" {...LABEL}>{coreLabel}</text>
      </In>

      {lanes.map((l, i) => (
        <In key={l.title} at={2 + i * 0.5}>
          <path d={`M 244 156 C 258 156 256 ${56 + i * 80} 272 ${56 + i * 80}`} stroke={toneFill[l.tone]} strokeOpacity="0.8" strokeWidth="1.3" className="sp-flow" style={{ animationDelay: `${i * 0.35}s` }} />
          <Card x={274} y={22 + i * 80} w={116} h={68} r={14} hot={l.tone === "ok"} />
          <circle cx="290" cy={42 + i * 80} r="4.5" fill={toneFill[l.tone]} className={l.tone === "warn" ? "sp-blink" : undefined} />
          <text x="300" y={45.5 + i * 80} fill="#fff" fontSize="10" fontWeight="700">{l.title}</text>
          <text x="286" y={74 + i * 80} className="sp-figure" fill={l.tone === "mute" ? `${W}0.6)` : toneFill[l.tone]} fontSize={fit(l.value, 92, 18, 0.75)}>{l.value}</text>
        </In>
      ))}

      <In at={4}>
        <Card x={12} y={284} w={378} h={80} r={16} />
        <Check x={28} y={318} />
        <text x="44" y="323" fill="#fff" fontSize="10.5" fontWeight="700">{footer}</text>
        <rect x="28" y="336" width="346" height="6" rx="3" fill={`${W}0.08)`} />
        <rect x="28" y="336" width="346" height="6" rx="3" fill="url(#ab-ramp-x)" opacity="0.8" />
      </In>
    </Frame>
  );
}

/** Телефон с публикацией соцсети — герой сцен /smm. kind задаёт, что
 *  на экране: Reels (плей и прогресс), история (сегменты и опрос),
 *  карусель (слайды и точки) или рекламный пост (метка и кнопка).
 *  overlay — до 16 знаков, stats — три метрики до 11 знаков. */
type FeedProps = Sides & {
  handle: string;
  kind: "reel" | "story" | "carousel" | "post";
  overlay?: string;
  options?: [string, string];
  cta?: string;
  stats: [string, string, string];
};

function FeedScene({ handle, kind, overlay, options, cta, stats, left, ring, dest }: FeedProps) {
  return (
    <Frame>
      <circle cx="200" cy="200" r="190" fill="url(#ab-glow)" opacity="0.6" />
      <PhoneShell time="12:00" header={handle} />

      <g transform="rotate(-5 200 195)">
        <In at={1}>
          <rect x="129" y="96" width="136" height="136" rx="14" fill="url(#ab-orb)" opacity="0.4" />
          <rect x="129" y="96" width="136" height="136" rx="14" stroke={`${W}0.16)`} />
          {kind === "reel" ? (
            <>
              <circle cx="197" cy="158" r="20" fill={`${W}0.9)`} className="sp-pulse" />
              <path d="M 191 148 L 206 158 L 191 168 Z" fill={INK} />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx="252" cy={176 + i * 16} r="4.5" fill={`${W}0.75)`} />
              ))}
              <rect x="139" y="222" width="116" height="3" rx="1.5" fill={`${W}0.25)`} />
              <rect x="139" y="222" width="116" height="3" rx="1.5" fill="#fff" pathLength="1" className="sp-draw" />
            </>
          ) : null}
          {kind === "story" ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={137 + i * 31} y="102" width="27" height="3" rx="1.5" fill={i < 2 ? "#fff" : `${W}0.3)`} />
              ))}
              <rect x="141" y="136" width="112" height="72" rx="12" fill="#0d100e" opacity="0.9" />
              <text x="197" y="154" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">{overlay}</text>
              {(options ?? ["Да", "Нет"]).map((o, i) => (
                <g key={o}>
                  <rect x="149" y={163 + i * 20} width="96" height="16" rx="8" fill={i === 0 ? "url(#ab-ramp-x)" : `${W}0.12)`} />
                  <text x="197" y={174.5 + i * 20} textAnchor="middle" fill={i === 0 ? INK : "#fff"} fontSize="9" fontWeight="700">{o}</text>
                </g>
              ))}
            </>
          ) : null}
          {kind === "carousel" ? (
            <>
              <rect x="226" y="104" width="30" height="15" rx="7.5" fill="#0d100e" opacity="0.8" />
              <text x="241" y="114.5" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="700">1/8</text>
              <text x="141" y="170" fill="#fff" fontSize="12" fontWeight="700">{overlay}</text>
              <rect x="141" y="180" width="80" height="5" rx="2.5" fill={`${W}0.5)`} />
              <rect x="141" y="190" width="56" height="5" rx="2.5" fill={`${W}0.35)`} />
              {[0, 1, 2, 3, 4].map((i) => (
                <circle key={i} cx={181 + i * 8} cy="240" r="2.4" fill={i === 0 ? "var(--sp-from)" : `${W}0.3)`} />
              ))}
            </>
          ) : null}
          {kind === "post" ? (
            <>
              <rect x="137" y="104" width="52" height="15" rx="7.5" fill="#0d100e" opacity="0.8" />
              <text x="163" y="114.5" textAnchor="middle" fill={`${W}0.9)`} fontSize="8.5" fontWeight="700">реклама</text>
              <text x="141" y="168" fill="#fff" fontSize="11" fontWeight="700">{overlay}</text>
              <rect x="141" y="196" width="112" height="24" rx="12" fill="url(#ab-ramp-x)" className="sp-pulse" />
              <text x="197" y="211.5" textAnchor="middle" fill={INK} fontSize="9.5" fontWeight="700">{cta}</text>
            </>
          ) : null}
        </In>

        <In at={2.6}>
          <rect x="129" y="250" width="136" height="74" rx="14" fill="url(#ab-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.6" />
          {stats.map((t, i) => (
            <g key={t}>
              <text x="139" y={268 + i * 19} fill="#fff" fontSize="9.5">{t}</text>
              <rect x="208" y={262 + i * 19} width="48" height="6" rx="3" fill={`${W}0.12)`} />
              <rect x="208" y={262 + i * 19} width={48 - i * 10} height="6" rx="3" fill="url(#ab-ramp-x)" />
            </g>
          ))}
        </In>
      </g>

      <PhoneSides left={left} ring={ring} dest={dest} />
    </Frame>
  );
}

/** Окно браузера — герой сцен /sites: страница собирается блок за
 *  блоком. Заголовок — 2 строки до 15 знаков, секции до 18 знаков;
 *  вокруг те же карточки, что у ChatScene. */
type BrowserProps = {
  url: string;
  hero: [string, string];
  sub: string;
  btn: string;
  sections: [string, string, string];
  left: { big: string; sub: string };
  ring: { value: string; unit: string; sub: string };
  dest: { big: string; sub: string };
};

function BrowserScene({ url, hero, sub, btn, sections, left, ring, dest }: BrowserProps) {
  return (
    <Frame>
      <circle cx="180" cy="170" r="185" fill="url(#ab-glow)" opacity="0.6" />

      <In at={0}>
        <rect x="42" y="30" width="276" height="270" rx="18" fill="#000" opacity="0.3" filter="url(#ab-shadow)" />
        <rect x="36" y="22" width="276" height="270" rx="18" fill="url(#ab-screen)" stroke="url(#ab-ramp)" strokeWidth="1.4" />
        <path d="M 36 52 H 312" stroke={`${W}0.1)`} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={52 + i * 12} cy="37" r="3.6" fill={i === 0 ? "var(--sp-from)" : `${W}0.25)`} />
        ))}
        <rect x="96" y="28" width="150" height="18" rx="9" fill={`${W}0.07)`} />
        <text x="106" y="40.5" fill={`${W}0.85)`} fontSize="9">{url}</text>
      </In>

      <In at={0.8}>
        <text x="52" y="80" fill="#fff" fontSize="13" fontWeight="700">{hero[0]}</text>
        <text x="52" y="97" fill="url(#ab-ramp-x)" fontSize="13" fontWeight="700">{hero[1]}</text>
        <text x="52" y="114" fill={`${W}0.8)`} fontSize="8.6">{sub}</text>
        <rect x="52" y="124" width="104" height="24" rx="12" fill="url(#ab-ramp-x)" className="sp-pulse" />
        <text x="104" y="139.5" textAnchor="middle" fill={INK} fontSize="9.5" fontWeight="700">{btn}</text>
      </In>
      <In at={1.3}>
        <rect x="200" y="64" width="98" height="84" rx="12" fill="url(#ab-orb)" opacity="0.35" />
        <circle cx="228" cy="90" r="9" fill="#fff" opacity="0.8" />
        <path d="M 200 140 L 232 108 L 254 128 L 270 114 L 298 140 Z" fill="url(#ab-orb)" />
      </In>

      {sections.map((t, i) => (
        <In key={t} at={2 + i * 0.6}>
          <rect x="50" y={164 + i * 34} width="248" height="26" rx="9" fill={`${W}0.05)`} stroke={i === 2 ? "var(--sp-from)" : `${W}0.12)`} strokeOpacity={i === 2 ? 0.7 : 1} />
          <Check x={60} y={176 + i * 34} />
          <text x="74" y={181 + i * 34} fill="#fff" fontSize="10" fontWeight="700">{t}</text>
          <rect x="222" y={174 + i * 34} width={60 - i * 12} height="6" rx="3" fill={`${W}0.16)`} />
        </In>
      ))}

      <In at={0.6}>
        <g className="sp-rise">
          <g transform="rotate(-5 70 300)">
            <Card x={8} y={262} w={132} h={70} />
            <circle cx="32" cy="288" r="7" fill="var(--sp-from)" className="sp-pulse" />
            <text x="46" y="294" className="sp-figure" fill="#fff" fontSize={fit(left.big, 86, 20)}>{left.big}</text>
            <text x="21" y="318" fill={`${W}0.9)`} fontSize="9.5">{left.sub}</text>
          </g>
        </g>
      </In>

      <In at={1.6}>
        <g className="sp-glide" style={{ animationDelay: "0.8s" }}>
          <Card x={296} y={60} w={94} h={112} />
          <circle cx="343" cy="104" r="26" stroke={`${W}0.12)`} strokeWidth="6" />
          <circle cx="343" cy="104" r="26" stroke="url(#ab-ramp)" strokeWidth="6" strokeLinecap="round" pathLength="1" className="sp-draw" transform="rotate(-90 343 104)" />
          <text x="343" y="111" textAnchor="middle" className="sp-figure" fill="#fff" fontSize={fit(ring.value, 40, 22)}>{ring.value}</text>
          <text x="343" y="147" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">{ring.unit}</text>
          <text x="343" y="161" textAnchor="middle" fill={`${W}0.85)`} fontSize="9">{ring.sub}</text>
        </g>
      </In>

      <In at={4}>
        <path d="M 300 244 C 320 244 330 280 336 300" stroke="var(--sp-from)" strokeOpacity="0.8" strokeWidth="1.4" className="sp-flow" />
        <g className="sp-rise" style={{ animationDelay: "1.2s" }}>
          <Card x={280} y={302} w={110} h={50} hot />
          <text x="335" y="324" textAnchor="middle" className="sp-figure" fill="#fff" fontSize={fit(dest.big, 94, 18)}>{dest.big}</text>
          <text x="335" y="340" textAnchor="middle" fill={`${W}0.9)`} fontSize="9">{dest.sub}</text>
        </g>
      </In>
    </Frame>
  );
}

/* ═══ Сцены по страницам ═══════════════════════════════════════════
   Порядок в массиве = порядок окон на странице (sceneBreaks в данных). */

const scene = <P extends object>(C: React.ComponentType<P>, p: P) => {
  const S = () => <C {...p} />;
  return S;
};

/** Сцены по slug инструмента, по порядку блоков-перебивок на странице. */
export const AI_BREAK_SCENES: Record<string, (React.ComponentType | undefined)[]> = {
  agent: [
    scene(ChatScene, {
      time: "02:14",
      header: "AI-агент · онлайн",
      msgs: [{ lines: ["Сколько стоит", "доставка в Казань?"] }, { lines: ["2–3 дня, 450 ₽.", "Оформить заявку?"], mine: true }, { lines: ["Да, оформляйте"] }],
      note: "ответ сразу · 02:14",
      result: { title: "ЗАЯВКА ГОТОВА", rows: ["Казань, доставка", "Контакт получен"] },
      left: { big: "НОЧЬ", sub: "менеджер спит", icon: "moon" },
      ring: { value: "5", unit: "минут", sub: "лид ещё тёплый" },
      dest: { big: "CRM", sub: "менеджеру утром" },
    }),
    scene(HubScene, {
      inputs: ["Telegram", "WhatsApp", "Сайт", "Директ"],
      knowsLabel: "ВАШИ ДАННЫЕ",
      knows: ["Прайс", "Каталог", "Регламенты"],
      caption: "ОДИН АГЕНТ · ОДИН ОТВЕТ",
      outTitle: "ЗАЯВКА ДЛЯ МЕНЕДЖЕРА",
      outRows: ["Товар", "Срок", "Бюджет", "Контакт"],
      dest: { big: "CRM", sub: "туда же, где все" },
    }),
    scene(GateScene, {
      title: "Диалог с клиентом",
      msgs: [{ lines: ["Есть размер 42?"] }, { lines: ["Да, в двух цветах.", "Показать фото?"], mine: true }, { lines: ["А скидку дадите?"] }],
      flag: "торг",
      gateLabel: "ГРАНИЦА АГЕНТА",
      reply: { lines: ["Здравствуйте, я Анна.", "Посчитаю скидку на оба"], letter: "А", note: "менеджер в диалоге" },
      side: { title: "Менеджер", sub: "подключился", check: "вся переписка" },
      bottom: { label: "ПИЛОТ · 2 НЕДЕЛИ", metrics: ["закрытые обращения", "точность ответов", "зовёт человека"] },
    }),
  ],

  content: [
    scene(FanScene, {
      caption: "ОДНА СЪЁМКА ТОВАРА",
      src: { title: "Фото товара", sub: "хоть с телефона", kind: "photo" },
      variants: ["Белый фон", "Интерьер", "Сезонный", "Инфографика", "Лайфстайл"],
      counter: "×10",
      counterSub: ["вариантов на том", "же бюджете"],
    }),
    scene(HubScene, {
      inputs: ["Фото", "Описание", "Референсы", "Артикулы"],
      knowsLabel: "ПРАВИЛА БРЕНДА",
      knows: ["Шаблон", "Цвета", "Требования"],
      caption: "ПАРТИЯ ПО ОДНИМ ПРАВИЛАМ",
      outTitle: "ГОТОВАЯ ПАРТИЯ",
      outRows: ["Карточки", "Тексты", "Форматы", "Версии"],
      dest: { big: "3 ДНЯ", sub: "до первой партии" },
    }),
    scene(SortScene, {
      inLabel: "СГЕНЕРИРОВАНО",
      items: ["Вариант 01", "Вариант 02", "Вариант 03", "Вариант 04", "Вариант 05"],
      core: "ГЛАЗ",
      coreLabel: "ОТБОР ДЕЛАЕТ ЧЕЛОВЕК",
      lanes: [
        { title: "В публикацию", value: "лучшие", tone: "ok" },
        { title: "На доработку", value: "правки", tone: "warn" },
        { title: "В корзину", value: "брак", tone: "mute" },
      ],
      footer: "Ни одна картинка не уходит к вам без просмотра",
    }),
  ],

  video: [
    scene(FanScene, {
      caption: "ОДНА ИДЕЯ РОЛИКА",
      src: { title: "Идея ролика", sub: "и ваш продукт", kind: "video" },
      variants: ["Боль клиента", "От 1-го лица", "Демо продукта", "Отзыв", "Оффер"],
      counter: "×10",
      counterSub: ["заходов вместо", "одной ставки"],
    }),
    scene(DashScene, {
      title: "CTR РЕКЛАМНЫХ РОЛИКОВ",
      bars: [
        { label: "AI-креатив", w: 0.9, text: "0,76%" },
        { label: "Обычный ролик", w: 0.77, text: "0,65%" },
      ],
      kpis: [
        { v: "0,76%", s: "CTR AI-креативов" },
        { v: "×4", s: "подача от 1-го лица" },
        { v: "−50%", s: "цена клика" },
      ],
      footer: { text: "Новый ролик стоит как правка, а не как съёмка" },
    }),
    scene(HubScene, {
      inputs: ["Сценарий", "Картинка", "Аватар", "Голос"],
      knowsLabel: "ВАШ БРЕНД",
      knows: ["Продукт", "Персонажи", "Тон"],
      caption: "ОДИН КОНВЕЙЕР РОЛИКОВ",
      outTitle: "ЛИНЕЙКА РОЛИКОВ",
      outRows: ["9:16", "1:1", "16:9", "Субтитры"],
      dest: { big: "5 ДНЕЙ", sub: "до 1-й линейки" },
    }),
  ],

  voice: [
    scene(FanScene, {
      caption: "ОДИН РОЛИК",
      src: { title: "Ваш ролик", sub: "голос спикера", kind: "audio" },
      variants: ["English", "Deutsch", "Türkçe", "Español", "Português"],
      counter: "1",
      counterSub: ["голос спикера", "на всех языках"],
    }),
    scene(DashScene, {
      title: "ЦЕНА ОДНОГО ЯЗЫКА",
      bars: [
        { label: "Студийный дубляж", w: 0.8, text: "от 20 000 ₽" },
        { label: "AI-локализация", w: 0.1, text: "в 10 раз дешевле" },
      ],
      kpis: [
        { v: "×10", s: "разница в цене" },
        { v: "Часы", s: "вместо недель" },
        { v: "Голос", s: "спикера на месте" },
      ],
      footer: { text: "Озвучить можно весь архив, а не один ролик" },
    }),
    scene(HubScene, {
      inputs: ["Текст", "Перевод", "Голос", "Тайминг"],
      knowsLabel: "ВАШ МАТЕРИАЛ",
      knows: ["Глоссарий", "Тембр", "Ваш звук"],
      caption: "ДОРОЖКУ СЛУШАЕТ ЧЕЛОВЕК",
      outTitle: "ГОТОВАЯ ДОРОЖКА",
      outRows: ["Язык", "Тайминг", "Губы", "Сведение"],
      dest: { big: "РОЛИК", sub: "на новом рынке" },
    }),
  ],

  ops: [
    scene(ChatScene, {
      time: "18:40",
      header: "AI-ассистент",
      msgs: [{ lines: ["Итоги созвона", "с подрядчиком?"] }, { lines: ["3 решения, 5 задач.", "Разослать всем?"], mine: true }, { lines: ["Да, рассылай"] }],
      note: "итог сразу после встречи",
      result: { title: "ИТОГ ГОТОВ", rows: ["5 задач в работе", "Сроки стоят"] },
      left: { big: "СОЗВОН", sub: "час разговора", icon: "dot" },
      ring: { value: "1", unit: "итог", sub: "на встречу" },
      dest: { big: "ЗАДАЧИ", sub: "у исполнителей" },
    }),
    scene(HubScene, {
      inputs: ["Регламенты", "Договоры", "Почта", "Таблицы"],
      knowsLabel: "ПРАВИЛА",
      knows: ["Доступы", "Роли", "Источники"],
      caption: "ПОИСК ПО ВАШИМ ДОКУМЕНТАМ",
      outTitle: "ОТВЕТ СО ССЫЛКОЙ",
      outRows: ["Цитата", "Документ", "Дата", "Автор"],
      dest: { big: "ОТВЕТ", sub: "за секунды" },
    }),
    scene(DashScene, {
      title: "ЧАСЫ НА РУТИНУ",
      series: "down",
      marker: "пилот запущен",
      kpis: [
        { v: "1", s: "процесс на старте" },
        { v: "2 недели", s: "до результата" },
        { v: "Часы", s: "считаем до и после" },
      ],
      footer: { text: "Отчёт собирается сам, человек его только читает" },
    }),
  ],

  "chat-hub": [
    scene(ChatScene, {
      time: "23:07",
      header: "Ассистент · онлайн",
      msgs: [{ lines: ["Вы работаете", "в воскресенье?"] }, { lines: ["Да, с 10 до 20.", "Записать вас?"], mine: true }, { lines: ["Да, на 12:00"] }],
      note: "ответ за 3 секунды",
      result: { title: "ЗАПИСЬ ГОТОВА", rows: ["Вс, 12:00", "Контакт получен"] },
      left: { big: "23:07", sub: "нерабочее время", icon: "moon" },
      ring: { value: "<3", unit: "секунды", sub: "на ответ" },
      dest: { big: "ИНБОКС", sub: "одна лента бренда" },
    }),
    scene(HubScene, {
      inputs: ["Telegram", "WhatsApp", "VK", "Сайт"],
      knowsLabel: "ОБУЧЕН НА",
      knows: ["Прайсе", "FAQ", "Скриптах"],
      caption: "ВСЕ КАНАЛЫ · ОДНА ЛЕНТА",
      outTitle: "ОДИН ИНБОКС",
      outRows: ["Клиент", "История", "Канал", "Статус"],
      dest: { big: "ЛЕНТА", sub: "вся переписка" },
    }),
    scene(GateScene, {
      title: "Диалог с клиентом",
      msgs: [{ lines: ["Хочу вернуть заказ"] }, { lines: ["Понимаю. Номер", "заказа подскажете?"], mine: true }, { lines: ["Он пришёл битым!"] }],
      flag: "жалоба",
      gateLabel: "ПЕРЕДАЧА МЕНЕДЖЕРУ",
      reply: { lines: ["Здравствуйте, я Ольга.", "Решу вопрос с заменой"], letter: "О", note: "менеджер в диалоге" },
      side: { title: "Менеджер", sub: "подключился", check: "вся переписка" },
      bottom: { label: "ДОРАБОТКА · МЕСЯЦ", metrics: ["новые вопросы", "точность ответов", "передачи"] },
    }),
  ],

  comms: [
    scene(SortScene, {
      inLabel: "ВХОДЯЩИЕ",
      items: ["Спам-рассылка", "Где мой заказ?", "Дубль заявки", "Срочно: сбой", "Фишинг-ссылка"],
      coreLabel: "ФИЛЬТР ОБРАЩЕНИЙ",
      lanes: [
        { title: "Срочное", value: "наверх", tone: "warn" },
        { title: "Типовое", value: "закрыт", tone: "ok" },
        { title: "Спам и дубли", value: "в архив", tone: "mute" },
      ],
      footer: "Менеджер больше не разбирает спам вручную",
    }),
    scene(DashScene, {
      title: "ОБРАЩЕНИЯ К ЧЕЛОВЕКУ",
      series: "down",
      marker: "фильтр включён",
      kpis: [
        { v: "−47%", s: "обращений к людям" },
        { v: "98,2%", s: "точность отсева" },
        { v: "24/7", s: "без перерывов" },
      ],
      footer: { text: "Каждое решение фильтра видно и объяснимо" },
    }),
    scene(ChatScene, {
      time: "09:12",
      header: "Автоответ · онлайн",
      msgs: [{ lines: ["Как вернуть товар?"] }, { lines: ["Заявка по ссылке,", "деньги за 3–5 дней."], mine: true }, { lines: ["Спасибо!"] }],
      note: "закрыто без менеджера",
      result: { title: "ВОПРОС ЗАКРЫТ", rows: ["Типовой ответ", "Без менеджера"] },
      left: { big: "ПОТОК", sub: "с рекламы", icon: "dot" },
      ring: { value: "5", unit: "дней", sub: "до фильтра" },
      dest: { big: "ЧИСТО", sub: "в очереди" },
    }),
  ],

  crm: [
    scene(SortScene, {
      inLabel: "НОВЫЕ ЗАЯВКИ",
      items: ["Заявка с сайта", "Звонок", "Форма в VK", "Повторный", "Заявка из ТГ"],
      coreLabel: "РАЗМЕТКА ЛИДОВ",
      lanes: [
        { title: "Горячий", value: "сразу", tone: "ok" },
        { title: "Тёплый", value: "сегодня", tone: "warn" },
        { title: "Холодный", value: "прогрев", tone: "mute" },
      ],
      footer: "Заявка размечена раньше, чем её открыл менеджер",
    }),
    scene(HubScene, {
      inputs: ["Источник", "Бюджет", "Регион", "История"],
      knowsLabel: "МЕНЕДЖЕРЫ",
      knows: ["Анна", "Игорь", "Мария"],
      caption: "МАРШРУТ ЗАЯВКИ",
      outTitle: "НАЗНАЧЕНО ЛУЧШЕМУ",
      outRows: ["Профиль", "Загрузка", "Конверсия", "Регион"],
      dest: { big: "АННА", sub: "шанс выше всех" },
    }),
    scene(DashScene, {
      title: "ВЕРОЯТНОСТЬ СДЕЛКИ",
      series: "up",
      marker: "дожимать здесь",
      kpis: [
        { v: "+15…20%", s: "от приоритизации" },
        { v: "70%", s: "рутины на AI" },
        { v: "2 недели", s: "до пилота" },
      ],
      footer: { text: "Видно заранее, где стоит дожимать, а где нет" },
    }),
  ],

  personalization: [
    scene(FanScene, {
      caption: "ОДНО ПИСЬМО",
      src: { title: "Базовое письмо", sub: "ваш шаблон", kind: "mail" },
      variants: ["Новичку", "Постоянному", "Уснувшему", "VIP", "После покупки"],
      counter: "+41%",
      counterSub: ["доход от AI-", "персонализации"],
    }),
    scene(HubScene, {
      inputs: ["Реклама", "Поиск", "Соцсети", "Рассылка"],
      knowsLabel: "ДАННЫЕ",
      knows: ["Сегменты", "Поведение", "Покупки"],
      caption: "У КАЖДОГО ИСТОЧНИКА СВОЯ СТРАНИЦА",
      outTitle: "ВЕРСИЯ СТРАНИЦЫ",
      outRows: ["Заголовок", "Оффер", "Кейсы", "Кнопка"],
      dest: { big: "САЙТ", sub: "под каждого" },
    }),
    scene(DashScene, {
      title: "КОНВЕРСИЯ ВЕРСИЙ",
      bars: [
        { label: "Версия B", w: 0.85, text: "выиграла" },
        { label: "Версия A", w: 0.55, text: "база" },
      ],
      kpis: [
        { v: "A/B", s: "тест каждой версии" },
        { v: "5 дней", s: "до первой волны" },
        { v: "+41%", s: "доход рассылок" },
      ],
      footer: { text: "Раскатываем версию, которая выиграла тест" },
    }),
  ],

  analytics: [
    scene(HubScene, {
      inputs: ["Директ", "VK Ads", "CRM", "Метрика"],
      knowsLabel: "МОДЕЛЬ МЕТРИК",
      knows: ["Выручка", "Лиды", "Расходы"],
      caption: "ВСЕ КАБИНЕТЫ В ОДНОМ",
      outTitle: "ОДИН ДАШБОРД",
      outRows: ["Расходы", "Заявки", "Продажи", "ROMI"],
      dest: { big: "15 МИН", sub: "вместо трёх дней" },
    }),
    scene(DashScene, {
      title: "РАСХОДЫ И ЗАЯВКИ",
      series: "dip",
      marker: "заявки упали",
      kpis: [
        { v: "AI", s: "находит аномалии" },
        { v: "День", s: "в день события" },
        { v: "Причина", s: "объяснение рядом" },
      ],
      footer: { text: "Проблема замечена в день, когда случилась" },
    }),
    scene(ChatScene, {
      time: "Пн, 09:00",
      header: "Отчёт за неделю",
      msgs: [{ lines: ["Как прошла неделя?"] }, { lines: ["Заявки +12%,", "CPL −8%. Детали:"], mine: true }, { lines: ["Отлично, спасибо"] }],
      note: "отчёт пришёл сам",
      result: { title: "ОТЧЁТ ГОТОВ", rows: ["Все кабинеты", "Выводы и риски"] },
      left: { big: "НЕДЕЛЯ", sub: "итог в понедельник", icon: "dot" },
      ring: { value: "0", unit: "ручной сборки", sub: "отчёт сам" },
      dest: { big: "ОТЧЁТ", sub: "в мессенджер" },
    }),
  ],

  training: [
    scene(ChatScene, {
      time: "10:30",
      header: "Практика · ваш кейс",
      msgs: [{ lines: ["Сделай КП по", "шаблону клиента"] }, { lines: ["Готово: 2 версии.", "Какую доработать?"], mine: true }, { lines: ["Вторую, короче"] }],
      note: "на ваших задачах",
      result: { title: "ЕСТЬ НАВЫК", rows: ["Свой рабочий кейс", "Шаблон запроса"] },
      left: { big: "СЕССИЯ", sub: "один инструмент", icon: "dot" },
      ring: { value: "1", unit: "инструмент", sub: "за сессию" },
      dest: { big: "КЕЙСЫ", sub: "ваши, а не чужие" },
    }),
    scene(HubScene, {
      inputs: ["Аудит", "Программа", "Практика", "Контроль"],
      knowsLabel: "ВАШИ ПРОЦЕССЫ",
      knows: ["Продажи", "Маркетинг", "Документы"],
      caption: "AI В РАБОЧЕМ ДНЕ",
      outTitle: "КОМАНДА УМЕЕТ",
      outRows: ["Запросы", "Шаблоны", "Проверку", "Границы"],
      dest: { big: "РУТИНА", sub: "AI каждый день" },
    }),
    scene(DashScene, {
      title: "AI В РАБОТЕ КОМАНДЫ",
      series: "up",
      marker: "через месяц",
      kpis: [
        { v: "1 мес", s: "контроль внедрения" },
        { v: "41%", s: "видят эффект" },
        { v: "Факт", s: "а не ощущения" },
      ],
      footer: { text: "Видно по факту, изменилось ли поведение команды" },
    }),
  ],

  /* ── Сайты (/sites/[format]) ─────────────────────────────────── */

  landing: [
    scene(BrowserScene, {
      url: "vash-offer.ru",
      hero: ["Скидка 20%", "на первый заказ"],
      sub: "Только до конца месяца",
      btn: "Оставить заявку",
      sections: ["Оффер", "Выгоды и кейсы", "Форма заявки"],
      left: { big: "КЛИК", sub: "с оплаченной рекламы" },
      ring: { value: "6,6", unit: "% конверсия", sub: "в среднем" },
      dest: { big: "ЗАЯВКА", sub: "а не просто клик" },
    }),
    scene(DashScene, {
      title: "СКОРОСТЬ И КОНВЕРСИЯ",
      bars: [
        { label: "Быстрая страница", w: 0.85, text: "заявки" },
        { label: "+1 сек загрузки", w: 0.55, text: "−7%" },
      ],
      kpis: [
        { v: "−7%", s: "за лишнюю секунду" },
        { v: "Адаптив", s: "под любой экран" },
        { v: "Форма", s: "без лишних шагов" },
      ],
      footer: { text: "Скорость и форма закладываются в вёрстку сразу" },
    }),
    scene(HubScene, {
      inputs: ["Оффер", "Структура", "Дизайн", "Текст"],
      knowsLabel: "ЗАПУСК",
      knows: ["Вёрстка", "Правки", "Деплой"],
      core: "LP",
      caption: "ЧЕТЫРЕ ШАГА ДО ЗАПУСКА",
      outTitle: "ЛЕНДИНГ ГОТОВ",
      outRows: ["Адаптив", "Скорость", "Форма", "Домен"],
      dest: { big: "5 ДНЕЙ", sub: "до запуска" },
    }),
  ],

  card: [
    scene(BrowserScene, {
      url: "vasha-kompaniya.ru",
      hero: ["Ваша компания", "в одной ссылке"],
      sub: "Услуги, контакты, отзывы",
      btn: "Связаться",
      sections: ["Главная", "О компании", "Услуги и контакты"],
      left: { big: "0,05", sub: "сек на впечатление" },
      ring: { value: "75", unit: "% судят", sub: "по дизайну" },
      dest: { big: "ДОВЕРИЕ", sub: "с первого экрана" },
    }),
    scene(HubScene, {
      inputs: ["Главная", "О нас", "Услуги", "Контакты"],
      knowsLabel: "КАРКАС",
      knows: ["SEO", "Адаптив", "Скорость"],
      core: "5",
      caption: "ДО ПЯТИ СТРАНИЦ",
      outTitle: "САЙТ-ВИЗИТКА",
      outRows: ["Тексты", "Дизайн", "Формы", "Домен"],
      dest: { big: "8 ДНЕЙ", sub: "до запуска" },
    }),
    scene(ChatScene, {
      time: "12:40",
      header: "Заявка с сайта",
      msgs: [{ lines: ["Нашёл вас в поиске", "по названию"] }, { lines: ["Перезвоним вам", "в течение часа"], mine: true }, { lines: ["Жду звонка"] }],
      note: "форма на сайте",
      result: { title: "НОВЫЙ КЛИЕНТ", rows: ["Нашёл по имени", "Контакт получен"] },
      left: { big: "ПОИСК", sub: "по названию", icon: "dot" },
      ring: { value: "8", unit: "дней", sub: "до запуска" },
      dest: { big: "ЗВОНОК", sub: "менеджеру" },
    }),
  ],

  turnkey: [
    scene(BrowserScene, {
      url: "vash-shop.ru/katalog",
      hero: ["Каталог на", "сотни позиций"],
      sub: "Фильтры, сравнение, поиск",
      btn: "Подобрать",
      sections: ["Фильтры и поиск", "Карточки товаров", "Корзина и заявка"],
      left: { big: "10+", sub: "страниц в проекте" },
      ring: { value: "14", unit: "дней", sub: "срок пакета" },
      dest: { big: "CRM", sub: "заявка в воронку" },
    }),
    scene(HubScene, {
      inputs: ["Каталог", "Формы", "Звонки", "Чат"],
      knowsLabel: "ВАША CRM",
      knows: ["Воронка", "Менеджеры", "Статусы"],
      core: "CRM",
      caption: "ЗАЯВКИ БЕЗ РУЧНОГО ПЕРЕНОСА",
      outTitle: "СДЕЛКА В CRM",
      outRows: ["Контакт", "Товар", "Источник", "Сумма"],
      dest: { big: "ВОРОНКА", sub: "без потерь" },
    }),
    scene(GateScene, {
      title: "Чат на сайте",
      msgs: [{ lines: ["Есть доставка", "в Самару?"] }, { lines: ["Да, 2–4 дня.", "Подобрать модель?"], mine: true }, { lines: ["Нужен счёт на ООО"] }],
      flag: "счёт",
      gateLabel: "ПЕРЕДАЧА МЕНЕДЖЕРУ",
      reply: { lines: ["Здравствуйте, я Павел.", "Выставлю счёт сегодня"], letter: "П", note: "менеджер в диалоге" },
      side: { title: "Менеджер", sub: "подключился", check: "вся переписка" },
      bottom: { label: "ЗАПУСК · 14 ДНЕЙ", metrics: ["структура", "наполнение", "тест"] },
    }),
  ],

  assistant: [
    scene(ChatScene, {
      time: "21:48",
      header: "Ассистент сайта",
      msgs: [{ lines: ["Сколько стоит", "установка?"] }, { lines: ["От 12 000 ₽.", "Оставите телефон?"], mine: true }, { lines: ["Да, записывайте"] }],
      note: "ответ в первую минуту",
      result: { title: "ЗАЯВКА ГОТОВА", rows: ["Услуга: установка", "Телефон получен"] },
      left: { big: "21:48", sub: "офис закрыт", icon: "moon" },
      ring: { value: "1", unit: "минута", sub: "на ответ" },
      dest: { big: "ЗАЯВКА", sub: "менеджеру утром" },
    }),
    scene(HubScene, {
      inputs: ["Вопрос", "Бюджет", "Задача", "Контакт"],
      knowsLabel: "ДАННЫЕ САЙТА",
      knows: ["Каталог", "Цены", "FAQ"],
      caption: "ОТВЕЧАЕТ ИЗ ВАШЕГО САЙТА",
      outTitle: "ЗАЯВКА С ДЕТАЛЯМИ",
      outRows: ["Задача", "Бюджет", "Срок", "Контакт"],
      dest: { big: "CRM", sub: "с деталями" },
    }),
    scene(GateScene, {
      title: "Чат на сайте",
      msgs: [{ lines: ["Какой тариф", "мне подойдёт?"] }, { lines: ["Для 3 точек —", "«Бизнес». Сравнить?"], mine: true }, { lines: ["Нужен договор"] }],
      flag: "договор",
      gateLabel: "ПЕРЕДАЧА МЕНЕДЖЕРУ",
      reply: { lines: ["Здравствуйте, я Илья.", "Пришлю договор сегодня"], letter: "И", note: "менеджер в диалоге" },
      side: { title: "Менеджер", sub: "подключился", check: "вся переписка" },
      bottom: { label: "ПИЛОТ НА ТРАФИКЕ", metrics: ["частые вопросы", "точность", "передачи"] },
    }),
  ],

  redesign: [
    scene(BrowserScene, {
      url: "vash-sayt.ru",
      hero: ["Бренд вырос —", "сайт тоже"],
      sub: "Новый дизайн, старые позиции",
      btn: "Смотреть",
      sections: ["Новый первый экран", "Понятное меню", "Быстрая загрузка"],
      left: { big: "0,05", sub: "сек на впечатление" },
      ring: { value: "75", unit: "% судят", sub: "по дизайну" },
      dest: { big: "НОВЫЙ", sub: "образ бренда" },
    }),
    scene(DashScene, {
      title: "ОТКАЗЫ НА САЙТЕ",
      series: "down",
      marker: "после редизайна",
      kpis: [
        { v: "70%+", s: "отказов — к аудиту" },
        { v: "UX", s: "аудит по данным" },
        { v: "−7%", s: "за лишнюю секунду" },
      ],
      footer: { text: "Структура меняется по данным о поведении" },
    }),
    scene(HubScene, {
      inputs: ["Страницы", "Ссылки", "Мета", "Контент"],
      knowsLabel: "ПЛАН МИГРАЦИИ",
      knows: ["Редиректы", "Карта сайта", "Индексация"],
      core: "SEO",
      caption: "ЗАПУСК БЕЗ ПОТЕРИ ПОЗИЦИЙ",
      outTitle: "НОВЫЙ САЙТ",
      outRows: ["Позиции", "Трафик", "Адреса", "Скорость"],
      dest: { big: "ТОП", sub: "позиции на месте" },
    }),
  ],

  /* ── SMM (/smm/[format]) ─────────────────────────────────────── */

  reels: [
    scene(FeedScene, {
      handle: "@vash_brand",
      kind: "reel",
      stats: ["охват", "показы", "сохранения"],
      left: { big: "30,8%", sub: "средний охват Reels", icon: "dot" },
      ring: { value: "2–3×", unit: "показов", sub: "к посту" },
      dest: { big: "ОХВАТ", sub: "новая аудитория" },
    }),
    scene(HubScene, {
      inputs: ["Сценарий", "Съёмка", "Монтаж", "Выпуск"],
      knowsLabel: "ВАШ БРЕНД",
      knows: ["Тон", "Продукт", "Лица"],
      core: "1",
      caption: "ОДИН СЪЁМОЧНЫЙ ДЕНЬ",
      outTitle: "РОЛИКИ НА МЕСЯЦ",
      outRows: ["Сценарии", "Монтаж", "Обложки", "Субтитры"],
      dest: { big: "8–12", sub: "роликов в месяц" },
    }),
    scene(DashScene, {
      title: "ОХВАТ АККАУНТА",
      series: "up",
      marker: "донастройка",
      kpis: [
        { v: "30,8%", s: "средний охват" },
        { v: "2–3×", s: "показов к посту" },
        { v: "Отчёт", s: "каждый месяц" },
      ],
      footer: { text: "Съёмка, таргет и блогеры усиливают друг друга" },
    }),
  ],

  stories: [
    scene(FeedScene, {
      handle: "@vash_brand",
      kind: "story",
      overlay: "Какой вкус взять?",
      options: ["Классический", "Новинку"],
      stats: ["ответы", "реакции", "переходы"],
      left: { big: "24 ЧАСА", sub: "живёт история", icon: "dot" },
      ring: { value: "1", unit: "история", sub: "каждый день" },
      dest: { big: "ДИАЛОГ", sub: "а не просто пост" },
    }),
    scene(ChatScene, {
      time: "19:20",
      header: "Ответы на историю",
      msgs: [{ lines: ["А есть без сахара?"] }, { lines: ["Да, с понедельника.", "Отложить для вас?"], mine: true }, { lines: ["Да, две банки"] }],
      note: "ответ из опроса",
      result: { title: "ЕСТЬ ЗАКАЗ", rows: ["Ответ на опрос", "Контакт получен"] },
      left: { big: "ОПРОС", sub: "в истории", icon: "dot" },
      ring: { value: "24", unit: "часа", sub: "жизнь истории" },
      dest: { big: "ДИАЛОГ", sub: "с подписчиком" },
    }),
    scene(FanScene, {
      caption: "ОДИН ДЕНЬ БРЕНДА",
      src: { title: "Съёмка в моменте", sub: "без съёмочной группы", kind: "video" },
      variants: ["Утро", "Процесс", "Опрос", "Закулисье", "Итог дня"],
      counter: "0 ₽",
      counterSub: ["за отдельную", "съёмочную группу"],
    }),
  ],

  carousel: [
    scene(FeedScene, {
      handle: "@vash_brand",
      kind: "carousel",
      overlay: "Гид за 8 слайдов",
      stats: ["сохранения", "пересылки", "дочитали"],
      left: { big: "3–4×", sub: "дольше внимание", icon: "dot" },
      ring: { value: "4–8", unit: "постов", sub: "в месяц" },
      dest: { big: "ФИНАЛ", sub: "дочитали до конца" },
    }),
    scene(FanScene, {
      caption: "ОДНА ТЕМА МЕСЯЦА",
      src: { title: "Тема поста", sub: "раскадровка", kind: "photo" },
      variants: ["Обложка", "Проблема", "Решение", "Пример", "Призыв"],
      counter: "4–8",
      counterSub: ["постов", "в месяц"],
    }),
    scene(DashScene, {
      title: "ВОВЛЕЧЁННОСТЬ ФОРМАТОВ",
      bars: [
        { label: "Карусель", w: 0.8, text: "0,50–0,55%" },
        { label: "Reels", w: 0.74, text: "0,48–0,52%" },
      ],
      kpis: [
        { v: "3–4×", s: "дольше внимание" },
        { v: "4–8", s: "постов в месяц" },
        { v: "Отчёт", s: "по сохранениям" },
      ],
      footer: { text: "Reels приводят, карусели удерживают аудиторию" },
    }),
  ],

  ads: [
    scene(FeedScene, {
      handle: "Telegram",
      kind: "post",
      overlay: "Ваш бренд",
      cta: "Подписаться",
      stats: ["показы", "клики", "подписки"],
      left: { big: "TG", sub: "93,6 млн в России", icon: "dot" },
      ring: { value: "90", unit: "% теряется", sub: "на пути к сайту" },
      dest: { big: "КАНАЛ", sub: "без перехода" },
    }),
    scene(HubScene, {
      inputs: ["Площадки", "Креативы", "Воронка", "Бюджет"],
      knowsLabel: "ЦЕЛЬ",
      knows: ["Канал", "Бот", "Заявка"],
      core: "ADS",
      caption: "ВОРОНКА ВНУТРИ ПЛОЩАДКИ",
      outTitle: "ЗАЯВКА НАПРЯМУЮ",
      outRows: ["Подписка", "Бот", "Заявка", "Продажа"],
      dest: { big: "ЗАЯВКА", sub: "без потерь" },
    }),
    scene(DashScene, {
      title: "ЦЕНА ЗАЯВКИ",
      series: "down",
      marker: "тест креативов",
      kpis: [
        { v: "Неделя", s: "цикл оптимизации" },
        { v: "Тесты", s: "креативов" },
        { v: "Бюджет", s: "в то, что работает" },
      ],
      footer: { text: "Бюджет уходит в то, что реально конвертит" },
    }),
  ],

  bloggers: [
    scene(FanScene, {
      caption: "ОДИН БРИФ",
      src: { title: "Ваш продукт", sub: "и бриф для блогера", kind: "photo" },
      variants: ["Обзор", "Распаковка", "Лайфхак", "Сторис", "Розыгрыш"],
      counter: "⅓",
      counterSub: ["россиян покупали", "по совету блогера"],
    }),
    scene(SortScene, {
      inLabel: "КАНДИДАТЫ",
      items: ["Блогер 01", "Блогер 02", "Блогер 03", "Блогер 04", "Блогер 05"],
      core: "✓",
      coreLabel: "ПОДБОР ПО МЕТРИКАМ",
      lanes: [
        { title: "Подходит", value: "в бриф", tone: "ok" },
        { title: "Проверить", value: "охваты", tone: "warn" },
        { title: "Отказ", value: "накрутка", tone: "mute" },
      ],
      footer: "В работу идут только блогеры с живой аудиторией",
    }),
    scene(DashScene, {
      title: "РЕЗУЛЬТАТ ИНТЕГРАЦИИ",
      bars: [
        { label: "Обещано", w: 0.7, text: "план" },
        { label: "Замер", w: 0.8, text: "факт" },
      ],
      kpis: [
        { v: "Замер", s: "по метрикам" },
        { v: "+20%", s: "рост рынка" },
        { v: "1", s: "тест формата" },
      ],
      footer: { text: "Результат замеряется по обещанным метрикам" },
    }),
  ],
};
