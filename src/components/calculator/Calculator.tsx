"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type VideoType = { id: string; label: string; hint: string; min: number; max: number };
type Duration = { id: string; label: string; mult: number };
type Addon = { id: string; label: string; hint: string; pct: number };

const VIDEO_TYPES: VideoType[] = [
  { id: "social", label: "Контент для соцсетей", hint: "Reels, шортсы, TikTok", min: 35000, max: 90000 },
  { id: "event", label: "Съёмка мероприятия", hint: "Конференции, ивенты, форумы", min: 75000, max: 150000 },
  { id: "image", label: "Имиджевое видео", hint: "О компании, продукте, команде", min: 90000, max: 180000 },
  { id: "motion", label: "Motion design / анимация", hint: "2D-анимация, инфографика", min: 90000, max: 220000 },
  { id: "ad", label: "Рекламный ролик", hint: "Для ТВ и запуска на YouTube", min: 120000, max: 255000 },
  { id: "vfx", label: "3D-визуализация / VFX", hint: "Сложная графика, спецэффекты", min: 250000, max: 900000 },
];

const DURATIONS: Duration[] = [
  { id: "xs", label: "До 30 секунд", mult: 0.8 },
  { id: "s", label: "30–60 секунд", mult: 1 },
  { id: "m", label: "1–3 минуты", mult: 1.35 },
  { id: "l", label: "3+ минуты", mult: 1.8 },
];

const ADDONS: Addon[] = [
  { id: "cutdowns", label: "Доп. версии под сторис / шортсы", hint: "Несколько форматов из одной съёмки", pct: 0.1 },
  { id: "rush", label: "Срочное производство", hint: "Сжатые сроки съёмки и монтажа", pct: 0.25 },
  { id: "script", label: "Разработка сценария с нуля", hint: "Идея, драматургия, раскадровка", pct: 0.12 },
  { id: "voice", label: "Озвучка / диктор", hint: "Профессиональная начитка текста", pct: 0.08 },
  { id: "cast", label: "Актёры / кастинг", hint: "Подбор и работа с актёрами", pct: 0.15 },
  { id: "vfx", label: "3D / VFX-элементы", hint: "Спецэффекты, композитинг", pct: 0.2 },
  { id: "brand", label: "Брендбук с нуля", hint: "Лого, цвета, гайдлайны", pct: 0.1 },
];

const TIERS = [
  { name: "Стартовый", ceiling: 75000 },
  { name: "Профессиональный", ceiling: 255000 },
  { name: "Премиальный", ceiling: Infinity },
];

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formatRub(value: number) {
  return value.toLocaleString("ru-RU") + " ₽";
}

function tierFor(midpoint: number) {
  return TIERS.find((t) => midpoint <= t.ceiling)?.name ?? "Премиальный";
}

const selectClass =
  "w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper focus:border-glow focus:outline-none";

export default function Calculator() {
  const [typeId, setTypeId] = useState(VIDEO_TYPES[3].id);
  const [durationId, setDurationId] = useState(DURATIONS[1].id);
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
    return { min, max, addonPct, duration, tier: tierFor(midpoint) };
  }, [typeId, durationId, addonIds]);

  const isPremium = result.min >= 900000;

  return (
    <GlassCard className="mt-8 grid gap-0 overflow-hidden lg:grid-cols-[1.2fr_1fr]">
      <div className="p-6 sm:p-8">
        <fieldset>
          <legend className="mb-3 block text-sm font-medium text-paper/70">Тип ролика</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {VIDEO_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTypeId(type.id)}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                  typeId === type.id
                    ? "border-glow bg-glow/10 text-paper"
                    : "border-paper/15 bg-paper/[0.03] text-paper/70 hover:border-paper/30"
                }`}
              >
                <span className="block font-medium">{type.label}</span>
                <span className="mt-0.5 block text-xs text-paper/45">{type.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="mb-3 block text-sm font-medium text-paper/70">Хронометраж</legend>
          <select
            value={durationId}
            onChange={(e) => setDurationId(e.target.value)}
            className={selectClass}
          >
            {DURATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="mb-3 block text-sm font-medium text-paper/70">
            Дополнительно <span className="text-paper/40">(необязательно)</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ADDONS.map((addon) => {
              const checked = addonIds.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                    checked
                      ? "border-rec/60 bg-rec/[0.08] text-paper"
                      : "border-paper/15 bg-paper/[0.03] text-paper/70 hover:border-paper/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-rec"
                  />
                  <span>
                    <span className="block font-medium">{addon.label}</span>
                    <span className="mt-0.5 block text-xs text-paper/45">{addon.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col justify-between border-t border-paper/10 bg-paper/[0.02] p-6 sm:p-8 lg:border-l lg:border-t-0">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-paper/40">
            Ориентировочный бюджет
          </span>
          <div className="mt-3 font-display text-3xl uppercase leading-none text-paper sm:text-4xl">
            {isPremium ? (
              <>от {formatRub(result.min)}</>
            ) : (
              <>
                {formatRub(result.min)}
                {/* /45 rather than /30: this dash is what makes the two
                    numbers read as one range instead of two separate prices,
                    and at 30% it sat under the contrast a display-size glyph
                    needs to be legible. */}
                <span className="text-paper/45"> – </span>
                {formatRub(result.max)}
              </>
            )}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/[0.04] px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-glow">
            Уровень «{result.tier}»
          </div>

          <p className="mt-5 text-sm leading-relaxed text-paper/55">
            Это ориентировочный расчёт для планирования бюджета. Точную смету
            мы готовим индивидуально после короткого брифа — исходя из
            локации, количества смен и объёма материалов.
          </p>
        </div>

        <a
          href="/#contact"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-rec px-6 py-3.5 text-center text-sm font-medium text-white transition hover:bg-rec-light"
        >
          Обсудить проект →
        </a>
      </div>
    </GlassCard>
  );
}
