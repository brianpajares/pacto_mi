import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return rssResponse(locale === "en" ? "en" : "es");
}
