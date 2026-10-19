#!/usr/bin/env node
// Сравнивает русскую версию «до» (BASE_OLD) и «после» (BASE_NEW): набор видимых
// текстов и заголовок страницы на каждом маршруте.
import { chromium } from "playwright-core";
const OLD = process.env.BASE_OLD, NEW = process.env.BASE_NEW;
const routes = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
async function grab(base, r) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  // одинаковый «случай» с обеих сторон: часть блоков выбирает карточку случайно
  await p.addInitScript(() => { let s = 12345; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; });
  await p.goto(base + r, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(2500);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(h, 30000); y += 700) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(90); }
  await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const out = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const t = w.currentNode.nodeValue.replace(/\s+/g, " ").trim(); if (t && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(w.currentNode.parentElement.tagName)) out.add(t); }
    return { title: document.title, texts: [...out], links: [...document.querySelectorAll("a[href]")].length };
  });
  await ctx.close();
  return res;
}
let diffs = 0;
for (const r of routes) {
  const merge = async (base) => { const runs = []; for (let i = 0; i < (Number(process.env.SAMPLES) || 1); i++) runs.push(await grab(base, r)); return { title: runs[0].title, texts: runs.flatMap((x) => x.texts), links: runs[0].links }; };
  const [a, c] = await Promise.all([merge(OLD), merge(NEW)]);
  const words = (arr) => new Set(arr.join(" ").split(/[\s,.;:!?«»()\[\]"]+/).filter((w) => w.length > 2));
  const A = words(a.texts), C = words(c.texts);
  const onlyOld = [...A].filter((t) => !C.has(t)), onlyNew = [...C].filter((t) => !A.has(t) && t !== "RU" && t !== "EN");
  const same = a.title === c.title && !onlyOld.length && !onlyNew.length;
  if (!same) diffs++;
  console.log(r.padEnd(26), same ? "идентично" : `РАЗНИЦА: заголовок ${a.title === c.title ? "=" : "≠"}, только «до» ${onlyOld.length}, только «после» ${onlyNew.length}`, a.links === c.links ? "" : `(ссылок ${a.links}→${c.links})`);
  if (!same) { onlyOld.slice(0, 4).forEach((t) => console.log("   до:", t.slice(0, 80))); onlyNew.slice(0, 4).forEach((t) => console.log("   после:", t.slice(0, 80))); }
}
console.log(diffs ? `\nстраниц с отличиями: ${diffs}` : "\nвсе страницы идентичны");
await b.close();
