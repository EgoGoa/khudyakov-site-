import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="border-b border-paper/10 py-16 sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow index="03" label="Наше предложение" />
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
            Что мы делаем
          </h2>
        </Reveal>

        <div className="mt-10 border-t border-paper/10">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={(index % 5) * 0.05}>
              <div className="group grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-paper/10 py-5 transition-colors hover:bg-paper/[0.02] sm:grid-cols-[2.5rem_15rem_1fr] sm:items-baseline sm:gap-x-8 sm:gap-y-0">
                <span className="font-mono text-sm text-paper/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl uppercase tracking-tight text-paper transition-colors group-hover:text-glow sm:text-2xl">
                  {service.title}
                </h3>
                <p className="col-span-2 text-sm leading-relaxed text-paper/60 sm:col-span-1">
                  {service.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
