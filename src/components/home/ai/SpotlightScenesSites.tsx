// Сцены форматов /sites: Лендинг, Сайт-визитка, Сайт под ключ, AI-ассистент,
// Редизайн — по четыре на формат, в том же порядке, что тезисы в
// spotlightSites.ts. Общие детали (появление по очереди, рамка, крупная
// цифра, «было → стало») лежат в sceneKit.tsx — сцены /sites собраны из тех
// же деталей, что и сцены /ai и /content, поэтому ведут себя одинаково.
//
// Всё нарисовано в координатах 340×210 (в карточке карусели вьюбокс
// обрезается до 340×176), поэтому предметное содержимое сцены лежит
// в полосе y = 56…170: выше — крупная цифра, ниже — «было → стало».

import { In, Frame, Headline, BeforeAfter, type SceneProps } from "@/components/home/ai/sceneKit";

const W = (o: number) => `rgba(255,255,255,${o})`;

/** Окно браузера — основа почти каждой сцены: рамка, три точки, разделитель. */
function Win({ x, y, w, h, o = 1 }: { x: number; y: number; w: number; h: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={W(0.05)} stroke={W(0.16)} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 11 + i * 8} cy={y + 9} r="2" fill={W(0.3)} />
      ))}
      <path d={`M ${x} ${y + 18} L ${x + w} ${y + 18}`} stroke={W(0.1)} />
    </g>
  );
}

/** Полоска-«строка текста». */
function Bar({ x, y, w, h = 5, o = 0.16 }: { x: number; y: number; w: number; h?: number; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={W(o)} />;
}

/** Кнопка-призыв в акцентном градиенте. */
function Cta({ x, y, w, h = 22, label, size = 12.4 }: { x: number; y: number; w: number; h?: number; label?: string; size?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="url(#sp-ramp)" />
      {label && (
        <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fill="#fff" fontSize={size} fontWeight="700" fontFamily="inherit">
          {label}
        </text>
      )}
    </g>
  );
}

function Tick({ cx, cy, r = 8 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#sp-ramp)" />
      <path d={`M ${cx - r * 0.42} ${cy + r * 0.02} L ${cx - r * 0.1} ${cy + r * 0.36} L ${cx + r * 0.48} ${cy - r * 0.34}`} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Cursor({ x, y }: { x: number; y: number }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M 0 0 L 0 14 L 4 10.5 L 6.6 16.4 L 9 15.3 L 6.4 9.6 L 11.5 9.6 Z"
      fill="#fff"
      stroke="rgba(10,13,16,0.9)"
      strokeWidth="0.8"
    />
  );
}

function Txt({
  x,
  y,
  children,
  size = 12.4,
  fill = "#fff",
  weight,
  anchor,
  ls,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  fill?: string;
  weight?: number;
  anchor?: "middle" | "end";
  ls?: number;
}) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} letterSpacing={ls} fontFamily="inherit">
      {children}
    </text>
  );
}

/* ── Лендинг ────────────────────────────────────────────────────────── */

/** 01 · Фокус. На экране одна цель, лишние кнопки вычеркнуты. */
function LandingFocus({ mini }: SceneProps) {
  const ghosts = ["Лишний баннер", "Ещё кнопка", "Второй призыв"];
  return (
    <Frame>
      <Headline value="1 оффер" note="и один призыв на экране" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={196} h={110} />
      </In>
      <In at={2}>
        <Bar x={30} y={88} w={112} h={7} o={0.4} />
        <Bar x={30} y={102} w={78} h={7} o={0.28} />
        <Bar x={30} y={118} w={130} h={4} o={0.1} />
      </In>
      <In at={3}>
        <Cta x={30} y={134} w={100} h={24} label="Заказать" size={14.0} />
        <rect x={26} y={130} width={108} height={32} rx={16} stroke="var(--sp-from)" strokeOpacity="0.7" className="sp-pulse" />
      </In>
      <In at={4}>
        <Txt x={226} y={68} size={10.9} fill={W(0.5)} ls={1.2}>УБРАЛИ ЛИШНЕЕ</Txt>
      </In>
      {ghosts.map((label, i) => (
        <In key={label} at={4 + i * 0.6}>
          <rect x={226} y={76 + i * 30} width={100} height={22} rx={11} stroke={W(0.2)} strokeDasharray="4 4" />
          <Txt x={238} y={90 + i * 30} size={12.4} fill={W(0.4)}>{label}</Txt>
          <path d={`M 232 ${87 + i * 30} L 320 ${87 + i * 30}`} stroke="var(--sp-from)" strokeOpacity="0.8" strokeWidth="1.3" />
        </In>
      ))}
      <BeforeAfter before="Десять кнопок и блоков" after="Одна цель у страницы" mini={mini} />
    </Frame>
  );
}

