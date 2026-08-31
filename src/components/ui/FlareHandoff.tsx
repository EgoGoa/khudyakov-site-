import FlareBackground from "@/components/ui/FlareBackground";

// A short bridging band between a page's last content block and the footer.
//
// /sites and /ai used to end on a standalone SeoText section, and that
// section quietly did double duty: besides carrying the copy, it mounted
// `FlareBackground fadeTop`, which opened the footer's flare texture from
// solid black so the footer's own flare-lit CTA band didn't start at full
// strength against a flat black section above it (see FlareBackground's own
// note on why the two gradients are pinned to the same 0.4 value at the
// seam). Once that copy moved into the closing chapter of the deck, deleting
// the section outright would have handed the pinned deck's flat black
// straight into the footer's texture — the exact hard seam that setup was
// built to remove. This keeps the bridge and drops everything else.
export default function FlareHandoff() {
  return (
    <div className="relative h-24 overflow-hidden bg-ink sm:h-32" aria-hidden="true">
      <FlareBackground fadeTop />
    </div>
  );
}
