"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CalcConfig } from "./calcData";
import { numLocale } from "@/i18n/format";

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formatRub(value: number) {
  return value.toLocaleString(numLocale()) + " ₽";
}

function tierFor(tiers: CalcConfig["tiers"], midpoint: number) {
  return tiers.find((t) => midpoint <= t.ceiling)?.name ?? "Премиальный";
}

const selectClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-sm text-white transition focus:border-[color:var(--hb-a)] focus:outline-none";

export default function Calculator({ config }: { config: CalcConfig }) {
  const { types: VIDEO_TYPES, scales: DURATIONS, addons: ADDONS } = config;
  const [typeId, setTypeId] = useState(VIDEO_TYPES[config.defaultType].id);
  const [durationId, setDurationId] = useState(DURATIONS[config.defaultScale].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const result = useMemo(() => {
    const type = VIDEO_TYPES.find((t) => t.id === typeId)!;
    const duration = DURATIONS.find((d) => d.id === durationId)!;
    const addonPct = addonIds.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.pct ?? 0), 0);
    const factor = duration.mult * (1 + addonPct);
    const min = roundTo(type.min * factor, 5000);
    const max = roundTo(type.max * factor, 5000);
    const midpoint = (min + max) / 2;
    return { min, max, addonPct, duration, tier: tierFor(config.tiers, midpoint) };
  }, [typeId, durationId, addonIds, VIDEO_TYPES, DURATIONS, ADDONS, config.tiers]);

  const isPremium = result.min >= config.premiumFrom;

  return (
    <div className="glass-panel grid gap-0 overflow-hidden rounded-3xl lg:grid-cols-[1.2fr_1fr]">
      <div className="p-6 sm:p-8 lg:p-10">
        <fieldset>
          <legend className="mb-4 block font-display text-xs uppercase tracking-[0.15em] text-white">
            {config.legends.type}
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {VIDEO_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTypeId(type.id)}
                className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                  typeId === type.id
                    ? "border-[color:var(--hb-a)] bg-[color-mix(in_srgb,var(--hb-a)_14%,transparent)] text-white"
                    : "border-white/12 bg-white/[0.03] text-white hover:border-white/25"
                }`}
              >
                <span className="block font-medium">{type.label}</span>
                <span className="mt-0.5 block text-xs text-white/70">{type.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="mb-4 block font-display text-xs uppercase tracking-[0.15em] text-white">
            {config.legends.scale}
          </legend>
          <select
            value={durationId}
            onChange={(e) => setDurationId(e.target.value)}
            className={selectClass}
          >
            {DURATIONS.map((d) => (
              <option key={d.id} value={d.id} className="bg-ink">
                {d.label}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="mb-4 block font-display text-xs uppercase tracking-[0.15em] text-white">
            Дополнительно <span className="text-white/50 normal-case tracking-normal">(необязательно)</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ADDONS.map((addon) => {
              const checked = addonIds.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition ${
                    checked
                      ? "border-[color:var(--hb-a)] bg-[color-mix(in_srgb,var(--hb-a)_12%,transparent)] text-white"
                      : "border-white/12 bg-white/[0.03] text-white hover:border-white/25"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--hb-a)]"
                  />
                  <span>
                    <span className="block font-medium">{addon.label}</span>
                    <span className="mt-0.5 block text-xs text-white/70">{addon.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col justify-between border-t border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
        <div>
          <span className="font-display text-xs uppercase tracking-[0.15em] text-glow">
            Ориентировочный бюджет
          </span>
          <div className="mt-4 font-display text-3xl uppercase leading-none text-white sm:text-4xl">
            {isPremium ? (
              <>от {formatRub(result.min)}{config.priceSuffix}</>
            ) : (
              <>
                {formatRub(result.min)}
                <span className="text-white/40"> – </span>
                {formatRub(result.max)}
                {config.priceSuffix}
              </>
            )}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--hb-a)] px-3.5 py-1.5 font-display text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--hb-a)]">
            Уровень «{result.tier}»
          </div>

          <p className="mt-6 text-sm leading-relaxed text-white">
            Это ориентировочный расчёт для планирования бюджета. Точную смету
            мы готовим индивидуально после короткого брифа — исходя из
            локации, количества смен и объёма материалов.
          </p>
        </div>

        <Link href={`/brief/${config.id}`} className="hb-btn mt-8">
          Обсудить проект →
        </Link>
      </div>
    </div>
  );
}
