import { StepIcon, type ProcessStepItem } from "@/components/home/Process";

// The AI-site-specific process for chapter 05 of /sites' page (brief §7),
// passed into the shared <Process> component the same way AI_PROCESS_STEPS
// feeds /ai's chapter 06 — see aiProcessSteps.tsx.
export const SITES_PROCESS_STEPS: ProcessStepItem[] = [
  {
    title: "Бриф",
    description: "Заполняете форму, рассказываете о бизнесе и целях.",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4M8 12.5h8M8 16h5" />
      </StepIcon>
    ),
  },
  {
    title: "Концепция",
    description: "Согласовываем структуру страниц и визуальный стиль.",
    icon: (
      <StepIcon>
        <circle cx="7" cy="7" r="3" />
        <path d="M12.5 7h8M7 15.5v5M4.5 20.5h5M12.5 12h8M12.5 17h5" />
      </StepIcon>
    ),
  },
  {
    title: "Сборка",
    description: "AI генерирует черновик, команда дорабатывает вручную.",
    icon: (
      <StepIcon>
        <path d="M8.5 8L3.5 12.5 8.5 17M15.5 8l5 4.5-5 4.5" />
        <path d="M13.2 5.5l-2.4 13" />
      </StepIcon>
    ),
  },
  {
    title: "Правки",
    description: "Согласованное число итераций правок включено в стоимость.",
    icon: (
      <StepIcon>
        <path d="M4 20 15.5 8.5l3.8-3.8a1.4 1.4 0 0 1 2 2L17.5 10.5 6 22H4v-2z" />
        <path d="M13 10.5 17.5 15" />
      </StepIcon>
    ),
  },
  {
    title: "Запуск",
    description: "Деплой на Vercel/Netlify, подключение домена, передача вам.",
    icon: (
      <StepIcon>
        <path d="M12 3c3 3 5 7 5 10.5a5 5 0 0 1-10 0C7 10 9 6 12 3z" />
        <circle cx="12" cy="13" r="1.6" />
      </StepIcon>
    ),
  },
];
