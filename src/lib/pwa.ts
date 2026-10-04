"use client";

import { useEffect, useState } from "react";

// Установка сайта как приложения (PWA): значок на рабочем столе телефона и
// компьютера. Здесь — общая часть для всех входов (меню вайб-бара, кабинет,
// голос, капсула при втором визите): какой у посетителя способ установки и
// как открыть окно выбора иконки.

export const OPEN_INSTALL_EVENT = "hdkv:open-install";
export const openInstall = () => window.dispatchEvent(new Event(OPEN_INSTALL_EVENT));

/** Набор иконок: id совпадает с файлами в public/pwa (scripts/gen-pwa-icons.mjs). */
export const PWA_ICONS = [
  { id: "hud", label: "HUD" },
  { id: "aim", label: "Прицел" },
  { id: "four", label: "Четыре направления" },
  { id: "brush", label: "Мазок" },
  { id: "window", label: "Окно" },
  { id: "drop", label: "Капля" },
  { id: "column", label: "Столбик" },
  { id: "paper", label: "Бумага" },
] as const;
export type PwaIconId = (typeof PWA_ICONS)[number]["id"];

export const PWA_ICON_KEY = "hdkv_pwa_icon";

/** Как ставить именно в этом браузере. */
export type InstallMode =
  /** Уже открыто как приложение. */
  | "standalone"
  /** Chrome, Edge, Яндекс, Samsung: системное окно по кнопке. */
  | "prompt"
  /** iPhone/iPad: Apple не даёт кнопку — показываем, куда нажать. */
  | "ios"
  /** Safari на Mac: «Файл → Добавить в Dock». */
  | "macsafari"
  /** Chromium без готового системного окна: через меню браузера. */
  | "manual"
  /** Firefox и прочее — предложить нечего, кнопки прячем. */
  | "none";

type BipEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type Win = Window & { __hdkvBip?: BipEvent };

/** Слушатель, который надо повесить до гидратации: событие приходит один раз. */
export const BIP_SNIPPET =
  "addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__hdkvBip=e;dispatchEvent(new Event('hdkv:bip'))});addEventListener('appinstalled',function(){window.__hdkvBip=null;dispatchEvent(new Event('hdkv:bip'))})";

function detectMode(): InstallMode {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (window.matchMedia("(display-mode: standalone)").matches || nav.standalone) return "standalone";
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if ((window as Win).__hdkvBip) return "prompt";
  if (/Firefox|FxiOS/.test(ua)) return "none";
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|YaBrowser|OPR/.test(ua)) return "macsafari";
  if (/Chrome|Chromium|Edg|YaBrowser|OPR|SamsungBrowser/.test(ua)) return "manual";
  return "none";
}

export function useInstallMode(): InstallMode | null {
  const [mode, setMode] = useState<InstallMode | null>(null);
  useEffect(() => {
    const sync = () => setMode(detectMode());
    sync();
    window.addEventListener("hdkv:bip", sync);
    return () => window.removeEventListener("hdkv:bip", sync);
  }, []);
  return mode;
}

/** Можно ли вообще предлагать установку (кнопки в меню, кабинете, капсула). */
export const canOfferInstall = (m: InstallMode | null) => m === "prompt" || m === "ios" || m === "macsafari" || m === "manual";

/** Подменяет манифест и иконку iOS на выбранные — браузер берёт их в момент установки. */
export function applyIcon(id: PwaIconId) {
  const m = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (m) m.href = `/pwa/manifest-${id}.webmanifest`;
  document.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]').forEach((l) => {
    l.href = `/pwa/${id}-180.png`;
  });
}

/** Системное окно установки (Chrome и родня). null — окна нет. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | null> {
  const e = (window as Win).__hdkvBip;
  if (!e) return null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  (window as Win).__hdkvBip = undefined;
  window.dispatchEvent(new Event("hdkv:bip"));
  return outcome;
}
