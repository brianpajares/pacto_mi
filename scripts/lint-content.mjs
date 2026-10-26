// pnpm/npm run lint:content — falla el build si el contenido incumple las reglas de marca y de privacidad (R-00a, R-00c, R-108, R-110).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const walk = (dir, exts, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "geo", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
};
const rel = (p) => path.relative(root, p).replaceAll("\\", "/");

// 1) Reglas de redacción y de confidencialidad sobre /content y /messages
const rules = [
  { name: "«norteamericano»", re: /norteamerican[oa]s?/i },
  { name: "«americano» referido al país", re: /(?<![a-záéíóú])american[oa]s?(?![a-záéíóú])/i },
  { name: "«Estados Unidos» sin «los» delante", re: /(?<!los )(?<!Los )Estados Unidos/ },
  { name: "«EE. UU.» / «EEUU»", re: /EE\.?\s?UU\.?/ },
  { name: "monto del fondo (R-00a)", re: /19[,.\s]?525|US\$\s?19\b|\$\s?19[,.]\d{3}/ },
  { name: "número de award (no se publica)", re: /SPE\d{5}IN\d{4}/ },
  { name: "teléfono personal (R-00c)", re: /\+51\s?9\d{2}[\s-]?\d{3}[\s-]?\d{3}/ },
];
const files = [...walk(path.join(root, "content"), [".json", ".mdx"]), ...walk(path.join(root, "messages"), [".json"])];
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  for (const r of rules) {
    const m = text.match(r.re);
    if (m) errors.push(`${rel(f)}: ${r.name} → «${m[0]}»`);
  }
}

// 2) Paridad de claves ES/EN (R-110)
const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o)) (v && typeof v === "object" ? flat(v, `${p}${k}.`, out) : (out[`${p}${k}`] = v));
  return out;
};
const es = flat(JSON.parse(fs.readFileSync(path.join(root, "messages/es.json"), "utf8")));
const en = flat(JSON.parse(fs.readFileSync(path.join(root, "messages/en.json"), "utf8")));
for (const k of Object.keys(es)) if (!(k in en)) errors.push(`messages/en.json: falta la clave «${k}»`);
for (const k of Object.keys(en)) if (!(k in es)) errors.push(`messages/es.json: falta la clave «${k}»`);

// 3) Toda clave usada en el código existe (las claves dinámicas con ${} se comprueban por prefijo)
const code = [...walk(path.join(root, "app"), [".tsx", ".ts"]), ...walk(path.join(root, "components"), [".tsx"])];
const keys = new Set(Object.keys(es));
for (const f of code) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/\bt\(\s*"([A-Za-z0-9_.-]+)"/g)) {
    if (!keys.has(m[1])) errors.push(`${rel(f)}: clave de traducción inexistente «${m[1]}»`);
  }
  for (const m of text.matchAll(/\bt\(\s*`([A-Za-z0-9_.-]*)\$\{/g)) {
    if (![...keys].some((k) => k.startsWith(m[1]))) errors.push(`${rel(f)}: ninguna clave empieza por «${m[1]}»`);
  }
}

// 4) Logos de la Embajada: nunca con filtros ni opacidad (R-103)
for (const f of code) {
  const text = fs.readFileSync(f, "utf8");
  if (/sello-embajada|logo-uspa/.test(text) && /(opacity|filter|grayscale|mix-blend)/.test(text.match(/<img[\s\S]*?\/>/g)?.filter((x) => /sello-embajada|logo-uspa/.test(x)).join("") ?? "")) {
    errors.push(`${rel(f)}: los logos oficiales no admiten opacity ni filtros`);
  }
}

if (errors.length) {
  console.error(`\nlint:content — ${errors.length} problema(s):\n` + errors.map((e) => `  ✗ ${e}`).join("\n") + "\n");
  process.exit(1);
}
console.log(`lint:content — OK (${files.length} archivos de contenido, ${Object.keys(es).length} claves ES/EN)`);
