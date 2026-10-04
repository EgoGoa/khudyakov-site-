"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import Container from "@/components/ui/Container";
import { aiToolLinks } from "@/components/home/direction/toolRegistry";
import { ringOf } from "@/components/home/direction/siblings";

// Хлебные крошки «Главная / Раздел / Страница» под шапкой на всех
// страницах, кроме четырёх главных разделов. Егор выбрал этот вариант:
// старые боковые стрелки к соседним форматам не читались как «назад», а с
// брифа и служебных страниц пути наверх не было вовсе.
//
// Круглая стрелка в начале строки ведёт на уровень выше (не history.back):
// посетитель из поиска иначе ушёл бы с сайта. Строка закреплена под шапкой
// поверх вёрстки и не сдвигает первый экран; после прокрутки путь прячется,
// а стрелка остаётся и едет вместе с посетителем (просьба Егора).

type Crumb = { href: string; label: string };

const HOME: Crumb = { href: "/content", label: "Главная" };
const SECTIONS: Record<string, Crumb> = {
  ai: { href: "/ai", label: "AI" },
  sites: { href: "/sites", label: "Vibe сайты" },
  smm: { href: "/smm", label: "SMM" },
};
const TOP_LEVEL = new Set(["/", "/content", "/ai", "/sites", "/smm"]);

const PAGES: Record<string, string> = {
  "/works": "Работы",
  "/offer": "Оферта",
  "/bonus": "Подарок за регистрацию",
  "/calculator": "Калькулятор",
  "/privacy": "Конфиденциальность",
  "/terms": "Условия",
  "/cabinet": "Личный кабинет",
  "/brief": "Бриф",
  "/brief/hotel-video": "Бриф на видео",
  "/smm/cases": "Кейсы",
  "/smm/pricing": "Цены",
};

function labelOf(path: string, section: string): string | undefined {
  if (PAGES[path]) return PAGES[path];
  if (section === "ai") return aiToolLinks.find((t) => `/ai/${t.slug}` === path)?.label;
  return ringOf(section).find((s) => s.href === path)?.label;
}

function trailFor(path: string): Crumb[] | null {
  if (TOP_LEVEL.has(path) || path.startsWith("/admin")) return null;
  const parts = path.split("/").filter(Boolean);
  // Бриф раздела (/brief/ai) — часть раздела: «Главная / AI / Бриф».
  if (parts[0] === "brief" && SECTIONS[parts[1]]) {
    return [HOME, SECTIONS[parts[1]], { href: path, label: "Бриф" }];
  }
  const section = parts[0] === "content" ? "content" : parts[0];
  const label = labelOf(path, section);
  if (!label) return null;
  const trail = [HOME];
  if (parts.length > 1 && SECTIONS[section]) trail.push(SECTIONS[section]);
  if (parts[0] === "brief" && parts.length > 1) trail.push({ href: "/brief", label: PAGES["/brief"] });
  trail.push({ href: path, label });
  return trail;
}

export default function Breadcrumbs() {
  const path = useCleanPathname();
  const trail = trailFor(path);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);
  if (!trail) return null;
  const parent = trail[trail.length - 2];

  return (
    <nav aria-label="Навигация по сайту" className={`crumbs pointer-events-none fixed inset-x-0 ${scrolled ? "is-scrolled" : ""} top-[calc(68px+var(--sat))] z-40 sm:top-[calc(84px+var(--sat))] land:top-12`}>
      <Container>
        <ol className="pointer-events-auto inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 font-display text-[10px] font-bold uppercase tracking-[0.08em] sm:text-[11px]">
          <li>
            <Link href={parent.href} aria-label={`Назад: ${parent.label}`} className="crumbs-back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </Link>
          </li>
          {trail.map((c, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={c.href} className="crumbs-step flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="crumbs-sep">/</span>}
                {last ? (
                  <span aria-current="page" className="crumbs-current">{c.label}</span>
                ) : (
                  <Link href={c.href} className="crumbs-link">{c.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