/** 02 · Скорость. Две полосы загрузки на одной шкале секунд. */
function LandingSpeed({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="−7%" note="конверсии за каждую секунду" mini={mini} />
      <In at={1}>
        <Txt x={14} y={84} size={12.4} fill={W(0.55)}>Было</Txt>
        <rect x={56} y={73} width={252} height={16} rx={8} fill={W(0.12)} stroke={W(0.16)} />
        <Txt x={64} y={84} size={11.6} fill={W(0.5)}>тяжёлые картинки и шрифты</Txt>
      </In>
      <In at={2}>
        <Txt x={14} y={112} size={12.4} fill="#fff" weight={600}>Стало</Txt>
        <rect x={56} y={101} width={78} height={16} rx={8} fill="url(#sp-ramp)" />
        <Txt x={144} y={112} size={12.4} fill="var(--sp-from)" weight={600}>меньше секунды</Txt>
      </In>
      <In at={3}>
        <path d="M 56 134 L 308 134" stroke={W(0.2)} />
        {[0, 1, 2, 3].map((s) => (
          <g key={s}>
            <path d={`M ${56 + s * 84} 130 L ${56 + s * 84} 138`} stroke={W(0.3)} />
            <Txt x={56 + s * 84} y={150} size={11.6} fill={W(0.5)} anchor="middle">{s === 0 ? "0" : `${s} с`}</Txt>
          </g>
        ))}
        <path d="M 140 66 L 140 134" stroke="var(--sp-from)" strokeOpacity="0.7" strokeDasharray="3 4" className="sp-flow" />
      </In>
      <BeforeAfter before="Страница тормозит" after="Загрузка меньше секунды" mini={mini} />
    </Frame>
  );
}

/** 03 · Телефон. Не уменьшенный десктоп, а отдельная вёрстка. */
function LandingMobile({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="×2" note="разница в конверсии с телефона" mini={mini} />
      <In at={1}>
        <Win x={14} y={60} w={176} h={106} o={0.7} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={24 + i * 54} y={86} width={48} height={32} rx={6} fill={W(0.08)} stroke={W(0.12)} />
        ))}
        <Bar x={24} y={128} w={90} h={5} />
        <Bar x={24} y={140} w={60} h={4} o={0.1} />
      </In>
      <In at={3}>
        <path d="M 196 113 L 228 113" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={4}>
        <rect x={236} y={56} width={66} height={116} rx={13} fill="rgba(10,13,16,0.85)" stroke="url(#sp-ramp)" strokeWidth="1.3" />
        <rect x={252} y={60} width={34} height={3.5} rx={1.8} fill={W(0.3)} />
        <rect x={244} y={72} width={50} height={22} rx={5} fill={W(0.1)} />
        <rect x={244} y={100} width={50} height={22} rx={5} fill={W(0.1)} />
        <Bar x={244} y={128} w={38} h={4} />
        <Cta x={244} y={140} w={50} h={16} label="Заказать" size={10.1} />
      </In>
      <BeforeAfter before="Уменьшенный десктоп" after="Мобильная вёрстка отдельно" mini={mini} />
    </Frame>
  );
}

/** 04 · Заявка. Длинная анкета против трёх коротких полей. */
function LandingForm({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="3 поля" note="вместо длинной анкеты" mini={mini} />
      <In at={1}>
        <rect x={14} y={60} width={112} height={108} rx={10} fill={W(0.03)} stroke={W(0.12)} strokeDasharray="4 4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={24} y={70 + i * 15} width={92} height={9} rx={4} fill={W(0.08)} />
        ))}
      </In>
      <In at={3}>
        <path d="M 130 114 L 164 114" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={4}>
        <rect x={170} y={62} width={156} height={104} rx={12} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <rect x={184} y={78} width={128} height={17} rx={8} fill={W(0.1)} />
        <Txt x={194} y={89.5} size={11.6} fill={W(0.6)}>Имя</Txt>
        <rect x={184} y={102} width={128} height={17} rx={8} fill={W(0.1)} />
        <Txt x={194} y={113.5} size={11.6} fill={W(0.6)}>Телефон</Txt>
        <Cta x={184} y={130} w={128} h={22} label="Оставить заявку" size={13.2} />
        <Tick cx={320} cy={64} r={8} />
      </In>
      <BeforeAfter before="Длинная анкета" after="Имя, телефон, кнопка" mini={mini} />
    </Frame>
  );
}

/* ── Сайт-визитка ───────────────────────────────────────────────────── */

