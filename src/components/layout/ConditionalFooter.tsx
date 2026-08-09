"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// The homepage renders Footer itself as the last section (see page.tsx) —
// rendering it again here too would duplicate it in the DOM. Every other
// route still gets the plain Footer from here.
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
