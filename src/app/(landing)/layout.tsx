import type { ReactNode } from "react";
import Hero from "@/components/home/Hero";
import ServicePicker from "@/components/home/ServicePicker";
import WelcomeOverlay from "@/components/home/WelcomeOverlay";
import { WelcomeGateProvider } from "@/lib/welcome-gate";

// Shared between /content, /ai, /sites, /smm (a Next.js route group — the
// parens don't add a URL segment). Hero and ServicePicker stay mounted
// across navigation between these routes so the showreel and the picker's
// background image never flash/reload — only the page-specific blocks
// below swap out. WelcomeOverlay lives here too, for the same reason: it
// only remounts (and re-shows) on a fresh landing, not on nav between
// /content, /ai, /sites, /smm. WelcomeGateProvider lets the page's own
// ServiceMenuOverlay know not to render (and animate) until this closes.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <WelcomeGateProvider>
      <WelcomeOverlay />
      <Hero />
      <ServicePicker />
      {children}
    </WelcomeGateProvider>
  );
}
