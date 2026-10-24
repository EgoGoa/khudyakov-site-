"use client";

import { useEffect } from "react";
import { initCalm } from "@/lib/calm";

/** Ставит спокойный режим при загрузке (выбор посетителя или системное
 *  «уменьшить движение»). Ничего не рисует. */
export default function CalmMode() {
  useEffect(() => initCalm(), []);
  return null;
}
