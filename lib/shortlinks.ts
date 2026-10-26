import { NextResponse, type NextRequest } from "next/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Idioma preferido según Accept-Language; español como respaldo (§7).
export function preferredLocale(req: NextRequest): Locale {
  const header = req.headers.get("accept-language") ?? "";
  const prefs = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const p of prefs) if (p.lang === "es" || p.lang === "en") return p.lang;
  return routing.defaultLocale;
}

// Redirección 307 hacia la página localizada, conservando la consulta (UTM).
export function go(req: NextRequest, href: Parameters<typeof getPathname>[0]["href"]) {
  const locale = preferredLocale(req);
  const url = new URL(getPathname({ locale, href }), req.url);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 307);
}

export function external(url: string) {
  return NextResponse.redirect(url, 307);
}