/** 01 · Главная. Суть понятна раньше, чем посетитель пролистал. */
function CardFirst({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="0,05 с" note="решает первое впечатление" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={196} h={110} />
      </In>
      <In at={2}>
        <circle cx={32} cy={88} r={6} fill="url(#sp-ramp)" />
        <Bar x={150} y={86} w={46} h={4} o={0.14} />
        <Bar x={30} y={106} w={116} h={8} o={0.42} />
        <Bar x={30} y={120} w={84} h={8} o={0.28} />
        <Bar x={30} y={136} w={120} h={4} o={0.1} />
      </In>
      <In at={3}>
        <Cta x={30} y={146} w={70} h={16} label="Связаться" size={11.6} />
      </In>
      <In at={4}>
        <circle cx={272} cy={104} r={32} fill="url(#sp-glow)" />
        <circle cx={272} cy={104} r={26} stroke={W(0.16)} strokeWidth="4" />
        <circle
          cx={272}
          cy={104}
          r={26}
          stroke="url(#sp-ramp)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="78 100"
          transform="rotate(-90 272 104)"
        />
        <Txt x={272} y={108} size={17.1} weight={700} anchor="middle">0,05</Txt>
        <Txt x={272} y={150} size={10.1} fill={W(0.55)} anchor="middle" ls={0.8}>ПЕРВЫЙ ВЗГЛЯД</Txt>
      </In>
      <BeforeAfter before="Непонятно, кто вы" after="Суть видна с первого экрана" mini={mini} />
    </Frame>
  );
}

/** 02 · О компании. Доверие строится на фактах, а не на общих словах. */
function CardTrust({ mini }: SceneProps) {
  const chips = ["Команда", "Кейсы", "Отзывы"];
  return (
    <Frame>
      <Headline value="75%" note="судят о надёжности по сайту" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={196} h={110} />
      </In>
      <In at={2}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={42 + i * 38} cy={96} r={11} fill="url(#sp-ramp)" fillOpacity="0.28" stroke={W(0.25)} />
        ))}
        <Bar x={28} y={118} w={150} h={5} o={0.3} />
        <Bar x={28} y={130} w={120} h={5} o={0.14} />
        <Bar x={28} y={142} w={140} h={5} o={0.14} />
      </In>
      {chips.map((label, i) => (
        <In key={label} at={3 + i * 0.8}>
          <rect x={226} y={66 + i * 32} width={100} height={24} rx={12} fill={W(0.06)} stroke="var(--sp-to)" strokeOpacity="0.5" />
          <Tick cx={240} cy={78 + i * 32} r={6} />
          <Txt x={252} y={81 + i * 32} size={13.2}>{label}</Txt>
        </In>
      ))}
      <BeforeAfter before="Общие слова о качестве" after="Люди, кейсы и подробности" mini={mini} />
    </Frame>
  );
}

/** 03 · Услуги. Из меню до нужной услуги — один клик. */
function CardServices({ mini }: SceneProps) {
  const menu = ["Услуги", "Кейсы", "Контакты"];
  return (
    <Frame>
      <Headline value="1 клик" note="до нужной услуги" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={150} h={110} />
        {menu.map((m, i) => (
          <g key={m}>
            <rect x={24 + i * 44} y={82} width={40} height={14} rx={7} fill={i === 0 ? "url(#sp-ramp)" : W(0.07)} fillOpacity={i === 0 ? 0.9 : 1} />
            <Txt x={44 + i * 44} y={91.5} size={10.1} anchor="middle" fill={i === 0 ? "#fff" : W(0.6)}>{m}</Txt>
          </g>
        ))}
      </In>
      <In at={2}>
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={24 + i * 68} y={106} width={62} height={52} rx={8} fill={W(0.06)} stroke={i === 1 ? "var(--sp-from)" : W(0.14)} strokeOpacity={i === 1 ? 0.8 : 1} />
            <circle cx={38 + i * 68} cy={122} r={6} fill="url(#sp-ramp)" fillOpacity="0.5" />
            <Bar x={32 + i * 68} y={138} w={40} h={4} o={0.3} />
            <Bar x={32 + i * 68} y={147} w={26} h={3} o={0.12} />
          </g>
        ))}
      </In>
      <In at={3}>
        <Cursor x={112} y={140} />
        <path d="M 168 112 L 196 112" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={4}>
        <rect x={200} y={62} width={126} height={100} rx={10} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <Txt x={212} y={82} size={14.0} weight={700}>Услуга</Txt>
        <Bar x={212} y={92} w={96} h={4} o={0.26} />
        <Bar x={212} y={102} w={80} h={4} o={0.14} />
        <Bar x={212} y={112} w={88} h={4} o={0.14} />
        <Cta x={212} y={130} w={72} h={18} label="Заказать" size={11.6} />
      </In>
      <BeforeAfter before="Искать по всему сайту" after="Нужное — прямо с главной" mini={mini} />
    </Frame>
  );
}

