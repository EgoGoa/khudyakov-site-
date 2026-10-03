// Одна точка заявок на весь сайт (Егор, 2026-10-03): любая кнопка
// «Обсудить проект» открывает окно выбора (LeadModal) — бриф, звонок,
// консультация, Телеграм, подбор за час.
export const OPEN_LEAD_EVENT = "hdkv:open-lead";

export function openLead(briefHref?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT, { detail: { briefHref } }));
}
