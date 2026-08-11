import type { Metadata } from "next";
import Stats from "@/components/home/Stats";
import Works from "@/components/home/Works";
import FinalCTA from "@/components/home/FinalCTA";
import Why from "@/components/home/Why";
import Testimonials from "@/components/home/Testimonials";
import LogoCloud from "@/components/home/LogoCloud";
import Services from "@/components/home/Services";
import AiConsult from "@/components/home/AiConsult";
import Process from "@/components/home/Process";
import Pricing from "@/components/home/Pricing";
import Contact from "@/components/home/Contact";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "AI-решения — HDKV.AGENCY",
  description: "Внедряем ИИ-инструменты в продакшн и коммуникацию с клиентами.",
};

export default function AiServicePage() {
  return (
    <ServiceProvider forcedValue="ai">
      <ServiceMenuOverlay service="ai" />
      <Stats />
      <Works />
      <FinalCTA />
      <Why />
      <Testimonials />
      <LogoCloud />
      <Services />
      <AiConsult />
      <Process />
      <Pricing />
      <Contact />
    </ServiceProvider>
  );
}
