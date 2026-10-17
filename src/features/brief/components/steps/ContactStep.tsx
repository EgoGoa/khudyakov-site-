"use client";

import Link from "next/link";
import { formatPhone, METHOD_LABEL, validContact } from "../../lib/logic";
import type { Answer, ContactMethod } from "../../types";

const METHODS: ContactMethod[] = ["telegram", "whatsapp", "call", "email"];
const PLACEHOLDER: Record<ContactMethod, string> = {
  telegram: "@username или номер",
  whatsapp: "+7 (___) ___-__-__",
  call: "+7 (___) ___-__-__",
  email: "name@example.com",
};

export default function ContactStep({
  answer,
  onChange,
}: {
  answer: Answer | undefined;
  onChange: (patch: Partial<Answer>) => void;
}) {
  const a = answer ?? {};
  const method = a.method;
  const phoneLike = method === "whatsapp" || method === "call";
  const bad = Boolean(a.contact?.trim()) && !validContact(method, a.contact);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hb-name" className="mb-2 block text-sm font-semibold text-white">Имя</label>
        <input id="hb-name" value={a.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} autoComplete="name" maxLength={100} className="hb-input" />
      </div>

      <div>
        <span id="hb-method" className="mb-2 block text-sm font-semibold text-white">Как удобнее связаться</span>
        <div role="radiogroup" aria-labelledby="hb-method" className="grid grid-cols-2 gap-3">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={method === m}
              data-on={method === m}
              onClick={() => onChange({ method: m, contact: "" })}
              className="hb-card justify-center !py-3 text-[15px] font-semibold text-white"
            >
              {METHOD_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {method && (
        <div>
          <label htmlFor="hb-contact" className="mb-2 block text-sm font-semibold text-white">
            {method === "email" ? "Email" : method === "telegram" ? "Telegram" : "Телефон"}
          </label>
          <input
            id="hb-contact"
            value={a.contact ?? ""}
            onChange={(e) => onChange({ contact: phoneLike ? formatPhone(e.target.value) : e.target.value })}
            type={method === "email" ? "email" : phoneLike ? "tel" : "text"}
            inputMode={method === "email" ? "email" : phoneLike ? "tel" : "text"}
            autoComplete={method === "email" ? "email" : phoneLike ? "tel" : "off"}
            autoCapitalize="none"
            placeholder={PLACEHOLDER[method]}
            aria-invalid={bad}
            className="hb-input"
          />
          {bad && <p className="mt-1 text-xs text-white/80">Проверьте, пожалуйста, контакт — он выглядит неполным</p>}
        </div>
      )}

      <div>
        <label htmlFor="hb-comment" className="mb-2 block text-sm font-semibold text-white">Комментарий (по желанию)</label>
        <textarea id="hb-comment" rows={3} maxLength={1500} value={a.comment ?? ""} onChange={(e) => onChange({ comment: e.target.value })} className="hb-input" />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white">
        <input type="checkbox" checked={Boolean(a.consent)} onChange={(e) => onChange({ consent: e.target.checked })} className="mt-1 h-5 w-5 shrink-0 accent-[#ff4fd8]" />
        <span>
          Согласен(на) с{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            обработкой персональных данных
          </Link>
        </span>
      </label>
    </div>
  );
}
