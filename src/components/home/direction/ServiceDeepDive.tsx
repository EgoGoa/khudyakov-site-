"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import { directionDeep } from "@/components/home/ai/spotlightDirections";

// Расширенное окно услуги на странице направления: то же окошко, что на
// /content, только шире и глубже — 6 сцен вместо 4, автосмена, кнопка «в
// бриф». Открывается кнопкой в шапке страницы.
//
// Почему портал в <body>: шапка страницы анимируется через transform, а у
// transform-предка `position: fixed` перестаёт значить «весь экран» — окно
// оказалось бы обрезано шапкой. Портал выносит его из этого потока.
//
// Мобильная раскладка: сцена сверху, текст под ней, вся панель
// прокручивается внутри (`overflow-y-auto`), фон под ней заблокирован.

const BEAT_MS = 5200;

export default function ServiceDeepDive({ slug }: { slug: string }) {
  const data = directionDeep(slug);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const steps = data?.benefits.length ?? 0;

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || held || reduced || steps < 2) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), BEAT_MS);
    return () => window.clearInterval(id);
  }, [open, held, reduced, steps]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!data) return null;

  return (
    <>
      {/* Тот же компактный неоновый пилл, что у карточек направлений на
          главной (DirectionsGrid «Обсудить формат») — не сплошная тёплая
          заливка на всю ширину, а аккуратная кнопка-приглашение. */}
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className="btn-neon !px-3.5 !py-1.5 !text-[10px]"
      >
        Почему это работает — {steps} сцен
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="dive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.35 }}
                className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/80 backdrop-blur-md sm:items-center sm:p-6"
                onClick={close}
                role="dialog"
                aria-modal="true"
                aria-label={data.title}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHeld(true)}
                  onMouseLeave={() => setHeld(false)}
                  style={
                    {
                      "--sp-from": data.accent.from,
                      "--sp-to": data.accent.to,
                    } as React.CSSProperties
                  }
                  className="relative flex max-h-[94svh] w-full max-w-6xl flex-col overflow-y-auto rounded-t-3xl border border-white/15 bg-[rgba(12,13,18,0.94)] p-4 shadow-[0_0_80px_-20px_var(--sp-from)] sm:max-h-[90svh] sm:rounded-3xl sm:p-6 lg:flex-row lg:gap-8 lg:p-8"
                >
                  {/* Сцена: на телефоне сверху во всю ширину, на десктопе —
                      колонка слева. Пропорция сцены (340×210) держится
                      сама, поэтому высота считается от ширины. */}
                  <div className="relative aspect-[340/210] w-full shrink-0 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 lg:w-[48%] lg:self-start">
                    <SpotlightScene slug={data.slug} step={step} />
                  </div>

                  <div className="mt-4 flex min-w-0 flex-1 flex-col lg:mt-0">
                    <SpotlightCopy data={data} step={step} setStep={setStep} onClose={close} />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link href="/brief" onClick={close} className="btn-neon btn-warm !py-3">
                        Обсудить проект
                      </Link>
                      <button
                        type="button"
                        onClick={() => setStep((s) => (s + 1) % steps)}
                        className="font-display text-xs uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                      >
                        Дальше →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
