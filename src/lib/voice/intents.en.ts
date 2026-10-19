import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { blocksFor, type BlockCard, type BlockRole } from "@/lib/welcome-blocks";
import { ringOf } from "@/components/home/direction/siblings";
import { tr } from "@/i18n/tr";
import { TEAM } from "@/lib/team";
import type { MoodId } from "@/lib/sound";
import { any, count, normalize, phrase, serviceFromPath, type Phrase, type VoiceAction, type VoiceReply } from "@/lib/voice/intents";

// Английская версия разбора голосовых команд (см. intents.ts — там описано,
// как устроены теги: корень слова, «=слово» целиком, фраза с пробелом).
// Логика и порядок разбора те же, что у русской, меняются только слова и
// ответы ассистента.

const T = {
  stop: ["turn off", "switch off", "shut up", "enough", "=stop", "=bye", "goodbye", "stop listening"],
  help: ["what can you", "help", "commands", "what can i say", "how do i use"],
  repeat: ["repeat", "say that again", "say again", "didn't hear", "what did you say", "pardon"],
  undo: ["undo", "=back", "go back", "as it was", "revert", "wrong", "never mind", "changed my mind"],
  close: ["close the window", "close window", "close the chat", "close chat", "hide", "dismiss", "collapse"],
  install: ["home screen", "desktop", "install the app", "install app", "add to dock", "as an app", "app on my"],
  call: ["call", "phone", "dial", "ring", "give me a ring"],
  whatsapp: ["whatsapp", "whats app", "watsapp"],
  telegram: ["telegram", "telegramm", "message", "write to", "text "],
  brief: [
    "request", "brief", "order", "place an order", "submit", "fill in", "fill out", "start a project", "discuss a project",
    "questionnaire", "order form", "get a quote", "quote", "sign up",
  ],
  vibe: ["vibe", "personal", "tailor", "custom", "pick for me", "match me", "recommend", "offer for me"],
  menu: ["=menu", "navigation", "all sections", "list of sections", "contents"],
  top: ["to the top", "back to the top", "scroll up all", "very top", "first screen", "home", "header", "the beginning"],
  bottom: ["to the bottom", "the very bottom", "to the end", "the end", "very end"],
  next: ["next", "forward", "continue", "scroll", "=down", "keep going", "go on", "further", "below", "later"],
  prev: ["previous", "back", "=up", "above", "earlier", "before", "last one"],
  pageWord: ["page", "section", "service", "direction"],
  blockWord: ["block", "chapter", "slide", "screen", "point", "number", "part"],
  press: ["press", "click", "tap", "hit", "choose", "pick", "select", "discuss", "learn more", "find out more", "details", "activate", "launch"],
  team: ["write", "message", "contact", "ask", "discuss", "chat with", "talk to", "speak to", "text"],
  nav: ["open", "show", "go to", "take me", "navigate", "switch to", "let's", "i want", "bring up", "turn on", "look at", "check out", "where", "find", "tell me about", "send me"],
  question: [
    "=how", "=what", "=why", "=can", "=could", "=do", "=does", "=how much", "=which", "=who", "=when", "=where", "=is",
    "=are", "=should", "explain", "advise", "suggest", "tell me",
  ],
};

const FILL = ["fill", "submit", "leave", "send", "start", "begin", "let's", "i want", "i need", "make", "create", "go through", "ready", "book"];

const MUSIC = ["music", "track", "song", "melody", "player", "=radio", "station", "playlist"];
const MOOD_TAGS: Record<MoodId, string[]> = {
  focus: ["focus", "concentrat"],
  chill: ["=chill", "chillout", "chill out"],
  jazzhop: ["relax", "jazz", "hip hop", "hip-hop", "lofi", "lo-fi"],
  nightdrive: ["drive", "deep house", "house", "night drive"],
  tokyo: ["energy", "energetic", "techno", "upbeat"],
  soul: ["soul"],
};
function findMood(p: Phrase): MoodId | null {
  for (const [id, tags] of Object.entries(MOOD_TAGS)) if (any(p, tags)) return id as MoodId;
  return null;
}

