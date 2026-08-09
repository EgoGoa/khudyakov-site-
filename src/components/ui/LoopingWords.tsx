"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

// Vertical looping word-slot: cycles through `words`, sliding the next one
// up into view and easing an underline to the new word's width. Adapted
// from the "looping words" GSAP pattern, restyled to the site's own type
// system (Montserrat 300, shiny cyan gradient) instead of the source
// component's own Webflow-authored CSS classes.
export default function LoopingWords({
  words,
  className = "",
}: {
  words: string[];
  className?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const stepRef = useRef(0); // measured px height of one word — drives the vertical shift

  const updateEdgeWidth = useCallback(() => {
    const list = listRef.current;
    const edge = edgeRef.current;
    if (!list || !edge) return;
    const centerWord = list.children[(indexRef.current + 1) % words.length] as HTMLLIElement;
    if (!centerWord) return;
    gsap.to(edge, {
      width: centerWord.getBoundingClientRect().width,
      duration: 0.5,
      ease: "expo.out",
    });
  }, [words.length]);

  const moveWords = useCallback(() => {
    const list = listRef.current;
    if (!list || stepRef.current === 0) return;

    indexRef.current += 1;

    gsap.to(list, {
      y: -stepRef.current * indexRef.current,
      duration: 1.2,
      ease: "elastic.out(1, 0.85)",
      onStart: updateEdgeWidth,
      onComplete: () => {
        // seamless infinite loop: once we're 3 words from the visual end,
        // recycle the first word to the end and snap the index back by one
        if (indexRef.current >= words.length - 3) {
          list.appendChild(list.children[0]);
          indexRef.current -= 1;
          gsap.set(list, { y: -stepRef.current * indexRef.current });
        }
      },
    });
  }, [updateEdgeWidth, words.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const firstWord = list.children[0] as HTMLLIElement | undefined;
    stepRef.current = firstWord?.getBoundingClientRect().height ?? 0;
    updateEdgeWidth();

    const tl = gsap.timeline({ repeat: -1, delay: 1 });
    tl.call(moveWords).to({}, { duration: 2 });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      className={`relative inline-block align-baseline overflow-hidden ${className}`}
      style={{ height: "1em", lineHeight: 1 }}
    >
      <ul ref={listRef} className="m-0 list-none p-0">
        {words.map((word, i) => (
          <li key={`${word}-${i}`} style={{ lineHeight: 1 }}>
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #7DD3FC, #00D2FF, #7DD3FC)",
                backgroundSize: "200% auto",
                WebkitTextFillColor: "transparent",
                animation: "shiny 6s linear infinite",
              }}
            >
              {word}
            </span>
          </li>
        ))}
      </ul>
      <div
        ref={edgeRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] bg-glow"
        style={{ boxShadow: "0 0 8px rgba(0,210,255,0.7)" }}
      />
    </span>
  );
}
