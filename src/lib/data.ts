import type { Service, Work } from "./types";

export const services: Service[] = [
  {
    title: "Продвижение товаров и услуг",
    description:
      "Рекламные ролики, которые доносят суть продукта и продают через эмоцию и точный посыл.",
  },
  {
    title: "Наполнение социальных сетей",
    description:
      "Регулярный видеоконтент для Instagram, Reels, YouTube и Telegram в стиле бренда.",
  },
  {
    title: "Развитие личного бренда",
    description:
      "Видео для экспертов и лидеров мнений — от интервью до имиджевых роликов.",
  },
  {
    title: "3D\\2D графика",
    description:
      "Анимация, инфографика и визуальные эффекты любой сложности — от заставки до VFX.",
  },
  {
    title: "Специальные проекты",
    description:
      "Нестандартные форматы под задачу клиента — от идеи и сценария до реализации.",
  },
  {
    title: "Обучающие ролики",
    description:
      "Видеоуроки и объясняющие ролики, которые понятно доносят сложные темы.",
  },
  {
    title: "Музыкальные клипы",
    description:
      "Полное производство клипа: концепция, съёмка, монтаж и цветокоррекция.",
  },
  {
    title: "Продвижение мероприятия",
    description:
      "Афтер-муви и промо-ролики конференций, презентаций и корпоративных событий.",
  },
  {
    title: "Продвижение компании",
    description:
      "Имиджевые и корпоративные фильмы, формирующие доверие к бренду.",
  },
];

// Технические видео-заглушки (реальных исходников агентства в КП не было —
// только стоп-кадры). Ссылки проверены на доступность и переживут смену CDN
// хуже, чем реальные файлы, поэтому при получении настоящих роликов замените
// videoSrc на реальные файлы агентства.
const PLACEHOLDER_VIDEOS = {
  bbb: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
  bbbAlt: "https://www.w3schools.com/html/mov_bbb.mp4",
  flower: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  jellyfish: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
  sintel: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
  movie: "https://www.w3schools.com/html/movie.mp4",
};

export const works: Work[] = [
  {
    id: "01",
    title: "Реклама автомобиля",
    client: "KIA",
    category: "Автопром",
    year: "2024",
    videoSrc: PLACEHOLDER_VIDEOS.bbb,
    gradient: "from-violet-500/30 via-neutral-100 to-white",
  },
  {
    id: "02",
    title: "Сезон побед",
    client: "Федерация баскетбола",
    category: "Спорт",
    year: "2024",
    videoSrc: PLACEHOLDER_VIDEOS.jellyfish,
    gradient: "from-amber-400/30 via-neutral-100 to-white",
  },
  {
    id: "03",
    title: "На поле",
    client: "Гольф-клуб",
    category: "Спорт",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.sintel,
    gradient: "from-lime-400/30 via-neutral-100 to-white",
  },
  {
    id: "04",
    title: "Ani d. Zop est. 2021",
    client: "Ani d. Zop",
    category: "Мода",
    year: "2024",
    videoSrc: PLACEHOLDER_VIDEOS.flower,
    gradient: "from-rose-400/30 via-neutral-100 to-white",
  },
  {
    id: "05",
    title: "В кресле мастера",
    client: "Барбершоп",
    category: "Бьюти",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.bbbAlt,
    gradient: "from-pink-400/30 via-neutral-100 to-white",
  },
  {
    id: "06",
    title: "COTRIL",
    client: "COTRIL",
    category: "Бьюти",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.movie,
    gradient: "from-fuchsia-400/30 via-neutral-100 to-white",
  },
  {
    id: "07",
    title: "OUTDOOR",
    client: "OUTDOOR",
    category: "Lifestyle",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.jellyfish,
    gradient: "from-teal-400/30 via-neutral-100 to-white",
  },
  {
    id: "08",
    title: "Вечерний коктейль",
    client: "Lifestyle-съёмка",
    category: "Lifestyle",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.flower,
    gradient: "from-cyan-400/30 via-neutral-100 to-white",
  },
  {
    id: "09",
    title: "Производство",
    client: "Металлургия",
    category: "Промышленность",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.sintel,
    gradient: "from-indigo-400/30 via-neutral-100 to-white",
  },
  {
    id: "10",
    title: "GOOD GAME",
    client: "GOOD GAME",
    category: "Шоу и развлечения",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.bbb,
    gradient: "from-orange-400/30 via-orange-100/40 to-white",
  },
  {
    id: "11",
    title: "Ждём вас",
    client: "Приглашение на мероприятие",
    category: "Ивенты",
    year: "2023",
    videoSrc: PLACEHOLDER_VIDEOS.movie,
    gradient: "from-sky-400/30 via-neutral-100 to-white",
  },
];
