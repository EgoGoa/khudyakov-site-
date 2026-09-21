// Сцены инструментов «Фильтр обращений» (comms) и «AI внутри CRM» (crm).
// Вынесены из SpotlightScene.tsx в отдельный файл по договорённости с
// соседней сессией, которая параллельно разбивает тот же файл: у каждой
// группы сцен — свой файл, общие детали лежат в sceneKit.tsx.

import { In, Frame, Headline, BeforeAfter, type SceneProps } from "@/components/home/ai/sceneKit";

/* ── Сцены инструмента «Фильтр обращений» ───────────────────────────── */

/** 01 · Правила. Входящий поток проходит фильтр: спам и дубли отсеиваются. */
function CommsRules({ mini }: SceneProps) {
  const msgs = [true, false, true, false, true];
  return (
    <Frame>
      <Headline value="98,2%" note="точность отсева спама и фишинга" mini={mini} />
      {msgs.map((ok, i) => (
        <In key={i} at={1 + i}>
          <rect x="14" y={62 + i * 20} width="98" height="15" rx="7.5" fill={ok ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.03)"} stroke={ok ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"} />
          <rect x="24" y={67.5 + i * 20} width={ok ? 52 : 40} height="4" rx="2" fill={ok ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"} />
        </In>
      ))}
      <In at={6}>
        <path d="M 116 100 L 150 100" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <path d="M 150 80 L 178 100 L 178 118 L 150 138 Z" fill="url(#sp-ramp)" fillOpacity="0.28" stroke="var(--sp-from)" strokeOpacity="0.7" />
        <text x="164" y="112" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="inherit">ФИЛЬТР</text>
      </In>
      <In at={7}>
        <path d="M 182 100 L 214 100" stroke="var(--sp-from)" strokeWidth="1.3" className="sp-flow" />
        <rect x="218" y="80" width="108" height="42" rx="10" fill="rgba(255,255,255,0.07)" stroke="var(--sp-from)" strokeOpacity="0.55" />
        <text x="230" y="98" fill="#fff" fontSize="8" fontFamily="inherit">Живые обращения</text>
        <text x="230" y="112" fill="var(--sp-from)" fontSize="7.5" fontFamily="inherit">к менеджеру</text>
      </In>
      <In at={8}>
        <path d="M 164 140 L 164 158" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x="172" y="160" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontFamily="inherit">спам и дубли — в отдельный список</text>
      </In>
      <BeforeAfter before="Общий чёрный список" after="Правила под ваш поток" mini={mini} />
    </Frame>
  );
}

/** 02 · Каналы. Фильтр стоит на входе в каждый канал. */
function CommsChannels({ mini }: SceneProps) {
  const ch = ["Мессенджеры", "Почта", "Форма на сайте"];
  return (
    <Frame>
      <Headline value="24/7" note="без выходных и перерывов" mini={mini} />
      {ch.map((name, i) => (
        <In key={name} at={1 + i}>
          <rect x="14" y={64 + i * 32} width="104" height="24" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
          <circle cx="27" cy={76 + i * 32} r="3.2" fill="var(--sp-from)" className="sp-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <text x="37" y={79 + i * 32} fill="rgba(255,255,255,0.85)" fontSize="8" fontFamily="inherit">{name}</text>
          <rect x="128" y={66 + i * 32} width="14" height="20" rx="4" fill="url(#sp-ramp)" fillOpacity="0.45" stroke="var(--sp-from)" strokeOpacity="0.6" />
          <path d={`M 120 ${76 + i * 32} L 126 ${76 + i * 32}`} stroke="var(--sp-to)" strokeWidth="1.2" />
          <path d={`M 144 ${76 + i * 32} C 172 ${76 + i * 32} 176 112 204 112`} stroke="var(--sp-to)" strokeOpacity="0.6" strokeWidth="1.2" className="sp-flow" style={{ animationDelay: `${i * 0.3}s` }} />
        </In>
      ))}
      <In at={5}>
        <rect x="208" y="72" width="118" height="80" rx="12" fill="rgba(255,255,255,0.05)" stroke="var(--sp-to)" strokeOpacity="0.5" />
        <text x="220" y="90" fill="rgba(255,255,255,0.5)" fontSize="7" letterSpacing="1.2" fontFamily="inherit">ЧИСТАЯ ОЧЕРЕДЬ</text>
        {[0, 1, 2].map((j) => (
          <rect key={j} x="220" y={100 + j * 15} width={j === 1 ? 70 : 90} height="6" rx="3" fill="rgba(255,255,255,0.28)" />
        ))}
      </In>
      <BeforeAfter before="Фильтр только там, где проще" after="Фильтр на входе в каждый канал" mini={mini} />
    </Frame>
  );
}

