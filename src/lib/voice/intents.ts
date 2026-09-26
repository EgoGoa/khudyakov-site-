import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { blocksFor, type BlockCard, type BlockRole } from "@/lib/welcome-blocks";

// Голосовой ассистент: понимание фразы на месте, без сети и мгновенно.
//
// Не список точных команд, а разбор по смыслу (Егор: «чтобы она была
// умной, по тегам определяла, что я прошу»). Каждое намерение описано
// набором тегов — корней слов, которые распознавание отдаёт в любых
// падежах и формах; из фразы отдельно достаются «сущности» — раздел
// сайта, блок, номер главы. Дальше порядок разбора решает, что важнее:
// «позвони по поводу сайта» — это звонок, а не переход в «Сайты».
//
// null — это не команда, а вопрос: его отдаём ИИ (/api/voice).

export type VoiceAction =
  | { type: "route"; href: string }
  | { type: "step"; delta: 1 | -1 }
  | { type: "page"; delta: 1 | -1 }
  | { type: "top" }
  | { type: "bottom" }
  | { type: "undo" }
  | { type: "repeat" }
  | { type: "call" }
  | { type: "telegram" }
  | { type: "whatsapp" }
  | { type: "vibe" }
  | { type: "menu" }
  | { type: "close" }
  | { type: "stop" }
  | { type: "none" };

export type VoiceReply = { say: string; action: VoiceAction };

export const CONTACTS = {
  phone: "+79925111812",
  telegram: "https://t.me/hdkv",
  whatsapp: "https://wa.me/79925111812",
};

