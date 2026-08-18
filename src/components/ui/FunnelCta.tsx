import Link from "next/link";
import type { ReactNode } from "react";

// One way forward per chapter, with the sentence that earns the click.
//
// Earlier every chapter offered two or three buttons, which is a choice the
// visitor has to make before they can act — and the chapters that offered
// "brief" and "calculator" side by side were really asking "do you already
// know what you want?", a question the page is supposed to answer for them.
// So each chapter now carries exactly one action, picked to follow from what
// that chapter just showed.
//
// Built as an offer card, not a sentence-plus-button panel: a small tag
// names the situation, a promise line makes the concrete offer (the
// number/deadline picked out in orange), the original sentence is the
// supporting line underneath — and the button sits beside all of that,
// vertically centred on the card rather than stacked under the text, with
// its own warm glow bleeding out of that corner. Six chapters each carry one
// of these, so `size` and `align` are what stop them reading as six copies
// of the same box.

const TELEGRAM_URL = "https://t.me/+79925111812";

export type FunnelKey = "brief" | "calculator" | "consult";

// Same line language as ChapterIcon: 24-unit grid, 1.75 stroke, round joins,
// no fills. Decorative — each sits beside its own visible label.
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

const FUNNELS: Record<
  FunnelKey,
  { label: string; href: string; external?: boolean; glyph: React.ReactNode }
> = {
  brief: {
    label: "Заполнить бриф",
    href: "/brief",
    glyph: (
      <Glyph>
        <path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1-1.5z" />
        <path d="M14 3.5V9h5M8.5 13.5h7M8.5 17h4.5" />
      </Glyph>
    ),
  },
  calculator: {
    label: "Рассчитать бюджет",
    href: "/calculator",
    glyph: (
      <Glyph>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h3.5" />
      </Glyph>
    ),
  },
  consult: {
    label: "Написать в Telegram",
    href: TELEGRAM_URL,
    external: true,
    glyph: (
      <Glyph>
        <path d="M21 4L3.5 10.8l5.2 1.9L19 6.5l-8 7.4v5l3-3.6 4 3.2L21 4z" />
      </Glyph>
    ),
  },
};

export type FunnelSize = "sm" | "md" | "lg";

const HEADLINE_SIZE: Record<FunnelSize, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
};

const CARD_PADDING: Record<FunnelSize, string> = {
  sm: "px-5 py-5 sm:px-7 sm:py-6",
  md: "px-6 py-6 sm:px-8 sm:py-7",
  lg: "px-7 py-7 sm:px-10 sm:py-9",
};

// The card is a compact offer, not a banner spanning whatever column it's
// dropped into — capped well short of the chapter's own width so it keeps
// looking like a deliberate object on the page rather than a stretched bar.
const CARD_WIDTH: Record<FunnelSize, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

