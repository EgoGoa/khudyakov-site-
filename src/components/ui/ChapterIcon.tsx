"use client";

// One themed line icon per chapter, drawn in a single visual language:
// 24-unit grid, 1.75 stroke, round caps and joins, no fills. They are set in
// the site's cyan `glow` with a neon halo so they read as part of the same
// typographic system as the chapter headings (.chapter-neon).
//
// "Alive": each icon draws itself on when its chapter takes the stage
// (stroke-dashoffset), then keeps a slow halo breathe going. Both are disabled
// under prefers-reduced-motion, where the icon simply renders finished.
//
// Every icon here is decorative — the chapter number and title next to it
// already carry the meaning — so they are hidden from the accessibility tree.

export type ChapterIconName =
  | "aperture" // 01 opening — the craft itself
  | "frames" // 02 works — a reel of pieces
  | "shield" // 03 trust — why us
  | "layers" // 04 offer — the stack of services
  | "route" // 05 process — brief → shoot → delivery
  | "spark" // 06 close — the offer / payoff
  | "target" // /ai 02 — who this is for, and the cases that prove it
  | "scale" // /ai 05 — guarantees, terms, what's included
  | "users"; // /ai 07 — team and blog

const PATHS: Record<ChapterIconName, React.ReactNode> = {
  aperture: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v7.5M20.8 7.5l-6.5 3.75M20.8 16.5l-6.5-3.75M12 21v-7.5M3.2 16.5l6.5-3.75M3.2 7.5l6.5 3.75" />
    </>
  ),
  frames: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 9h18M3 15h18M8 5v14M16 5v14" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12L12 16.5 20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </>
  ),
  route: (
    <>
      <circle cx="5.5" cy="6" r="2.5" />
      <circle cx="18.5" cy="18" r="2.5" />
      <path d="M8 6h6.5a3.5 3.5 0 0 1 0 7H9.5a3.5 3.5 0 0 0 0 7H16" />
    </>
  ),
  spark: (
    <>
      <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
      <path d="M19 17.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 21h10" />
      <path d="M12 6L5 8l3.2 6.2a3.4 3.4 0 0 0 5.6 0L15 8l-3-2z" />
      <path d="M5 8L3 12.5a2.5 2.5 0 0 0 4.6 0L5 8zM19 8l-2 4.5a2.5 2.5 0 0 0 4.6 0L19 8z" />
    </>
  ),
  users: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.7.3 4.5 2.5 4.5 5.8" />
    </>
  ),
};

export default function ChapterIcon({
  name,
  active = true,
  size = 30,
  className = "",
}: {
  name: ChapterIconName;
  /** Replays the draw-on each time the chapter returns to the stage. */
  active?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      // Remounting on `active` is what restarts the CSS draw animation — a
      // class toggle alone would not replay it without forcing a reflow.
      key={active ? "on" : "off"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`chapter-icon ${active ? "is-active" : ""} ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}
