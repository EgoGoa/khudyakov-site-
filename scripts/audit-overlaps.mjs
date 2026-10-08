#!/usr/bin/env node
// Проверка наложений в окнах-сценах на телефоне (Егор, 2026-10-08).
//
// Проходит страницы сайта в размере iPhone (390px), долистывает до каждого
// окна со сценой (графика-SVG с подписями), ждёт, пока сцена соберётся, и
// ищет:
//   • текст на тексте — две подписи лежат друг на друге;
//   • текст шире своей рамки — подпись вылезает из карточки/плашки;
//   • текст за краем сцены.
// Каждую сцену снимает в _audit/ (папка в .gitignore) и пишет отчёт
// _audit/report.md. Код выхода 1, если что-то найдено, — удобно перед
// деплоем.
//
// Запуск:
//   npm run build            (если сборки ещё нет)
//   npm run audit:overlaps   (все страницы направлений)
//   npm run audit:overlaps -- /content/presentation /ai/agent   (выборочно)
//   BASE=http://localhost:3000 npm run audit:overlaps   (уже запущенный сайт)
//
// Браузер: на Маке — установленный Google Chrome; иначе CHROME_PATH=путь.
// Чего скрипт НЕ ловит: текст поверх рисунка (столбики, круги) и плавающие
// кнопки поверх страницы — это всё равно смотреть глазами по снимкам.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_audit");
const PORT = 3999;
const WAIT = Number(process.env.WAIT || 9000); // сцена собирается ~7–8 с
const PARALLEL = Number(process.env.PARALLEL || 4);

function browserOptions() {
  if (process.env.CHROME_PATH) return { executablePath: process.env.CHROME_PATH };
  // Облачная среда Claude Code: Chromium лежит здесь.
  const pw = "/opt/pw-browsers";
  if (fs.existsSync(pw)) {
    const dir = fs.readdirSync(pw).find((d) => /^chromium-\d+$/.test(d));
    const exe = dir && path.join(pw, dir, "chrome-linux", "chrome");
    if (exe && fs.existsSync(exe)) return { executablePath: exe };
  }
  return { channel: "chrome" };
}

function defaultRoutes() {
  const manifest = path.join(ROOT, ".next", "prerender-manifest.json");
  if (!fs.existsSync(manifest)) return null;
  const routes = Object.keys(JSON.parse(fs.readFileSync(manifest, "utf8")).routes);
  return routes.filter((r) => /^\/(content|ai|sites|smm)\/[^/]+$/.test(r)).sort();
}

async function startServer() {
  if (!fs.existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    console.error("Нет сборки: сначала npm run build (или задайте BASE=адрес запущенного сайта).");
    process.exit(2);
  }
  const child = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, stdio: "ignore" });
  const base = `http://localhost:${PORT}`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return { base, child };
    } catch {
      /* ещё поднимается */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error("Сайт не запустился за 30 с");
}

// Выполняется в странице: проверка одного окна, помеченного data-audit-panel.
function checkPanel() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.15) return null;
    }
    return r;
  };
  const inter = (a, b) => {
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  };
  const panel = document.querySelector("[data-audit-panel]");
  const issues = [];
  for (const svg of panel.querySelectorAll("svg")) {
    if (svg.querySelectorAll("text").length < 3) continue;
    // Повёрнутые и перспективные группы дают раздутые рамки — их не судим.
    const skewed = (t) => {
      for (let e = t; e && e !== svg; e = e.parentNode) {
        const m = getComputedStyle(e).transform;
        if (m && m !== "none") {
          const v = m.match(/-?[\d.e]+/g).map(Number);
          if (m.startsWith("matrix3d") || Math.abs(v[1]) > 0.02) return true;
        }
        const a = e.getAttribute && e.getAttribute("transform");
        if (a && /rotate|skew|matrix/.test(a)) return true;
      }
      return false;
    };
    // Рамка текста ужата до «тела» букв: соседние строки абзаца иначе всегда
    // задевают друг друга выносными элементами.
    const core = (r) => ({ left: r.left, right: r.right, top: r.top + r.height * 0.28, bottom: r.bottom - r.height * 0.28, width: r.width, height: r.height * 0.44 });
    const texts = [...svg.querySelectorAll("text")]
      .map((t) => ({ t, r: vis(t), s: t.textContent.trim() }))
      .filter((x) => x.r && x.s && !skewed(x.t))
      .map((x) => ({ ...x, c: core(x.r) }));
    for (let i = 0; i < texts.length; i++)
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i];
        const b = texts[j];
        const min = Math.min(a.c.width * a.c.height, b.c.width * b.c.height);
        if (inter(a.c, b.c) > 0.15 * min) issues.push(`текст на тексте: «${a.s}» × «${b.s}»`);
      }
    const cards = [...svg.querySelectorAll("rect")]
      .filter((r) => Number(r.getAttribute("rx") || 0) >= 2)
      .map((el) => ({ el, r: vis(el) }))
      .filter((c) => c.r && c.r.width > 30 && c.r.height > 12);
    for (const x of texts) {
      const sx = x.r.left + 2;
      const owners = cards.filter((c) => sx >= c.r.left && sx <= c.r.right && x.r.top >= c.r.top - 1 && x.r.bottom <= c.r.bottom + 1);
      if (!owners.length) continue;
      const own = owners.reduce((m, c) => (c.r.width * c.r.height < m.r.width * m.r.height ? c : m));
      const anchor = x.t.getAttribute("text-anchor");
      const out = anchor === "middle" || anchor === "end" ? x.r.left < own.r.left - 1.5 || x.r.right > own.r.right + 1.5 : x.r.right > own.r.right + 1.5;
      if (out) issues.push(`текст шире рамки: «${x.s}»`);
    }
    const sr = svg.getBoundingClientRect();
    for (const x of texts) if (x.r.right > sr.right + 2 || x.r.left < sr.left - 2) issues.push(`текст за краем сцены: «${x.s}»`);
  }
  return [...new Set(issues)];
}