function EyebrowPill({ children, dense = false }: { children: ReactNode; dense?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 font-mono uppercase tracking-[0.18em] text-orange ${
        dense ? "px-3 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
      {children}
    </span>
  );
}

function CtaButton({
  funnel,
  size,
  flat = false,
}: {
  funnel: (typeof FUNNELS)[FunnelKey];
  size: FunnelSize;
  /** Drops the .btn-3d "physical key" treatment for a plain flat pill —
   *  the solid-fill .btn-neon.btn-warm look on its own. */
  flat?: boolean;
}) {
  const content = (
    <>
      {funnel.glyph}
      {funnel.label}
      <ArrowGlyph />
    </>
  );
  return funnel.external ? (
    <a href={funnel.href} target="_blank" rel="noopener noreferrer" className={buttonClass(size, flat)}>
      {content}
    </a>
  ) : (
    <Link href={funnel.href} className={buttonClass(size, flat)}>
      {content}
    </Link>
  );
}

export default function FunnelCta({
  item,
  eyebrow,
  headline,
  accent,
  pitch,
  align = "left",
  size = "md",
  spacious = false,
  flatButton = false,
  className = "",
}: {
  item: FunnelKey;
  /** Short tag naming the situation this offer answers — "ЕСТЬ ТОЛЬКО ИДЕЯ?" */
  eyebrow: string;
  /** The promise, plain sentence case. The number/deadline half goes in `accent`. */
  headline: ReactNode;
  /** The part of the headline picked out in orange, rendered on its own line
   *  ("md"/"lg") or inline ("sm"). */
  accent?: ReactNode;
  /** The supporting sentence underneath, one register quieter than the
   *  headline. Dropped entirely at "sm" — that size is for chapters with no
   *  vertical room to spare, a single line plus a button. */
  pitch: string;
  /** Which corner the button — and its glow — sits in. */
  align?: "left" | "right";
  /** Mixing sizes across chapters is deliberate — six identical boxes read
   *  as filler, not six different offers. "sm" is a single compact row for
   *  a chapter that's already full; "md"/"lg" are the two-column offer card. */
  size?: FunnelSize;
  /** "sm" only: trades the single tight row for a taller, looser stack —
   *  eyebrow+copy on their own line, the button given its own room below
   *  rather than squeezed to the opposite edge. */
  spacious?: boolean;
  /** Drops the button's .btn-3d "physical key" treatment for a flat pill. */
  flatButton?: boolean;
  className?: string;
}) {
  const funnel = FUNNELS[item];
  const right = align === "right";

  if (size === "sm") {
    return (
      <div
        className={`relative overflow-hidden bg-ink ${
          spacious ? "rounded-3xl px-6 py-7 sm:px-8 sm:py-8" : "rounded-2xl px-5 py-4 sm:px-6"
        } ${CARD_WIDTH.sm} ${right ? "ml-auto" : ""} ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: right
              ? "radial-gradient(75% 140% at 0% 50%, rgba(255,106,61,0.18), transparent 62%)"
              : "radial-gradient(75% 140% at 100% 50%, rgba(255,106,61,0.18), transparent 62%)",
          }}
        />
        <div
          className={`pointer-events-none absolute inset-0 ring-1 ring-inset ring-paper/10 ${
            spacious ? "rounded-3xl" : "rounded-2xl"
          }`}
        />

        <div
          className={
            spacious
              ? `relative flex flex-col items-start gap-5 ${right ? "sm:items-end sm:text-right" : ""}`
              : `relative flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap sm:justify-between ${
                  right ? "sm:flex-row-reverse" : ""
                }`
          }
        >
          <div
            className={
              spacious
                ? `flex min-w-0 flex-col gap-y-2 ${right ? "sm:items-end" : ""}`
                : "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2"
            }
          >
            <EyebrowPill dense>{eyebrow}</EyebrowPill>
            <p className="font-sans text-base leading-snug text-paper sm:text-lg">
              {headline} {accent && <span className="font-semibold text-orange">{accent}</span>}
            </p>
          </div>
          <div className="shrink-0">
            <CtaButton funnel={funnel} size={size} flat={flatButton} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-ink ${CARD_PADDING[size]} ${CARD_WIDTH[size]} ${
        right ? "ml-auto" : ""
      } ${className}`}
    >
      {/* Warm light source in the button's corner, fading to plain dark by
          the far edge — the card is lit from where the action is, not from
          a border. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: right
            ? "radial-gradient(85% 130% at 0% 50%, rgba(255,106,61,0.22), transparent 62%)"
            : "radial-gradient(85% 130% at 100% 50%, rgba(255,106,61,0.22), transparent 62%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-paper/10" />

      <div
        className={`relative flex flex-col items-start gap-6 sm:items-center sm:gap-8 ${
          right ? "sm:flex-row-reverse" : "sm:flex-row"
        }`}
      >
        <div className="min-w-0 flex-1">
          <EyebrowPill>{eyebrow}</EyebrowPill>

          <p className={`mt-3 font-sans leading-[1.15] text-paper ${HEADLINE_SIZE[size]}`}>
            {headline}
            {accent && <span className="block font-semibold text-orange">{accent}</span>}
          </p>

          <p className="mt-3 max-w-md font-light leading-relaxed text-paper/60 text-sm sm:text-base">
            {pitch}
          </p>
        </div>

        <div className="shrink-0">
          <CtaButton funnel={funnel} size={size} />
        </div>
      </div>
    </div>
  );
}

// The one warm, solid-fill button in the chapter — everything else on the
// page is the quieter default .btn-neon. Sized down a step for "sm" so it
// doesn't outweigh a compact card.
function buttonClass(size: FunnelSize, flat = false) {
  const scale = size === "sm" ? "!px-6 !py-3 !text-[12px]" : "!px-8 !py-4 !text-[13px]";
  const dimension = flat ? "" : "btn-3d";
  return `btn-neon btn-warm ${dimension} inline-flex items-center gap-2.5 whitespace-nowrap ${scale} !tracking-[0.14em]`;
}
