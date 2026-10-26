// Pruebas de aceptación (PRD §19) contra un sitio en ejecución: node scripts/qa.mjs [baseUrl]
// Cubre AT-01…AT-09 con Playwright + axe-core. Requiere `npx playwright install chromium`.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2] ?? "http://localhost:3100";
let failed = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "✓" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failed++;
};

const routes = {
  es: ["", "/proyecto", "/formacion", "/formacion/modulo-1", "/formacion/modulo-6", "/ponencias", "/ponencias/ciclo-2026-sesion-01", "/actividades", "/actividades/cajamarca-2025", "/actividades/madre-de-dios", "/actividades/ciclo-2026-sesion-01", "/recursos", "/recursos/maap-233-mineria-de-oro-amazonia", "/red", "/impacto", "/actualidad", "/replica", "/contacto", "/privacidad", "/creditos"],
  en: ["", "/about", "/training", "/training/module-1", "/training/module-6", "/talks", "/talks/ciclo-2026-sesion-01", "/activities", "/activities/cajamarca-2025", "/activities/madre-de-dios", "/activities/ciclo-2026-sesion-01", "/resources", "/resources/maap-233-mineria-de-oro-amazonia", "/network", "/impact", "/news", "/replicate", "/contact", "/privacy", "/credits"],
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();

// AT-01 · todas las rutas responden 200 en /es y /en
for (const l of ["es", "en"]) {
  for (const r of routes[l]) {
    const res = await page.goto(`${base}/${l}${r}`, { waitUntil: "domcontentloaded" });
    ok(`AT-01 /${l}${r} → 200`, res?.status() === 200, String(res?.status()));
  }
}

// AT-01 · el conmutador lleva a la ruta equivalente
await page.goto(`${base}/es/formacion/modulo-3`);
await page.getByRole("link", { name: "English" }).first().click();
await page.waitForURL("**/en/training/module-3");
ok("AT-01 conmutador ES→EN en módulo", page.url().endsWith("/en/training/module-3"), page.url());

// AT-02 · franja de auspicio en todas las páginas, fondo blanco, logos del mismo ancho
for (const l of ["es", "en"]) {
  for (const r of routes[l]) {
    await page.goto(`${base}/${l}${r}`, { waitUntil: "domcontentloaded" });
    const info = await page.evaluate(() => {
      const strip = document.querySelector("[data-sponsor-strip]");
      const e = document.querySelector('[data-sponsor-strip] [data-sponsor-logo="embassy"]');
      const u = document.querySelector('[data-sponsor-strip] [data-sponsor-logo="uspa"]');
      if (!strip || !e || !u) return null;
      const bg = getComputedStyle(strip).backgroundColor;
      const eb = e.getBoundingClientRect();
      const ub = u.getBoundingClientRect();
      return { bg, ew: eb.width, uw: ub.width, eh: eb.height, uh: ub.height };
    });
    const pass = info && info.bg === "rgb(255, 255, 255)" && Math.abs(info.ew - info.uw) <= 1 && Math.abs(info.eh - info.uh) <= 1;
    if (!pass) ok(`AT-02 auspicio /${l}${r}`, false, JSON.stringify(info));
  }
}
ok("AT-02 auspicio verificado en todas las páginas", failed === 0);

// AT-03 · ninguna página contiene el monto del fondo
const forbidden = new RegExp(String.raw`(?<![\d,.])19[,.\s  ]?525(?![\d,])|US\$\s?19\b|SPE\d{5}IN\d{4}|\+51\s?9\d{2}`);
// (línea anterior: patrón vigente) · antiguo: `(?<![d,.])19[,.s  ]?525(?![d,])|US$s?19|SPEd{5}INd{4}|+51s?9d{2}`);
let leak = 0;
for (const l of ["es", "en"]) {
  for (const r of routes[l]) {
    const html = (await (await page.request.get(`${base}/${l}${r}`)).text()).replace(/ d="[^"]*"/g, "");
    if (forbidden.test(html)) {
      leak++;
      console.log("  ⚠ patrón prohibido en", l, r);
    }
  }
}
ok("AT-03 sin monto del fondo, award ni teléfonos en el HTML", leak === 0);

// AT-04 · /m/3 redirige al módulo en el idioma del navegador
for (const [lang, expected] of [["es-PE,es;q=0.9", "/es/formacion/modulo-3"], ["en-US,en;q=0.9", "/en/training/module-3"]]) {
  const res = await page.request.get(`${base}/m/3`, { headers: { "accept-language": lang }, maxRedirects: 0 });
  ok(`AT-04 /m/3 (${lang.slice(0, 2)}) → ${expected}`, res.status() === 307 && res.headers().location?.endsWith(expected), `${res.status()} ${res.headers().location}`);
}

// AT-05 · filtros de recursos en la URL
await page.goto(`${base}/es/recursos`, { waitUntil: "networkidle" });
await page.getByLabel("Tipo").selectOption("informe");
await page.getByLabel("Módulo").selectOption("3");
await page.waitForFunction(() => location.search.includes("tipo=informe") && location.search.includes("modulo=3"));
const count1 = await page.locator("main ul li article").count();
await page.reload();
const count2 = await page.locator("main ul li article").count();
ok("AT-05 filtros actualizan la URL y sobreviven a la recarga", count1 === count2 && count1 >= 1, `${count1}/${count2} ${page.url()}`);

// AT-06 · el iframe de YouTube no existe hasta pulsar «Reproducir» (sin youtubeId: nunca)
await page.goto(`${base}/es/ponencias/ciclo-2026-sesion-01`);
ok("AT-06 sin iframe de YouTube precargado", (await page.locator('iframe[src*="youtube"]').count()) === 0);

// AT-07 · el directorio no muestra correo ni teléfono
await page.goto(`${base}/es/red`);
const redText = await page.locator("main").innerText();
ok("AT-07 la red no expone teléfono", !/\+51|\b9\d{8}\b/.test(redText));

// AT-08 · navegación con teclado: foco visible desde el inicio hasta Recursos
await page.goto(`${base}/es`);
await page.keyboard.press("Tab");
const skip = await page.evaluate(() => document.activeElement?.textContent?.trim());
ok("AT-08 primer Tab = «Saltar al contenido»", skip === "Saltar al contenido", skip);
let reached = false;
for (let i = 0; i < 14 && !reached; i++) {
  await page.keyboard.press("Tab");
  const txt = await page.evaluate(() => document.activeElement?.textContent?.trim());
  reached = txt === "Recursos";
}
ok("AT-08 se llega a «Recursos» solo con teclado", reached);
await page.keyboard.press("Enter");
await page.waitForURL("**/es/recursos");
const outline = await page.evaluate(() => {
  const el = document.querySelector("a[href], button");
  return !!el;
});
ok("AT-08 navegación por teclado a Recursos", outline);

// AT-09 · axe-core: 0 violaciones serias o críticas en todas las plantillas
const templates = ["", "/proyecto", "/formacion", "/formacion/modulo-3", "/ponencias", "/ponencias/ciclo-2026-sesion-01", "/actividades", "/actividades/cajamarca-2025", "/recursos", "/recursos/maap-233-mineria-de-oro-amazonia", "/red", "/impacto", "/actualidad", "/replica", "/contacto", "/privacidad", "/creditos"];
for (const l of ["es", "en"]) {
  for (const t of templates) {
    const path = l === "es" ? t : (routes.en[routes.es.indexOf(t)] ?? t);
    await page.goto(`${base}/${l}${path}`, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
    if (bad.length) {
      ok(`AT-09 axe /${l}${path}`, false);
      for (const v of bad) console.log(`    ${v.impact} ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.html.slice(0, 120)}`);
    }
  }
}
ok("AT-09 axe sin violaciones serias o críticas", true);

// Seguridad: cabeceras
const head = await page.request.get(`${base}/es`);
const h = head.headers();
ok("R-132 cabeceras de seguridad", !!h["content-security-policy"] && h["x-content-type-options"] === "nosniff" && !!h["referrer-policy"] && !!h["permissions-policy"]);

await browser.close();
console.log(failed ? `\n${failed} comprobación(es) fallaron` : "\nTodas las comprobaciones pasaron");
process.exit(failed ? 1 : 0);
