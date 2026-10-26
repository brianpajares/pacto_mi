import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

// /en/news/rss.xml (la ruta localizada de «Actualidad» en inglés)
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return rssResponse(locale === "es" ? "es" : "en");
}
