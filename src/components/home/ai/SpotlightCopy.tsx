"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Spotlight } from "@/components/home/ai/spotlightData";

// Правый блок окошка услуги: название, тезис-подзаголовок, слово-выгода со
// сменяющимся объяснением, точки шагов и цифры.
//
// Вынесен из ToolSpotlight, потому что тот же блок теперь стоит и под
// каруселью на первом экране /ai (AiDeck): Егор попросил один и тот же
// текст и ту же анимацию в обоих местах — «полностью вставить правый
// блок». Один компонент вместо двух копий означает, что правка тезисов или
// темпа не может расползтись между ними.
//
// Цвета берёт из CSS-переменных --sp-from / --sp-to родителя — тот, кто
// его рисует, обязан их задать.

/** Невидимый слепок одного кадра панели — та же разметка и те же классы,
 *  что у живого блока ниже, только без анимаций. Все слепки раздела лежат
 *  стопкой в одной ячейке сетки, и панель берёт высоту самого высокого
 *  кадра: при листании карточек и шагов она больше не прыгает (Егор,
 *  2026-10-18). Меняешь разметку живого блока — поменяй и здесь. */
function CopyGhost({ data, step, showTitle }: { data: Spotlight; step: number; showTitle: boolean }) {
  const benefit = data.benefits[step] ?? data.benefits[0];
  const stat = data.stats[step % Math.max(1, data.stats.length)];
  return (
    <div aria-hidden="true" className="invisible flex min-w-0 flex-col justify-center [grid-area:1/1]">
      {showTitle && <h3 className="font-display text-[15px] uppercase leading-tight tracking-tight sm:text-lg">{data.title}</h3>}
      {data.tagline && (
        <p className={`${showTitle ? "mt-1" : ""} font-display text-[11px] uppercase leading-snug tracking-[0.05em] sm:text-sm`}>{data.tagline}</p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="h-fit shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.14em]">{benefit.label}</span>
        <span className="font-display text-[13px] font-bold uppercase leading-tight tracking-tight sm:text-[17px]">{benefit.punch}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pb-0.5 pt-3">
        <div className="h-1.5" style={{ width: 26 + (data.benefits.length - 1) * 16 }} />
        {stat && (
          <span className="inline-flex min-w-0 flex-1 items-baseline gap-1.5">
            <span className="shrink-0 whitespace-nowrap font-display text-sm uppercase">{stat.value}</span>
            <span className="min-w-0 font-display text-[9px] uppercase leading-[1.15] tracking-[0.1em]">{stat.label}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function SpotlightCopy({
  data,
  step,
  setStep,
  onClose,
  showTitle = true,
  compact = false,
  large = false,
  sizeTo,
}: {
  data: Spotlight;
  step: number;
  setStep: (i: number) => void;
  /** Крестик «Свернуть» — только у выдвижного окна, у карусели его нет. */
  onClose?: () => void;
  /** Короткое описание под тезисом. В карусели скрыто — там мало места. */
  showSub?: boolean;
  /** Название услуги над тезисом. Скрывают там, где название уже стоит
   *  прямо над блоком (панель под каруселью /sites): без него блок ниже
   *  на строку, а на невысоких экранах это решает, влезает ли глава. */
  showTitle?: boolean;
  /** Узкая раскладка (окно под каруселью, ~400px): цифры показываются по
   *  одной, в такт шагу, а не все три сразу. В три строки по 16em они
   *  переносились на две-три строки и раздували блок выше отведённой ему
   *  фиксированной высоты. */
  compact?: boolean;
  /** Раскрытое окно услуги на компьютере (Егор, 2026-10-12): тексты
   *  крупнее и жирнее, на всё окно — тонких строк не остаётся. */
  large?: boolean;
  /** Все кадры раздела (панель под каруселью): высота панели = самый
   *  высокий из них, а не текущий. Только вместе с `compact`. */
  sizeTo?: Spotlight[];
}) {
  const reduced = useReducedMotion();
  const benefit = data.benefits[step] ?? data.benefits[0];
  const body = (
    // justify-center на ВСЕХ ширинах, не только ниже 1024px: раньше на
    // десктопе средний блок растягивался на всю оставшуюся высоту
    // (`lg:flex-1`), и короткий тезис проваливался большим пустым
    // промежутком между абзацем и нижней строкой цифр — Егор отдельно на
    // это указал («много пустого места под основным текстом»). Теперь
    // заголовок, тезис и цифры держатся одной компактной группой и вместе
    // центрируются в высоте окна, а не растягиваются как резина.
    // Окно (large): без описания, поэтому группы разнесены на всю высоту —
    // название сверху, тезис посередине, цифры снизу, без пустых полос.
    <div className={`flex min-w-0 flex-1 flex-col ${large ? "justify-between gap-4 py-1" : "justify-center"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {showTitle && (
            <h3 className={`font-display text-[15px] uppercase leading-tight tracking-tight text-white ${large ? "sm:text-2xl" : "sm:text-lg"}`}>
              {data.title}
            </h3>
          )}
          {/* Смена услуги (другая карточка колоды) — мягкий кросс-фейд, а не
              мгновенная подмена строки. */}
          <AnimatePresence mode="wait" initial={false}>
            {data.tagline && (
              <motion.p
                key={data.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`spotlight-accent spotlight-sheen ${showTitle ? "mt-1" : ""} font-display text-[11px] uppercase leading-snug tracking-[0.05em] ${large ? "sm:text-base" : "sm:text-sm"}`}
              >
                {data.tagline}
              </motion.p>
            )}
          </AnimatePresence>
          {/* Мелкая строка-описание (data.sub) убрана во всех окошках: она
              пересказывала подзаголовок и слайд — Егор назвал это тавтологией.
              Проп showSub оставлен, чтобы не трогать вызовы. */}
        </div>
        {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Свернуть"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        )}
      </div>

      {/* Слайд: крупная строка-выгода, под ней объяснение по
          словам. Это и есть «динамичное слайд-шоу», о котором
          просил Егор — каждый шаг приходит как кадр тизера:
          сначала обещание крупно, потом экспертная расшифровка,
          и всё в такт сцене слева. */}
      {/* Больше не растягивается (`flex-1` убран): блок занимает ровно свой
          контент, а лишнее место в окне забирает `justify-center` на
          корневом элементе — единой центрированной группой, а не пустым
          зазором внутри неё. */}
      <div className={`relative ${large ? "" : "mt-2.5"}`}>
        <AnimatePresence mode="wait" initial={false}>
          {/* Ключ — услуга + шаг: при выборе другой карточки номер шага часто
              тот же (0), и со старым ключом текст подменялся рывком. */}
          <motion.div key={`${data.title}-${step}`} className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.35 }}
                className={`h-fit shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 font-display font-bold uppercase tracking-[0.14em] text-white ${large ? "text-[9px] sm:text-[11px]" : "text-[9px]"}`}
              >
                {benefit.label}
              </motion.span>
              {/* Заголовок слайда не уезжает, а тухнет и
                  проявляется через прозрачность с лёгким
                  расфокусом — кинематографичный кросс-фейд, о
                  котором просил Егор: смена смысла читается как
                  смена кадра, а не как перелистывание. */}
              <motion.span
                // Спокойнее и короче: без масштаба и долгого расфокуса —
                // старый текст уходил больше секунды, и блок прыгал по высоте.
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`spotlight-accent spotlight-sheen font-display text-[13px] font-bold uppercase leading-tight tracking-tight ${large ? "sm:text-[24px]" : "sm:text-[17px]"}`}
              >
                {benefit.punch}
              </motion.span>
            </div>
            {/* Описание (benefit.text) больше не рисуется нигде (Егор,
                2026-10-18: панель под каруселью — только заголовки, без
                тонкого абзаца). Сами тексты остаются в данных — для страниц
                услуг и SEO. */}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/12 pb-0.5 ${large ? "pt-4" : compact ? "mt-4 pt-3" : "mt-2.5 pt-2.5"}`}>
        {/* Шаги — они же ручное переключение. */}
        <div className="flex items-center gap-1.5">
          {data.benefits.map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setStep(i)}
              aria-label={b.label}
              aria-current={i === step ? "true" : undefined}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === step ? 26 : 10,
                background: i === step ? "var(--sp-from)" : "rgba(255,255,255,0.22)",
                boxShadow: i === step ? "0 0 12px var(--sp-from)" : "none",
              }}
            />
          ))}
        </div>

        {/* Цифры — самый быстрый ответ на «а мне это зачем».
            Горит всегда одна, в такт шагу: три одинаково ярких
            числа взгляд не читает, он читает то, на которое его
            привели. Переход медленный, как и всё в этом окне. */}
        <div
          // Три цифры — три равные колонки, а не перенос по ширине текста:
          // подпись цифры в длинном тексте («компаний в России уже внедряют
          // ИИ-агентов») при переносе «как получится» сваливалась в три
          // короткие строки и выпирала за нижний край окна. В своей колонке
          // она занимает две строки максимум. В узком окне под каруселью
          // цифра одна, на всю ширину.
          className={`gap-x-5 gap-y-1.5 ${compact ? "flex min-w-0 flex-1 items-baseline" : "grid flex-1"}`}
          style={compact ? undefined : { gridTemplateColumns: `repeat(${Math.max(1, data.stats.length)}, minmax(0, 1fr))` }}
        >
          {data.stats.map((stat, i) => {
            const on = i === step % Math.max(1, data.stats.length);
            if (compact && !on) return null;
            return (
              <span
                key={stat.label}
                className={`min-w-0 transition-opacity duration-[900ms] ${compact ? "inline-flex items-baseline gap-1.5" : "flex flex-col items-start gap-0.5"}`}
                style={{ opacity: on ? 1 : 0.4 }}
              >
                <span
                  className={`shrink-0 whitespace-nowrap font-display uppercase tabular-nums ${large ? "text-sm sm:text-xl" : "text-sm"} ${
                    on ? "spotlight-accent spotlight-sheen" : "text-white/70"
                  }`}
                >
                  {stat.value}
                </span>
                <span // Слова не рвутся посередине (overflowWrap: normal): «автоматизаци-и»
                // на границе колонки Егор назвал неприемлемым. Колонка
                // достаточно широка, чтобы длинное слово целиком поместилось.
                className={`min-w-0 font-display uppercase leading-[1.15] tracking-[0.1em] ${large ? "text-[9px] text-white sm:text-[11px]" : "text-[9px] text-white/55"}`}
                style={{ overflowWrap: "normal", wordBreak: "normal", hyphens: "none" }}>
                  {stat.label}
                </span>
              </span>
            );
          })}
        </div>

      </div>
    </div>
  );
  if (!sizeTo) return body;
  return (
    <div className="grid min-w-0 flex-1 [&>*]:[grid-area:1/1]">
      {sizeTo.flatMap((d) => d.benefits.map((_, i) => <CopyGhost key={`${d.title}-${i}`} data={d} step={i} showTitle={showTitle} />))}
      {body}
    </div>
  );
}
