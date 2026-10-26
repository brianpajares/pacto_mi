import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { news, site } from "./content";
import { loc } from "./format";
import { SITE_URL } from "./site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// R-80: RSS de Actualidad en /es/actualidad/rss.xml y /en/news/rss.xml
export function rssResponse(locale: Locale): Response {
  const home = `${SITE_URL}${getPathname({ locale, href: "/actualidad" })}`;
  const items = news
    .map((n) => {
      const link = n.sourceUrl ?? home;
      const d = new Date(n.date.length === 7 ? `${n.date}-15T12:00:00Z` : `${n.date}T12:00:00Z`);
      return `<item><title>${esc(loc(n.title, locale).text)}</title><link>${esc(link)}</link><guid isPermaLink="false">pactomi-${n.slug}</guid><pubDate>${d.toUTCString()}</pubDate><description>${esc(loc(n.summary, locale).text)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PACTO-MI · ${locale === "es" ? "Actualidad" : "News"}</title><link>${esc(home)}</link><description>${esc(loc(site.tagline, locale).text)}</description><language>${locale === "es" ? "es-PE" : "en"}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
