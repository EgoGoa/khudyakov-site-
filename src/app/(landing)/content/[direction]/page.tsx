import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { contentDirections } from "@/lib/service-content";

// Superficial on purpose — one screen of real copy per direction (pitch +
// what's included) rather than the full ruvision-style case-study/pricing/
// process stack. Deepening any one of these is a separate pass once the
// direction grid itself (the actual ask) is settled.

export function generateStaticParams() {
  return contentDirections.map((d) => ({ direction: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ direction: string }>;
}): Promise<Metadata> {
  const { direction: slug } = await params;
  const direction = contentDirections.find((d) => d.slug === slug);
  if (!direction) return {};
  return {
    title: `${direction.title} — HDKV.AGENCY`,
    description: direction.description,
  };
}

export default async function DirectionPage({ params }: { params: Promise<{ direction: string }> }) {
  const { direction: slug } = await params;
  const direction = contentDirections.find((d) => d.slug === slug);
  if (!direction) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <Reveal>
          <Link
            href="/content"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-paper/50 transition-colors hover:text-glow"
          >
            <span aria-hidden="true">←</span>
            Создание контента
          </Link>

          <Eyebrow label="Направление" />
          <h1 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            {direction.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/70">
            {direction.pitch}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-10 divide-y divide-paper/10 border-t border-paper/10">
            {direction.bullets.map((bullet, i) => (
              <li key={bullet} className="flex items-baseline gap-4 py-4">
                <span className="font-mono text-xs text-paper/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-paper/80 sm:text-base">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/brief" className="btn-neon btn-warm btn-3d !py-3.5">
              Заполнить бриф
            </Link>
            <Link
              href="/content"
              className="font-mono text-xs uppercase tracking-[0.15em] text-paper/50 transition-colors hover:text-glow"
            >
              Все направления →
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
