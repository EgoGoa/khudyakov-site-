"use client";

import { useCleanPathname } from "@/lib/use-clean-pathname";
import Footer from "./Footer";

// The homepage renders Footer itself as the last section (see page.tsx) —
// rendering it again here too would duplicate it in the DOM. Every other
// route still gets the plain Footer from here.
export default function ConditionalFooter() {
  const pathname = useCleanPathname();
  if (pathname === "/") return null;
  return <Footer />;
}
