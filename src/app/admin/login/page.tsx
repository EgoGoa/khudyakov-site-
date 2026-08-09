import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { login } from "../actions";

export const metadata: Metadata = {
  title: "Вход в панель — KHUDYAKOV.AGENCY",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-md">
        <Eyebrow label="Панель управления" />
        <h1 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
          Вход для студии
        </h1>
        <p className="mt-3 text-sm text-paper/55">
          Страница закрыта от посетителей сайта.
        </p>

        <form action={login} className="liquid-glass mt-8 space-y-4 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-paper/70">Пароль</span>
            <input
              type="password"
              name="password"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/35 focus:border-glow focus:outline-none"
            />
          </label>

          {error && (
            <p className="text-sm text-rec">Неверный пароль — попробуйте ещё раз.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-rec px-8 py-3.5 text-sm font-medium text-white transition hover:bg-rec-light active:scale-95"
          >
            Войти
          </button>
        </form>
      </Container>
    </section>
  );
}
