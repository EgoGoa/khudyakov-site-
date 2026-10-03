"use client";

import Link from "next/link";
import { ringOf } from "@/components/home/direction/siblings";
import { serviceMeta, serviceOrder } from "@/lib/service-content";
import { useCleanPathname } from "@/lib/use-clean-pathname";

// Колонка «Направления» в подвале подстраивается под страницу (Егор,
// 2026-10-03): на странице сайтов — все форматы сайтов, на AI — все
// AI-инструменты и т. д. Раньше здесь был один и тот же список из десяти
// подуслуг, и все ссылки вели в одно место — на главную. Списки берутся из
// того же кольца, что крутят боковые стрелки (siblings.ts), поэтому новый
// формат появляется в подвале сам. Вне страниц услуг (главная, калькулятор,
// бриф) показываем сами четыре раздела.
export default function FooterDirections() {
  const path = useCleanPathname();
  const slug = path.split("/").filter(Boolean)[0] ?? "";
  const key = serviceOrder.find((k) => serviceMeta[k].slug === slug) ?? null;

  const heading = key ? serviceMeta[key].label : "Направления";
  const links = key
    ? [
        ...(path === `/${slug}` ? [] : [{ href: `/${slug}`, label: "Все о разделе" }]),
        ...ringOf(serviceMeta[key].slug),
      ]
    : serviceOrder.map((k) => ({ href: `/${serviceMeta[k].slug}`, label: serviceMeta[k].label }));

  return (
    <div>
      <div className="font-display text-xs uppercase tracking-[0.2em] text-paper/40">{heading}</div>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-paper/60 transition-colors hover:text-glow" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
