"use client";

import { motion } from "framer-motion";

// A small paper-plane that drifts back and forth across whichever team card
// it's dropped into (see TeamRow's `planeMemberId`) — /content's ask for a
// "мы на связи" touch on Egor's own card specifically, not a generic icon
// bolted onto the closing CTA line. Absolutely positioned by the caller
// (TeamCard gives its button `position: relative`), aria-hidden since it's
// pure decoration layered over an otherwise fully-labelled button.
export default function FlyingPlaneIcon() {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-2 text-glow/70"
      animate={{ x: [0, 10, 0, -10, 0], y: [0, -4, 0, 4, 0], rotate: [0, 8, 0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.5 2.5 2 10.8c-.6.26-.58 1.13.03 1.36l7.1 2.7 2.7 7.1c.23.61 1.1.63 1.36.03L21.5 2.5Z" />
      </svg>
    </motion.span>
  );
}
