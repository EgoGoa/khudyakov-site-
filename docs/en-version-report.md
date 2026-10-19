# Английская версия: отчёт (2026-10-19)

## Что сделано
- `/en/...` рядом с русскими адресами, переключатель RU | EN в шапке (перед поиском), cookie `NEXT_LOCALE`, без автопереходов.
- Весь текст (9 046 уникальных строк + 127 шаблонов + новости/посты блога) переведён по глоссарию `messages/glossary.md`.
- Метаданные страниц, aria-label/alt/placeholder, формы и ошибки, калькулятор, кабинет, брифы, ИИ-ассистент (голос и чат), заявки (письмо приходит с пометкой «EN»).
- hreflang (ru, en, x-default → ru) и пары /en в sitemap.xml; canonical у каждой страницы свой.

## Как устроено
- Источник правды: `messages/en.strings.json` (русская фраза → английская). Упаковывается в `messages/en.packed.json` (`node scripts/pack-dict.mjs`, сам запускается в prebuild).
- Перевод при рендере: `src/i18n/jsx` (подмена jsx-runtime). В код, который режет или разбирает строку, вставлен `tr()`.
- Правка одной фразы: `node scripts/i18n-set.mjs "<ru>" "<en>"`.
- Таблица для вычитки: `messages/review-table.csv` (файл, RU, EN) — пересобирается `node scripts/en-table.mjs`.
- Проверки: `scripts/crawl-en.mjs` (русский на /en), `scripts/i18n-check.mjs` (подсветки, маркеры), `scripts/layout-en.mjs` (вёрстка на 5 ширинах), `scripts/ru-compare.mjs` (RU до/после), `npm run audit:overlaps -- /en/...`.

## Фразы, сильно сокращённые под вёрстку
В подписях сцен-инфографики (окна на /ai, /sites, /smm, /content): «Summary and contact» → «Wrap-up», «AT THE MEETING» → «IN PERSON», «REWRITTEN FOR THE LANGUAGE» → «LOCALIZED», «TEMPLATE · DOESN'T CHANGE» → «FIXED TEMPLATE», «to the manager in the morning» → «by morning», «Spam and duplicates» → «Spam, dupes», «Responsive» → «Mobile», «Management and promotion by a production team» → «Social media by a production team», «Shooting, editing and graphics for the platform» → «Shooting, editing, graphics» и др.

## Адаптации, о которых стоит знать
- География сохранена («Russian creators», «in Russia»); сноска про Instagram (Meta) — как в оригинале.
- Суммы только в ₽ (₽50K, ₽1.5M); десятичная точка; «8 лет» → «8 years».
- Имена команды латиницей (Yegor, Artyom, Kirill, Alice, Vera); названия клиентов в портфолио: марки оставлены, смысловые переведены.
- Юридические страницы (privacy, terms, bonus) переведены по смыслу — для публикации на EN их стоит показать юристу.

## Картинки с запечённым русским текстом (переделать вручную)
Портфолио клиентов — `public/images/works/*.jpg` (около 25 файлов: «Центр зрения», «Вектор», «Гипермаркет мебели», «Мединвест», «Школа сметчиков» и др.) — это работы клиентов, оставлены как есть.
Не используются на сайте, но с русским текстом: `public/images/blog/concept/01–05.jpg`, `public/images/blog/vibe-sites/01–04.jpg`, `public/video/sites-refs/s10.jpg`, `public/images/directions/pOV5EnAB05U.jpg`.
Видео-рилсы на русский текст не проверялись.

## Известные ограничения
- На английских служебных страницах React иногда (около 1 из 12 загрузок) пишет в консоль #418 (ошибка гидрации); страница при этом отрисована верно. Причина не найдена; сборка на webpack в 12 проверках ошибки не давала. Русская версия чистая.
- Словарь на клиенте английской версии ≈ +210 КБ gzip к русской.
- Голосовой ассистент на EN: английские слова-команды и ответы, голос Yandex `john` (`YANDEX_TTS_VOICE_EN`).
