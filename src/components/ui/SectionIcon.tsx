// Иконки разделов для бокового меню (VibeRail) и шторки шапки (Егор,
// 2026-10-08): у каждого из четырёх направлений свои, по смыслу раздела —
// хлопушка, кубок, робот, бумеранг, пропуск сотрудника… вместо прежних
// абстракций (звезда = цены, щит = почему мы, слои = услуги).
//
// Стиль «дуотон»: контур 1.5 + лёгкая заливка цветом страницы
// (var(--g-to), иначе фирменный голубой). Каждая иконка — пара
// [заливка, контур]; заливка лежит под контуром.
//
// При появлении иконка рисуется сама (stroke-dashoffset, как ChapterIcon),
// заливка проявляется следом — globals.css, .section-icon. Задержка по
// `--i` (номер строки) и `--boot-i` (очередь загрузки бокового меню).

import type { ReactNode } from "react";

const ICONS = {
  // /content — видеопродакшн
  clapper: [
    <path key="f" d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    <>
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" />
      <path d="M6.2 5.3l3.1 3.9M12.4 3.4l3.1 4" />
    </>,
  ],
  reel: [
    <circle key="f" cx="12" cy="12" r="9" />,
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="7.5" r="1.8" />
      <circle cx="16.3" cy="10.6" r="1.8" />
      <circle cx="14.6" cy="15.6" r="1.8" />
      <circle cx="9.4" cy="15.6" r="1.8" />
      <circle cx="7.7" cy="10.6" r="1.8" />
      <path d="M21 12v8.5h-9" />
    </>,
  ],
  trophy: [
    <path key="f" d="M7 4h10v5a5 5 0 0 1-10 0z" />,
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4V7a3 3 0 0 0 3.3 3M17 5.5h3V7a3 3 0 0 1-3.3 3M12 14v3.5" />
      <path d="M8.5 17.5h7v3h-7z" />
    </>,
  ],
  moviecam: [
    <rect key="f" x="3" y="10" width="12" height="9" rx="2" />,
    <>
      <rect x="3" y="10" width="12" height="9" rx="2" />
      <path d="M15 13l5.5-2.5v8L15 16" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="12.2" cy="6" r="3" />
    </>,
  ],
  storyboard: [
    <rect key="f" x="9.25" y="5" width="5.5" height="5" rx="1" />,
    <>
      <rect x="2.5" y="5" width="5.5" height="5" rx="1" />
      <rect x="9.25" y="5" width="5.5" height="5" rx="1" />
      <rect x="16" y="5" width="5.5" height="5" rx="1" />
      <path d="M3.5 16h16m0 0-2.8-2.8m2.8 2.8-2.8 2.8" />
    </>,
  ],
  priceTag: [
    <path key="f" d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8a1.4 1.4 0 0 1 0 2l-7 7a1.4 1.4 0 0 1-2 0z" />,
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8a1.4 1.4 0 0 1 0 2l-7 7a1.4 1.4 0 0 1-2 0z" />
      <path d="M10.6 15.4V9.6h2a1.6 1.6 0 0 1 0 3.2H9.5M9.5 14.2h3.2" />
    </>,
  ],

  // /ai
  robot: [
    <rect key="f" x="5" y="8" width="14" height="11" rx="3" />,
    <>
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 8V5" />
      <circle cx="12" cy="3.8" r="1.2" />
      <path d="M9.3 12.6v1.2M14.7 12.6v1.2M10 16.3h4M3 12v3M21 12v3" />
    </>,
  ],
  gallery: [
    <rect key="f" x="3" y="4" width="18" height="16" rx="2.5" />,
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3.5 18.5 9 13l4.5 4.5" />
      <path d="M16 6.8l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
    </>,
  ],
  pie: [
    <path key="f" d="M14 1.8v8h8a8 8 0 0 0-8-8z" />,
    <>
      <path d="M11.5 4.3a8.5 8.5 0 1 0 8.2 8.2h-8.2z" />
      <path d="M14 1.8v8h8a8 8 0 0 0-8-8z" />
    </>,
  ],
  boomerang: [
    <path key="f" d="M3.5 8.5 11 4.2a2 2 0 0 1 2 0l7.5 4.3a1.8 1.8 0 0 1-1.8 3.1L12 7.8 5.3 11.6a1.8 1.8 0 0 1-1.8-3.1z" />,
    <>
      <path d="M3.5 8.5 11 4.2a2 2 0 0 1 2 0l7.5 4.3a1.8 1.8 0 0 1-1.8 3.1L12 7.8 5.3 11.6a1.8 1.8 0 0 1-1.8-3.1z" />
      <path d="M19.5 15a9 9 0 0 1-14.6 1.6" />
      <path d="M4.2 13.6l.7 3 3-.7" />
    </>,
  ],
  chip: [
    <rect key="f" x="9.5" y="9.5" width="5" height="5" rx="1" />,
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
    </>,
  ],
  shieldCheck: [
    <path key="f" d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6l7-3z" />,
    <>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>,
  ],
  plug: [
    <path key="f" d="M6 7.5h12v3a6 6 0 0 1-12 0z" />,
    <>
      <path d="M9 2.5v5M15 2.5v5" />
      <path d="M6 7.5h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 16.5v5" />
    </>,
  ],
  rubleCoin: [
    <circle key="f" cx="12" cy="12" r="9" />,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.3 17V7.5h3a2.6 2.6 0 0 1 0 5.2H8.6M8.6 14.9h5.2" />
    </>,
  ],

  // /sites
  browserCursor: [
    <path key="f" d="M3 9V6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5V9z" />,
    <>
      <path d="M21 12V6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H11" />
      <path d="M3 9h18M6.3 6.5h.01M8.8 6.5h.01" />
      <path d="M13.5 12.5l7.5 2.8-3.3 1.3-1.3 3.4z" />
    </>,
  ],
  wand: [
    <path key="f" d="M13.5 7.5l3 3-1.5 1.5-3-3z" />,
    <>
      <path d="M4 20 15 9" />
      <path d="M13.5 7.5l3 3" />
      <path d="M18 3v3M16.5 4.5h3M20 10v2.5M18.8 11.2h2.4M9.5 3v2.5M8.3 4.2h2.4" />
    </>,
  ],
  layout: [
    <path key="f" d="M3 8.5V5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v3z" />,
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 8.5h18M9.5 8.5V21" />
    </>,
  ],
  rocket: [
    <path key="f" d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />,
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>,
  ],
  key: [
    <circle key="f" cx="7.5" cy="15.5" r="4" />,
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.5 12.5 20 3M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>,
  ],
  tiers: [
    <rect key="f" x="9.5" y="5" width="5" height="15" rx="1.2" />,
    <>
      <rect x="3" y="11" width="5" height="9" rx="1.2" />
      <rect x="9.5" y="5" width="5" height="15" rx="1.2" />
      <rect x="16" y="8" width="5" height="12" rx="1.2" />
    </>,
  ],

  // /smm
  phoneCam: [
    <rect key="f" x="6.5" y="2.5" width="11" height="19" rx="2.5" />,
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <circle cx="12" cy="11" r="2.6" />
      <circle cx="12" cy="11" r=".5" />
      <path d="M10.5 18.5h3" />
    </>,
  ],
  badge: [
    <rect key="f" x="5.5" y="6" width="13" height="15" rx="2.5" />,
    <>
      <rect x="5.5" y="6" width="13" height="15" rx="2.5" />
      <path d="M10 3.5h4V8h-4z" />
      <circle cx="12" cy="12.3" r="2" />
      <path d="M8.7 18c.6-1.5 1.8-2.3 3.3-2.3s2.7.8 3.3 2.3" />
    </>,
  ],
  heartBubble: [
    <path key="f" d="M12 14.6s-3-1.8-3-3.8a1.5 1.5 0 0 1 3-.6 1.5 1.5 0 0 1 3 .6c0 2-3 3.8-3 3.8z" />,
    <>
      <path d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v10a1.5 1.5 0 0 1-1.5 1.5h-9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V6A1.5 1.5 0 0 1 4 4.5z" />
      <path d="M12 14.6s-3-1.8-3-3.8a1.5 1.5 0 0 1 3-.6 1.5 1.5 0 0 1 3 .6c0 2-3 3.8-3 3.8z" />
    </>,
  ],
  growth: [
    <path key="f" d="M7 15l4-4 3 3 5.5-6V20H7z" />,
    <>
      <path d="M3.5 3.5v17h17" />
      <path d="M7 15l4-4 3 3 5.5-6" />
      <path d="M15.5 8h4v4" />
    </>,
  ],
  gift: [
    <rect key="f" x="3.5" y="8" width="17" height="4" rx="1" />,
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5" />
      <path d="M12 8C10.5 4.5 7.5 4.3 7.5 6.2S10 8 12 8c2 0 4.5 0 4.5-1.8S13.5 4.5 12 8z" />
    </>,
  ],
  calendar: [
    <path key="f" d="M3.5 10V7.5A2.5 2.5 0 0 1 6 5h12a2.5 2.5 0 0 1 2.5 2.5V10z" />,
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </>,
  ],

  // Общие страницы
  catalog: [
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>,
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>,
  ],
  calculator: [
    <rect key="f" x="7" y="5.5" width="10" height="4" rx="1" />,
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <rect x="7" y="5.5" width="10" height="4" rx="1" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />
    </>,
  ],
  brief: [
    <rect key="f" x="5" y="4.5" width="14" height="17" rx="2" />,
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M8.3 10.5l1.4 1.4 2.3-2.4M14 11h2M8.3 16l1.4 1.4 2.3-2.4M14 16.5h2" />
    </>,
  ],
} satisfies Record<string, [ReactNode, ReactNode]>;

export type SectionIconName = keyof typeof ICONS;

export default function SectionIcon({ name, size = 20 }: { name: SectionIconName; size?: number }) {
  const [fill, lines] = ICONS[name];
  return (
    <svg
      // Новый key на смену иконки — новые узлы, и анимация появления
      // проигрывается заново (например, при переходе между направлениями).
      key={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="section-icon shrink-0"
    >
      <g className="section-icon__fill">{fill}</g>
      <g className="section-icon__lines">{lines}</g>
    </svg>
  );
}
