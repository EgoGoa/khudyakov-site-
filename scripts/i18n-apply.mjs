#!/usr/bin/env node
// Применяет ответ messages/_work/answer.tsv (id<TAB>english) к текущей партии.
import fs from "node:fs";
import { pack } from "./pack-dict.mjs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dictPath = path.join(root, "messages/en.strings.json");
const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));
const batch = JSON.parse(fs.readFileSync(path.join(root, "messages/_work/batch.json"), "utf8"));
const lines = fs.readFileSync(path.join(root, "messages/_work/answer.tsv"), "utf8").split("\n").filter(Boolean);
let ok = 0, bad = [];
for (const l of lines) {
  const i = l.indexOf("\t");
  const id = Number(l.slice(0, i));
  const en = l.slice(i + 1).replace(/\r$/, "");
  if (!id || !batch[id - 1] || !en.trim()) { bad.push(l.slice(0, 40)); continue; }
  dict[batch[id - 1]] = en; ok++;
}
// Контроль сдвига и подсветок: если русская подсветка входит в предыдущую
// фразу, английская тоже обязана в неё входить.
const warn = [];
for (let i = 1; i < batch.length; i++) {
  const ru = batch[i], prev = batch[i - 1];
  if (ru.length > 8 && prev.includes(ru) && dict[ru] && dict[prev] && !dict[prev].includes(dict[ru])) warn.push(i + 1);
}
if (warn.length) console.log("ВНИМАНИЕ подсветка/сдвиг, id: " + warn.join(","));
// «id:Подпись» (конфиги брифов): код делит строку по двоеточию и показывает
// подпись отдельно, поэтому ей нужен свой ключ.
for (const [k, v] of Object.entries(dict)) {
  const m = /^[a-z0-9-]+:(.+)$/.exec(k);
  const n = /^[a-z0-9-]+:(.+)$/.exec(v);
  if (m && n && /[А-Яа-яЁё]/.test(m[1])) dict[m[1]] = n[1];
}
const missing = batch.map((r, i) => i + 1).filter((id) => !lines.some((l) => l.startsWith(id + "\t")));
fs.writeFileSync(dictPath, "{\n" + Object.entries(dict).map(([k, v]) => JSON.stringify(k) + ":" + JSON.stringify(v)).join(",\n") + "\n}\n");
console.log(`применено ${ok}, плохих ${bad.length}, пропущено ${missing.length}${missing.length ? ": " + missing.slice(0, 20).join(",") : ""}`);
pack();