/** 03 · Приоритеты. Очередь сортируется по срочности. */
function CommsPriority({ mini }: SceneProps) {
  const rows = [
    ["Срочно", "Сорван срок съёмки", 1],
    ["Сегодня", "Вопрос по смете", 0.7],
    ["Неделя", "Идея для коллаба", 0.4],
    ["Потом", "Рассылка партнёров", 0.2],
  ];
  return (
    <Frame>
      <Headline value="−47%" note="обращений требуют человека" mini={mini} />
      {rows.map(([tag, line, weight], i) => (
        <In key={tag as string} at={1 + i}>
          <rect x="14" y={62 + i * 28} width="312" height="22" rx="8" fill={`rgba(255,255,255,${0.03 + (weight as number) * 0.07})`} stroke={i === 0 ? "var(--sp-from)" : "rgba(255,255,255,0.1)"} strokeOpacity={i === 0 ? 0.7 : 1} />
          <rect x="14" y={62 + i * 28} width={(weight as number) * 60 + 8} height="22" rx="8" fill="url(#sp-ramp)" fillOpacity={(weight as number) * 0.5} />
          <text x="24" y={76 + i * 28} fill="#fff" fontSize="7.5" fontWeight="600" fontFamily="inherit">{tag as string}</text>
          <text x="96" y={76 + i * 28} fill="rgba(255,255,255,0.75)" fontSize="8" fontFamily="inherit">{line as string}</text>
        </In>
      ))}
      <BeforeAfter before="Всё вперемешку" after="Сверху то, что нельзя откладывать" mini={mini} />
    </Frame>
  );
}

/** 04 · Автоответы. Типовой вопрос закрывается сразу вашими словами. */
function CommsAuto({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="5 дней" note="до первого рабочего фильтра" mini={mini} />
      <In at={1}>
        <rect x="14" y="64" width="150" height="34" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
        <text x="26" y="84" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="inherit">«Сколько стоит съёмка?»</text>
      </In>
      <In at={2}>
        <path d="M 168 82 C 190 82 190 118 210 118" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
      </In>
      <In at={3}>
        <rect x="176" y="104" width="150" height="50" rx="12" fill="rgba(255,255,255,0.08)" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="188" y="122" fill="#fff" fontSize="8" fontFamily="inherit">«Считаем по ТЗ. Ориентир —</text>
        <text x="188" y="134" fill="#fff" fontSize="8" fontFamily="inherit">калькулятор на сайте»</text>
        <text x="188" y="147" fill="var(--sp-from)" fontSize="7" fontFamily="inherit">ответ команды · за секунду</text>
      </In>
      <In at={4}>
        <circle cx="34" cy="138" r="14" fill="url(#sp-glow)" />
        <circle cx="34" cy="138" r="8" fill="rgba(10,13,16,0.92)" stroke="url(#sp-ramp)" />
        <text x="50" y="141" fill="rgba(255,255,255,0.5)" fontSize="7.5" fontFamily="inherit">человек не отвлекался</text>
      </In>
      <BeforeAfter before="Общие фразы" after="Ответ вашей командой, сразу" mini={mini} />
    </Frame>
  );
}

const COMMS = [CommsRules, CommsChannels, CommsPriority, CommsAuto];

/* ── Сцены инструмента «AI внутри CRM» ──────────────────────────────── */

/** 01 · Интеграция. AI работает поверх вашей CRM, архив остаётся на месте. */
function CrmLayer({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="70%" note="рутины в CRM берёт на себя AI" mini={mini} />
      <In at={1}>
        <rect x="14" y="94" width="312" height="64" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        <text x="26" y="110" fill="rgba(255,255,255,0.45)" fontSize="7" letterSpacing="1.2" fontFamily="inherit">ВАША CRM · АРХИВ СДЕЛОК НА МЕСТЕ</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={26 + i * 60} y="120" width="50" height="28" rx="6" fill="rgba(255,255,255,0.06)" />
        ))}
      </In>
      <In at={2}>
        <rect x="14" y="60" width="312" height="26" rx="13" fill="url(#sp-ramp)" fillOpacity="0.22" stroke="var(--sp-from)" strokeOpacity="0.65" />
        <text x="170" y="77" textAnchor="middle" fill="#fff" fontSize="8.5" letterSpacing="1.2" fontFamily="inherit">AI-СЛОЙ ПОВЕРХ</text>
      </In>
      {[0, 1, 2, 3].map((i) => (
        <In key={i} at={3 + i}>
          <path d={`M ${60 + i * 72} 88 L ${60 + i * 72} 94`} stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        </In>
      ))}
      <BeforeAfter before="Переезд на новую платформу" after="Работаем в вашей текущей CRM" mini={mini} />
    </Frame>
  );
}

