import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Панель не настроена — KHUDYAKOV.AGENCY",
  robots: { index: false, follow: false },
};

export default function AdminSetupPage() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-2xl">
        <Eyebrow label="Требуется настройка" />
        <h1 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl">
          Задайте пароль панели
        </h1>
        <p className="mt-4 text-base leading-relaxed text-paper/60">
          Панель закрыта, потому что пароль ещё не задан. Придумайте его сами и
          добавьте в файл <code className="text-glow">.env.local</code> в корне
          проекта — в код он не попадает и в репозиторий не уезжает.
        </p>

        <pre className="liquid-glass mt-6 overflow-x-auto p-5 text-sm text-paper/80">
          <code>ADMIN_PASSWORD=ваш-пароль</code>
        </pre>

        <p className="mt-6 text-sm leading-relaxed text-paper/55">
          После этого перезапустите сервер разработки — и на{" "}
          <code className="text-glow">/admin</code> появится форма входа. Если
          сайт опубликован, тот же ключ нужно добавить в переменные окружения
          хостинга.
        </p>
      </Container>
    </section>
  );
}
