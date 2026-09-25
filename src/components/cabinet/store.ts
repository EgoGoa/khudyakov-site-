"use client";

import { useEffect, useState } from "react";

// Демо-кабинет клиента — решение Егора: быстрый тест без входа и базы.
// Всё живёт в localStorage этого браузера: заявка из чата с человеком
// команды (TeamPulse) сразу становится заказом, а рекомендации строятся по
// ответам из этого чата. Работает и на hdkv-ai.ru (статическая сборка без
// серверной части). Когда появится настоящий кабинет, этот модуль станет
// его клиентской обёрткой — интерфейс хранилища тот же.
//
// Реальное здесь одно: сообщение команде из кабинета уходит обычной
// заявкой через /api/lead, если контакт уже оставлен в чате.

export type CabinetOrder = {
  id: string;
  title: string;
  memberId: string;
  source: string;
  answers: Record<string, string>;
  stage: number;
  createdAt: number;
};

export type CabinetEvent = { at: number; text: string };

export type CabinetState = {
  /** Регистрация обязательна перед входом (решение Егора). В демо — без
   *  пароля: имя + телефон сохраняются здесь и уходят команде заявкой. */
  registered: boolean;
  name?: string;
  phone?: string;
  email?: string;
  /** Подарок за регистрацию — сколько генераций изображения осталось.
   *  Денег и бонусных рублей в кабинете нет (решение Егора). */
  gifts: number;
  /** Что клиент уже заказал в счёт подарка. */
  giftRequests: { at: number; prompt: string }[];
  /** Когда приняты соглашение, правила подарка и согласие на ПДн — след
   *  согласия, который уходит команде вместе с регистрацией. */
  agreedAt?: number;
  /** Отдельное необязательное согласие на рассылки (закон о рекламе). */
  marketing?: boolean;
  /** Мини-анкета после регистрации пройдена или отложена. */
  onboarded?: boolean;
  profile: { niche?: string; goals: string[]; want: string[] };
  orders: CabinetOrder[];
  history: CabinetEvent[];
  favorites: string[];
  cart: string[];
  dismissed: string[];
  interests: string[];
  answeredQuestion?: string;
};

const KEY = "hdkv-cabinet";
const EVENT = "hdkv-cabinet-change";
const EMPTY: CabinetState = { registered: false, gifts: 0, giftRequests: [], profile: { goals: [], want: [] }, orders: [], history: [], favorites: [], cart: [], dismissed: [], interests: [] };

/** Подарок при регистрации — 3 генерации изображения на свежих нейросетях. */
export const WELCOME_GIFTS = 3;

export const ORDER_STAGES = ["Бриф получен", "Концепции", "Выбор", "Работа", "Готово"];

export function readCabinet(): CabinetState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<CabinetState> & { bonus?: number };
    // Кабинеты, созданные при старом бонусе 5 000 ₽, получают подарок.
    if (saved.registered && saved.gifts === undefined) saved.gifts = WELCOME_GIFTS;
    delete saved.bonus;
    return { ...EMPTY, ...saved };
  } catch {
    return EMPTY;
  }
}

export function writeCabinet(update: (s: CabinetState) => CabinetState) {
  const next = update(readCabinet());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* приватный режим — кабинет живёт до перезагрузки */
  }
  window.dispatchEvent(new Event(EVENT));
  return next;
}

