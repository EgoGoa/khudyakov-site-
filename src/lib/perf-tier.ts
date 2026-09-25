// Three performance tiers for the whole site, read off <html>:
//   · low  — html[data-lite]  (weak device / 2G / Data Saver)
//   · mid  — html[data-mid]   (mid-range device / 3G)
//   · high — neither          (everything on)
// The first guess is made before first paint by LITE_DETECT_SNIPPET
// (lib/lite.ts); PerfGovernor can step it down later if the device turns out
// weaker than it claims (software GPU, frames actually dropping). Components
// that run their own loops (cursor smoke, the orb) read the tier here and
// follow it live via onTierChange.

export type Tier = "low" | "mid" | "high";

export function getTier(): Tier {
  const d = document.documentElement;
  if (d.hasAttribute("data-lite")) return "low";
  if (d.hasAttribute("data-mid")) return "mid";
  return "high";
}

type Conn = { saveData?: boolean; effectiveType?: string };

// A genuinely thin connection: 2G or Data Saver switched on. "3g" is left
// out on purpose — Chrome's estimate reports it on perfectly good desktop
// links (a VPN or a quiet tab is enough), so it only nudges the tier to mid
// (lib/lite.ts) instead of switching things off.
export function isSlowNet(): boolean {
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  if (!c) return false;
  return c.saveData === true || /^(slow-2g|2g)$/.test(c.effectiveType ?? "");
}

export function setTier(tier: Tier) {
  const d = document.documentElement;
  d.toggleAttribute("data-lite", tier === "low");
  d.toggleAttribute("data-mid", tier === "mid");
  d.setAttribute("data-tier", tier);
}

export function onTierChange(cb: (tier: Tier) => void): () => void {
  let last = getTier();
  const mo = new MutationObserver(() => {
    const now = getTier();
    if (now !== last) {
      last = now;
      cb(now);
    }
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lite", "data-mid"] });
  return () => mo.disconnect();
}
