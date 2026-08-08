import Hero from "@/components/home/Hero";
import ProjectMockup from "@/components/home/ProjectMockup";
import Reel from "@/components/home/Reel";
import Stats from "@/components/home/Stats";
import Works from "@/components/home/Works";
import Why from "@/components/home/Why";
import Testimonials from "@/components/home/Testimonials";
import LogoCloud from "@/components/home/LogoCloud";
import Services from "@/components/home/Services";
import AiConsult from "@/components/home/AiConsult";
import Process from "@/components/home/Process";
import Pricing from "@/components/home/Pricing";
import FinalCTA from "@/components/home/FinalCTA";
import Contact from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProjectMockup />
      <Reel />
      <Stats />
      <Works />
      <Why />
      <Testimonials />
      <LogoCloud />
      <Services />
      <AiConsult />
      <Process />
      <Pricing />
      <FinalCTA />
      <Contact />
    </>
  );
}
