import type { ReactNode } from "react";

// Разметка цвета в текстах человека команды — Егор попросил меньше белого в
// заголовках: несколько градиентов и местами серые слова.
//   *слово* — градиент страницы (у /sites розовый → голубой)
//   ^слово^ — тёплый оранжево-жёлтый
//   ~слово~ — приглушённый серый: только изредка в больших заголовках окна
//            (Егор: «серый из текста убираем», «в больших заголовках иногда норм»)
const CLS: Record<string, string> = { "*": "team-pulse-acc", "^": "team-pulse-warm", "~": "team-pulse-muted" };

export function marks(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /([*^~])([^*^~]+)\1/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index} className={CLS[m[1]]}>
        {m[2]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Та же строка без разметки — для подсчёта букв при печати. */
export const plain = (text: string) => text.replace(/[*^~]/g, "");
