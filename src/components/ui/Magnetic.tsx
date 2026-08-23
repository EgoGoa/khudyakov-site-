"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Wraps one interactive element and pulls it a few px toward the pointer
// while hovered, springing back to rest on leave — the classic "magnetic
// button" micro-interaction. Mouse + fine-pointer only: touch has no hover
// to magnetize toward, and reduced-motion visitors get a plain static button.
export default function Magnetic({
  children,
  strength = 0.35,
}: {
  children: ReactNode;
  /** Fraction of the pointer's offset from centre the element travels. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: springX, y: springY, display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
