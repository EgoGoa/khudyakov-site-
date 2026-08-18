"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/ui/Icons";

const EASE = [0.22, 1, 0.36, 1] as const;

// A bounded card centred on screen, with the page behind it dimmed but not
// blurred — the blur lives on the card itself (its own backdrop-filter), so
// only what's directly behind the window reads as frosted glass. The rest of
// the site stays sharp, just darkened. No border/ring on the card by design
// — light, translucent fill plus a strong blur is what sells "glass" here,
// not an edge. Shared by WelcomeOverlay (the first-visit greeting),
// ServiceMenuOverlay (the per-service "с чего начнём?" menu), and VibeRail
// (the "Vibe" row and each block's own Vibe-mode window), so the same look
// opens from any entry point instead of several drifting dialogs.
export default function CenterModal({
  open,
  onClose,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/50 px-4 py-10 sm:px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            // Sized wide enough that the voice-wave graphic, the four service
            // buttons and the mic all sit comfortably — the previous unbounded
            // layout floated in the void, so nothing pinned the composition to
            // any deliberate width. Height stays intrinsic to the content but
            // caps at 85vh with its own scroll, for short viewports.
            //
            // Lighter and no border, by design: a translucent grey (not the
            // near-black of the old liquid-glass fill) over a strong blur —
            // the card reads as frosted glass the page shows through, not a
            // bordered panel dropped on top of it. Kept as inline style
            // rather than the .liquid-glass class specifically because that
            // class's own ::before is what painted the hairline gradient
            // border this is deliberately going without.
            style={{
              background: "rgba(38,40,50,0.55)",
              backdropFilter: "blur(40px) saturate(160%)",
              WebkitBackdropFilter: "blur(40px) saturate(160%)",
              // The same pink→cyan family as the "VIBE САЙТ" pill's own
              // glow (see GLASS_BTN.vibe in WelcomeOverlay.tsx), just
              // softer and wider so the whole window reads as lit from
              // that button rather than carrying an unrelated glow of
              // its own.
              boxShadow: "0 0 70px rgba(236,72,153,0.22), 0 0 100px rgba(56,189,248,0.19)",
            }}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] px-6 py-10 sm:px-12 sm:py-14"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 text-paper/70 backdrop-blur-md transition hover:bg-paper/20 hover:text-paper sm:left-5 sm:top-5"
            >
              <CloseIcon />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
