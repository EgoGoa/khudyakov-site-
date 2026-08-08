import type { ElementType, ReactNode } from "react";

const gradientStyle = {
  backgroundImage:
    "linear-gradient(to right, #DCDDEF 0%, #7DD3FC 20%, #A4F4FD 40%, #00D2FF 50%, #A4F4FD 60%, #7DD3FC 80%, #DCDDEF 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
  WebkitTextFillColor: "transparent",
  filter: "url(#khud-noise-headline)",
};

export default function ShinyText({
  children,
  as: Tag = "span",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={`animate-shiny inline-block ${className}`} style={gradientStyle}>
      {children}
    </Tag>
  );
}
