"use client";

import { useEffect, useState } from "react";
import LeadModal from "@/components/home/LeadModal";
import { OPEN_LEAD_EVENT } from "@/lib/lead";

// Единое окно заявки. Открывается событием openLead() и любой ссылкой на
// бриф (/brief…) на сайте: вместо прямого перехода посетитель видит выбор,
// как удобнее обсудить проект. Ссылка с data-lead-direct (сама кнопка
// «Заполнить бриф» в окне) и ссылки на страницах брифа ведут напрямую.
export default function GlobalLead() {
  const [open, setOpen] = useState(false);
  const [briefHref, setBriefHref] = useState("/brief");

  useEffect(() => {
    const show = (href?: string) => {
      setBriefHref(href || "/brief");
      setOpen(true);
    };
    const onEvent = (e: Event) => show((e as CustomEvent<{ briefHref?: string }>).detail?.briefHref);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.hasAttribute("data-lead-direct")) return;
      const href = a.getAttribute("href") ?? "";
      if (!/^\/brief(\/[a-z-]+)?\/?$/.test(href)) return;
      if (window.location.pathname.startsWith("/brief")) return;
      e.preventDefault();
      e.stopPropagation();
      show(href);
    };
    window.addEventListener(OPEN_LEAD_EVENT, onEvent);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(OPEN_LEAD_EVENT, onEvent);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return <LeadModal open={open} onClose={() => setOpen(false)} briefHref={briefHref} />;
}
