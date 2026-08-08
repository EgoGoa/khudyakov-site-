"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:py-20"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(600px circle at 50% 0%, rgba(0,210,255,0.18), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-paper sm:text-6xl">
              Готовы к съёмке?
              <br />
              Расскажите о проекте.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-paper/60 sm:text-base">
              Присоединяйтесь к 200+ брендам, которые доверили нам своё
              видео — от идеи до сдачи в эфир.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/brief"
                className="rounded-full bg-rec px-7 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light"
              >
                Обсудить проект
              </Link>
              <a
                href="mailto:hello@khudyakov.agency"
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
