// Same glass-icon decoration pattern as SmmDecoIcon (see that component),
// pointed at the orange-red palette generated for /content instead of
// smm's cyan set (see public/images/icons/content and the
// .content-deco-icon-N classes in globals.css). Positioned via `className`
// from the call site rather than computed here, since each chapter's header
// has its own layout.
export default function ContentDecoIcon({
  src,
  size,
  rotate,
  className = "",
  /** Picks one of four drift+glow-pulse paths (see globals.css) so several
   *  icons on one page don't all move in lockstep — vary this per icon. */
  variant = 1,
  /** Negative by default so the icon always paints behind the title/body
   *  text next to it, regardless of DOM order or which stacking context
   *  its wrapper happens to form — pass a positive value only for the one
   *  deliberate case of one icon sitting in front of another icon. */
  z = -1,
}: {
  src: string;
  size: number;
  rotate: number;
  className?: string;
  variant?: 1 | 2 | 3 | 4;
  z?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute hidden lg:block ${className}`}
      style={{ zIndex: z }}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        width={size}
        height={size}
        className={`rounded-[26px] content-deco-icon-${variant}`}
        style={{ width: size, height: size, "--r": `${rotate}deg` } as React.CSSProperties}
      />
    </div>
  );
}
