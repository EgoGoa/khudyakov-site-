// Главный адрес сайта для поисковиков — hud-service.ru (с 2026-09-29, раньше hdkv-ai.ru) (статичная версия на
// reg.ru, открывается в России без VPN). Из него строятся canonical,
// sitemap.xml, robots.txt и OpenGraph-ссылки. khudyakov-site.vercel.app —
// технический адрес: там страницы закрыты от индекса (см. next.config.mjs),
// а canonical ведёт сюда, чтобы поисковик не считал два домена дублями.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hud-service.ru";

export const BRAND = "HUD.SERVICE";
