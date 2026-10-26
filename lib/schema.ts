import { z } from "zod";

// Texto bilingüe. Si falta "en", la UI muestra el texto en español con la etiqueta "Available in Spanish only".
export const L10n = z.object({ es: z.string().min(1), en: z.string().optional() });
export type L10nT = z.infer<typeof L10n>;

const Iso = z.string().regex(/^\d{4}-\d{2}(-\d{2})?(T[\d:.+-]+)?$/, "fecha ISO 8601 (AAAA-MM-DD)");

export const Site = z.object({
  name: z.string(),
  longName: L10n,
  officialName: L10n,
  tagline: L10n,
  email: z.email(),
  whatsapp: z.string().default(""),
  linkedin: z.string().default(""),
  forms: z.object({
    registration: z.string().default(""),
    directory: z.string().default(""),
    contact: z.string().default(""),
  }),
  replicationKit: z.string().default(""),
  lastUpdated: Iso,
});

export const Region = z.object({
  id: z.string(),
  name: L10n,
  ubigeo: z.string(),
  status: z.enum(["activa", "proxima", "replica"]),
});

export const Person = z.object({
  id: z.string(),
  name: z.string(),
  pendingName: z.boolean().default(false), // nombre en verificación: se muestra solo el cargo
  role: L10n,
  org: z.string().optional(),
  bio: L10n.optional(),
  photo: z.string().optional(),
  linkedin: z.url().optional(),
  kind: z.enum(["equipo", "experto", "panelista", "facilitador"]),
  talk: L10n.optional(),
  fulbright: z.object({ program: z.string(), year: z.number() }).optional(),
  order: z.number().default(99),
});

export const Module = z.object({
  n: z.number().int().min(1),
  slug: z.object({ es: z.string(), en: z.string() }),
  title: L10n,
  summary: L10n,
  goal: L10n.optional(),
  objectives: z.array(L10n).max(6).default([]),
  modality: z.enum(["virtual", "presencial", "hibrido"]).optional(),
  sessions: z
    .array(z.object({ date: Iso, facilitators: z.array(z.string()).default([]), recordingId: z.string().optional() }))
    .default([]),
  evaluationUrl: z.url().optional(),
  status: z.enum(["programado", "en-curso", "completado", "por-confirmar"]),
});

export const ResourceType = z.enum([
  "toolkit",
  "presentacion",
  "guia",
  "infografia",
  "lectura",
  "plantilla",
  "informe",
  "video",
  "enlace-externo",
]);
export type ResourceTypeT = z.infer<typeof ResourceType>;

export const Resource = z.object({
  slug: z.string(),
  type: ResourceType,
  title: L10n,
  description: L10n,
  modules: z.array(z.number()).default([]),
  regions: z.array(z.string()).default([]),
  language: z.enum(["es", "en", "es-en"]),
  format: z.string(),
  sizeMB: z.number().optional(),
  source: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("drive"), fileId: z.string() }),
    z.object({ kind: z.literal("repo"), path: z.string() }),
    z.object({ kind: z.literal("url"), href: z.url() }),
  ]),
  publisher: z.string().optional(), // fuente externa
  thumbnail: z.string().optional(),
  authors: z.array(z.string()).default([]),
  license: z.string().default("CC BY-NC 4.0"),
  published: Iso,
  updated: Iso.optional(),
  featured: z.boolean().default(false),
});

export const Video = z.object({
  slug: z.string(),
  youtubeId: z.string().optional(),
  title: L10n,
  speakers: z.array(z.string()),
  date: Iso,
  durationMin: z.number().optional(),
  series: z.string(),
  modules: z.array(z.number()).default([]),
  summary: z.array(L10n).default([]),
  transcriptResource: z.string().optional(),
  poster: z.string().optional(),
});

export const Event = z.object({
  slug: z.string(),
  title: L10n,
  kind: z.enum(["taller-presencial", "sesion-virtual", "ponencia", "modulo"]),
  date: Iso.optional(),
  endDate: Iso.optional(),
  region: z.string().optional(),
  venue: L10n.optional(),
  modality: L10n.optional(),
  summary: L10n.optional(),
  stats: z.array(z.object({ label: L10n, value: z.number(), source: z.string() })).default([]),
  attendanceByOrg: z.array(z.object({ org: z.string(), n: z.number() })).optional(),
  attendanceBySector: z.array(z.object({ es: z.string(), en: z.string(), pct: z.number() })).optional(),
  attendanceNote: L10n.optional(),
  panel: z.array(z.string()).default([]),
  methodology: z.array(L10n).default([]),
  lessons: z.array(L10n).default([]),
  gallery: z.array(z.object({ src: z.string(), alt: L10n, consent: z.literal(true) })).default([]),
  resources: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  status: z.enum(["programado", "realizado", "memoria-pendiente"]),
});

export const Leader = z.object({
  id: z.string(),
  visibility: z.enum(["publico", "iniciales", "oculto"]),
  displayName: z.string(),
  region: z.string(),
  province: z.string(),
  org: z.string().optional(),
  topics: z.array(z.string()).max(4),
  cohort: z.string(),
  linkedin: z.url().optional(),
  consentDate: Iso, // obligatorio (R-40)
});

export const Initiative = z.object({
  id: z.string(),
  title: L10n,
  region: z.string(),
  seeking: L10n,
  status: z.enum(["abierta", "en-curso", "cerrada"]),
});

export const Partner = z.object({
  id: z.string(),
  name: z.string(),
  url: z.url().optional(),
  logo: z.string().optional(),
  tier: z.enum(["auspicio", "socio-principal", "apoyo", "organizacion-juvenil"]),
  confirmed: z.boolean(), // solo true se muestra (§4)
});

export const Stat = z.object({
  id: z.string(),
  group: z.enum(["proyecto", "contexto"]),
  value: z.number(),
  decimals: z.number().default(0),
  prefix: z.string().optional(),
  unit: L10n.optional(),
  label: L10n,
  source: z.string(),
  sourceUrl: z.url().optional(),
  asOf: Iso,
});

export const Indicator = z.object({
  id: z.string(),
  label: L10n,
  target: z.number().nullable(),
  actual: z.number().nullable(),
  unit: z.string(),
  source: z.string().optional(),
  asOf: Iso.optional(),
});

export const NewsItem = z.object({
  slug: z.string(),
  date: Iso,
  kind: z.enum(["proyecto", "lectura"]),
  title: L10n,
  summary: L10n,
  tags: z.array(L10n).default([]),
  sourceName: z.string().optional(),
  sourceUrl: z.url().optional(),
});

export const ChangelogEntry = z.object({ date: Iso, note: L10n });
export const LinkedinHighlight = z.object({
  title: z.string(),
  date: Iso,
  image: z.string().optional(),
  url: z.url(),
});
