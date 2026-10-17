import type { useRouter } from "next/navigation";
import { sureNavigate } from "@/lib/sure-nav";
import { currentServiceId } from "../registry";

type Router = ReturnType<typeof useRouter>;
type Base = "brief" | "calculator";

// Открывает бриф или калькулятор текущей услуги (или заданный адрес). Переход
// мягкий, из предзагруженных страниц; если Safari/сеть его не завершили за
// 0,8 с — обычная загрузка страницы, чтобы всё открывалось сразу.
export function openService(router: Router, base: Base, href?: string, replace = false) {
  const target = href ?? `/${base}/${currentServiceId()}`;
  if (replace) {
    router.replace(target);
    window.setTimeout(() => {
      if (!location.pathname.startsWith(target)) window.location.replace(target);
    }, 800);
    return;
  }
  sureNavigate(router, target, { fallbackMs: 800 });
}

export const openBrief = (router: Router, href?: string, replace = false) =>
  openService(router, "brief", href, replace);
