"use client";

import { In, Frame, Headline, BeforeAfter, type SceneProps } from "@/components/home/ai/sceneKit";

// Сцены окошек направлений /content — по четыре на направление, по одной на
// каждый тезис справа (см. spotlightData.ts). Те же правила, что у сцен
// инструментов /ai: координаты 340×210, одна мысль на сцену, крупная цифра
// сверху, «было → стало» снизу, элементы приходят по очереди (<In at>).
//
// Тело сцены живёт в полосе y = 62…170: выше — цифра, ниже — «было → стало»
// (в карусельной карточке оно скрыто, viewBox там 340×176).

const W = "rgba(255,255,255,";
const SOFT = { fill: `${W}0.05)`, stroke: `${W}0.15)` } as const;

/* ═══ Презентационные фильмы ════════════════════════════════════════ */

/** 01 · Сценарий. Три задачи → один сценарий → готовый фильм. */
function PresBrief({ mini }: SceneProps) {
  const goals = ["Тендер", "Инвестор", "Выставка"];
  return (
    <Frame>
      <Headline value="3 мин" note="вместо получаса объяснений" mini={mini} />
      {goals.map((g, i) => (
        <In key={g} at={1 + i}>
          <rect x="14" y={66 + i * 32} width="80" height="24" rx="12" {...SOFT} />
          <circle cx="27" cy={78 + i * 32} r="3.4" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <text x="38" y={81.5 + i * 32} fill={`${W}0.85)`} fontSize="8.5" fontFamily="inherit">{g}</text>
          <path d={`M 96 ${78 + i * 32} C 120 ${78 + i * 32} 122 112 146 112`} stroke="var(--sp-from)" strokeOpacity="0.65" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}
      <In at={4}>
        <rect x="150" y="70" width="70" height="86" rx="8" fill={`${W}0.06)`} stroke="var(--sp-to)" strokeOpacity="0.55" />
        <text x="185" y="86" textAnchor="middle" fill={`${W}0.5)`} fontSize="6.5" letterSpacing="1.2" fontFamily="inherit">СЦЕНАРИЙ</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="160" y={94 + i * 11} width={i % 2 ? 36 : 48} height="4" rx="2" fill={`${W}0.28)`} />
        ))}
      </In>
      <In at={5}>
        <path d="M 224 113 L 240 113" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
        <rect x="244" y="82" width="84" height="60" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <circle cx="286" cy="112" r="13" fill="rgba(10,13,16,0.85)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <path d="M 282 106 L 293 112 L 282 118 Z" fill="#fff" />
        <circle cx="286" cy="112" r="19" stroke="var(--sp-from)" strokeOpacity="0.5" strokeDasharray="4 8" className="sp-spin" style={{ transformOrigin: "286px 112px" }} />
      </In>
      <BeforeAfter before="Папка слайдов" after="Один фильм под встречу" mini={mini} />
    </Frame>
  );
}

/** 02 · Масштаб. Кадр цеха — и графика там, куда не дотянется камера. */
function PresScale({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="450+" note="проектов за 8 лет" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="222" height="108" rx="12" fill={`${W}0.04)`} stroke={`${W}0.16)`} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={26 + i * 40} y={150 - (i % 2 ? 46 : 68)} width="28" height={i % 2 ? 46 : 68} rx="3" fill={`${W}0.09)`} />
        ))}
        <path d="M 14 150 L 236 150" stroke={`${W}0.2)`} />
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={2 + i}>
          <circle cx={54 + i * 62} cy="138" r="5" fill="var(--sp-from)" fillOpacity="0.85" />
          <rect x={49 + i * 62} y="144" width="10" height="12" rx="4" fill="var(--sp-from)" fillOpacity="0.5" />
        </In>
      ))}
      <In at={5}>
        <rect x="160" y="72" width="66" height="44" rx="8" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-to)" strokeDasharray="4 4" className="sp-pulse" />
        <text x="193" y="98" textAnchor="middle" fill="#fff" fontSize="7" letterSpacing="1.2" fontFamily="inherit">ГРАФИКА</text>
      </In>
      <In at={6}>
        <rect x="248" y="62" width="80" height="50" rx="10" fill={`${W}0.05)`} stroke="var(--sp-from)" strokeOpacity="0.5" />
        <circle cx="266" cy="80" r="5" fill="var(--sp-from)" />
        <text x="276" y="83" fill={`${W}0.8)`} fontSize="8" fontFamily="inherit">камера</text>
        <text x="258" y="102" fill={`${W}0.5)`} fontSize="7" fontFamily="inherit">на площадке</text>
        <rect x="248" y="120" width="80" height="50" rx="10" fill={`${W}0.05)`} stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="258" y="141" fill={`${W}0.8)`} fontSize="8" fontFamily="inherit">дорисовка</text>
        <text x="258" y="156" fill={`${W}0.5)`} fontSize="7" fontFamily="inherit">где не снять</text>
      </In>
      <BeforeAfter before="Экскурсия по цеху" after="Цех за 3 минуты" mini={mini} />
    </Frame>
  );
}

/** 03 · Версии. Одна съёмка — три формата показа. */
function PresVersions({ mini }: SceneProps) {
  const outs = [
    { name: "Полная", len: "3:00", w: 108 },
    { name: "Короткая", len: "0:45", w: 60 },
    { name: "Без звука", len: "стенд", w: 84 },
  ];
  return (
    <Frame>
      <Headline value="3 версии" note="из одной съёмки" mini={mini} />
      <In at={1}>
        <rect x="14" y="88" width="76" height="52" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.65" />
        <path d="M 46 104 L 62 114 L 46 124 Z" fill="#fff" />
        <text x="52" y="152" textAnchor="middle" fill={`${W}0.5)`} fontSize="6.5" letterSpacing="1.2" fontFamily="inherit">ИСХОДНИК</text>
      </In>
      {outs.map((o, i) => (
        <In key={o.name} at={2 + i}>
          <path d={`M 92 114 C 116 114 118 ${80 + i * 34} 138 ${80 + i * 34}`} stroke="var(--sp-from)" strokeOpacity="0.65" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="142" y={68 + i * 34} width="186" height="24" rx="12" {...SOFT} />
          <rect x="150" y={76 + i * 34} width={o.w} height="8" rx="4" fill="url(#sp-ramp)" fillOpacity={0.35 + i * 0.15} />
          <text x="270" y={83.5 + i * 34} fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">{o.name}</text>
          <text x="318" y={83.5 + i * 34} textAnchor="end" fill={`${W}0.5)`} fontSize="7" fontFamily="inherit">{o.len}</text>
        </In>
      ))}
      <BeforeAfter before="Один формат на всё" after="Версия под каждый показ" mini={mini} />
    </Frame>
  );
}

