import type { Service, Work } from "./types";

export const services: Service[] = [
  {
    title: "Продвижение товаров и услуг",
    description:
      "Ролики, которые не рассказывают о продукте, а продают его: через эмоцию, ритм и точный посыл, который бьёт в цель с первого кадра.",
  },
  {
    title: "Наполнение социальных сетей",
    description:
      "Регулярный видеоконтент для Instagram, Reels, YouTube и Telegram, усиленный AI-инструментами там, где нужна скорость: от генерации вариантов до адаптации под форматы — без потери стиля бренда.",
  },
  {
    title: "Развитие личного бренда",
    description:
      "Видео для экспертов и лидеров мнений: от живых интервью до имиджевых роликов, которые превращают узнаваемость в доверие.",
  },
  {
    title: "3D/2D графика",
    description:
      "Анимация, инфографика и визуальные эффекты — от короткой заставки до VFX, где AI-генерация ускоряет препродакшн, а финальную сборку и качество держит команда.",
  },
  {
    title: "Специальные проекты",
    description:
      "Нестандартные форматы под нестандартную задачу: от идеи и сценария до финального монтажа.",
  },
  {
    title: "Обучающие ролики",
    description:
      "Объясняем сложное простым языком: видеоуроки и обучающий контент, который зритель реально досматривает и понимает.",
  },
  {
    title: "Музыкальные клипы",
    description:
      "Полный цикл продакшна: концепция, съёмка, монтаж и цветокоррекция — от идеи до релиза.",
  },
  {
    title: "Продвижение мероприятия",
    description:
      "Афтер-муви и промо-ролики, которые передают атмосферу конференции или события так, будто зритель был там сам.",
  },
  {
    title: "Продвижение компании",
    description:
      "Имиджевые и корпоративные фильмы, которые формируют не просто узнаваемость, а доверие к бренду.",
  },
  {
    title: "AI-контент и автоматизация",
    description:
      "Генеративное видео, изображения и AI-агенты для контент-продакшна: там, где бренду нужен объём, скорость или новый формат — без потери качества и смысла.",
  },
];

