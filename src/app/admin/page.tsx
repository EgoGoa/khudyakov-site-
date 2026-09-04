import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Панель — HDKV.AGENCY",
  robots: { index: false, follow: false },
};

// The landing page for a successful login. Without it `login()`'s
// redirect("/admin") pointed at a route with no page component at all, so the
// correct password was answered with the framework's own 404 — in English, on
// an otherwise Russian site. Middleware (src/middleware.ts) gates every
// /admin/* route except /admin/login and /admin/setup, this page included, so
// reaching here already means the session cookie checked out.
export default function AdminPage() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-2xl">
        <Eyebrow label="Панель управления" />
        <h1 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
          Вы вошли
        </h1>
        <p className="mt-4 text-base leading-relaxed text-paper/60">
          Раздел пока пустой — здесь появятся инструменты управления сайтом.
          Страница закрыта паролем и не индексируется поисковиками.
        </p>

        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/50"
          >
            Выйти
          </button>
        </form>
      </Container>
    </section>
  );
}
