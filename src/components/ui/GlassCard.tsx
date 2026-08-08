import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
  rounded = "rounded-2xl",
}: {
  children: ReactNode;
  className?: string;
  rounded?: string;
}) {
  return <div className={`liquid-glass ${rounded} ${className}`}>{children}</div>;
}
