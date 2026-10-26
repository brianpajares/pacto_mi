import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { events, modules, resources, videos, site } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

type Entry = { es: Parameters<typeof getPathname>[0]["href"]; en?: Parameters<typeof getPathname>[0]["href"] };

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = ["/", "/proyecto", "/formacion", "/ponencias", "/actividades", "/recursos", "/red", "/impacto", "/actualidad", "/replica", "/contacto", "/privacidad", "/creditos"] as const;
  const entries: Entry[] = [
    ...statics.map((p) => ({ es: p, en: p }) as Entry),
    ...modules.map((m) => ({ es: { pathname: "/formacion/[slug]", params: { slug: m.slug.es } }, en: { pathname: "/formacion/[slug]", params: { slug: m.slug.en } } }) as Entry),
    ...videos.map((v) => ({ es: { pathname: "/ponencias/[slug]", params: { slug: v.slug } } }) as Entry),
    ...events.map((e) => ({ es: { pathname: "/actividades/[slug]", params: { slug: e.slug } } }) as Entry),
    ...resources.map((r) => ({ es: { pathname: "/recursos/[slug]", params: { slug: r.slug } } }) as Entry),
  ];
  const url = (l: Locale, href: Entry["es"]) => `${SITE_URL}${getPathname({ locale: l, href })}`.replace(/(.)\/$/, "$1");
  return entries.flatMap((e) =>
    routing.locales.map((l) => ({
      url: url(l, l === "en" && e.en ? e.en : e.es),
      lastModified: site.lastUpdated,
      alternates: { languages: { "es-PE": url("es", e.es), en: url("en", e.en ?? e.es) } },
    })),
  );
}
