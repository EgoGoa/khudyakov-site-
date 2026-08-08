export default function Eyebrow({
  index,
  label,
  tone = "rec",
}: {
  index?: string;
  label: string;
  tone?: "rec" | "glow";
}) {
  return (
    <span
      className={`mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] ${
        tone === "glow" ? "text-glow" : "text-rec"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone === "glow" ? "bg-glow" : "bg-rec"}`}
      />
      {index ? `${index} · ${label}` : label}
    </span>
  );
}
