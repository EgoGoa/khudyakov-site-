import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-white">
      <Container className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="font-display text-lg font-bold tracking-tight text-ink">
            KHUDYAKOV<span className="text-accent">.AGENCY</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            Агентство видеопроизводства полного цикла. 5 лет на рынке, 450+
            созданных видеороликов, 200+ довольных клиентов.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Навигация
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-neutral-500 hover:text-ink" href="/">
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  className="text-neutral-500 hover:text-ink"
                  href="/portfolio"
                >
                  Портфолио
                </Link>
              </li>
              <li>
                <Link
                  className="text-neutral-500 hover:text-ink"
                  href="/brief"
                >
                  Бриф
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Контакты
            </div>
            <ul className="mt-4 space-y-3 text-sm text-neutral-500">
              <li>hello@khudyakov.agency</li>
              <li>+7 (999) 000-00-00</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Соцсети
            </div>
            <ul className="mt-4 space-y-3 text-sm text-neutral-500">
              <li className="transition hover:text-ink">
                Instagram — hudyakov.agency
              </li>
              <li className="transition hover:text-ink">Telegram</li>
              <li className="transition hover:text-ink">Behance</li>
            </ul>
          </div>
        </div>
      </Container>

      <Container className="border-t border-black/5 py-6">
        <p className="text-xs text-neutral-400">
          © {year} KHUDYAKOV.AGENCY. Все права защищены.
        </p>
      </Container>
    </footer>
  );
}
