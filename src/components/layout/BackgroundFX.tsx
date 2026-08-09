// Fixed backdrop shared by the whole page: her portrait, a cinematic glow
// gradient, faint grain, and the two vertical guide lines that frame the
// content column. Also hosts the SVG noise filter used by the pricing
// watermark. Every liquid-glass card backdrop-blurs this photo, which is
// what gives them their frosted-glass look.
//
// Static, no scroll-linked motion — plain background layer.
export default function BackgroundFX() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="khud-noise-headline">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
          <filter id="khud-noise-watermark">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.1" />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-ink">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 45% at 50% 0%, rgba(0,210,255,0.12), transparent 70%), radial-gradient(45% 35% at 85% 60%, rgba(245,49,11,0.08), transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />

        {/* she spans the full width as a static backdrop for the whole site
            below the hero, staying put behind every section — visible in
            the gaps between glass cards and softly through their
            backdrop-blur */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <img
            src="/images/portrait.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          {/* keeps body copy legible over the photo without flattening it */}
          <div className="absolute inset-0 bg-ink/45" />
        </div>
      </div>

      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+40rem)] w-px bg-paper/[0.06] z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+40rem)] w-px bg-paper/[0.06] z-[5]" />
    </>
  );
}
