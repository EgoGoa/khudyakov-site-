"use client";

import { useState } from "react";
import Link from "next/link";
import LeadModal from "@/components/home/LeadModal";

// The one loud, sale-poster-styled card on the page — every other surface
// on /content is quiet glass-on-film, so this is meant to read as a
// deliberate exception (Egor's reference: a bright blue banner with a
// countdown chip and a big bold price).
//
// Two separate actions now, not one card-wide click — Egor's ask: "Подробнее"
// is a real link to the offer's own direction page, while "Заказать" is the
// only thing that opens the lead popup. A single onClick on the whole card
// couldn't tell those apart, so the card itself is a plain div now and each
// pill is its own element.
//
// Made generic (props instead of hardcoded AI-video copy) once a second
// instance was needed on /content's chapter 05 (Process) — same card
// mechanic, a different service, a different photo and a different accent
// so the two don't read as the same banner twice. `palette` picks which:
// "warm" is the original magenta→orange tied to /content's own `.kw`
// keywords; "cyan" is the second offer's own cyan→indigo, kept as its own
// named variant (not a raw colour prop) so any future third offer has an
// obvious third option to add rather than inline styles creeping in here.
export type PromoCardPalette = "warm" | "cyan";

export default function PromoCard({
  glow = false,
  palette = "warm",
  image,
  imageAlign = "center 35%",
  badge,
  title,
  subtitle,
  price,
  oldPrice,
  href,
  leadPrefill,
}: {
  glow?: boolean;
  palette?: PromoCardPalette;
  image: string;
  /** CSS `object-position` for the background photo — different source
   *  photos crop differently before the tint/gradient settle over them. */
  imageAlign?: string;
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  href: string;
  leadPrefill: { format: string; wishes: string };
}) {
  const [open, setOpen] = useState(false);
  const cyan = palette === "cyan";

  return (
    <>
      {/* `glow`: the slow breathing box-shadow BlockAssistant's search bar
          has (assistant-bar-glow in globals.css), in this card's own accent
          pair — Trust.tsx's ask once this card sat under the five reasons,
          where it reads as the page's second point of attention next to
          that bar. Off by default so a page that reuses this card without
          that context isn't forced into it. */}
      <div
        className={`promo-card group relative block h-full w-full overflow-hidden rounded-2xl p-3 text-left ${
          cyan ? "promo-card-cyan" : ""
        } ${glow ? (cyan ? "promo-card-pulse-glow-cyan" : "promo-card-pulse-glow") : ""}`}
      >
        {/* The card's own breathing border — the offer's accent pair
            running around the edge instead of a static ring, so the card
            reads as "on brand" and alive rather than just a blue sale
            banner with a logo-colour accent tacked on top. */}
        <span className="promo-card-border pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ objectPosition: imageAlign }}
          className="promo-card-image pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <span className="promo-card-tint pointer-events-none absolute inset-0" aria-hidden="true" />
        <span className="promo-card-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        {/* h-full + justify-between: the card stretches to match its
            neighbour (see the grid/flex row it's dropped into), so the
            price and buttons anchor to the bottom instead of floating
            wherever the text above happens to end. */}
        <span className="relative z-10 flex h-full flex-col justify-between">
          <span>
            <span className="promo-card-badge inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-display text-[8px] uppercase tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
              {badge}
            </span>
            {/* "warm" reuses the page's own `.kw` magenta→orange (Trust.tsx
                sits inside .content-warm-headings, so `.kw` here already
                picks up /content's own ramp) — "cyan" gets its own gradient
                class since `.kw` is fixed to the page's warm ramp. */}
            <span
              className={`promo-card-title mt-1 block font-display text-base uppercase leading-[0.95] tracking-tight ${
                cyan ? "promo-card-title-cyan" : "kw"
              }`}
            >
              {title}
            </span>
            <span className="mt-0.5 block text-[10px] leading-snug text-white/80">{subtitle}</span>
          </span>
          <span>
            <span className="flex items-baseline gap-2">
              <span className="font-display text-xl leading-none text-white">{price}</span>
              <span className="font-display text-sm leading-none text-white/50 line-through">{oldPrice}</span>
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={href}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 px-3.5 py-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
              >
                Подробнее
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="promo-card-btn shimmer-btn inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-[#0b1a3d] transition hover:brightness-95"
              >
                Заказать
                <span aria-hidden="true">→</span>
              </button>
            </span>
          </span>
        </span>
      </div>

      <LeadModal open={open} onClose={() => setOpen(false)} prefill={leadPrefill} />
    </>
  );
}
