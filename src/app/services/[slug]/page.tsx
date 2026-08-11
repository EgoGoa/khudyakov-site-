import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Works from "@/components/home/Works";
import Services from "@/components/home/Services";
import Why from "@/components/home/Why";
import Process from "@/components/home/Process";
import Pricing from "@/components/home/Pricing";
import FinalCTA from "@/components/home/FinalCTA";
import Contact from "@/components/home/Contact";
import { ServiceProvider } from "@/lib/service-context";
import { serviceMeta, serviceOrder, slugToKey } from "@/lib/service-content";

export function generateStaticParams() {
  return serviceOrder.map((key) => ({ slug: serviceMeta[key].slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = slugToKey(slug);
  if (!key) return {};
  const meta = serviceMeta[key];
  return {
    title: `${meta.label} — HDKV.AGENCY`,
    description: meta.description,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = slugToKey(slug);
  if (!key) notFound();
  const meta = serviceMeta[key];

  return (
    <ServiceProvider forcedValue={key}>
      <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 -z-10">
          <img src={meta.image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,11,16,0.65), rgba(11,11,16,0.55) 40%, rgba(11,11,16,0.9))",
            }}
          />
        </div>
        <Container className="py-14 text-center">
          <h1 className="font-sans text-4xl font-light uppercase tracking-[0.01em] text-paper sm:text-6xl">
            {meta.label}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-paper/70 sm:text-lg">
            {meta.description}
          </p>
        </Container>
      </section>

      <Works />
      <Why />
      <Services />
      <Process />
      <Pricing />
      <FinalCTA />
      <Contact />
    </ServiceProvider>
  );
}
