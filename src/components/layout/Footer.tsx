import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-paper/10 bg-ink text-paper">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-display text-lg uppercase text-paper">
            <span className="h-2 w-2 rounded-full bg-rec" />
            HDKV<span className="text-rec">.AGENCY</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-paper/50">
            Диджитал-агентство полного цикла: продакшн, брендинг, SMM и AI-контент. 5 лет на рынке, 450+ проектов, 200+ клиентов.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
              Навигация
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-paper/60 hover:text-rec" href="/#works">
                  Работы
                </Link>
              </li>
              <li>
                <Link className="text-paper/60 hover:text-rec" href="/#services">
                  Услуги
                </Link>
              </li>
              <li>
                <Link className="text-paper/60 hover:text-rec" href="/calculator">
                  Калькулятор
                </Link>
              </li>
              <li>
                <Link className="text-paper/60 hover:text-rec" href="/brief">
                  Заполнить бриф
                </Link>
              </li>
              <li>
                <Link className="text-paper/60 hover:text-rec" href="/#contact">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
              Контакты
            </div>
            <ul className="mt-4 space-y-3 text-sm text-paper/60">
              <li>khudyakov.yegor@gmail.com</li>
              <li>+7 (982) 275-05-29 — звонки</li>
              <li>+7 (992) 511-18-12 — Telegram / WhatsApp</li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
              Соцсети
            </div>
            <ul className="mt-4 space-y-3 text-sm text-paper/60">
              <li className="transition hover:text-rec">
                Instagram — hudyakov.agency
              </li>
              <li className="transition hover:text-rec">Telegram</li>
              <li className="transition hover:text-rec">Behance</li>
            </ul>
          </div>
        </div>
      </Container>

      <Container className="border-t border-paper/10 py-6">
        <p className="font-mono text-xs text-paper/30">
          © {year} KHUDYAKOV.AGENCY. Все права защищены.
        </p>
      </Container>
    </footer>
  );
}
