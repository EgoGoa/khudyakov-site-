import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { ServiceKey } from "@/lib/service-content";
import type { BlockRole } from "@/lib/welcome-blocks";

// Лёгкая неоновая графика в правой части карточек вступительной сцены.
//
// Почему схема, а не иконка: иконка называет карточку второй раз — название
// уже стоит слева. Схема показывает её *форму*: у «работ» это сетка кадров,
// у «процесса» — шаги на линии, у SMM — телефон с волнами охвата. Человек
// узнаёт карточку глазом раньше, чем дочитает подпись.
//
// Почему один набор ролей на все четыре раздела: блоки страниц совпадают по
// ролям (см. ROLES в page-hop.ts), и четыре комплекта одинаковых по смыслу
// схем значили бы четыре раза поддерживать одно и то же.
//
// Цвет — не сплошной, а градиент страницы: обводка красится ссылкой на
// <linearGradient>, чьи стопы читают те же --sp-from/--sp-to, что и
// название карточки. Поэтому схема светится ровно тем же неоном, что и всё
// остальное на этой карточке, и не выглядит приклеенной иконкой из другого
// набора. Идентификатор градиента приходит снаружи: два одинаковых id на
// странице сцепились бы, и все карточки взяли бы цвет первой.
//
// Всё — тонкие штрихи без заливок: схема стоит на кадре и обязана читаться
// поверх него, не перетягивая внимание с названия.