/** 04 · Доверие. Ссылка уходит раньше, чем начинается встреча. */
function PresTrust({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="до встречи" note="клиент уже знает, кто вы" mini={mini} />
      <In at={1}>
        <path d="M 22 138 L 318 138" stroke={`${W}0.18)`} strokeWidth="1.2" />
        {["ссылка", "просмотр", "встреча"].map((t, i) => (
          <g key={t}>
            <circle cx={50 + i * 120} cy="138" r="5" fill={i === 2 ? "var(--sp-to)" : "var(--sp-from)"} className={i === 1 ? "sp-pulse" : undefined} />
            <text x={50 + i * 120} y="158" textAnchor="middle" fill={`${W}0.6)`} fontSize="7.5" fontFamily="inherit">{t}</text>
          </g>
        ))}
      </In>
      <In at={2}>
        <rect x="26" y="74" width="48" height="34" rx="6" fill={`${W}0.06)`} stroke="var(--sp-from)" strokeOpacity="0.6" />
        <path d="M 26 78 L 50 96 L 74 78" stroke="var(--sp-from)" strokeOpacity="0.8" />
      </In>
      <In at={3}>
        <path d="M 78 92 C 110 92 120 84 150 84" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
        <rect x="154" y="66" width="72" height="42" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <path d="M 184 78 L 198 87 L 184 96 Z" fill="#fff" />
      </In>
      <In at={4}>
        <path d="M 230 87 L 262 87" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
        <circle cx="290" cy="86" r="22" fill="url(#sp-glow)" />
        <circle cx="290" cy="80" r="8" fill={`${W}0.15)`} stroke="var(--sp-to)" strokeOpacity="0.7" />
        <path d="M 274 100 C 276 90 304 90 306 100" fill={`${W}0.12)`} stroke="var(--sp-to)" strokeOpacity="0.7" />
        <path d="M 285 80 L 289 84 L 296 76" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </In>
      <BeforeAfter before="Объяснять с нуля" after="Сразу к делу" mini={mini} />
    </Frame>
  );
}

const PRESENTATION = [PresBrief, PresScale, PresVersions, PresTrust];

/* ═══ Рекламные ролики ═════════════════════════════════════════════ */

/** 01 · Крючок. Кривая удержания: без идеи зритель уходит в первые секунды. */
function AdHook({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="3 сек" note="решают, досмотрят ли" mini={mini} />
      <In at={1}>
        <path d="M 24 164 L 316 164 M 24 164 L 24 66" stroke={`${W}0.2)`} />
        <rect x="24" y="66" width="62" height="98" fill="var(--sp-from)" fillOpacity="0.1" />
        <text x="55" y="76" textAnchor="middle" fill="var(--sp-from)" fontSize="7" letterSpacing="1.2" fontFamily="inherit">3 СЕК</text>
      </In>
      <In at={2}>
        <path d="M 24 74 C 50 90 66 140 96 150 C 150 160 240 160 316 162" stroke={`${W}0.35)`} strokeWidth="1.6" strokeDasharray="4 5" />
        <text x="250" y="152" fill={`${W}0.45)`} fontSize="7.5" fontFamily="inherit">без идеи — листают</text>
      </In>
      <In at={3}>
        <path d="M 24 74 C 60 80 80 84 120 88 C 180 96 250 104 316 112" stroke="url(#sp-ramp)" strokeWidth="2.4" className="sp-flow" />
        <circle cx="86" cy="82" r="4.5" fill="var(--sp-from)" className="sp-pulse" />
        <text x="196" y="86" fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">с сильной идеей — досматривают</text>
      </In>
      <BeforeAfter before="Перечень преимуществ" after="Одна идея в 3 секунды" mini={mini} />
    </Frame>
  );
}

/** 02 · Площадка. Ритм монтажа зависит от того, где ролик живёт. */
function AdPlatform({ mini }: SceneProps) {
  const rows = [
    { name: "Соцсети", cuts: 11, len: "15 с" },
    { name: "Digital", cuts: 7, len: "30 с" },
    { name: "ТВ", cuts: 4, len: "60 с" },
  ];
  return (
    <Frame>
      <Headline value="15·30·60" note="хронометраж под площадку" mini={mini} />
      {rows.map((r, i) => {
        const y = 66 + i * 34;
        const step = 236 / r.cuts;
        return (
          <In key={r.name} at={1 + i}>
            <rect x="14" y={y} width="312" height="26" rx="13" {...SOFT} />
            <text x="26" y={y + 16} fill="#fff" fontSize="8.5" fontWeight="600" fontFamily="inherit">{r.name}</text>
            {Array.from({ length: r.cuts }).map((_, k) => (
              <rect key={k} x={78 + k * step} y={y + 6} width={step - 3} height="14" rx="3" fill="url(#sp-ramp)" fillOpacity={0.25 + (k % 3) * 0.15} />
            ))}
            <text x="318" y={y + 16} textAnchor="end" fill={`${W}0.55)`} fontSize="7.5" fontFamily="inherit">{r.len}</text>
          </In>
        );
      })}
      <BeforeAfter before="Один монтаж на всё" after="Ритм под площадку" mini={mini} />
    </Frame>
  );
}

/** 03 · Адаптации. Из одной съёмки — набор форматов. */
function AdFormats({ mini }: SceneProps) {
  const outs = [
    { w: 26, h: 46, l: "9:16" },
    { w: 40, h: 40, l: "1:1" },
    { w: 62, h: 36, l: "16:9" },
    { w: 34, h: 42, l: "4:5" },
  ];
  let x = 132;
  return (
    <Frame>
      <Headline value="1 → 4" note="формата из одной съёмки" mini={mini} />
      <In at={1}>
        <rect x="14" y="84" width="76" height="52" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.65" />
        <circle cx="52" cy="110" r="12" fill="rgba(10,13,16,0.85)" stroke="url(#sp-ramp)" strokeWidth="1.3" />
        <circle cx="52" cy="110" r="4" fill="#fff" />
      </In>
      {outs.map((o, i) => {
        const px = x;
        x += o.w + 16;
        return (
          <In key={o.l} at={2 + i}>
            <path d={`M 92 110 C 110 110 ${px - 14} ${100 + i * 4} ${px} ${110}`} stroke="var(--sp-from)" strokeOpacity="0.45" strokeWidth="1" className="sp-flow" style={{ animationDelay: `${i * 0.25}s` }} />
            <rect x={px} y={110 - o.h / 2 - 6} width={o.w} height={o.h} rx="6" fill="url(#sp-ramp)" fillOpacity={0.14 + i * 0.05} stroke="var(--sp-to)" strokeOpacity="0.6" />
            <text x={px + o.w / 2} y={110 + o.h / 2 + 8} textAnchor="middle" fill={`${W}0.6)`} fontSize="7" fontFamily="inherit">{o.l}</text>
          </In>
        );
      })}
      <BeforeAfter before="Съёмка под каждую" after="Одна смена — все форматы" mini={mini} />
    </Frame>
  );
}

