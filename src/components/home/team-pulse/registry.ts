import type { TeamPulseData } from "./types";
import { SASHA_SITES } from "./content/sasha-sites";
import { EGOR_AI } from "./content/egor-ai";
import { EGOR_SITES } from "./content/egor-sites";
import { EGOR_CONTENT } from "./content/egor-content";
import { MAX_AI, MAX_CONTENT } from "./content/max-content";
import { DIMA_AI } from "./content/dima-ai";
import { EGOR_SMM } from "./content/egor-smm";
import { TANYA_SMM } from "./content/tanya-smm";

// Кто из команды уже работает «как сервис» (TeamPulse) — по странице и id
// из lib/team.ts. Там, где страница показывает маленькую карточку этого
// человека (TeamRow в финальной главе), вместо неё встаёт его уведомление
// с текстами именно этой страницы. Остальные участники остаются прежними
// карточками, пока для них не готовы тексты.
export const TEAM_PULSE: Partial<Record<"content" | "ai" | "sites" | "smm", Record<string, TeamPulseData>>> = {
  sites: { egor: EGOR_SITES, sasha: SASHA_SITES },
  ai: { egor: EGOR_AI, dima: DIMA_AI, max: MAX_AI },
  content: { egor: EGOR_CONTENT, max: MAX_CONTENT },
  smm: { egor: EGOR_SMM, tanya: TANYA_SMM },
};

export type PulsePage = "content" | "ai" | "sites" | "smm";

/** Окно человека для страницы: сначала тексты этой страницы, иначе — тексты
 *  с любой другой (человек тот же, смыслы те же). Нет ни одного — null. */
export function findPulse(memberId: string, page?: PulsePage): TeamPulseData | null {
  if (page && TEAM_PULSE[page]?.[memberId]) return TEAM_PULSE[page]![memberId];
  for (const set of Object.values(TEAM_PULSE)) if (set?.[memberId]) return set[memberId];
  return null;
}
