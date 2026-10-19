import { serviceMeta, type ServiceKey } from "@/lib/service-content";
import { blocksFor } from "@/lib/welcome-blocks";
import { normalize, serviceFromPath, type VoiceAction } from "@/lib/voice/intents";
import { isEnglishSite } from "@/lib/voice/lang";
import { tr } from "@/i18n/tr";

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

function offersForEn(pathname: string): VoiceOffer[] {
  const svc = serviceFromPath(pathname) ?? "content";
  const slug = serviceMeta[svc].slug;
  const label = tr(serviceMeta[svc].label, "en");
  const list: VoiceOffer[] = [];
  const works = blockOf(svc, "works");
  const price = blockOf(svc, "close");
  const process = blockOf(svc, "process");
  if (works) {
    list.push({
      say: fresh([
        `Want me to show the work in “${label}”? That's the good stuff.`,
        "I can show real cases — better to see it once. Show you?",
        "Shall I show what we've already done? It's quicker than any words.",
      ]),
      action: { type: "route", href: `/${slug}#${works.id}` },
    });
  }
  if (price) {
    list.push({
      say: fresh([
        "Want me to show the terms and prices right away? No surprises.",
        "I can open the plans — you'll estimate a budget in a minute. Open them?",
        "Wondering how much it costs? I'll show the terms if you like.",
      ]),
      action: { type: "route", href: `/${slug}#${price.id}` },
    });
  }
  if (process) {
    list.push({
      say: fresh([
        "Want me to walk you through how it all goes, step by step? I'll show you.",
        "Want to see how we work — from the first call to the result?",
      ]),
      action: { type: "route", href: `/${slug}#${process.id}` },
    });
  }
  list.push(
    {
      say: fresh([
        "Here's a trick: answer a couple of questions — and within an hour you get a personal offer. Start it?",
        "Want us to pick a solution for your exact task? A couple of questions, that's all. Shall we start?",
      ]),
      action: { type: "vibe" },
    },
    {
      say: fresh([
        "By the way, for signing up in the dashboard we give three image generations on fresh AI models. Show the terms?",
        "A little secret: we have a gift for signing up — three AI generations. Want to hear it?",
      ]),
      action: { type: "route", href: "/bonus" },
    },
    {
      say: fresh([
        "If you already have a task — let's open a brief, it takes a couple of minutes. Open it?",
        "We can get straight to it: a short brief, and a producer comes back with ideas. Open it?",
      ]),
      action: { type: "route", href: svc === "content" ? "/brief" : `/brief/${slug}` },
    },
  );
  return list;
}

const blockOf = (svc: ServiceKey, role: string) => blocksFor(svc).find((b) => b.role === role);

/** Что предложить на этой странице. */
export function offersFor(pathname: string): VoiceOffer[] {
  if (isEnglishSite()) return offersForEn(pathname);
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
  const hi = fresh(isEnglishSite() ? [
    "Hi! I'm here.",
    "Hey, hi! I'm listening.",
    "Hop — I'm here.",
    "Hi-hi! Voice is on.",
    "I'm here. Say what you need, or just chat.",
  ] : [
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
  const lead = fresh(isEnglishSite() ? ["Hey, I'm here if you need me.", "Bored?", "Listen,", "By the way,"] : ["Эй, я тут, если что.", "Не скучаешь?", "Слушай,", "Кстати,"]);
  return { say: `${lead} ${offer.say}`, offer };
}

const YES = [
  "да", "ага", "угу", "давай", "давайте", "хочу", "конечно", "ок", "окей", "го", "погнали", "поехали",
  "показывай", "покажи", "открой", "открывай", "рассказывай", "расскажи", "можно", "валяй", "интересно", "запускай", "естественно", "разумеется", "yes",
];
const YES_EN = ["yes", "yeah", "yep", "sure", "ok", "okay", "go", "lets", "show", "open", "tell", "please", "absolutely", "definitely", "interesting", "fine", "yup", "alright"];
const NO_EN = ["no", "nope", "not now", "later", "no thanks", "dont", "not interested", "not needed", "maybe later"];
const NO = ["нет", "не надо", "неа", "не хочу", "потом", "позже", "не сейчас", "отстань", "не интересно", "не нужно"];

/** Ответ на предложение: true — согласие, false — отказ, null — другая фраза. */
export function replyToOffer(raw: string): boolean | null {
  const t = normalize(raw);
  const words = t.trim().split(" ");
  if (words.length > 6) return null;
  if (isEnglishSite()) {
    if (NO_EN.some((n) => t.includes(` ${n} `) || t.includes(` ${n}`))) return false;
    if (words.some((w) => YES_EN.includes(w)) || t.includes(" go ahead") || t.includes(" do it")) return true;
    return null;
  }
  if (NO.some((n) => t.includes(` ${n} `) || t.includes(` ${n}`))) return false;
  if (words.some((w) => YES.includes(w)) || t.includes(" давай разбер")) return true;
  return null;
}

export function declineSay(): string {
  if (isEnglishSite())
    return fresh([
      "No problem. I'm around if you need me.",
      "Okay, I won't push. Ask me anything.",
      "Got it. Then just scroll, and I'll pick it up.",
      "Fine, another time. What else can I help with?",
    ]);
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
  const lead = fresh(isEnglishSite() ? [
    "Hm, I didn't catch that.",
    "I think I missed the thought.",
    "I didn't quite get it, let's try another way.",
    "Oops, that went past me.",
    "Just missed that.",
  ] : [
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
const SMALL_TALK_EN: [string[], string[]][] = [
  [
    ["how are you", "how s it going", "how are things", "how do you do", "what s new", "what s up"],
    [
      "Great — the site is collecting likes, the team is drinking coffee. How about you?",
      "Lively! We've already come up with three video ideas today. How are you?",
      "Like a neural net on a Friday — overclocked and ready. And you?",
    ],
  ],
  [["hello", "hi ", "hey", "good morning", "good afternoon", "good evening"], ["Hi! Glad to hear you.", "Oh, hi! What shall we do?", "Hey! I'm here."]],
  [["thank"], ["You're welcome!", "Anytime, my pleasure.", "No problem — that's what I'm here for."]],
  [
    ["who are you", "what s your name", "are you a robot", "are you human", "are you real"],
    [
      "I'm the voice of this site: I show, I tell and sometimes I joke. The team behind me are live artists.",
      "I'm the HUD.SERVICE assistant. Not human, but with good taste.",
    ],
  ],
  [
    ["bored", "tired", "sad"],
    ["Let me cheer you up: I'll show a couple of our videos — your mood will lift.", "I understand. Want me to put on some music to match your mood?"],
  ],
];
export function smallTalk(raw: string): string | null {
  const t = normalize(raw);
  if (isEnglishSite()) {
    for (const [tags, answers] of SMALL_TALK_EN) {
      if (tags.some((tag) => t.includes(` ${tag}`))) return fresh(answers);
    }
    return null;
  }
  for (const [tags, answers] of SMALL_TALK) {
    if (tags.some((tag) => t.includes(` ${tag}`))) return fresh(answers);
  }
  return null;
}
