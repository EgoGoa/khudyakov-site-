"use client";

import { motion } from "framer-motion";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import type { InteractiveTier } from "@/components/home/ai/aiPricingTiers";

/** One /ai tier card. Static now — Egor's ask: this used to let a visitor
 *  check/uncheck optional items, with unchecked ones greyed out and struck
 *  through. That read as a checklist form and "missing", not "optional", so
 *  every item is shown the same way /content's plain tier cards show
 *  theirs — a full white line with the same pulsing dot every item on this
 *  site gets, nothing clickable, nothing crossed out. The item *count*
 *  itself (3 → 5 → 7 across the three tiers) is what still tells a visitor
 *  "Рост" carries more scope than "Старт", the one part of the old toggle
 *  design worth keeping. */
export default function InteractiveTierCard({
  tier,
  index,
  spacious,
}: {
  tier: InteractiveTier;
  index: number;
  spacious: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, x: index === 0 ? -40 : index === 2 ? 40 : 0, scale: index === 1 ? 0.94 : 1 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: BEAT.content + index * STAGGER.normal, ease: EASE }}
      className={`c3-card !min-h-0 !rounded-3xl c3-card-dense tier-glow-${index} ${
        spacious ? "!p-5 c3-card-compact" : "!p-6"
      } ${tier.pro ? "c3-card-pro" : ""}`}
    >
      <span className="c3-tier-small relative">{tier.tagline}</span>
      <div className="c3-tier-large relative !text-lg">{tier.name}</div>

      {/* Same tier-glow-price treatment /content's own cards use (see
          globals.css), recoloured per index into /ai's lime→emerald→teal
          family — one static line now instead of a live number plus a
          dimmed range note, matching how every other page's tier card
          prints its price. */}
      <div className="relative mt-1 font-semibold tier-glow-price">{tier.priceLabel}</div>

      <div className="c3-team relative mb-3">{tier.team}</div>

      <ul className="c3-list relative">
        {tier.items.map((item) => (
          <li key={item.label}>
            <span className="c3-check text-paper" />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex flex-col items-center gap-2 self-stretch">
        <a
          href="/brief/ai"
          className={`btn-neon btn-neon-breathe w-[70%] justify-center !py-1 !text-[8px] !font-bold tier-glow-btn-${index}`}
        >
          Выбрать план
        </a>
      </div>
    </motion.div>
  );
}
