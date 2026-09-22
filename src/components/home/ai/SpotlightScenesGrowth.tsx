// Сцены инструментов «Персонализация» (personalization), «AI-аналитика»
// (analytics) и «Обучение команды» (training). Свой файл — по договорённости
// с соседней сессией, которая параллельно правит SpotlightScene.tsx; общие
// детали лежат в sceneKit.tsx.

import { In, Frame, Headline, BeforeAfter, type SceneProps } from "@/components/home/ai/sceneKit";

/* ── Персонализация ─────────────────────────────────────────────────── */

/** 01 · Сегменты. Аудитория делится по поведению, а не по догадкам. */
function PersSegments({ mini }: SceneProps) {
  const groups = [["Новички", 3], ["Постоянные", 5], ["Купили", 2], ["Смотрели", 4]] as const;
  return (
    <Frame>
      <Headline value="57%" note="маркетологов уже персонализируют" mini={mini} />
      {Array.from({ length: 14 }).map((_, i) => (
        <In key={i} at={1 + i * 0.15}>
          <circle cx={26 + (i % 7) * 15} cy={78 + Math.floor(i / 7) * 16} r="4.5" fill="rgba(255,255,255,0.3)" />
        </In>
      ))}
      <In at={4}>
        <path d="M 138 92 L 168 92" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      {groups.map(([name, n], i) => (
        <In key={name} at={5 + i}>
          <rect x={174 + (i % 2) * 80} y={62 + Math.floor(i / 2) * 50} width="72" height="42" rx="10" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.45" />
          <text x={184 + (i % 2) * 80} y={80 + Math.floor(i / 2) * 50} fill="#fff" fontSize="12.4" fontFamily="inherit">{name}</text>
          {Array.from({ length: n }).map((_, j) => (
            <circle key={j} cx={186 + (i % 2) * 80 + j * 9} cy={93 + Math.floor(i / 2) * 50} r="3" fill="var(--sp-from)" fillOpacity="0.85" />
          ))}
        </In>
      ))}
      <BeforeAfter before="Одна рассылка на всех" after="Сегменты по реальному поведению" mini={mini} />
    </Frame>
  );
}

/** 02 · Шаблон. Структура и тон неизменны — меняется содержание. */
function PersTemplate({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="1 голос" note="бренда во всех версиях" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="150" height="100" rx="12" fill="rgba(255,255,255,0.05)" stroke="var(--sp-from)" strokeOpacity="0.5" strokeDasharray="5 5" />
        <text x="26" y="78" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">ШАБЛОН · НЕ МЕНЯЕТСЯ</text>
      </In>
      {[["Приветствие", 92], ["Оффер", 118], ["Призыв", 80]].map(([k, w], i) => (
        <In key={k as string} at={2 + i}>
          <rect x="26" y={88 + i * 22} width={w as number} height="16" rx="6" fill="rgba(255,255,255,0.09)" />
          <text x="34" y={99 + i * 22} fill="rgba(255,255,255,0.75)" fontSize="11.6" fontFamily="inherit">{k as string}</text>
        </In>
      ))}
      <In at={5}>
        <path d="M 168 112 L 192 112" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <rect x="196" y="76" width="130" height="72" rx="12" fill="rgba(255,255,255,0.07)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="208" y="94" fill="var(--sp-from)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">ТОН БРЕНДА</text>
        <text x="208" y="110" fill="#fff" fontSize="12.4" fontFamily="inherit">Меняем содержание,</text>
        <text x="208" y="123" fill="#fff" fontSize="12.4" fontFamily="inherit">а не голос</text>
      </In>
      <BeforeAfter before="Каждая версия звучит по-своему" after="Один голос во всех версиях" mini={mini} />
    </Frame>
  );
}

