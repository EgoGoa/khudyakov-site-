import type { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 land:pl-[max(2rem,calc(env(safe-area-inset-left)+1rem))] land:pr-[max(2rem,calc(env(safe-area-inset-right)+1rem))] ${className}`}>
      {children}
    </div>
  );
}
