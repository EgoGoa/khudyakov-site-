"use client";

import { looksLikeUrl } from "../../lib/logic";
import type { Answer } from "../../types";

export default function LinksStep({
  answer,
  onChange,
}: {
  answer: Answer | undefined;
  onChange: (patch: Partial<Answer>) => void;
}) {
  const links = answer?.links?.length ? answer.links : [""];
  const set = (next: string[]) => onChange({ links: next });
  return (
    <div className="space-y-3">
      {links.map((l, i) => {
        const bad = l.trim() !== "" && !looksLikeUrl(l);
        return (
          <div key={i}>
            <div className="flex items-center gap-2">
              <input
                value={l}
                onChange={(e) => set(links.map((x, j) => (j === i ? e.target.value : x)))}
                inputMode="url"
                autoCapitalize="none"
                placeholder="https://"
                aria-label={`Ссылка ${i + 1}`}
                aria-invalid={bad}
                className="hb-input"
              />
              {links.length > 1 && (
                <button type="button" aria-label="Удалить ссылку" onClick={() => set(links.filter((_, j) => j !== i))} className="hb-x">×</button>
              )}
            </div>
            {bad && <p className="mt-1 text-xs text-white/80">Похоже, это не ссылка — проверьте, но можно оставить как есть</p>}
          </div>
        );
      })}
      {links.length < 10 && (
        <button type="button" onClick={() => set([...links, ""])} className="text-sm font-semibold text-[color:var(--hb-a)] hover:underline">
          ＋ Добавить ещё
        </button>
      )}
    </div>
  );
}