// Работы направления «Создание контента». Порядок рубрик здесь задаёт порядок
// фильтров в блоке «Портфолио» (Works.tsx строит список категорий из этого
// массива), поэтому группы идут в том же порядке, в котором их присылает
// заказчик. `id` = YouTube-идентификатор: он уникален и не требует
// синхронизации с отдельным слагом. `duration` и `date` взяты из метаданных
// самих видео на YouTube.
export const works: Work[] = [
  // ---------- Шоурилы ----------
  { id: "HC5SMCQuoms", title: "AI-шоурил 2026", client: "HDKV.AGENCY", category: "Шоурилы", sphere: "Собственные проекты", duration: 65, date: "2026-02-08", youtubeId: "HC5SMCQuoms" },
  { id: "nxKCmw16vbU", title: "Шоурил 2024", client: "HDKV.AGENCY", category: "Шоурилы", sphere: "Собственные проекты", duration: 152, date: "2024-11-08", youtubeId: "nxKCmw16vbU" },
  { id: "WKuMmgTUoRA", title: "Шоурил 2021 · реклама", client: "HDKV.AGENCY", category: "Шоурилы", sphere: "Собственные проекты", duration: 97, date: "2021-11-02", youtubeId: "WKuMmgTUoRA" },
  { id: "4yyRujtEtvA", title: "Шоурил 2018–2019", client: "HDKV.AGENCY", category: "Шоурилы", sphere: "Собственные проекты", duration: 102, date: "2019-04-20", youtubeId: "4yyRujtEtvA" },

  // ---------- FPV / Дрон ----------
  { id: "LzA1eXlyqBI", title: "FPV-шоурил 4K", client: "HDKV.AGENCY", category: "FPV и дроны", sphere: "Туризм и отели", duration: 137, date: "2021-10-30", youtubeId: "LzA1eXlyqBI" },
  { id: "8DnPZc-pESc", title: "FPV Cinematic · гольф-клуб", client: "Гольф-клуб", category: "FPV и дроны", sphere: "Спорт и фитнес", duration: 60, date: "2021-08-10", youtubeId: "8DnPZc-pESc" },
  { id: "WODAxz34rE0", title: "FPV · зимний спорт", client: "HDKV.AGENCY", category: "FPV и дроны", sphere: "Спорт и фитнес", duration: 96, date: "2021-12-29", youtubeId: "WODAxz34rE0" },
  { id: "HXr1krYhnW8", title: "FPV Racing · Сикиязтамак", client: "HDKV.AGENCY", category: "FPV и дроны", sphere: "Спорт и фитнес", duration: 98, date: "2021-07-02", youtubeId: "HXr1krYhnW8" },
  { id: "UjHGlhAlyJc", title: "FPV Cinematic · Сикиязтамак, Урал", client: "HDKV.AGENCY", category: "FPV и дроны", sphere: "Туризм и отели", duration: 59, date: "2021-08-10", youtubeId: "UjHGlhAlyJc" },

  // ---------- Рекламные ----------
  { id: "iaHvMPD9xQs", title: "Имиджевое промо CARPOINT", client: "CARPOINT", category: "Рекламные", tags: ["Имиджевые и презентации"], sphere: "Авто", duration: 83, date: "2021-12-24", youtubeId: "iaHvMPD9xQs" },
  { id: "yabXLWJZzJ0", title: "Рекламный ролик №2 «Центр Зрения»", client: "Центр Зрения", category: "Рекламные", sphere: "Медицина", duration: 14, date: "2026-07-06", youtubeId: "yabXLWJZzJ0" },
  { id: "uhjPWVDMidI", title: "Рекламный ролик №3 «Центр Зрения»", client: "Центр Зрения", category: "Рекламные", sphere: "Медицина", duration: 13, date: "2026-07-06", youtubeId: "uhjPWVDMidI" },
  { id: "ibujTiM6bA8", title: "ТВ-ролик «Клиника Зрения»", client: "Клиника Зрения", category: "Рекламные", sphere: "Медицина", duration: 12, date: "2026-07-06", youtubeId: "ibujTiM6bA8" },
  { id: "DlR4RTFiWC8", title: "ТВ-ролик «Школа Мира»", client: "Школа Мира", category: "Рекламные", sphere: "Образование", duration: 21, date: "2024-05-31", youtubeId: "DlR4RTFiWC8" },
  { id: "Li2UqtmcIek", title: "«Молодёжная» · промо 15 сек", client: "Парикмахерская «Молодёжная»", category: "Рекламные", sphere: "Красота и фэшн", duration: 15, date: "2022-03-31", youtubeId: "Li2UqtmcIek" },
  { id: "0kHKcCuqh74", title: "Рекламный ролик KIA", client: "KIA", category: "Рекламные", sphere: "Авто", duration: 15, date: "2020-07-15", youtubeId: "0kHKcCuqh74" },
  { id: "QJYjYlVNSRU", title: "Рекламный ролик для ТВ", client: "Коммерческий проект", category: "Рекламные", sphere: "Ритейл", duration: 15, date: "2020-05-12", youtubeId: "QJYjYlVNSRU" },
  { id: "Vssrdgfc_nI", title: "БЕЛЫЙ КИТ · Герой", client: "БЕЛЫЙ КИТ", category: "Рекламные", sphere: "Медицина", duration: 30, date: "2019-04-24", youtubeId: "Vssrdgfc_nI" },
  { id: "zo0YyrkyI7w", title: "Батл дизайнеров · Лига дизайнеров", client: "Лига дизайнеров", category: "Рекламные", sphere: "События и шоу", duration: 60, date: "2019-04-24", youtubeId: "zo0YyrkyI7w" },

  // ---------- Музыкальные ----------
  { id: "-Bxkgh76TOM", title: "Roxilyn · «С высоты»", client: "Roxilyn", category: "Музыкальные", sphere: "Музыка и арт", duration: 213, date: "2025-03-29", youtubeId: "-Bxkgh76TOM" },
  { id: "Xp3-jI6KOf0", title: "Art Music Video · MAYA", client: "MAYA", category: "Музыкальные", sphere: "Музыка и арт", duration: 222, date: "2026-07-01", youtubeId: "Xp3-jI6KOf0" },

  // ---------- Событийные ----------
  { id: "xQJGRW8c87M", title: "Отчётное видео · концерт Макса Коржа", client: "Концерт Макса Коржа", category: "Событийные", sphere: "События и шоу", duration: 60, date: "2019-04-22", youtubeId: "xQJGRW8c87M" },
  { id: "ZsI-0sJusFI", title: "Отчёт с концерта Егора Крида, Челябинск", client: "Концерт Егора Крида", category: "Событийные", sphere: "События и шоу", duration: 57, date: "2019-04-22", youtubeId: "ZsI-0sJusFI" },
  { id: "mfmXdNJQrQ0", title: "Промо · Golf & Porsche", client: "Porsche", category: "Событийные", sphere: "Авто", duration: 60, date: "2021-08-10", youtubeId: "mfmXdNJQrQ0" },
  { id: "FR9-IL0d7Dg", title: "Отчётный фильм «Бал цветов»", client: "Бал цветов", category: "Событийные", sphere: "События и шоу", duration: 108, date: "2026-03-11", youtubeId: "FR9-IL0d7Dg" },
  { id: "3MJrgnLL7X8", title: "Киртан 3.0 · вечер ведических песнопений", client: "Киртан", category: "Событийные", sphere: "События и шоу", duration: 137, date: "2025-06-06", youtubeId: "3MJrgnLL7X8" },
  { id: "wI0WpDC1UVs", title: "Промо · Tractor & Golf", client: "Гольф-клуб", category: "Событийные", sphere: "Спорт и фитнес", duration: 60, date: "2021-08-10", youtubeId: "wI0WpDC1UVs" },
  { id: "NIG7Wf_GBWE", title: "Отчётный ролик · турнир по сноуборду", client: "Турнир по сноуборду", category: "Событийные", sphere: "Спорт и фитнес", duration: 74, date: "2025-03-29", youtubeId: "NIG7Wf_GBWE" },
  { id: "uIZw6ggUlKU", title: "Большой бал · отчётный ролик", client: "Большой бал", category: "Событийные", sphere: "События и шоу", duration: 76, date: "2025-03-13", youtubeId: "uIZw6ggUlKU" },
  { id: "tDU7iDWyWVQ", title: "Ретрит TISHINA 1.0", client: "TISHINA", category: "Событийные", sphere: "Туризм и отели", duration: 153, date: "2022-08-25", youtubeId: "tDU7iDWyWVQ" },
  { id: "K6gGETv3uJE", title: "Промо события ANTI SHUM", client: "ANTI SHUM", category: "Событийные", sphere: "События и шоу", duration: 207, date: "2022-04-09", youtubeId: "K6gGETv3uJE" },
  { id: "GDNMdkGG5iU", title: "Промо события WAIDING · 12 августа", client: "WAIDING", category: "Событийные", sphere: "События и шоу", duration: 175, date: "2021-08-22", youtubeId: "GDNMdkGG5iU" },
  { id: "vP9VibQiagw", title: "GEO WAVE · закрытая вечеринка на воде", client: "GEO WAVE", category: "Событийные", sphere: "События и шоу", duration: 60, date: "2019-07-15", youtubeId: "vP9VibQiagw" },

  // ---------- Фэшн / Арт ----------
  { id: "fKODIj4svZU", title: "ZEN FACTORY · промо", client: "ZEN FACTORY", category: "Фэшн и арт", sphere: "Красота и фэшн", duration: 60, date: "2021-02-15", youtubeId: "fKODIj4svZU" },
  { id: "eTCJAyq91dY", title: "Арт-промо · Bitcoin", client: "Творческий проект", category: "Фэшн и арт", sphere: "IT и финтех", duration: 122, date: "2021-03-25", youtubeId: "eTCJAyq91dY" },
  { id: "ChdRTxmaFkM", title: "Surf Coffee® · «Делаем красиво»", client: "Surf Coffee", category: "Фэшн и арт", sphere: "HoReCa и кофейни", duration: 60, date: "2021-06-19", youtubeId: "ChdRTxmaFkM" },
  { id: "08xxA0RpjCU", title: "Арт-фильм «99»", client: "Творческий проект", category: "Фэшн и арт", sphere: "Музыка и арт", duration: 45, date: "2021-11-09", youtubeId: "08xxA0RpjCU" },
  { id: "O0hXaBeKF3k", title: "ART from Russia", client: "Творческий проект", category: "Фэшн и арт", sphere: "Музыка и арт", duration: 546, date: "2021-06-19", youtubeId: "O0hXaBeKF3k" },
  { id: "4Aj7F2Nz7BM", title: "БЕЛЫЙ КИТ · 32 оттенка белого", client: "БЕЛЫЙ КИТ", category: "Фэшн и арт", sphere: "Медицина", duration: 91, date: "2019-04-24", youtubeId: "4Aj7F2Nz7BM" },
  { id: "K-Rlt2meKCw", title: "Halloween в Opera club & lounge · 27 октября", client: "Opera club & lounge", category: "Фэшн и арт", sphere: "События и шоу", duration: 60, date: "2019-04-24", youtubeId: "K-Rlt2meKCw" },

  // ---------- Тревел ----------
  { id: "V59ghfoe-3Y", title: "Школа плавания «ВРИТМЕ»", client: "«ВРИТМЕ»", category: "Тревел", sphere: "Спорт и фитнес", duration: 59, date: "2021-05-05", youtubeId: "V59ghfoe-3Y" },
  { id: "1xsFpGPsFC8", title: "Travel video · Аркаим", client: "Цветок жизни", category: "Тревел", sphere: "Туризм и отели", duration: 189, date: "2024-10-23", youtubeId: "1xsFpGPsFC8" },
  { id: "Ts-ZnRUyIG8", title: "Тизер короткометражки FEELING IT", client: "Творческий проект", category: "Тревел", sphere: "Музыка и арт", duration: 175, date: "2026-02-28", youtubeId: "Ts-ZnRUyIG8" },
  { id: "VSvzGCTaKDg", title: "SURF · Треш-Фреш, 3 серия (тизер)", client: "Surf Coffee", category: "Тревел", sphere: "HoReCa и кофейни", duration: 60, date: "2021-07-16", youtubeId: "VSvzGCTaKDg" },
  { id: "kgXhVT_xLyI", title: "Анонс влога · Красная Поляна", client: "HDKV.AGENCY", category: "Тревел", sphere: "Туризм и отели", duration: 60, date: "2020-05-30", youtubeId: "kgXhVT_xLyI" },
  { id: "hx3lnMFxrI8", title: "Анонс события 28 августа", client: "Коммерческий проект", category: "Тревел", sphere: "События и шоу", duration: 119, date: "2019-08-02", youtubeId: "hx3lnMFxrI8" },

  // ---------- Имиджевые / Презентация ----------
  { id: "cHp-k-aBAgE", title: "Фильм для Ani d. Zop", client: "Ani d. Zop", category: "Имиджевые и презентации", sphere: "Красота и фэшн", duration: 127, date: "2022-03-23", youtubeId: "cHp-k-aBAgE" },
  { id: "NLaCeg5xQ28", title: "Отель ELOVOE · промо", client: "ELOVOE", category: "Имиджевые и презентации", sphere: "Туризм и отели", duration: 121, date: "2023-08-28", youtubeId: "NLaCeg5xQ28" },
  { id: "kKvaokLHsh0", title: "ЖК «Грани» · отчёт со стройки", client: "ЖК «Грани»", category: "Имиджевые и презентации", sphere: "Недвижимость и стройка", duration: 30, date: "2026-02-06", youtubeId: "kKvaokLHsh0" },
  { id: "04cOzeUw3A4", title: "Имиджевый фильм · отель ELOVOE", client: "ELOVOE", category: "Имиджевые и презентации", sphere: "Туризм и отели", duration: 152, date: "2025-03-29", youtubeId: "04cOzeUw3A4" },
  { id: "R5tT8gmU7sY", title: "Глазная клиника · плавающие помутнения", client: "Глазная клиника", category: "Имиджевые и презентации", sphere: "Медицина", duration: 108, date: "2024-04-26", youtubeId: "R5tT8gmU7sY" },
  { id: "-MC_7WYDx6I", title: "Глазная клиника · оптика", client: "Глазная клиника", category: "Имиджевые и презентации", sphere: "Медицина", duration: 71, date: "2024-04-24", youtubeId: "-MC_7WYDx6I" },
  { id: "GZ_V1iZUO9M", title: "Глазная клиника · катаракта", client: "Глазная клиника", category: "Имиджевые и презентации", sphere: "Медицина", duration: 90, date: "2024-04-24", youtubeId: "GZ_V1iZUO9M" },
  { id: "_0ATM3z0rEQ", title: "Surf Coffee Челябинск · рекламный ролик", client: "Surf Coffee", category: "Имиджевые и презентации", tags: ["Рекламные"], sphere: "HoReCa и кофейни", duration: 49, date: "2021-04-18", youtubeId: "_0ATM3z0rEQ" },
  { id: "FKYUirLqmik", title: "Парикмахерская «Молодёжная» · промо", client: "Парикмахерская «Молодёжная»", category: "Имиджевые и презентации", sphere: "Красота и фэшн", duration: 60, date: "2021-02-05", youtubeId: "FKYUirLqmik" },
  { id: "U4eC0MxLHe8", title: "Презентационный ролик · ОАО «УралТрубоДеталь»", client: "ОАО «УралТрубоДеталь»", category: "Имиджевые и презентации", sphere: "Промышленность и B2B", duration: 181, date: "2019-04-22", youtubeId: "U4eC0MxLHe8" },
  { id: "eitwwderUxs", title: "Институт агротехники", client: "Институт агротехники", category: "Имиджевые и презентации", sphere: "Образование", duration: 64, date: "2019-04-24", youtubeId: "eitwwderUxs" },

  // ---------- Корпоративные ----------
  { id: "pOV5EnAB05U", title: "Федеральная школа вождения VEKTOR", client: "VEKTOR", category: "Корпоративные", sphere: "Образование", duration: 186, date: "2026-02-04", youtubeId: "pOV5EnAB05U" },
  { id: "qCMME_ZRnu0", title: "Имиджевый фильм «Ивелла»", client: "Ивелла", category: "Корпоративные", tags: ["Имиджевые и презентации"], sphere: "Промышленность и B2B", duration: 206, date: "2026-01-28", youtubeId: "qCMME_ZRnu0" },
  { id: "esFKWcX1wIM", title: "Корпоративный фильм · медцентр VITOM", client: "VITOM", category: "Корпоративные", sphere: "Медицина", duration: 389, date: "2023-05-28", youtubeId: "esFKWcX1wIM" },
  { id: "6faTn2p6O4E", title: "Корпоративный фильм · ATOMUS GROUP", client: "ATOMUS GROUP", category: "Корпоративные", sphere: "Промышленность и B2B", duration: 215, date: "2021-12-27", youtubeId: "6faTn2p6O4E" },
  { id: "dG75H7jiYq8", title: "ЖК SOLO · рекламный ролик", client: "ЖК SOLO", category: "Корпоративные", tags: ["Рекламные"], sphere: "Недвижимость и стройка", duration: 131, date: "2021-03-04", youtubeId: "dG75H7jiYq8" },
  { id: "6up7b9Slc2s", title: "AMSARVEDA · имиджевый фильм, Гоа", client: "AMSARVEDA", category: "Корпоративные", sphere: "Туризм и отели", duration: 214, date: "2020-06-07", youtubeId: "6up7b9Slc2s" },
  { id: "VmlQmC3DPz0", title: "Корпоративный фильм · глазная клиника «Мединвест»", client: "Мединвест", category: "Корпоративные", sphere: "Медицина", duration: 384, date: "2019-04-22", youtubeId: "VmlQmC3DPz0" },
  { id: "Jk4FLI212Fg", title: "Имиджевый фильм · Первый гипермаркет мебели", client: "Первый гипермаркет мебели", category: "Корпоративные", tags: ["Имиджевые и презентации"], sphere: "Ритейл", duration: 482, date: "2019-04-23", youtubeId: "Jk4FLI212Fg" },

  // ---------- Документальные ----------
  // Фильм «RAGA» заказчик прислал и в «Музыкальных», и в «Документальных» —
  // одна карточка с двумя рубриками вместо дубликата в сетке.
  { id: "fWu_yQLR9NE", title: "RAGA · Индия, Хампи", client: "Творческий проект", category: "Документальные", tags: ["Музыкальные"], sphere: "Музыка и арт", duration: 2798, date: "2023-09-26", youtubeId: "fWu_yQLR9NE" },
  { id: "yc6L7KHqvc0", title: "Фильм · «Баскетбол. История»", client: "Творческий проект", category: "Документальные", sphere: "Спорт и фитнес", duration: 3384, date: "2024-07-02", youtubeId: "yc6L7KHqvc0" },
  { id: "QDF8t04Em3s", title: "Мотивационный фильм · Кирилл Писклов", client: "Кирилл Писклов", category: "Документальные", sphere: "Спорт и фитнес", duration: 384, date: "2022-09-12", youtubeId: "QDF8t04Em3s" },

  // ---------- Обучающие ----------
  { id: "S39pXIqbBDk", title: "Видеокурс · вводный модуль", client: "Коммерческий проект", category: "Обучающие", sphere: "Образование", duration: 456, date: "2020-12-14", youtubeId: "S39pXIqbBDk" },
  { id: "ArMkqjH8Gt4", title: "Napoleon IT · промо курсов", client: "Napoleon IT", category: "Обучающие", sphere: "IT и финтех", duration: 60, date: "2020-10-25", youtubeId: "ArMkqjH8Gt4" },

  // ---------- Моушн / 3D ----------
  { id: "OFHITIVB36I", title: "AGGA EMPIRE · анимация логотипа", client: "AGGA EMPIRE", category: "Моушн и 3D", sphere: "Промышленность и B2B", duration: 7, date: "2018-02-01", youtubeId: "OFHITIVB36I" },
  { id: "JEZFxVd1Un0", title: "3D-анимация · франшиза GoodGame", client: "GoodGame", category: "Моушн и 3D", sphere: "IT и финтех", duration: 151, date: "2020-06-03", youtubeId: "JEZFxVd1Un0" },
  { id: "znxECfyxtX0", title: "PROFILACTIKA · моушн-промо", client: "PROFILACTIKA", category: "Моушн и 3D", sphere: "Медицина", duration: 77, date: "2021-05-05", youtubeId: "znxECfyxtX0" },
  { id: "xnb_uuddJpA", title: "Анимационный ролик · Школа сметчиков", client: "Школа сметчиков", category: "Моушн и 3D", sphere: "Образование", duration: 84, date: "2024-04-22", youtubeId: "xnb_uuddJpA" },
  { id: "LJI_uG5nKEQ", title: "Проморолик · «Росальянс»", client: "Росальянс", category: "Моушн и 3D", sphere: "Промышленность и B2B", duration: 142, date: "2018-01-16", youtubeId: "LJI_uG5nKEQ" },
  { id: "FtwaFzYvwkc", title: "РУСТЕХ · Логика — 3D-трекинг и инфографика", client: "РУСТЕХ", category: "Моушн и 3D", sphere: "Промышленность и B2B", duration: 99, date: "2024-04-18", youtubeId: "FtwaFzYvwkc" },
  { id: "lcIUQ6Mo_to", title: "Первый гипермаркет мебели · анимационный ролик", client: "Первый гипермаркет мебели", category: "Моушн и 3D", sphere: "Ритейл", duration: 10, date: "2020-05-12", youtubeId: "lcIUQ6Mo_to" },
  { id: "C6LmeiF9taA", title: "Инфографика · школа иностранных языков", client: "Коммерческий проект", category: "Моушн и 3D", sphere: "Образование", duration: 62, date: "2020-05-24", youtubeId: "C6LmeiF9taA" },
];