/** 03 · Версии. Из одного шаблона — своя версия под каждый сегмент. */
function PersVersions({ mini }: SceneProps) {
  const v = [["Новичок", "Скидка на первый заказ"], ["Постоянный", "Ваш бонус за лояльность"], ["Смотрел", "Вы смотрели — вернитесь"]];
  return (
    <Frame>
      <Headline value="×3" note="версии из одного шаблона" mini={mini} />
      <In at={1}>
        <rect x="14" y="88" width="70" height="36" rx="10" fill="url(#sp-ramp)" fillOpacity="0.22" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="49" y="110" textAnchor="middle" fill="#fff" fontSize="12.4" fontFamily="inherit">Шаблон</text>
      </In>
      {v.map(([seg, line], i) => (
        <In key={seg} at={2 + i}>
          <path d={`M 86 106 C 108 106 112 ${74 + i * 34} 134 ${74 + i * 34}`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="138" y={60 + i * 34} width="188" height="28" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.13)" />
          <text x="150" y={72 + i * 34} fill="var(--sp-from)" fontSize="10.9" letterSpacing="1" fontFamily="inherit">{seg.toUpperCase()}</text>
          <text x="150" y={83 + i * 34} fill="#fff" fontSize="12.4" fontFamily="inherit">{line}</text>
        </In>
      ))}
      <BeforeAfter before="С нуля под каждый сегмент" after="Собрано из одного шаблона" mini={mini} />
    </Frame>
  );
}

/** 04 · Тестирование. Решают цифры на живом трафике, а не вкус. */
function PersTest({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="+41%" note="дохода от персонализации рассылок" mini={mini} />
      {[["A", 38, false], ["B", 52, false], ["C", 96, true]].map(([k, h, win], i) => (
        <In key={k as string} at={1 + i}>
          <rect x={40 + i * 90} y={160 - (h as number)} width="56" height={h as number} rx="8" fill="url(#sp-ramp)" fillOpacity={win ? 0.75 : 0.2} stroke={win ? "var(--sp-from)" : "rgba(255,255,255,0.15)"} />
          <text x={68 + i * 90} y="172" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12.4" fontFamily="inherit">Версия {k as string}</text>
          <text x={68 + i * 90} y={154 - (h as number)} textAnchor="middle" fill={win ? "var(--sp-from)" : "rgba(255,255,255,0.5)"} fontSize="14.0" fontWeight="700" fontFamily="inherit">{`${(h as number) / 10}%`}</text>
        </In>
      ))}
      <In at={5}>
        <rect x="222" y="60" width="104" height="20" rx="10" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="274" y="74" textAnchor="middle" fill="#fff" fontSize="11.6" fontFamily="inherit">Побеждает C</text>
      </In>
      <BeforeAfter before="Выбираем на глаз" after="Решают цифры на вашем трафике" mini={mini} />
    </Frame>
  );
}

/* ── Аналитика ──────────────────────────────────────────────────────── */

/** 01 · Источники. Кабинеты и CRM сходятся в один дашборд. */
function AnSources({ mini }: SceneProps) {
  const src = ["Рекламные кабинеты", "CRM", "Сайт и метрика"];
  return (
    <Frame>
      <Headline value="0" note="ручного сведения таблиц" mini={mini} />
      {src.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x="14" y={62 + i * 32} width="112" height="24" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
          <rect x="24" y={70 + i * 32} width="8" height="8" rx="2" fill="var(--sp-from)" fillOpacity="0.85" />
          <text x="38" y={78 + i * 32} fill="rgba(255,255,255,0.85)" fontSize="12.4" fontFamily="inherit">{name}</text>
          <path d={`M 128 ${74 + i * 32} C 156 ${74 + i * 32} 158 112 186 112`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}
      <In at={5}>
        <rect x="190" y="66" width="136" height="88" rx="12" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="202" y="82" fill="rgba(255,255,255,0.5)" fontSize="10.9" letterSpacing="1.2" fontFamily="inherit">ОДИН ДАШБОРД</text>
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={202 + j * 22} y={140 - (14 + ((j * 23) % 34))} width="14" height={14 + ((j * 23) % 34)} rx="3" fill="url(#sp-ramp)" fillOpacity="0.55" />
        ))}
      </In>
      <BeforeAfter before="Таблицы вручную перед встречей" after="Всё в одном месте само" mini={mini} />
    </Frame>
  );
}

