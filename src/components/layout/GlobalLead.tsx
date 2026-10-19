"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import LeadModal from "@/components/home/LeadModal";
import { OPEN_LEAD_EVENT } from "@/lib/lead";
import { BRIEF_HREFS, CALCULATOR_HREFS, currentBriefHref, rememberService } from "@/features/brief/registry";
import { openBrief } from "@/features/brief/lib/navigate";
import { stripLocale } from "@/i18n/href";

// Единое окно заявки. Открывается событием openLead() и любой ссылкой на
// бриф (/brief…) на сайте: вместо прямого перехода посетитель видит выбор,
// как удобнее обсудить проект. Ссылка с data-lead-direct (сама кнопка
// «Заполнить бриф» в окне) и ссылки на страницах брифа ведут напрямую.
export default function GlobalLead() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => rememberService(pathname ?? ""), [pathname]);
  const [open, setOpen] = useState(false);
  const [briefHref, setBriefHref] = useState("/brief");

  // Бриф должен открываться мгновенно: заранее подгружаем четыре страницы
  // брифов, как только браузер освободится.
  useEffect(() => {
    const warm = () => [...BRIEF_HREFS, ...CALCULATOR_HREFS].forEach((h) => router.prefetch(h));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm);
    else setTimeout(warm, 1500);
  }, [router]);

  useEffect(() => {
    const show = (href?: string) => {
      setBriefHref(href || currentBriefHref());
      setOpen(true);
    };
    const onEvent = (e: Event) => show((e as CustomEvent<{ briefHref?: string }>).detail?.briefHref);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.hasAttribute("data-lead-direct")) return;
      const href = a.getAttribute("href") ?? "";
      if (!/^\/brief(\/[a-z-]+)?\/?$/.test(href)) return;
      if (stripLocale(window.location.pathname).startsWith("/brief")) return;
      const bare = /^\/brief\/?$/.test(href);
      const target = bare ? currentBriefHref() : href;
      e.preventDefault();
      e.stopPropagation();
      // Ссылка, где написано «бриф», ведёт сразу в бриф текущей категории;
      // остальные («Обсудить проект») открывают окно выбора способа связи.
      if (/бриф/i.test(a.textContent ?? "") || /бриф/i.test(a.getAttribute("aria-label") ?? "")) openBrief(router, target);
      else show(target);
    };
    window.addEventListener(OPEN_LEAD_EVENT, onEvent);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(OPEN_LEAD_EVENT, onEvent);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  return <LeadModal open={open} onClose={() => setOpen(false)} briefHref={briefHref} />;
}
