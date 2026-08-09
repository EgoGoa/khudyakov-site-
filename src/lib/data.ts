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

// Реальные работы агентства, извлечённые из КП «HUDYAKOV.AGENCY» —
// сгруппированы по тем же категориям, что и в оригинальном документе.
export const works: Work[] = [
  // Корпоративные фильмы
  { id: "medinvest", title: "Глазная клиника Мединвест", client: "Мединвест", category: "Корпоративные фильмы", youtubeId: "VmlQmC3DPz0" },
  { id: "uraltrubodetal", title: "УралТрубоДеталь", client: "ОАО УралТрубоДеталь", category: "Корпоративные фильмы", youtubeId: "U4eC0MxLHe8" },

  // Рекламные ролики
  { id: "belyikit", title: "32 оттенка белого", client: "БЕЛЫЙ КИТ", category: "Рекламные ролики", youtubeId: "4Aj7F2Nz7BM" },
  { id: "kia", title: "Реклама автомобиля", client: "KIA", category: "Рекламные ролики", youtubeId: "0kHKcCuqh74" },
  { id: "vritme", title: "Школа плавания", client: "«ВРИТМЕ»", category: "Рекламные ролики", youtubeId: "V59ghfoe-3Y" },
  { id: "surfcoffee", title: "Surf Coffee", client: "Surf Coffee, Челябинск", category: "Рекламные ролики", youtubeId: "_0ATM3z0rEQ" },
  { id: "parkcity", title: "PARK CITY FITNESS", client: "Park City Fitness", category: "Рекламные ролики", youtubeId: "L4XspMrpk3w" },
  { id: "solo", title: "ЖК SOLO", client: "ЖК SOLO", category: "Рекламные ролики", youtubeId: "dG75H7jiYq8" },

  // Промо-ролики
  { id: "molodezhnaya", title: "Парикмахерская «Молодёжная»", client: "Молодёжная", category: "Промо-ролики", youtubeId: "FKYUirLqmik" },
  { id: "geopro", title: "geo PRO 15", client: "geo PRO", category: "Промо-ролики", youtubeId: "7xc3YciAlBY" },
  { id: "profilactika", title: "Promo Motion", client: "PROFILACTIKA", category: "Промо-ролики", youtubeId: "znxECfyxtX0" },
  { id: "carpoint", title: "Имиджевое промо", client: "CARPOINT 2021", category: "Промо-ролики", youtubeId: "iaHvMPD9xQs" },

  // Имиджевые / творческие фильмы
  { id: "motivational", title: "Мотивационный фильм", client: "Творческий проект", category: "Имиджевые фильмы", youtubeId: "jVIvEvrv8KI" },
  { id: "anidzop", title: "Ani d. Zop est. 2021", client: "Ani d. Zop", category: "Имиджевые фильмы", youtubeId: "cHp-k-aBAgE" },

  // 3D-анимация
  { id: "goodgame3d", title: "Анимация для kinouslug.ru", client: "GoodGame", category: "3D-анимация", youtubeId: "JEZFxVd1Un0" },

  // FPV / Cinematic
  { id: "fpvgolf", title: "FPV Cinematic", client: "Гольф-клуб", category: "FPV / Cinematic", youtubeId: "8DnPZc-pESc" },

  // Инфо-контент
  { id: "kinouslugprice", title: "Из чего складывается стоимость видео?", client: "KINOUSLUG", category: "Инфо-контент", youtubeId: "Xukwf3JoQS0" },
];
