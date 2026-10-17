import type { Answers, BriefConfig } from "../types";
import { formatAnswer, METHOD_LABEL, visibleSteps } from "./logic";

const LEAD_TYPE: Record<string, string> = {
  content: "brief-content",
  sites: "brief-sites",
  smm: "brief-smm",
  ai: "brief-ai",
  general: "brief-general",
};

const CATEGORY: Record<string, string> = {
  content: "Создание контента",
  sites: "Сайты",
  smm: "SMM",
  ai: "AI-инструменты",
  general: "Общий бриф",
};

/** Заявка уходит в тот же /api/lead (Resend), что и остальные формы сайта. */
export async function submitBrief(config: BriefConfig, answers: Answers): Promise<void> {
  const contactStep = config.steps.find((s) => s.type === "contact");
  const c = contactStep ? answers[contactStep.id] : undefined;
  if (!c) throw new Error("no_contact");

  const fields: Record<string, string> = {
    Категория: CATEGORY[config.id] ?? config.id,
    "ID брифа": config.id,
    Страница: window.location.href.split("#")[0],
    "Способ связи": c.method ? METHOD_LABEL[c.method] : "",
  };

  const utm = new URLSearchParams(window.location.search);
  const utmParts: string[] = [];
  utm.forEach((v, k) => {
    if (k.startsWith("utm_")) utmParts.push(`${k}=${v}`);
  });
  if (utmParts.length) fields["UTM"] = utmParts.join(", ");

  for (const step of visibleSteps(config, answers)) {
    if (step.type === "contact") continue;
    fields[step.title] = formatAnswer(step, answers[step.id]) ?? "— (пропущено)";
  }
  if (c.comment?.trim()) fields["Комментарий"] = c.comment.trim();

  try {
    const raw = sessionStorage.getItem("team-pulse-prefill");
    if (raw) {
      const pre = JSON.parse(raw) as { who?: string; source?: string; answers?: Record<string, string> };
      fields["Из чата"] = `${pre.who ?? ""} · ${pre.source ?? ""}`;
      Object.entries(pre.answers ?? {}).forEach(([k, v]) => {
        fields[`Чат · ${k}`] = v;
      });
    }
  } catch {
    /* sessionStorage недоступен — отправляем бриф как есть */
  }

  const isEmail = c.method === "email";
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: LEAD_TYPE[config.id],
      name: c.name?.trim() ?? "",
      phone: isEmail ? undefined : c.contact?.trim(),
      email: isEmail ? c.contact?.trim() : undefined,
      fields,
    }),
  });
  if (!res.ok) throw new Error("send_failed");
  try {
    sessionStorage.removeItem("team-pulse-prefill");
  } catch {
    /* нечего чистить */
  }
}
