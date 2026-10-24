"use client";

import { useSyncExternalStore } from "react";
import { CALM_ATTR, LIVE_HOSTS, isCalm } from "@/lib/welcome-freeze";

// «Спокойный режим» (Егор, 2026-10-24): фон-видео не должен давить на зрение.
// Режим выключает движение фона — видео встаёт кадром, дым и холсты не
// рисуют (всё через общую заморозку isSiteFrozen). Выбор посетителя
// запоминается; пока он не выбирал, режим включён, если в системе стоит
// «уменьшить движение».
const KEY = "hud-calm";
const EVENT = "hud-calm-change";

const held = new Set<HTMLVideoElement>();

function hold(v: HTMLVideoElement) {
  if (v.closest(LIVE_HOSTS) || v.paused) return;
  v.pause();
  held.add(v);
}
function onPlay(e: Event) {
  if (e.target instanceof HTMLVideoElement) hold(e.target);
}

function apply(on: boolean) {
  const html = document.documentElement;
  if (on === html.hasAttribute(CALM_ATTR)) return;
  if (on) {
    html.setAttribute(CALM_ATTR, "");
    document.querySelectorAll("video").forEach(hold);
    document.addEventListener("play", onPlay, true);
  } else {
    html.removeAttribute(CALM_ATTR);
    document.removeEventListener("play", onPlay, true);
    held.forEach((v) => void v.play().catch(() => {}));
    held.clear();
  }
  window.dispatchEvent(new Event(EVENT));
}

function stored(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "1" ? true : v === "0" ? false : null;
  } catch {
    return null;
  }
}

/** Выставляет режим при загрузке и следит за системной настройкой. */
export function initCalm(): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    const pref = stored();
    apply(pref ?? mq.matches);
  };
  sync();
  mq.addEventListener("change", sync);
  return () => mq.removeEventListener("change", sync);
}

export function setCalm(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* без хранилища выбор живёт до перезагрузки */
  }
  apply(on);
}

export function useCalm(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    isCalm,
    () => false,
  );
}
