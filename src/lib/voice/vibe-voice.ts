import { BUDGET_STEPS, type VibeOption } from "@/lib/vibe-quiz";

// Разбор голосовых ответов в вайб-анкете (Егор, 2026-09-29: «чтобы можно
// было голосом отвечать и она тебя уже слышала»): какой вариант назвал
// посетитель, какой бюджет, «дальше» это или «назад». Всё на простых
// правилах, без запроса к ИИ, — отклик мгновенный.

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (s: string) => norm(s).split(" ").filter(Boolean);

export type VibeControl = "next" | "back" | "close" | "start";

const CONTROL: [VibeControl, string[]][] = [
  ["back", ["назад", "вернись", "предыдущ"]],
  ["close", ["закрой", "закрыть", "выйти", "выход"]],
  ["start", ["начать", "начнем", "начинаем", "поехали", "запускай"]],
  ["next", ["дальше", "далее", "следующ", "продолж", "пропусти", "готово", "давай", "окей", "ок", "хорошо"]],
];

/** Служебная команда, если фраза короткая и состоит из неё. */
export function controlOf(text: string): VibeControl | null {
  const w = words(text);
  if (!w.length || w.length > 3) return null;
  for (const [c, keys] of CONTROL) if (w.some((x) => keys.some((k) => x.startsWith(k)))) return c;
  return null;
}

const stem = (w: string) => w.slice(0, Math.min(5, Math.max(3, w.length - 1)));
const SYN: Record<string, string> = { смм: "smm", эсэмэм: "smm", ии: "ai", аи: "ai", эйай: "ai" };

const ORDINALS: string[][] = [
  ["первый", "первое", "первая", "первую", "один", "а", "a"],
  ["второй", "второе", "вторая", "вторую", "два", "б", "b"],
  ["третий", "третье", "третья", "третью", "три", "в", "v"],
  ["четвертый", "четвертое", "четвертая", "четвертую", "четыре", "г", "g"],
  ["пятый", "пятое", "пятая", "пятую", "пять", "д", "d"],
  ["шестой", "шестое", "шестая", "шестую", "шесть"],
];
const FILLER = new Set(["вариант", "номер", "и", "давай", "выбираю", "мне", "нужен", "нужно", "хочу"]);

/** Индексы вариантов, которые назвал посетитель: по номеру или букве
 *  («вариант б», «третий») или по словам из подписи («сайт», «медицина»). */
export function matchOptions(text: string, options: VibeOption[]): number[] {
  const heard = words(text).map((w) => SYN[w] ?? w);
  if (!heard.length) return [];

  // Номер: вся фраза — порядковые числительные и связки.
  const nums = heard.filter((w) => !FILLER.has(w));
  if (nums.length && nums.every((w) => ORDINALS.some((o) => o.includes(w)))) {
    const out: number[] = [];
    for (const w of nums) {
      const i = ORDINALS.findIndex((o) => o.includes(w));
      if (i < options.length && !out.includes(i)) out.push(i);
    }
    if (out.length) return out;
  }

  const heardStems = new Set(heard.filter((w) => w.length >= 3 || w === "ai").map(stem));
  const out: number[] = [];
  options.forEach((o, i) => {
    const tokens = words(o.label)
      .map((w) => SYN[w] ?? w)
      .filter((w) => w.length >= 3 || w === "ai" || w === "smm");
    if (tokens.some((t) => heardStems.has(stem(t)))) out.push(i);
  });
  return out;
}

const NUM: Record<string, number> = {
  пять: 5, десять: 10, пятнадцать: 15, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50,
  шестьдесят: 60, семьдесят: 70, восемьдесят: 80, девяносто: 90, сто: 100, двести: 200,
  триста: 300, четыреста: 400, пятьсот: 500, шестьсот: 600, семьсот: 700, восемьсот: 800, девятьсот: 900,
};

/** Бюджет из фразы («сто пятьдесят тысяч», «300 тыс», «миллион») —
 *  ближайший шаг ползунка. */
export function parseBudget(text: string): number | null {
  const n = norm(text);
  let k: number | null = null;
  if (/пол ?миллиона/.test(n)) k = 500;
  else if (/миллион|млн/.test(n)) {
    const m = n.match(/(\d+)\s*(?:миллион|млн)/);
    k = (m ? Number(m[1]) : 1) * 1000;
  } else {
    const d = n.match(/\d[\d ]*/);
    if (d) {
      const v = Number(d[0].replace(/ /g, ""));
      k = v >= 1000 ? v / 1000 : v;
    } else {
      let sum = 0;
      for (const w of n.split(" ")) sum += NUM[w] ?? 0;
      if (sum) k = sum;
    }
  }
  if (!k || k <= 0) return null;
  const rub = k * 1000;
  return BUDGET_STEPS.reduce((best, s) => (Math.abs(s - rub) < Math.abs(best - rub) ? s : best), BUDGET_STEPS[0]);
}
