"use client";

import { Fragment, useEffect, useRef } from "react";

// Splits `text` into one <span> per character and nudges each one a few px
// toward the cursor as it passes near — the letter-level sibling of
// Magnetic.tsx's whole-button pull. Same mouse + fine-pointer only gate and
// reduced-motion check as that component.
//
// Applied directly to Hero.tsx's headline runs. The className passed in
// (hero-neon-word / hero-gradient-text) has to land on every individual
// letter span, not a wrapping element: those classes paint a gradient via
// `background-clip: text`, which only clips to a box's own text content —
// once letters are split into their own inline-block boxes, a class on a
// parent wrapper would no longer reach them, so each letter must carry it.
// Spaces between words render as plain text so the browser's normal
// line-wrapping at word boundaries still works. Letters within one word are
// additionally grouped under a `white-space: nowrap` span — unlike a plain
// text run, adjacent `display: inline-block` boxes (what each letter is)
// are themselves a soft-wrap opportunity to most browsers, so without that
// wrapper a narrow viewport would break the word apart between arbitrary
// letters instead of only at its edges.
//
// Distance math runs on `pointermove` at the window level, throttled to one
// pass per animation frame; CSS (`.magnetic-char` in globals.css) owns the
// actual motion via `transition: transform`, which is what turns each new
// target into a soft, slightly overshooting follow instead of the letter
// snapping straight to it.
const RADIUS = 110; // px — how close the cursor has to be to pull a letter
const MAX_PULL = 7; // px — "не много": a nudge, not a jump

export default function MagneticChars({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        for (const el of lettersRef.current) {
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist > RADIUS) {
            el.style.transform = "";
            continue;
          }
          const pull = (1 - dist / RADIUS) * MAX_PULL;
          const angle = Math.atan2(dy, dx);
          el.style.transform = `translate(${(Math.cos(angle) * pull).toFixed(1)}px, ${(
            Math.sin(angle) * pull
          ).toFixed(1)}px)`;
        }
      });
    };

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  let letterIndex = 0;
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {[...word].map((char, ci) => {
              const idx = letterIndex++;
              return (
                <span
                  key={ci}
                  ref={(el) => {
                    lettersRef.current[idx] = el;
                  }}
                  className={`magnetic-char ${className}`}
                  style={{ display: "inline-block" }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </>
  );
}
