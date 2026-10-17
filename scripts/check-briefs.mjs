// Защита брифов от повторной поломки (подключено в prebuild).
// 1) у каждой страницы услуги есть бриф в serviceBriefMap;
// 2) каждый briefId из карты существует в конфигах, конфиги целы;
// 3) ссылки «Бриф» в файлах раздела ведут на бриф своей категории,
//    а голого /brief в страницах услуг нет.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "src");
const errors = [];
const fail = (m) => errors.push(m);
const read = (p) => fs.readFileSync(p, "utf8");

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

// ── registry ────────────────────────────────────────────────────────────
const registry = read(path.join(src, "features/brief/registry.ts"));
const mapBlock = registry.match(/serviceBriefMap[^=]*=\s*\{([\s\S]*?)\n\};/);
if (!mapBlock) fail("registry.ts: не найден serviceBriefMap");
const map = {};
for (const m of (mapBlock?.[1] ?? "").matchAll(/"(\/[^"]*)":\s*"(\w+)"/g)) map[m[1]] = m[2];

const BRIEF_IDS = ["content", "sites", "smm", "ai"];
for (const [route, id] of Object.entries(map)) {
  if (!BRIEF_IDS.includes(id)) fail(`serviceBriefMap: «${route}» → «${id}» — такого брифа нет`);
  if (!fs.existsSync(path.join(src, `features/brief/configs/${id}.ts`))) fail(`configs/${id}.ts не найден`);
}

// ── страницы услуг ──────────────────────────────────────────────────────
const SECTIONS = ["content", "sites", "smm", "ai"];
const routes = [];
for (const p of walk(path.join(src, "app"))) {
  if (!/page\.tsx$/.test(p)) continue;
  const rel = path.relative(path.join(src, "app"), p).split(path.sep).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s));
  if (rel.length && SECTIONS.includes(rel[0])) routes.push("/" + rel.join("/"));
}
const resolve = (route) => {
  const clean = route.replace(/\[[^\]]+\]/g, "x");
  let best = null;
  for (const k of Object.keys(map)) if ((clean === k || clean.startsWith(k + "/")) && (!best || k.length > best.length)) best = k;
  return best ? map[best] : null;
};
for (const r of routes) {
  const id = resolve(r);
  if (!id) fail(`Страница услуги «${r}» без записи в serviceBriefMap (src/features/brief/registry.ts)`);
  else if (id !== r.split("/")[1]) fail(`Страница «${r}» привязана к брифу «${id}» — категория не совпадает`);
}
for (const s of SECTIONS) if (!map[`/${s}`]) fail(`В serviceBriefMap нет раздела «/${s}»`);

// ── конфиги ─────────────────────────────────────────────────────────────
for (const id of [...BRIEF_IDS, "general"]) {
  const f = path.join(src, `features/brief/configs/${id}.ts`);
  if (!fs.existsSync(f)) { fail(`Нет конфига ${id}.ts`); continue; }
  const text = read(f);
  const stepsAt = text.indexOf("steps:");
  const body = text.slice(stepsAt);
  // шаг начинается с `{ id: "…", type: "…"`; тело шага — до следующего начала
  const starts = [...body.matchAll(/\{\s*id:\s*"([^"]+)",\s*type:\s*"(\w+)"/g)];
  const ids = [];
  const types = [];
  starts.forEach((m, i) => {
    const c = body.slice(m.index, starts[i + 1]?.index ?? body.length);
    const sid = m[1], type = m[2];
    if (ids.includes(sid)) fail(`${id}: повторяется id шага «${sid}»`);
    ids.push(sid); types.push(type);
    if (["single", "multi", "budget", "deadline"].includes(type) && !/options:/.test(c)) fail(`${id}/${sid}: у типа ${type} нет options`);
    const sh = c.match(/showIf:\s*\{\s*stepId:\s*"([^"]+)"/);
    if (sh && !ids.includes(sh[1])) fail(`${id}/${sid}: showIf ссылается на «${sh[1]}», которого нет выше`);
  });
  // однострочные showIf-константы (ai.ts)
  for (const m of text.matchAll(/stepId:\s*"([^"]+)"/g)) if (!ids.includes(m[1])) fail(`${id}: showIf на несуществующий шаг «${m[1]}»`);
  if (!ids.length) fail(`${id}: шаги не найдены`);
  else if (types[types.length - 1] !== "contact") fail(`${id}: последний шаг должен быть contact`);
}

// ── ссылки на брифы в файлах раздела ────────────────────────────────────
const SCOPES = [
  ["src/components/home/sites", "sites"],
  ["src/components/home/smm", "smm"],
  ["src/components/home/ai", "ai"],
  ["src/app/smm", "smm"],
  ["src/app/(landing)/sites", "sites"],
  ["src/app/(landing)/smm", "smm"],
  ["src/app/(landing)/ai", "ai"],
  ["src/app/(landing)/content", "content"],
  ["src/components/home/direction/content", null],
];
for (const [dir, cat] of SCOPES) {
  for (const f of walk(path.join(root, dir))) {
    if (!/\.tsx?$/.test(f)) continue;
    const rel = path.relative(root, f);
    const t = read(f);
    for (const m of t.matchAll(/["'`](\/calculator(?:\/([a-z-]+))?)\/?["'`]/g)) {
      const target = m[2];
      if (!target) fail(`${rel}: голая ссылка «/calculator» — на странице услуги нужен «/calculator/<категория>»`);
      else if (cat && target !== cat) fail(`${rel}: ссылка «${m[1]}» ведёт на калькулятор «${target}», а раздел — «${cat}»`);
    }
    for (const m of t.matchAll(/["'`](\/brief(?:\/([a-z-]+))?)\/?["'`]/g)) {
      const target = m[2];
      if (!target) fail(`${rel}: голая ссылка «/brief» — на странице услуги нужен «/brief/<категория>» или briefHrefForRoute()`);
      else if (cat && target !== cat && target !== "general") fail(`${rel}: ссылка «${m[1]}» ведёт на бриф «${target}», а раздел — «${cat}»`);
    }
  }
}

if (errors.length) {
  console.error("\n✖ check:briefs — привязка брифов сломана:\n");
  for (const e of errors) console.error("  • " + e);
  console.error(`\nИсправьте registry.ts / конфиги / ссылки. Всего ошибок: ${errors.length}\n`);
  process.exit(1);
}
console.log(`✔ check:briefs — страниц услуг: ${routes.length}, брифов в карте: ${Object.keys(map).length}`);
