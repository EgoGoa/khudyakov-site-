import { redirect } from "next/navigation";

// "Создание контента" is the default service — the bare domain sends
// visitors straight there instead of duplicating that page's content here.
export default function HomePage() {
  redirect("/content");
}
