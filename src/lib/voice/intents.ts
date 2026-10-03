import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { blocksFor, type BlockCard, type BlockRole } from "@/lib/welcome-blocks";
import { ringOf } from "@/components/home/direction/siblings";
import { TEAM } from "@/lib/team";
import type { MoodId } from "@/lib/sound";

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
  /** Открыть окно «Написать …» человека команды. */
  | { type: "team"; id: string }
  /** Нажать кнопку/ссылку на экране, которая лучше всего подходит под фразу. */
  | { type: "click"; query: string }
  | { type: "stop" }
  /** Плеер музыки: включить, пауза, трек вперёд/назад, громкость,
   *  настроение, «что играет». */
  | { type: "music"; op: "play" | "pause" | "next" | "prev" | "louder" | "quieter" | "what"; mood?: MoodId }
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
  brief: [
    "заявк", "бриф", "заказат", "закажу", "оформ", "оставит", "хочу заказ", "обсудить проект", "начать проект",
    // Распознавание речи слышит «бриф» по-разному: брейф, бриев, брив, брифф, brief.
    "брейф", "брэйф", "брэф", "бреф", "брив", "бриев", "брифф", "brief", "briff", "breef", "=рейф", "=грейф", "=брит",
    "форм заказ", "форму заказ", "форм заявк", "форму заявк", "заполнить форм", "заполни форм", "заполнить анкет заказ",
    "анкет заказ", "анкету заказ", "анкету проект", "заказ проект", "заказ видео", "заказ сайт", "рассчитать проект",
    "техзадани", "тз на проект", "расскажу о проекте", "опишу проект", "описать проект", "описать задачу", "опишу задачу",
  ],
  vibe: ["подбер", "анкет", "персональн", "вайб", "vibe", "=айп", "айп-", "вайп", "под меня", "под мою", "индивидуальн", "предложени"],
  menu: ["=меню", "навигац", "все раздел", "список раздел", "содержани"],
  top: ["наверх", "в начало", "к началу", "самый верх", "первый экран", "на главн", "шапк", "в самое начало"],
  bottom: ["в конец", "самый низ", "в самый конец", "до конца", "к концу"],
  next: ["дальш", "далее", "вперед", "следующ", "листа", "листни", "пролист", "=вниз", "продолж", "=еще", "мотай", "крути", "ниже", "потом"],
  prev: ["назад", "предыдущ", "вернись", "=вверх", "выше", "прошл", "раньше", "обратн"],
  pageWord: ["страниц", "раздел", "направлени", "услуг"],
  blockWord: ["блок", "глав", "слайд", "экран", "пункт", "номер", "част"],
  press: ["нажм", "=нажать", "кликн", "=жми", "тыкн", "выбер", "обсуд", "узнать больше", "узнать подробн", "подробн", "активир", "запуст"],
  team: ["напиш", "написат", "связ", "спрос", "обсуд", "свяжи", "позов", "чат с", "сообщени", "задать вопрос"],
  nav: ["откр", "покаж", "показ", "перейд", "переход", "перейти", "пойд", "пошли", "давай", "хочу", "веди", "включ", "зайд", "глян", "посмотр", "интерес", "где ", "найд", "расскаж про", "отведи", "перекин"],
  question: [
    "=как", "=что", "=чем", "=почему", "=зачем", "можно ли", "=можете", "=умеете", "=сколько", "=какой", "=какие", "=какая",
    "=кто", "=когда", "=нужен", "=нужно ли", "объясн", "подскаж", "посовет", "=ли", "расскажи о", "расскажи мне",
  ],
};

const FILL = ["заполн", "оформ", "оставь", "оставит", "отправ", "начат", "начни", "давай", "хочу", "нужен", "нужна", "сделай", "созда", "пройд", "пройти", "запиш", "запишите", "готов"];

// Музыка сайта: слова про плеер и названия настроений (lib/sound MOODS).
const MUSIC = ["музык", "трек", "песн", "мелоди", "плеер", "=радио", "станци", "плейлист"];
const MOOD_TAGS: Record<MoodId, string[]> = {
  focus: ["фокус", "сосредоточ", "концентрац"],
  chill: ["=чил", "=чилл", "чилаут", "chill"],
  jazzhop: ["расслаб", "джаз", "хипхоп", "хип-хоп", "лоуфай", "lofi"],
  nightdrive: ["драйв", "=дип", "хаус", "ночн дорог"],
  tokyo: ["энерги", "техно", "бодр"],
  soul: ["соул", "=soul", "душевн"],
};
function findMood(p: Phrase): MoodId | null {
  for (const [id, tags] of Object.entries(MOOD_TAGS)) if (any(p, tags)) return id as MoodId;
  return null;
}

