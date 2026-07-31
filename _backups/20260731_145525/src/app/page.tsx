import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import WhyUs from "@/components/home/WhyUs";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import AiConsult from "@/components/home/AiConsult";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <WhyUs />
      <Services />
      <Testimonials />
      <Pricing />
      <AiConsult />
      <CtaBanner />
    </>
  );
}
