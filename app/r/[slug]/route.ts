import type { NextRequest } from "next/server";
import { getResource } from "@/lib/content";
import { go } from "@/lib/shortlinks";

// /r/[slug] → ficha del recurso (p. ej. /r/toolkit)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getResource(slug)) return go(req, "/recursos");
  return go(req, { pathname: "/recursos/[slug]", params: { slug } });
}
