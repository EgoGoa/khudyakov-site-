"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { useService } from "@/lib/service-context";
import { finalCtaByCategory } from "@/lib/service-content";

export default function FinalCTA() {
  const { active } = useService();
  const cta = finalCtaByCategory[active];

  return (
    <section id="finalcta" className="py-10 sm:py-14">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-12 text-center sm:py-14"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(600px circle at 50% 0%, rgba(0,210,255,0.18), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="font-sans text-4xl font-light uppercase leading-[1.02] tracking-[0.01em] text-paper sm:text-6xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-paper/60 sm:text-base">
              {cta.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/brief"
                className="btn-neon"
              >
                Заполнить бриф
              </Link>
              <a
                href="mailto:khudyakov.yegor@gmail.com"
                className="rounded-full border border-paper/15 px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-paper/5"
              >
                Написать на почту →
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
