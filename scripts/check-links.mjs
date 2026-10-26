// npm run check:links — verifica que cada enlace externo del contenido responda (R-13). Se ejecuta en CI y cada semana.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const urls = new Map();
const add = (u, where) => {
  if (!/^https?:\/\//.test(u) || u.includes("{{")) return;
  urls.set(u, [...(urls.get(u) ?? []), where]);
};
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

for (const f of walk(path.join(root, "content")).filter((f) => f.endsWith(".json") && !f.includes("geo"))) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  const visit = (v) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (v && typeof v === "object") {
      if (v.kind === "drive" && v.fileId) add(`https://drive.google.com/file/d/${v.fileId}/preview`, path.basename(f));
      return Object.values(v).forEach(visit);
    }
    if (typeof v === "string") add(v, path.basename(f));
  };
  visit(data);
}
// youtubeId
for (const f of fs.readdirSync(path.join(root, "content/videos"))) {
  const v = JSON.parse(fs.readFileSync(path.join(root, "content/videos", f), "utf8"));
  if (v.youtubeId) add(`https://www.youtube.com/watch?v=${v.youtubeId}`, f);
}

let failed = 0;
for (const [url, where] of urls) {
  try {
    const ctrl = AbortSignal.timeout(20000);
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl, headers: { "user-agent": "Mozilla/5.0 PACTO-MI link check" } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 PACTO-MI link check" } });
    const ok = r.ok;
    // Algunos medios bloquean a los robots con 403: se avisa pero no se falla.
    const soft = r.status === 403;
    console.log(`${ok ? "✓" : soft ? "?" : "✗"} ${r.status} ${url}  (${where.join(", ")})`);
    if (!ok && !soft) failed++;
  } catch (e) {
    console.log(`✗ ERR ${url}  (${where.join(", ")}) ${e.message}`);
    failed++;
  }
}
if (failed) {
  console.error(`\n${failed} enlace(s) con problemas`);
  process.exit(1);
}
console.log(`\n${urls.size} enlaces verificados`);
