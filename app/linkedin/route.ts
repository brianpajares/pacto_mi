import type { NextRequest } from "next/server";
import { site } from "@/lib/content";
import { isConfigured, withUtm } from "@/lib/site";
import { external, go } from "@/lib/shortlinks";

// /linkedin → página de LinkedIn PACTO-MI (con UTM); mientras no exista la URL, lleva a Contacto
export function GET(req: NextRequest) {
  return isConfigured(site.linkedin) ? external(withUtm(site.linkedin, "short")) : go(req, "/contacto");
}