/** 04 · Под ключ. Конвейер от идеи до цвета, одна команда. */
function AdPipeline({ mini }: SceneProps) {
  const nodes = ["Идея", "Кастинг", "Съёмка", "Монтаж", "Цвет"];
  return (
    <Frame>
      <Headline value="1 команда" note="от идеи до цветокоррекции" mini={mini} />
      <In at={1}>
        <path d="M 40 114 L 300 114" stroke={`${W}0.16)`} strokeWidth="1.4" />
        <path d="M 40 114 L 300 114" stroke="url(#sp-ramp)" strokeWidth="2.2" className="sp-flow" />
      </In>
      {nodes.map((n, i) => (
        <In key={n} at={2 + i}>
          <circle cx={40 + i * 65} cy="114" r="15" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
          <text x={40 + i * 65} y="117.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" fontFamily="inherit">{i + 1}</text>
          <text x={40 + i * 65} y="146" textAnchor="middle" fill={`${W}0.75)`} fontSize="8" fontFamily="inherit">{n}</text>
        </In>
      ))}
      <In at={7}>
        <circle cx="300" cy="114" r="21" stroke="var(--sp-from)" strokeOpacity="0.6" strokeDasharray="3 6" className="sp-spin" style={{ transformOrigin: "300px 114px" }} />
      </In>
      <BeforeAfter before="Пять подрядчиков" after="Одна команда и смета" mini={mini} />
    </Frame>
  );
}

const ADVERTISING = [AdHook, AdPlatform, AdFormats, AdPipeline];

/* ═══ Имиджевые видео ═════════════════════════════════════════════ */

/** 01 · Чувство. Факты не остаются в памяти — настроение остаётся. */
function ImgMood({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="60%" note="заказов — возвратные клиенты" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="112" height="98" rx="12" {...SOFT} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="26" y={80 + i * 20} width="6" height="6" rx="1.5" fill={`${W}0.3)`} />
            <rect x="38" y={81 + i * 20} width={62 - (i % 2) * 14} height="4" rx="2" fill={`${W}0.2)`} />
          </g>
        ))}
        <path d="M 22 72 L 118 158" stroke={`${W}0.4)`} strokeWidth="1.4" />
        <text x="70" y="176" textAnchor="middle" fill={`${W}0.4)`} fontSize="7" fontFamily="inherit">перечень фактов</text>
      </In>
      <In at={2}>
        <path d="M 132 114 L 152 114" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      <In at={3}>
        <circle cx="240" cy="114" r="50" fill="url(#sp-glow)" />
        <path d="M 156 114 C 176 70 196 70 208 114 S 240 158 256 114 S 296 72 324 112" stroke="url(#sp-ramp)" strokeWidth="2.4" className="sp-flow" />
        <path d="M 240 128 C 224 116 222 102 232 100 C 237 99 240 103 240 106 C 240 103 243 99 248 100 C 258 102 256 116 240 128 Z" fill="var(--sp-from)" className="sp-pulse" style={{ transformOrigin: "240px 112px" }} />
        <text x="240" y="176" textAnchor="middle" fill={`${W}0.75)`} fontSize="7" fontFamily="inherit">настроение</text>
      </In>
      <BeforeAfter before="Характеристики" after="Ощущение вместо фактов" mini={mini} />
    </Frame>
  );
}

/** 02 · Язык бренда. Палитра, шрифт и кадр складываются в узнаваемость. */
function ImgLanguage({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="без лого" note="узнают по кадру" mini={mini} />
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={1 + i}>
          <circle cx={34 + i * 34} cy="86" r="14" fill="url(#sp-ramp)" fillOpacity={0.9 - i * 0.2} stroke={`${W}0.25)`} />
        </In>
      ))}
      <In at={5}>
        <rect x="16" y="112" width="128" height="52" rx="10" {...SOFT} />
        <text x="30" y="148" fill="#fff" fontSize="30" fontWeight="700" fontFamily="inherit">Aa</text>
        <rect x="84" y="126" width="48" height="5" rx="2.5" fill={`${W}0.35)`} />
        <rect x="84" y="138" width="34" height="5" rx="2.5" fill={`${W}0.2)`} />
        <rect x="84" y="150" width="42" height="5" rx="2.5" fill={`${W}0.2)`} />
      </In>
      <In at={6}>
        <path d="M 152 108 C 172 108 176 114 196 114" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
        <rect x="200" y="66" width="128" height="98" rx="12" fill="url(#sp-ramp)" fillOpacity="0.14" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <rect x="212" y="78" width="104" height="52" rx="6" fill="url(#sp-ramp)" fillOpacity="0.25" />
        <circle cx="264" cy="104" r="12" fill="rgba(10,13,16,0.8)" stroke="#fff" strokeOpacity="0.7" />
        <path d="M 260 99 L 270 104 L 260 109 Z" fill="#fff" />
        <rect x="212" y="138" width="60" height="5" rx="2.5" fill={`${W}0.4)`} />
        <rect x="212" y="148" width="40" height="5" rx="2.5" fill={`${W}0.22)`} />
      </In>
      <BeforeAfter before="Ролик как у всех" after="Свой визуальный язык" mini={mini} />
    </Frame>
  );
}

