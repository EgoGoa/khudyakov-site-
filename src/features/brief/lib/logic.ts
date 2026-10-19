import type { Answer, Answers, BriefConfig, ContactMethod, Step } from "../types";
import { DEADLINE_ID } from "../configs/helpers";
import { numLocale } from "@/i18n/format";

export const STORAGE_PREFIX = "hud-brief";
export const storageKey = (id: string) => `${STORAGE_PREFIX}:${id}:v1`;

export const CONSENT_LABEL = "Согласен(на) на обработку персональных данных";

export function isVisible(step: Step, answers: Answers): boolean {
  if (!step.showIf) return true;
  const ids = answers[step.showIf.stepId]?.ids ?? [];
  return step.showIf.anyOf.some((id) => ids.includes(id));
}

export function visibleSteps(config: BriefConfig, answers: Answers): Step[] {
  return config.steps.filter((s) => isVisible(s, answers));
}

export const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const URL_RE = /^(https?:\/\/)?([\p{L}\d-]+\.)+[\p{L}\d-]{2,}(\/\S*)?$/u;
export const looksLikeUrl = (v: string) => URL_RE.test(v.trim());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function phoneDigits(v: string) {
  return v.replace(/\D/g, "");
}

/** Лёгкая маска: +7 (999) 123-45-67 для российских номеров, остальное как есть. */
export function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+") && !trimmed.startsWith("+7")) return trimmed.replace(/[^\d+]/g, "");
  let d = phoneDigits(raw);
  if (!d) return trimmed.startsWith("+") ? "+" : "";
  if (d[0] === "8" || d[0] === "7") d = d.slice(1);
  d = d.slice(0, 10);
  let out = "+7";
  if (d.length) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

export function validContact(method: ContactMethod | undefined, value: string | undefined): boolean {
  const v = (value ?? "").trim();
  if (!method || !v) return false;
  if (method === "email") return EMAIL_RE.test(v);
  if (method === "telegram") return /^(@|https?:\/\/t\.me\/|t\.me\/)?[A-Za-z0-9_]{4,32}$/.test(v) || phoneDigits(v).length >= 10;
  return phoneDigits(v).length >= 10;
}

export function isFilled(step: Step, a: Answer | undefined): boolean {
  const ans = a ?? {};
  switch (step.type) {
    case "single":
    case "budget":
    case "multi": {
      const n = (ans.ids?.length ?? 0) + (ans.customOn && ans.custom?.trim() ? 1 : 0);
      if (ans.customOn && !ans.custom?.trim() && n === 0) return false;
      return n >= (step.min ?? 1);
    }
    case "deadline": {
      if (ans.ids?.includes(DEADLINE_ID)) return Boolean(ans.date && ans.date >= todayISO());
      return (ans.ids?.length ?? 0) > 0;
    }
    case "text":
    case "textarea":
      return Boolean(ans.text?.trim());
    case "links":
      return (ans.links ?? []).some((l) => l.trim());
    case "contact":
      return Boolean(ans.name?.trim()) && validContact(ans.method, ans.contact) && Boolean(ans.consent);
  }
}

export const canProceed = (step: Step, a: Answer | undefined) =>
  step.required === false ? true : isFilled(step, a);

export const METHOD_LABEL: Record<ContactMethod, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  call: "Звонок",
  email: "Email",
};

/** Ответ шага в читаемом виде; null — шаг пропущен. */
export function formatAnswer(step: Step, a: Answer | undefined): string | null {
  if (!a) return null;
  switch (step.type) {
    case "single":
    case "budget":
    case "multi":
    case "deadline": {
      const parts = (a.ids ?? []).map((id) => {
        const label = step.options?.find((o) => o.id === id)?.label ?? id;
        if (id === DEADLINE_ID && a.date) {
          const d = new Date(`${a.date}T00:00:00`);
          return `${label}: ${Number.isNaN(d.getTime()) ? a.date : d.toLocaleDateString(numLocale(), { day: "numeric", month: "long", year: "numeric" })}`;
        }
        return label;
      });
      if (a.customOn && a.custom?.trim()) parts.push(`Свой вариант: ${a.custom.trim()}`);
      return parts.length ? parts.join(", ") : null;
    }
    case "text":
    case "textarea":
      return a.text?.trim() || null;
    case "links": {
      const l = (a.links ?? []).map((x) => x.trim()).filter(Boolean);
      return l.length ? l.join("\n") : null;
    }
    case "contact": {
      if (!a.name?.trim() || !a.contact?.trim()) return null;
      const lines = [`${a.name.trim()} · ${a.method ? METHOD_LABEL[a.method] : ""}: ${a.contact.trim()}`];
      if (a.comment?.trim()) lines.push(`Комментарий: ${a.comment.trim()}`);
      return lines.join("\n");
    }
  }
}
