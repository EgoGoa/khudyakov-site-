import type { ReactNode } from "react";
import Hero from "@/components/home/Hero";
import ServicePicker from "@/components/home/ServicePicker";

// Shared between /content, /ai, /sites, /smm (a Next.js route group — the
// parens don't add a URL segment). Hero and ServicePicker stay mounted
// across navigation between these routes so the showreel and the picker's
// background image never flash/reload — only the page-specific blocks
// below swap out.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Hero />
      <ServicePicker />
      {children}
    </>
  );
}
