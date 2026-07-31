const FRAME_COUNT = 10;
const frames = Array.from({ length: FRAME_COUNT }, (_, i) => i + 1);
// duplicated once for a seamless CSS-driven loop (see .reel-track in globals.css)
const loop = [...frames, ...frames];

export default function Reel() {
  return (
    <section className="reel overflow-hidden border-y border-ink/10 bg-ink py-4">
      <div className="reel-track flex w-max gap-3">
        {loop.map((n, i) => (
          <div
            key={`${n}-${i}`}
            className="flex h-24 w-40 shrink-0 items-center justify-center rounded-md border border-paper/10 bg-ink-soft font-mono text-xs uppercase tracking-[0.2em] text-paper/40 sm:h-32 sm:w-56"
          >
            Кадр {String(n).padStart(2, "0")}
          </div>
        ))}
      </div>
    </section>
  );
}
