"use client";

import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

// Header lives outside CinematicStage's own tree — they are siblings under
// RootLayout — so this is the bridge between them, for the cinematic deck on
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
// deliberate move instead.
type GoToFn = (id: string) => boolean;

const CinematicNavContext = createContext<{
  register: (fn: GoToFn | null) => void;
  goTo: (id: string) => boolean;
}>({
  register: () => {},
  goTo: () => false,
});

export function CinematicNavProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<GoToFn | null>(null);
  const register = useCallback((fn: GoToFn | null) => {
    fnRef.current = fn;
  }, []);
  // Stable identity so consumers (Header) don't need it in a dependency
  // array — always calls whichever CinematicStage is registered right now.
  const goTo = useCallback((id: string) => fnRef.current?.(id) ?? false, []);

  return (
    <CinematicNavContext.Provider value={{ register, goTo }}>
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
