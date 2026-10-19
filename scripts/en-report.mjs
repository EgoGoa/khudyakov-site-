#!/usr/bin/env node
// Сводка по _audit/en-missing.json: какие русские строки ещё видны на /en и
// на каких страницах; для обрывков — в какую фразу словаря они входят.
import fs from "node:fs";
const r = JSON.parse(fs.readFileSync(`_audit/${process.argv[2] || "en-missing"}.json`, "utf8"));
const cat = JSON.parse(fs.readFileSync("messages/_catalog.json", "utf8"));
const seen = new Map();
for (const [route, v] of Object.entries(r)) {
  for (const m of [...(v.dom || []), ...(v.missing || [])]) {
    const k = m.replace(/^T:/, "").replace(/^A:[a-z-]+:/, "");
    const e = seen.get(k) || { n: 0, pages: new Set(), kind: m.startsWith("A:") ? "attr" : m.startsWith("T:") ? "dom" : "log" };
    e.n++; e.pages.add(route); seen.set(k, e);
  }
}
const rows = [...seen].sort((a, b) => b[1].pages.size - a[1].pages.size);
for (const [k, e] of rows) {
  const frag = cat.find((c) => c.ru !== k && c.ru.includes(k) && k.length > 3);
  console.log(`${e.pages.size}p ${e.kind.padEnd(4)} ${JSON.stringify(k.slice(0, 90))}${frag ? "  ⊂ " + frag.file.replace("src/components/", "") : ""}`);
}
console.log("всего уникальных:", rows.length);
