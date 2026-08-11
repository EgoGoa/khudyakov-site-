"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";

export default function ServicePicker() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey: ServiceKey =
    serviceOrder.find((key) => `/${serviceMeta[key].slug}` === pathname) ?? "content";
  const index = serviceOrder.indexOf(activeKey);
  const count = serviceOrder.length;
  const activeMeta = serviceMeta[activeKey];

  const go = (delta: number) => {
    const next = serviceOrder[(index + delta + count) % count];
    router.push(`/${serviceMeta[next].slug}`);
  };

  return (
    <section
      id="service-picker"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        {serviceOrder.map((key) => (
          <img
            key={key}
            src={serviceMeta[key].image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[800ms] ease-out"
            style={{
              opacity: key === activeKey ? 1 : 0,
              transform: key === activeKey ? "scale(1)" : "scale(1.06)",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.65), rgba(11,11,16,0.55) 40%, rgba(11,11,16,0.85))",
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Предыдущее"
        className="service-arrow-left absolute left-4 top-1/2 z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-glow/50 bg-ink/50 text-3xl text-glow backdrop-blur-md transition-colors hover:border-glow hover:bg-glow/10 sm:left-8 sm:h-20 sm:w-20"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следующее"
        className="service-arrow-right absolute right-4 top-1/2 z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-glow/50 bg-ink/50 text-3xl text-glow backdrop-blur-md transition-colors hover:border-glow hover:bg-glow/10 sm:right-8 sm:h-20 sm:w-20"
      >
        ›
      </button>

      <Container className="flex flex-col items-center py-10 text-center">
        <h3 className="font-sans text-[clamp(1.8rem,4.5vw,2.8rem)] font-light uppercase tracking-[0.02em] text-paper">
          {activeMeta.label}
        </h3>

        <p className="mt-3.5 max-w-[440px] text-sm leading-relaxed text-paper/75">
          {activeMeta.description}
        </p>

        <div className="mt-5 flex gap-2">
          {serviceOrder.map((key) => (
            <Link
              key={key}
              href={`/${serviceMeta[key].slug}`}
              aria-label={serviceMeta[key].label}
              className={`h-2 w-2 rounded-full transition-colors ${
                key === activeKey ? "bg-glow" : "bg-paper/25 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
