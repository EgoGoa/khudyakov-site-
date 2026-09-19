"use client";

import { useEffect, useState } from "react";

// True on a phone held sideways (wide, but under ~520px tall). Same query as
// the `land:` screen in tailwind.config.ts.
const QUERY = "(orientation: landscape) and (max-height: 520px)";

export function useLandscapePhone() {
  const [land, setLand] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setLand(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return land;
}
