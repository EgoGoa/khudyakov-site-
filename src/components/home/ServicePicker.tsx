"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";

// One word inside each service's own label picked out in that service's own
// gradient — same "one keyword per heading" rule the service pages
// themselves follow, extended to this shared preview card since it cycles
// through all four labels regardless of which page is actually open.
// Colours match each page's own accent exactly (see globals.css / that
// page's own kw scoping): /sites and the site default share magenta→cyan,
// /ai is lime→emerald, /content is magenta→orange. /smm has no dedicated
// `.xxx-cool-headings` override the way /ai and /sites do (see globals.css)
// — its chapter headings just use the shared `.chapter-neon`, cyan-family
// like this. A flat two-stop cyan→blue read as flat/blended against the
// picker's own dark footage once Egor actually saw it live — this three-stop
// sky→cyan→violet run is his pick after comparing four live options against
// the real /video/bg-smm.mp4 background.
const LABEL_ACCENT: Partial<
  Record<ServiceKey, { word: string; from: string; via?: string; to: string; scale?: number }>
> = {
  content: { word: "контента", from: "#ff4fd8", to: "#ff6a3d" },
  ai: { word: "AI", from: "#c8f169", to: "#10b981" },
  sites: { word: "Vibe", from: "#ff4fd8", to: "#00d2ff" },
  // /smm has no entry here on purpose. Once the page itself was rebuilt with
  // its own violet identity, Egor asked for this label to read exactly like
  // that page's chapter heading — the near-white word under one soft violet
  // bloom, nothing picked out inside it. A single gradient letter is a
  // different idea from "one gradient keyword per heading", and with the word
  // being only three characters there is no keyword to pick. It is handled by
  // LABEL_TREATMENT below instead.
};

// Per-service overrides for the label's own type treatment, as opposed to a
// gradient inside it. Only /smm uses one: `.chapter-neon-violet` is the exact
// class its chapter headings carry (see globals.css), so the name of the
// direction in the picker and the heading of the page it leads to are set the
// same way. Anything listed here also opts OUT of `.service-label-glow`,
// whose animated cyan text-shadow would otherwise overwrite the treatment's
// own — the two are both text-shadow on the same element.
export const LABEL_TREATMENT: Partial<Record<ServiceKey, string>> = {
  smm: "chapter-neon-violet",
};