/** 03 · Тон. Музыка и цвет настраиваются на характер бренда. */
function ImgTone({ mini }: SceneProps) {
  const sliders = [
    { l: "Тепло", v: 0.66 },
    { l: "Контраст", v: 0.42 },
    { l: "Насыщенность", v: 0.78 },
  ];
  return (
    <Frame>
      <Headline value="1 тон" note="на весь ролик" mini={mini} />
      {sliders.map((s, i) => (
        <In key={s.l} at={1 + i}>
          <text x="16" y={78 + i * 30} fill={`${W}0.7)`} fontSize="8" fontFamily="inherit">{s.l}</text>
          <rect x="16" y={85 + i * 30} width="130" height="4" rx="2" fill={`${W}0.14)`} />
          <rect x="16" y={85 + i * 30} width={130 * s.v} height="4" rx="2" fill="url(#sp-ramp)" />
          <circle cx={16 + 130 * s.v} cy={87 + i * 30} r="6" fill="#fff" stroke="var(--sp-from)" strokeWidth="1.6" />
        </In>
      ))}
      <In at={4}>
        <rect x="170" y="66" width="158" height="46" rx="10" fill="url(#sp-ramp)" fillOpacity="0.2" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <circle cx="200" cy="90" r="10" fill="#fff" fillOpacity="0.5" />
        <path d="M 226 100 L 250 80 L 268 96 L 290 72 L 322 104 L 226 104 Z" fill="rgba(10,13,16,0.35)" />
      </In>
      {Array.from({ length: 22 }).map((_, i) => (
        <In key={i} at={5 + i * 0.12}>
          <rect x={172 + i * 7} y={150 - (8 + ((i * 37) % 30))} width="4" height={16 + ((i * 37) % 30) * 2} rx="2" fill="var(--sp-from)" fillOpacity={0.4 + (i % 4) * 0.15} />
        </In>
      ))}
      <In at={7}>
        <text x="170" y="126" fill={`${W}0.55)`} fontSize="7" letterSpacing="1.2" fontFamily="inherit">МУЗЫКА ПОД ТОН БРЕНДА</text>
      </In>
      <BeforeAfter before="Звук и цвет врозь" after="Один тон на всё" mini={mini} />
    </Frame>
  );
}

/** 04 · Доверие. Один ролик — везде, где о компании складывается мнение. */
function ImgTrust({ mini }: SceneProps) {
  const dest = ["Сайт", "Соцсети", "Первая встреча"];
  return (
    <Frame>
      <Headline value="1 ролик" note="везде, где о вас судят" mini={mini} />
      <In at={1}>
        <circle cx="70" cy="114" r="34" fill="url(#sp-glow)" />
        <rect x="30" y="92" width="80" height="46" rx="10" fill="url(#sp-ramp)" fillOpacity="0.18" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <path d="M 62 104 L 80 115 L 62 126 Z" fill="#fff" />
      </In>
      {dest.map((d, i) => (
        <In key={d} at={2 + i}>
          <path d={`M 112 114 C 150 114 160 ${82 + i * 32} 196 ${82 + i * 32}`} stroke="var(--sp-from)" strokeOpacity="0.65" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="200" y={70 + i * 32} width="128" height="24" rx="12" {...SOFT} />
          <circle cx="213" cy={82 + i * 32} r="3.4" fill="var(--sp-to)" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <text x="224" y={85.5 + i * 32} fill="#fff" fontSize="8.5" fontFamily="inherit">{d}</text>
        </In>
      ))}
      <BeforeAfter before="Слова о себе" after="Ощущение доверия" mini={mini} />
    </Frame>
  );
}

const IMAGE = [ImgMood, ImgLanguage, ImgTone, ImgTrust];

/* ═══ AI-видео контент ══════════════════════════════════════════════ */

/** 01 · Невозможный кадр. Слово → кадр за секунды. */
function AiShot({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="дни" note="вместо недель на первую версию" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="312" height="26" rx="13" {...SOFT} />
        <text x="28" y="83" fill={`${W}0.8)`} fontSize="8.5" fontFamily="inherit">Ночной город, которого нет, дождь, неон…</text>
        <rect x="292" y="72" width="28" height="14" rx="7" fill="url(#sp-ramp)" />
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={2 + i}>
          <rect x={14 + i * 106} y="102" width="98" height="62" rx="10" fill="url(#sp-ramp)" fillOpacity={0.14 + i * 0.07} stroke="var(--sp-from)" strokeOpacity="0.55" />
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={22 + i * 106 + k * 16} y={150 - ((k * 13 + i * 9) % 32) - 12} width="12" height={((k * 13 + i * 9) % 32) + 12} rx="1.5" fill={`${W}0.16)`} />
          ))}
          <circle cx={84 + i * 106} cy="118" r="6" fill="#fff" fillOpacity="0.55" className="sp-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
        </In>
      ))}
      <BeforeAfter before="Нет локации — нет кадра" after="Кадр из описания" mini={mini} />
    </Frame>
  );
}

/** 02 · Голос. Аватар говорит на любом языке. */
function AiVoice({ mini }: SceneProps) {
  const langs = ["RU", "EN", "ES", "ZH"];
  return (
    <Frame>
      <Headline value="1 голос" note="на любом языке" mini={mini} />
      <In at={1}>
        <circle cx="66" cy="116" r="40" fill="url(#sp-glow)" />
        <circle cx="66" cy="106" r="16" fill={`${W}0.12)`} stroke="url(#sp-ramp)" strokeWidth="1.5" />
        <path d="M 36 148 C 38 124 94 124 96 148" fill={`${W}0.08)`} stroke="url(#sp-ramp)" strokeWidth="1.5" />
        <circle cx="66" cy="106" r="24" stroke="var(--sp-from)" strokeOpacity="0.5" strokeDasharray="3 7" className="sp-spin" style={{ transformOrigin: "66px 106px" }} />
      </In>
      {langs.map((l, i) => (
        <In key={l} at={2 + i}>
          <path d={`M 104 116 C 130 116 136 ${78 + i * 24} 160 ${78 + i * 24}`} stroke="var(--sp-from)" strokeOpacity="0.6" strokeWidth="1.1" className="sp-flow" style={{ animationDelay: `${i * 0.25}s` }} />
          <rect x="164" y={68 + i * 24} width="164" height="20" rx="10" {...SOFT} />
          <text x="176" y={82 + i * 24} fill="#fff" fontSize="8.5" fontWeight="700" fontFamily="inherit">{l}</text>
          {Array.from({ length: 16 }).map((_, k) => (
            <rect key={k} x={200 + k * 7} y={78 + i * 24 - (2 + ((k * 5 + i * 3) % 6))} width="3.5" height={4 + ((k * 5 + i * 3) % 6) * 2} rx="1.7" fill="var(--sp-from)" fillOpacity={0.5 + (k % 3) * 0.15} />
          ))}
        </In>
      ))}
      <BeforeAfter before="Дубляж: недели работы" after="Тот же голос, любой язык" mini={mini} />
    </Frame>
  );
}

