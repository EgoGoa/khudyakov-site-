#!/usr/bin/env node
// Проверка больших мониторов: окна 390…3840, горизонтальный скролл, самый
// мелкий видимый текст, нижняя пустота. Снимки — в _audit/big/.
// Запуск: BASE=http://localhost:3000 npm run audit:big [-- /content /ai]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_audit", "big");
const BASE = process.env.BASE || "http://localhost:3000";
const SIZES = [[390, 844], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [3440, 1440], [3840, 2160]];
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/content", "/ai", "/sites", "/smm"];
const WAIT = Number(process.env.WAIT || 9000);

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
let bad = 0;
for (const route of routes) {
  for (const [w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(WAIT);
    if (process.env.KEEP_WELCOME !== "1") {
      // приветственное окно перекрывает страницу — закрываем
      for (let i = 0; i < 3; i++) {
        const c = page.locator(".welcome-close").first();
        if (!(await c.isVisible().catch(() => false))) break;
        await c.click().catch(() => {});
        await page.waitForTimeout(1800);
      }
    }
    const m = await page.evaluate(() => {
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
      let minPx = 99;
      let sample = "";
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2)) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.2) continue;
        const f = parseFloat(cs.fontSize);
        if (f < minPx) { minPx = f; sample = el.textContent.trim().slice(0, 30); }
      }
      const pane = document.querySelector("[data-chapter-pane][data-active]");
      let gap = null;
      if (pane) {
        let bottom = 0;
        for (const el of pane.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width > 4 && r.height > 4 && r.bottom <= innerHeight + 2) bottom = Math.max(bottom, r.bottom);
        }
        gap = Math.round(innerHeight - bottom);
      }
      return { root, minPx, sample, hscroll: document.documentElement.scrollWidth > innerWidth + 1, gap, vh: innerHeight };
    });
    const flag = m.hscroll ? "  ⚠ ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ" : "";
    if (m.hscroll) bad++;
    console.log(`${route} ${w}×${h}: корень ${m.root.toFixed(1)}px, мин. текст ${m.minPx.toFixed(1)}px («${m.sample}»), пустота снизу ${m.gap}px${flag}`);
    await page.screenshot({ path: path.join(OUT, `${route.replace(/\//g, "_")}-${w}x${h}.jpg`), type: "jpeg", quality: 60 });
    await ctx.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
