import Hero from "@/components/home/Hero";
import ServicePicker from "@/components/home/ServicePicker";
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
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicePicker />
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
      <Footer />
    </>
  );
}