/** 03 · Гибрид. Живые кадры и AI-графика в одной ленте. */
function AiHybrid({ mini }: SceneProps) {
  const cells = ["live", "ai", "live", "ai", "ai", "live"];
  return (
    <Frame>
      <Headline value="живое + AI" note="в одном ролике" mini={mini} />
      {cells.map((c, i) => (
        <In key={i} at={1 + i * 0.7}>
          <rect
            x={14 + i * 52}
            y="86"
            width="46"
            height="56"
            rx="8"
            fill={c === "ai" ? "url(#sp-ramp)" : `${W}0.07)`}
            fillOpacity={c === "ai" ? 0.22 : 1}
            stroke={c === "ai" ? "var(--sp-from)" : `${W}0.2)`}
            strokeDasharray={c === "ai" ? "4 3" : undefined}
          />
          {c === "ai" ? (
            <path d={`M ${25 + i * 52} 128 L ${37 + i * 52} 100 L ${49 + i * 52} 128`} stroke="var(--sp-from)" strokeWidth="1.4" className="sp-flow" />
          ) : (
            <circle cx={37 + i * 52} cy="112" r="8" fill={`${W}0.28)`} />
          )}
        </In>
      ))}
      <In at={6}>
        <rect x="14" y="152" width="10" height="6" rx="3" fill={`${W}0.3)`} />
        <text x="30" y="158" fill={`${W}0.6)`} fontSize="7.5" fontFamily="inherit">живая съёмка</text>
        <rect x="120" y="152" width="10" height="6" rx="3" fill="var(--sp-from)" fillOpacity="0.6" />
        <text x="136" y="158" fill={`${W}0.6)`} fontSize="7.5" fontFamily="inherit">AI-кадр — там, где камера бессильна</text>
      </In>
      <BeforeAfter before="Съёмка или ничего" after="Камера + AI в одном" mini={mini} />
    </Frame>
  );
}

/** 04 · Варианты. Тот же бюджет — втрое больше идей на выбор. */
function AiVariants({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="×3" note="вариантов на том же бюджете" mini={mini} />
      <In at={1}>
        <rect x="14" y="88" width="66" height="50" rx="10" {...SOFT} />
        <text x="47" y="116" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">Бриф</text>
      </In>
      {Array.from({ length: 6 }).map((_, i) => {
        const cx = 118 + (i % 3) * 68;
        const cy = 66 + Math.floor(i / 3) * 52;
        return (
          <In key={i} at={2 + i * 0.6}>
            <path d={`M 82 113 C 98 113 104 ${cy + 22} ${cx - 2} ${cy + 22}`} stroke="var(--sp-from)" strokeOpacity="0.35" strokeWidth="1" className="sp-flow" style={{ animationDelay: `${i * 0.2}s` }} />
            <rect x={cx} y={cy} width="60" height="44" rx="8" fill="url(#sp-ramp)" fillOpacity={0.1 + (i % 3) * 0.06} stroke={i === 4 ? "var(--sp-to)" : `${W}0.16)`} strokeWidth={i === 4 ? 1.8 : 1} />
            <rect x={cx + 8} y={cy + 30} width="26" height="4" rx="2" fill={`${W}0.3)`} />
            {i === 4 && <path d={`M ${cx + 42} ${cy + 10} l 5 5 l 9 -10`} stroke="var(--sp-to)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sp-pulse" />}
          </In>
        );
      })}
      <BeforeAfter before="Одна дорогая ставка" after="Выбор из готовых идей" mini={mini} />
    </Frame>
  );
}

const AI_VIDEO = [AiShot, AiVoice, AiHybrid, AiVariants];

/* ═══ Графика и анимация ════════════════════════════════════════════ */

/** 01 · Невидимое. Разрез изделия — то, что не снять объективом. */
function GfxCutaway({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="разрез" note="показываем то, что не снять" mini={mini} />
      <In at={1}>
        <rect x="26" y="70" width="150" height="90" rx="12" fill={`${W}0.05)`} stroke={`${W}0.22)`} />
        <path d="M 26 100 L 176 100" stroke={`${W}0.12)`} />
      </In>
      <In at={2}>
        <circle cx="76" cy="126" r="20" stroke="url(#sp-ramp)" strokeWidth="2.4" strokeDasharray="7 5" className="sp-spin" style={{ transformOrigin: "76px 126px" }} />
        <circle cx="76" cy="126" r="6" fill="var(--sp-from)" />
      </In>
      <In at={3}>
        <circle cx="128" cy="118" r="13" stroke="var(--sp-to)" strokeWidth="2.2" strokeDasharray="5 4" className="sp-spin" style={{ transformOrigin: "128px 118px", animationDirection: "reverse" }} />
        <circle cx="128" cy="118" r="4" fill="var(--sp-to)" />
      </In>
      <In at={4}>
        <path d="M 186 66 L 186 164" stroke="var(--sp-from)" strokeWidth="1.4" strokeDasharray="5 4" />
        <path d="M 180 74 L 192 74 M 180 156 L 192 156" stroke="var(--sp-from)" />
      </In>
      <In at={5}>
        <rect x="204" y="70" width="124" height="90" rx="12" fill="url(#sp-ramp)" fillOpacity="0.1" stroke="var(--sp-from)" strokeOpacity="0.5" />
        <text x="266" y="92" textAnchor="middle" fill={`${W}0.55)`} fontSize="7" letterSpacing="1.2" fontFamily="inherit">ВИД ИЗНУТРИ</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="218" y={104 + i * 16} width={92 - i * 20} height="6" rx="3" fill="url(#sp-ramp)" fillOpacity={0.5 - i * 0.12} />
        ))}
      </In>
      <BeforeAfter before="«Там сложный механизм»" after="Механизм виден и понятен" mini={mini} />
    </Frame>
  );
}

