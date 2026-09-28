"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import { directionDeep } from "@/components/home/ai/spotlightDirections";
import { spotlightFor } from "@/components/home/ai/spotlightData";

// Шесть сцен «Почему это работает» прямо в герое, без кнопки и всплывающего
// окна (просьба Егора для «Презентационных фильмов»): небольшое окошко с
// графикой, которое само меняет сцену каждые 2 секунды, и под графикой —
// тезис текущей сцены. Клик по точке — ручное переключение, наведение
// останавливает автосмену.
//
// Сцена собирается по элементам ~1.5с (sceneKit <In>). При смене ровно
// каждые 2с она едва успевала появиться и окошко читалось пустым и
// мигающим — поэтому такт = сборка + 2с, когда сцена стоит целиком.
// Потом ещё вдвое реже — Егор.
const BEAT_MS = 7200;

export default function HeroDeepInline({ slug }: { slug: string }) {
  const data = directionDeep(slug) ?? spotlightFor(slug);
  const steps = data?.benefits.length ?? 0;
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (held || reduced || steps < 2) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % steps), BEAT_MS);
    return () => window.clearTimeout(id);
  }, [held, reduced, steps, step]);

  if (!data) return null;
  const benefit = data.benefits[step];

  return (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className="glass-panel flex h-full flex-col rounded-2xl border border-white/10 p-3"
      style={{ "--sp-from": data.accent.from, "--sp-to": data.accent.to } as React.CSSProperties}
    >
      <div className="relative aspect-[340/210] w-full overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/10">
        {/* Сцена на 20% меньше окошка и по центру: во весь размер подписи
            упирались в рамки и налезали на соседние элементы (Егор). */}
        <div className="absolute inset-[10%]">
          <SpotlightScene slug={data.slug} step={step} />
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="min-w-0"
          >
            {benefit.label.toLowerCase() !== benefit.punch.toLowerCase() && (
              <span className="block font-display text-[9px] uppercase tracking-[0.14em] text-white">{benefit.label}</span>
            )}
            <span className="spotlight-accent spotlight-sheen block font-display text-sm uppercase leading-tight tracking-tight">
              {benefit.punch}
            </span>
          </motion.div>
        </AnimatePresence>
        <div className="flex shrink-0 items-center gap-1.5" role="tablist" aria-label="Сцены">
          {data.benefits.map((b, i) => (
            <button
              key={b.label + i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={b.label}
              onClick={() => setStep(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 18 : 6,
                background: i === step ? "var(--sp-from)" : "rgba(255,255,255,0.22)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
