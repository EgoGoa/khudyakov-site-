"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Lets the desktop carousels (SitesDeck, SmmDeck, AiDeck) run on a phone
// unchanged. Their fans are laid out in fixed px for a ~560px column; here the
// whole fan is drawn at that design width and scaled down uniformly to the
// space it actually has, so the poses, glow and motion stay exactly the ones
// from desktop. `designWidth` is deliberately narrower than the full fan: the
// outermost pair of cards is allowed to be clipped at the screen edge, which
// keeps the front card large instead of shrinking everything to fit them.
// Horizontal swipe pages the deck; vertical drags still scroll the page.
const PAD = 110;
const FADE = "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)";

export default function FanFit({
  designWidth,
  height,
  onSwipe,
  children,
}: {
  designWidth: number;
  height: number;
  onSwipe: (delta: number) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; vh: number; narrow: boolean; land: boolean } | null>(null);
  const touchX = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, vh: window.innerHeight, narrow: window.innerWidth < 1024, land: window.innerWidth > window.innerHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // From lg up the fan keeps its desktop size (scale 1). Below it the fan is
  // blown UP, not shrunk: the front card should fill the screen width, capped
  // so the whole fan still fits in ~50% of the screen height.
  const width = size?.w ?? null;
  const narrow = size?.narrow ?? false;
  const scale =
    size && narrow ? Math.min(size.w / designWidth, (size.vh * (size.land ? 0.72 : 0.5)) / height) : 1;
  const inner = width ? width / scale : designWidth;

  return (
    <div
      ref={ref}
      className="pointer-events-none relative w-full overflow-x-clip [touch-action:pan-y]"
      style={{
        // Vertical breathing room: the edge mask (and overflow clip) cut
        // everything outside this box, so without it the cards' glow and the
        // "Хит месяца" badge ended in a hard line at the top and bottom. The
        // extra PAD is cancelled by the negative margin, so layout is unchanged.
        height: height * scale + PAD * 2,
        marginTop: -PAD,
        marginBottom: -PAD,
        // Full-bleed on a phone: break out of the page gutters so the side
        // cards (and their fade) reach the very edge of the screen.
        ...(narrow && !size?.land ? { width: "100vw", marginLeft: "calc(50% - 50vw)" } : null),
        visibility: width ? undefined : "hidden",
        // On a phone the side cards run to the screen edge and fade out
        // instead of being cut off, so the row still reads as a carousel.
        ...(narrow ? { WebkitMaskImage: FADE, maskImage: FADE } : null),
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
      }}
    >
      <div
        className="pointer-events-auto absolute left-0 origin-top-left"
        style={{ width: inner, height, top: PAD, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
