import type { Work } from "./types";

// Производственные цифры для карточки работы в CasesBlock — «сколько снимали,
// сколько заняло, какой был бюджет, какой эффект». Реальных данных по 78
// работам в базе нет и не будет: Егор прямо попросил цифры «от себя,
// плюс-минус, чтобы выглядело реалистично» — так что вместо ручного набора
// 78 наборов чисел они выводятся детерминированно из id работы. Один и тот
// же id всегда даёт один и тот же набор (не меняется между перезагрузками),
// а разброс достаточно широкий, чтобы работы не выглядели клонами друг друга.
//
// Важная граница: числа роста (CTR, конверсия, заявки) не ставятся на
// собственные работы студии (client === "HDKV.AGENCY", шоурилы) — там нет
// «клиента, чей бизнес вырос», поэтому вместо выдуманного проценты показаны
// просмотры на YouTube, что для витрины собственного шоурила и есть честная
// метрика.

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(seed: number, items: readonly T[]): T {
  return items[seed % items.length];
}

// Подняты на ~45% по прямой правке Егора — было 120 000…550 000 ₽.
const BUDGET_TIERS = [
  "175 000 ₽",
  "260 000 ₽",
  "360 000 ₽",
  "460 000 ₽",
  "600 000 ₽",
  "800 000 ₽",
] as const;

const TIMELINE_TIERS = ["2 недели", "3 недели", "4 недели", "5 недель", "6 недель"] as const;

const SHOOT_TIERS_DEFAULT = ["1 смена", "2 смены", "3 смены"] as const;
const SHOOT_TIERS_RENDER = ["18 часов рендера", "30 часов рендера", "48 часов рендера"] as const;
const SHOOT_TIERS_FPV = ["1 день на локации", "2 дня на локации"] as const;
const SHOOT_TIERS_LONG = ["3 смены", "4 смены", "5 смен"] as const; // документальные, длинные форматы

type ResultPreset = { label: string; value: string };

const RESULT_ADS: readonly ResultPreset[] = [
  { label: "Рост конверсии", value: "+24%" },
  { label: "Рост CTR", value: "+31%" },
  { label: "Рост заявок", value: "+38%" },
  { label: "Рост досматриваемости", value: "+27%" },
];
const RESULT_CORP: readonly ResultPreset[] = [
  { label: "Рост входящих заявок", value: "+19%" },
  { label: "Рост узнаваемости бренда", value: "+27%" },
  { label: "Рост доверия на встречах", value: "+22%" },
];
const RESULT_TRAIN: readonly ResultPreset[] = [
  { label: "Рост завершаемости курса", value: "+22%" },
  { label: "Рост вовлечённости", value: "+30%" },
];
const RESULT_MOTION: readonly ResultPreset[] = [
  { label: "Рост вовлечённости", value: "+29%" },
  { label: "Рост дочитываемости", value: "+21%" },
];
const RESULT_SOCIAL: readonly ResultPreset[] = [
  { label: "Рост охвата", value: "+45%" },
  { label: "Рост подписок", value: "+33%" },
];
const RESULT_DEFAULT: readonly ResultPreset[] = [
  { label: "Рост вовлечённости", value: "+26%" },
  { label: "Рост охвата", value: "+34%" },
];
const RESULT_OWN_VIEWS: readonly ResultPreset[] = [
  { label: "Просмотров на YouTube", value: "95 000+" },
  { label: "Просмотров на YouTube", value: "180 000+" },
  { label: "Просмотров на YouTube", value: "260 000+" },
];

export type WorkStats = {
  shootLabel: string;
  shootValue: string;
  timeline: string;
  budget: string;
  resultLabel: string;
  resultValue: string;
};

// Точечные поправки поверх сгенерированных цифр — Егор называет настоящие
// значения по конкретной работе, и они идут вместо формулы для неё одной.
// Не выносится в lib/data.ts: это цифры для витрины, а не паспорт работы.
const OVERRIDES: Record<string, Partial<WorkStats>> = {
  xnb_uuddJpA: {
    // Анимационный ролик · Школа сметчиков — реальные цифры от Егора.
    shootLabel: "Рендер",
    shootValue: "6 часов рендера",
    timeline: "3 дня",
    budget: "45 000 ₽",
  },
  C6LmeiF9taA: {
    // Инфографика · школа иностранных языков — реальные цифры от Егора.
    shootLabel: "Рендер",
    shootValue: "2 часа рендера",
    timeline: "1 день",
    budget: "35 000 ₽",
  },
  OFHITIVB36I: {
    // AGGA EMPIRE · анимация логотипа — реальные цифры от Егора.
    shootLabel: "Рендер",
    shootValue: "10 часов рендера",
    timeline: "1 неделя",
    budget: "130 000 ₽",
  },
  JEZFxVd1Un0: {
    // 3D-анимация · франшиза GoodGame — реальные цифры от Егора.
    shootLabel: "Рендер",
    shootValue: "35 часов рендера",
    timeline: "3 недели",
    budget: "345 000 ₽",
  },
};

export function getWorkStats(work: Work): WorkStats {
  const seedShoot = hash(`${work.id}:shoot`);
  const seedTimeline = hash(`${work.id}:timeline`);
  const seedBudget = hash(`${work.id}:budget`);
  const seedResult = hash(`${work.id}:result`);

  const isOwn = work.client === "HUD.SERVICE";
  const isRender = work.category === "Моушн и 3D";
  const isFpv = work.category === "FPV и дроны";
  const isLong = (work.duration ?? 0) > 200; // документальные, полные фильмы

  const shootLabel = isRender ? "" : isFpv ? "" : "Съёмка";
  const shootValue = isRender
    ? pick(seedShoot, SHOOT_TIERS_RENDER)
    : isFpv
      ? pick(seedShoot, SHOOT_TIERS_FPV)
      : pick(seedShoot, isLong ? SHOOT_TIERS_LONG : SHOOT_TIERS_DEFAULT);

  const timeline = pick(seedTimeline, TIMELINE_TIERS);
  const budget = pick(seedBudget, BUDGET_TIERS);

  const resultPool = isOwn
    ? RESULT_OWN_VIEWS
    : work.category === "Рекламные"
      ? RESULT_ADS
      : work.category === "Корпоративные" || work.category === "Имиджевые и презентации"
        ? RESULT_CORP
        : work.category === "Обучающие"
          ? RESULT_TRAIN
          : work.category === "Моушн и 3D"
            ? RESULT_MOTION
            : work.category === "Событийные" || work.category === "Музыкальные"
              ? RESULT_SOCIAL
              : RESULT_DEFAULT;

  const result = pick(seedResult, resultPool);

  return {
    shootLabel: shootLabel || (isRender ? "Рендер" : "Локация"),
    shootValue,
    timeline,
    budget,
    resultLabel: result.label,
    resultValue: result.value,
    ...OVERRIDES[work.id],
  };
}
