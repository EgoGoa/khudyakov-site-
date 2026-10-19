#!/usr/bin/env node
// Выдаёт следующую партию непереведённых строк: node scripts/i18n-batch.mjs [N] [--patterns]
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dictPath = path.join(root, "messages/en.strings.json");
const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));
const pat = process.argv.includes("--patterns");
const n = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 200);
const cat = JSON.parse(fs.readFileSync(path.join(root, pat ? "messages/_patterns.json" : "messages/_catalog.json"), "utf8"));
const todo = cat.filter((c) => dict[c.ru] === undefined);
const batch = todo.slice(0, n);
fs.writeFileSync(path.join(root, "messages/_work/batch.json"), JSON.stringify(batch.map((b) => b.ru)));
let cur = "";
batch.forEach((b, i) => {
  if (b.file !== cur) { cur = b.file; console.log(`## ${cur}`); }
  console.log(`${i + 1}\t${b.ru}`);
});
console.log(`-- осталось после этой партии: ${todo.length - batch.length} из ${cat.length}`);
