import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/proyecto": { es: "/proyecto", en: "/about" },
    "/formacion": { es: "/formacion", en: "/training" },
    "/formacion/[slug]": { es: "/formacion/[slug]", en: "/training/[slug]" },
    "/ponencias": { es: "/ponencias", en: "/talks" },
    "/ponencias/[slug]": { es: "/ponencias/[slug]", en: "/talks/[slug]" },
    "/actividades": { es: "/actividades", en: "/activities" },
    "/actividades/[slug]": { es: "/actividades/[slug]", en: "/activities/[slug]" },
    "/recursos": { es: "/recursos", en: "/resources" },
    "/recursos/[slug]": { es: "/recursos/[slug]", en: "/resources/[slug]" },
    "/red": { es: "/red", en: "/network" },
    "/impacto": { es: "/impacto", en: "/impact" },
    "/actualidad": { es: "/actualidad", en: "/news" },
    "/replica": { es: "/replica", en: "/replicate" },
    "/contacto": { es: "/contacto", en: "/contact" },
    "/privacidad": { es: "/privacidad", en: "/privacy" },
    "/creditos": { es: "/creditos", en: "/credits" },
  },
});
