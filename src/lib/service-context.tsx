"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { serviceOrder, type ServiceKey } from "./service-content";

const STORAGE_KEY = "hdkv-active-service";

type Ctx = {
  active: ServiceKey;
  setActive: (key: ServiceKey) => void;
  locked: boolean;
};

const ServiceContext = createContext<Ctx>({
  active: "content",
  setActive: () => {},
  locked: false,
});

// forcedValue pins the context to a fixed service (used on /services/[slug]
// pages) — switching and localStorage persistence are disabled in that case.
export function ServiceProvider({
  children,
  forcedValue,
}: {
  children: ReactNode;
  forcedValue?: ServiceKey;
}) {
  const [active, setActiveState] = useState<ServiceKey>(forcedValue ?? "content");

  useEffect(() => {
    if (forcedValue) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked (strict private mode, some in-app browsers) — keep the default.
    }
    if (saved && (serviceOrder as string[]).includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount read, localStorage isn't available during SSR so this can't move to a lazy useState initializer without a hydration mismatch
      setActiveState(saved as ServiceKey);
    }
  }, [forcedValue]);

  const setActive = (key: ServiceKey) => {
    if (forcedValue) return;
    setActiveState(key);
    try {
      window.localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // Not persisting the choice is fine; breaking the switch isn't.
    }
  };

  return (
    <ServiceContext.Provider value={{ active, setActive, locked: Boolean(forcedValue) }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService() {
  return useContext(ServiceContext);
}
