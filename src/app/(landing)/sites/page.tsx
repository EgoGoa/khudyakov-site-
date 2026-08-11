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
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Сайты — HDKV.AGENCY",
  description: "Разработка сайтов и лендингов под задачи бренда.",
};

export default function SitesServicePage() {
  return (
    <ServiceProvider forcedValue="sites">
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
