"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import type { InteractiveTier } from "@/components/home/ai/aiPricingTiers";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function formatPrice(n: number) {
  return Math.round(n / 10) * 10 >= 1000
    ? `${Math.round(n).toLocaleString("ru-RU")}`
    : `${Math.round(n)}`;
}

/** One tier card whose optional items can be checked/unchecked, moving the
 *  displayed price between the tier's own already-published floor and
 *  ceiling — see aiPricingTiers.ts for why it interpolates rather than
 *  summing per-item prices nobody has confirmed. Required items are always
 *  counted (rendered checked, not clickable) since they're the part of the
 *  tier that defines its floor in the first place. */
export default function InteractiveTierCard({
  tier,
  index,
  spacious,
}: {
  tier: InteractiveTier;
  index: number;
  spacious: boolean;
}) {
  const optionalItems = useMemo(() => tier.items.filter((item) => !item.required), [tier.items]);
  // Starts at the floor (only required items counted) — a visitor adds scope
  // and watches the price grow from there, rather than starting maxed out.
  const [checked, setChecked] = useState<boolean[]>(() => optionalItems.map(() => false));

  const checkedCount = checked.filter(Boolean).length;
  const hasCeiling = tier.max !== undefined;
  const price =
    hasCeiling && optionalItems.length > 0
      ? tier.min + ((tier.max! - tier.min) * checkedCount) / optionalItems.length
      : tier.min;

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, x: index === 0 ? -40 : index === 2 ? 40 : 0, scale: index === 1 ? 0.94 : 1 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: BEAT.content + index * STAGGER.normal, ease: EASE }}
      className={`c3-card !min-h-0 !rounded-3xl c3-card-dense ${spacious ? "!p-5 c3-card-compact" : "!p-6"} ${
        tier.pro ? "c3-card-pro" : ""
      }`}
    >
      <span className="c3-tier-small relative">{tier.tagline}</span>
      <div className="c3-tier-large relative !text-lg">{tier.name}</div>

      {/* The number itself is the live part — it's what changes as items get
          checked, so it's kept visually apart from the static floor/ceiling
          note below it rather than folded into one line the way the static
          card's plain price string was. */}
      <div className="relative mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl text-paper">
          {tier.currency}
          {formatPrice(price)}
        </span>
        <span className="text-xs text-paper/45">{tier.suffix}</span>
      </div>
      <div className="relative mt-0.5 text-[11px] text-paper/40">
        {hasCeiling
          ? `${tier.currency}${formatPrice(tier.min)}–${formatPrice(tier.max!)}${tier.suffix} по составу ниже`
          : "точная сумма — по объёму, обсуждаем на аудите"}
      </div>

      <div className="c3-team relative mb-3">{tier.team}</div>

      {/* Required items read exactly like the checked optional ones —
          same check glyph, same line — so the list doesn't visually split
          into two different kinds of row; only the disabled cursor and the
          lack of a hover state give away that these can't be unchecked. */}
      <ul className="c3-list relative">
        {tier.items
          .filter((item) => item.required)
          .map((item) => (
            <li key={item.label} className="cursor-default opacity-90">
              <span className="c3-check text-paper">
                <CheckIcon />
              </span>
              {item.label}
            </li>
          ))}
        {optionalItems.map((item, i) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={checked[i]}
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                className="c3-check shrink-0 transition-colors"
                style={{
                  color: checked[i] ? undefined : "transparent",
                  background: checked[i]
                    ? undefined
                    : "rgba(220,221,239,0.06)",
                  outline: checked[i] ? undefined : "1px dashed rgba(220,221,239,0.25)",
                  outlineOffset: -1,
                }}
              >
                {checked[i] && <CheckIcon />}
              </span>
              <span className={checked[i] ? "text-paper/85" : "text-paper/40 line-through decoration-paper/25"}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex flex-col items-center gap-2 self-stretch">
        <a
          href="/brief"
          // Emerald, not the site-wide orange — /ai's own accent, matching
          // AI_PILL and the rest of the page's actions.
          className="w-full rounded-none bg-emerald-400 px-8 py-2 text-center font-display text-xs uppercase tracking-[0.08em] text-[#03120d] transition hover:bg-emerald-300"
        >
          Выбрать план
        </a>
      </div>
    </motion.div>
  );
}
