import type { NextRequest } from "next/server";
import { getModule } from "@/lib/content";
import { go, preferredLocale } from "@/lib/shortlinks";

// /m/1 … /m/6 → página del módulo en el idioma del navegador (US-1, AT-04)
export async function GET(req: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const m = getModule(Number(n));
  if (!m) return go(req, "/formacion");
  return go(req, { pathname: "/formacion/[slug]", params: { slug: m.slug[preferredLocale(req)] } });
}
