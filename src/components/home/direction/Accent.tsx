import type { ReactNode } from "react";

// Один выделенный фрагмент внутри абзаца.
//
// Тексты на этой странице набраны белым — иерархию больше не держит серый,
// поэтому её держит акцент: в каждом абзаце подсвечен ровно один смысловой
// кусок, тот, ради которого абзац написан. Тот же приём, что .kw в
// заголовках, только для основного текста и в фирменном оранжевом, а не
// градиентом — градиент в мелком кегле теряет читаемость.
export default function Accent({ children }: { children: ReactNode }) {
  return <span className="font-medium text-orange">{children}</span>;
}

/** Подсвечивает подстроку внутри готовой строки — чтобы копирайт оставался
 *  обычным текстом в presentationContent.ts, а не JSX. Если фрагмент не
 *  найден, строка отрисуется как есть. */
export function withAccent(text: string, phrase?: string): ReactNode {
  if (!phrase) return text;
  const i = text.indexOf(phrase);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <Accent>{phrase}</Accent>
      {text.slice(i + phrase.length)}
    </>
  );
}
