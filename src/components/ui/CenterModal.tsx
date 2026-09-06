"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/ui/Icons";

const EASE = [0.22, 1, 0.36, 1] as const;

// How long the whole subtree is kept alive after `open` goes false — the
// slower of the two exits below (0.4s) plus a beat. See the mount gate in
// the component itself for why this is ours to do rather than
// AnimatePresence's.
const EXIT_MS = 500;

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

  // Unmounting is ours, not AnimatePresence's.
  //
  // framer-motion 12 does not reliably drop this dialog's exiting child:
  // the fade itself plays to the end, but the node is never removed from
  // the tree. What is left behind is this `fixed inset-0 z-[100]` layer at
  // opacity 0 — invisible, and still covering the entire viewport with
  // `pointer-events: auto`. Every click on the page then lands on the
  // backdrop instead of the page (which also fires `onClose` again), and
  // `aria-modal="true"` keeps the whole document hidden from assistive
  // tech. Reproduced in a production build as well as in dev, so it is not
  // a StrictMode artefact, and an explicit `key` on the child did not help.
  //
  // `keepAlive` therefore holds the subtree for exactly as long as the exit
  // needs to play, and then this component returns null — which takes the
  // stuck node with it. Children unmount properly too, so the widgets
  // inside stop their own timers on close.
  const [keepAlive, setKeepAlive] = useState(false);
  useEffect(() => {
    if (open) {
      // Arming the grace period the moment the dialog opens. The rule below
      // is about effects that sync React state with an external system;
      // this is the dialog's own lifecycle, and there is nothing external
      // to read it from.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKeepAlive(true);
      return;
    }
    const id = window.setTimeout(() => setKeepAlive(false), EXIT_MS);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!open && !keepAlive) return null;

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
