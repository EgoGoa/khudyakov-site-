import { PAGE_BLOCKS, type PageBlock } from "@/components/layout/page-sections";
import { aiToolLinks, aiToolMeta } from "@/components/home/direction/toolRegistry";
import { ringOf } from "@/components/home/direction/siblings";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import type { SectionIconName } from "@/components/ui/SectionIcon";

// Поиск по сайту (Егор, 2026-10-09): одна строка ведёт в любую страницу,
// раздел и действие. Всё считается на месте, без сети: база — несколько
// десятков пунктов, собранных из тех же списков, что меню и крошки, так что
// новая страница формата появляется в поиске сама.
//
// Как подбирается: каждое слово запроса ищется по началу слов названия,
// синонимов и подписи («лен» → «Лендинг»), потом внутри слов, потом с
// опечаткой. Набранное не в той раскладке («ыьь») переводится и тоже ищется.
// Итог умножается на важность пункта — сверху то, что чаще нужно.

export type SearchGroup = ServiceKey | "contact" | "pages";
export type SearchAction = "call" | "telegram" | "whatsapp" | "lead" | "cabinet" | "install";

export type SearchEntry = {
  id: string;
  title: string;
  sub: string;
  /** Куда ведёт: страница или `/страница#глава`. Нет — значит действие. */
  href?: string;
  act?: SearchAction;
  group: SearchGroup;
  icon: SectionIconName | "telegram" | "whatsapp" | "phone";
  /** Синонимы и разговорные слова через пробел: «лендос», «таргет». */
  keys?: string;
  /** Важность 0–100: при равном совпадении выше то, что нужнее. */
  rank: number;
};

export const GROUP_LABEL: Record<SearchGroup, string> = {
  content: "Контент",
  ai: "AI",
  sites: "Сайты",
  smm: "SMM",
  contact: "Связь",
  pages: "Страницы",
};

export const PHONE_HREF = "tel:+79925111812";
export const TELEGRAM_URL = "https://t.me/hdkv";
export const WHATSAPP_URL = "https://wa.me/79925111812";

const DIRECTION_KEYS: Record<ServiceKey, string> = {
  content: "контент видео съемка съёмка продакшн продакшен ролик ролики монтаж видеопродакшн клип",
  ai: "ai ии аи ай нейросеть нейросети искусственный интеллект автоматизация бот боты",
  sites: "сайт сайты разработка веб web вайб vibe создание сайта",
  smm: "smm смм соцсети социальные сети ведение инстаграм instagram вк вконтакте продвижение",
};

const DIRECTION_SUB: Record<ServiceKey, string> = {
  content: "Съёмка, монтаж и графика под площадку",
  ai: "Внедряем ИИ туда, где он ускоряет результат",
  sites: "Сайты на AI — дни, а не месяцы",
  smm: "Ведение и продвижение силами продакшена",
};

// Синонимы глав по смыслу id — у разных страниц одна роль зовётся по-разному.
const CHAPTER_KEYS: Record<string, string> = {
  close: "цена цены стоимость сколько стоит тариф тарифы прайс пакет пакеты заявка заказать",
  contact: "цена цены стоимость сколько стоит прайс заявка заказать",
  process: "этапы шаги процесс как работаете как проходит сроки",
  guarantees: "гарантии условия договор что входит",
  portfolio: "портфолио кейсы примеры работы",
  works: "портфолио кейсы примеры работы",
  why: "почему преимущества отличия опыт",
  trust: "почему преимущества отличия опыт доверие",
  offer: "услуги что делаете возможности",
  services: "услуги что делаете возможности",
  segments: "кому подходит ниша бизнес сегменты",
  method: "метод кому подходит сравнение",
};

