import type { Metadata } from "next";
import Works from "@/components/home/Works";
import DirectionBackdrop from "@/components/home/direction/DirectionBackdrop";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Все работы — HUD.SERVICE",
  description: "Полный каталог проектов: реклама, шоурилы, 3D и моушн, документальные и обучающие форматы.",
};

// The full catalogue with both filter axes, moved off the service page so
// that page's Works chapter can stay a six-item showcase (see WorksShowcase).
export default function WorksPage() {
  return (
    <ServiceProvider forcedValue="content">
      {/* Direction pages sit on a fixed bg-ink wash (DirectionBackdrop) that
          replaces the global BackgroundFX portrait everywhere but the hero —
          without it, that portrait was the only thing behind this page, and
          Works's own BlockMedia gradient just tinted it instead of reading
          as a deliberate backdrop. Same firменный gradient the nav/CTAs use. */}
      <DirectionBackdrop from="#ff4fd8" to="#00d2ff" />
      <div className="pt-24 sm:pt-28">
        <Works />
      </div>
    </ServiceProvider>
  );
}
