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

/** Текст по словам — каждое слово приезжает со своей задержкой, поэтому
 *  фраза читается как титр, а не как появившийся абзац. */
function splitWords(text: string) {
  return text.split(/\s+/);
}

export default function SpotlightCopy({
  data,
  step,
  setStep,
  onClose,
  showSub = true,
  showTitle = true,
  compact = false,
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
}) {
  const reduced = useReducedMotion();
  const benefit = data.benefits[step] ?? data.benefits[0];
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {showTitle && (
            <h3 className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
              {data.title}
            </h3>
          )}
          {data.tagline && (
            <p className={`spotlight-accent spotlight-sheen ${showTitle ? "mt-1" : ""} font-display text-[13px] uppercase leading-snug tracking-[0.05em] sm:text-sm`}>
              {data.tagline}
            </p>
          )}
          {showSub && <p className="mt-1 max-w-[46em] text-[12.5px] leading-snug text-white/80">{data.sub}</p>}
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
      <div className="relative mt-2.5 min-h-[72px] flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.7 }}
                className="h-fit shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-white"
              >
                {benefit.label}
              </motion.span>
              {/* Заголовок слайда не уезжает, а тухнет и
                  проявляется через прозрачность с лёгким
                  расфокусом — кинематографичный кросс-фейд, о
                  котором просил Егор: смена смысла читается как
                  смена кадра, а не как перелистывание. */}
              <motion.span
                initial={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
                transition={{ duration: reduced ? 0 : 1.1, ease: [0.4, 0, 0.2, 1] }}
                className="spotlight-accent spotlight-sheen font-display text-[15px] font-bold uppercase leading-tight tracking-tight sm:text-[17px]"
              >
                {benefit.punch}
              </motion.span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-white/90 sm:text-sm">
              {splitWords(benefit.text).map((word, i) => (
                <motion.span
                  key={`${step}-${i}`}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: reduced ? 0 : 0.7,
                    delay: reduced ? 0 : 0.26 + i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/12 pb-0.5 pt-2.5">
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
                  className={`shrink-0 whitespace-nowrap font-display text-sm uppercase tabular-nums ${
                    on ? "spotlight-accent spotlight-sheen" : "text-white/70"
                  }`}
                >
                  {stat.value}
                </span>
                <span // Слова не рвутся посередине (overflowWrap: normal): «автоматизаци-и»
                // на границе колонки Егор назвал неприемлемым. Колонка
                // достаточно широка, чтобы длинное слово целиком поместилось.
                className="min-w-0 font-display text-[9px] uppercase leading-[1.25] tracking-[0.1em] text-white/55"
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
}
