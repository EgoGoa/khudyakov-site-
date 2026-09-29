import { StepIcon, type ProcessStepItem } from "@/components/home/Process";

// The AI-site-specific process for chapter 05 of /sites' page (brief §7),
// passed into the shared <Process> component the same way AI_PROCESS_STEPS
// feeds /ai's chapter 06 — see aiProcessSteps.tsx.
export const SITES_PROCESS_STEPS: ProcessStepItem[] = [
  {
    title: "Бриф",
    description: "Заполняете короткую форму или созваниваемся на 15 минут: рассказываете о бизнесе, клиентах и целях сайта. На выходе — понятное ТЗ и смета по строкам.",
    icon: (
      <StepIcon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4M8 12.5h8M8 16h5" />
      </StepIcon>
    ),
    beats: [
      { icon: "📝", label: "Форма" },
      { icon: "🏢", label: "Бизнес" },
      { icon: "🎯", label: "Цели" },
    ],
  },
  {
    title: "Концепция",
    description: "Собираем структуру страниц и визуальный стиль под вашу аудиторию. Показываем главный экран и согласовываем его до начала сборки.",
    icon: (
      <StepIcon>
        <circle cx="7" cy="7" r="3" />
        <path d="M12.5 7h8M7 15.5v5M4.5 20.5h5M12.5 12h8M12.5 17h5" />
      </StepIcon>
    ),
    beats: [
      { icon: "🗂", label: "Структура" },
      { icon: "🎨", label: "Стиль" },
      { icon: "✅", label: "Согласование" },
    ],
  },
  {
    title: "Сборка",
    description: "AI генерирует черновик страниц и текстов, команда вручную доводит дизайн, вёрстку и анимации. Сайт виден по ссылке уже в процессе.",
    icon: (
      <StepIcon>
        <path d="M8.5 8L3.5 12.5 8.5 17M15.5 8l5 4.5-5 4.5" />
        <path d="M13.2 5.5l-2.4 13" />
      </StepIcon>
    ),
    beats: [
      { icon: "🤖", label: "AI-черновик" },
      { icon: "🛠", label: "Доработка" },
      { icon: "💻", label: "Код" },
    ],
  },
  {
    title: "Правки",
    description: "Согласованное число кругов правок уже включено в стоимость. Правки собираем одним списком по ссылке на сайт — без бесконечной переписки.",
    icon: (
      <StepIcon>
        <path d="M4 20 15.5 8.5l3.8-3.8a1.4 1.4 0 0 1 2 2L17.5 10.5 6 22H4v-2z" />
        <path d="M13 10.5 17.5 15" />
      </StepIcon>
    ),
    beats: [
      { icon: "👁", label: "Просмотр" },
      { icon: "🔁", label: "Итерации" },
      { icon: "✅", label: "Готово" },
    ],
  },
  {
    title: "Запуск",
    description: "Публикуем сайт, подключаем домен, формы заявок и аналитику, проверяем скорость на телефоне. Передаём все доступы и показываем, как менять тексты самим.",
    icon: (
      <StepIcon>
        <path d="M12 3c3 3 5 7 5 10.5a5 5 0 0 1-10 0C7 10 9 6 12 3z" />
        <circle cx="12" cy="13" r="1.6" />
      </StepIcon>
    ),
    beats: [
      { icon: "☁️", label: "Деплой" },
      { icon: "🌐", label: "Домен" },
      { icon: "🔑", label: "Передача" },
    ],
  },
];
