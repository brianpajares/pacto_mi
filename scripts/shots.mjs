// Capturas de revisión visual: node scripts/shots.mjs <baseUrl> <outDir> [rutas...]
import { chromium } from "playwright";
import fs from "node:fs";

const [base = "http://localhost:3100", out = "shots", ...routes] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const pages = routes.length ? routes : ["/es", "/en"];
const sizes = [
  ["desk", { width: 1440, height: 900 }],
  ["mob", { width: 360, height: 740 }],
];
const browser = await chromium.launch();
for (const [name, viewport] of sizes) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const r of pages) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    const file = `${out}/${name}${r.replace(/\//g, "_")}.png`;
    await page.screenshot({ path: file, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(file, overflow > 0 ? `⚠ desbordamiento horizontal ${overflow}px` : "ok");
  }
  await ctx.close();
}
await browser.close();