const FORMAT_INFO: Record<string, { sub: string; keys: string; rank: number; icon: SectionIconName }> = {
  "/sites/landing": {
    sub: "Одна страница под рекламу и заявки",
    keys: "лендинг лендос посадочная одностраничник landing промо страница",
    rank: 80,
    icon: "browserCursor",
  },
  "/sites/card": { sub: "Компания и услуги на одной-двух страницах", keys: "визитка сайт визитка", rank: 60, icon: "layout" },
  "/sites/turnkey": {
    sub: "Многостраничный сайт с интеграциями",
    keys: "под ключ корпоративный многостраничный магазин интернет-магазин каталог",
    rank: 80,
    icon: "rocket",
  },
  "/sites/assistant": { sub: "Чат-ассистент, который отвечает на сайте", keys: "чат бот ассистент консультант на сайт", rank: 55, icon: "robot" },
  "/sites/redesign": { sub: "Обновим старый сайт без потери позиций", keys: "редизайн обновить переделать старый сайт", rank: 55, icon: "wand" },
  "/smm/reels": { sub: "Короткие вертикальные ролики", keys: "рилс рилсы reels шортс shorts вертикальные клипы", rank: 75, icon: "phoneCam" },
  "/smm/stories": { sub: "Истории, которые досматривают", keys: "сторис сториз истории stories", rank: 55, icon: "phoneCam" },
  "/smm/carousel": { sub: "Посты-слайды, которые сохраняют", keys: "карусель карусели посты слайды", rank: 50, icon: "gallery" },
  "/smm/ads": { sub: "Реклама в соцсетях на вашу аудиторию", keys: "таргет таргетинг таргетолог реклама в соцсетях ads", rank: 70, icon: "growth" },
  "/smm/bloggers": { sub: "Интеграции и посевы у блогеров", keys: "блогеры блогер инфлюенсеры интеграции посевы", rank: 55, icon: "badge" },
  "/content/presentation": { sub: "Фильм о компании и продукте", keys: "презентация презентационный фильм о компании корпоративный", rank: 60, icon: "moviecam" },
  "/content/advertising": { sub: "Рекламные ролики под площадку", keys: "реклама рекламный ролик видеореклама коммерческий", rank: 70, icon: "clapper" },
  "/content/image": { sub: "Ролик, который строит бренд", keys: "имидж имиджевый бренд брендовый", rank: 55, icon: "trophy" },
  "/content/ai-video": { sub: "Видео на нейросетях", keys: "ai видео нейровидео нейросеть генерация ии", rank: 60, icon: "chip" },
  "/content/graphics": { sub: "Анимация, моушн-дизайн и 3D", keys: "моушн motion 3d анимация графика", rank: 55, icon: "wand" },
};

const AI_TOOL_KEYS: Record<string, string> = {
  "chat-hub": "чат бот мессенджеры телеграм вотсап whatsapp telegram",
  agent: "агент заявки лиды бот продажи менеджер",
  content: "карточки маркетплейс маркетплейсы wildberries ozon вб озон инфографика",
  video: "видео аватар аватары реклама",
  voice: "озвучка перевод дубляж локализация голос",
  ops: "процессы документы расшифровка отчеты",
  comms: "спам фильтр обращения",
  crm: "crm срм амо amocrm битрикс сделки",
  personalization: "персонализация сегменты рассылки",
  analytics: "аналитика отчеты дашборд",
  training: "обучение команды курс",
};

function buildIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];

  // Четыре направления — главное на сайте.
  serviceOrder.forEach((k) => {
    out.push({
      id: `dir-${k}`,
      title: serviceMeta[k].label,
      sub: DIRECTION_SUB[k],
      href: `/${serviceMeta[k].slug}`,
      group: k,
      icon: ({ content: "clapper", ai: "robot", sites: "browserCursor", smm: "phoneCam" } as const)[k],
      keys: DIRECTION_KEYS[k],
      rank: 90,
    });
  });

  // Главы каждой страницы направления.
  serviceOrder.forEach((k) => {
    const slug = serviceMeta[k].slug;
    (PAGE_BLOCKS[`/${slug}`] ?? []).forEach((b: PageBlock, i) => {
      if (i === 0) return; // первая глава — это сама страница
      const price = b.id === "close" || b.id === "contact";
      out.push({
        id: `ch-${k}-${b.id}`,
        title: price ? `${b.label} · ${GROUP_LABEL[k]}` : b.label,
        sub: `${serviceMeta[k].label} · ${b.description}`,
        href: `/${slug}#${b.id}`,
        group: k,
        icon: b.icon,
        keys: `${CHAPTER_KEYS[b.id] ?? ""} ${DIRECTION_KEYS[k]}`,
        rank: price ? 62 : 35,
      });
    });
  });

  // Форматы и инструменты внутри направлений.
  (["content", "sites", "smm"] as const).forEach((k) => {
    ringOf(k).forEach((s) => {
      const info = FORMAT_INFO[s.href];
      out.push({
        id: `fmt-${s.href}`,
        title: s.label,
        sub: `${serviceMeta[k].label} · ${info?.sub ?? ""}`,
        href: s.href,
        group: k,
        icon: info?.icon ?? "layout",
        keys: info?.keys,
        rank: info?.rank ?? 50,
      });
    });
  });
  aiToolLinks.forEach((t) => {
    const meta = aiToolMeta[t.slug];
    out.push({
      id: `ai-${t.slug}`,
      title: t.label,
      sub: `AI-решения · ${meta?.title ?? ""}`,
      href: `/ai/${t.slug}`,
      group: "ai",
      icon: "chip",
      keys: `${AI_TOOL_KEYS[t.slug] ?? ""} ${meta?.title ?? ""}`,
      rank: t.slug === "agent" ? 72 : 50,
    });
  });

  // Общие страницы.
  const pages: Omit<SearchEntry, "group">[] = [
    {
      id: "price",
      title: "Узнать цену",
      sub: "Калькулятор: бюджет по формату и срокам",
      href: "/calculator",
      icon: "calculator",
      keys: "цена цены стоимость сколько стоит калькулятор рассчитать посчитать бюджет прайс",
      rank: 100,
    },
    { id: "works", title: "Все работы", sub: "Портфолио: 78 работ с фильтрами", href: "/works", icon: "catalog", keys: "работы портфолио кейсы примеры шоурил showreel", rank: 85 },
    { id: "brief", title: "Бриф", sub: "Опишите задачу — с этого начинается работа", href: "/brief", icon: "brief", keys: "бриф анкета тз техническое задание", rank: 65 },
    { id: "brief-ai", title: "Бриф на AI-решение", sub: "AI-решения · бриф", href: "/brief/ai", icon: "brief", keys: "бриф анкета ai ии", rank: 40 },
    { id: "brief-sites", title: "Бриф на сайт", sub: "Vibe сайты · бриф", href: "/brief/sites", icon: "brief", keys: "бриф анкета сайт тз", rank: 45 },
    { id: "brief-smm", title: "Бриф на SMM", sub: "SMM · бриф", href: "/brief/smm", icon: "brief", keys: "бриф анкета smm смм", rank: 40 },
    { id: "brief-hotel", title: "Бриф на видео для отеля", sub: "Создание контента · бриф", href: "/brief/hotel-video", icon: "brief", keys: "бриф отель гостиница видео", rank: 30 },
    { id: "smm-cases", title: "Кейсы SMM", sub: "SMM · результаты проектов", href: "/smm/cases", icon: "gallery", keys: "кейсы примеры результаты smm смм", rank: 55 },
    { id: "smm-pricing", title: "Цены на SMM", sub: "SMM · пакеты ведения", href: "/smm/pricing", icon: "tiers", keys: "цена цены стоимость тарифы пакеты smm смм ведение", rank: 66 },
    { id: "offer", title: "Твой лендинг", sub: "Предложение", href: "/offer", icon: "gift", keys: "лендинг предложение оффер", rank: 30 },
    { id: "bonus", title: "Подарок за регистрацию", sub: "Бонус", href: "/bonus", icon: "gift", keys: "подарок бонус регистрация скидка", rank: 35 },
    { id: "cabinet", title: "Личный кабинет", sub: "Рекомендации команды и ваши заявки", act: "cabinet", icon: "cabinet", keys: "кабинет профиль аккаунт войти вход", rank: 45 },
    { id: "install", title: "Поставить HUD на экран", sub: "Сайт как приложение на телефоне", act: "install", icon: "install", keys: "приложение установить иконка на экран", rank: 20 },
    { id: "privacy", title: "Конфиденциальность", sub: "Политика обработки данных", href: "/privacy", icon: "shieldCheck", keys: "политика конфиденциальность персональные данные", rank: 5 },
    { id: "terms", title: "Условия", sub: "Пользовательское соглашение", href: "/terms", icon: "shieldCheck", keys: "условия соглашение оферта", rank: 5 },
  ];
  pages.forEach((p) => out.push({ ...p, group: "pages" }));

  const contact: Omit<SearchEntry, "group">[] = [
    { id: "lead", title: "Оставить заявку", sub: "Перезвоним и всё обсудим", act: "lead", icon: "brief", keys: "заявка заказать связаться обратный звонок консультация перезвонить", rank: 95 },
    { id: "telegram", title: "Написать в Telegram", sub: "@hdkv", act: "telegram", icon: "telegram", keys: "телеграм телеграмм тг telegram написать чат", rank: 70 },
    { id: "whatsapp", title: "Написать в WhatsApp", sub: "+7 992 511-18-12", act: "whatsapp", icon: "whatsapp", keys: "ватсап вотсап вацап whatsapp написать", rank: 60 },
    { id: "call", title: "Позвонить", sub: "+7 992 511-18-12", act: "call", icon: "phone", keys: "позвонить звонок телефон номер контакты", rank: 60 },
  ];
  contact.forEach((c) => out.push({ ...c, group: "contact" }));

  return out;
}

