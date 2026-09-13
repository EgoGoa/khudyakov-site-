"use client";

import Link from "next/link";

// Required on every lead-capturing form (LeadModal, TeamConsultModal,
// BriefForm) per 152-ФЗ: no personal data collection without explicit
// consent. One shared component so the wording and behavior can't drift
// between forms.
export default function ConsentCheckbox({
  checked,
  onChange,
  accent = "rec",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: "rec" | "glow";
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-paper/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 h-4 w-4 shrink-0 ${accent === "glow" ? "accent-glow" : "accent-rec"}`}
      />
      <span>
        Согласен(на) с{" "}
        <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-paper">
          обработкой персональных данных
        </Link>
      </span>
    </label>
  );
}