/** 02 · Разметка. Заявка получает статус и оценку при входе. */
function CrmScore({ mini }: SceneProps) {
  const leads = [["Анна · смета", 92], ["Игорь · вопрос", 61], ["Ольга · спам?", 18]];
  return (
    <Frame>
      <Headline value="+15…20%" note="конверсия от одной приоритизации" mini={mini} />
      {leads.map(([name, score], i) => (
        <In key={name as string} at={1 + i}>
          <rect x="14" y={62 + i * 32} width="312" height="26" rx="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
          <text x="26" y={79 + i * 32} fill="#fff" fontSize="8.5" fontFamily="inherit">{name as string}</text>
          <rect x="150" y={71 + i * 32} width="120" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
          <rect x="150" y={71 + i * 32} width={(score as number) * 1.2} height="8" rx="4" fill="url(#sp-ramp)" className="sp-stack" style={{ animationDelay: `${i * 0.2}s` }} />
          <text x="316" y={79 + i * 32} textAnchor="end" fill={(score as number) > 50 ? "var(--sp-from)" : "rgba(255,255,255,0.4)"} fontSize="9" fontWeight="700" fontFamily="inherit">{score as number}</text>
        </In>
      ))}
      <BeforeAfter before="Менеджер сам решает, что важно" after="Оценка при входе заявки" mini={mini} />
    </Frame>
  );
}

/** 03 · Маршрутизация. Заявка уходит тому, у кого выше шанс закрыть. */
function CrmRoute({ mini }: SceneProps) {
  const mgr = [["Маша", 0.8, "68%"], ["Дима", 0.4, "91%"], ["Саша", 0.9, "55%"]];
  return (
    <Frame>
      <Headline value="+30…45%" note="конверсия без участия человека" mini={mini} />
      <In at={1}>
        <rect x="14" y="88" width="66" height="30" rx="10" fill="url(#sp-ramp)" fillOpacity="0.25" stroke="var(--sp-from)" strokeOpacity="0.6" />
        <text x="47" y="107" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="inherit">Заявка</text>
      </In>
      {mgr.map(([name, load, chance], i) => (
        <In key={name as string} at={2 + i}>
          <path d={`M 82 103 C 108 103 112 ${72 + i * 32} 136 ${72 + i * 32}`} stroke={i === 1 ? "var(--sp-from)" : "rgba(255,255,255,0.2)"} strokeOpacity={i === 1 ? 0.9 : 1} strokeWidth="1.2" className={i === 1 ? "sp-flow" : undefined} />
          <rect x="140" y={60 + i * 32} width="186" height="24" rx="9" fill={i === 1 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)"} stroke={i === 1 ? "var(--sp-from)" : "rgba(255,255,255,0.1)"} strokeOpacity={i === 1 ? 0.7 : 1} />
          <text x="152" y={76 + i * 32} fill="#fff" fontSize="8" fontFamily="inherit">{name as string}</text>
          <text x="190" y={76 + i * 32} fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="inherit">загрузка</text>
          <rect x="222" y={70 + i * 32} width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
          <rect x="222" y={70 + i * 32} width={(load as number) * 50} height="5" rx="2.5" fill="rgba(255,255,255,0.4)" />
          <text x="316" y={76 + i * 32} textAnchor="end" fill={i === 1 ? "var(--sp-from)" : "rgba(255,255,255,0.5)"} fontSize="8" fontWeight="700" fontFamily="inherit">{chance as string}</text>
        </In>
      ))}
      <BeforeAfter before="По кругу" after="Тому, у кого выше шанс закрыть" mini={mini} />
    </Frame>
  );
}

/** 04 · Прогноз. Вероятность считается по вашей же истории. */
function CrmForecast({ mini }: SceneProps) {
  return (
    <Frame>
      <Headline value="2 недели" note="до первого пилота" mini={mini} />
      <In at={1}>
        <rect x="14" y="60" width="150" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" />
        <text x="26" y="76" fill="rgba(255,255,255,0.45)" fontSize="7" letterSpacing="1.2" fontFamily="inherit">ВАШИ ЗАКРЫТЫЕ СДЕЛКИ</text>
      </In>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <In key={i} at={2 + i * 0.5}>
          <rect x={26 + i * 19} y={148 - (20 + ((i * 37) % 50))} width="12" height={20 + ((i * 37) % 50)} rx="3" fill="url(#sp-ramp)" fillOpacity={0.3 + (i % 3) * 0.15} />
        </In>
      ))}
      <In at={6}>
        <path d="M 168 110 L 192 110" stroke="var(--sp-to)" strokeWidth="1.3" className="sp-flow" />
        <circle cx="262" cy="108" r="42" fill="url(#sp-glow)" />
        <circle cx="262" cy="108" r="30" stroke="rgba(255,255,255,0.14)" strokeWidth="6" fill="none" />
        <circle cx="262" cy="108" r="30" stroke="url(#sp-ramp)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="130 190" transform="rotate(-90 262 108)" />
        <text x="262" y="113" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="inherit">68%</text>
        <text x="262" y="154" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="inherit">вероятность сделки</text>
      </In>
      <BeforeAfter before="Чужая выборка из другой отрасли" after="Прогноз по вашей истории" mini={mini} />
    </Frame>
  );
}

const CRM = [CrmLayer, CrmScore, CrmRoute, CrmForecast];

export const COMMS_SCENES: Record<string, ((p: SceneProps) => React.ReactElement)[]> = {
  comms: COMMS,
  crm: CRM,
};