/** 04 · Контакты. Пять страниц, и связь — там, где её ищут. */
function CardContacts({ mini }: SceneProps) {
  const tabs = ["Главная", "О нас", "Услуги", "Кейсы", "Контакты"];
  const chips: [string, number, number][] = [["Телефон", 26, 104], ["Telegram", 26, 132], ["WhatsApp", 130, 104]];
  return (
    <Frame>
      <Headline value="до 5" note="страниц — вся визитка" mini={mini} />
      {tabs.map((t, i) => (
        <In key={t} at={1 + i * 0.4}>
          <rect
            x={14 + i * 64}
            y={60}
            width={58}
            height={20}
            rx={10}
            fill={i === 4 ? "url(#sp-ramp)" : W(0.06)}
            fillOpacity={i === 4 ? 0.9 : 1}
            stroke={i === 4 ? "none" : W(0.14)}
          />
          <Txt x={43 + i * 64} y={73.5} size={11.6} anchor="middle" fill={i === 4 ? "#fff" : W(0.65)}>{t}</Txt>
        </In>
      ))}
      <In at={3.4}>
        <rect x={14} y={90} width={312} height={78} rx={12} fill={W(0.05)} stroke="var(--sp-from)" strokeOpacity="0.4" />
      </In>
      {chips.map(([label, x, y], i) => (
        <In key={label} at={4 + i * 0.5}>
          <rect x={x} y={y} width={96} height={22} rx={11} fill={W(0.07)} stroke={W(0.16)} />
          <circle cx={x + 12} cy={y + 11} r={3.6} fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <Txt x={x + 22} y={y + 14.4} size={13.2}>{label}</Txt>
        </In>
      ))}
      <In at={6}>
        <rect x={238} y={102} width={76} height={12} rx={6} fill={W(0.1)} />
        <rect x={238} y={120} width={76} height={12} rx={6} fill={W(0.1)} />
        <Cta x={238} y={140} w={76} h={16} label="Отправить" size={10.9} />
      </In>
      <BeforeAfter before="Контакты не найти" after="Связь там, где её ждут" mini={mini} />
    </Frame>
  );
}

/* ── Сайт под ключ ──────────────────────────────────────────────────── */

/** 01 · Каталог. Фильтры оставляют только подходящие карточки. */
function TurnkeyCatalog({ mini }: SceneProps) {
  const filters = ["Цена", "Бренд", "Размер"];
  const lit = [0, 1, 4];
  return (
    <Frame>
      <Headline value="10+" note="страниц в одном проекте" mini={mini} />
      <In at={1}>
        <rect x={14} y={58} width={72} height={110} rx={10} fill={W(0.05)} stroke={W(0.16)} />
        {filters.map((f, i) => (
          <g key={f}>
            <rect x={24} y={74 + i * 26} width={10} height={10} rx={3} fill={i < 2 ? "url(#sp-ramp)" : "none"} stroke={i < 2 ? "none" : W(0.3)} />
            <Txt x={40} y={83 + i * 26} size={12.4}>{f}</Txt>
          </g>
        ))}
      </In>
      {[0, 1, 2, 3, 4, 5].map((n) => {
        const col = n % 3;
        const row = Math.floor(n / 3);
        const x = 94 + col * 78;
        const y = 60 + row * 56;
        const on = lit.includes(n);
        return (
          <In key={n} at={2 + n * 0.35}>
            <g opacity={on ? 1 : 0.35}>
              <rect x={x} y={y} width={72} height={50} rx={8} fill={W(0.06)} stroke={on ? "var(--sp-from)" : W(0.14)} strokeOpacity={on ? 0.75 : 1} />
              <rect x={x + 6} y={y + 6} width={60} height={20} rx={5} fill="url(#sp-ramp)" fillOpacity={on ? 0.32 : 0.14} />
              <Bar x={x + 6} y={y + 32} w={44} h={4} o={0.3} />
              <Bar x={x + 6} y={y + 40} w={26} h={3} o={0.14} />
            </g>
          </In>
        );
      })}
      <BeforeAfter before="Прайс одним файлом" after="Каталог с фильтрами" mini={mini} />
    </Frame>
  );
}

/** 02 · Формы. Заявка с сайта сразу ложится в воронку CRM. */
function TurnkeyCrm({ mini }: SceneProps) {
  const cols = ["Новые", "В работе", "Сделка"];
  return (
    <Frame>
      <Headline value="CRM" note="заявка сразу в воронке" mini={mini} />
      <In at={1}>
        <rect x={14} y={70} width={84} height={88} rx={10} fill={W(0.06)} stroke={W(0.16)} />
        <rect x={24} y={82} width={64} height={12} rx={6} fill={W(0.1)} />
        <rect x={24} y={100} width={64} height={12} rx={6} fill={W(0.1)} />
        <Cta x={24} y={122} w={64} h={16} label="Отправить" size={10.9} />
      </In>
      <In at={3}>
        <path d="M 100 114 L 148 114" stroke="var(--sp-from)" strokeWidth="1.5" className="sp-flow" />
      </In>
      <In at={4}>
        <rect x={152} y={60} width={174} height={108} rx={12} fill={W(0.05)} stroke="var(--sp-to)" strokeOpacity="0.5" />
        {cols.map((c, i) => (
          <g key={c}>
            <Txt x={160 + i * 56} y={76} size={10.1} fill={W(0.55)} ls={0.6}>{c.toUpperCase()}</Txt>
            <rect x={160 + i * 56} y={84} width={50} height={20} rx={5} fill={W(0.08)} stroke={i === 0 ? "var(--sp-from)" : "none"} className={i === 0 ? "sp-pulse" : undefined} />
            {i < 2 && <rect x={160 + i * 56} y={110} width={50} height={20} rx={5} fill={W(0.06)} />}
          </g>
        ))}
        <Tick cx={296} cy={140} r={7} />
      </In>
      <BeforeAfter before="Перенос руками" after="Форма пишет прямо в CRM" mini={mini} />
    </Frame>
  );
}

