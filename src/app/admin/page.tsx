import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { isDeliveryConfigured } from "@/lib/brief-delivery";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Панель — HDKV.AGENCY",
  robots: { index: false, follow: false },
};

// Rendered per request, not at build time. The delivery status below is read
// from the environment, and prerendering would freeze whatever was set when
// the site was built — so adding TELEGRAM_BOT_TOKEN later and restarting would
// still show "не настроен" until the next deploy, which is exactly the
// question this page exists to answer.
export const dynamic = "force-dynamic";

// The landing page for a successful login. Without it `login()`'s
// redirect("/admin") pointed at a route with no page component at all, so the
// correct password was answered with the framework's own 404 — in English, on
// an otherwise Russian site. Middleware (src/middleware.ts) gates every
// /admin/* route except /admin/login and /admin/setup, this page included, so
// reaching here already means the session cookie checked out.
export default function AdminPage() {
  // Whether a submitted brief actually reaches the agency is the one piece of
  // site state whose answer is invisible from the outside — a visitor sees the
  // same form either way. Shown here so it can be checked without reading
  // environment variables or asking a developer.
  const briefDelivery = isDeliveryConfigured();

  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-2xl">
        <Eyebrow label="Панель управления" />
        <h1 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
          Вы вошли
        </h1>
        <p className="mt-4 text-base leading-relaxed text-paper/60">
          Страница закрыта паролем и не индексируется поисковиками.
        </p>

        <div className="liquid-glass mt-8 rounded-2xl p-6">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                briefDelivery ? "bg-glow" : "bg-rec"
              }`}
            />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-paper/70">
              Приём брифов
            </span>
          </div>
          {briefDelivery ? (
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              Настроен. Заполненные брифы приходят в Telegram сразу после
              отправки — от клиента ничего дополнительно не требуется.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              Не настроен. Бриф сейчас доходит запасным путём: клиент копирует
              текст и отправляет его письмом сам — часть клиентов на этом шаге
              отваливается. Чтобы включить прямую доставку, добавьте в
              переменные окружения{" "}
              <code className="text-glow">TELEGRAM_BOT_TOKEN</code> и{" "}
              <code className="text-glow">TELEGRAM_CHAT_ID</code> (токен — у
              @BotFather в Telegram) и перезапустите сайт.
            </p>
          )}
        </div>

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