/** 02 · 3D-продукт. Взрыв-схема: изделие разбирается на детали. */
function Gfx3d({ mini }: SceneProps) {
  const parts = [
    { x: 150, y: 70, w: 52, h: 18 },
    { x: 146, y: 104, w: 60, h: 20 },
    { x: 150, y: 140, w: 52, h: 18 },
  ];
  return (
    <Frame>
      <Headline value="360°" note="продукт без съёмочной смены" mini={mini} />
      <In at={1}>
        <ellipse cx="176" cy="114" rx="98" ry="22" stroke={`${W}0.16)`} strokeDasharray="4 6" />
        <circle cx="76" cy="114" r="5" fill="var(--sp-from)" className="sp-pulse" />
      </In>
      {parts.map((p, i) => (
        <In key={i} at={2 + i}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="6" fill="url(#sp-ramp)" fillOpacity={0.2 + i * 0.1} stroke="var(--sp-from)" strokeOpacity="0.7" />
          <path d={`M ${p.x + p.w + 4} ${p.y + p.h / 2} L 258 ${p.y + p.h / 2}`} stroke={`${W}0.3)`} strokeDasharray="2 3" />
          <text x="262" y={p.y + p.h / 2 + 3} fill={`${W}0.75)`} fontSize="8" fontFamily="inherit">{["Корпус", "Механизм", "Основание"][i]}</text>
        </In>
      ))}
      <In at={5}>
        <path d="M 176 90 L 176 102 M 176 126 L 176 138" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
        <circle cx="290" cy="90" r="3" fill="var(--sp-to)" className="sp-pulse" />
      </In>
      <BeforeAfter before="Прототипа ещё нет" after="Изделие со всех сторон" mini={mini} />
    </Frame>
  );
}

/** 03 · Данные. Таблица превращается в картинку, которую понимают. */
function GfxData({ mini }: SceneProps) {
  const bars = [30, 52, 40, 72, 60, 92];
  return (
    <Frame>
      <Headline value="1 мин" note="вместо страницы текста" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="96" height="98" rx="10" {...SOFT} />
        {[0, 1, 2, 3, 4].map((r) => (
          <g key={r}>
            <rect x="22" y={76 + r * 17} width="30" height="4" rx="2" fill={`${W}0.28)`} />
            <rect x="60" y={76 + r * 17} width={r % 2 ? 22 : 34} height="4" rx="2" fill={`${W}0.16)`} />
          </g>
        ))}
      </In>
      <In at={2}>
        <path d="M 114 114 L 138 114" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      </In>
      {bars.map((h, i) => (
        <In key={i} at={3 + i * 0.6}>
          <rect x={148 + i * 26} y={164 - h} width="16" height={h} rx="4" fill="url(#sp-ramp)" fillOpacity={0.25 + i * 0.12} />
        </In>
      ))}
      <In at={7}>
        <path d="M 156 132 C 190 124 220 108 300 74" stroke="var(--sp-from)" strokeWidth="1.8" className="sp-flow" />
        <circle cx="300" cy="74" r="4" fill="var(--sp-from)" className="sp-pulse" />
      </In>
      <BeforeAfter before="Таблица на 10 экранов" after="Понятно за одну минуту" mini={mini} />
    </Frame>
  );
}

/** 04 · Заставки. Логотип собирается из частей — узнаваемый жест. */
function GfxLogo({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="7 сек" note="и логотип оживает" mini={mini} />
      <In at={1}>
        <circle cx="170" cy="116" r="46" fill="url(#sp-glow)" />
      </In>
      <In at={2}>
        <rect x="128" y="88" width="34" height="34" rx="9" fill="url(#sp-ramp)" fillOpacity="0.9" />
      </In>
      <In at={3}>
        <circle cx="190" cy="105" r="17" fill="none" stroke="var(--sp-to)" strokeWidth="4" />
      </In>
      <In at={4}>
        <path d="M 128 138 L 152 138 L 168 150 L 196 128" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sp-flow" />
      </In>
      <In at={5}>
        <circle cx="170" cy="116" r="58" stroke="var(--sp-from)" strokeOpacity="0.5" strokeDasharray="3 8" className="sp-spin" style={{ transformOrigin: "170px 116px" }} />
        <text x="170" y="176" textAnchor="middle" fill="#fff" fontSize="9" letterSpacing="3" fontFamily="inherit">BRAND</text>
      </In>
      {[[70, 84], [268, 96], [86, 152], [258, 150]].map(([x, y], i) => (
        <In key={i} at={5 + i * 0.5}>
          <path d={`M ${x} ${y - 6} L ${x} ${y + 6} M ${x - 6} ${y} L ${x + 6} ${y}`} stroke="var(--sp-from)" strokeWidth="1.4" className="sp-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
        </In>
      ))}
      <BeforeAfter before="Статичный логотип" after="Анимация на всех видео" mini={mini} />
    </Frame>
  );
}

const GRAPHICS = [GfxCutaway, Gfx3d, GfxData, GfxLogo];

/* ═══ Расширенные окна страниц направлений: сцены 5 и 6 ═════════════ */

/** Презентация 05 · Тендер: фильм показывает масштаб там, где слайды равны. */
function PresTender({ mini }: SceneProps) {
  const bids = [46, 58, 40, 96];
  return (
    <Frame>
      <Headline value="в шорт-листе" note="фильм выделяет среди заявок" mini={mini} />
      {bids.map((h, i) => (
        <In key={i} at={1 + i * 0.7}>
          <rect x={40 + i * 66} y={164 - h} width="42" height={h} rx="7" fill={i === 3 ? "url(#sp-ramp)" : `${W}0.1)`} stroke={i === 3 ? "var(--sp-from)" : `${W}0.18)`} />
          <text x={61 + i * 66} y="176" textAnchor="middle" fill={`${W}0.5)`} fontSize="7" fontFamily="inherit">{i === 3 ? "вы" : `заявка ${i + 1}`}</text>
        </In>
      ))}
      <In at={5}>
        <path d="M 250 66 L 254 76 L 265 77 L 257 84 L 259 95 L 250 89 L 241 95 L 243 84 L 235 77 L 246 76 Z" fill="var(--sp-from)" className="sp-pulse" style={{ transformOrigin: "250px 82px" }} />
      </In>
      <BeforeAfter before="Стопка одинаковых слайдов" after="Заявку запоминают" mini={mini} />
    </Frame>
  );
}

