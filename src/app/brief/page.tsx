import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Бриф на проект — HUD.SERVICE",
  description: "Выберите, что нужно: контент, сайт, SMM или AI-инструменты — и ответьте на несколько коротких вопросов.",
};

const CHOICES = [
  { href: "/brief/content", title: "Создание контента", hint: "Ролики, съёмки, фото" },
  { href: "/brief/sites", title: "Сайты", hint: "Лендинги, магазины, редизайн" },
  { href: "/brief/smm", title: "SMM", hint: "Ведение и продвижение соцсетей" },
  { href: "/brief/ai", title: "AI-инструменты", hint: "Агенты, автоматизация, AI-контент" },
];

export default function BriefChooserPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="font-display text-[1.9rem] uppercase leading-[1.1] text-white sm:text-5xl">
        Какой нужен <span className="hb-grad-text">бриф</span>
      </h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHOICES.map((c) => (
          <Link key={c.href} href={c.href} className="hb-card flex-col !items-start gap-1">
            <span className="text-[17px] font-bold text-white">{c.title}</span>
            <span className="text-sm font-semibold text-white/80">{c.hint}</span>
          </Link>
        ))}
      </div>
      <Link href="/brief/general" className="mt-6 inline-block text-sm font-semibold text-white underline underline-offset-4">
        Не уверены? Короткий общий бриф
      </Link>
    </section>
  );
}
