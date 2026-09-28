"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NanoWave from "@/components/ui/NanoWave";
import { CloseIcon } from "@/components/ui/Icons";
import { InfoVoiceCan, InfoVoiceHow } from "@/components/vibe/VibeInfographics";
import { Arrow } from "@/components/vibe/VibeMode";
import { playUi } from "@/lib/sound";
import { TOUR_KEY, getVoiceLevel, setVoiceState, useVoiceState, voice } from "@/lib/voice/store";

// Знакомство с голосовым ассистентом (Егор, 2026-09-27). Первое нажатие на
// волну открывает справа окошко в стиле слайдов Vibe-режима: два слайда с
// инфографикой (как это работает, что умеет), затем «Попробуем» — голос
// включается, и три команды-подсказки отмечаются галочкой по мере того,
// как посетитель их говорит. Показывается один раз (TOUR_KEY).

const SMOOTH = [0.65, 0, 0.35, 1] as const;

const SLIDES: { title: string; lead: string; Info: () => ReactNode }[] = [
  { title: "Управляй сайтом *голосом*", lead: "Без меню и поиска — просто *скажи*, что нужно", Info: InfoVoiceHow },
  { title: "Что *умеет* голос", lead: "Листает, отвечает и нажимает — *за тебя*", Info: InfoVoiceCan },
];

const PRACTICE = ["«Следующий блок»", "«Сколько стоит ролик?»", "«Вернись наверх»"];

function Accent({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} className="vibe-mode__iris">{p}</span> : p))}</>;
}

export default function VoiceTour({ from, to }: { from: string; to: string }) {
  const s = useVoiceState();
  const [step, setStep] = useState(0);
  const practice = step === SLIDES.length;

  // Засчитываем команды, сказанные уже на шаге «Попробуем».
  const userTurns = s.turns.filter((t) => t.role === "user").length;
  const base = useRef<number | null>(null);
  if (practice && base.current === null) base.current = userTurns;
  const done = practice && base.current !== null ? Math.min(PRACTICE.length, userTurns - base.current) : 0;
  const finished = done >= PRACTICE.length;

  const close = () => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {}
    setVoiceState({ tour: false });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (n: number) => {
    playUi("click");
    setStep(n);
    if (n === SLIDES.length && !s.enabled) voice.enable();
  };

  const rise = (delay: number) => ({
    initial: { opacity: 0, filter: "blur(12px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    transition: { delay, duration: 0.8, ease: SMOOTH },
  });
  const slide = SLIDES[step];
  const hot = s.status === "listening" || s.status === "speaking";
  const status =
    s.status === "listening" ? "Слушаю…" : s.status === "speaking" ? "Отвечаю…" : s.status === "thinking" ? "Думаю…" : s.enabled ? "Говори" : "Включаю голос…";

  return (
    <motion.div
      role="dialog"
      aria-label="Знакомство с голосовым ассистентом"
      className="vibe-mode voice-tour fixed z-[110]"
      data-voice-ui
      style={{ "--g-from": from, "--g-to": to } as CSSProperties}
      initial={{ opacity: 0, x: 28, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.97 }}
      transition={{ duration: 0.5, ease: SMOOTH }}
    >
      <div aria-hidden="true" className="vibe-mode__aurora" />
      <button type="button" onClick={close} aria-label="Закрыть" className="voice-stage-close">
        <CloseIcon />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative flex w-full flex-1 flex-col items-center text-center"
          initial={{ opacity: 0, filter: "blur(14px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: SMOOTH }}
        >
          <motion.span {...rise(0)} className="vibe-mode__eyebrow">
            {String(step + 1).padStart(2, "0")} / {String(SLIDES.length + 1).padStart(2, "0")}
          </motion.span>

          {!practice ? (
            <>
              <motion.h2 {...rise(0.05)} className="vibe-mode__title vibe-mode__title--sm mt-2">
                <Accent text={slide.title} />
              </motion.h2>
              <div className="mt-5 w-full">
                <slide.Info />
              </div>
              <motion.p {...rise(2.6)} className="vibe-mode__lead mt-4">
                <Accent text={slide.lead} />
              </motion.p>
              {/* Волна ассистента в пустом месте под текстом — та же, что
                  внизу сайта: сразу видно, кого именно просят «сказать». */}
              <motion.div {...rise(2.8)} className="voice-tour__wave mt-2 flex-1 justify-center">
                <NanoWave width={107} height={32} from={from} to={to} hot={hot} pulse={s.pulse} level={getVoiceLevel} particles={false} />
              </motion.div>
            </>
          ) : (
            <>
              <motion.h2 {...rise(0.05)} className="vibe-mode__title vibe-mode__title--sm mt-2">
                {finished ? <Accent text="Ты *умеешь*!" /> : <Accent text="Давай *попробуем*" />}
              </motion.h2>
              <motion.p {...rise(0.2)} className="vibe-mode__lead mt-2">
                {finished ? (
                  <Accent text="Голос на связи на всех страницах — *просто говори*" />
                ) : s.canListen ? (
                  <Accent text="Скажи вслух по очереди — *я отмечу*" />
                ) : (
                  <Accent text="Браузер не слышит голос — *напиши* команду в окне ассистента" />
                )}
              </motion.p>
              <motion.div {...rise(0.4)} className="voice-tour__wave">
                <NanoWave width={220} height={64} from={from} to={to} hot={hot} pulse={s.pulse} level={getVoiceLevel} particles={false} />
                <span className="voice-tour__status">{s.live ? `«${s.live}»` : status}</span>
              </motion.div>
              <motion.ol {...rise(0.6)} className="voice-tour__tasks">
                {PRACTICE.map((p, i) => (
                  <li key={p} className={`voice-tour__task${i < done ? " is-done" : i === done ? " is-now" : ""}`}>
                    <span className="vibe-mode__key">{i < done ? "✓" : i + 1}</span>
                    Скажи {p}
                  </li>
                ))}
              </motion.ol>
            </>
          )}

          <motion.div {...rise(practice ? 0.8 : 2.9)} className="mt-auto flex w-full items-center justify-center gap-1 pt-5">
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="vibe-mode__prev"
              aria-label="Назад"
              disabled={step === 0}
              style={step === 0 ? { visibility: "hidden" } : undefined}
            >
              <Arrow />
            </button>
            {practice ? (
              <button type="button" onClick={close} className="vibe-mode__next">
                {finished ? "Готово" : "Пропустить"}
                <Arrow />
              </button>
            ) : (
              <button type="button" onClick={() => go(step + 1)} className="vibe-mode__next">
                {step === SLIDES.length - 1 ? "Попробовать" : "Дальше"}
                <Arrow />
              </button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
