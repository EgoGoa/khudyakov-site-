"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";

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
function NeonChevron({ flip = false }: { flip?: boolean }) {
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
      className="h-16 w-16 sm:h-20 sm:w-20"
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
  const currentKey: ServiceKey =
    serviceOrder.find((key) => `/${serviceMeta[key].slug}` === pathname) ?? "content";

  // Arrows/dots only preview a service here — they don't navigate. The
  // visitor commits to actually visiting that service's page (and its own
  // portfolio/pricing/etc below) via the "Подробнее" button.
  const [previewKey, setPreviewKey] = useState<ServiceKey>(currentKey);
  const index = serviceOrder.indexOf(previewKey);
  const count = serviceOrder.length;
  const previewMeta = serviceMeta[previewKey];

  const go = (delta: number) => setPreviewKey(serviceOrder[(index + delta + count) % count]);

  return (
    <section
      id="service-picker"
      className="relative flex min-h-[70svh] items-center overflow-hidden"
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
        <h3 className="font-sans text-[clamp(1.8rem,4.5vw,2.8rem)] font-light uppercase tracking-[0.02em] text-paper">
          {previewMeta.label}
        </h3>

        <p className="mt-3.5 max-w-[440px] text-sm leading-relaxed text-paper/75">
          {previewMeta.description}
        </p>

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
                onClick={() => setPreviewKey(key)}
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
