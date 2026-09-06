import type { ReactNode } from "react";

// Описание одной страницы направления (/content/presentation,
// /content/advertising и остальные).
//
// Страницы построены по одному референсу (ruvision.ru) и различаются
// содержимым и раскладкой, поэтому компоненты живут в одном месте, а каждое
// направление — это объект такого типа. Новое направление = новый файл
// данных, а не новый набор компонентов.

/** Фон блока: отрывок из нашей же работы (public/video/works) или стоковый
 *  кадр (public/images/blocks).
 *
 *  Отрывки режутся из настоящих работ портфолио, а не из фоновых петель
 *  сайта: на фоне блока про производство должен играть реальный цех
 *  клиента, а не абстрактная заставка.
 *
 *  Отрывок длинный (~30 c) и идёт ТОЛЬКО ВПЕРЁД. Первая версия склеивала
 *  десятисекундные бумеранги — прямой проход плюс его реверс, — чтобы
 *  нативный loop сходился бесшовно. Егор поймал это с первого взгляда:
 *  «слишком быстро циклируют, заметно и некрасиво». Реверс и короткие петли
 *  здесь запрещены; вместо бесшовности мы берём длину, а стык петли прячем
 *  затемнением на первой и последней секунде отрывка.
 *
 *  Внутри одной страницы каждый блок берёт СВОЁ видео: повтор одного и того
 *  же ролика в двух блоках Егор тоже отдельно отметил. Видео и стоковые
 *  кадры чередуются — «бумажные» блоки (смета, процесс, FAQ) идут на стоке,
 *  содержательные — на работах. */
export type BlockMediaSpec = {
  video?: string;
  /** Обязателен вместе с `video`: кадр с того же таймкода, иначе блок
   *  моргает чёрным до первого декодированного кадра. */
  poster?: string;
  photo?: string;
  /** Насколько кадр виден: `quiet` под плотным текстом, `loud` в блоке-
   *  перебивке. См. BlockMedia. */
  intensity?: "quiet" | "medium" | "loud";
  /** object-position, если важная часть кадра не по центру. */
  position?: string;
  /** Сила размытия кадра в пикселях. По умолчанию BLUR.base.
   *
   *  Размытие здесь несёт три работы сразу, и все три — по прямой просьбе
   *  Егора. Первая: наш текст переставал спорить с фоном («наши текста
   *  сильно размываются с видео»). Вторая: почти в каждой корпоративной
   *  работе портфолио текст вшит прямо в кадр — спецификации, титры,
   *  рекламные плашки; в размытии они становятся фактурой, а не словами, и
   *  чистое окно в исходнике искать больше не нужно. Третья: размытие
   *  прячет артефакты сжатия, из-за которых фон «пикселил и рассыпался».
   *
   *  Ставить BLUR.heavy тем отрывкам, где текста в кадре много. */
  blurPx?: number;
};

/** Раскладка шапки блока. Каждый блок на странице берёт свою — Егор просил,
 *  чтобы заголовки стояли по-разному и страница не читалась как список
 *  одинаковых секций. */
export type HeadAlign = "left" | "center" | "right" | "sticky";

export type DirectionStat = { value: string; label: string };

export type DirectionAudienceItem = {
  number: string;
  role: string;
  title: string;
  text: string;
  /** Фрагмент `text`, который подсвечивается оранжевым. */
  accent?: string;
  href: string;
  linkLabel: string;
};

export type DirectionTier = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  /** Выделенный по умолчанию тариф, пока посетитель не выбрал задачу. */
  pro?: boolean;
};

export type DirectionStep = {
  number: string;
  title: string;
  text: string;
  accent?: string;
};

export type DirectionReason = {
  /** Короткий якорь-цифра слева: «26 наград», «2–4 нед», «1→N». */
  anchor: string;
  title: string;
  text: string;
  accent?: string;
};

export type DirectionFaqItem = { q: string; a: string };

/** Один вариант ответа на вопрос «зачем вы пришли». Выбор поднят в контекст
 *  страницы (см. TaskContext) и меняет сразу несколько блоков. */
export type DirectionTask = {
  id: string;
  label: string;
  hint: string;
  /** Какой тариф подсветить в смете. */
  tierId: string;
  /** Строка срока, которая появляется в блоке процесса. */
  timeline: string;
  /** Работы, которые выносятся вперёд в портфолио. */
  caseIds: string[];
  /** Персональное обещание в финальном блоке. */
  promise: string;
};

/** Шапка блока: надзаголовок, заголовок, подзаголовок и её раскладка. */
export type DirectionSectionHead = {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: HeadAlign;
  media?: BlockMediaSpec;
};

export type DirectionContent = {
  /** Сегмент URL внутри /content. */
  slug: string;

  hero: {
    eyebrow: string;
    title: ReactNode;
    lead: ReactNode;
    video: string;
    poster: string;
    /** Если задано — эта строка печатается в заголовке первого экрана.
     *  Ровно один печатающийся элемент на страницу: либо здесь, либо
     *  `typed` у одного из блоков ниже. */
    typed?: string;
  };

  /** Цвета градиентного фона страницы — два пятна. */
  backdrop: { from: string; to: string };

  stats: DirectionStat[];
  /** Фон полосы цифр. Полоса тонкая, но без фона она превращается в чёрный
   *  разрыв между героем и следующим блоком — ровно ту «широкую чёрную
   *  полосу», которую Егор просил убрать. */
  statsMedia?: BlockMediaSpec;

  /** Заголовок блока персонализации — короткий вопрос, набранный как
   *  заголовок главы. Егор просил, чтобы этот блок читался как основной, а
   *  не как подпись над чипами: персонализация — смысловой центр страницы,
   *  а не декоративный виджет. */
  taskPrompt: string;
  /** Строка под кнопками: что именно произойдёт после выбора. Без неё
   *  посетитель не понимает, зачем нажимать. */
  taskNote: string;
  tasks: DirectionTask[];
  /** Фон блока выбора задачи — по той же причине, что и statsMedia. */
  taskMedia?: BlockMediaSpec;

  audience: DirectionSectionHead & { items: DirectionAudienceItem[] };

  cases: DirectionSectionHead & {
    /** id работ из lib/data.ts, перечисленные вручную и в нужном порядке. */
    workIds: string[];
  };

  /** Фон второго блока персонализации (бюджет и срок). Он стоит вплотную
   *  перед сметой, поэтому кадр здесь тоже обязателен — иначе между двумя
   *  блоками снова появится чёрный разрыв. */
  budgetMedia?: BlockMediaSpec;

  pricing: DirectionSectionHead & { tiers: DirectionTier[]; note: string };

  /** Фон третьего блока персонализации (что у клиента уже есть). */
  assetsMedia?: BlockMediaSpec;

  /** Опциональный блок «почему мы» — есть не у каждого направления. */
  why?: DirectionSectionHead & { items: DirectionReason[] };

  process: DirectionSectionHead & {
    steps: DirectionStep[];
    /** Печатать заголовок этого блока вместо героя. */
    typed?: string;
  };

  faq: DirectionSectionHead & { items: DirectionFaqItem[] };

  close: DirectionSectionHead;
};