/** Презентация 06 · Выставка: экран на стенде работает без звука и без вас. */
function PresExpo({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="без звука" note="стенд работает без вас" mini={mini} />
      <In at={1}>
        <rect x="24" y="62" width="150" height="86" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <path d="M 88 86 L 112 105 L 88 124 Z" fill="#fff" className="sp-pulse" style={{ transformOrigin: "100px 105px" }} />
        <path d="M 64 148 L 60 168 M 134 148 L 138 168 M 50 168 L 148 168" stroke={`${W}0.3)`} strokeWidth="1.4" />
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} at={2 + i}>
          <circle cx={216 + i * 34} cy="132" r="6" fill={`${W}0.3)`} />
          <rect x={210 + i * 34} y="140" width="12" height="20" rx="5" fill={`${W}0.16)`} />
          <path d={`M ${216 + i * 34} 118 L ${196 + i * 22} 100`} stroke="var(--sp-from)" strokeOpacity="0.5" strokeDasharray="2 4" className="sp-flow" />
        </In>
      ))}
      <In at={5}>
        <path d="M 226 76 L 238 76 L 248 68 L 248 92 L 238 84 L 226 84 Z" stroke={`${W}0.6)`} strokeWidth="1.4" />
        <path d="M 226 68 L 256 96" stroke="var(--sp-to)" strokeWidth="2" />
      </In>
      <BeforeAfter before="Ждёте, пока подойдут" after="Взгляд останавливает экран" mini={mini} />
    </Frame>
  );
}

