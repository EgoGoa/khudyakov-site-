#!/usr/bin/env node
// Разовый кодмод для больших мониторов: размеры в px → calc(N * var(--s)).
// --s = 1px до 1919px и растёт с корневым размером дальше (см. globals.css),
// так что до 1920 вёрстка пиксель в пиксель прежняя. Границы (≤1px), тени,
// @media и составные значения с функциями не трогаем.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NUM = String.raw`-?\d*\.?\d+`;
const PX = new RegExp(`(?<![\\w.])(${NUM})px\\b`, "g");

const TW_PREFIX = "max-w|min-w|max-h|min-h|text|w|h|size|p[xytblrse]?|m[xytblrse]?|gap|gap-x|gap-y|space-x|space-y|top|left|right|bottom|inset|inset-x|inset-y|start|end|rounded|rounded-[a-z]{1,2}|leading|basis|translate-x|translate-y|indent";
const TW = new RegExp(`(?<![A-Za-z0-9_])(${TW_PREFIX})-\\[([^\\[\\]\\s]+)\\]`, "g");

const CSS_PROPS = "font-size|line-height|letter-spacing|padding(?:-(?:top|right|bottom|left|inline|block)[a-z-]*)?|margin(?:-(?:top|right|bottom|left|inline|block)[a-z-]*)?|gap|row-gap|column-gap|width|height|min-width|min-height|max-width|max-height|top|right|bottom|left|inset|flex-basis|border(?:-(?:top|bottom)-(?:left|right))?-radius";
const CSS_DECL = new RegExp(`^(\\s*(?:${CSS_PROPS})\\s*:\\s*)([^;{}]*?)(\\s*!important)?(\\s*;.*)$`);

let changed = 0;
const sc = (n) => `calc(${n}*var(--s))`;

function twFile(src) {
  return src.replace(TW, (m, pre, val) => {
    if (/(calc|clamp|min|max|env|var)\(/.test(val)) return m;
    if (!PX.test(val)) { PX.lastIndex = 0; return m; }
    PX.lastIndex = 0;
    const out = val.replace(PX, (mm, n) => (Math.abs(parseFloat(n)) <= 1 ? mm : sc(n)));
    if (out !== val) changed++;
    return `${pre}-[${out}]`;
  });
}

function cssFile(src) {
  // Декларации ищем и в многострочных, и в однострочных правилах
  // (`.x { width: 60px; height: 2px }`). @-правила и комментарии пропускаем.
  const decl = new RegExp(`(?<![\\w(-])((?:${CSS_PROPS})\\s*:\\s*)([^;{}]*)`, "g");
  return src
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (t.startsWith("@") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("--")) return line;
      return line.replace(decl, (m, head, val) => {
        const out = val.replace(PX, (mm, n) => (Math.abs(parseFloat(n)) <= 1 ? mm : `calc(${n} * var(--s))`));
        if (out !== val) changed++;
        return head + out;
      });
    })
    .join("\n");
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

for (const f of walk(path.join(ROOT, "src"))) {
  const src = fs.readFileSync(f, "utf8");
  const out = f.endsWith(".css") ? cssFile(src) : twFile(src);
  if (out !== src) fs.writeFileSync(f, out);
}
console.log("changed:", changed);
