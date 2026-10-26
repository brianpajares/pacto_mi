export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

// R-14: parámetros UTM en enlaces salientes a LinkedIn y redes
export function withUtm(url: string, medium = "referral"): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "pactomi-web");
    u.searchParams.set("utm_medium", medium);
    return u.toString();
  } catch {
    return url;
  }
}

// Las variables {{...}} y los TODO(equipo) cuentan como "sin configurar".
export const isConfigured = (v: string | undefined): v is string => !!v && !v.startsWith("{{") && !v.startsWith("TODO");
