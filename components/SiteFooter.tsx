import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SponsorStrip from "./SponsorStrip";
import { LinkedinIcon } from "./icons";
import { site, visiblePartners } from "@/lib/content";
import { fmtDate } from "@/lib/format";
import { isConfigured } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export default function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const linkedin = isConfigured(site.linkedin) ? site.linkedin : "";

  return (
    <footer>
      <SponsorStrip />
      <div className="on-dark bg-tinta text-white">
        <div className="wrap grid gap-12 py-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src="/logos/pacto-escudo.webp" width={36} height={40} alt="" className="h-10 w-auto rounded-sm bg-white p-1" />
              <span className="display text-3xl text-white">PACTO-MI</span>
            </div>
            <p className="mt-4 max-w-[44ch] text-[0.9375rem] text-white/85">{t("footer.tagline")}</p>
            <ul className="mt-6 flex flex-col gap-2 text-[0.9375rem]">
              <li>
                <a href={`mailto:${site.email}`} className="!text-white underline">
                  {site.email}
                </a>
              </li>
              {linkedin && (
                <li>
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 !text-white underline">
                    <LinkedinIcon size={16} /> {t("footer.linkedin")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <nav aria-label={t("footer.explore")} className="md:col-span-3">
            <h2 className="foot-h">
              {t("footer.explore")}
            </h2>
            <ul className="mt-4 flex flex-col gap-1 text-[0.9375rem]">
              {(
                [
                  ["/proyecto", "nav.project"],
                  ["/formacion", "nav.training"],
                  ["/ponencias", "nav.talks"],
                  ["/actividades", "nav.activities"],
                  ["/recursos", "nav.resources"],
                  ["/red", "nav.network"],
                  ["/impacto", "nav.impact"],
                  ["/actualidad", "nav.news"],
                  ["/replica", "nav.replicate"],
                  ["/contacto", "nav.contact"],
                ] as const
              ).map(([href, key]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-8 items-center !text-white no-underline hover:underline">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            {visiblePartners.length > 0 && (
              <>
                <h2 className="foot-h">
                  {t("footer.withSupport")}
                </h2>
                <ul className="mt-3 flex flex-col gap-1 text-[0.9375rem] text-white/90">
                  {visiblePartners.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </>
            )}
            <h2 className="foot-h">
              {t("footer.legal")}
            </h2>
            <ul className="mt-3 flex flex-col gap-1 text-[0.9375rem]">
              <li>
                <Link href="/privacidad" className="inline-flex min-h-8 items-center !text-white no-underline hover:underline">
                  {t("nav.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/creditos" className="inline-flex min-h-8 items-center !text-white no-underline hover:underline">
                  {t("nav.credits")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="wrap flex flex-col gap-3 py-6 text-[0.8125rem] leading-relaxed text-white/80 md:flex-row md:items-start md:justify-between">
            <p className="max-w-[78ch]">{t("sponsor.disclaimer")}</p>
            <p className="shrink-0 md:text-right">
              {t("common.updated", { date: fmtDate(site.lastUpdated, locale) })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
