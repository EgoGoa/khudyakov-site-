#!/usr/bin/env node
// Точечная правка словаря: node scripts/i18n-set.mjs "<ru>" "<en>"
import fs from "node:fs";
import { pack } from "./pack-dict.mjs";
const p = "messages/en.strings.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));
const [ru, en] = process.argv.slice(2);
if (!(ru in d)) console.log("новый ключ");
d[ru] = en;
fs.writeFileSync(p, "{\n" + Object.entries(d).map(([k, v]) => JSON.stringify(k) + ":" + JSON.stringify(v)).join(",\n") + "\n}\n");
pack();
