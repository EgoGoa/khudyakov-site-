"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { WELCOME_OPEN_ATTR } from "@/lib/welcome-freeze";

// Экран ожидания со сферой (слой #slow-veil — в layout.tsx, сфера — в
// slowVeilOrb.ts).
//
// Егор, 2026-10-09: при первом заходе и в стартовом окне сферы нет. Она
// включается только на самом сайте:
//   • переход на другую страницу висит дольше WAIT_MS. Начало перехода —
//     нажатие на внутреннюю ссылку (меню, стрелки, карточки) или запрос
//     данных страницы (у него заголовок RSC; фоновые предзагрузки не в
//     счёт). Конец — сменился адрес страницы. По одной сети переход не
//     поймать: Next часто ждёт уже начатую предзагрузку, и нового запроса
//     нет;
//   • пропала сеть (событие offline) — до её возвращения.
// Пока висит стартовое окно (data-welcome-open), ничего не показываем.
const WAIT_MS = 1300;
// Переход так и не завершился (ссылка вела туда же, сбой) — не держим экран вечно.
const GIVE_UP_MS = 20000;

type Orb = { start: (path?: string) => void };

export default function SlowLoadVeil() {
  const pathname = usePathname();
  const api = useRef<{ arrived: () => void } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    let offline = !navigator.onLine;
    let navigating = false;
    let late = false;
    let fetches = 0;
    let waitTimer = 0;
    let giveUp = 0;
    let target: string | undefined;

    const sync = () => {
      const want = (offline || ((navigating || fetches > 0) && late)) && !root.hasAttribute(WELCOME_OPEN_ATTR);
      if (want === root.hasAttribute("data-veil-wait")) return;
      if (want) {
        root.setAttribute("data-veil-wait", "");
        (window as Window & { __veilOrb?: Orb }).__veilOrb?.start(target);
      } else root.removeAttribute("data-veil-wait");
    };
    const begin = (path?: string) => {
      if (path) target = path;
      if (waitTimer || late) return;
      waitTimer = window.setTimeout(() => {
        waitTimer = 0;
        late = true;
        sync();
      }, WAIT_MS);
    };
    const reset = () => {
      if (navigating || fetches > 0) return;
      window.clearTimeout(waitTimer);
      waitTimer = 0;
      late = false;
      sync();
    };
    const arrived = () => {
      navigating = false;
      window.clearTimeout(giveUp);
      reset();
    };
    api.current = { arrived };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      navigating = true;
      window.clearTimeout(giveUp);
      giveUp = window.setTimeout(arrived, GIVE_UP_MS);
      begin(url.pathname);
    };
    // Капчур — до того, как Link отменит обычный переход по ссылке.
    document.addEventListener("click", onClick, true);

    const urlOf = (input: RequestInfo | URL) =>
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const isNavFetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (headers.has("next-router-prefetch")) return false;
      return headers.has("rsc") || /[?&]_rsc=/.test(urlOf(input));
    };
    const originalFetch = window.fetch;
    const nativeFetch = originalFetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const p = nativeFetch(input, init);
      if (!isNavFetch(input, init)) return p;
      let path: string | undefined;
      try {
        path = new URL(urlOf(input), location.href).pathname;
      } catch {
        path = undefined;
      }
      fetches++;
      begin(path);
      const settle = () => {
        fetches = Math.max(0, fetches - 1);
        reset();
      };
      // Тело ответа тоже должно дойти — ждём не заголовки, а сам текст.
      p.then((r) => r.clone().arrayBuffer()).then(settle, settle);
      return p;
    }) as typeof window.fetch;

    const onOffline = () => {
      offline = true;
      sync();
    };
    const onOnline = () => {
      offline = false;
      sync();
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    // Стартовое окно закрылось, а сети так и нет — показать сразу.
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: [WELCOME_OPEN_ATTR] });
    sync();
    return () => {
      window.fetch = originalFetch;
      mo.disconnect();
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(waitTimer);
      window.clearTimeout(giveUp);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      root.removeAttribute("data-veil-wait");
      api.current = null;
    };
  }, []);

  // Адрес сменился — переход состоялся.
  useEffect(() => {
    api.current?.arrived();
  }, [pathname]);

  return null;
}
