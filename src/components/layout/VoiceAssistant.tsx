"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BOOT, useBootStage } from "@/lib/boot-sequence";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import NanoWave from "@/components/ui/NanoWave";
import { MOODS, sound } from "@/lib/sound";
import { CloseIcon, PhoneIcon, SendIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { useCinematicCurrent, useCinematicFirstId, useCinematicGoTo, useCinematicStep } from "@/lib/cinematic-nav";
import { useHeaderMenu } from "@/lib/header-menu";
import { serviceMeta, serviceOrder } from "@/lib/service-content";
import { blocksFor } from "@/lib/welcome-blocks";
import { CONTACTS, normalize, parseCommand, serviceFromPath, type VoiceAction } from "@/lib/voice/intents";
import TeamConsultModal from "@/components/home/TeamConsultModal";
import VoiceTour from "@/components/layout/VoiceTour";
import { TEAM } from "@/lib/team";
import {
  OPEN_VIBE_EVENT,
  TOUR_KEY,
  VOICE_NAV_EVENT,
  getVoiceState,
  registerVoiceEngine,
  setVoiceState,
  getVoiceLevel,
  useVoiceState,
  voice,
  voiceLevel,
} from "@/lib/voice/store";

// Голосовой ассистент сайта — «как Siri, только для сайта» (Егор, 2026-09-26).
//
// Голос всегда на связи: один тап «Включить» — и сайт слушает на всех
// страницах, пока посетитель на нём, без повторных нажатий. Фраза →
// действие сразу (листает, открывает разделы, звонит) → короткий ответ
// голосом → снова слушает. Пока ассистент говорит, микрофон выключен —
// иначе он слышит сам себя; перебить можно касанием волны.
//
//   · Слух — Web Speech API браузера (Chrome, Safari, Edge). В Firefox его
//     нет: там окно принимает текст, а отвечает всё так же голосом.
//   · Понимание — lib/voice/intents.ts (теги и сущности, на месте), вопросы —
//     ИИ через /api/voice; если ИИ недоступен, фраза разбирается «мягко».
//   · Голос — Yandex SpeechKit через /api/tts, запасной — голос браузера.
//
// «Голос включён» запоминается в браузере: на следующей загрузке страницы
// Chrome продолжает слушать сам; Safari требует касания — тогда снова
// появляется приглашение.

const ON_KEY = "hdkv_voice_on";
const INVITE_KEY = "hdkv_voice_invite_dismissed";

function readFlag(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function writeFlag(key: string, on: boolean) {
  try {
    if (on) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    /* приватный режим — просто не запомним */
  }
}

// 0.05 с тишины — «разогрев» <audio> в жесте пользователя для iOS.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Подсказки, которые по очереди тихо проявляются под волной в окне.
const HINTS = [
  "Скажи «дальше» или «назад»",
  "«Следующая страница»",
  "«Покажи третий блок»",
  "«Открой сайты»",
  "«Покажи цены»",
  "Спроси: сколько стоит ролик?",
  "«Отмени» — вернёт, как было",
  "«Позвони продюсеру»",
  "«Стоп» — выключить голос",
];

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function recognitionCtor(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Лучший русский голос устройства — на случай, если живой голос недоступен.
// Порядок — по тому, насколько естественно звучит: скачанные «улучшенные»
// голоса Apple, облачный Google в Chrome, Milena, и только потом любой ru.
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const ru = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ru"));
  const rank = (v: SpeechSynthesisVoice) => {
    const n = v.name;
    if (/(premium|enhanced|улучш)/i.test(n)) return 0;
    if (/google/i.test(n)) return 1;
    if (/(milena|милена|katya|катя)/i.test(n)) return 2;
    if (/(yandex|alice|алиса)/i.test(n)) return 3;
    if (!v.localService) return 4;
    return 6;
  };
  return ru.sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

type Snapshot = { path: string; chapter: string | null; scrollY: number };

// «Нажми узнать больше на графике», «обсудить формат в подкастах»: ищем на
// странице кнопку или ссылку, которая лучше всего совпадает со словами
// фразы — по своей надписи (вес 2) и по карточке, в которой стоит (вес 1),
// с небольшим бонусом за то, что она на экране. Так голосом можно нажать
// любую кнопку сайта, не перечисляя их заранее.
const PRESS_STOP = new Set([
  "нажми", "нажать", "кликни", "жми", "кнопку", "кнопка", "пожалуйста", "давай", "мне", "это", "вот", "эту", "этот",
  "про", "для", "что", "там", "тут",
]);
const stems = (text: string) =>
  normalize(text)
    .trim()
    .split(" ")
    .filter((w) => w.length >= 3 && !PRESS_STOP.has(w))
    .map((w) => w.slice(0, Math.min(w.length, 5)));

function pressOnScreen(query: string): boolean {
  const qs = stems(query);
  if (!qs.length) return false;
  let best: HTMLElement | null = null;
  let bestScore = 0;
  let bestInView = false;
  for (const el of document.querySelectorAll<HTMLElement>('a[href], button, [role="button"]')) {
    if (el.closest("[data-voice-ui], [aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const own = normalize(`${el.innerText} ${el.getAttribute("aria-label") ?? ""} ${el.title}`);
    const card = el.closest<HTMLElement>("article, li, [class*='card'], [class*='glass'], [class*='tile'], section");
    const ctx = card ? normalize(card.innerText.slice(0, 500)) : "";
    let score = 0;
    for (const q of qs) {
      if (own.includes(q)) score += 2;
      else if (ctx.includes(q)) score += 1;
    }
    const inView = r.bottom > 0 && r.top < window.innerHeight;
    if (inView) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = el;
      bestInView = inView;
    }
  }
  if (!best || bestScore < 2.5) return false;
  const target = best;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  window.setTimeout(() => target.click(), bestInView ? 60 : 500);
  return true;
}

export default function VoiceAssistant() {
  const router = useRouter();
  const pathname = useCleanPathname();
  const goTo = useCinematicGoTo();
  const step = useCinematicStep();
  const current = useCinematicCurrent();
  const firstId = useCinematicFirstId();
  const { setMenuOpen } = useHeaderMenu();
  const s = useVoiceState();

  // Живые значения для колбэков распознавания и озвучки — они переживают
  // рендеры и смену страницы, а замыкание держало бы старый адрес.
  const live = useRef({ pathname, goTo, step, current, firstId, setMenuOpen, router });
  useEffect(() => {
    live.current = { pathname, goTo, step, current, firstId, setMenuOpen, router };
  }, [pathname, goTo, step, current, firstId, setMenuOpen, router]);

  useEffect(() => {
    const Ctor = recognitionCtor();
    // Голоса в Chrome приходят асинхронно; первый вызов их подгружает.
    if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices();

    let rec: Rec | null = null;
    let restartTimer: number | null = null;
    let speakTimer: number | null = null;
    let netFails = 0;
    let quickEnds = 0;
    let startedAt = 0;
    // Автозапуск после перезагрузки страницы — без жеста; если браузер
    // не пустит, тихо показываем приглашение вместо ошибки.
    let autoStart = false;
    let aiFails = 0;
    let lastSay = "";
    const undo: Snapshot[] = [];

    // ---------- слух ----------

    const stopListening = () => {
      if (restartTimer) window.clearTimeout(restartTimer);
      restartTimer = null;
      const r = rec;
      rec = null;
      if (r) {
        r.onend = null;
        r.onresult = null;
        r.onerror = null;
        try {
          r.abort();
        } catch {
          /* уже остановлен */
        }
      }
    };

    const scheduleListen = (ms: number) => {
      if (restartTimer) window.clearTimeout(restartTimer);
      restartTimer = window.setTimeout(listen, ms);
    };

    const listen = () => {
      restartTimer = null;
      const st = getVoiceState();
      if (!st.enabled || !Ctor || rec || st.status === "speaking" || st.status === "thinking") return;
      if (document.visibilityState === "hidden") return;
      const r = new Ctor();
      r.lang = "ru-RU";
      r.interimResults = true;
      // Непрерывно: одна сессия ловит фразу за фразой; когда браузер её
      // всё же закрывает (пауза, минута тишины), onend открывает новую.
      r.continuous = true;
      r.maxAlternatives = 1;
      let failed: string | null = null;
      r.onresult = (e) => {
        autoStart = false;
        netFails = 0;
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          const text = res[0].transcript.trim();
          if (res.isFinal) {
            if (text) {
              stopListening();
              setVoiceState({ live: "" });
              handle(text);
              return;
            }
          } else {
            interim += res[0].transcript;
          }
        }
        micPulse = 1;
        setVoiceState({ live: interim.trim() });
      };
      r.onerror = (e) => {
        failed = e.error;
      };
      r.onend = () => {
        rec = null;
        if (!getVoiceState().enabled) return;
        if (failed === "not-allowed" || failed === "service-not-allowed") {
          if (autoStart) {
            autoStart = false;
            setVoiceState({ enabled: false, status: "idle", live: "", invite: true });
          } else {
            disable();
            setVoiceState({
              panelOpen: true,
              notice: "Разреши микрофон: значок замка в адресной строке",
            });
          }
          return;
        }
        if (failed === "network") {
          netFails += 1;
          if (netFails >= 3) {
            disable();
            setVoiceState({ panelOpen: true, notice: "Распознавание речи сейчас недоступно — напиши текстом." });
            return;
          }
          scheduleListen(1200);
          return;
        }
        // Браузер закрыл сессию сам (тишина) — открываем новую. Если сессии
        // схлопываются мгновенно одна за другой, даём паузу побольше.
        quickEnds = Date.now() - startedAt < 400 ? quickEnds + 1 : 0;
        scheduleListen(quickEnds > 3 ? 2500 : 200);
      };
      rec = r;
      startedAt = Date.now();
      setVoiceState({ status: "listening" });
      try {
        r.start();
      } catch {
        rec = null;
        scheduleListen(800);
      }
    };

    // ---------- голос ----------

    let audio: HTMLAudioElement | null = null;
    let liveVoice = true;
    let browserSpeaking = false;
    const getAudio = () => (audio ??= new Audio());

    // ---------- громкость для волны ----------
    //
    // Волна качается в такт настоящему голосу. Живой голос ассистента идёт
    // через AudioContext с анализатором. Микрофон на компьютере слушаем
    // напрямую; на телефоне второй поток микрофона мешает распознаванию
    // (Android отдаёт микрофон кому-то одному), поэтому там такт берём из
    // самого распознавания — каждый услышанный кусок речи даёт всплеск.
    // Голос браузера не анализируется — для него мягкая имитация речи.
    let actx: AudioContext | null = null;
    let outAn: AnalyserNode | null = null;
    let micAn: AnalyserNode | null = null;
    let micStream: MediaStream | null = null;
    let micPulse = 0;
    const buf = new Uint8Array(512);
    const rms = (an: AnalyserNode) => {
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / buf.length);
    };
    let levelRaf = 0;
    const levelLoop = (now: number) => {
      levelRaf = requestAnimationFrame(levelLoop);
      const st = getVoiceState().status;
      let target = 0;
      if (st === "speaking") {
        target =
          browserSpeaking || !outAn
            ? 0.35 + 0.45 * Math.abs(Math.sin(now / 137) * Math.sin(now / 419))
            : Math.min(1, rms(outAn) * 5);
      } else if (st === "listening") {
        micPulse *= 0.92;
        target = micAn ? Math.min(1, rms(micAn) * 7) : micPulse;
      }
      const cur = voiceLevel.value;
      voiceLevel.value = target > cur ? cur + (target - cur) * 0.55 : cur * 0.88 + target * 0.12;
    };
    levelRaf = requestAnimationFrame(levelLoop);

    const setupAudioGraph = () => {
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        actx ??= new AC();
        actx.resume().catch(() => {});
        if (!outAn) {
          const src = actx.createMediaElementSource(getAudio());
          outAn = actx.createAnalyser();
          outAn.fftSize = 512;
          src.connect(outAn);
          outAn.connect(actx.destination);
        }
      } catch {
        /* без анализатора волна просто качается ровно */
      }
    };

    const stopSpeaking = () => {
      if (speakTimer) window.clearTimeout(speakTimer);
      speakTimer = null;
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
    };

    const speakBrowser = (text: string, finish: () => void) => {
      if (typeof speechSynthesis === "undefined") {
        finish();
        return;
      }
      browserSpeaking = true;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ru-RU";
      const v = pickVoice();
      if (v) u.voice = v;
      // Чуть медленнее обычного и без подъёма тона — спокойнее и мягче.
      u.rate = 0.95;
      u.pitch = 1;
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
      // Chrome иногда не присылает onend — страховка по длине фразы.
      speakTimer = window.setTimeout(finish, 2500 + text.length * 90);
    };

    // Живой голос (Yandex SpeechKit через /api/tts) играет один и тот же
    // <audio>: iOS разрешает звук только элементу, который уже раз играл из
    // нажатия. Если сервис голоса не настроен или упал, до конца визита
    // говорим голосом браузера, без задержек.
    const speak = (text: string, then: () => void) => {
      stopSpeaking();
      if (!text) {
        then();
        return;
      }
      stopListening();
      setVoiceState({ status: "speaking" });
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        browserSpeaking = false;
        if (speakTimer) window.clearTimeout(speakTimer);
        speakTimer = null;
        setVoiceState({ status: "idle" });
        then();
      };
      if (!liveVoice) {
        speakBrowser(text, finish);
        return;
      }
      const el = getAudio();
      let fellBack = false;
      const fallback = () => {
        if (fellBack || done) return;
        fellBack = true;
        liveVoice = false;
        el.onended = null;
        el.onerror = null;
        speakBrowser(text, finish);
      };
      el.onended = finish;
      el.onerror = fallback;
      el.src = `/api/tts?text=${encodeURIComponent(text)}`;
      el.play().catch(fallback);
    };

    // ---------- действия ----------

    const snapshot = (): Snapshot => ({
      path: live.current.pathname,
      chapter: live.current.current(),
      scrollY: window.scrollY,
    });

    const goHref = (href: string) => {
      const { pathname: path, goTo: go, router: r } = live.current;
      window.dispatchEvent(new Event(VOICE_NAV_EVENT));
      const [pagePath, hash] = href.split("#");
      if (pagePath === path && hash) {
        if (!go(hash)) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else if (pagePath === path) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        r.push(href);
      }
    };

    /** Выполнить действие. Навигация — сразу, пока ассистент говорит;
     *  связь — после фразы. Может подменить фразу ответа. */
    const act = (a: VoiceAction): { say?: string; after?: () => void } => {
      const { pathname: path, step: stepFn, firstId: first, goTo: go, setMenuOpen: openMenu } = live.current;
      const here = serviceFromPath(path);
      const nav = () => {
        undo.push(snapshot());
        if (undo.length > 20) undo.shift();
        window.dispatchEvent(new Event(VOICE_NAV_EVENT));
      };
      switch (a.type) {
        case "route":
          nav();
          goHref(a.href);
          return {};
        case "step":
          nav();
          if (!stepFn(a.delta)) window.scrollBy({ top: a.delta * window.innerHeight * 0.85, behavior: "smooth" });
          return {};
        case "page": {
          nav();
          const i = here ? serviceOrder.indexOf(here) : -1;
          const next = i < 0 ? serviceOrder[0] : serviceOrder[(i + a.delta + serviceOrder.length) % serviceOrder.length];
          goHref(`/${serviceMeta[next].slug}`);
          return { say: `${serviceMeta[next].label}.` };
        }
        case "top":
          nav();
          if (!(first && go(first))) window.scrollTo({ top: 0, behavior: "smooth" });
          return {};
        case "bottom": {
          nav();
          const last = here ? blocksFor(here).at(-1) : null;
          if (!(last && go(last.id))) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          return {};
        }
        case "undo": {
          const prev = undo.pop();
          if (!prev) return { say: "Пока нечего отменять." };
          window.dispatchEvent(new Event(VOICE_NAV_EVENT));
          if (prev.path === path) {
            if (!(prev.chapter && go(prev.chapter))) window.scrollTo({ top: prev.scrollY, behavior: "smooth" });
          } else {
            live.current.router.push(prev.chapter ? `${prev.path}#${prev.chapter}` : prev.path);
          }
          return {};
        }
        case "repeat":
          return { say: lastSay || "Я пока ничего не говорила." };
        case "menu":
          window.dispatchEvent(new Event(VOICE_NAV_EVENT));
          openMenu(true);
          return {};
        case "vibe":
          window.dispatchEvent(new Event(VOICE_NAV_EVENT));
          window.dispatchEvent(new Event(OPEN_VIBE_EVENT));
          return {};
        case "team":
          window.dispatchEvent(new Event(VOICE_NAV_EVENT));
          setVoiceState({ team: a.id, panelOpen: false });
          return {};
        case "close":
          setVoiceState({ panelOpen: false });
          return {};
        case "call":
          setVoiceState({ contact: "call" });
          // Сам набирает только на телефоне; на компьютере остаётся кнопка.
          if (!window.matchMedia("(pointer: coarse)").matches) return {};
          return {
            after: () => {
              window.location.href = `tel:${CONTACTS.phone}`;
            },
          };
        case "telegram":
          setVoiceState({ contact: "telegram" });
          return { after: () => void window.open(CONTACTS.telegram, "_blank", "noopener") };
        case "whatsapp":
          setVoiceState({ contact: "whatsapp" });
          return { after: () => void window.open(CONTACTS.whatsapp, "_blank", "noopener") };
        case "music":
          return musicAct(a);
        default:
          return {};
      }
    };

    // Действия выполняются молча (Егор: «не надо отвечать, просто реагируй») —
    // фраза только мелькает подписью над волной. Вслух — ответы на вопросы,
    // подсказки, «не поняла» и «выключаю».
    const SPOKEN = new Set(["none", "repeat", "stop"]);
    const respond = (say: string, action: VoiceAction, answer = false) => {
      const { say: override, after } = act(action);
      const text = override ?? say;
      const aloud = answer || SPOKEN.has(action.type) || Boolean(override);
      if (text) {
        if (action.type !== "repeat") lastSay = text;
        setVoiceState((st) => ({ turns: [...st.turns, { role: "assistant" as const, text }].slice(-10), pulse: st.pulse + 1 }));
      } else {
        setVoiceState((st) => ({ pulse: st.pulse + 1 }));
      }
      speak(aloud ? text : "", () => {
        after?.();
        if (action.type === "stop") {
          disable();
          return;
        }
        if (getVoiceState().enabled) scheduleListen(aloud ? 120 : 40);
      });
    };

    const handle = async (text: string) => {
      setVoiceState((st) => ({ turns: [...st.turns, { role: "user" as const, text }].slice(-10), live: "", contact: null, notice: null }));
      const path = live.current.pathname;
      let local = parseCommand(text, path);
      // «Нажми …»: не нашли такой кнопки — разбираем фразу как обычную команду.
      if (local?.action.type === "click") {
        if (pressOnScreen(local.action.query)) {
          respond("", { type: "click", query: local.action.query });
          return;
        }
        local = parseCommand(text, path, false, true);
      }
      if (local) {
        respond(local.say, local.action);
        return;
      }
      const soft = () => {
        const loose = parseCommand(text, path, true);
        if (loose) respond(loose.say, loose.action);
        else respond("Не совсем поняла. Скажи, например: «дальше», «открой сайты» или «покажи цены».", { type: "none" });
      };
      // ИИ дважды не ответил — дальше до конца визита разбираем сами, без ожидания.
      if (aiFails >= 2) {
        soft();
        return;
      }
      stopListening();
      setVoiceState({ status: "thinking" });
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, path, history: getVoiceState().turns.slice(0, -1) }),
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { say: string; action: { type: string; href?: string } | null };
        aiFails = 0;
        setVoiceState({ status: "idle" });
        const action: VoiceAction = data.action
          ? data.action.type === "route" && data.action.href
            ? { type: "route", href: data.action.href }
            : ({ type: data.action.type } as VoiceAction)
          : { type: "none" };
        respond(data.say, action, true);
      } catch {
        aiFails += 1;
        setVoiceState({ status: "idle" });
        soft();
      }
    };

    // ---------- включение ----------

    // Разрешение на микрофон спрашивается прямо в нажатии «Включить»:
    // браузер показывает свой запрос в ту же секунду, после «Разрешить»
    // ассистент сразу слушает. Chrome запоминает разрешение для сайта.
    const unlockMic = async (): Promise<boolean> => {
      if (!navigator.mediaDevices?.getUserMedia) return true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (actx && window.matchMedia("(pointer: fine)").matches) {
          micStream?.getTracks().forEach((t) => t.stop());
          micStream = stream;
          micAn = actx.createAnalyser();
          micAn.fftSize = 512;
          actx.createMediaStreamSource(stream).connect(micAn);
        } else {
          stream.getTracks().forEach((t) => t.stop());
        }
        return true;
      } catch {
        return false;
      }
    };

    // Звук на iOS разрешается только из жеста — «разогреваем» оба голоса.
    const warmAudio = () => {
      if (typeof speechSynthesis !== "undefined") speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      const el = getAudio();
      setupAudioGraph();
      el.src = SILENCE;
      el.play().catch(() => {});
    };

    const enable = () => {
      warmAudio();
      setVoiceState({ invite: false, notice: null });
      if (!Ctor) {
        setVoiceState({ panelOpen: true });
        return;
      }
      setVoiceState({ status: "thinking" });
      unlockMic().then((ok) => {
        if (!ok) {
          setVoiceState({
            status: "idle",
            panelOpen: true,
            notice: "Разреши микрофон: значок замка в адресной строке",
          });
          return;
        }
        autoStart = false;
        netFails = 0;
        writeFlag(ON_KEY, true);
        setVoiceState({ enabled: true, status: "idle" });
        const hello = "Голос включён. Говори, что нужно.";
        lastSay = hello;
        setVoiceState((st) => ({ turns: [...st.turns, { role: "assistant" as const, text: hello }], pulse: st.pulse + 1 }));
        speak(hello, () => scheduleListen(120));
      });
    };

    function disable() {
      writeFlag(ON_KEY, false);
      micStream?.getTracks().forEach((t) => t.stop());
      micStream = null;
      micAn = null;
      stopListening();
      stopSpeaking();
      setVoiceState({ enabled: false, status: "idle", live: "" });
    }

    registerVoiceEngine({
      tap: (inStage?: boolean) => {
        const st = getVoiceState();
        if (!st.enabled) {
          // Первое нажатие — сначала знакомство: что умеет голос и короткая
          // тренировка (Егор, 2026-09-27). Голос включается внутри него.
          if (!inStage && !readFlag(TOUR_KEY)) {
            setVoiceState({ tour: true, invite: false });
            return;
          }
          enable();
          return;
        }
        if (st.status === "speaking") {
          // Перебить: замолчать и сразу слушать.
          stopSpeaking();
          setVoiceState({ status: "idle" });
          scheduleListen(0);
          return;
        }
        // Волна внутри окна не закрывает окно — для этого крестик.
        if (inStage) return;
        setVoiceState({ panelOpen: !st.panelOpen });
      },
      enable,
      disable,
      dismissInvite: () => {
        writeFlag(INVITE_KEY, true);
        setVoiceState({ invite: false });
      },
      send: (text: string) => {
        const t = text.trim();
        if (!t) return;
        stopListening();
        stopSpeaking();
        setVoiceState({ status: "idle" });
        handle(t);
      },
      closePanel: () => setVoiceState({ panelOpen: false }),
    });

    // Первое состояние: голос уже был включён — пробуем продолжить без
    // нажатия; иначе приглашаем.
    const wasOn = readFlag(ON_KEY);
    setVoiceState({
      canListen: Boolean(Ctor),
      invite: Boolean(Ctor) && !wasOn && !readFlag(INVITE_KEY),
    });
    if (Ctor && wasOn) {
      autoStart = true;
      setVoiceState({ enabled: true });
      scheduleListen(600);
    }

    // Вкладка вернулась на экран — браузер к этому времени закрыл сессию.
    const onVisible = () => {
      if (document.visibilityState === "visible" && getVoiceState().enabled && !rec) scheduleListen(200);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      cancelAnimationFrame(levelRaf);
      micStream?.getTracks().forEach((t) => t.stop());
      actx?.close().catch(() => {});
      registerVoiceEngine(null);
      stopListening();
      stopSpeaking();
    };
  }, []);

  // Музыка уступает голосу: пока человек говорит (идёт распознавание),
  // ассистент думает или отвечает, плеер плавно тише, потом возвращается —
  // как музыка в машине под навигатор. Просто включённое «слушание» без
  // речи музыку не трогает, иначе с голосом она была бы тихой всегда.
  const talking = s.status === "speaking" || s.status === "thinking" || (s.status === "listening" && !!s.live);
  useEffect(() => {
    sound()?.duck(talking);
  }, [talking]);

  const svc = serviceFromPath(pathname);
  const accent = PAGE_GRADIENT[svc ?? "content"];
  // Волна внизу — этап `voice` очереди загрузки (lib/boot-sequence): после
  // первого экрана и сферы вайб-бара.
  const voiceOn = useBootStage(BOOT.voice);
  const showFloating = voiceOn && s.inlineCount === 0 && !s.panelOpen && !s.tour;

  return (
    <>
      <AnimatePresence>
        {showFloating && (
          <motion.div
            key="voice-dock"
            className="voice-dock-corner fixed z-[66]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <VoiceDock width={164} height={62} from={accent.from} to={accent.to} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.panelOpen && <VoicePanel key="voice-panel" from={accent.from} to={accent.to} />}
      </AnimatePresence>

      <AnimatePresence>{s.tour && <VoiceTour key="voice-tour" from={accent.from} to={accent.to} />}</AnimatePresence>

      {s.team && TEAM[s.team] && (
        <TeamConsultModal open onClose={() => setVoiceState({ team: null })} member={TEAM[s.team]} />
      )}
    </>
  );
}

/** Голосовые команды плееру (lib/sound). Выполняются молча, как и
 *  навигация; вслух — только «что играет» и «здесь пока нет треков». */
function musicAct(a: Extract<VoiceAction, { type: "music" }>): { say?: string } {
  const s = sound();
  if (!s) return {};
  switch (a.op) {
    case "play": {
      if (a.mood) {
        const m = MOODS.find((x) => x.id === a.mood);
        if (!m?.tracks.length) return { say: `Треки для настроения «${m?.label}» ещё подбираем.` };
        s.moodPicked = true;
        s.setMood(a.mood);
      }
      if (!s.musicPlaying) s.toggleMusic(true);
      return {};
    }
    case "pause":
      s.toggleMusic(false);
      return {};
    case "next":
    case "prev":
      if (!s.musicPlaying) s.toggleMusic(true);
      s.skip(a.op === "next" ? 1 : -1);
      return {};
    case "louder":
    case "quieter":
      s.setVolume(s.settings.volume + (a.op === "louder" ? 0.15 : -0.15));
      return {};
    case "what": {
      const t = s.track;
      if (!s.musicPlaying || !t) return { say: "Сейчас музыка не играет. Скажи «включи музыку»." };
      return { say: `Играет «${t.title}», ${t.artist}. Настроение — ${s.mood.label}.` };
    }
  }
}

/** Волна-кнопка: полупрозрачная в покое, проявляется при наведении и
 *  когда голос включён; раскачивается сильнее, пока слушает или говорит. */
function VoiceWaveButton({ width, height, from, to }: { width: number; height: number; from: string; to: string }) {
  const s = useVoiceState();
  const live = s.status === "listening" || s.status === "speaking";
  return (
    <button
      type="button"
      onClick={() => voice.tap()}
      aria-label={s.enabled ? "Открыть окно ассистента" : "Включить голосовое управление"}
      className={`voice-sphere ${live ? "is-listening" : ""} ${s.enabled ? "is-active" : ""}`}
      style={{ "--g-from": from, "--g-to": to } as CSSProperties}
    >
      <span className="voice-sphere-core relative grid place-items-center">
        <NanoWave width={width} height={height} from={from} to={to} hot={live} pulse={s.pulse} level={getVoiceLevel} particles={false} sleepy />
      </span>
    </button>
  );
}

/** Волна с тем, что над ней: приглашение включить голос или короткая
 *  подпись — что услышано и что ответил ассистент (пока окно закрыто). */
function VoiceDock({
  width,
  height,
  from,
  to,
  waveOnly = false,
}: {
  width: number;
  height: number;
  from: string;
  to: string;
  /** Только волна, без приглашения и подписей над ней (вайб-окно). */
  waveOnly?: boolean;
}) {
  // На телефоне волна вдвое меньше (Егор, 2026-09-27): полноразмерная
  // закрывала низ экрана. Рисуем меньший холст, а не сжимаем CSS-ом, —
  // так линии остаются чёткими.
  const phone = usePhone();
  if (phone) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
  }
  return (
    <div className="voice-dock" data-voice-ui style={{ "--g-from": from, "--g-to": to } as CSSProperties}>
      {!waveOnly && <VoiceInvite />}
      {!waveOnly && <VoiceCaption />}
      <VoiceWaveButton width={width} height={height} from={from} to={to} />
    </div>
  );
}

