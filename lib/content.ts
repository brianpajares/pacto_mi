import "server-only";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as S from "./schema";

const root = path.join(process.cwd(), "content");

function parse<T extends z.ZodType>(file: string, schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `  - ${i.path.join(".") || "(raíz)"}: ${i.message}`).join("\n");
    throw new Error(`[content] ${file} no cumple el esquema:\n${issues}`);
  }
  return r.data;
}
function load<T extends z.ZodType>(rel: string, schema: T): z.infer<T> {
  return parse(rel, schema, JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")));
}
function loadDir<T extends z.ZodType>(dir: string, schema: T): z.infer<T>[] {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => parse(`${dir}/${f}`, schema, JSON.parse(fs.readFileSync(path.join(abs, f), "utf8"))));
}

export const site = load("site.json", S.Site);
export const regions = load("regions.json", z.array(S.Region));
export const people = load("people.json", z.array(S.Person)).sort((a, b) => a.order - b.order);
export const partners = load("partners.json", z.array(S.Partner));
export const stats = load("stats.json", z.array(S.Stat));
export const indicators = load("indicators.json", z.array(S.Indicator));
export const modules = loadDir("modules", S.Module).sort((a, b) => a.n - b.n);
export const events = loadDir("events", S.Event);
export const videos = loadDir("videos", S.Video);
export const resources = loadDir("resources", S.Resource).sort((a, b) => b.published.localeCompare(a.published));
export const news = loadDir("news", S.NewsItem).sort((a, b) => b.date.localeCompare(a.date));
export const leaders = load("leaders.json", z.array(S.Leader));
export const initiatives = load("initiatives.json", z.array(S.Initiative));
export const changelog = load("changelog.json", z.array(S.ChangelogEntry)).sort((a, b) => b.date.localeCompare(a.date));
export const linkedinHighlights = load("linkedin-highlights.json", z.array(S.LinkedinHighlight));

// Referencias cruzadas: falla el build si un id no existe.
const personIds = new Set(people.map((p) => p.id));
const videoSlugs = new Set(videos.map((v) => v.slug));
const regionIds = new Set(regions.map((r) => r.id));
for (const v of videos)
  for (const s of v.speakers) if (!personIds.has(s)) throw new Error(`[content] video ${v.slug}: persona "${s}" no existe en people.json`);
for (const e of events) {
  for (const p of e.panel) if (!personIds.has(p)) throw new Error(`[content] evento ${e.slug}: persona "${p}" no existe en people.json`);
  for (const v of e.videos) if (!videoSlugs.has(v)) throw new Error(`[content] evento ${e.slug}: video "${v}" no existe`);
  if (e.region && !regionIds.has(e.region)) throw new Error(`[content] evento ${e.slug}: región "${e.region}" no existe`);
}

export const getPerson = (id: string) => people.find((p) => p.id === id);
export const getModule = (n: number) => modules.find((m) => m.n === n);
export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const getVideo = (slug: string) => videos.find((v) => v.slug === slug);
export const getResource = (slug: string) => resources.find((r) => r.slug === slug);
export const team = people.filter((p) => p.kind === "equipo");
export const visiblePartners = partners.filter((p) => p.confirmed);
export const statsBy = (group: "proyecto" | "contexto") => stats.filter((s) => s.group === group);
export const getStat = (id: string) => stats.find((s) => s.id === id);
export const eventsSorted = [...events].sort((a, b) => {
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.localeCompare(b.date);
});
