import type { useRouter } from "@/i18n/navigation";
import { sureNavigate } from "@/lib/sure-nav";
import { localizeHref } from "@/i18n/href";
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
      const real = localizeHref(target);
      if (!location.pathname.startsWith(real)) window.location.replace(real);
    }, 800);
    return;
  }
  sureNavigate(router, target, { fallbackMs: 800 });
}

export const openBrief = (router: Router, href?: string, replace = false) =>
  openService(router, "brief", href, replace);