/** Команда плееру или null, если фраза не про музыку. */
function parseMusic(p: Phrase): VoiceReply | null {
  const mood = findMood(p);
  const WHAT = ["что игра", "что за трек", "что за песн", "какая песн", "какой трек", "кто поет", "кто исполн"];
  const about = any(p, MUSIC) || any(p, WHAT) || (mood && any(p, ["включ", "постав", "давай", "=хочу", "сыграй", "=игра"]));
  const vol = any(p, ["громче", "погромч", "прибав", "тише", "потиш", "убав", "потише"]);
  if (!about && !vol) return null;
  const m = (op: Extract<VoiceAction, { type: "music" }>["op"], moodId?: MoodId): VoiceReply => ({
    say: "",
    action: { type: "music", op, mood: moodId },
  });
  if (any(p, WHAT) || any(p, ["как называ"])) return m("what");
  if (any(p, ["громче", "погромч", "прибав"])) return m("louder");
  if (any(p, ["тише", "потиш", "убав"])) return m("quieter");
  if (any(p, ["выключ", "отключ", "останов", "пауз", "=стоп", "хватит", "убер", "замолч"])) return m("pause");
  if (any(p, ["предыдущ", "прошл", "назад", "вернись"])) return m("prev");
  if (any(p, ["следующ", "друг", "смени", "дальш", "переключ", "пропуст"])) return m("next");
  return m("play", mood ?? undefined);
}

