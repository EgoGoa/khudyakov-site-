import Container from "@/components/ui/Container";
import SeoAccordion, { type SeoSection } from "@/components/ui/SeoAccordion";

// The service's written, search-facing long read — placed after the deck
// rather than inside its closing chapter.
//
// It used to live inside that chapter, and it is the one thing there that
// nobody reads at a glance: several collapsed rows of prose whose real
// audience is a crawler. Carrying it inside a pinned chapter cost about
// 165px of a screen that is already holding the pricing cards and the
// closing call to action, which is what pushed that chapter past the fold on
// every laptop shorter than about 900px — the CTA itself was the part being
// cut off, on /ai, /sites and /smm alike.
//
// Below the deck it costs the chapters nothing, keeps every word in the DOM
// exactly as before, and matches /content, whose closing chapter never
// carried one. The deck's runway ends at its last chapter, so this reads as
// the long text that follows the film rather than as part of it.
export default function SeoLongRead({
  eyebrow,
  sections,
}: {
  eyebrow: string;
  sections: SeoSection[];
}) {
  if (!sections.length) return null;

  return (
    <section className="relative z-10 pb-16 pt-12 sm:pb-20">
      <Container>
        <SeoAccordion eyebrow={eyebrow} sections={sections} />
      </Container>
    </section>
  );
}
