import type { NextRequest } from "next/server";
import { site } from "@/lib/content";
import { isConfigured } from "@/lib/site";
import { external, go } from "@/lib/shortlinks";

// /unete → inscripción al directorio de líderes (formulario externo si existe; si no, la página de la red)
export function GET(req: NextRequest) {
  return isConfigured(site.forms.directory) ? external(site.forms.directory) : go(req, "/red");
}
