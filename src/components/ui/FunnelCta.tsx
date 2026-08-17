import Link from "next/link";

// One way forward per chapter, with the sentence that earns the click.
//
// Earlier every chapter offered two or three buttons, which is a choice the
// visitor has to make before they can act — and the chapters that offered
// "brief" and "calculator" side by side were really asking "do you already
// know what you want?", a question the page is supposed to answer for them.
// So each chapter now carries exactly one action, picked to follow from what
// that chapter just showed, above it a line that names the concrete thing the
// agency does differently rather than a generic invitation.

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

export default function FunnelCta({
  item,
  pitch,
  align = "left",
  layout = "panel",
  className = "",
}: {
  item: FunnelKey;
  /** The sentence that justifies pressing this particular button here. */
  pitch: string;
  align?: "left" | "right";
  /** "row" puts the pitch and the button side by side — same panel, roughly
   *  half the height, for chapters that cannot spare the vertical space. */
  layout?: "panel" | "row";
  className?: string;
}) {
  const funnel = FUNNELS[item];
  const right = align === "right";
  const row = layout === "row";

  return (
    <div
      className={`liquid-glass relative overflow-hidden rounded-3xl px-6 py-5 sm:px-7 sm:py-6 ${
        right ? "lg:text-right" : ""
      } ${className}`}
    >
      {/* The same soft light source the old closing block used: a wide radial
          wash from the top edge, which lifts the panel off the footage without
          another visible border. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: right
            ? "radial-gradient(520px circle at 80% 0%, rgba(0,210,255,0.2), transparent 70%)"
            : "radial-gradient(520px circle at 20% 0%, rgba(0,210,255,0.2), transparent 70%)",
        }}
      />

      <div
        className={`relative ${
          row ? "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between" : ""
        }`}
      >
        <p
          className={`text-base font-light leading-relaxed text-paper sm:text-lg ${
            row ? "max-w-xl" : "max-w-md"
          } ${right && !row ? "lg:ml-auto" : ""}`}
        >
          {pitch}
        </p>

        <div className={`flex ${row ? "shrink-0" : "mt-5"} ${right && !row ? "lg:justify-end" : ""}`}>
          {funnel.external ? (
            <a
              href={funnel.href}
              target="_blank"
              rel="noopener noreferrer"
              className={BUTTON_CLASS}
            >
              {funnel.glyph}
              {funnel.label}
            </a>
          ) : (
            <Link href={funnel.href} className={BUTTON_CLASS}>
              {funnel.glyph}
              {funnel.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Deliberately larger than the site's default pill: this is the one action the
// chapter is asking for, and at the default size it read as a footnote under
// the offer rather than as its conclusion.
const BUTTON_CLASS =
  "btn-neon btn-3d inline-flex items-center gap-2.5 !px-8 !py-4 !text-[13px] !tracking-[0.14em]";
