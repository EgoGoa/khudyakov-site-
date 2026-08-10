import Link from "next/link";
import Container from "@/components/ui/Container";
import { services } from "@/lib/data";
import { EditIcon, InstagramIcon, PhoneIcon, TelegramIcon } from "@/components/ui/Icons";

const navLinks = [
  { href: "/#works", label: "Работы" },
  { href: "/#services", label: "Услуги" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/brief", label: "Заполнить бриф" },
  { href: "/#contact", label: "Контакты" },
];

const directions = services.slice(0, 6).map((s) => s.title);

const TELEGRAM_URL = "https://t.me/+79925111812";
const CALL_TEL = "tel:+79925111812";
const CALL_DISPLAY = "+7 992 511-18-12";
const EMAIL = "khudyakov.yegor@gmail.com";

const pillClass =
  "inline-flex items-center gap-2.5 rounded-full border border-paper/15 px-6 py-3 text-sm text-paper transition-all duration-300 hover:border-glow/60 hover:text-glow hover:shadow-[0_0_16px_rgba(0,210,255,0.2)]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-ink text-paper">
      {/* CTA band — mirrors the "ready to discuss your project" strip from
          the reference, but pointed at our own real channels */}
      <div className="border-b border-paper/10">
        <Container className="py-14 text-center sm:py-20">
          <h2 className="font-sans text-2xl font-light uppercase leading-tight tracking-[0.01em] text-paper sm:text-4xl">
            Готовы обсудить ваш проект
            <br className="hidden sm:block" /> в любое время
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={pillClass}>
              <TelegramIcon />
              Написать в Telegram
            </a>
            <a href={CALL_TEL} className={pillClass}>
              <PhoneIcon className="animate-pulse" />
              Заказать звонок
            </a>
            <Link href="/brief" className={pillClass}>
              <EditIcon />
              Заполнить бриф
            </Link>
          </div>
        </Container>
      </div>

      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-display text-lg uppercase text-paper">
            <span className="h-2 w-2 rounded-full bg-rec" />
            HDKV<span className="text-rec">.AGENCY</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-paper/50">
            Диджитал-агентство полного цикла: продакшн, брендинг, SMM и
            AI-контент. 5 лет на рынке, 450+ проектов, 200+ клиентов.
          </p>

          <div className="mt-8">
            <a
              href={CALL_TEL}
              className="block font-display text-2xl uppercase text-paper transition-colors hover:text-glow sm:text-3xl"
            >
              {CALL_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-2 block break-words text-sm text-paper/50 transition-colors hover:text-glow"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
            Навигация
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-paper/60 transition-colors hover:text-glow" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
            Направления
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {directions.map((title) => (
              <li key={title}>
                <Link className="text-paper/60 transition-colors hover:text-glow" href="/#services">
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="pb-10">
        <div className="flex flex-wrap gap-3">
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={pillClass}>
            <TelegramIcon />
            Telegram
          </a>
          <a
            href="https://instagram.com/hudyakov.agency"
            target="_blank"
            rel="noopener noreferrer"
            className={pillClass}
          >
            <InstagramIcon />
            Instagram*
          </a>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-paper/15 px-6 py-3 text-sm text-paper/60">
            <span className="font-serif text-base italic">Bē</span>
            Behance
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-paper/30">
          *Instagram принадлежит компании Meta Platforms Inc., деятельность
          которой признана экстремистской и запрещена на территории РФ.
        </p>
      </Container>

      <Container className="border-t border-paper/10 py-6">
        <p className="font-mono text-xs text-paper/30">
          © {year} HDKV.AGENCY. Все права защищены.
        </p>
      </Container>
    </footer>
  );
}
