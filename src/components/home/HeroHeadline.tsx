"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { serviceOrder, servicesByCategory, type ServiceKey } from "@/lib/service-content";

// The hero H1 cycles through the site's real service names — same feed as
// the header's own service marquee (servicesByCategory, round-robin across
// the four verticals).
//
// No clip-path anywhere in this component, on purpose. Every earlier pass
// (clip-path on the same element as background-clip:text, then split across
// two nested elements, then with the filter moved around) kept
// reintroducing a dark box behind the letters — Chromium's compositor
// occasionally paints the gradient span's raw rectangle instead of the
// text-clipped glyphs whenever a `clip-path` is animating anywhere in that
// element's ancestor chain, and it wasn't reliably reproducible from static
// reasoning alone (it came and went between otherwise-identical reloads).
// A plain opacity/y fade has no clip-path, no geometric masking of any
// kind, so there is nothing for that bug to attach to — reliability over
// the wipe effect.
const GRADIENT: Record<ServiceKey, { from: string; to: string }> = {
  content: { from: "#ff4fd8", to: "#ff6a3d" },
  ai: { from: "#c8f169", to: "#10b981" },
  sites: { from: "#ff4fd8", to: "#00d2ff" },
  smm: { from: "#a855f7", to: "#38bdf8" },
};

// One fixed white caption per page, shown under whichever service from
// that page is on screen — Egor's example: /content's services all sit
// under "креатив на любой бюджет". A per-page slogan, not per-service
// copy (there are 34 of those).
const SLOGAN: Record<ServiceKey, string> = {
  content: "креатив на любой бюджет",
  ai: "технологии, которые окупаются",
  sites: "сайты, которые продают",
  smm: "соцсети, которые живут",
};

function buildFeed(): { key: ServiceKey; title: string }[] {
  const maxLen = Math.max(...serviceOrder.map((key) => servicesByCategory[key].length));
  const feed: { key: ServiceKey; title: string }[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const key of serviceOrder) {
      const list = servicesByCategory[key];
      feed.push({ key, title: list[i % list.length].title });
    }
  }
  return feed;
}

const FEED = buildFeed();
const INTERVAL_MS = 5200;

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % FEED.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const entry = FEED[index];
  const g = GRADIENT[entry.key];
  const titleStyle = {
    backgroundImage: `linear-gradient(90deg, ${g.from} 0%, ${g.to} 100%)`,
    textShadow: "none",
    letterSpacing: "-0.025em",
    fontWeight: 400,
  };

  return (
    <span style={{ display: "block" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block" }}
        >
          <span className="hero-neon-word block" style={titleStyle}>
            {entry.title}
          </span>
          {/* Same family/weight/case, plain white, half size, own dash
              prefix — matches the static reference Egor approved. Plain
              colour (not background-clip:text), so the clip-path wipe here
              never had the gradient-title's box-artifact bug — kept as the
              wipe, only the gradient title moved to a plain fade. Starts
              once the title's own fade has finished. */}
          <motion.span
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            style={{ display: "table" }}
          >
            <span
              className="block text-paper"
              style={{ fontSize: "0.5em", fontWeight: 400, letterSpacing: "-0.025em", marginTop: "0.3em" }}
            >
              - {SLOGAN[entry.key]}
            </span>
          </motion.span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
