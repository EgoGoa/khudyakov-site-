// Переход между разделами, который не может «застрять» (Егор, 2026-10-09:
// «нажал в шапке на Контент — название сменилось, а страница висит на
// SMM»). router.push в статичной версии сайта ждёт данные страницы с
// хостинга; если запрос оборвался или завис, Next молча оставляет старую
// страницу, а шапка уже показывает новую.
//
//   • Сразу сообщаем экрану ожидания (SlowLoadVeil), что начался переход:
//     висит дольше 1,3 с — появляется сфера.
//   • Через HARD_FALLBACK_MS проверяем адрес: если мы всё ещё не там, куда
//     шли (и это по-прежнему последний запрошенный переход), загружаем
//     страницу заново обычным переходом браузера.
import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

export const NAV_START_EVENT = "hdkv:nav-start";
const HARD_FALLBACK_MS = 5000;

let latest = 0;
const clean = (p: string) => p.replace(/\/+$/, "") || "/";

/** Страховка для перехода, который уже запускает кто-то другой (например,
 *  <Link>): сфера ожидания и обычная загрузка, если через 5 с мы не там. */
export function guardNavigation(href: string) {
  const id = ++latest;
  const target = clean(new URL(href, location.href).pathname);
  window.dispatchEvent(new CustomEvent(NAV_START_EVENT, { detail: target }));
  window.setTimeout(() => {
    if (id !== latest || !navigator.onLine) return;
    if (clean(location.pathname) !== target) window.location.assign(href);
  }, HARD_FALLBACK_MS);
}

export function sureNavigate(router: Router, href: string, opts?: { scroll?: boolean }) {
  guardNavigation(href);
  router.push(href, opts);
}
