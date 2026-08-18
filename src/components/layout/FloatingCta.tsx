"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useFullpage } from "@/lib/fullpage";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { VIBE_BUTTON_CLASS, vibeButtonStyle } from "@/components/home/WelcomeOverlay";
import WelcomeWidget from "@/components/home/WelcomeWidget";
import CenterModal from "@/components/ui/CenterModal";

// Always-on-screen entry point into the same greeting → direction-picker
// widget the first-visit WelcomeOverlay opens with (WelcomeWidget.tsx, inside
// the shared CenterModal card) — same copy, same voice wave, same flow — just
// reachable from any scroll position on any page, not only on a fresh landing.
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

  const visible = fullpageActive ? (api?.activeIndex ?? 0) > 0 : scrolled;
  const close = () => setOpen(false);

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

      <CenterModal open={open} onClose={close} ariaLabel="Выбор направления">
        <WelcomeWidget onClose={close} />
      </CenterModal>
    </>
  );
}