export function ServiceLabel({
  meta,
  serviceKey,
}: {
  meta: (typeof serviceMeta)[ServiceKey];
  serviceKey: ServiceKey;
}) {
  const accent = LABEL_ACCENT[serviceKey];
  if (!accent) return <>{meta.label}</>;

  const i = meta.label.lastIndexOf(accent.word);
  if (i === -1) return <>{meta.label}</>;

  const before = meta.label.slice(0, i);
  const after = meta.label.slice(i + accent.word.length);
  return (
    <>
      {before}
      <span
        style={{
          backgroundImage: accent.via
            ? `linear-gradient(90deg, ${accent.from} 0%, ${accent.via} 55%, ${accent.to} 100%)`
            : `linear-gradient(90deg, ${accent.from} 0%, ${accent.to} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          // .service-label-glow's text-shadow on the parent <h3> would
          // otherwise paint as a solid slab in the shape of this transparent
          // glyph (same issue the site-wide .kw class works around) — killed
          // here and replaced with a drop-shadow in the word's own colour(s),
          // which follows the painted gradient instead of the glyph fill.
          textShadow: "none",
          filter: `drop-shadow(0 0 10px ${accent.from}66) drop-shadow(0 0 26px ${accent.to}66)`,
          fontSize: accent.scale ? `${accent.scale}em` : undefined,
        }}
      >
        {accent.word}
      </span>
      {after}
    </>
  );
}

// A faceted, holomotion-style chevron: a thick gradient-stroked glyph with
// two ghost repeats trailing behind it at falling opacity, like the ones in
// the reference moodboard — not a plain "‹"/"›" character. Pure SVG/CSS, no
// imagery. `overflow: visible` on the <svg> matters here: an SVG clips its
// own children to the viewBox by default, so the blurred trail was getting
// cut off in a hard rectangle — that's the "square" artifact around the old
// version, not an actual box on the button. The gradient id comes from
// useId() (not a module-level counter) so it stays identical between the
// server-rendered markup and the client's first render — a plain counter
// increments a second time during hydration and was mismatching, which
// React repaints as a visible flash/box around the glyph.
export function NeonChevron({
  flip = false,
  className = "h-16 w-16 sm:h-20 sm:w-20",
}: {
  flip?: boolean;
  className?: string;
}) {
  const gradId = useId();
  return (
    <svg
      width="60"
      height="60"
      viewBox="-8 -8 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="55%" stopColor="#7dd8ff" />
          <stop offset="100%" stopColor="#ff8a5c" />
        </linearGradient>
      </defs>

      {/* trailing ghosts, falling back and fading out */}
      <path
        d="M8 4 20 12 8 20"
        stroke="#00d2ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
        transform="translate(-7, 0)"
      />
      <path
        d="M8 4 20 12 8 20"
        stroke="#00d2ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.32"
        transform="translate(-3.5, 0)"
      />

      {/* crisp foreground glyph */}
      <path
        d="M8 4 20 12 8 20"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter:
            "drop-shadow(0 0 5px rgba(0,210,255,0.9)) drop-shadow(0 0 14px rgba(0,210,255,0.55)) drop-shadow(0 0 30px rgba(255,138,92,0.3))",
        }}
      />
    </svg>
  );
}

// Only the "sites" slide has a video background — playing it only while its
// slide is actually the visible one (not just opacity:0'd behind the others)
// keeps the other three plain <img> slides free of any decode/CPU cost.
function SlideVideo({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) video.play().catch(() => {});
    else video.pause();
  }, [active]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[800ms] ease-out"
      style={{ opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(1.06)" }}
    />
  );
}

export default function ServicePicker() {
  const pathname = usePathname();
  const router = useRouter();
  const currentKey: ServiceKey =
    serviceOrder.find((key) => `/${serviceMeta[key].slug}` === pathname) ?? "content";

  // Arrows/dots both preview instantly (label, description, background) and
  // commit straight away — a click is the navigation now, not a step before
  // one. previewKey stays local state (not derived from pathname) purely so
  // the slide swaps on the same frame as the click, before the router's own
  // navigation has resolved; the effect below keeps it in sync for any other
  // way the route can change (a header link, back/forward).
  const [previewKey, setPreviewKey] = useState<ServiceKey>(currentKey);
  useEffect(() => {
    setPreviewKey(currentKey);
  }, [currentKey]);
  const index = serviceOrder.indexOf(previewKey);
  const count = serviceOrder.length;
  const previewMeta = serviceMeta[previewKey];

  // { scroll: false }: the visitor is standing right here, mid-page, when
  // they click — Next's default push scrolls the viewport to the top of the
  // new route on every navigation, which yanked the page up and back while
  // Hero/ServicePicker (unchanged, still mounted) sat still underneath it.
  const go = (delta: number) => {
    const next = serviceOrder[(index + delta + count) % count];
    setPreviewKey(next);
    router.push(`/${serviceMeta[next].slug}`, { scroll: false });
  };
  const goTo = (key: ServiceKey) => {
    setPreviewKey(key);
    router.push(`/${serviceMeta[key].slug}`, { scroll: false });
  };

  return (
    <section
      id="service-picker"
      // Full viewport height, not 70% — Egor asked for this block (photo/
      // video background, heading, arrows) to fill the whole screen rather
      // than sitting as a shorter band with page background visible above
      // and below it.
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        {serviceOrder.map((key) =>
          serviceMeta[key].video ? (
            <SlideVideo
              key={key}
              src={serviceMeta[key].video!}
              poster={serviceMeta[key].image}
              active={key === previewKey}
            />
          ) : (
            <img
              key={key}
              src={serviceMeta[key].image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[800ms] ease-out"
              style={{
                opacity: key === previewKey ? 1 : 0,
                transform: key === previewKey ? "scale(1)" : "scale(1.06)",
              }}
            />
          )
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.65), rgba(11,11,16,0.55) 40%, rgba(11,11,16,0.85))",
          }}
        />

        {/* The smoke veil was mounted here — inside the -z-10 media wrapper,
            above the grade and below every bit of copy. Parked for now: it
            renders and costs nothing (measured 121 fps with and without), but
            it still reads as fog rather than the swirling, filamented smoke
            it is meant to be. SmokeVeil.tsx is kept, with the fix it needs
            written up in its header, so bringing it back is this one line
            plus its import. */}
      </div>

      {/* No circle, no border — just the glyph with the same neon text-shadow
          as a chapter heading (.chapter-neon). Pulled in well past the
          VibeRail's fixed right-0 column (see layout/VibeRail.tsx) so the
          rail never sits on top of the right arrow. */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Предыдущее"
        className="service-arrow-left absolute left-10 top-1/2 z-10 hidden shrink-0 items-center justify-center transition-transform hover:scale-110 hover:opacity-80 sm:flex sm:left-[calc(50%-320px)] xl:left-[calc(50%-380px)]"
      >
        <NeonChevron flip />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следующее"
        className="service-arrow-right absolute right-10 top-1/2 z-10 hidden shrink-0 items-center justify-center transition-transform hover:scale-110 hover:opacity-80 sm:flex sm:right-[calc(50%-320px)] xl:right-[calc(50%-380px)]"
      >
        <NeonChevron />
      </button>

      <Container className="flex flex-col items-center py-10 text-center">
        {/* font-display, not the font-sans/light it used to be: this is the
            name of a direction, so it should be set in the same face every
            chapter heading on the service pages uses. The light sans read as
            a subtitle rather than as the title of the thing being chosen. */}
        <h3
          className={`font-display text-[clamp(1.8rem,4.5vw,2.8rem)] uppercase leading-[0.95] tracking-tight ${
            LABEL_TREATMENT[previewKey] ?? "service-label-glow text-paper"
          }`}
        >
          <ServiceLabel meta={previewMeta} serviceKey={previewKey} />
        </h3>

        {/* Fixed height (not just a wrapper), flex-centred: the four
            descriptions wrap to different line counts (one line for "Сайты",
            two for others), and this whole section centres its content
            vertically via `items-center` on the section below — so a shorter
            or taller description used to change the Container's total
            height and visibly shift the whole block (heading, dots, button)
            up or down every time the arrow was clicked. Reserved for two
            lines at the largest breakpoint's line-height, which is enough
            for every description in service-content.ts. */}
        <div className="mt-3.5 flex h-[38px] max-w-[440px] items-center sm:h-[44px]">
          <p className="service-sub-glow font-display text-[11px] uppercase leading-snug tracking-tight text-paper/75 sm:text-[13px]">
            {previewMeta.description}
          </p>
        </div>

        {/* On phones the prev/next controls join the dots in one row under the
            copy instead of floating over it. Same buttons, same order, just
            somewhere they cannot cover the heading. */}
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предыдущее"
            className="grad-border flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-ink/50 text-2xl leading-none text-glow backdrop-blur-md sm:hidden"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {serviceOrder.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => goTo(key)}
                aria-label={serviceMeta[key].label}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  key === previewKey ? "bg-glow" : "bg-paper/25 hover:bg-paper/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следующее"
            className="grad-border flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-ink/50 text-2xl leading-none text-glow backdrop-blur-md sm:hidden"
          >
            ›
          </button>
        </div>

        <Link
          href={`/${previewMeta.slug}`}
          className="grad-border mt-6 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium text-paper transition hover:border-glow hover:bg-glow/10"
        >
          Подробнее об услуге →
        </Link>
      </Container>
    </section>
  );
}
