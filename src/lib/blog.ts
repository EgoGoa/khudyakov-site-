import data from "../../content/blog/posts.json";

// Витрина блога в подвале. Материалы лежат в content/blog/posts.json — файл
// раз в неделю обновляет агент (формат в content/blog/README.md). Импорт
// статический, поэтому работает и в статичной сборке для reg.ru.

export type BlogRubric = "cases" | "trends" | "tools" | "team";

export type BlogMetric = { label: string; value: string; percent: number };

export type BlogPost = {
  id: string;
  rubric: BlogRubric;
  title: string;
  excerpt: string;
  date: string;
  readMin?: number;
  url?: string;
  metrics?: BlogMetric[];
};

export const blogRubrics: { key: BlogRubric; label: string; short: string; tone: string }[] = [
  { key: "cases", label: "Кейсы заказов", short: "Кейсы", tone: "#ff6a3d" },
  { key: "trends", label: "Тренды", short: "Тренды", tone: "#00d2ff" },
  { key: "tools", label: "Инструменты", short: "Инструменты", tone: "#c4b5fd" },
  { key: "team", label: "Новости команды", short: "Команда", tone: "#34d399" },
];

const known = new Set<string>(blogRubrics.map((r) => r.key));

export function getBlogPosts(): BlogPost[] {
  return (data.posts as BlogPost[])
    .filter((p) => known.has(p.rubric))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatBlogDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
}
