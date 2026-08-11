"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";

export default function ServicePicker() {
  const pathname = usePathname();
  const currentKey: ServiceKey =
    serviceOrder.find((key) => `/${serviceMeta[key].slug}` === pathname) ?? "content";

  // Arrows/dots only preview a service here — they don't navigate. The
  // visitor commits to actually visiting that service's page (and its own
  // portfolio/pricing/etc below) via the "Подробнее" button.
  const [previewKey, setPreviewKey] = useState<ServiceKey>(currentKey);
  const index = serviceOrder.indexOf(previewKey);
  const count = serviceOrder.length;
  const previewMeta = serviceMeta[previewKey];

  const go = (delta: number) => setPreviewKey(serviceOrder[(index + delta + count) % count]);

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
              opacity: key === previewKey ? 1 : 0,
              transform: key === previewKey ? "scale(1)" : "scale(1.06)",
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
          {previewMeta.label}
        </h3>

        <p className="mt-3.5 max-w-[440px] text-sm leading-relaxed text-paper/75">
          {previewMeta.description}
        </p>

        <div className="mt-5 flex gap-2">
          {serviceOrder.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreviewKey(key)}
              aria-label={serviceMeta[key].label}
              className={`h-2 w-2 rounded-full transition-colors ${
                key === previewKey ? "bg-glow" : "bg-paper/25 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>

        <Link
          href={`/${previewMeta.slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-glow/40 px-6 py-3 text-sm font-medium text-paper transition hover:border-glow hover:bg-glow/10"
        >
          Подробнее об услуге →
        </Link>
      </Container>
    </section>
  );
}
