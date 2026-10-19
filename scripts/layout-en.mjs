#!/usr/bin/env node
// Проверка вёрстки английской версии на 375/390/768/1280/1440: горизонтальная
// прокрутка страницы и обрезанный текст (элемент с overflow:hidden, у которого
// содержимое шире рамки). Для каждой пары «RU / EN» показывает, что ЕСТЬ в EN и
// НЕТ в RU — то есть то, что сломал именно английский текст.
//   BASE=http://localhost:3996 node scripts/layout-en.mjs [/ai /sites/landing ...]
import { chromium } from "playwright-core";

const BASE = process.env.BASE || "http://localhost:3996";
const WIDTHS = [375, 390, 768, 1280, 1440];
const routes = process.argv.slice(2).filter((a) => a.startsWith("/"));
const list = routes.length ? routes : ["/content", "/ai", "/sites", "/smm", "/works", "/brief/ai", "/calculator/sites", "/privacy", "/offer", "/ai/agent", "/sites/landing", "/smm/reels", "/content/presentation", "/smm/pricing", "/bonus"];
const b = await chromium.launch({ channel: "chrome" });

async function scan(url, w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, hasTouch: w < 800 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(2500);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(h, 30000); y += 600) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(90); }
  await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const out = { hscroll: document.documentElement.scrollWidth - window.innerWidth, clipped: [] };
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (!/hidden|clip/.test(cs.overflowX) && !/hidden|clip/.test(cs.textOverflow === "ellipsis" ? "hidden" : "")) continue;
      if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 20 && (el.textContent || "").trim().length > 2 && el.children.length < 6) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        out.clipped.push((el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50));
      }
    }
    out.clipped = [...new Set(out.clipped)].slice(0, 30);
    return out;
  });
  await ctx.close();
  return res;
}

let bad = 0;
for (const r of list) {
  for (const w of WIDTHS) {
    const [ru, en] = await Promise.all([scan(BASE + r + "/", w), scan(BASE + "/en" + r + "/", w)]);
    const newClip = en.clipped.filter((t) => !ru.clipped.length || true).filter((t) => !ru.clipped.includes(t));
    const hs = en.hscroll > 2 && en.hscroll > ru.hscroll + 2;
    if (hs || newClip.length) { bad++; console.log(`${r} @${w}: ${hs ? "ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА +" + en.hscroll + "px (RU " + ru.hscroll + ") " : ""}${newClip.length ? "обрезано: " + newClip.slice(0, 6).map((t) => "«" + t + "»").join(", ") : ""}`); }
  }
}
console.log(bad ? `\nпроблемных сочетаний: ${bad}` : "\nпроблем не найдено");
await b.close();
