"use client";

import { useEffect, useRef } from "react";

/**
 * Clears a modal's form once it has closed — after the exit animation, so the
 * fields don't visibly blank out mid-fade. Keyed on `open` rather than fired
 * from the close handler, so reopening within the delay cancels the pending
 * reset instead of letting it wipe what the visitor has typed since.
 */
export function useResetAfterClose(open: boolean, reset: () => void, delayMs = 400) {
  const resetRef = useRef(reset);
  useEffect(() => {
    resetRef.current = reset;
  });
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const id = setTimeout(() => resetRef.current(), delayMs);
    return () => clearTimeout(id);
  }, [open, delayMs]);
}
