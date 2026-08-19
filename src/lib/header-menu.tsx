"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Header and VibeRail are mounted as siblings in the root layout (Header
// inside the page column, VibeRail floating on top of everything) — this is
// the thin shared state that lets VibeRail know the desktop burger dropdown
// is open so it can step out of the way instead of the two floating panels
// risking an overlap near the same right edge.
const HeaderMenuContext = createContext<{
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}>({ menuOpen: false, setMenuOpen: () => {} });

export function HeaderMenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <HeaderMenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </HeaderMenuContext.Provider>
  );
}

export function useHeaderMenu() {
  return useContext(HeaderMenuContext);
}
