// Lightweight, self-hosted event log.
//
// There is no backend in this project, so events are written to the
// visitor's own localStorage. That makes the admin funnel truthful about
// *this browser* and nothing more — it is not cross-visitor analytics. For
// real traffic numbers the site needs a proper analytics backend
// (Plausible / Umami / Яндекс.Метрика) wired to the same track() calls.

export const ANALYTICS_KEY = "khud_events_v1";
const MAX_EVENTS = 500;

export type TrackedEvent = {
  name: string;
  path: string;
  at: number;
};

export const FUNNEL: { name: string; label: string }[] = [
  { name: "pageview", label: "Просмотры страниц" },
  { name: "cta_brief", label: "Клик «Обсудить проект»" },
  { name: "brief_start", label: "Начал бриф" },
  { name: "brief_review", label: "Дошёл до монтажного листа" },
  { name: "brief_sent", label: "Отправил бриф" },
  { name: "calculator_used", label: "Посчитал в калькуляторе" },
];

export function track(name: string) {
  if (typeof window === "undefined") return;
  try {
    const events = readEvents();
    events.push({ name, path: window.location.pathname, at: Date.now() });
    const trimmed = events.slice(-MAX_EVENTS);
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // storage disabled or full — tracking must never break the page
  }
}

export function readEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ANALYTICS_KEY);
  } catch {
    // ignore
  }
}
