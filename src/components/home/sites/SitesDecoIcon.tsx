"use client";

import Reveal from "@/components/ui/Reveal";

// Same glass-icon decoration pattern as ContentDecoIcon/SmmDecoIcon/AiDecoIcon,
// pointed at the purple-cherry palette generated for /sites (see
// public/images/icons/sites and the .sites-deco-icon-* classes in
// globals.css). Positioned via `className` from the call site rather than
// computed here, since each chapter's header has its own layout.
//
// Reveal (see that component) gives every icon a one-time scroll-in pop —
// separate from the continuous loop (click/pulse/float), which lives on the
// <img> itself via CSS so the two animations don't fight over one transform.
export default function SitesDecoIcon({
  src,
  size,
  rotate,
  className = "",
  z = 0,
  /** Repeating press-down "click" pulse (see .sites-deco-icon-click in
   *  globals.css) — for the cursor icon pinned to the pitch title, reading
   *  as clicking it rather than floating. */
  click = false,
  /** Gentle breathing scale pulse (see .sites-deco-icon-pulse in
   *  globals.css) — for a single hero icon that should read as calmly
   *  alive rather than drifting. Takes priority over the default float. */
  pulse = false,
  delay = 0.1,
}: {
  src: string;
  size: number;
  rotate: number;
  className?: string;
  z?: number;
  click?: boolean;
  pulse?: boolean;
  delay?: number;
}) {
  const animClass = click ? "sites-deco-icon-click" : pulse ? "sites-deco-icon-pulse" : "sites-deco-icon-float";
  return (
    <div
      className={`pointer-events-none absolute hidden lg:block ${className}`}
      style={{ zIndex: z }}
      aria-hidden="true"
    >
      <Reveal delay={delay} y={30}>
        <img
          src={src}
          alt=""
          loading="lazy"
          width={size}
          className={`rounded-[26px] ${animClass}`}
          style={{ width: size, height: "auto", "--r": `${rotate}deg` } as React.CSSProperties}
        />
      </Reveal>
    </div>
  );
}
