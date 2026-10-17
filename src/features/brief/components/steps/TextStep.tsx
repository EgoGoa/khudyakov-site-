"use client";

import type { Answer, Step } from "../../types";

export default function TextStep({
  step,
  answer,
  onChange,
  onAdvance,
}: {
  step: Step;
  answer: Answer | undefined;
  onChange: (patch: Partial<Answer>) => void;
  onAdvance: () => void;
}) {
  const common = {
    value: answer?.text ?? "",
    onChange: (e: { target: { value: string } }) => onChange({ text: e.target.value }),
    "aria-labelledby": "hb-title",
    className: "hb-input",
  };
  return step.type === "textarea" ? (
    <textarea {...common} rows={6} maxLength={3000} placeholder="Напишите своими словами" />
  ) : (
    <input
      {...common}
      type="text"
      maxLength={300}
      placeholder="https://"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAdvance();
        }
      }}
    />
  );
}
