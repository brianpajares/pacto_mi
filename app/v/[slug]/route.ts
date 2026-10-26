import type { NextRequest } from "next/server";
import { getVideo } from "@/lib/content";
import { go } from "@/lib/shortlinks";

// /v/[slug] → ponencia o grabación
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getVideo(slug)) return go(req, "/ponencias");
  return go(req, { pathname: "/ponencias/[slug]", params: { slug } });
}
