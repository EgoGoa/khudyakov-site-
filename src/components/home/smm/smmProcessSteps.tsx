import { StepIcon, type ProcessStepItem } from "@/components/home/Process";

// The SMM-specific process for /smm's Process chapter — passed into the
// shared <Process> component (see that file's `steps` prop), same pattern
// as AI_PROCESS_STEPS / SITES_PROCESS_STEPS.
export const SMM_PROCESS_STEPS: ProcessStepItem[] = [
  {
    title: "Аудит и стратегия",
    description: "Смотрим аккаунт, нишу и конкурентов, собираем план на 90 дней.",
    icon: (
      <StepIcon>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.3 15.3 20 20" />
      </StepIcon>
    ),
  },
  {
    title: "Контент-план",
    description: "Расписываем публикации на месяц вперёд, согласовываем с вами.",
    icon: (
      <StepIcon>
        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" />
        <path d="M7.5 13.5h3M7.5 16.5h6" />
      </StepIcon>
    ),
  },
  {
    title: "Съёмка и монтаж",
    description: "Снимаем и монтируем Reels, сторис и карусели своей командой.",
    icon: (
      <StepIcon>
        <rect x="3" y="7" width="13" height="11" rx="2" />
        <path d="M16 10.2 21 7.5v9L16 13.8" />
      </StepIcon>
    ),
  },
  {
    title: "Публикация и продвижение",
    description: "Ведение, комьюнити-менеджмент, таргет — по календарю.",
    icon: (
      <StepIcon>
        <path d="M4 12l16-8-6 16-3-6-7-2z" />
      </StepIcon>
    ),
  },
  {
    title: "Отчёт и корректировка",
    description: "Раз в неделю: что сработало, что меняем дальше.",
    icon: (
      <StepIcon>
        <path d="M5 19V13M12 19V7M19 19v-9" />
        <path d="M3 19h18" />
      </StepIcon>
    ),
  },
];
