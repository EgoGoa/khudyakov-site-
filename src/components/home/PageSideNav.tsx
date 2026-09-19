"use client";

import Link from "next/link";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { NeonChevron } from "@/components/home/ServicePicker";

// Fixed side arrows for stepping between the four service pages, always on
// screen while scrolling — a smaller echo of the hero picker's own
// prev/next chevrons (same glyph), not a second copy of that carousel.
// Parked at bottom-24 rather than vertically centered: VibeRail owns
// top-1/2 on the right edge at lg+, and this stays clear of it (and of
// VibeRail's own bottom-6 mobile toggle) at every breakpoint instead of
// juggling per-breakpoint offsets.
const TOP_LEVEL_ROUTES = new Set(["/content", "/ai", "/sites", "/smm"]);

// Each target's whole label is painted in that page's own chapter-heading
// gradient (same stops as its `.kw`/`.chapter-neon-*` colours in
// globals.css), not just one picked-out keyword — at this chip's size a
// single accent letter read as barely-there, and /smm had no gradient at
// all before this (its `.kw` only exists at heading scale). One consistent
// per-page recipe here instead.
export const PAGE_GRADIENT: Record<ServiceKey, { from: string; via?: string; to: string }> = {
  content: { from: "#ff4fd8", to: "#ff6a3d" },
  ai: { from: "#c8f169", to: "#10b981" },
  sites: { from: "#ff4fd8", to: "#00d2ff" },
  smm: { from: "#a855f7", to: "#38bdf8" },
};

export default function PageSideNav() {
  const pathname = useCleanPathname();
  if (!TOP_LEVEL_ROUTES.has(pathname)) return null;

  const count = serviceOrder.length;
  const index = serviceOrder.indexOf(
    serviceOrder.find((key) => `/${serviceMeta[key].slug}` === pathname) ?? "content",
  );
  const prevKey = serviceOrder[(index - 1 + count) % count];
  const nextKey = serviceOrder[(index + 1) % count];

  return (
    <>
      <SideArrow side="left" targetKey={prevKey} />
      <SideArrow side="right" targetKey={nextKey} />
    </>
  );
}

function SideArrow({ side, targetKey }: { side: "left" | "right"; targetKey: ServiceKey }) {
  const meta = serviceMeta[targetKey];
  const words = meta.label.split(" ");
  const isLeft = side === "left";
  const gradient = PAGE_GRADIENT[targetKey];

  const gradientStyle = {
    backgroundImage: gradient.via
      ? `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.via} 55%, ${gradient.to} 100%)`
      : `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    filter: `drop-shadow(0 0 6px ${gradient.from}77) drop-shadow(0 0 14px ${gradient.to}77)`,
  } as const;

  const label = (
    <span
      className={`font-display text-[8px] uppercase leading-[1.05] tracking-tight sm:text-[10px] ${
        isLeft ? "text-left" : "text-right"
      }`}
    >
      {words.map((word, i) => (
        <span key={i} className="block" style={gradientStyle}>
          {word}
        </span>
      ))}
    </span>
  );

  return (
    // The link's own box is now just the chevron (h-11 w-11) — the glass
    // card and the label are absolutely positioned children that reveal on
    // hover. That is the whole point of the rebuild: the old version was a
    // permanently visible 97x93 card at 50% opacity, and an invisible-ish
    // box that size sitting over the content still swallowed clicks meant
    // for whatever was underneath it (measured: it was covering a service
    // row on /ai). Absolute children with `pointer-events-none` add no hit
    // area at all, so at rest this element occupies 44x44 at the very screen
    // edge and takes nothing away from the page.
    <Link
      href={`/${meta.slug}`}
      aria-label={`${isLeft ? "Предыдущая" : "Следующая"} страница: ${meta.label}`}
      className={`group fixed bottom-24 z-30 land:bottom-1 flex h-10 w-10 land:h-8 land:w-8 items-center justify-center transition-transform duration-300 active:scale-90 active:duration-100 sm:h-11 sm:w-11 ${
        isLeft
          ? "left-1 sm:left-3 xl:left-6 land:left-[calc(50%-92px)]"
          : "right-1 sm:right-3 xl:right-6 land:right-[calc(50%-92px)]"
      }`}
    >
      {/* The glass card, revealed only on hover. Stretched past the link's
          own box so it frames the chevron and the label under it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -top-3 -bottom-9 hidden rounded-2xl sm:block border border-paper/10 bg-ink/70 opacity-0 shadow-[0_0_20px_rgba(255,79,216,0.45),0_0_38px_rgba(255,106,61,0.32)] backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Always on screen, breathing at rest (see .page-nav-arrow-pulse in
          globals.css) and pinned at full brightness on hover. */}
      <span className="page-nav-arrow-pulse relative transition-opacity duration-300">
        <NeonChevron flip={isLeft} className="h-8 w-8 sm:h-11 sm:w-11 land:h-6 land:w-6" />
      </span>

      {/* The destination's name — absolute, so it never grows the hit area,
          and `pointer-events-none` so the invisible text box cannot block
          the content it floats over either. */}
      <span className={`pointer-events-none absolute top-full mt-1 opacity-0 land:hidden sm:left-1/2 sm:right-auto sm:-translate-x-1/2 ${
          isLeft ? "left-0" : "right-0"
        } transition-opacity duration-300 group-hover:opacity-100`}>
        {label}
      </span>
    </Link>
  );
}
