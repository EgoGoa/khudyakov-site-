// Same glass-icon decoration pattern as ContentDecoIcon/SmmDecoIcon, pointed
// at the emerald/birch-green palette generated for /ai (see
// public/images/icons/ai and the .ai-deco-icon-N classes in globals.css).
// Positioned via `className` from the call site rather than computed here,
// since each chapter's header has its own layout.
export default function AiDecoIcon({
  src,
  size,
  rotate,
  className = "",
  /** Picks one of four drift+glow-pulse paths (see globals.css) so several
   *  icons on one page don't all move in lockstep — vary this per icon. */
  variant = 1,
  z = 0,
  /** Swaps the drift+glow animation for a continuous 3D Y-axis spin (see
   *  .ai-deco-icon-spin3d in globals.css) — for a single object floating in
   *  space, not a framed card, spinning reads as alive in a way the flat
   *  drift doesn't. `rotate` is ignored in this mode (the spin owns the
   *  transform); the perspective lives on this wrapper, not the image
   *  itself, since 3D transforms need perspective on an ancestor. */
  spin3d = false,
  /** Swaps the drift for a repeating press-down "click" pulse (see
   *  .ai-deco-icon-click in globals.css) — for a cursor-shaped icon pinned
   *  to a specific letter, reading as clicking it rather than floating. */
  click = false,
}: {
  src: string;
  size: number;
  rotate: number;
  className?: string;
  variant?: 1 | 2 | 3 | 4;
  z?: number;
  spin3d?: boolean;
  click?: boolean;
}) {
  const animClass = spin3d ? "ai-deco-icon-spin3d" : click ? "ai-deco-icon-click" : `ai-deco-icon-${variant}`;
  return (
    <div
      className={`pointer-events-none absolute hidden lg:block ${className}`}
      style={{ zIndex: z, perspective: spin3d ? "900px" : undefined }}
      aria-hidden="true"
    >
      {/* height left auto (not forced to `size`) — several of these icons
          were cropped to non-square bounds (frame/shadow removed), so a
          fixed square box would stretch them. */}
      <img
        src={src}
        alt=""
        loading="lazy"
        width={size}
        className={`rounded-[26px] ${animClass}`}
        style={{ width: size, height: "auto", "--r": `${rotate}deg` } as React.CSSProperties}
      />
    </div>
  );
}
