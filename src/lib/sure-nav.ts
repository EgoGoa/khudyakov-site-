// Переход между разделами, который не может «застрять» (Егор, 2026-10-09:
// «нажал в шапке на Контент — название сменилось, а страница висит на
// SMM»). router.push в статичной версии сайта ждёт данные страницы с
// хостинга; если запрос оборвался или завис, Next молча оставляет старую
// страницу, а шапка уже показывает новую.
//
//   • Через HARD_FALLBACK_MS проверяем адрес: если мы всё ещё не там, куда
//     шли (и это по-прежнему последний запрошенный переход), загружаем
//     страницу заново обычным переходом браузера.
import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

export const SOFT_NAV_KEY = "hdkv_soft_nav";
const HARD_FALLBACK_MS = 5000;

let latest = 0;
const clean = (p: string) => p.replace(/\/+$/, "") || "/";

/** Страховка для перехода, который уже запускает кто-то другой (например,
 *  <Link>): обычная загрузка, если через 5 с мы не там. */
export function guardNavigation(href: string) {
  const id = ++latest;
  const target = clean(new URL(href, location.href).pathname);
  window.setTimeout(() => {
    if (id !== latest || !navigator.onLine) return;
    if (clean(location.pathname) === target) return;
    // Это всё ещё переход по сайту, а не новый заход: стартовое окно после
    // такой перезагрузки не показываем (см. WelcomeOverlay).
    try {
      sessionStorage.setItem(SOFT_NAV_KEY, "1");
    } catch {
      /* без хранилища окно просто покажется */
    }
    window.location.assign(href);
  }, HARD_FALLBACK_MS);
}

export function sureNavigate(router: Router, href: string, opts?: { scroll?: boolean }) {
  guardNavigation(href);
  router.push(href, opts);
}