const G = {
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const BLOCK_SHAPES: Record<BlockRole, ReactNode> = {
  // Раскрывающийся веер — направления, расходящиеся из одной точки.
  intro: (
    <>
      <path d="M8 40V16M20 40V10M32 40V20M44 40V6" />
      <circle cx="8" cy="16" r="2.2" />
      <circle cx="20" cy="10" r="2.2" />
      <circle cx="32" cy="20" r="2.2" />
      <circle cx="44" cy="6" r="2.2" />
    </>
  ),
  // Сетка кадров — портфолио.
  works: (
    <>
      <rect x="5" y="8" width="18" height="13" rx="2.5" />
      <rect x="29" y="8" width="18" height="13" rx="2.5" />
      <rect x="5" y="27" width="18" height="13" rx="2.5" />
      <rect x="29" y="27" width="18" height="13" rx="2.5" />
      <path d="M35.5 31.5l5 3-5 3z" />
    </>
  ),
  // Две кривые, одна выше другой — «почему это подходит именно вам».
  why: (
    <>
      <path d="M5 36c8 0 12-4 16-11s9-13 20-13" />
      <path d="M5 41c10 0 15-3 20-8s10-9 17-9" opacity="0.45" />
      <circle cx="41" cy="12" r="2.6" />
    </>
  ),
  // Люди вокруг общего центра — команда, а не коробка.
  trust: (
    <>
      <circle cx="26" cy="24" r="6.5" />
      <circle cx="26" cy="7" r="3" />
      <circle cx="26" cy="41" r="3" />
      <circle cx="9" cy="24" r="3" />
      <circle cx="43" cy="24" r="3" />
      <path d="M26 10v7.5M26 30.5V38M12 24h7.5M32.5 24H40" opacity="0.5" />
    </>
  ),
  // Столбики разной высоты — набор форматов на выбор.
  offer: (
    <>
      <rect x="6" y="26" width="9" height="16" rx="2" />
      <rect x="21" y="16" width="9" height="26" rx="2" />
      <rect x="36" y="21" width="9" height="21" rx="2" />
      <path d="M6 9h39" opacity="0.4" />
    </>
  ),
  // Щит с галочкой — зафиксированные условия.
  guarantees: (
    <>
      <path d="M26 5l16 6v14c0 9-7 16-16 19-9-3-16-10-16-19V11z" />
      <path d="M19 23l5 5 11-11" />
    </>
  ),
  // Шаги на линии — этапы работы.
  process: (
    <>
      <path d="M6 24h40" opacity="0.4" />
      <circle cx="9" cy="24" r="3.4" />
      <circle cx="26" cy="24" r="3.4" />
      <circle cx="43" cy="24" r="3.4" />
      <path d="M9 17V9M26 31v8M43 17V9" opacity="0.55" />
    </>
  ),
  // Конверт со стрелкой — заявка и ответ.
  close: (
    <>
      <rect x="5" y="12" width="34" height="24" rx="3" />
      <path d="M5 16l17 11 17-11" />
      <path d="M40 40h8M44 36l4 4-4 4" />
    </>
  ),
};

// Четыре направления. Крупнее и проще блочных: на карточке направления
// схема стоит рядом с кадром во всю её высоту, и мелкая штриховка там
// читалась бы как шум.
const DIRECTION_SHAPES: Record<ServiceKey, ReactNode> = {
  // Хлопушка и кадр — съёмка и монтаж.
  content: (
    <>
      <rect x="5" y="16" width="42" height="26" rx="3.5" />
      <path d="M5 22h42" />
      <path d="M5 16l40-8 2 6-40 8z" />
      <path d="M15 10.5l2.5 5.6M25 8.5l2.5 5.6M35 6.5l2.5 5.6" opacity="0.6" />
      <path d="M22 28l9 5.5-9 5.5z" />
    </>
  ),
  // Узел сети — связи, сходящиеся в ядро.
  ai: (
    <>
      <circle cx="26" cy="24" r="6" />
      <circle cx="8" cy="11" r="3" />
      <circle cx="8" cy="37" r="3" />
      <circle cx="44" cy="11" r="3" />
      <circle cx="44" cy="37" r="3" />
      <circle cx="26" cy="5" r="3" />
      <path d="M10.5 13l11 7.5M10.5 35l11-7.5M41.5 13l-11 7.5M41.5 35l-11-7.5M26 8v10" opacity="0.6" />
    </>
  ),
  // Окно браузера с курсором — сайт.
  sites: (
    <>
      <rect x="5" y="8" width="42" height="32" rx="3.5" />
      <path d="M5 17h42" />
      <circle cx="11" cy="12.5" r="1.4" />
      <circle cx="16" cy="12.5" r="1.4" />
      <path d="M12 24h13M12 30h20" opacity="0.55" />
      <path d="M32 23l10 9-4.4 1.1L39 38l-3 1-1.6-4.6-3.4 2.6z" />
    </>
  ),
  // Телефон и волны охвата — ведение соцсетей.
  smm: (
    <>
      <rect x="9" y="6" width="22" height="36" rx="4" />
      <path d="M17 11h6" opacity="0.6" />
      <path d="M15 24h10M15 30h7" opacity="0.55" />
      <path d="M36 17c3 4 3 10 0 14" opacity="0.8" />
      <path d="M42 12c5 7 5 17 0 24" opacity="0.5" />
    </>
  ),
};

/** Раскладывает фрагмент схемы на отдельные штрихи и метит каждый двумя
 *  вещами: `pathLength="1"` и порядковым номером `--k`.
 *
 *  Зачем. Прорисовка штриха (stroke-dashoffset) работает в долях длины
 *  контура, и без нормализованной длины пришлось бы считать её для каждого
 *  path, rect и circle вручную. С pathLength=1 один и тот же CSS рисует
 *  любой штрих. Номер нужен, чтобы штрихи вступали друг за другом, а не
 *  разом, — из этого и получается «сборка» иконки. */
function stroked(shape: ReactNode): ReactNode {
  const root = isValidElement(shape) ? (shape as ReactElement<{ children?: ReactNode }>) : null;
  const parts = Children.toArray(root ? root.props.children : shape);
  return parts.map((part, i) =>
    isValidElement(part)
      ? cloneElement(part as ReactElement<Record<string, unknown>>, {
          pathLength: 1,
          style: { "--k": i } as CSSProperties,
        })
      : part
  );
}

function Frame({ gid, shape }: { gid: string; shape: ReactNode }) {
  return (
    <svg viewBox="0 0 52 48" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
      </defs>
      {/* Обводка задана на группе, а не на каждой фигуре: так один и тот же
          градиент достаётся всем штрихам схемы без повторения атрибута. */}
      <g {...G} stroke={`url(#${gid})`} strokeWidth={1.4}>
        {stroked(shape)}
      </g>
    </svg>
  );
}

export default function WelcomeBlockGraphic({ role, gid }: { role: BlockRole; gid: string }) {
  return <Frame gid={gid} shape={BLOCK_SHAPES[role]} />;
}

export function WelcomeDirectionGraphic({ serviceKey, gid }: { serviceKey: ServiceKey; gid: string }) {
  return <Frame gid={gid} shape={DIRECTION_SHAPES[serviceKey]} />;
}
