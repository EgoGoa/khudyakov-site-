#!/usr/bin/env node
// Собирает все русские строки исходников (литералы, JSX-текст, шаблонные
// строки) в messages/_catalog.json — в порядке файлов, без повторов.
// Переводы лежат в messages/_tr/*.json (карта RU → EN), merge-i18n.mjs
// склеивает их в messages/en.strings.json.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CYR = /[А-Яа-яЁё]/;
const norm = (s) => s.replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();
const ENT = { nbsp: " ", mdash: "—", ndash: "–", laquo: "«", raquo: "»", amp: "&", lt: "<", gt: ">", quot: '"', hellip: "…", times: "×", middot: "·", rarr: "→", larr: "←", apos: "'" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });

// JSX-текст по правилам JSX: строки обрезаются, пустые выбрасываются.
function jsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/);
  const out = [];
  lines.forEach((l, i) => {
    let t = l.replace(/\t/g, " ");
    if (i !== 0) t = t.replace(/^ +/, "");
    if (i !== lines.length - 1) t = t.replace(/ +$/, "");
    if (t) out.push(t);
  });
  return decode(out.join(" "));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SKIP_DIRS = new Set(["node_modules", ".next"]);
function walk(d) {
  const r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && !p.includes("src/app/(en)") && !p.includes("src/app/(ru)/admin") && !p.endsWith("src/app/api")) r.push(...walk(p));
    } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) r.push(p);
  }
  return r;
}

const seen = new Map(); // ru -> {file}
const patterns = new Map();
const files = walk(path.join(root, "src")).sort();
for (const f of files) {
  const rel = path.relative(root, f);
  // Голосовой ассистент (триггеры распознавания речи) — отдельный английский
  // набор, а не перевод: см. src/lib/voice.
  if (rel.startsWith("src/lib/voice/")) continue;
  const src = fs.readFileSync(f, "utf8");
  if (!CYR.test(src)) continue;
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const add = (map, key) => {
    if (!key || !CYR.test(key)) return;
    if (key === "е" || key.startsWith("йцукенг")) return; // раскладка клавиатуры в поиске — логика, не текст
    if (!map.has(key)) map.set(key, rel);
  };
  const visit = (n) => {
    if (ts.isImportDeclaration(n) || ts.isImportEqualsDeclaration(n)) return;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const parentIsJsxAttr = ts.isJsxAttribute(n.parent);
      add(seen, norm(parentIsJsxAttr ? decode(n.text) : n.text));
    } else if (ts.isJsxText(n)) {
      add(seen, norm(jsxText(n.getText(sf))));
    } else if (ts.isTemplateExpression(n)) {
      const parts = [n.head.text, ...n.templateSpans.map((s) => s.literal.text)];
      if (parts.some((p) => CYR.test(p))) {
        const re = "^" + parts.map((p) => esc(norm(p) === "" ? p : p)).join("(.+?)") + "$";
        add(patterns, "re:" + re.replace(/\s+/g, " "));
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// JSON-контент (новости и посты блога): все строковые значения.
for (const jf of ["content/blog/news.json", "content/blog/posts.json"]) {
  const walkJson = (x) => {
    if (typeof x === "string") {
      const k = norm(x);
      if (CYR.test(k) && !seen.has(k)) seen.set(k, jf);
    } else if (Array.isArray(x)) x.forEach(walkJson);
    else if (x && typeof x === "object") Object.values(x).forEach(walkJson);
  };
  walkJson(JSON.parse(fs.readFileSync(path.join(root, jf), "utf8")));
}

const catalog = [...seen].map(([ru, file]) => ({ file, ru }));
fs.writeFileSync(path.join(root, "messages/_catalog.json"), JSON.stringify(catalog, null, 0));
fs.writeFileSync(path.join(root, "messages/_patterns.json"), JSON.stringify([...patterns].map(([ru, file]) => ({ file, ru })), null, 0));
const words = catalog.reduce((a, c) => a + c.ru.split(" ").length, 0);
console.log(`strings: ${catalog.length}, words: ${words}, patterns: ${patterns.size}, files: ${new Set(catalog.map((c) => c.file)).size}`);
