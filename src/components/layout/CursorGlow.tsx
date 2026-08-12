"use client";

import { useEffect, useRef } from "react";

// A soft neon glow that trails the cursor, site-wide. Position is driven by
// a rAF loop lerping toward the real pointer (not 1:1) so it reads as a
// trailing wisp rather than a cursor replacement — and by transform only,
// never top/left, so it never triggers layout. Desktop only: touch devices
// have no persistent pointer position, so it would just sit stuck somewhere.
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pos = { x: -200, y: -200 };
    const target = { x: -200, y: -200 };
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible && dotRef.current) {
        visible = true;
        dotRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      const el = dotRef.current;
      if (el) el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden opacity-0 sm:block"
      style={{
        width: 280,
        height: 280,
        borderRadius: "9999px",
        background: "radial-gradient(circle, rgba(0,210,255,0.14) 0%, rgba(0,210,255,0.05) 40%, transparent 70%)",
        filter: "blur(8px)",
        mixBlendMode: "screen",
        transition: "opacity 0.4s ease",
        willChange: "transform",
      }}
    />
  );
}
