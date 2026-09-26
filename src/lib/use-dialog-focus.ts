"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Several dialogs can be mounted at once (welcome + service menu); only the
// most recently opened one owns Tab.
const stack: symbol[] = [];

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0
  );
}

/**
 * Keyboard focus for a modal dialog: moves focus into it on open, keeps Tab
 * cycling inside it, and hands focus back to whatever opened it on close.
 * The dialog element itself receives the initial focus (it needs
 * tabIndex={-1}), so screen readers announce its label and no button lights
 * up a focus ring for mouse users.
 */
export function useDialogFocus(active: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const id = Symbol("dialog");
    stack.push(id);
    const opener = document.activeElement as HTMLElement | null;

    const raf = requestAnimationFrame(() => {
      const root = ref.current;
      if (root && !root.contains(document.activeElement)) root.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || stack[stack.length - 1] !== id) return;
      const root = ref.current;
      if (!root) return;
      const items = focusables(root);
      if (items.length === 0) {
        e.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!root.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (current === first || current === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      const i = stack.indexOf(id);
      if (i !== -1) stack.splice(i, 1);
      if (opener && opener.isConnected && opener !== document.body) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [active, ref]);
}
