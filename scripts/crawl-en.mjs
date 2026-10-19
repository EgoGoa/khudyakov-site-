#!/usr/bin/env node
// Проходит английские страницы /en/** и ищет русский текст: непереведённые
// строки из счётчика (window.__missingI18n) и любые кириллические узлы и
// атрибуты в DOM. Отчёт — _audit/en-missing.json и сводка в консоли.
//   BASE=http://localhost:3000 node scripts/crawl-en.mjs [/ai /sites/landing ...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE || "http://localhost:3000";
const PARALLEL = Number(process.env.PARALLEL || 3);
const WAIT = Number(process.env.WAIT || 2500);
const CYR = /[А-Яа-яЁё]/;

async function routes() {
  const args = process.argv.slice(2).filter((a) => a.startsWith("/"));
  if (args.length) return args;
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/");
  return [...new Set(urls)].filter((u) => !u.startsWith("/en"));
}

const list = await routes();
const browser = await chromium.launch({ channel: "chrome" });
const result = {};
let idx = 0;

async function worker() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  while (idx < list.length) {
    const route = list[idx++];
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    page.on("console", (m) => {
      if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push("hydration: " + m.text().slice(0, 200));
    });
    try {
      await page.goto(`${BASE}/en${route === "/" ? "" : route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(WAIT);
      // долистываем, чтобы появились блоки
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(h, 40000); y += 700) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(600);
      const found = await page.evaluate(() => {
        const out = new Set();
        const re = /[А-Яа-яЁё]|\d,\d{1,2}(?!\d)|\d\s?₽/;
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const t = w.currentNode.nodeValue.trim();
          if (t && re.test(t) && !/^(script|style)$/i.test(w.currentNode.parentElement?.tagName || "")) out.add("T:" + t.slice(0, 120));
        }
        for (const el of document.querySelectorAll("[aria-label],[title],[alt],[placeholder]")) {
          for (const a of ["aria-label", "title", "alt", "placeholder"]) {
            const v = el.getAttribute(a);
            if (v && re.test(v)) out.add("A:" + a + ":" + v.slice(0, 120));
          }
        }
        return { dom: [...out], missing: window.__missingI18n || [], title: document.title, lang: document.documentElement.lang };
      });
      result[route] = { ...found, errors };
      console.log(route.padEnd(36), "dom:", found.dom.length, "missing:", found.missing.length, "err:", errors.length, CYR.test(found.title) ? "TITLE-RU" : "");
    } catch (e) {
      result[route] = { fail: String(e).slice(0, 200) };
      console.log(route, "FAIL", String(e).slice(0, 100));
    }
    await page.close();
  }
}

await Promise.all(Array.from({ length: PARALLEL }, worker));
await browser.close();
fs.mkdirSync(path.join(ROOT, "_audit"), { recursive: true });
fs.writeFileSync(path.join(ROOT, `_audit/${process.env.OUT || "en-missing"}.json`), JSON.stringify(result, null, 1));
const all = new Set();
for (const r of Object.values(result)) for (const m of [...(r.dom || []), ...(r.missing || [])]) all.add(m);
console.log("\nуникальных непереведённых:", all.size);
