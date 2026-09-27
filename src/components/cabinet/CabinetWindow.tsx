"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { WIN, WIN_DIM } from "@/lib/motion";
import Cabinet from "./Cabinet";
import { useCabinet } from "./store";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useDialogFocus } from "@/lib/use-dialog-focus";

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
  // Общая блокировка (не своя на <html>): она держит ширину страницы, чтобы
  // сайт не дёргался вбок, и её видит CinematicStage — колесо внутри кабинета
  // не листает главы под ним.
  useBodyScrollLock(open);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open && mounted, dialogRef);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="cab" className="cab-scope fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-8" initial={WIN_DIM.initial} animate={WIN_DIM.animate} exit={WIN_DIM.exit}>
          {/* Сайт за кабинетом темнеет и мягко размывается — Егор просил,
              чтобы фокус был только на окне. */}
          <div className="absolute inset-0 bg-ink/75 backdrop-blur-md" onClick={() => setOpen(false)} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Личный кабинет"
            className={gate ? "relative w-full outline-none max-w-[440px]" : "relative h-[min(820px,calc(100dvh-1.5rem))] w-full max-w-[1320px] outline-none"}
            layout
            // Без filter в анимации: filter на предке ломает backdrop-filter
            // стекла кабинета — оно перестаёт размывать страницу под собой.
            // Общая анимация окон сайта (WIN, lib/motion).
            initial={WIN.initial}
            animate={WIN.animate}
            exit={WIN.exit}
          >
            <Cabinet onClose={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
