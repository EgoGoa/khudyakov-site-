"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/ui/Icons";

// Крестик окна для телефона (Егор, 2026-10-04): сверху его не достать
// большим пальцем, поэтому на узком экране он стоит внизу по центру — над
// полосой голосового ассистента, там, где лежит палец. Один на все окна:
// каждое окно просто монтирует его, пока открыто, а свой верхний крестик
// прячет на телефоне классом `mobile-hide` (globals.css). Рисуется порталом в body:
// `fixed` внутри окна считался бы от его transform, а не от экрана.
// На компьютере и планшете не виден (см. .mobile-close в globals.css).
export default function MobileClose({ onClick, label = "Закрыть" }: { onClick: () => void; label?: string }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- портал только после гидратации
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <button
      type="button"
      className="mobile-close"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <CloseIcon />
    </button>,
    document.body,
  );
}
