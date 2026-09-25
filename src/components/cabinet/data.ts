import type { CabinetState } from "./store";

// Каталог и рекомендации демо-кабинета. Рекомендации — по ответам из
// чата с человеком команды (решение Егора): сказал «собирать заявки» —
// Таня предлагает запуск с рекламой, «каталог» — Вадим предлагает
// AI-фото товаров и так далее. Цен нет — только после брифа.

export type CabinetService = { id: string; title: string; desc: string; memberId: string };

export const SERVICES: CabinetService[] = [
  { id: "ai-video", title: "AI-ролик для главной", desc: "15 секунд из твоих же фото — за пару дней.", memberId: "dima" },
  { id: "kp", title: "КП за вечер", desc: "Коммерческое предложение и 2 концепции под задачу.", memberId: "max" },
  { id: "smm-start", title: "SMM-старт на месяц", desc: "Контент-план, 12 постов, запуск рекламы.", memberId: "tanya" },
  { id: "site", title: "Сайт под ключ", desc: "От концепции до запуска — каждый этап с твоим «ок».", memberId: "sasha" },
  { id: "event", title: "Упаковка события", desc: "Анонс, фото, видео и отчётный ролик.", memberId: "max" },
  { id: "avatar", title: "AI-аватар эксперта", desc: "Цифровой двойник — ролики без съёмок.", memberId: "dima" },
  { id: "agent", title: "AI-агент на неделю", desc: "Бот, который отвечает клиентам за тебя.", memberId: "dima" },
  { id: "photo", title: "Нейрофотосессия", desc: "Фото для сайта и соцсетей без студии.", memberId: "sasha" },
];

export type CabinetRec = { id: string; memberId: string; title: string; text: string };

const RULES: { match: RegExp; rec: CabinetRec }[] = [
  { match: /заявк/i, rec: { id: "rec-ads", memberId: "tanya", title: "Запуск ^с рекламой^", text: "Сайт готовится — давай к запуску подготовим 3 поста и таргет, чтобы заявки пошли с первого дня." } },
  { match: /товар|каталог|магазин/i, rec: { id: "rec-photo", memberId: "dima", title: "AI-фото *для каталога*", text: "Сделаю карточки товаров из фото с телефона — фон, свет, единый стиль." } },
  { match: /ребренд|редизайн/i, rec: { id: "rec-brand", memberId: "max", title: "Новая подача *бренда*", text: "Раз меняем стиль — обновим и соцсети: шапки, обложки, первые посты." } },
  { match: /вчера|горит|неделя/i, rec: { id: "rec-fast", memberId: "egor", title: "Экспресс-запуск ^за неделю^", text: "Раз срок горит — соберу план по дням и параллельную команду." } },
  { match: /работ|портфолио/i, rec: { id: "rec-cases", memberId: "max", title: "Кейсы, *которые продают*", text: "Упакую твои работы в истории «было → стало» — такие читают до конца." } },
];

const DEFAULT_RECS: CabinetRec[] = [
  { id: "rec-video", memberId: "dima", title: "AI-ролик *из твоих фото*", text: "15 секунд для главной или сторис — из твоих же фото." },
  { id: "rec-promo", memberId: "max", title: "Акция ^к запуску^", text: "Придумаю механику и тексты — покажу два варианта за вечер." },
  { id: "rec-smm", memberId: "tanya", title: "Контент-план *на месяц*", text: "Разберу твой профиль и соберу план постов под твою аудиторию." },
];

/** Какие услуги из анкеты «что предлагать» ведут к каким рекомендациям. */
const WANT_TO_MEMBER: Record<string, string> = { Сайт: "sasha", Видео: "dima", "AI-решения": "dima", SMM: "tanya", "Креатив и события": "max" };

export function recommendationsFor(s: CabinetState): CabinetRec[] {
  const said = [...s.orders.flatMap((o) => Object.values(o.answers)), ...s.profile.goals, s.profile.niche ?? ""].join(" · ");
  const picked = RULES.filter((r) => r.match.test(said)).map((r) => r.rec);
  let all = [...picked, ...DEFAULT_RECS].filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
  // Анкета «что предлагать»: если человек выбрал направления, остальное
  // не предлагаем (кроме того, что прямо следует из его ответов в чате).
  if (s.profile.want.length) {
    const allowed = new Set(s.profile.want.map((w) => WANT_TO_MEMBER[w]).filter(Boolean));
    all = all.filter((r) => picked.includes(r) || allowed.has(r.memberId) || r.memberId === "egor");
  }
  return all.filter((r) => !s.dismissed.includes(r.id)).slice(0, 3);
}

export const NICHES = ["Кофейня / ресторан", "Красота", "Эксперт", "Онлайн-школа", "Магазин", "Мероприятия", "Другое"];
export const GOALS = ["Больше заявок", "Рост продаж", "Узнаваемость", "Запуск нового", "Экономия времени"];
export const WANTS = ["Сайт", "Видео", "SMM", "AI-решения", "Креатив и события"];
