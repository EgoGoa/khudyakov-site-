"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";

// A link-out card, not a full chapter — /smm/cases and /smm/pricing get
// their own pages (see content/site-copy.md decision), so these don't carry
// a chapter number the way real chapters do (numbering encodes sequence;
// these aren't part of it).

export default function SmmTeaserLink({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <section className="py-8 sm:py-10">
      <Container>
        <Reveal>
          <Link
            href={href}
            className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-paper/15 bg-ink/45 p-6 backdrop-blur-md transition hover:border-glow/40 sm:flex-row sm:items-center sm:p-7"
          >
            <p className="max-w-2xl text-sm leading-relaxed text-paper/70 sm:text-base">{text}</p>
            <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-glow transition group-hover:gap-3">
              {cta}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
