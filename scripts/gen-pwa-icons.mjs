// Рисует иконки приложения (PWA) и манифесты к ним: public/pwa/*.
// Запуск (один раз, результат лежит в репозитории):
//   PWA_DEPS=<папка, где стоит opentype.js> PWA_FONT=<Unbounded-800.woff> node scripts/gen-pwa-icons.mjs
// Буквы переводятся в контуры, чтобы иконки не зависели от шрифтов системы.
// Иконки квадратные, на весь холст: скругление делает сама система (iOS,
// Android), а значок держится в центральных ~60% — «безопасной зоне».
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const req = createRequire(process.env.PWA_DEPS + "/");
const opentype = req("opentype.js");
const buf = readFileSync(process.env.PWA_FONT);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));

const R = "#F5310B", O = "#FF6A3D", C = "#00D2FF", P = "#EC4899", INK = "#0B0B10";
const GRAD = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R}"/><stop offset=".6" stop-color="${P}"/><stop offset="1" stop-color="${C}"/></linearGradient>`;

// Слово в контурах: по центру (cx, cy), заданной ширины.
function word(text, cx, cy, width, fill) {
  const probe = font.getPath(text, 0, 0, 100);
  const b = probe.getBoundingBox();
  const k = width / (b.x2 - b.x1);
  const size = 100 * k;
  const p = font.getPath(text, 0, 0, size);
  const bb = p.getBoundingBox();
  const dx = cx - (bb.x1 + bb.x2) / 2;
  const dy = cy - (bb.y1 + bb.y2) / 2;
  return `<path transform="translate(${dx} ${dy})" d="${p.toPathData(2)}" fill="${fill}"/>`;
}

const arc = (r, a0, a1) => {
  const pt = (a) => [256 + r * Math.cos((a * Math.PI) / 180), 256 + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

const bg = (fill) => `<rect width="512" height="512" fill="${fill}"/>`;

// id → { label, svg-тело }
const VARIANTS = {
  hud: { label: "HUD на градиенте", body: `<rect width="512" height="512" fill="url(#g)"/>${word("HUD", 256, 256, 300, "#fff")}` },
  aim: {
    label: "Прицел HUD",
    body: `${bg(INK)}
      <g fill="none" stroke-width="22" stroke-linecap="square">
        <path d="M120 190V120H190M322 120H392V190" stroke="${C}"/>
        <path d="M120 322V392H190M322 392H392V322" stroke="${R}"/>
      </g>${word("HUD", 256, 256, 168, "#fff")}`,
  },
  four: {
    label: "Четыре направления",
    body: `${bg(INK)}<g fill="none" stroke-width="64" stroke-linecap="butt">
      <path d="${arc(124, -90, -3)}" stroke="${R}"/><path d="${arc(124, 0, 87)}" stroke="${P}"/>
      <path d="${arc(124, 90, 177)}" stroke="${C}"/><path d="${arc(124, 180, 267)}" stroke="${O}"/></g>
      ${word("H", 256, 256, 92, "#fff")}`,
  },
  brush: {
    label: "Мазок",
    body: `${bg(INK)}<path d="${arc(118, -50, 250)}" fill="none" stroke="${R}" stroke-width="64" stroke-linecap="round"/><circle cx="352" cy="170" r="26" fill="${C}"/>`,
  },
  window: {
    label: "Окно",
    body: `${bg(INK)}<rect x="104" y="136" width="304" height="240" rx="38" fill="#1A1A22" stroke="#2c2c38" stroke-width="6"/>
      <path d="M104 174a38 38 0 0 1 38-38h228a38 38 0 0 1 38 38v18H104z" fill="#24242e"/>
      <circle cx="146" cy="166" r="9" fill="${R}"/><circle cx="176" cy="166" r="9" fill="${O}"/><circle cx="206" cy="166" r="9" fill="${C}"/>
      ${word("H", 256, 288, 92, "#fff")}`,
  },
  drop: {
    label: "Капля",
    body: `${bg(INK)}<g transform="rotate(-45 256 256)"><path d="M146 256a110 110 0 1 1 110 110H168a22 22 0 0 1-22-22z" fill="url(#g)"/></g>`,
  },
  column: {
    label: "Столбик",
    body: `${bg(INK)}${word("H", 256, 150, 96, "#fff")}${word("U", 256, 256, 96, O)}${word("D", 256, 362, 96, "#fff")}`,
  },
  paper: {
    label: "Бумага",
    body: `${bg("#DCDDEF")}${word("H", 250, 236, 150, INK)}<circle cx="352" cy="332" r="26" fill="${R}"/>`,
  },
};

const svgOf = (body, size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512"><defs>${GRAD}</defs>${body}</svg>`);

mkdirSync("public/pwa", { recursive: true });

const manifest = (id) => ({
  id: "/",
  name: "HUD.SERVICE — креативный сервис",
  short_name: "HUD",
  description: "Креативный сервис: видео, фото, брендинг, SMM и AI-контент.",
  lang: "ru",
  start_url: "/?source=pwa",
  scope: "/",
  display: "standalone",
  orientation: "any",
  background_color: INK,
  theme_color: INK,
  categories: ["business", "design"],
  icons: [
    { src: `/pwa/${id}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: `/pwa/${id}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: `/pwa/${id}-192.png`, sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: `/pwa/${id}-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  shortcuts: [
    { name: "Обсудить проект", url: "/?pwa=lead", icons: [{ src: `/pwa/${id}-192.png`, sizes: "192x192", type: "image/png" }] },
    { name: "Личный кабинет", url: "/?pwa=cabinet", icons: [{ src: `/pwa/${id}-192.png`, sizes: "192x192", type: "image/png" }] },
    { name: "Бриф голосом", url: "/?pwa=brief", icons: [{ src: `/pwa/${id}-192.png`, sizes: "192x192", type: "image/png" }] },
  ],
});

for (const [id, v] of Object.entries(VARIANTS)) {
  for (const s of [512, 192, 180]) {
    await sharp(svgOf(v.body, s)).png().toFile(`public/pwa/${id}-${s}.png`);
  }
  writeFileSync(`public/pwa/manifest-${id}.webmanifest`, JSON.stringify(manifest(id), null, 2) + "\n");
}

// Значок вкладки: слово в 16px не читается — только буква H на том же
// градиенте, с мягким скруглением (вкладки показывают иконку как есть).
const fav = `<rect width="512" height="512" rx="112" fill="url(#g)"/>${word("H", 256, 256, 250, "#fff")}`;
await sharp(svgOf(fav, 64)).png().toFile("src/app/icon.png");
await sharp(svgOf(VARIANTS.hud.body, 180)).png().toFile("src/app/apple-icon.png");

writeFileSync("public/pwa/variants.json", JSON.stringify(Object.entries(VARIANTS).map(([id, v]) => ({ id, label: v.label })), null, 2) + "\n");
console.log("ok", Object.keys(VARIANTS).join(" "));
