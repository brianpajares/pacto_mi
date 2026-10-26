"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Pathname = keyof typeof routing.pathnames;

// Los módulos usan slug distinto por idioma (modulo-3 / module-3); el resto es igual.
function swapSlug(pathname: string, slug: string, to: string) {
  if (pathname === "/formacion/[slug]") return slug.replace(/^(modulo|module)-/, to === "es" ? "modulo-" : "module-");
  return slug;
}

export default function LocaleSwitcher({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname() as Pathname;
  const params = useParams<{ slug?: string }>();

  return (
    <div role="group" aria-label={t("lang.switch")} className="inline-flex overflow-hidden rounded-md border-2 border-current">
      {routing.locales.map((l) => {
        const active = l === locale;
        const href = (
          params.slug ? { pathname, params: { slug: swapSlug(pathname, params.slug, l) } } : { pathname }
        ) as React.ComponentProps<typeof Link>["href"];
        return (
          <Link
            key={l}
            href={href}
            locale={l}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={t(`lang.${l}`)}
            className={`inline-flex min-h-[40px] min-w-[44px] items-center justify-center px-2.5 text-sm font-bold no-underline ${
              dark
                ? active
                  ? "bg-white !text-tinta"
                  : "!text-white hover:bg-white/15"
                : active
                  ? "bg-tinta !text-white"
                  : "!text-tinta hover:bg-piedra"
            }`}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
