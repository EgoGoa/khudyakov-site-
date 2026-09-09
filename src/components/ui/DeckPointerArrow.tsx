import Link from "next/link";

// Pulsing pointer above a service carousel (AiDeck/SmmDeck/SitesDeck): a
// label word ("Подробнее") breathing above a down-arrow, both in sync,
// reading together as one button aimed at the front card. The front card
// sits dead-centre of the deck on all three (FAN[0].x is always 0 in every
// one of them), so this is a single static element centred above the deck —
// it never has to track which card is active, only the deck itself moves
// under it.
//
// A shared component rather than copy-pasted markup in three files: the
// label+arrow pairing and its animation are identical everywhere, only the
// colour and destination change. That's a real difference from PILL/ROUND
// (deliberately duplicated per page so each carousel's own *button* language
// can diverge later without touching its siblings — see the comments on
// those); nothing about a pointer that names and aims at a centred card is
// meant to diverge the same way.
//
// `href` is optional: /sites has no [format] pages yet (see SitesDeck), so
// its pointer renders as a plain, non-interactive label+arrow rather than a
// link to nowhere — still tells the visitor which card is selected, just
// doesn't promise a page that isn't there.
export default function DeckPointerArrow({
  href,
  label = "Подробнее",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  // No word without a destination: a page that doesn't exist yet (see
  // SitesDeck) gets the bare arrow, not a "Подробнее" that goes nowhere.
  const content = (
    <>
      {href && (
        <span className="deck-label-pulse font-display text-[10px] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      )}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="deck-arrow-pulse"
        aria-hidden="true"
      >
        <path d="M12 4v14M6 13l6 6 6-6" />
      </svg>
    </>
  );

  const wrapperClass = `mx-auto mb-2 flex w-fit flex-col items-center gap-1 ${className}`;

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none ${wrapperClass}`}>
      {content}
    </div>
  );
}