export function normalize(text: string) {
  return ` ${text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

// ---------- теги ----------
//
// Тег без пробела — корень: совпадает с началом любого слова фразы
// («позвон» ловит «позвони», «позвонить», «позвоните»). Тег с пробелом —
// кусок фразы целиком («как было»). Тег с «=» — слово ровно целиком
// («=пока», чтобы не ловить «покажи»).

type Phrase = { text: string; words: string[] };

function phrase(raw: string): Phrase {
  const text = normalize(raw);
  return { text, words: text.trim().split(" ").filter(Boolean) };
}

function hit(p: Phrase, tag: string) {
  if (tag.startsWith("=")) return p.words.includes(tag.slice(1));
  if (tag.includes(" ")) return p.text.includes(` ${tag} `) || p.text.includes(` ${tag}`);
  return p.words.some((w) => w.startsWith(tag));
}

const any = (p: Phrase, tags: string[]) => tags.some((t) => hit(p, t));
const count = (p: Phrase, tags: string[]) => tags.reduce((n, t) => n + (hit(p, t) ? 1 : 0), 0);

const T = {
  stop: ["выключ", "отключ", "замолч", "хватит", "=стоп", "=пока", "до свидан", "не слушай", "перестань слуш"],
  help: ["умееш", "помощ", "=помоги", "команд", "что можно сказ", "что ты можешь", "как тобой"],
  repeat: ["повтор", "еще раз скаж", "не расслыш", "не услыш", "что ты сказ"],
  undo: ["отмен", "=верни", "вернуть", "как было", "=обратно", "передумал", "не туда", "не то"],
  close: ["закрой окн", "закрой чат", "скрой", "спрячь", "убери окн", "сверни"],
  call: ["позвон", "звонок", "=звони", "набер", "набрат", "телефон", "созвон", "дозвон"],
  whatsapp: ["ватсап", "вотсап", "whatsapp", "вацап", "ватсапп"],
  telegram: ["телеграм", "телег", "telegram", "напиш", "написат", "личк", "в чат", "сообщени"],
  brief: ["заявк", "бриф", "заказат", "закажу", "оформ", "оставит", "хочу заказ", "обсудить проект", "начать проект"],
  vibe: ["подбер", "анкет", "персональн", "вайб", "vibe", "под меня", "под мою", "индивидуальн", "предложени"],
  menu: ["=меню", "навигац", "все раздел", "список раздел", "содержани"],
  top: ["наверх", "в начало", "к началу", "самый верх", "первый экран", "на главн"],
  bottom: ["в конец", "самый низ", "в самый конец", "до конца", "к концу"],
  next: ["дальш", "далее", "вперед", "следующ", "листа", "листни", "=вниз", "продолж", "=еще", "мотай", "крути", "ниже", "потом"],
  prev: ["назад", "предыдущ", "вернись", "=вверх", "выше", "прошл", "раньше", "обратн"],
  pageWord: ["страниц", "раздел", "направлени", "услуг"],
  blockWord: ["блок", "глав", "слайд", "экран", "пункт", "номер", "част"],
  nav: ["откр", "покаж", "показ", "перейд", "переход", "перейти", "пойд", "пошли", "давай", "хочу", "веди", "включ", "зайд", "глян", "посмотр", "интерес", "где ", "найд", "расскаж про", "отведи", "перекин"],
  question: [
    "=как", "=что", "=чем", "=почему", "=зачем", "можно ли", "=можете", "=умеете", "=сколько", "=какой", "=какие", "=какая",
    "=кто", "=когда", "=нужен", "=нужно ли", "объясн", "подскаж", "посовет", "=ли", "расскажи о", "расскажи мне",
  ],
};

// Разделы сайта — по смыслу, а не по названию страницы.
const SERVICE_TAGS: Record<ServiceKey, string[]> = {
  content: ["контент", "видео", "съемк", "=снять", "сним", "ролик", "продакшн", "продакшен", "фильм", "монтаж", "клип", "реклам", "фото"],
  ai: ["=ии", "=ai", "=аи", "эйай", "искусствен", "нейросет", "нейронк", "аватар", "автоматиз", "бот", "gpt", "чатбот"],
  sites: ["сайт", "лендинг", "=веб", "визитк", "интернет-магазин", "магазин", "страничк"],
  smm: ["=смм", "=smm", "соцсет", "социальн", "инстаграм", "инст", "продвижен", "рилс", "reels", "=ведение", "аккаунт", "таргет", "блогер", "вконтакт"],
};

// Блоки глав — по роли, одинаковой на всех страницах.
const ROLE_TAGS: Record<BlockRole, string[]> = {
  intro: ["начало раздел", "о чем", "направлени"],
  works: ["работ", "портфол", "кейс", "пример", "проект", "что делали", "что сделали"],
  why: ["почему вы", "почему мы", "именно вы", "кому подход", "=метод", "магии", "подрядчик", "преимуществ", "отличи"],
  trust: ["продюсерск", "коробк", "довер"],
  offer: ["услуг", "что делает", "что вы делаете", "инструмент", "формат", "лучшие", "что предлага"],
  process: ["процесс", "этап", "как проходит", "как вы работаете", "хронолог", "внедрени", "как работа", "по шагам", "сроки"],
  guarantees: ["гаранти", "договор", "что входит", "обязательств"],
  close: ["цен", "стоимост", "стоит", "тариф", "пакет", "услови", "прайс", "смет", "расчет", "бюджет", "оплат", "деньг", "=сколько"],
};

// Порядковые числа: «третий блок», «к пятому», «глава 4», «номер два».
const ORDINALS: [string[], number][] = [
  [["перв", "=один", "=1"], 1],
  [["втор", "=два", "=2"], 2],
  [["трет", "=три", "=3"], 3],
  [["четв", "четыр", "=4"], 4],
  [["пят", "=5"], 5],
  [["шест", "=6"], 6],
  [["седьм", "=семь", "=7"], 7],
  [["восьм", "=восемь", "=8"], 8],
];

export function serviceFromPath(pathname: string): ServiceKey | null {
  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  return serviceOrder.find((k) => serviceMeta[k].slug === slug) ?? null;
}

function findService(p: Phrase): ServiceKey | null {
  let best: ServiceKey | null = null;
  let score = 0;
  for (const key of serviceOrder) {
    const n = count(p, SERVICE_TAGS[key]);
    if (n > score) {
      score = n;
      best = key;
    }
  }
  return best;
}

function findBlock(p: Phrase, service: ServiceKey): BlockCard | null {
  const blocks = blocksFor(service);
  // Сначала слово-акцент заголовка главы («гарантии», «хронология»).
  for (const b of blocks) {
    const kw = normalize(b.keyword).trim();
    if (kw.length > 4 && p.text.includes(kw.slice(0, Math.max(4, kw.length - 2)))) return b;
  }
  let best: BlockCard | null = null;
  let score = 0;
  for (const b of blocks) {
    const n = count(p, ROLE_TAGS[b.role]);
    if (n > score) {
      score = n;
      best = b;
    }
  }
  return best;
}

function findOrdinal(p: Phrase): number | null {
  if (!any(p, T.blockWord)) return null;
  for (const [tags, n] of ORDINALS) if (any(p, tags)) return n;
  return null;
}

export const HELP_SAY =
  "Говори как удобно: «дальше», «назад», «следующая страница», «покажи третий блок», «открой сайты», «покажи цены», «отмени», «позвони». И просто задавай вопросы.";

const blockHref = (svc: ServiceKey, b: BlockCard) => `/${serviceMeta[svc].slug}#${b.id}`;

/** Разбор фразы. null — не команда, а вопрос для ИИ.
 *  loose — ИИ недоступен: вопрос «сколько стоит сайт?» тогда тоже ведёт
 *  на подходящий блок, а не остаётся без ответа. */
export function parseCommand(raw: string, pathname: string, loose = false): VoiceReply | null {
  const p = phrase(raw);
  if (p.words.length === 0) return null;
  const here = serviceFromPath(pathname);

  // 1. Служебное — важнее всего остального в фразе.
  if (any(p, T.stop) && !any(p, ["видео", "звук", "музык"])) {
    return { say: "Выключаю голос. Нажми на волну, когда понадоблюсь.", action: { type: "stop" } };
  }
  if (any(p, T.help)) return { say: HELP_SAY, action: { type: "none" } };
  if (any(p, T.repeat)) return { say: "", action: { type: "repeat" } };
  if (any(p, T.undo) && !any(p, T.next)) return { say: "Возвращаю, как было.", action: { type: "undo" } };
  if (any(p, T.close)) return { say: "", action: { type: "close" } };

  // 2. Связь: «позвони насчёт сайта» — это звонок.
  if (any(p, T.call)) return { say: "Набираю продюсера.", action: { type: "call" } };
  if (any(p, T.whatsapp)) return { say: "Открываю WhatsApp.", action: { type: "whatsapp" } };
  if (any(p, T.telegram) && !any(p, ["канал"])) return { say: "Открываю Телеграм продюсера.", action: { type: "telegram" } };

  const svc = findService(p);
  const ordinal = findOrdinal(p);
  const target = svc ?? here;
  const block = target ? findBlock(p, target) : null;
  const navVerb = any(p, T.nav);

  // 3. Вопрос без глагола перехода — честнее ответить, чем молча листать.
  //    «Сколько стоит сайт?» уходит к ИИ; «покажи, сколько стоит сайт» — нет.
  if (!loose && any(p, T.question) && !navVerb && !ordinal) return null;

  // 4. Заявка и подбор — до разделов: «заявка на сайт» — это бриф.
  if (any(p, T.brief)) {
    const s2 = svc ?? here;
    const href = s2 && s2 !== "content" ? `/brief/${serviceMeta[s2].slug}` : "/brief";
    return { say: "Открываю бриф, это пара минут.", action: { type: "route", href } };
  }
  if (any(p, T.vibe)) return { say: "Запускаю подбор под твою задачу.", action: { type: "vibe" } };

  // 5. Соседняя страница: «следующая страница», «предыдущий раздел».
  if (any(p, T.pageWord) && !svc && !block) {
    if (any(p, T.next)) return { say: "", action: { type: "page", delta: 1 } };
    if (any(p, T.prev)) return { say: "", action: { type: "page", delta: -1 } };
  }

  // 6. Номер главы: «покажи третий блок», «глава пять».
  if (ordinal && target) {
    const blocks = blocksFor(target);
    const b = blocks[Math.min(ordinal, blocks.length) - 1];
    return { say: `${b.num}. ${b.title}.`, action: { type: "route", href: blockHref(target, b) } };
  }

  // 7. Раздел и блок: «открой сайты», «покажи работы», «цены на SMM».
  if (target && block && (svc || navVerb || loose || p.words.length <= 3)) {
    const where = target !== here ? ` в разделе ${serviceMeta[target].label}` : "";
    return { say: `Показываю: ${block.title}${where}.`, action: { type: "route", href: blockHref(target, block) } };
  }
  if (svc) {
    return { say: `Открываю ${serviceMeta[svc].label}.`, action: { type: "route", href: `/${serviceMeta[svc].slug}` } };
  }

  if (any(p, T.menu)) return { say: "Открываю меню.", action: { type: "menu" } };
  if (any(p, T.top)) return { say: "", action: { type: "top" } };
  if (any(p, T.bottom)) return { say: "", action: { type: "bottom" } };

  // 8. Листание. «Назад» и «дальше» считаются голосами: побеждает то,
  //    чего во фразе больше («ну давай дальше, вперёд» — дальше).
  const fwd = count(p, T.next);
  const back = count(p, T.prev);
  if (fwd || back) return { say: "", action: { type: "step", delta: fwd >= back ? 1 : -1 } };

  return null;
}