/** 03 · AI-ассистент. Чат на странице отвечает раньше менеджера. */
function TurnkeyAssistant({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="1 мин" note="до первого ответа" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={196} h={110} />
        <Bar x={28} y={86} w={80} h={6} o={0.3} />
        <Bar x={28} y={98} w={56} h={4} o={0.12} />
        <rect x={28} y={112} width={44} height={40} rx={6} fill={W(0.07)} />
      </In>
      <In at={2}>
        <rect x={94} y={78} width={106} height={82} rx={10} fill="rgba(10,13,16,0.9)" stroke="url(#sp-ramp)" strokeWidth="1.2" />
        <rect x={94} y={78} width={106} height={16} rx={10} fill="url(#sp-ramp)" fillOpacity="0.4" />
        <Txt x={104} y={89} size={10.9} weight={700} ls={1}>AI · НА САЙТЕ</Txt>
      </In>
      <In at={3}>
        <rect x={102} y={102} width={62} height={14} rx={7} fill={W(0.12)} />
        <Txt x={109} y={112} size={10.1} fill={W(0.85)}>Есть в наличии?</Txt>
      </In>
      <In at={4}>
        <rect x={120} y={124} width={72} height={14} rx={7} fill="url(#sp-ramp)" fillOpacity="0.42" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <Txt x={127} y={134} size={10.1}>Да, отправим</Txt>
      </In>
      <In at={5}>
        <circle cx={272} cy={108} r={32} fill="url(#sp-glow)" />
        <circle cx={272} cy={108} r={26} stroke="url(#sp-ramp)" strokeWidth="1.4" fill="rgba(10,13,16,0.9)" />
        <circle cx={272} cy={108} r={32} stroke="url(#sp-ramp)" strokeOpacity="0.7" strokeDasharray="4 8" className="sp-spin" style={{ transformOrigin: "272px 108px" }} />
        <Txt x={272} y={112} size={17.1} weight={700} anchor="middle">24/7</Txt>
        <Txt x={272} y={156} size={10.1} fill={W(0.55)} anchor="middle" ls={0.8}>БЕЗ ВЫХОДНЫХ</Txt>
      </In>
      <BeforeAfter before="Ждёт менеджера" after="Отвечает сразу" mini={mini} />
    </Frame>
  );
}

/** 04 · Админ-панель. Цена поменялась в панели — и на сайте. */
function TurnkeyAdmin({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="Сами" note="правите каталог без разработчика" mini={mini} />
      <In at={1}>
        <rect x={14} y={58} width={178} height={110} rx={10} fill={W(0.05)} stroke={W(0.16)} />
        <Txt x={26} y={75} size={10.9} fill={W(0.5)} ls={1.2}>АДМИНКА · ТОВАРЫ</Txt>
        <path d="M 14 82 L 192 82" stroke={W(0.1)} />
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={2 + i * 0.5}>
          <rect
            x={22}
            y={90 + i * 24}
            width={162}
            height={18}
            rx={6}
            fill={i === 1 ? "url(#sp-ramp)" : W(0.06)}
            fillOpacity={i === 1 ? 0.28 : 1}
            stroke={i === 1 ? "var(--sp-from)" : "none"}
            strokeOpacity="0.7"
          />
          <Bar x={30} y={97 + i * 24} w={70} h={4} o={0.3} />
          <Txt x={176} y={102.5 + i * 24} size={12.4} anchor="end" weight={i === 1 ? 700 : 400} fill={i === 1 ? "#fff" : W(0.6)}>
            {i === 1 ? "990 ₽" : i === 0 ? "1 200 ₽" : "2 450 ₽"}
          </Txt>
        </In>
      ))}
      <In at={4}>
        <Cursor x={140} y={122} />
      </In>
      <In at={5}>
        <path d="M 196 114 L 222 114" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={6}>
        <rect x={226} y={66} width={100} height={92} rx={10} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <rect x={236} y={76} width={80} height={38} rx={6} fill="url(#sp-ramp)" fillOpacity="0.3" />
        <Bar x={236} y={122} w={56} h={4} o={0.3} />
        <Txt x={236} y={144} size={17.1} weight={700}>990 ₽</Txt>
        <rect x={232} y={130} width={88} height={20} rx={8} stroke="var(--sp-from)" strokeOpacity="0.7" className="sp-pulse" />
      </In>
      <BeforeAfter before="Задача разработчику" after="Правка за минуту" mini={mini} />
    </Frame>
  );
}

