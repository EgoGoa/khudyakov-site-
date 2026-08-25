import Reveal from "@/components/ui/Reveal";

// One scattered glass icon, placed next to a specific chapter rather than
// computed from page-wide percentages — a global overlay couldn't be
// calibrated against real content without guessing at chapter heights.
// z-0 keeps it behind the chapter's own text (z-10 on the chapter wrapper
// in page.tsx), so it can sit close to or slightly under a text block
// without ever covering it.

export default function SmmDecoIcon({
  src,
  size,
  rotate,
  className = "",
  delay = 0.1,
}: {
  src: string;
  size: number;
  rotate: number;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={`pointer-events-none absolute z-0 hidden lg:block ${className}`} aria-hidden="true">
      <Reveal delay={delay} y={36}>
        <img
          src={src}
          alt=""
          loading="lazy"
          width={size}
          height={size}
          className="smm-deco-icon rounded-[26px]"
          style={{ width: size, height: size, "--r": `${rotate}deg` } as React.CSSProperties}
        />
      </Reveal>
    </div>
  );
}
