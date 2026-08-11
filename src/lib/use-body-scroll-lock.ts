"use client";

import { useEffect } from "react";

// Module-scoped, not per-instance: WelcomeOverlay and ServiceMenuOverlay can
// both be mounted at once (a fresh landing on /content mounts both), so a
// naive "restore to whatever it was before" per component would have
// whichever one closes first unlock scroll while the other is still open.
// Reference-counting means body stays locked until the last one releases it.
let lockCount = 0;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [active]);
}