function parseMusic(p: Phrase): VoiceReply | null {
  const mood = findMood(p);
  const WHAT = ["what's playing", "what is playing", "what track", "what song", "which song", "which track", "who sings", "who is singing", "who plays"];
  const about = any(p, MUSIC) || any(p, WHAT) || (mood && any(p, ["play", "put on", "let's", "=i want", "turn on"]));
  const vol = any(p, ["louder", "volume up", "turn it up", "quieter", "softer", "volume down", "turn it down", "lower"]);
  if (!about && !vol) return null;
  const m = (op: Extract<VoiceAction, { type: "music" }>["op"], moodId?: MoodId): VoiceReply => ({
    say: "",
    action: { type: "music", op, mood: moodId },
  });
  if (any(p, WHAT) || any(p, ["what's this called", "what is this called"])) return m("what");
  if (any(p, ["louder", "volume up", "turn it up"])) return m("louder");
  if (any(p, ["quieter", "softer", "volume down", "turn it down", "lower"])) return m("quieter");
  if (any(p, ["turn off", "switch off", "stop", "pause", "enough", "mute", "shut"])) return m("pause");
  if (any(p, ["previous", "last", "back", "go back"])) return m("prev");
  if (any(p, ["next", "another", "change", "skip", "switch"])) return m("next");
  return m("play", mood ?? undefined);
}

const SERVICE_TAGS: Record<ServiceKey, string[]> = {
  content: ["content", "video", "shoot", "film", "commercial", "footage", "editing", "clip", "production", "photo", "ad "],
  ai: ["=ai", "artificial", "neural", "avatar", "automat", "bot", "gpt", "chatbot", "agent", "machine learning"],
  sites: ["site", "website", "landing", "=web", "business card", "online store", "store", "shop", "webpage"],
  smm: ["=smm", "social", "instagram", "promotion", "reels", "stories", "account", "targeting", "creator", "influenc", "vk", "vkontakte"],
};

const ROLE_TAGS: Record<BlockRole, string[]> = {
  intro: ["start of the section", "what is this about", "services"],
  works: ["work", "portfolio", "case", "example", "project", "what you've done", "what you did"],
  why: ["why you", "why us", "who it's for", "=method", "no magic", "contractor", "advantage", "difference"],
  trust: ["production house", "off-the-shelf", "trust"],
  offer: ["service", "what you do", "tool", "format", "best at", "what do you offer", "offer"],
  process: ["process", "stage", "how it works", "how you work", "timeline", "rollout", "step by step", "steps", "deadline"],
  guarantees: ["guarantee", "contract", "what's included", "what is included", "terms", "commitment"],
  close: ["price", "pricing", "cost", "how much", "plan", "package", "estimate", "quote", "budget", "payment", "money", "rate"],
};

