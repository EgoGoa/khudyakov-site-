import type { TeamPulseData } from "./types";
import { SASHA_SITES } from "./content/sasha-sites";

// Кто из команды уже работает «как сервис» (TeamPulse) — по id из
// lib/team.ts. Там, где сайт показывает маленькую карточку этого человека
// (TeamRow, блок цен), вместо неё встаёт его уведомление. Остальные
// участники остаются прежними карточками, пока для них не готовы тексты.
export const TEAM_PULSE: Record<string, TeamPulseData> = {
  sasha: SASHA_SITES,
};