export function useCabinet(): CabinetState {
  const [state, setState] = useState<CabinetState>(EMPTY);
  useEffect(() => {
    const sync = () => setState(readCabinet());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}

const log = (s: CabinetState, text: string): CabinetEvent[] => [{ at: Date.now(), text }, ...s.history].slice(0, 40);

/** Заявка из чата с человеком команды → заказ в кабинете. */
export function addOrderFromChat(o: { title: string; memberId: string; source: string; answers: Record<string, string>; name: string; phone: string }) {
  writeCabinet((s) => ({
    ...s,
    name: o.name || s.name,
    phone: o.phone || s.phone,
    orders: [{ id: `o${Date.now()}`, title: o.title, memberId: o.memberId, source: o.source, answers: o.answers, stage: 0, createdAt: Date.now() }, ...s.orders],
    history: log(s, `Заявка «${o.title}» отправлена команде`),
  }));
}

export function addEvent(text: string) {
  writeCabinet((s) => ({ ...s, history: log(s, text) }));
}

export function toggleList(key: "favorites" | "cart" | "interests", id: string, label: string) {
  writeCabinet((s) => {
    const has = s[key].includes(id);
    const verb = key === "cart" ? (has ? "Убрано из корзины" : "Добавлено в корзину") : key === "favorites" ? (has ? "Убрано из избранного" : "Отложено в избранное") : has ? "Интерес убран" : "Интерес отмечен";
    return { ...s, [key]: has ? s[key].filter((x) => x !== id) : [...s[key], id], history: log(s, `${verb}: ${label}`) };
  });
}

export function dismissRec(id: string, label: string) {
  writeCabinet((s) => ({ ...s, dismissed: [...s.dismissed, id], favorites: s.favorites.includes(id) ? s.favorites : [...s.favorites, id], history: log(s, `Отложено на потом: ${label}`) }));
}

export function requestService(id: string, title: string, memberId: string) {
  writeCabinet((s) => ({
    ...s,
    dismissed: [...s.dismissed, id],
    orders: [{ id: `o${Date.now()}`, title, memberId, source: "Кабинет · рекомендация команды", answers: {}, stage: 0, createdAt: Date.now() }, ...s.orders],
    history: log(s, `Запрос отправлен: ${title}`),
  }));
}

export function answerQuestion(answer: string) {
  writeCabinet((s) => ({ ...s, answeredQuestion: answer, history: log(s, `Ответ команде: ${answer}`) }));
}

/** Регистрация: сохраняем контакт, дарим генерации и сообщаем команде
 *  обычной заявкой (тот же `fetch("/api/lead"`, что у всех форм — на
 *  статической сборке он подменяется на lead.php). */
export async function register(r: { name: string; phone: string; email?: string; marketing: boolean }) {
  writeCabinet((s) => ({
    ...s,
    registered: true,
    name: r.name,
    phone: r.phone,
    email: r.email,
    marketing: r.marketing,
    agreedAt: Date.now(),
    gifts: s.registered ? s.gifts : WELCOME_GIFTS,
    history: log(s, `Регистрация · в подарок ${WELCOME_GIFTS} генерации изображения`),
  }));
  try {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "team",
        name: r.name,
        phone: r.phone,
        email: r.email || undefined,
        fields: {
          "Кому адресовано": "Команда (личный кабинет)",
          "Событие": "Регистрация в кабинете",
          "Подарок": `${WELCOME_GIFTS} генерации изображения`,
          "Согласия": `Соглашение, правила подарка, обработка ПДн — ${new Date().toLocaleString("ru-RU")}`,
          "Рассылки": r.marketing ? "согласен(на)" : "нет",
        },
      }),
    });
  } catch {
    /* кабинет всё равно открывается — контакт сохранён локально */
  }
}

/** Генерация в счёт подарка: клиент описывает картинку, заявка уходит
 *  команде (генерируем мы, на свежих моделях), счётчик уменьшается.
 *  Автоматической генерации на сайте пока нет — нужен сервер и ключ API. */
export async function requestGift(prompt: string) {
  const s = readCabinet();
  if (s.gifts <= 0) throw new Error("no_gifts");
  writeCabinet((st) => ({
    ...st,
    gifts: st.gifts - 1,
    giftRequests: [{ at: Date.now(), prompt }, ...st.giftRequests],
    history: log(st, `Подарочная генерация заказана: «${prompt}»`),
  }));
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "team",
      name: s.name || "Клиент из кабинета",
      phone: s.phone,
      email: s.email || undefined,
      fields: {
        "Кому адресовано": "Команда (личный кабинет)",
        "Событие": `Подарочная генерация изображения (${WELCOME_GIFTS - s.gifts + 1} из ${WELCOME_GIFTS})`,
        "Что сгенерировать": prompt,
      },
    }),
  });
  if (!res.ok) throw new Error("send_failed");
}

/** Сообщение команде из кабинета — настоящая заявка. */
export async function sendToTeam(text: string) {
  const s = readCabinet();
  writeCabinet((st) => ({ ...st, history: log(st, `Сообщение команде: ${text}`) }));
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "team",
      name: s.name || "Клиент из кабинета",
      phone: s.phone,
      email: s.email || undefined,
      fields: { "Кому адресовано": "Команда (личный кабинет)", "Сообщение": text },
    }),
  });
  if (!res.ok) throw new Error("send_failed");
}

/** Мини-анкета после регистрации: можно пройти сразу или отложить —
 *  тогда кабинет попросит заполнить профиль позже. */
export function saveProfile(p: { niche?: string; goals: string[]; want: string[] }, skipped = false) {
  writeCabinet((s) => ({
    ...s,
    onboarded: true,
    profile: p,
    history: log(s, skipped ? "Анкету решено заполнить позже" : "Анкета заполнена — рекомендации подстроены"),
  }));
}