function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}

function VoiceInvite() {
  const s = useVoiceState();
  return (
    <AnimatePresence>
      {s.invite && !s.enabled && (
        <motion.div
          key="invite"
          className="voice-invite"
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="voice-invite-text">Управляй сайтом голосом</span>
          <button type="button" className="voice-invite-on" onClick={() => voice.enable()}>
            Включить
          </button>
          <button type="button" className="voice-invite-x" aria-label="Не сейчас" onClick={() => voice.dismissInvite()}>
            <CloseIcon />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Подсказки над волной — иногда всплывают и тают, показывая, что умеет
// ассистент (Егор: «стильные подсказки над волной: я могу то-то»).
const DOCK_HINTS = [
  "Скажи «следующий блок» — пролистаю",
  "«Страница лендингов» — открою",
  "«Напиши Саше» — открою чат",
  "«Нажми подробнее» — нажму за тебя",
  "«Покажи цены на SMM»",
  "«Отмени» — верну, как было",
  "«В шапку» — наверх страницы",
  "Спроси: сколько стоит ролик?",
];

function VoiceCaption() {
  const s = useVoiceState();
  const [shown, setShown] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const last = s.turns.at(-1);
  const text = s.live || last?.text || "";
  const mine = Boolean(s.live) || last?.role === "user";

  // Подпись живёт, пока идёт разговор, и гаснет через 3 с тишины.
  useEffect(() => {
    if (!text) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- показ по внешнему событию (новая реплика), не производное состояние
    setShown(true);
    setHint(null);
    if (s.status === "thinking" || s.status === "speaking") return;
    const t = window.setTimeout(() => setShown(false), 3000);
    return () => window.clearTimeout(t);
  }, [text, s.status]);

  // В тишине раз в 16 с — одна подсказка на 3.5 с. Пока висит приглашение
  // «Включить», подсказки молчат, чтобы не было двух плашек.
  const quiet = !s.panelOpen && !s.invite && !shown;
  useEffect(() => {
    if (!quiet) return;
    let i = 0;
    let hide = 0;
    const tick = window.setInterval(() => {
      setHint(DOCK_HINTS[i++ % DOCK_HINTS.length]);
      hide = window.setTimeout(() => setHint(null), 3500);
    }, 16000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hide);
    };
  }, [quiet]);

  const visible = s.enabled && !s.panelOpen && shown && Boolean(text);
  const line = visible ? (s.status === "thinking" ? "Думаю…" : text) : quiet ? hint : null;
  return (
    <AnimatePresence mode="wait">
      {line && (
        <motion.p
          key={visible ? "caption" : line}
          className={`voice-caption ${visible && mine ? "voice-caption--me" : ""} ${visible ? "" : "voice-caption--hint"}`}
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.45, 0, 0.15, 1] }}
          aria-live="polite"
        >
          {line}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** Встроенная волна для стартовой сцены: пока она на экране, плавающая
 *  прячется. */
export function InlineVoiceSphere({
  from,
  to,
  width = 240,
  height = 56,
  waveOnly = false,
}: {
  from: string;
  to: string;
  width?: number;
  height?: number;
  waveOnly?: boolean;
}) {
  useEffect(() => {
    setVoiceState((st) => ({ inlineCount: st.inlineCount + 1 }));
    return () => setVoiceState((st) => ({ inlineCount: Math.max(0, st.inlineCount - 1) }));
  }, []);
  return <VoiceDock width={width} height={height} from={from} to={to} waveOnly={waveOnly} />;
}

/** Окно ассистента по центру экрана (Егор: «никаких чатов, никаких слов —
 *  просто красиво»). В центре — большая волна, по краям ~20% воздуха; под
 *  ней одна тихая строка: что ты сказал, что ответил ассистент, а в паузах —
 *  подсказки, что можно сказать. Каждая проявляется и растворяется. */
function VoicePanel({ from, to }: { from: string; to: string }) {
  const s = useVoiceState();
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const hot = s.status === "listening" || s.status === "speaking";

  return (
    <motion.div
      role="dialog"
      aria-label="Голосовой ассистент"
      className="voice-stage fixed z-[110]"
      data-voice-ui
      style={{ "--g-from": from, "--g-to": to } as CSSProperties}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type="button" onClick={() => voice.closePanel()} aria-label="Закрыть" className="voice-stage-close">
        <CloseIcon />
      </button>

      <div ref={ref} className="voice-stage-wave">
        {w > 0 && (
          <button
            type="button"
            onClick={() => voice.tap(true)}
            aria-label={s.enabled ? "Перебить ассистента" : "Включить голос"}
            className="voice-sphere"
          >
            <NanoWave
              // Вдвое меньше прежнего (Егор, 2026-09-28): волна в окне
              // ассистента не должна заполнять всё окно.
              width={Math.round(w * 0.3)}
              height={Math.round(Math.min(65, w * 0.15))}
              from={from}
              to={to}
              hot={hot}
              pulse={s.pulse}
              sparkle
              level={getVoiceLevel}
            />
          </button>
        )}
      </div>

      <VoiceTicker />

      {s.contact && (
        <div className="voice-stage-contact">
          <ContactButton kind={s.contact} />
        </div>
      )}

      {!s.canListen && (
        <form
          className="voice-input"
          onSubmit={(e) => {
            e.preventDefault();
            voice.send(draft);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Напиши, что нужно…"
            aria-label="Сообщение ассистенту"
            enterKeyHint="send"
          />
          <button type="submit" aria-label="Отправить" disabled={!draft.trim()}>
            <SendIcon />
          </button>
        </form>
      )}
    </motion.div>
  );
}

/** Одна тихая строка под волной. Приоритет: что слышно прямо сейчас →
 *  свежая реплика (2.8 с) → предупреждение → подсказки по кругу. */
function VoiceTicker() {
  const s = useVoiceState();
  const [hint, setHint] = useState(0);
  const [fresh, setFresh] = useState<{ id: number; text: string; me: boolean } | null>(null);
  const turns = s.turns.length;
  const last = s.turns.at(-1);

  useEffect(() => {
    if (!last) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- показ по внешнему событию (новая реплика)
    setFresh({ id: turns, text: last.text, me: last.role === "user" });
    const t = window.setTimeout(() => setFresh(null), 2800);
    return () => window.clearTimeout(t);
  }, [turns, last]);

  useEffect(() => {
    const t = window.setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  let key: string;
  let text: string;
  let me = false;
  if (s.live) {
    key = "live";
    text = s.live;
    me = true;
  } else if (s.status === "thinking") {
    key = "think";
    text = "…";
  } else if (fresh) {
    key = `turn-${fresh.id}`;
    text = fresh.text;
    me = fresh.me;
  } else if (s.notice) {
    key = "notice";
    text = s.notice;
  } else if (!s.enabled) {
    key = `off-${hint % 2}`;
    text = hint % 2 ? HINTS[hint] : s.canListen ? "Коснись волны — и говори" : "Напиши, что нужно";
  } else {
    key = `hint-${hint}`;
    text = HINTS[hint];
  }

  return (
    <div className="voice-ticker" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={key}
          className={`voice-ticker-line ${me ? "is-me" : ""}`}
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.15, 1] }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ContactButton({ kind }: { kind: "call" | "telegram" | "whatsapp" }) {
  const map = {
    call: { href: `tel:${CONTACTS.phone}`, label: "Позвонить продюсеру", icon: <PhoneIcon /> },
    telegram: { href: CONTACTS.telegram, label: "Открыть Телеграм", icon: <TelegramIcon /> },
    whatsapp: { href: CONTACTS.whatsapp, label: "Открыть WhatsApp", icon: <WhatsAppIcon /> },
  }[kind];
  return (
    <a
      href={map.href}
      target={kind === "call" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="voice-contact btn-neon"
    >
      {map.icon}
      {map.label}
    </a>
  );
}