async function auditRoute(ctx, base, route) {
  const page = await ctx.newPage();
  const found = [];
  try {
    await page.goto(base + route, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);
    // Стартовое окно закрывается по Escape.
    for (let k = 0; k < 3; k++) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
    }
    const n = await page.evaluate(() => {
      const boxes = document.querySelectorAll('[class*="aspect-[400/380]"], [class*="aspect-[340/210]"]');
      const panels = [...new Set([...boxes].map((b) => b.closest(".glass-panel")).filter(Boolean))];
      panels.forEach((p, i) => p.setAttribute("data-audit-i", String(i)));
      return panels.length;
    });
    for (let i = 0; i < n; i++) {
      const el = await page.$(`[data-audit-i="${i}"]`);
      await el.evaluate((e) => {
        document.querySelectorAll("[data-audit-panel]").forEach((x) => x.removeAttribute("data-audit-panel"));
        e.setAttribute("data-audit-panel", "");
        window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 70, behavior: "instant" });
      });
      await page.waitForTimeout(WAIT);
      const issues = await page.evaluate(checkPanel);
      const shot = `${route.slice(1).replace(/\//g, "_")}-${i}.png`;
      const box = await el.$('[class*="aspect-[400/380]"], [class*="aspect-[340/210]"]');
      await (box ?? el).screenshot({ path: path.join(OUT, shot) }).catch(() => {});
      found.push({ route, i, shot, issues });
      console.log(`${route} · окно ${i}: ${issues.length ? issues.join("; ") : "ok"}`);
    }
    if (!n) console.log(`${route}: окон нет`);
  } catch (e) {
    found.push({ route, i: -1, shot: "", issues: [`ошибка проверки: ${String(e.message).split("\n")[0]}`] });
    console.log(`${route}: ошибка — ${String(e.message).split("\n")[0]}`);
  }
  await page.close();
  return found;
}

const argRoutes = process.argv.slice(2).filter((a) => a.startsWith("/"));
let server = null;
let base = process.env.BASE;
if (!base) {
  server = await startServer();
  base = server.base;
}
const routes = argRoutes.length ? argRoutes : defaultRoutes();
if (!routes || !routes.length) {
  console.error("Не нашёл страниц для проверки: передайте пути аргументами (/content/presentation …).");
  server?.child.kill();
  process.exit(2);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(browserOptions());
const ctx = await browser.newContext({ ...devices["iPhone 13"], deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  try {
    // Без стартового окна, тура голоса и приглашений — сразу сайт.
    localStorage.setItem("hdkv_welcome_snoozed_until", String(Date.now() + 864e5));
    for (const k of ["hdkv_voice_tour_seen", "hdkv_pwa_capsule_done", "hdkv_voice_invite_dismissed"]) localStorage.setItem(k, "1");
  } catch {
    /* без хранилища — просто дольше закрывать окна */
  }
});

const results = [];
const queue = [...routes];
await Promise.all(
  Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
    while (queue.length) results.push(...(await auditRoute(ctx, base, queue.shift())));
  }),
);
await browser.close();
server?.child.kill();

results.sort((a, b) => a.route.localeCompare(b.route) || a.i - b.i);
const bad = results.filter((r) => r.issues.length);
const lines = [
  `# Наложения в окнах — ${new Date().toLocaleString("ru-RU")}`,
  "",
  `Страниц: ${routes.length}, окон: ${results.filter((r) => r.i >= 0).length}, с проблемами: ${bad.length}.`,
  "",
  ...(bad.length
    ? bad.flatMap((r) => [`## ${r.route} · окно ${r.i}${r.shot ? ` (${r.shot})` : ""}`, ...r.issues.map((s) => `- ${s}`), ""])
    : ["Наложений не найдено."]),
];
fs.writeFileSync(path.join(OUT, "report.md"), lines.join("\n"));
console.log(`\nОтчёт: _audit/report.md · снимки сцен: _audit/*.png`);
console.log(bad.length ? `Найдено окон с наложениями: ${bad.length}` : "Наложений не найдено.");
process.exit(bad.length ? 1 : 0);
