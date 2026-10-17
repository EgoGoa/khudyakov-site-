import type { BriefConfig } from "../types";
import { DEADLINE, INDUSTRY, opts } from "./helpers";

const SOLUTION = { stepId: "service", anyOf: ["agent", "automation", "chatbot", "consult"] };
const AGENT_OR_BOT = { stepId: "service", anyOf: ["agent", "chatbot"] };

export const ai: BriefConfig = {
  id: "ai",
  title: "Бриф: AI-инструменты",
  intro: "Расскажите о задаче — подберём AI-решение под ваш бизнес",
  steps: [
    {
      id: "service",
      type: "single",
      allowCustom: true,
      title: "Что вас интересует?",
      options: opts(
        "agent:AI-агент / ассистент",
        "automation:Автоматизация процессов",
        "content:AI-генерация фото и видео",
        "chatbot:Чат-бот для продаж и поддержки",
        "training:Обучение команды работе с AI",
        "consult:Не знаю — нужна консультация"
      ),
    },
    { id: "industry", type: "single", allowCustom: true, title: "Ваша сфера?", options: INDUSTRY },
    {
      id: "tasks",
      type: "multi",
      allowCustom: true,
      title: "Какие задачи должен решать AI?",
      options: opts(
        "answer:Отвечать клиентам 24/7",
        "leads:Обрабатывать заявки",
        "content:Создавать контент",
        "analytics:Готовить аналитику и отчёты",
        "documents:Работать с документами",
        "internal:Автоматизировать внутренние процессы"
      ),
    },
    {
      id: "channels",
      type: "multi",
      allowCustom: true,
      showIf: SOLUTION,
      title: "Где должно работать решение?",
      options: opts(
        "telegram:Telegram",
        "whatsapp:WhatsApp",
        "site:Сайт",
        "vk:VK",
        "crm:CRM",
        "internal:Внутри компании"
      ),
    },
    {
      id: "load",
      type: "single",
      showIf: SOLUTION,
      title: "Сколько обращений или задач в день?",
      options: opts("l50:До 50", "l300:50–300", "l300plus:Больше 300", "unknown:Не знаю"),
    },
    {
      id: "now",
      type: "single",
      title: "Кто делает это сейчас?",
      options: opts("me:Я сам", "one:Один сотрудник", "dept:Целый отдел", "nobody:Никто — не хватает рук"),
    },
    {
      id: "content_type",
      type: "multi",
      allowCustom: true,
      showIf: { stepId: "service", anyOf: ["content"] },
      title: "Какой AI-контент нужен?",
      options: opts(
        "photo:Фото и предметная съёмка",
        "video-ads:Рекламные видео",
        "avatar:AI-аватар / говорящая голова",
        "voice:Озвучка",
        "music:Музыка"
      ),
    },
    {
      id: "content_volume",
      type: "single",
      showIf: { stepId: "service", anyOf: ["content"] },
      title: "Объём в месяц?",
      options: opts("once:Разовый проект", "u10:До 10 единиц", "u30:10–30 единиц", "u30plus:Больше 30"),
    },
    {
      id: "integrations",
      type: "multi",
      allowCustom: true,
      required: false,
      title: "С чем интегрировать?",
      options: opts(
        "amocrm:amoCRM",
        "bitrix:Битрикс24",
        "sheets:Google Таблицы",
        "1c:1С",
        "mail:Почта",
        "calendar:Календарь",
        "payments:Платёжная система"
      ),
    },
    {
      id: "knowledge",
      type: "single",
      title: "Есть база знаний (документы, FAQ, прайсы)?",
      options: opts("yes:Есть", "partial:Частично", "collect:Нужно собрать"),
    },
    {
      id: "tone",
      type: "single",
      allowCustom: true,
      showIf: AGENT_OR_BOT,
      title: "Как должен общаться агент?",
      options: opts("business:Деловым тоном", "friendly:Дружелюбно", "human:Как живой менеджер", "brand:В стиле бренда"),
    },
    {
      id: "voice",
      type: "single",
      showIf: AGENT_OR_BOT,
      title: "Нужен голос?",
      options: opts("text:Только текст", "voice-messages:Голосовые сообщения", "calls:Звонки"),
    },
    {
      id: "data",
      type: "single",
      title: "Какие данные будет обрабатывать AI?",
      options: opts(
        "regular:Обычные, без чувствительных",
        "personal:Персональные данные клиентов",
        "secret:Коммерческая тайна — нужен закрытый контур"
      ),
    },
    {
      id: "success",
      type: "multi",
      allowCustom: true,
      title: "Что для вас будет результатом?",
      options: opts(
        "time:Экономия времени",
        "leads:Больше заявок",
        "fast-answers:Быстрые ответы клиентам",
        "fewer-errors:Меньше ошибок",
        "staff-cost:Снижение затрат на персонал"
      ),
    },
    {
      id: "experience",
      type: "single",
      title: "Уже пробовали AI?",
      options: opts(
        "no:Нет",
        "manual:Пользуемся ChatGPT / Claude вручную",
        "bot-failed:Был бот — не устроил",
        "have:Есть решение, нужна доработка"
      ),
    },
    {
      id: "support",
      type: "single",
      title: "Формат работы?",
      options: opts("setup:Разовая настройка", "setup-support:Настройка + поддержка и развитие"),
    },
    {
      id: "refs",
      type: "textarea",
      required: false,
      title: "Примеры решений, которые нравятся",
      subtitle: "Ссылки или описание своими словами",
    },
    { id: "deadline", type: "deadline", title: "Когда нужен запуск?", options: DEADLINE },
    {
      id: "budget",
      type: "budget",
      title: "Ориентир по бюджету?",
      options: opts(
        "b1:До 50 000 ₽",
        "b2:50 000–100 000 ₽",
        "b3:100 000–250 000 ₽",
        "b4:От 250 000 ₽",
        "estimate:Нужна оценка"
      ),
    },
    { id: "contact", type: "contact", title: "Как с вами связаться?" },
  ],
};
