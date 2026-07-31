import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section className="border-t border-black/5 bg-white py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Наше предложение"
            title="Что мы делаем"
            description="Работаем с готовыми идеями клиента, дополняя их своей экспертизой, и с разработкой видеороликов с нуля — от концепции до финального монтажа."
          />
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={(index % 3) * 0.08}>
              <div className="group h-full bg-white p-8 transition-colors hover:bg-neutral-50">
                <span className="text-xs font-medium text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
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