/* ── AI-ассистент ───────────────────────────────────────────────────── */

/** 01 · Источник. Ассистент собирает ответ из вашего сайта и каталога. */
function AssistantSource({ mini }: SceneProps) {
  const sources = ["Сайт", "Каталог", "FAQ"];
  return (
    <Frame>
      <Headline value="+391%" note="конверсии при ответе в 1-ю минуту" mini={mini} />
      {sources.map((label, i) => (
        <In key={label} at={1 + i}>
          <rect x={14} y={72 + i * 32} width={76} height={24} rx={7} fill={W(0.06)} stroke={W(0.16)} />
          <rect x={22} y={80 + i * 32} width={8} height={8} rx={2} fill="var(--sp-from)" fillOpacity="0.9" />
          <Txt x={36} y={87 + i * 32} size={13.2} fill={W(0.85)}>{label}</Txt>
        </In>
      ))}
      <In at={4}>
        <path d="M 94 104 C 128 104 130 116 158 116" stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" />
        <circle cx={188} cy={116} r={38} fill="url(#sp-glow)" />
        <circle cx={188} cy={116} r={23} fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.5" />
        <circle cx={188} cy={116} r={30} stroke="url(#sp-ramp)" strokeOpacity="0.8" strokeDasharray="5 9" className="sp-spin" style={{ transformOrigin: "188px 116px" }} />
        <Txt x={188} y={120} size={15.5} anchor="middle" ls={1.6}>AI</Txt>
      </In>
      <In at={5}>
        <rect x={230} y={90} width={98} height={36} rx={10} fill={W(0.08)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <Txt x={240} y={104} size={12.4}>«В наличии,</Txt>
        <Txt x={240} y={116} size={12.4}>доставим завтра»</Txt>
      </In>
      <BeforeAfter before="Общие формулировки" after="Ответ вашими словами" mini={mini} />
    </Frame>
  );
}

/** 02 · Эскалация. Сложный вопрос уходит человеку вместе с контекстом. */
function AssistantHandoff({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="×21" note="шанс квалифицировать за 5 минут" mini={mini} />
      <In at={1}>
        <rect x={14} y={62} width={104} height={22} rx={11} fill={W(0.1)} />
        <Txt x={24} y={76} size={12.4} fill={W(0.85)}>Нужен договор</Txt>
      </In>
      <In at={2}>
        <rect x={40} y={92} width={104} height={22} rx={11} fill="url(#sp-ramp)" fillOpacity="0.36" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <Txt x={50} y={106} size={12.4}>Уточняю детали</Txt>
      </In>
      <In at={3}>
        <rect x={14} y={122} width={118} height={22} rx={11} stroke={W(0.25)} strokeDasharray="4 4" />
        <Txt x={24} y={136} size={12.4} fill={W(0.7)}>Передаю менеджеру</Txt>
      </In>
      <In at={4}>
        <path d="M 148 108 C 166 108 172 112 192 112" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={5}>
        <rect x={196} y={62} width={130} height={104} rx={12} fill={W(0.07)} stroke="var(--sp-to)" strokeOpacity="0.55" />
        <circle cx={214} cy={82} r={8} fill="url(#sp-ramp)" />
        <Txt x={228} y={85} size={13.2} weight={600}>Менеджер</Txt>
        <Txt x={208} y={108} size={10.1} fill={W(0.5)} ls={1}>КОНТЕКСТ ДИАЛОГА</Txt>
        <Bar x={208} y={116} w={100} h={4} o={0.3} />
        <Bar x={208} y={126} w={82} h={4} o={0.2} />
        <Bar x={208} y={136} w={92} h={4} o={0.2} />
        <Tick cx={308} cy={150} r={7} />
      </In>
      <BeforeAfter before="Диалог оборвался" after="Менеджер видит весь контекст" mini={mini} />
    </Frame>
  );
}

/** 03 · Границы. Что ассистент говорит, а о чём молчит, — по брифу. */
function AssistantRules({ mini }: SceneProps) {
  const rows: [string, boolean][] = [
    ["Каталог и цены", true],
    ["Сроки доставки", true],
    ["Персональные скидки", false],
    ["Условия договора", false],
  ];
  return (
    <Frame>
      <Headline value="Правила" note="фиксируем на брифе" mini={mini} />
      {rows.map(([label, ok], i) => {
        const y = 62 + i * 26;
        return (
          <In key={label} at={1 + i * 0.7}>
            <rect
              x={14}
              y={y}
              width={312}
              height={20}
              rx={10}
              fill={W(ok ? 0.07 : 0.03)}
              stroke={ok ? "var(--sp-from)" : W(0.18)}
              strokeOpacity={ok ? 0.55 : 1}
              strokeDasharray={ok ? undefined : "4 4"}
            />
            {ok ? (
              <Tick cx={28} cy={y + 10} r={6} />
            ) : (
              <g stroke={W(0.55)} strokeWidth="1.2" fill="none" strokeLinecap="round">
                <rect x={24.5} y={y + 9} width={7} height={6} rx={1.5} fill={W(0.2)} />
                <path d={`M 26.4 ${y + 9} L 26.4 ${y + 6.8} A 1.6 1.6 0 0 1 29.6 ${y + 6.8} L 29.6 ${y + 9}`} />
              </g>
            )}
            <Txt x={42} y={y + 13.6} size={13.2} fill={ok ? "#fff" : W(0.5)}>{label}</Txt>
            <Txt x={316} y={y + 13.2} size={10.1} anchor="end" ls={1} fill={ok ? "var(--sp-from)" : W(0.4)}>{ok ? "ОТВЕЧАЕТ" : "ПЕРЕДАЁТ"}</Txt>
          </In>
        );
      })}
      <BeforeAfter before="Отвечает на всё подряд" after="Только то, что разрешено" mini={mini} />
    </Frame>
  );
}

/** 04 · Интеграция. Диалог превращается в готовую карточку заявки. */
function AssistantCrm({ mini }: SceneProps) {
  const fields = ["Имя", "Телефон", "Интерес"];
  return (
    <Frame>
      <Headline value="24/7" note="принимает заявки без выходных" mini={mini} />
      <In at={1}>
        <rect x={14} y={80} width={88} height={28} rx={12} fill={W(0.1)} />
        <Txt x={24} y={92} size={11.6} fill={W(0.85)}>«Хочу заказать</Txt>
        <Txt x={24} y={102} size={11.6} fill={W(0.85)}>сайт»</Txt>
      </In>
      <In at={2}>
        <path d="M 106 96 L 128 96" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x={132} y={60} width={100} height={106} rx={12} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <Txt x={144} y={76} size={10.9} fill="var(--sp-from)" ls={1.2} weight={600}>ЗАЯВКА</Txt>
        {fields.map((f, i) => (
          <g key={f}>
            <Txt x={144} y={94 + i * 24} size={10.1} fill={W(0.5)}>{f}</Txt>
            <Bar x={144} y={98 + i * 24} w={76 - i * 8} h={5} o={0.3} />
          </g>
        ))}
      </In>
      <In at={4}>
        <path d="M 236 112 L 256 112" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={5}>
        <circle cx={290} cy={112} r={34} fill="url(#sp-glow)" />
        <rect x={262} y={92} width={56} height={40} rx={10} fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <Txt x={290} y={116} size={15.5} anchor="middle" weight={700} ls={1}>CRM</Txt>
        <Tick cx={316} cy={92} r={7} />
      </In>
      <BeforeAfter before="Контакты в переписке" after="Готовая карточка в CRM" mini={mini} />
    </Frame>
  );
}

/* ── Редизайн ───────────────────────────────────────────────────────── */

/** 01 · Аудит. Сначала видно, где теряются посетители, потом правим. */
function RedesignAudit({ mini }: SceneProps) {
  const steps: [string, number][] = [["Зашли", 156], ["Прочитали", 112], ["Дошли до формы", 66], ["Оставили заявку", 30]];
  return (
    <Frame>
      <Headline value="70%+" note="отказов — повод для аудита" mini={mini} />
      <In at={1}>
        <Win x={14} y={58} w={130} h={110} />
        <Bar x={26} y={84} w={70} h={6} o={0.3} />
        <Bar x={26} y={96} w={96} h={4} o={0.12} />
        <rect x={26} y={112} width={44} height={34} rx={5} fill={W(0.07)} />
        <rect x={76} y={112} width={44} height={34} rx={5} fill={W(0.07)} />
      </In>
      <In at={2}>
        <circle cx={58} cy={100} r={24} fill="url(#sp-glow)" className="sp-pulse" />
        <circle cx={98} cy={132} r={18} fill="url(#sp-glow)" className="sp-pulse" style={{ animationDelay: "0.5s" }} />
      </In>
      {steps.map(([label, w], i) => (
        <In key={label} at={3 + i * 0.6}>
          <rect x={170} y={64 + i * 26} width={w} height={18} rx={9} fill="url(#sp-ramp)" fillOpacity={0.36 - i * 0.07} stroke="var(--sp-from)" strokeOpacity={0.6 - i * 0.1} />
          <Txt x={w > 100 ? 178 : 170 + w + 8} y={76 + i * 26} size={10.9} fill={w > 100 ? "#fff" : W(0.85)}>{label}</Txt>
        </In>
      ))}
      <BeforeAfter before="Правим на глаз" after="Правим по данным" mini={mini} />
    </Frame>
  );
}

/** 02 · SEO-миграция. Каждый старый адрес ведёт на новый. */
function RedesignSeo({ mini }: SceneProps) {
  const rows: [string, string][] = [["/uslugi.php?id=4", "/uslugi/dizain"], ["/about-us.html", "/company"], ["/kontakty", "/contacts"]];
  return (
    <Frame>
      <Headline value="301" note="редирект на каждую страницу" mini={mini} />
      <In at={1}>
        <Txt x={14} y={68} size={10.1} fill={W(0.45)} ls={1.2}>БЫЛО</Txt>
        <Txt x={210} y={68} size={10.1} fill="var(--sp-from)" ls={1.2}>СТАЛО</Txt>
      </In>
      {rows.map(([from, to], i) => (
        <In key={from} at={2 + i * 0.9}>
          <rect x={14} y={76 + i * 30} width={104} height={22} rx={11} fill={W(0.04)} stroke={W(0.16)} />
          <Txt x={24} y={90 + i * 30} size={11.6} fill={W(0.6)}>{from}</Txt>
          <path d={`M 122 ${87 + i * 30} L 204 ${87 + i * 30}`} stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x={208} y={76 + i * 30} width={118} height={22} rx={11} fill={W(0.08)} stroke="var(--sp-from)" strokeOpacity="0.55" />
          <Txt x={218} y={90 + i * 30} size={11.6}>{to}</Txt>
          <Tick cx={312} cy={87 + i * 30} r={6} />
        </In>
      ))}
      <BeforeAfter before="Позиции обнуляются" after="Позиции переезжают с сайтом" mini={mini} />
    </Frame>
  );
}

/** 03 · Контент. Живые тексты остаются, устаревшие переписываются. */
function RedesignContent({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="75%" note="судят о компании по дизайну" mini={mini} />
      <In at={1}>
        <g opacity="0.6">
          <rect x={14} y={60} width={110} height={106} rx={10} fill={W(0.03)} stroke={W(0.2)} strokeDasharray="4 4" />
          <Bar x={26} y={74} w={60} h={5} o={0.2} />
          <rect x={26} y={88} width={86} height={20} rx={3} fill={W(0.07)} />
          <Bar x={26} y={118} w={86} h={4} o={0.12} />
          <Bar x={26} y={128} w={70} h={4} o={0.12} />
          <Bar x={26} y={138} w={80} h={4} o={0.12} />
        </g>
      </In>
      <In at={2}>
        <path d="M 130 113 L 164 113" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x={170} y={60} width={156} height={106} rx={10} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <rect x={180} y={70} width={136} height={34} rx={6} fill="url(#sp-ramp)" fillOpacity="0.3" />
        <Txt x={190} y={84} size={10.1} ls={1} weight={700}>ПЕРЕПИСАЛИ</Txt>
        <Bar x={190} y={91} w={88} h={5} o={0.4} />
        <rect x={180} y={110} width={136} height={24} rx={6} fill={W(0.08)} stroke={W(0.16)} />
        <Txt x={190} y={124} size={10.1} ls={1} fill={W(0.75)}>ОСТАВИЛИ — АКТУАЛЕН</Txt>
        <Cta x={180} y={142} w={72} h={16} label="Связаться" size={10.9} />
      </In>
      <BeforeAfter before="Устаревший вид" after="Новый вид, живые тексты" mini={mini} />
    </Frame>
  );
}

/** 04 · Скорость. Стрелка загрузки уходит в зелёную зону — меньше секунды. */
function RedesignSpeed({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="<1 с" note="целевая загрузка страницы" mini={mini} />
      <In at={1}>
        <path d="M 110 152 A 60 60 0 0 1 230 152" stroke={W(0.12)} strokeWidth="10" strokeLinecap="round" />
        <Txt x={100} y={168} size={11.6} fill={W(0.5)} anchor="middle">3 с</Txt>
        <Txt x={240} y={168} size={11.6} fill={W(0.5)} anchor="middle">0</Txt>
      </In>
      <In at={2}>
        <path d="M 110 152 A 60 60 0 0 1 230 152" stroke="url(#sp-ramp)" strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray="80 100" />
      </In>
      <In at={3}>
        <g style={{ transformOrigin: "170px 152px", transform: "rotate(48deg)" }}>
          <path d="M 170 152 L 170 108" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx={170} cy={152} r={5} fill="#fff" />
      </In>
      <In at={5}>
        <rect x={252} y={100} width={74} height={22} rx={11} fill={W(0.07)} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <Txt x={289} y={114} size={11.6} anchor="middle">−7% за секунду</Txt>
      </In>
      <BeforeAfter before="Сайт тормозит" after="Загрузка меньше секунды" mini={mini} />
    </Frame>
  );
}

/** Реестр сцен форматов /sites — ключ `site-<формат>`. */
export const SITES_SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  "site-landing": [LandingFocus, LandingSpeed, LandingMobile, LandingForm],
  "site-card": [CardFirst, CardTrust, CardServices, CardContacts],
  "site-turnkey": [TurnkeyCatalog, TurnkeyCrm, TurnkeyAssistant, TurnkeyAdmin],
  "site-assistant": [AssistantSource, AssistantHandoff, AssistantRules, AssistantCrm],
  "site-redesign": [RedesignAudit, RedesignSeo, RedesignContent, RedesignSpeed],
};
