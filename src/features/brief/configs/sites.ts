import type { BriefConfig } from "../types";
import { DEADLINE, INDUSTRY, opts } from "./helpers";

export const sites: BriefConfig = {
  id: "sites",
  title: "Бриф: Сайты",
  intro: "Расскажите о проекте — предложим структуру и смету",
  steps: [
    {
      id: "type",
      type: "single",
      allowCustom: true,
      title: "Какой сайт нужен?",
      options: opts(
        "landing:Лендинг",
        "corporate:Корпоративный сайт",
        "shop:Интернет-магазин",
        "portfolio:Сайт-портфолио",
        "web-service:Веб-сервис / приложение",
        "redesign:Редизайн текущего сайта"
      ),
    },
    {
      id: "current",
      type: "single",
      title: "Есть ли сайт сейчас?",
      options: opts("none:Нет, делаем с нуля", "redesign:Есть, нужен редизайн", "improve:Есть, нужна доработка"),
    },
    {
      id: "current_url",
      type: "text",
      title: "Ссылка на текущий сайт",
      showIf: { stepId: "current", anyOf: ["redesign", "improve"] },
    },
    { id: "industry", type: "single", allowCustom: true, title: "Ваша сфера?", options: INDUSTRY },
    {
      id: "goal",
      type: "single",
      allowCustom: true,
      title: "Главная задача сайта?",
      options: opts(
        "leads:Собирать заявки",
        "sell:Продавать онлайн",
        "image:Формировать имидж",
        "booking:Принимать записи и бронирования",
        "inform:Информировать клиентов"
      ),
    },
    {
      id: "actions",
      type: "multi",
      allowCustom: true,
      title: "Что должен сделать посетитель?",
      options: opts(
        "lead:Оставить заявку",
        "call:Позвонить",
        "messenger:Написать в мессенджер",
        "buy:Купить",
        "book:Записаться",
        "download:Скачать материалы"
      ),
    },
    {
      id: "size",
      type: "single",
      title: "Объём сайта?",
      options: opts(
        "p1:1 страница",
        "p2-5:2–5 страниц",
        "p6-15:6–15 страниц",
        "p15plus:Больше 15 страниц",
        "catalog:Каталог 100+ товаров"
      ),
    },
    {
      id: "sections",
      type: "multi",
      allowCustom: true,
      title: "Какие разделы нужны?",
      options: opts(
        "about:О компании",
        "services:Услуги",
        "cases:Кейсы / портфолио",
        "prices:Цены",
        "reviews:Отзывы",
        "blog:Блог",
        "faq:FAQ",
        "team:Команда",
        "contacts:Контакты"
      ),
    },
    {
      id: "features",
      type: "multi",
      allowCustom: true,
      required: false,
      title: "Какие функции нужны?",
      options: opts(
        "payment:Онлайн-оплата",
        "account:Личный кабинет",
        "calculator:Калькулятор",
        "booking:Онлайн-запись",
        "quiz:Квиз",
        "ai-chat:AI-ассистент / чат-бот",
        "languages:Несколько языков"
      ),
    },
    {
      id: "design",
      type: "single",
      allowCustom: true,
      title: "Какой стиль дизайна ближе?",
      options: opts(
        "minimal:Минимализм",
        "dark-tech:Тёмный, технологичный",
        "bold:Яркий и смелый",
        "premium:Премиальный",
        "warm:Тёплый и дружелюбный"
      ),
    },
    {
      id: "motion",
      type: "single",
      title: "Сколько анимаций?",
      options: opts("minimal:Минимум, всё строго", "moderate:Умеренно", "wow:Вау-эффект и 3D"),
    },
    {
      id: "brand",
      type: "single",
      title: "Есть ли фирменный стиль?",
      options: opts("brandbook:Есть брендбук", "logo-colors:Есть логотип и цвета", "develop:Нужно разработать"),
    },
    {
      id: "content",
      type: "single",
      title: "Тексты и фото готовы?",
      options: opts("ready:Всё готово", "partial:Частично", "none:Нужно всё с нуля"),
    },
    { id: "refs", type: "links", required: false, title: "Сайты, которые нравятся" },
    { id: "competitors", type: "links", required: false, title: "Сайты конкурентов" },
    {
      id: "integrations",
      type: "multi",
      allowCustom: true,
      required: false,
      title: "Какие интеграции нужны?",
      options: opts(
        "crm:amoCRM / Битрикс24",
        "telegram:Уведомления в Telegram",
        "metrika:Яндекс.Метрика",
        "cashbox:Онлайн-касса",
        "1c:1С",
        "none:Пока не нужны"
      ),
    },
    {
      id: "admin",
      type: "single",
      title: "Кто будет обновлять сайт?",
      options: opts("self:Мы сами — нужна удобная админка", "you:Вы, на поддержке", "rare:Обновляется редко"),
    },
    {
      id: "domain",
      type: "single",
      title: "Домен и хостинг?",
      options: opts("all:Всё есть", "domain-only:Есть только домен", "nothing:Ничего нет"),
    },
    { id: "deadline", type: "deadline", title: "Когда нужен запуск?", options: DEADLINE },
    {
      id: "budget",
      type: "budget",
      title: "Ориентир по бюджету?",
      options: opts(
        "b1:До 75 000 ₽",
        "b2:75 000–150 000 ₽",
        "b3:150 000–300 000 ₽",
        "b4:От 300 000 ₽",
        "estimate:Нужна оценка"
      ),
    },
    { id: "contact", type: "contact", title: "Как с вами связаться?" },
  ],
};
