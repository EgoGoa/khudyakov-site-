"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// WelcomeOverlay (in the layout) and ServiceMenuOverlay (in each page) can
// both be mounted at the same instant on a fresh landing — without this,
// both ran their full animated stack (backdrop-blur, the voice graphic,
// speech recognition setup) at once, which is what made the site feel like
// it hung right after opening a menu. ServiceMenuOverlay checks welcomeOpen
// and renders nothing until the welcome overlay has actually closed.
//
// skippedToSite tracks the other way out: picking "Обычная версия" (or the
// quiet "Перейти на сайт" link) should drop straight to the normal site, not
// hand off into the next guided screen the moment the welcome overlay closes.
// It stays true for the rest of this client-side session — once someone's
// chosen the classic site, later navigations within /content, /ai, /sites,
// /smm shouldn't keep re-surfacing the guided submenu either.
const WelcomeGateContext = createContext<{
  welcomeOpen: boolean;
  setWelcomeOpen: (open: boolean) => void;
  skippedToSite: boolean;
  setSkippedToSite: (skipped: boolean) => void;
}>({ welcomeOpen: true, setWelcomeOpen: () => {}, skippedToSite: false, setSkippedToSite: () => {} });

export function WelcomeGateProvider({ children }: { children: ReactNode }) {
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [skippedToSite, setSkippedToSite] = useState(false);
  return (
    <WelcomeGateContext.Provider value={{ welcomeOpen, setWelcomeOpen, skippedToSite, setSkippedToSite }}>
      {children}
    </WelcomeGateContext.Provider>
  );
}

export function useWelcomeGate() {
  return useContext(WelcomeGateContext);
}
