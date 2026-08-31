"use client";

import { useState } from "react";

// The long-read "Подробнее о ..." accordion, as a set of thin glass rows that
// can live *inside* a cinematic chapter rather than as its own flat section
// below the deck. /sites and /ai each used to end on a standalone SeoText
// section: with the deck pinned above it, that section had no film behind it
// and landed as a flat black slab breaking the page's own look. Folded into
// the closing chapter it inherits the chapter's misted reveal for free.
//
// Rows are deliberately quiet — mono index, one line of title, a hairline
// rule — so they read as a footnote under the pricing cards rather than
// competing with them.

export type SeoSection = { title: string; body: string };

export default function SeoAccordion({
  eyebrow,
  sections,
}: {
  /** Small label above the rows, e.g. "Подробнее о сайтах на AI". */
  eyebrow: string;
  sections: SeoSection[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl bg-ink/45 px-4 py-2.5 backdrop-blur-md sm:px-5">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/45">
        {eyebrow}
      </span>

      <div className="mt-1.5">
        {sections.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={section.title} className="border-t border-paper/10 first:border-t-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-2 text-left"
              >
                <span className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[9px] text-glow/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-medium leading-snug text-paper sm:text-[13px]">
                    {section.title}
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-paper/20 text-[11px] leading-none text-paper/60 transition-transform duration-200 ${
                    isOpen ? "rotate-45 border-glow/50 text-glow" : ""
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              {/* Collapsed with a 0fr→1fr grid row rather than unmounting the
                  paragraph. These blocks exist to carry the service's written,
                  search-facing copy, but the previous version rendered a body
                  only while its row was open — so the text a crawler was meant
                  to read was never in the document at all unless a visitor
                  happened to click. Clipping it instead keeps every word in the
                  DOM (and animates the open/close, which unmounting couldn't).
                  aria-hidden while collapsed keeps the accordion honest for
                  screen readers; it does not affect indexing. */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                aria-hidden={!isOpen}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-3 pl-5 text-[11px] leading-relaxed text-paper/60 sm:text-xs">
                    {section.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
