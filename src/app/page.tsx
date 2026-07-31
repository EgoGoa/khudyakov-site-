import Hero from "@/components/home/Hero";
import Reel from "@/components/home/Reel";
import Stats from "@/components/home/Stats";
import Works from "@/components/home/Works";
import Why from "@/components/home/Why";
import Services from "@/components/home/Services";
import AiConsult from "@/components/home/AiConsult";
import Process from "@/components/home/Process";
import Pricing from "@/components/home/Pricing";
import Contact from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reel />
      <Stats />
      <Works />
      <Why />
      <Services />
      <AiConsult />
      <Process />
      <Pricing />
      <Contact />
    </>
  );
}
