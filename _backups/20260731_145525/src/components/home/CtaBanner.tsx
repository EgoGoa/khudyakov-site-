import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export default function CtaBanner() {
  return (
    <section className="border-t border-black/5 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-black/10 bg-ink p-10 sm:p-14 lg:flex-row lg:items-center">
            <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(50%_60%_at_0%_0%,rgba(124,111,239,0.35),transparent),radial-gradient(50%_60%_at_100%_100%,rgba(255,122,69,0.3),transparent)]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tightest text-white sm:text-4xl">
                Готовы обсудить проект?
              </h2>
              <p className="mt-4 max-w-md text-neutral-300">
                Начнём с консультации, сметы и подготовки концепций — это
                бесплатно. Заполните бриф, и мы вернёмся с идеей и бюджетом в
                течение одного рабочего дня.
              </p>
            </div>
            <Link
              href="/brief"
              className="relative shrink-0 rounded-full bg-white px-8 py-4 text-sm font-medium text-ink transition hover:bg-accent hover:text-white"
            >
              Отправить бриф
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
