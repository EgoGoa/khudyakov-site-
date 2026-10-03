import { serviceMeta, type ServiceKey } from "@/lib/service-content";
import { blocksFor } from "@/lib/welcome-blocks";
import { normalize, serviceFromPath, type VoiceAction } from "@/lib/voice/intents";

// Характер голосового ассистента (Егор, 2026-10-03): живой, вайбовый,
// отвечает каждый раз по-разному и сам иногда предлагает — «хочешь,
// покажу…». Предложение запоминается, и короткое «да», «давай», «хочу»
// его выполняет.

export type VoiceOffer = { say: string; action: VoiceAction };

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** Последние сказанные фразы — чтобы не повторяться подряд. */
const recent: string[] = [];
function fresh(list: readonly string[]): string {
  const pool = list.filter((s) => !recent.includes(s));
  const s = pick(pool.length ? pool : list);
  recent.push(s);
  if (recent.length > 6) recent.shift();
  return s;
}

const blockOf = (svc: ServiceKey, role: string) => blocksFor(svc).find((b) => b.role === role);

/** Что предложить на этой странице. */
export function offersFor(pathname: string): VoiceOffer[] {
  const svc = serviceFromPath(pathname) ?? "content";
  const slug = serviceMeta[svc].slug;
  const label = serviceMeta[svc].label;
  const list: VoiceOffer[] = [];
  const works = blockOf(svc, "works");
  const price = blockOf(svc, "close");
  const process = blockOf(svc, "process");
  if (works) {
    list.push({
      say: fresh([
        `Хочешь, покажу работы по направлению «${label}»? Там самое вкусное.`,
        "Могу показать живые кейсы — лучше один раз увидеть. Показать?",
        "Давай покажу, что мы уже сделали? Это быстрее любых слов.",
      ]),
      action: { type: "route", href: `/${slug}#${works.id}` },
    });
  }
  if (price) {
    list.push({
      say: fresh([
        "Хочешь, сразу покажу условия и цены? Без сюрпризов.",
        "Могу открыть тарифы — прикинешь бюджет за минуту. Открыть?",
        "Интересно, сколько это стоит? Покажу условия, если хочешь.",
      ]),
      action: { type: "route", href: `/${slug}#${price.id}` },
    });
  }
  if (process) {
    list.push({
      say: fresh([
        "Рассказать, как у нас всё проходит, по шагам? Покажу.",
        "Хочешь, покажу, как мы работаем — от первого звонка до результата?",
      ]),
      action: { type: "route", href: `/${slug}#${process.id}` },
    });
  }
  list.push(
    {
      say: fresh([
        "Есть фишка: отвечаешь на пару вопросов — и через час у тебя персональное предложение. Запустить?",
        "Хочешь, подберём решение именно под твою задачу? Пара вопросов, и всё. Начнём?",
      ]),
      action: { type: "vibe" },
    },
    {
      say: fresh([
        "Кстати, за регистрацию в кабинете дарим три генерации картинок на свежих нейросетях. Показать условия?",
        "Маленький секрет: у нас есть подарок за регистрацию — три генерации на нейросетях. Рассказать?",
      ]),
      action: { type: "route", href: "/bonus" },
    },
    {
      say: fresh([
        "Если задача уже есть — давай откроем бриф, это пара минут. Открыть?",
        "Можем сразу к делу: короткий бриф, и продюсер вернётся с идеями. Открыть?",
      ]),
      action: { type: "route", href: svc === "content" ? "/brief" : `/brief/${slug}` },
    },
  );
  return list;
}

export function randomOffer(pathname: string): VoiceOffer {
  return pick(offersFor(pathname));
}

/** Приветствие при включении — каждый раз своё и сразу с предложением. */
export function greeting(pathname: string): { say: string; offer: VoiceOffer } {
  const offer = randomOffer(pathname);
  const hi = fresh([
    "Привет! Я на связи.",
    "Эй, привет! Слушаю тебя.",
    "Хоп — я тут.",
    "Привет-привет! Голос включён.",
    "На связи. Говори, что нужно, или просто болтай.",
  ]);
  return { say: `${hi} ${offer.say}`, offer };
}

