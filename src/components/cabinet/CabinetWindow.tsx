"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Cabinet from "./Cabinet";
import { useCabinet } from "./store";

// Кабинет поверх любой страницы — открывается иконкой в шапке и кнопкой
// после заявки в чате. Та же вёрстка, что на отдельной странице /cabinet.
export const OPEN_CABINET = "hdkv-open-cabinet";
export const openCabinet = () => window.dispatchEvent(new Event(OPEN_CABINET));

export default function CabinetWindow() {
  const [open, setOpen] = useState(false);
  const state = useCabinet();
  const gate = !state.registered || !state.onboarded;
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- портал только после гидратации
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_CABINET, show);
    return () => window.removeEventListener(OPEN_CABINET, show);
  }, []);
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="cab" className="cab-scope fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Сайт за кабинетом темнеет и мягко размывается — Егор просил,
              чтобы фокус был только на окне. */}
          <div className="absolute inset-0 bg-ink/75 backdrop-blur-md" onClick={() => setOpen(false)} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Личный кабинет"
            className={gate ? "relative w-full max-w-[440px]" : "relative h-[min(820px,calc(100dvh-1.5rem))] w-full max-w-[1320px]"}
            layout
            // Без filter в анимации: filter на предке ломает backdrop-filter
            // стекла кабинета — оно перестаёт размывать страницу под собой.
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          >
            <Cabinet onClose={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
