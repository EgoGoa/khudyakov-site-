"use client";

import { MotionConfig } from "framer-motion";
import { useSyncExternalStore } from "react";
import { getTier, onTierChange } from "@/lib/perf-tier";

// One switch for every framer-motion animation on the site (51 files use it),
// so no block needs its own weak-device branch — the shared motion system
// stays shared. On the low tier framer's "reduced motion" mode is forced:
// movement, scale and layout animations land instantly, fades still play. A
// fade is cheap to composite; a card flying in with a transform on every
// frame is what a weak phone stutters on. Other tiers keep the site's
// current behaviour ("never").
//
// The server snapshot is "not low"; React swaps in the real tier (set by the
// head script before paint) right after hydration, and follows live
// downgrades from PerfGovernor. MotionConfig renders no DOM, so nothing
// mismatches.
export default function MotionTier({ children }: { children: React.ReactNode }) {
  const low = useSyncExternalStore(
    (cb) => onTierChange(cb),
    () => getTier() === "low",
    () => false,
  );

  return <MotionConfig reducedMotion={low ? "always" : "never"}>{children}</MotionConfig>;
}
