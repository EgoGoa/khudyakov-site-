import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Хуки (usePathname, useRouter) добавляют /en сами. Link — свой, см. Link.tsx.
export const { redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
export { Link } from "./Link";
