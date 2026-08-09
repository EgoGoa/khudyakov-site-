import type { ElementType, ReactNode } from "react";

// noise-filter treatment removed for readability — keeps just the shiny
// cyan gradient sweep (see design_handoff_homepage_updates)
const gradientStyle = {
  backgroundImage: "linear-gradient(to right, #7DD3FC, #00D2FF, #7DD3FC)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
  WebkitTextFillColor: "transparent",
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
