#!/usr/bin/env node
// Проверка словаря: подсветки внутри фразы и сохранность маркеров.
import fs from "node:fs";
const cat = JSON.parse(fs.readFileSync("messages/_catalog.json", "utf8"));
const d = JSON.parse(fs.readFileSync("messages/en.strings.json", "utf8"));
let bad = 0;
const lc = (s) => s.toLowerCase();
for (let i = 1; i < cat.length; i++) {
  const ru = cat[i].ru, prev = cat[i - 1].ru;
  if (cat[i].file !== cat[i - 1].file || ru.length < 9 || !prev.includes(ru)) continue;
  if (d[ru] && d[prev] && !lc(d[prev]).includes(lc(d[ru]))) { bad++; console.log("ПОДСВЕТКА:", JSON.stringify(d[prev].slice(0, 70)), "||", JSON.stringify(d[ru])); }
}
for (const [ru, en] of Object.entries(d)) {
  if (ru.startsWith("re:")) continue;
  for (const m of ["*", "^", "**"]) {
    const a = ru.split(m).length, b = en.split(m).length;
    if (a !== b && m !== "*") { console.log("МАРКЕР", m, ru.slice(0, 50), "=>", en.slice(0, 50)); bad++; }
  }
  if (/[А-Яа-яЁё]/.test(en) && !ru.startsWith("re:")) { console.log("РУССКИЙ В EN:", en.slice(0, 60)); bad++; }
}
console.log("проблем:", bad, "· переведено:", Object.keys(d).length, "из", cat.length);
