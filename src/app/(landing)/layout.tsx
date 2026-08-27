"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import FluidSmoke from "@/components/layout/FluidSmoke";
import Hero from "@/components/home/Hero";
import ServicePicker from "@/components/home/ServicePicker";
import WelcomeOverlay from "@/components/home/WelcomeOverlay";
import { WelcomeGateProvider } from "@/lib/welcome-gate";

// Shared between /content, /ai, /sites, /smm (a Next.js route group — the
// parens don't add a URL segment). Hero and ServicePicker stay mounted
// across navigation between these four routes so the showreel and the
// picker's background image never flash/reload — only the page-specific
// blocks below swap out. WelcomeOverlay lives here too, for the same reason:
// it only remounts (and re-shows) on a fresh landing, not on nav between
// /content, /ai, /sites, /smm. WelcomeGateProvider lets the page's own
// ServiceMenuOverlay know not to render (and animate) until this closes.
//
// /content/[direction] (the lightweight direction pages linked from the
// "Что мы делаем" card grid) live inside this same route group — they have
// to, since /content/presentation nests under the /content segment this
// group already owns — but they deliberately don't get Hero/ServicePicker:
// those pages are meant to be quick, single-topic reads, not another full
// landing. That does mean navigating /content → /content/presentation →
// /content unmounts and remounts the showreel once, the exact flash this
// layout was built to avoid between the four main routes — an accepted
// trade for keeping the direction pages light.
const TOP_LEVEL_ROUTES = new Set(["/content", "/ai", "/sites", "/smm"]);

export default function LandingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showChrome = TOP_LEVEL_ROUTES.has(pathname);

  // Mirrors the checks FluidSmoke itself runs before touching WebGL (see
  // that component) — done here too, one level up, so a touch device or a
  // `prefers-reduced-motion` visitor never even fetches its chunk. Checked
  // once on mount rather than derived at render time: matchMedia only
  // exists in the browser, so this has to live in an effect regardless.
  const [enableSmoke, setEnableSmoke] = useState(false);
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnableSmoke(finePointer && motionOk);
  }, []);

  return (
    <WelcomeGateProvider>
      <WelcomeOverlay />
      {/* Pointer-driven fluid smoke, screen-blended over the whole page.
          Scoped to the four landings (same gate as Hero) so the lightweight
          /content/[direction] reads don't carry a GPU simulation. Mounted
          before the chrome so it survives nav between the four routes
          without losing its dye field. */}
      {showChrome && enableSmoke && <FluidSmoke />}
      {showChrome && <Hero />}
      {showChrome && <ServicePicker />}
      {children}
    </WelcomeGateProvider>
  );
}