/** 02 · Модель метрик. Разные определения сводятся в одно число. */
function AnModel({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="1 цифра" note="вместо трёх разных «конверсий»" mini={mini} />
      {[["Кабинет", "3,1%"], ["CRM", "2,4%"], ["Метрика", "4,0%"]].map(([k, v], i) => (
        <In key={k} at={1 + i}>
          <rect x="14" y={62 + i * 30} width="120" height="24" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
          <text x="26" y={78 + i * 30} fill="rgba(255,255,255,0.6)" fontSize="12.4" fontFamily="inherit">{k}</text>
          <text x="124" y={78 + i * 30} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="14.0" fontFamily="inherit">{v}</text>
          <path d={`M 136 ${74 + i * 30} C 164 ${74 + i * 30} 168 108 192 108`} stroke="var(--sp-to)" strokeOpacity="0.55" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}
      <In at={5}>
        <circle cx="240" cy="108" r="40" fill="url(#sp-glow)" />
        <rect x="196" y="82" width="112" height="52" rx="14" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" strokeWidth="1.4" />
        <text x="252" y="106" textAnchor="middle" fill="#fff" fontSize="21.7" fontWeight="700" fontFamily="inherit">2,9%</text>
        <text x="252" y="122" textAnchor="middle" fill="var(--sp-from)" fontSize="10.9" letterSpacing="1" fontFamily="inherit">ОБЩАЯ МОДЕЛЬ</text>
      </In>
      <BeforeAfter before="Цифры не сравнить" after="Один расчёт для всех источников" mini={mini} />
    </Frame>
  );
}

/** 03 · Аномалии. Система замечает, когда показатель выбился из нормы. */
function AnAnomaly({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="AI" note="сам находит аномалии в данных" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="312" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
        <rect x="14" y="92" width="312" height="30" fill="var(--sp-from)" fillOpacity="0.06" />
      </In>
      <In at={2}>
        <path d="M 26 116 L 68 112 L 110 118 L 152 110 L 194 114 L 220 82 L 250 108 L 290 112 L 316 110" stroke="url(#sp-ramp)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      </In>
      <In at={4}>
        <circle cx="220" cy="82" r="9" fill="var(--sp-from)" fillOpacity="0.25" className="sp-pulse" />
        <circle cx="220" cy="82" r="3.8" fill="var(--sp-from)" />
        <rect x="150" y="62" width="70" height="14" rx="7" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="185" y="72" textAnchor="middle" fill="#fff" fontSize="10.9" fontFamily="inherit">выбилось из нормы</text>
      </In>
      <BeforeAfter before="Заметили через неделю" after="Система сообщает сама" mini={mini} />
    </Frame>
  );
}

/** 04 · Объяснение. К аномалии — пояснение словами, а не голая цифра. */
function AnExplain({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="15 мин" note="вместо 3 дней на отчёт" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="120" height="94" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="80" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">ЦЕНА ЗАЯВКИ</text>
        <text x="26" y="112" fill="var(--sp-from)" fontSize="40.4" fontWeight="700" fontFamily="inherit">+38%</text>
      </In>
      <In at={2}>
        <path d="M 138 108 L 162 108" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="166" y="62" width="160" height="94" rx="12" fill="rgba(255,255,255,0.07)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="178" y="80" fill="var(--sp-to)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">ПОЧЕМУ</text>
      </In>
      {["В кабинете «Реклама 2» вырос", "клик, но упала доля целевых", "заявок — сменился креатив"].map((t, i) => (
        <In key={i} at={4 + i}>
          <text x="178" y={98 + i * 16} fill="#fff" fontSize="12.4" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <BeforeAfter before="Только цифра на графике" after="Цифра и объяснение словами" mini={mini} />
    </Frame>
  );
}

/* ── Обучение команды ───────────────────────────────────────────────── */

/** 01 · Аудит. Видим, где команда обходит инструмент стороной. */
function TrAudit({ mini }: SceneProps) {
  const roles = [["Менеджеры", 0.8], ["Дизайнеры", 0.35], ["Продюсеры", 0.55], ["Монтаж", 0.15]] as const;
  return (
    <Frame>
      <Headline value="41%" note="видят влияние на результат команды" mini={mini} />
      {roles.map(([name, use], i) => (
        <In key={name} at={1 + i}>
          <text x="14" y={78 + i * 24} fill="rgba(255,255,255,0.8)" fontSize="12.4" fontFamily="inherit">{name}</text>
          <rect x="88" y={70 + i * 24} width="200" height="10" rx="5" fill="rgba(255,255,255,0.07)" />
          <rect x="88" y={70 + i * 24} width={use * 200} height="10" rx="5" fill="url(#sp-ramp)" fillOpacity={0.35 + use * 0.5} />
          <text x="326" y={78 + i * 24} textAnchor="end" fill={use < 0.4 ? "rgba(255,255,255,0.45)" : "var(--sp-from)"} fontSize="12.4" fontWeight="700" fontFamily="inherit">{`${Math.round(use * 100)}%`}</text>
        </In>
      ))}
      <BeforeAfter before="Инструмент купили и забыли" after="Видно, кто и где им не пользуется" mini={mini} />
    </Frame>
  );
}

/** 02 · Программа. Собрана под ваши задачи, а не общий курс. */
function TrProgram({ mini }: SceneProps) {
  const m = ["Ваш инструмент", "Ваши задачи", "Ваши данные"];
  return (
    <Frame>
      <Headline value="1 сессия" note="на один инструмент" mini={mini} />
      {m.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x="14" y={62 + i * 32} width="170" height="26" rx="9" fill="rgba(255,255,255,0.06)" stroke="var(--sp-to)" strokeOpacity="0.45" />
          <circle cx="28" cy={75 + i * 32} r="7" fill="url(#sp-ramp)" fillOpacity="0.7" />
          <text x="28" y={78 + i * 32} textAnchor="middle" fill="#06110c" fontSize="12.4" fontWeight="700" fontFamily="inherit">{i + 1}</text>
          <text x="44" y={78 + i * 32} fill="#fff" fontSize="13.2" fontFamily="inherit">{name}</text>
        </In>
      ))}
      <In at={5}>
        <rect x="200" y="62" width="126" height="90" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        <text x="263" y="98" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="12.4" fontFamily="inherit">Общий курс</text>
        <text x="263" y="112" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="12.4" fontFamily="inherit">про нейросети</text>
        <path d="M 210 72 L 316 142 M 316 72 L 210 142" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      </In>
      <BeforeAfter before="Курс, который прошли все и забыли" after="Программа под ваш инструмент" mini={mini} />
    </Frame>
  );
}

/** 03 · Практика. Тренируемся на ваших же кейсах. */
function TrPractice({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="ваши кейсы" note="а не абстрактные примеры" mini={mini} />
      <In at={1}>
        <rect x="14" y="62" width="150" height="46" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="80" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">ЗАДАЧА ИЗ РАБОТЫ</text>
        <text x="26" y="96" fill="#fff" fontSize="12.4" fontFamily="inherit">Ответить на заявку по смете</text>
      </In>
      <In at={2}>
        <path d="M 90 110 L 90 124" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="14" y="126" width="150" height="34" rx="12" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="26" y="147" fill="#fff" fontSize="12.4" fontFamily="inherit">Сотрудник делает с помощью AI</text>
      </In>
      <In at={4}>
        <rect x="180" y="62" width="146" height="98" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
        <text x="192" y="80" fill="rgba(255,255,255,0.45)" fontSize="10.9" letterSpacing="1.1" fontFamily="inherit">РАЗБОР</text>
      </In>
      {["Где промпт слабый", "Что можно автоматизировать", "Как проверить ответ"].map((t, i) => (
        <In key={t} at={5 + i}>
          <circle cx="194" cy={96 + i * 20} r="3" fill="var(--sp-from)" />
          <text x="204" y={99 + i * 20} fill="#fff" fontSize="11.6" fontFamily="inherit">{t}</text>
        </In>
      ))}
      <BeforeAfter before="Примеры из чужой отрасли" after="Тренируемся на ваших кейсах" mini={mini} />
    </Frame>
  );
}

/** 04 · Контроль. Через месяц смотрим, изменилось ли поведение. */
function TrControl({ mini }: SceneProps) {
  const w = [18, 34, 52, 76];
  return (
    <Frame>
      <Headline value="1 мес" note="контроль внедрения" mini={mini} />
      {w.map((h, i) => (
        <In key={i} at={1 + i}>
          <rect x={30 + i * 56} y={158 - h} width="40" height={h} rx="8" fill="url(#sp-ramp)" fillOpacity={0.2 + i * 0.2} />
          <text x={50 + i * 56} y="170" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11.6" fontFamily="inherit">{i === 0 ? "Старт" : `Неделя ${i}`}</text>
        </In>
      ))}
      <In at={6}>
        <path d="M 50 130 C 100 122 160 100 218 80" stroke="var(--sp-from)" strokeWidth="1.5" fill="none" className="sp-flow" />
        <rect x="238" y="66" width="88" height="26" rx="13" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="282" y="82" textAnchor="middle" fill="#fff" fontSize="11.6" fontFamily="inherit">пользуются каждый день</text>
      </In>
      <BeforeAfter before="Обучили и разошлись" after="Проверяем, что поведение изменилось" mini={mini} />
    </Frame>
  );
}

export const GROWTH_SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  personalization: [PersSegments, PersTemplate, PersVersions, PersTest],
  analytics: [AnSources, AnModel, AnAnomaly, AnExplain],
  training: [TrAudit, TrProgram, TrPractice, TrControl],
};
