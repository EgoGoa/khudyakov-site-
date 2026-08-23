import { StepIcon, type ProcessStepItem } from "@/components/home/Process";

// The AI-specific process for chapter 06 of /ai's deck — passed into the
// shared <Process> component (see that file's `steps` prop). Real content,
// not a placeholder: it's the same pipeline already written for AI in
// service-content.ts's (unused) processByCategory.ai, expanded from 3 broad
// phases to 6 concrete steps to match the card grid every service's process
// chapter uses.
export const AI_PROCESS_STEPS: ProcessStepItem[] = [
  {
    title: "Аудит процессов",
    description: "Смотрим на продажи, контент и коммуникацию — находим 1–2 узких места с быстрым эффектом.",
    icon: (
      <StepIcon>
        <path d="M9 3.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.5a1 1 0 0 0-1-1h-3" />
        <rect x="9" y="2.5" width="6" height="3" rx="1" />
        <path d="M8.5 12l2.2 2.2 4.3-4.4" />
      </StepIcon>
    ),
  },
  {
    title: "Согласование пилота",
    description: "Фиксируем задачу, метрику успеха и договор — запускаем на одном процессе, не на всём сразу.",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14.5 3.5V8h4.5" />
        <path d="M8.5 13.5h7M8.5 17h4.5" />
      </StepIcon>
    ),
  },
  {
    title: "Настройка и интеграция",
    description: "Настраиваем инструмент под ваш кейс и подключаем к CRM, соцсетям, сайту.",
    icon: (
      <StepIcon>
        <path d="M14.5 6.5l3 3M4 20l5.5-5.5" />
        <path d="M8.5 8.5l7 7" />
        <rect x="3" y="16.5" width="5" height="5" rx="1.5" transform="rotate(-45 5.5 19)" />
        <rect x="16" y="3" width="5" height="5" rx="1.5" transform="rotate(-45 18.5 5.5)" />
      </StepIcon>
    ),
  },
  {
    title: "Тест на реальных данных",
    description: "Проверяем на живом трафике, не в песочнице — на каждом шаге вы видите прогресс.",
    icon: (
      <StepIcon>
        <path d="M5 19V10M12 19V5M19 19v-7" />
        <path d="M3 19h18" />
      </StepIcon>
    ),
  },
  {
    title: "Запуск",
    description: "Включаем инструмент в работу и передаём инструкцию команде клиента.",
    icon: (
      <StepIcon>
        <path d="M12 3c3 3 5 7 5 10.5a5 5 0 0 1-10 0C7 10 9 6 12 3z" />
        <circle cx="12" cy="13" r="1.6" />
      </StepIcon>
    ),
  },
  {
    title: "Сопровождение",
    description: "Донастройка под новые задачи, отчётность по метрикам, расширение на другие процессы.",
    icon: (
      <StepIcon>
        <path d="M20 6v5h-5M4 18v-5h5" />
        <path d="M5.6 9.5A7 7 0 0 1 19 8.5M18.4 14.5A7 7 0 0 1 5 15.5" />
      </StepIcon>
    ),
  },
];