// Разделы сайта — по смыслу, а не по названию страницы.
const SERVICE_TAGS: Record<ServiceKey, string[]> = {
  content: ["контент", "видео", "съемк", "=снять", "сним", "ролик", "продакшн", "продакшен", "фильм", "монтаж", "клип", "реклам", "фото"],
  ai: ["=ии", "=ai", "=аи", "ai-", "ии-", "эйай", "искусствен", "нейросет", "нейронк", "аватар", "автоматиз", "бот", "gpt", "чатбот"],
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

// Подстраницы разделов — из того же кольца, что и стрелки на страницах
// (siblings.ts). Теги — корни слов подписи плюс разговорные синонимы.
const SUB_SYNONYMS: Record<string, string[]> = {
  "/content/presentation": ["презентац"],
  "/content/advertising": ["рекламн ролик", "реклам видео"],
  "/content/image": ["имидж"],
  "/content/ai-video": ["ai-видео", "ии видео", "нейровидео", "видео на ии", "ai видео"],
  "/content/graphics": ["моушн", "3d", "=3д", "графи", "анимац"],
  "/sites/landing": ["лендинг"],
  "/sites/card": ["визитк"],
  "/sites/turnkey": ["под ключ"],
  "/sites/assistant": ["ассистент", "чат-бот", "чатбот"],
  "/sites/redesign": ["редизайн"],
  "/smm/reels": ["рилс", "reels"],
  "/smm/stories": ["сторис", "stories"],
  "/smm/carousel": ["карусел"],
  "/smm/ads": ["таргет"],
  "/smm/bloggers": ["блогер"],
};
const SUBPAGES: { href: string; label: string; tags: string[] }[] = serviceOrder.flatMap((key) =>
  ringOf(serviceMeta[key].slug).map((sp) => {
    // Слова подписи (и части через дефис), кроме тех, что называют сам
    // раздел: «Карточки и контент» не должна перехватывать «создание
    // контента», а «Сайт под ключ» — просто «сайты».
    const own = normalize(sp.label.replace(/-/g, " "))
      .trim()
      .split(" ")
      .filter((w) => w.length >= 4 && w !== "для")
      .map((w) => w.slice(0, Math.min(w.length, 5)))
      .filter(
        (w) =>
          !serviceOrder.some((k) =>
            SERVICE_TAGS[k].some((t) => {
              const bare = t.replace(/^=/, "").trim();
              return bare.startsWith(w) || w.startsWith(bare);
            })
          )
      );
    return { href: sp.href, label: sp.label, tags: [...(SUB_SYNONYMS[sp.href] ?? []), ...own] };
  })
);

function findSubpage(p: Phrase): { sub: (typeof SUBPAGES)[number] | null; score: number } {
  let best: (typeof SUBPAGES)[number] | null = null;
  let score = 0;
  for (const sp of SUBPAGES) {
    const n = count(p, sp.tags);
    if (n > score) {
      score = n;
      best = sp;
    }
  }
  return { sub: best, score };
}

// Люди команды: «напиши Алисе», «спроси Артёма», «написать продюсеру».
const TEAM_TAGS: Record<string, string[]> = {
  egor: ["егор", "продюсер"],
  dima: ["артем", "артём", "=теме", "монтажер", "моушн-дизайнер"],
  max: ["кирилл", "=кирюше", "креативн"],
  sasha: ["=алиса", "алисе", "алисой", "алисы", "дизайнер"],
};
function findTeam(p: Phrase): string | null {
  for (const [id, tags] of Object.entries(TEAM_TAGS)) if (TEAM[id] && any(p, tags)) return id;
  return null;
}

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
export function parseCommand(raw: string, pathname: string, loose = false, noPress = false): VoiceReply | null {
  const p = phrase(raw);
  if (p.words.length === 0) return null;
  const here = serviceFromPath(pathname);

  // 1. Служебное — важнее всего остального в фразе.
  // Музыка — до «стоп»: «выключи музыку» не выключает сам голос.
  const music = parseMusic(p);
  if (music) return music;
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
  if (any(p, ["телеграм", "телег", "telegram"]) && !any(p, ["канал"])) {
    return { say: "Открываю Телеграм продюсера.", action: { type: "telegram" } };
  }
  // Человек команды: «напиши Саше» → окно «Написать Саше».
  const member = findTeam(p);
  if (member && (any(p, T.team) || p.words.length <= 2)) {
    return { say: `Пишем ${TEAM[member].nameDative}.`, action: { type: "team", id: member } };
  }

  // «Страница вниз / вверх» — это листание, а не соседняя страница.
  if (any(p, ["=вниз", "ниже"]) && !any(p, T.nav)) return { say: "", action: { type: "step", delta: 1 } };
  if (any(p, ["=вверх", "выше"]) && !any(p, T.nav)) return { say: "", action: { type: "step", delta: -1 } };

  // Нажать кнопку на экране: «нажми узнать больше на графике».
  if (!noPress && any(p, T.press)) return { say: "", action: { type: "click", query: raw } };

  const svc = findService(p);
  const ordinal = findOrdinal(p);
  const target = svc ?? here;
  const block = target ? findBlock(p, target) : null;
  const navVerb = any(p, T.nav);

  // Бриф — явная просьба («открой бриф», «заполнить бриф», «давай брифнемся»)
  // работает всегда, даже если фраза похожа на вопрос или в ней есть слова
  // про раздел/блок: заявка важнее всего остального.
  if (any(p, T.brief) && (any(p, T.nav) || any(p, FILL) || p.words.length <= 4 || any(p, ["бриф", "брейф", "заявк"]))) {
    const s2 = svc ?? here;
    const href = s2 && s2 !== "content" ? `/brief/${serviceMeta[s2].slug}` : "/brief";
    return { say: "Открываю бриф, это пара минут.", action: { type: "route", href } };
  }

  // 3. Вопрос без глагола перехода — честнее ответить, чем молча листать.
  //    «Сколько стоит сайт?» уходит к ИИ; «покажи, сколько стоит сайт» — нет.
  if (!loose && any(p, T.question) && !navVerb && !ordinal) return null;

  // Подстраница с сильным совпадением («агент по заявкам») важнее брифа.
  const { sub, score: subScore } = findSubpage(p);
  if (sub && subScore >= 2 && !ordinal) return { say: `${sub.label}.`, action: { type: "route", href: sub.href } };

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

  if (any(p, T.top)) return { say: "", action: { type: "top" } };

  // 5б. Подстраница: «страница лендингов», «покажи рилс», «AI-аналитика».
  if (sub && !block && !ordinal) {
    return { say: `${sub.label}.`, action: { type: "route", href: sub.href } };
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
