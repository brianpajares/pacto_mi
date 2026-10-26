import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "./site";

type Href = Parameters<typeof getPathname>[0]["href"];

// R-120: title ≤ 60, description ≤ 155, hreflang es-PE / en / x-default. R-121: imagen OG por idioma.
export function pageMeta({
  locale,
  href,
  title,
  description,
  hrefByLocale,
  noindex = false,
}: {
  locale: Locale;
  href: Href;
  title: string;
  description: string;
  hrefByLocale?: Partial<Record<Locale, Href>>;
  noindex?: boolean;
}): Metadata {
  const abs = (l: Locale) => `${SITE_URL}${getPathname({ locale: l, href: hrefByLocale?.[l] ?? href })}`;
  const path = (l: Locale) => abs(l).replace(/\/$/, "") || SITE_URL;
  return {
    title,
    description,
    alternates: {
      canonical: path(locale),
      languages: { "es-PE": path("es"), en: path("en"), "x-default": path("es") },
    },
    openGraph: { title, description, url: path(locale), images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630 }] },
    twitter: { title, description, images: [`/${locale}/opengraph-image`] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const allLocales = routing.locales;