/** Реклама 05 · Звук держит внимание — дорожки собираются под монтаж. */
function AdSound({ mini }: SceneProps) {
  const tracks = ["Музыка", "Голос", "Эффекты"];
  return (
    <Frame>
      <Headline value="звук = ритм" note="собирается под монтаж" mini={mini} />
      {tracks.map((t, i) => (
        <In key={t} at={1 + i}>
          <rect x="14" y={66 + i * 32} width="312" height="26" rx="13" {...SOFT} />
          <text x="26" y={82 + i * 32} fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">{t}</text>
          {Array.from({ length: 30 }).map((_, k) => (
            <rect key={k} x={90 + k * 7.6} y={79 + i * 32 - (2 + ((k * (3 + i)) % 7))} width="3.6" height={4 + ((k * (3 + i)) % 7) * 2} rx="1.8" fill="var(--sp-from)" fillOpacity={0.3 + (k % 4) * 0.15} />
          ))}
        </In>
      ))}
      <In at={5}>
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${110 + k * 62} 62 L ${110 + k * 62} 166`} stroke="var(--sp-to)" strokeOpacity="0.55" strokeDasharray="3 4" />
        ))}
      </In>
      <BeforeAfter before="Музыка поверх картинки" after="Звук бьёт в склейки" mini={mini} />
    </Frame>
  );
}

/** Реклама 06 · От брифа до идеи и сметы. */
function AdQuote({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="идея + смета" note="в ответ на бриф" mini={mini} />
      <In at={1}>
        <rect x="14" y="70" width="98" height="84" rx="12" {...SOFT} />
        <text x="26" y="88" fill={`${W}0.5)`} fontSize="7" letterSpacing="1.2" fontFamily="inherit">БРИФ</text>
        {["Продукт", "Площадки", "Срок"].map((t, i) => (
          <g key={t}>
            <circle cx="28" cy={102 + i * 16} r="3" fill="var(--sp-from)" />
            <text x="37" y={105 + i * 16} fill={`${W}0.8)`} fontSize="8" fontFamily="inherit">{t}</text>
          </g>
        ))}
      </In>
      <In at={2}>
        <path d="M 116 112 L 148 112" stroke="var(--sp-to)" strokeWidth="1.5" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="152" y="70" width="88" height="38" rx="10" fill="url(#sp-ramp)" fillOpacity="0.16" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <text x="196" y="94" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" fontFamily="inherit">Идея</text>
      </In>
      <In at={4}>
        <rect x="152" y="116" width="88" height="38" rx="10" {...SOFT} />
        <text x="196" y="140" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" fontFamily="inherit">Смета</text>
      </In>
      <In at={5}>
        <rect x="250" y="70" width="76" height="84" rx="12" fill={`${W}0.04)`} stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="288" y="106" textAnchor="middle" fill="var(--sp-to)" fontSize="20" fontWeight="700" fontFamily="inherit">1 день</text>
        <text x="288" y="122" textAnchor="middle" fill={`${W}0.55)`} fontSize="7" fontFamily="inherit">на ответ</text>
      </In>
      <BeforeAfter before="Ждать неделю" after="Идея и смета в течение дня" mini={mini} />
    </Frame>
  );
}

/** Имидж 05 · Возвраты: клиенты приходят снова. */
function ImgReturn({ mini }: SceneProps) {
  const c = 2 * Math.PI * 44;
  return (
    <Frame>
      <Headline value="6 из 10" note="заказов — от тех, кто уже работал с нами" mini={mini} />
      <In at={1}>
        <circle cx="100" cy="116" r="44" stroke={`${W}0.12)`} strokeWidth="10" />
        <circle cx="100" cy="116" r="44" stroke="url(#sp-ramp)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${c * 0.6} ${c}`} transform="rotate(-90 100 116)" />
        <text x="100" y="122" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="inherit">60%</text>
      </In>
      {["Вернулись", "Порекомендовали", "Новые"].map((t, i) => (
        <In key={t} at={2 + i}>
          <rect x="176" y={78 + i * 30} width="150" height="22" rx="11" {...SOFT} />
          <circle cx="189" cy={89 + i * 30} r="3.4" fill={i === 2 ? `${W}0.35)` : "var(--sp-from)"} />
          <text x="200" y={92.5 + i * 30} fill="#fff" fontSize="8.5" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <BeforeAfter before="Каждый раз с нуля" after="Возвращаются сами" mini={mini} />
    </Frame>
  );
}

/** Имидж 06 · Первое впечатление складывается за секунды. */
function ImgFirst({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="секунды" note="решают первое впечатление" mini={mini} />
      <In at={1}>
        <path d="M 24 164 L 316 164 M 24 164 L 24 66" stroke={`${W}0.2)`} />
        <path d="M 24 150 C 70 146 90 120 130 96 C 180 76 250 74 316 72" stroke="url(#sp-ramp)" strokeWidth="2.4" className="sp-flow" />
      </In>
      <In at={2}>
        <circle cx="130" cy="96" r="5" fill="var(--sp-from)" className="sp-pulse" />
        <rect x="140" y="112" width="112" height="26" rx="13" fill={`${W}0.07)`} stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="196" y="129" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">ролик открыт</text>
      </In>
      <In at={3}>
        <text x="30" y="178" fill={`${W}0.45)`} fontSize="7" fontFamily="inherit">первый контакт</text>
        <text x="316" y="178" textAnchor="end" fill={`${W}0.45)`} fontSize="7" fontFamily="inherit">выбор</text>
      </In>
      <BeforeAfter before="Впечатление складывается само" after="Вы задаёте его роликом" mini={mini} />
    </Frame>
  );
}

/** AI-видео 05 · Продукта ещё нет — образ уже есть. */
function AiNoProduct({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="до цеха" note="показываем продукт, которого ещё нет" mini={mini} />
      <In at={1}>
        <rect x="24" y="76" width="84" height="70" rx="10" stroke={`${W}0.3)`} strokeDasharray="4 4" />
        <text x="66" y="116" textAnchor="middle" fill={`${W}0.4)`} fontSize="7.5" fontFamily="inherit">эскиз</text>
      </In>
      <In at={2}>
        <path d="M 112 111 L 148 111" stroke="var(--sp-to)" strokeWidth="1.5" className="sp-flow" />
        <circle cx="130" cy="111" r="11" fill="rgba(10,13,16,0.9)" stroke="url(#sp-ramp)" />
        <text x="130" y="114" textAnchor="middle" fill="#fff" fontSize="7.5" fontFamily="inherit">AI</text>
      </In>
      <In at={3}>
        <circle cx="240" cy="112" r="56" fill="url(#sp-glow)" />
        <path d="M 200 130 L 240 98 L 280 130 L 240 148 Z" fill="url(#sp-ramp)" fillOpacity="0.5" stroke="var(--sp-from)" />
        <path d="M 200 130 L 200 112 L 240 80 L 280 112 L 280 130" stroke="var(--sp-from)" strokeOpacity="0.7" />
      </In>
      <BeforeAfter before="Ждать прототип" after="Ролик до первого образца" mini={mini} />
    </Frame>
  );
}

/** AI-видео 06 · Честно: где AI уместен, а где нужна камера. */
function AiHonest({ mini }: SceneProps) {
  const good = ["Недоступная локация", "Аватар и голос", "Много вариантов"];
  const cam = ["Живые эмоции", "Лицо основателя", "Реальный продукт"];
  return (
    <Frame>
      <Headline value="честно" note="где AI уместен, а где нужна камера" mini={mini} />
      <In at={1}>
        <rect x="14" y="66" width="152" height="98" rx="12" fill="url(#sp-ramp)" fillOpacity="0.1" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="26" y="82" fill="var(--sp-from)" fontSize="7.5" letterSpacing="1.2" fontFamily="inherit">AI УМЕСТЕН</text>
      </In>
      {good.map((t, i) => (
        <In key={t} at={2 + i * 0.6}>
          <path d={`M 26 ${98 + i * 22} l 4 4 l 8 -9`} stroke="var(--sp-from)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="46" y={102 + i * 22} fill="#fff" fontSize="8.5" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <In at={4}>
        <rect x="174" y="66" width="152" height="98" rx="12" {...SOFT} />
        <text x="186" y="82" fill={`${W}0.5)`} fontSize="7.5" letterSpacing="1.2" fontFamily="inherit">НУЖНА КАМЕРА</text>
      </In>
      {cam.map((t, i) => (
        <In key={t} at={5 + i * 0.6}>
          <circle cx="192" cy={99 + i * 22} r="3.4" fill={`${W}0.45)`} />
          <text x="204" y={102 + i * 22} fill={`${W}0.85)`} fontSize="8.5" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <BeforeAfter before="AI везде, лишь бы дешевле" after="Каждому кадру — свой инструмент" mini={mini} />
    </Frame>
  );
}

/** Графика 05 · Процесс внутри материала. */
function GfxProcess({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="изнутри" note="процесс, который не увидеть" mini={mini} />
      <In at={1}>
        <rect x="24" y="90" width="292" height="44" rx="22" fill={`${W}0.05)`} stroke={`${W}0.2)`} />
      </In>
      {Array.from({ length: 9 }).map((_, i) => (
        <In key={i} at={2 + i * 0.35}>
          <circle cx={54 + i * 30} cy="112" r={4 + (i % 3)} fill="var(--sp-from)" fillOpacity={0.35 + (i % 3) * 0.25} className="sp-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        </In>
      ))}
      <In at={6}>
        <rect x="132" y="70" width="76" height="16" rx="8" fill={`${W}0.07)`} stroke="var(--sp-to)" strokeOpacity="0.6" />
        <text x="170" y="81" textAnchor="middle" fill="#fff" fontSize="7.5" fontFamily="inherit">нагрев 900 °C</text>
        <path d="M 170 86 L 170 96" stroke="var(--sp-to)" strokeDasharray="2 3" />
      </In>
      <BeforeAfter before="«Там что-то происходит»" after="Виден каждый этап" mini={mini} />
    </Frame>
  );
}

/** Графика 06 · Сложная технология за сорок секунд. */
function GfxForty({ mini }: SceneProps) {
  const c = 2 * Math.PI * 40;
  return (
    <Frame>
      <Headline value="40 сек" note="и технология понятна" mini={mini} />
      <In at={1}>
        <circle cx="90" cy="116" r="40" stroke={`${W}0.12)`} strokeWidth="8" />
        <circle cx="90" cy="116" r="40" stroke="url(#sp-ramp)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * 0.8} ${c}`} transform="rotate(-90 90 116)" />
        <text x="90" y="122" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="inherit">0:40</text>
      </In>
      {["Что это", "Как устроено", "Что даёт"].map((t, i) => (
        <In key={t} at={2 + i}>
          <rect x="160" y={74 + i * 30} width="166" height="22" rx="11" {...SOFT} />
          <text x="174" y={88.5 + i * 30} fill="#fff" fontSize="8.5" fontFamily="inherit">{i + 1}. {t}</text>
          <rect x="280" y={82 + i * 30} width={30 - i * 6} height="6" rx="3" fill="var(--sp-from)" fillOpacity="0.6" />
        </In>
      ))}
      <BeforeAfter before="Страница сложного текста" after="Понятно за сорок секунд" mini={mini} />
    </Frame>
  );
}

export const CONTENT_SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  presentation: PRESENTATION,
  advertising: ADVERTISING,
  image: IMAGE,
  "ai-video": AI_VIDEO,
  graphics: GRAPHICS,
  // Расширенные окна на страницах направлений: те же четыре + две новые.
  "presentation:deep": [...PRESENTATION, PresTender, PresExpo],
  "advertising:deep": [...ADVERTISING, AdSound, AdQuote],
  "image:deep": [...IMAGE, ImgReturn, ImgFirst],
  "ai-video:deep": [...AI_VIDEO, AiNoProduct, AiHonest],
  "graphics:deep": [...GRAPHICS, GfxProcess, GfxForty],
};
