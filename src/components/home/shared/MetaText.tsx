// Splits a caption like "8–12 роликов в месяц" into digit runs and word
// runs, so numbers can carry more visual weight than the words around them.
// Inherits color/tracking from the parent span — only touches weight/size.
export function MetaText({ children }: { children: string }) {
  const parts = children.split(/(\d[\d\s.,–-]*\d|\d)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, i) =>
        /\d/.test(part) ? (
          <span key={i} className="font-bold tracking-normal text-[1.3em]">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
