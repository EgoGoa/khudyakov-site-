"use client";

import { useSyncExternalStore } from "react";

// Одно состояние голосового ассистента на весь сайт. Сфер две — в стартовой
// сцене (WelcomeWidget) и плавающая (VoiceAssistant), — а разговор один:
// нажал на любую, и ведёт его один и тот же движок в VoiceAssistant.

/** Ассистент уходит по сайту — стартовая сцена должна закрыться. */
export const VOICE_NAV_EVENT = "hdkv:voice-nav";
/** «Подбери предложение» — VibeRail открывает вайб-режим. */
export const OPEN_VIBE_EVENT = "hdkv:open-vibe";

export type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";
export type VoiceTurn = { role: "user" | "assistant"; text: string };

export type VoiceState = {
  /** Голос включён: сайт слушает на всех страницах, пока посетитель на нём
   *  (выбор Егора 2026-09-26 — «голос всегда на связи»). */
  enabled: boolean;
  /** Открыто окно-чат. Голос работает и без него. */
  panelOpen: boolean;
  status: VoiceStatus;
  /** Что слышно прямо сейчас (промежуточный текст распознавания). */
  live: string;
  turns: VoiceTurn[];
  /** Браузер умеет распознавать речь (в Firefox — нет). */
  canListen: boolean;
  notice: string | null;
  /** Кнопка связи, которую браузер мог не дать открыть сам (всплывающие
   *  окна вне нажатия блокируются). */
  contact: "call" | "telegram" | "whatsapp" | null;
  /** Сколько встроенных волн сейчас на экране — пока есть хоть одна,
   *  плавающая прячется, чтобы не было двух. */
  inlineCount: number;
  /** Растёт на каждый ответ — всплеск волны. */
  pulse: number;
  /** Показать приглашение «Управляй сайтом голосом». */
  invite: boolean;
};

let state: VoiceState = {
  enabled: false,
  panelOpen: false,
  status: "idle",
  live: "",
  turns: [],
  canListen: true,
  notice: null,
  contact: null,
  inlineCount: 0,
  pulse: 0,
  invite: false,
};

/** Громкость голоса прямо сейчас, 0..1: твоего, пока ассистент слушает,
 *  и его собственного, пока говорит. Меняется каждый кадр — поэтому не в
 *  React-состоянии, волна читает её сама. */
export const voiceLevel = { value: 0 };
export const getVoiceLevel = () => voiceLevel.value;

const listeners = new Set<() => void>();

export function getVoiceState() {
  return state;
}

export function setVoiceState(patch: Partial<VoiceState> | ((s: VoiceState) => Partial<VoiceState>)) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVoiceState() {
  return useSyncExternalStore(subscribe, getVoiceState, getVoiceState);
}

// Движок регистрирует себя здесь; сферы только дёргают эти функции.
type Engine = {
  /** Нажатие на волну: включить голос / перебить / открыть-скрыть окно. */
  tap: () => void;
  /** Кнопка «Включить» в приглашении. */
  enable: () => void;
  disable: () => void;
  dismissInvite: () => void;
  send: (text: string) => void;
  closePanel: () => void;
};
let engine: Engine | null = null;

export function registerVoiceEngine(e: Engine | null) {
  engine = e;
}

export const voice = {
  tap: () => engine?.tap(),
  enable: () => engine?.enable(),
  disable: () => engine?.disable(),
  dismissInvite: () => engine?.dismissInvite(),
  send: (text: string) => engine?.send(text),
  closePanel: () => engine?.closePanel(),
};
