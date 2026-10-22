"use client";

import { formatAnswer } from "../lib/logic";
import type { Answers, Step } from "../types";

export default function BriefSummary({
  steps,
  answers,
  onEdit,
}: {
  steps: Step[];
  answers: Answers;
  onEdit: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/[0.04]">
      {steps.map((s) => {
        const text = formatAnswer(s, answers[s.id]);
        return (
          <li key={s.id} className="flex items-start gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white/70">{s.title}</div>
              <div className="mt-1 whitespace-pre-line break-words text-[calc(15*var(--s))] font-semibold text-white">
                {text ?? "— пропущено"}
              </div>
            </div>
            <button type="button" onClick={() => onEdit(s.id)} className="shrink-0 text-sm font-semibold text-[color:var(--hb-a)] hover:underline">
              Изменить
            </button>
          </li>
        );
      })}
    </ul>
  );
}
