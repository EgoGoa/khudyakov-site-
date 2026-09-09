"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// Header lives outside CinematicStage's own tree (siblings under RootLayout,
// the same relationship FullpageProvider already bridges for the homepage's
// fullpage deck) — this is the same bridge for the cinematic deck on
// /content, /ai, /sites, /smm.
//
// Without it, a menu link to a chapter far from the current one was just a
// plain `#id` anchor: the browser's native hash-jump moves scrollY instantly,
// which CinematicStage's own onScroll then reads and — because that same
// listener also has to defend against a trackpad's momentum silently
// carrying scrollY across more than one chapter mid-gesture (see its own
// comment) — clamps to only one chapter away from wherever the visitor was,
// landing on the wrong chapter instead of the one actually clicked.
// Registering a direct `goTo(id)` here lets a menu click step there in one
// deliberate move instead, the same way fullpage.tsx's goTo already does for
// the homepage.
type GoToFn = (id: string) => boolean;

const CinematicNavContext = createContext<{
  register: (fn: GoToFn | null, firstId?: string | null) => void;
  goTo: (id: string) => boolean;
  /** id первой главы смонтированного дека, если он на странице есть. */
  firstId: string | null;
}>({
  register: () => {},
  goTo: () => false,
  firstId: null,
});

export function CinematicNavProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<GoToFn | null>(null);
  // id первой главы держится в состоянии, а не в ref: его читает кнопка
  // «наверх» из корневого layout, и на ref она бы не перерисовалась —
  // кнопка так и не узнала бы, что на странице появился дек.
  const [firstId, setFirstId] = useState<string | null>(null);
  const register = useCallback((fn: GoToFn | null, first: string | null = null) => {
    fnRef.current = fn;
    setFirstId(first);
  }, []);
  // Stable identity so consumers (Header) don't need it in a dependency
  // array — always calls whichever CinematicStage is registered right now.
  const goTo = useCallback((id: string) => fnRef.current?.(id) ?? false, []);

  return (
    <CinematicNavContext.Provider value={{ register, goTo, firstId }}>
      {children}
    </CinematicNavContext.Provider>
  );
}

/** For CinematicStage: registers its own goTo(id), returning whether `id`
 *  matched one of its chapters. Call with `null` on unmount. */
export function useCinematicNavRegister() {
  return useContext(CinematicNavContext).register;
}

/** For Header (or anything else wanting to jump straight to a chapter). */
export function useCinematicGoTo() {
  return useContext(CinematicNavContext).goTo;
}

/** id первой главы дека на текущей странице — или null, если дека нет.
 *
 *  Нужен кнопке «наверх»: Егор просил, чтобы она возвращала не в самый верх
 *  документа, а в первый блок страницы («в СММ это блок 01 — SMM силами
 *  продакшена»). На страницах с деком верх документа — это ещё общий герой
 *  сайта, а первый блок — нулевая глава дека. */
export function useCinematicFirstId() {
  return useContext(CinematicNavContext).firstId;
}
