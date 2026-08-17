"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useFullpage } from "@/lib/fullpage";
import { serviceMeta, serviceOrder } from "@/lib/service-content";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { VIBE_BUTTON_CLASS, vibeButtonStyle } from "@/components/home/WelcomeOverlay";

const EASE = [0.22, 1, 0.36, 1] as const;
const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

// Always-on-screen entry point into the same "what are you after" service
// choice the welcome overlay's "VIBE САЙТ" button leads to (WelcomeOverlay.tsx)
// — same pill style, same copy, same four links — just reachable from any
// scroll position on any page, not only the first-visit greeting.
export default function FloatingCta() {
  const pathname = usePathname();
  const api = useFullpage();
  const fullpageActive = pathname === "/" && (api?.ready ?? false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    if (fullpageActive) return;
    const onScroll = () => setScrolled(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fullpageActive]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const visible = fullpageActive ? (api?.activeIndex ?? 0) > 0 : scrolled;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-30"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`${VIBE_BUTTON_CLASS} !h-12 !w-12 !p-0 sm:!h-auto sm:!w-auto sm:!px-[22px] sm:!py-[10px]`}
              style={vibeButtonStyle()}
            >
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" />
              <span className="hidden sm:inline">VIBE САЙТ</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Выбор направления"
            className="fixed inset-0 z-[97] flex items-center justify-center bg-ink/90 px-6 backdrop-blur-2xl"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex w-full max-w-xl flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-sans text-xl font-light leading-snug text-paper sm:text-2xl">
                Что тебя интересует?
              </p>

              <motion.div
                initial="hidden"
                animate="show"
                variants={LIST_VARIANTS}
                className="mx-auto mt-8 flex w-full max-w-[280px] flex-col gap-3 sm:mt-10"
              >
                {serviceOrder.map((key) => (
                  <motion.div key={key} variants={ITEM_VARIANTS}>
                    <Link
                      href={`/${serviceMeta[key].slug}`}
                      onClick={() => setOpen(false)}
                      className="btn-neon w-full justify-center"
                    >
                      {serviceMeta[key].label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-10 whitespace-nowrap rounded-full border border-paper/20 bg-ink/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md transition hover:border-glow/50 hover:text-paper"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
