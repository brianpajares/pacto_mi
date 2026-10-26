import "server-only";
import { site } from "./content";
import { isConfigured } from "./site";

// Si el formulario externo aún no existe, el botón abre un correo prellenado al correo del proyecto.
export function formLink(kind: "registration" | "directory" | "contact", subject: string, body = ""): { href: string; external: boolean; fallback: boolean } {
  const url = site.forms[kind];
  if (isConfigured(url)) return { href: url, external: true, fallback: false };
  return {
    href: `mailto:${site.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`,
    external: false,
    fallback: true,
  };
}
