"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { DirectionTask } from "./types";

// Сквозной ответ посетителя — то, чем персонализируется страница.
//
// Егор назвал персонализацию основной миссией сайта: «чтобы всё можно было
// персонализировать, каждый блок под задачу клиента с минимальными его
// действиями». Поэтому ответы живут не внутри одного виджета, а подняты в
// контекст страницы — на них реагируют сразу несколько блоков.
//
// Воронка из трёх шагов, разнесённых по странице. Один и тот же вопрос,
// повторённый трижды, читался бы как три одинаковые формы заявки; здесь
// каждый следующий шаг спрашивает новое и углубляет персонализацию:
//
//   1. Задача       — зачем пришли. Меняет смету, кейсы, срок, финал.
//   2. Бюджет и срок — стоит у сметы и пересобирает именно её.
//   3. Материалы     — что у клиента уже есть и чего он ждёт. Меняет
//                      финальное предложение и текст, который уходит в
//                      Telegram.
//
// Ответы никуда не отправляются: у сайта нет ни одного API-роута, и заявка
// ушла бы в никуда. Вместо этого они живут на странице и в конце
// подставляются в готовое сообщение для Telegram — посетитель отправляет его
// сам, одним нажатием, и ничего не теряется.
//
// Выбор осознанно не сохраняется между визитами: это не настройка, а ответ
// на вопрос «зачем вы пришли», и на следующем заходе он может быть другим.

/** Вариант ответа на шаг «бюджет» или «срок». Оба шага устроены одинаково,
 *  поэтому тип один. */
export type PersonaChoice = { id: string; label: string; hint: string };

/** Сколько клиент готов вложить. `tierId` связывает ответ с тарифом сметы —
 *  именно он подсветится ниже. */
export const BUDGET_CHOICES: (PersonaChoice & { tierId?: string })[] = [
  { id: "lean", label: "Минимальный", hint: "Нужен результат в рамках бюджета" },
  { id: "mid", label: "Рабочий", hint: "Готовы платить за качество" },
  { id: "open", label: "Открытый", hint: "Важен результат, не цена" },
];

/** Насколько горит. Строка `timeline` дописывается в блок процесса. */
export const SPEED_CHOICES: (PersonaChoice & { timeline: string })[] = [
  { id: "rush", label: "Горит", hint: "Нужно в ближайшие 2 недели", timeline: "сжатый график, 10–14 дней" },
  { id: "normal", label: "Обычный", hint: "Месяц на всё", timeline: "стандартный график, 3–5 недель" },
  { id: "calm", label: "Не горит", hint: "Готовы к спокойной работе", timeline: "спокойный график, 6–8 недель" },
];

/** Что у клиента уже есть. Множественный выбор: у одного бывает и сайт, и
 *  готовые съёмки. */
export const ASSET_CHOICES: PersonaChoice[] = [
  { id: "site", label: "Сайт", hint: "Есть на что посмотреть" },
  { id: "cases", label: "Работы", hint: "Есть прошлые ролики" },
  { id: "brand", label: "Бренд-гайд", hint: "Есть фирстиль" },
  { id: "footage", label: "Съёмки", hint: "Есть исходники" },
  { id: "none", label: "Пока ничего", hint: "Начинаем с нуля" },
];

type PersonaState = {
  tasks: DirectionTask[];
  /** null — посетитель ещё не выбирал; страница показывает всё по умолчанию. */
  active: DirectionTask | null;
  select: (id: string | null) => void;

  budget: string | null;
  speed: string | null;
  setBudget: (id: string) => void;
  setSpeed: (id: string) => void;

  assets: string[];
  toggleAsset: (id: string) => void;
  /** Свободная строка: ссылка на сайт, работы или пара слов об ожиданиях. */
  note: string;
  setNote: (v: string) => void;

  /** Сколько шагов воронки пройдено — по этому числу блоки решают,
   *  насколько подробно говорить. */
  answered: number;
  /** Готовое сообщение для Telegram из всех ответов. */
  summary: () => string;
};

const PersonaCtx = createContext<PersonaState>({
  tasks: [],
  active: null,
  select: () => {},
  budget: null,
  speed: null,
  setBudget: () => {},
  setSpeed: () => {},
  assets: [],
  toggleAsset: () => {},
  note: "",
  setNote: () => {},
  answered: 0,
  summary: () => "",
});

export function useDirectionTask() {
  return useContext(PersonaCtx);
}

export function DirectionTaskProvider({
  // Значение по умолчанию, а не просто тип: направление без списка задач —
  // допустимый случай (персонализация опциональна), и падать всей страницей
  // из-за его отсутствия провайдер не должен.
  tasks = [],
  title = "",
  children,
}: {
  tasks?: DirectionTask[];
  /** Название направления — уходит первой строкой в сообщение Telegram,
   *  иначе непонятно, с какой страницы пришёл человек. */
  title?: string;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [budget, setBudgetId] = useState<string | null>(null);
  const [speed, setSpeedId] = useState<string | null>(null);
  const [assets, setAssets] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const active = useMemo(() => tasks.find((t) => t.id === activeId) ?? null, [tasks, activeId]);

  // Повторное нажатие на выбранный ответ снимает его — иначе из
  // персонализации невозможно выйти, не перезагрузив страницу.
  const select = useCallback((id: string | null) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);
  const setBudget = useCallback((id: string) => {
    setBudgetId((prev) => (prev === id ? null : id));
  }, []);
  const setSpeed = useCallback((id: string) => {
    setSpeedId((prev) => (prev === id ? null : id));
  }, []);

  const toggleAsset = useCallback((id: string) => {
    setAssets((prev) => {
      // «Пока ничего» исключает всё остальное и наоборот: одновременно
      // «есть сайт» и «нет ничего» — противоречие, которое потом пришлось бы
      // разбирать в переписке.
      if (id === "none") return prev.includes("none") ? [] : ["none"];
      const rest = prev.filter((a) => a !== "none");
      return rest.includes(id) ? rest.filter((a) => a !== id) : [...rest, id];
    });
  }, []);

  const answered = [active, budget ?? speed, assets.length || note].filter(Boolean).length;

  const summary = useCallback(() => {
    const lines = [`Здравствуйте! Пишу со страницы «${title}».`];
    if (active) lines.push(`Задача: ${active.label} — ${active.hint}.`);
    if (budget) {
      const b = BUDGET_CHOICES.find((c) => c.id === budget);
      if (b) lines.push(`Бюджет: ${b.label.toLowerCase()} — ${b.hint.toLowerCase()}.`);
    }
    if (speed) {
      const s = SPEED_CHOICES.find((c) => c.id === speed);
      if (s) lines.push(`Срок: ${s.hint.toLowerCase()}.`);
    }
    if (assets.length) {
      const names = assets
        .map((id) => ASSET_CHOICES.find((c) => c.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      lines.push(`У меня уже есть: ${names}.`);
    }
    if (note.trim()) lines.push(`Ссылка и ожидания: ${note.trim()}`);
    return lines.join("\n");
  }, [title, active, budget, speed, assets, note]);

  const value = useMemo<PersonaState>(
    () => ({
      tasks,
      active,
      select,
      budget,
      speed,
      setBudget,
      setSpeed,
      assets,
      toggleAsset,
      note,
      setNote,
      answered,
      summary,
    }),
    [
      tasks,
      active,
      select,
      budget,
      speed,
      setBudget,
      setSpeed,
      assets,
      toggleAsset,
      note,
      answered,
      summary,
    ]
  );

  return <PersonaCtx.Provider value={value}>{children}</PersonaCtx.Provider>;
}
