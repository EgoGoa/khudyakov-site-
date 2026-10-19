#!/usr/bin/env node
// Таблица для вычитки: файл, русский текст, английский текст → messages/review-table.csv
import fs from "node:fs";
const cat = JSON.parse(fs.readFileSync("messages/_catalog.json", "utf8"));
const pat = JSON.parse(fs.readFileSync("messages/_patterns.json", "utf8"));
const d = JSON.parse(fs.readFileSync("messages/en.strings.json", "utf8"));
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
const rows = ["file,ru,en"];
for (const c of [...cat, ...pat]) rows.push([q(c.file), q(c.ru), q(d[c.ru] ?? "")].join(","));
fs.writeFileSync("messages/review-table.csv", rows.join("\n") + "\n");
console.log("строк в таблице:", rows.length - 1);
