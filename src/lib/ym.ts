// Цели Яндекс Метрики. Счётчик ставится компонентом YandexMetrika, если задан
// NEXT_PUBLIC_YM_ID; без него все вызовы молча ничего не делают.
type Ym = (id: number, method: string, ...args: unknown[]) => void;

export function trackGoal(name: string, params?: Record<string, unknown>) {
  try {
    const id = Number(process.env.NEXT_PUBLIC_YM_ID);
    const ym = (window as unknown as { ym?: Ym }).ym;
    if (id && ym) ym(id, "reachGoal", name, params);
  } catch {}
}