/** Тихий заход, если посетитель давно молчит. */
export function nudge(pathname: string): { say: string; offer: VoiceOffer } {
  const offer = randomOffer(pathname);
  const lead = fresh(["Эй, я тут, если что.", "Не скучаешь?", "Слушай,", "Кстати,"]);
  return { say: `${lead} ${offer.say}`, offer };
}

const YES = [
  "да", "ага", "угу", "давай", "давайте", "хочу", "конечно", "ок", "окей", "го", "погнали", "поехали",
  "показывай", "покажи", "открой", "открывай", "рассказывай", "расскажи", "можно", "валяй", "интересно", "запускай", "естественно", "разумеется", "yes",
];
const NO = ["нет", "не надо", "неа", "не хочу", "потом", "позже", "не сейчас", "отстань", "не интересно", "не нужно"];

/** Ответ на предложение: true — согласие, false — отказ, null — другая фраза. */
export function replyToOffer(raw: string): boolean | null {
  const t = normalize(raw);
  const words = t.trim().split(" ");
  if (words.length > 6) return null;
  if (NO.some((n) => t.includes(` ${n} `) || t.includes(` ${n}`))) return false;
  if (words.some((w) => YES.includes(w)) || t.includes(" давай разбер")) return true;
  return null;
}

export function declineSay(): string {
  return fresh([
    "Без проблем. Если что — я рядом.",
    "Окей, не навязываюсь. Спрашивай что угодно.",
    "Принято. Тогда просто листай, а я подхвачу.",
    "Хорошо, в другой раз. Чем ещё помочь?",
  ]);
}

/** «Не поняла» — каждый раз по-разному и сразу с выходом. */
export function notUnderstood(pathname: string): { say: string; offer: VoiceOffer } {
  const offer = randomOffer(pathname);
  const lead = fresh([
    "Хм, не расслышала.",
    "Кажется, я упустила мысль.",
    "Не до конца поняла, давай иначе.",
    "Ой, это мимо меня прошло.",
    "Чуть-чуть не уловила.",
  ]);
  return { say: `${lead} ${offer.say}`, offer };
}

// Болтовня без сети (если ИИ недоступен): по-разному, но по делу.
const SMALL_TALK: [string[], string[]][] = [
  [
    ["как дела", "как ты", "как жизнь", "как поживаеш", "как настроени", "что нового"],
    [
      "Отлично — сайт собирает лайки, команда пьёт кофе. А у тебя как?",
      "Бодро! Сегодня уже три идеи для роликов придумали. Ты как?",
      "Как у нейросети в пятницу — разогнана и готова. А ты?",
    ],
  ],
  [
    ["привет", "здравств", "хай", "добрый"],
    ["Привет! Рада слышать.", "О, привет! Чем займёмся?", "Хэй! Я тут."],
  ],
  [
    ["спасиб", "благодар"],
    ["Всегда пожалуйста!", "Обращайся, мне в радость.", "Пустяки — я для этого здесь."],
  ],
  [
    ["кто ты", "как тебя зов", "ты кто", "ты робот", "ты человек"],
    [
      "Я голос этого сайта: показываю, рассказываю и иногда шучу. Команда за мной — живые художники.",
      "Я ассистент HUD.SERVICE. Не человек, но с хорошим вкусом.",
    ],
  ],
  [
    ["скучн", "устал", "грустн"],
    ["Давай разгоню: покажу пару наших роликов — настроение поднимется.", "Понимаю. Хочешь, включу музыку под настроение?"],
  ],
];
export function smallTalk(raw: string): string | null {
  const t = normalize(raw);
  for (const [tags, answers] of SMALL_TALK) {
    if (tags.some((tag) => t.includes(` ${tag}`))) return fresh(answers);
  }
  return null;
}
