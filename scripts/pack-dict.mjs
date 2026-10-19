#!/usr/bin/env node
// messages/en.strings.json (RU → EN, источник правды) → messages/en.packed.json:
// ключи заменены хешами (src/i18n/hash.ts), шаблоны `re:` вынесены в список.
// Запускается из prebuild и из i18n-apply/i18n-set.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function hashKey(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function pack() {
  const d = JSON.parse(fs.readFileSync(path.join(root, "messages/en.strings.json"), "utf8"));
  const h = {}, p = [];
  for (const [k, v] of Object.entries(d)) {
    if (k.startsWith("re:")) { p.push([k.slice(3), v]); continue; }
    const key = hashKey(k);
    if (key in h && h[key] !== v) throw new Error("коллизия хеша: " + k);
    h[key] = v;
  }
  fs.writeFileSync(path.join(root, "messages/en.packed.json"), JSON.stringify({ h, p }));
  return Object.keys(h).length;
}

if (process.argv[1] === new URL(import.meta.url).pathname) console.log("упаковано ключей:", pack());