const SUB_SYNONYMS: Record<string, string[]> = {
  "/content/presentation": ["presentation"],
  "/content/advertising": ["commercial", "video ad"],
  "/content/image": ["brand film", "image film"],
  "/content/ai-video": ["ai video", "neural video", "generated video"],
  "/content/graphics": ["motion", "3d", "graphic", "animation"],
  "/sites/landing": ["landing"],
  "/sites/card": ["business card"],
  "/sites/turnkey": ["turnkey"],
  "/sites/assistant": ["assistant", "chatbot", "chat bot"],
  "/sites/redesign": ["redesign"],
  "/smm/reels": ["reels", "shorts"],
  "/smm/stories": ["stories"],
  "/smm/carousel": ["carousel"],
  "/smm/ads": ["paid ads", "targeting", "ads"],
  "/smm/bloggers": ["creator", "blogger", "influencer"],
};
const SUBPAGES: { href: string; label: string; tags: string[] }[] = serviceOrder.flatMap((key) =>
  ringOf(serviceMeta[key].slug).map((sp) => ({ href: sp.href, label: sp.label, tags: SUB_SYNONYMS[sp.href] ?? [] })),
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

const TEAM_TAGS: Record<string, string[]> = {
  egor: ["yegor", "egor", "producer"],
  dima: ["artyom", "artem", "editor", "motion designer"],
  max: ["kirill", "creative"],
  sasha: ["alice", "designer"],
  tanya: ["vera", "social media manager"],
};
function findTeam(p: Phrase): string | null {
  for (const [id, tags] of Object.entries(TEAM_TAGS)) if (TEAM[id] && any(p, tags)) return id;
  return null;
}

const ORDINALS: [string[], number][] = [
  [["first", "=one", "=1"], 1],
  [["second", "=two", "=2"], 2],
  [["third", "=three", "=3"], 3],
  [["fourth", "=four", "=4"], 4],
  [["fifth", "=five", "=5"], 5],
  [["sixth", "=six", "=6"], 6],
  [["seventh", "=seven", "=7"], 7],
  [["eighth", "=eight", "=8"], 8],
];

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
  for (const b of blocks) {
    const kw = normalize(tr(b.keyword, "en")).trim();
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

export const HELP_SAY_EN =
  "Say it however you like: “next”, “back”, “next page”, “show the third block”, “open sites”, “show pricing”, “undo”, “call”. And just ask questions.";

const en = (s: string) => tr(s, "en");
const blockHref = (svc: ServiceKey, b: BlockCard) => `/${serviceMeta[svc].slug}#${b.id}`;

export function parseCommandEn(raw: string, pathname: string, loose = false, noPress = false): VoiceReply | null {
  const p = phrase(raw);
  if (p.words.length === 0) return null;
  const here = serviceFromPath(pathname);

  const music = parseMusic(p);
  if (music) return music;
  if (any(p, T.stop) && !any(p, ["video", "sound", "music"])) {
    return { say: "Turning the voice off. Tap the wave when you need me.", action: { type: "stop" } };
  }
  if (any(p, T.help)) return { say: HELP_SAY_EN, action: { type: "none" } };
  if (any(p, T.repeat)) return { say: "", action: { type: "repeat" } };
  if (any(p, T.undo) && !any(p, T.next)) return { say: "Putting it back as it was.", action: { type: "undo" } };
  if (any(p, T.close)) return { say: "", action: { type: "close" } };

  if (any(p, T.install)) return { say: "Opening the window. Pick an icon and put HUD on your screen.", action: { type: "install" } };

  if (any(p, T.call)) return { say: "Calling the producer.", action: { type: "call" } };
  if (any(p, T.whatsapp)) return { say: "Opening WhatsApp.", action: { type: "whatsapp" } };
  if (any(p, ["telegram"]) && !any(p, ["channel"])) {
    return { say: "Opening the producer's Telegram.", action: { type: "telegram" } };
  }
  const member = findTeam(p);
  if (member && (any(p, T.team) || p.words.length <= 2)) {
    return { say: `Messaging ${en(TEAM[member].name)}.`, action: { type: "team", id: member } };
  }

  if (any(p, ["=down", "below"]) && !any(p, T.nav)) return { say: "", action: { type: "step", delta: 1 } };
  if (any(p, ["=up", "above"]) && !any(p, T.nav)) return { say: "", action: { type: "step", delta: -1 } };

  if (!noPress && any(p, T.press)) return { say: "", action: { type: "click", query: raw } };

  const svc = findService(p);
  const ordinal = findOrdinal(p);
  const target = svc ?? here;
  const block = target ? findBlock(p, target) : null;
  const navVerb = any(p, T.nav);

  if (any(p, T.brief) && (any(p, T.nav) || any(p, FILL) || p.words.length <= 4 || any(p, ["brief", "request"]))) {
    const s2 = svc ?? here;
    const href = s2 && s2 !== "content" ? `/brief/${serviceMeta[s2].slug}` : "/brief";
    return { say: "Opening the brief — it takes a couple of minutes.", action: { type: "route", href } };
  }

  if (!loose && any(p, T.question) && !navVerb && !ordinal) return null;

  const { sub, score: subScore } = findSubpage(p);
  if (sub && subScore >= 2 && !ordinal) return { say: `${en(sub.label)}.`, action: { type: "route", href: sub.href } };

  if (any(p, T.brief)) {
    const s2 = svc ?? here;
    const href = s2 && s2 !== "content" ? `/brief/${serviceMeta[s2].slug}` : "/brief";
    return { say: "Opening the brief — it takes a couple of minutes.", action: { type: "route", href } };
  }
  if (any(p, T.vibe)) return { say: "Starting a match for your task.", action: { type: "vibe" } };

  if (any(p, T.pageWord) && !svc && !block) {
    if (any(p, T.next)) return { say: "", action: { type: "page", delta: 1 } };
    if (any(p, T.prev)) return { say: "", action: { type: "page", delta: -1 } };
  }

  if (any(p, T.top)) return { say: "", action: { type: "top" } };

  if (sub && !block && !ordinal) {
    return { say: `${en(sub.label)}.`, action: { type: "route", href: sub.href } };
  }

  if (ordinal && target) {
    const blocks = blocksFor(target);
    const b = blocks[Math.min(ordinal, blocks.length) - 1];
    return { say: `${b.num}. ${en(b.title)}.`, action: { type: "route", href: blockHref(target, b) } };
  }

  if (target && block && (svc || navVerb || loose || p.words.length <= 3)) {
    const where = target !== here ? ` in ${en(serviceMeta[target].label)}` : "";
    return { say: `Showing: ${en(block.title)}${where}.`, action: { type: "route", href: blockHref(target, block) } };
  }
  if (svc) {
    return { say: `Opening ${en(serviceMeta[svc].label)}.`, action: { type: "route", href: `/${serviceMeta[svc].slug}` } };
  }

  if (any(p, T.menu)) return { say: "Opening the menu.", action: { type: "menu" } };
  if (any(p, T.top)) return { say: "", action: { type: "top" } };
  if (any(p, T.bottom)) return { say: "", action: { type: "bottom" } };

  const fwd = count(p, T.next);
  const back = count(p, T.prev);
  if (fwd || back) return { say: "", action: { type: "step", delta: fwd >= back ? 1 : -1 } };

  return null;
}