let cache: SearchEntry[] | null = null;
export function searchIndex(): SearchEntry[] {
  return (cache ??= buildIndex());
}

/** Пусто в строке: что показать первым, по важности. */
export const POPULAR_IDS = ["price", "fmt-/sites/turnkey", "fmt-/sites/landing", "fmt-/smm/reels", "ai-agent", "works", "lead"];

// ---------- подбор ----------

export function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
const RU = "йцукенгшщзхъфывапролджэячсмитьбюё";
/** Тот же набор клавиш в другой раскладке: «ыьь» ↔ «smm». */
export function swapLayout(s: string) {
  return [...s.toLowerCase()]
    .map((ch) => {
      const i = EN.indexOf(ch);
      if (i >= 0) return RU[i];
      const j = RU.indexOf(ch);
      return j >= 0 ? EN[j] : ch;
    })
    .join("");
}

/** Расстояние с перестановкой соседних букв (опечатки «лнединг»). */
function distance(a: string, b: string) {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Насколько слово запроса похоже на слово текста (0 — никак). */
function wordScore(t: string, w: string) {
  if (w === t) return 10;
  if (w.startsWith(t)) return 7 + 2 * (t.length / w.length);
  if (t.length >= 3 && w.includes(t)) return 4;
  if (t.length >= 4) {
    const allowed = t.length >= 7 ? 2 : 1;
    // Опечатка в начале слова: сравниваем с началом той же длины (±1).
    for (const len of [t.length, t.length - 1, t.length + 1]) {
      if (len < 3 || len > w.length) continue;
      if (distance(t, w.slice(0, len)) <= allowed) return len === w.length ? 5 : 3.5;
    }
  }
  return 0;
}

type Prepared = { e: SearchEntry; title: string[]; keys: string[]; sub: string[] };
let prepared: Prepared[] | null = null;
function prep(): Prepared[] {
  return (prepared ??= searchIndex().map((e) => ({
    e,
    title: norm(e.title).split(" "),
    keys: norm(`${e.keys ?? ""} ${GROUP_LABEL[e.group]}`).split(" ").filter(Boolean),
    sub: norm(e.sub).split(" ").filter(Boolean),
  })));
}

function tokenScore(t: string, p: Prepared) {
  let best = 0;
  for (const w of p.title) best = Math.max(best, wordScore(t, w));
  for (const w of p.keys) best = Math.max(best, wordScore(t, w) * 0.85);
  for (const w of p.sub) best = Math.max(best, wordScore(t, w) * 0.5);
  return best;
}

function scoreTokens(tokens: string[], p: Prepared) {
  let sum = 0;
  for (const t of tokens) {
    const s = tokenScore(t, p);
    if (!s) return 0; // каждое слово запроса должно найтись
    sum += s;
  }
  return sum;
}

export type SearchHit = { e: SearchEntry; score: number };

export function search(query: string): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const variants = [q];
  const swapped = norm(swapLayout(query));
  if (swapped && swapped !== q) variants.push(swapped);
  const hits: SearchHit[] = [];
  for (const p of prep()) {
    let best = 0;
    for (const v of variants) best = Math.max(best, scoreTokens(v.split(" "), p) * (v === q ? 1 : 0.9));
    if (best > 0) hits.push({ e: p.e, score: best * (1 + p.e.rank / 60) });
  }
  return hits.sort((a, b) => b.score - a.score);
}

/** Где в названии подсветить набранное: начало слова, совпавшего с
 *  первым словом запроса (или с ним же в другой раскладке). */
export function highlight(title: string, query: string): [number, number] | null {
  const lower = title.toLowerCase().replace(/ё/g, "е");
  for (const v of [norm(query), norm(swapLayout(query))]) {
    const t = v.split(" ")[0];
    if (!t) continue;
    const re = new RegExp(`(^|[^a-zа-я0-9])(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`);
    const m = re.exec(lower);
    if (m) {
      const start = m.index + m[1].length;
      return [start, start + t.length];
    }
  }
  return null;
}

// ---------- недавние ----------

const RECENT_KEY = "hdkv_search_recent";
export function readRecent(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
}
export function pushRecent(id: string) {
  try {
    const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 3);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* без хранилища — просто без «Недавних» */
  }
}

export const OPEN_SEARCH_EVENT = "hdkv:open-search";
/** Открыть поиск. Вызывать прямо из обработчика нажатия: на iPhone
 *  клавиатура выезжает, только если поле получило фокус в том же жесте. */
export const openSearch = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
