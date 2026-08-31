import type { SeoSection } from "@/components/ui/SeoAccordion";

// The written, search-facing copy for /smm. Was the body of a standalone
// SmmSeoText section below the deck; now data, rendered as thin rows inside
// the closing chapter (see SeoAccordion and smm/page.tsx). Moved for the same
// reason /sites and /ai moved theirs: with the deck pinned above it, a flat
// section had no film behind it and landed as a black slab breaking the
// page's own look.
export const SMM_SEO_SECTIONS: SeoSection[] = [
  {
    title: "Чем SMM-агентство внутри продакшна отличается от обычного",
    body: "SMM чаще всего покупают отдельно от съёмки — контент для соцсетей приходит от фрилансера, который не видел бренд вживую. HDKV.AGENCY ведёт соцсети той же командой, что снимает рекламные ролики: одни операторы, монтажёры и продюсер на проекте. Reels и сторис снимаются на том же оборудовании и в том же визуальном языке, что и остальной продакшн бренда.",
  },
  {
    title: "Как мы строим контент-план",
    body: "Начинаем с аудита аккаунта и ниши, собираем план на 90 дней и расписываем публикации на месяц вперёд — вы видите его до того, как что-либо снято. AI-инструменты ускоряют черновики сценариев и текстов, но каждый пост и рилс перед публикацией проверяет человек.",
  },
  {
    title: "Что входит в еженедельный отчёт",
    body: "Раз в неделю — что сделано, что сработало и что меняем дальше, простым языком без размытых формулировок. Фиксированный ежемесячный пакет означает отсутствие доплат за согласованный объём контента.",
  },
];
