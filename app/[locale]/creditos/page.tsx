import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader, SectionHead, Updated, L } from "@/components/ui";
import { SponsorLogos } from "@/components/SponsorStrip";
import { site, stats, team, visiblePartners } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/creditos", title: t("meta.creditsTitle"), description: t("meta.creditsDescription") });
}

export default async function CreditsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const sources = [...new Map(stats.filter((s) => s.sourceUrl).map((s) => [s.sourceUrl!, s])).values()];

  return (
    <>
      <PageHeader eyebrow={t("nav.credits")} title={t("credits.title")} lede={t("credits.lede")} crumbs={[{ label: t("nav.credits") }]} />
      <section className="section">
        <div className="wrap grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHead title={t("credits.sponsorTitle")} />
            <div className="mb-5">
              <SponsorLogos size={80} />
            </div>
            <p>{t("sponsor.text")}</p>
            <h3 className="mb-2 mt-8">{t("credits.disclaimerTitle")}</h3>
            <p className="rounded-md border-l-4 border-escudo bg-piedra-clara p-4">{t("sponsor.disclaimer")}</p>
          </div>

          <div>
            <SectionHead title={t("credits.teamTitle")} />
            <ul className="flex flex-col gap-3">
              {team.map((p) => (
                <li key={p.id}>
                  <span className="font-bold text-tinta">{p.name}</span> — <L v={p.role} />
                </li>
              ))}
            </ul>
            {visiblePartners.length > 0 && (
              <>
                <h3 className="mb-2 mt-8">{t("credits.partnersTitle")}</h3>
                <ul className="flex flex-col gap-1">
                  {visiblePartners.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            <SectionHead title={t("credits.sourcesTitle")} />
            <ul className="flex flex-col gap-3">
              {sources.map((s) => (
                <li key={s.sourceUrl}>
                  <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-words font-semibold">
                    {s.source}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead title={t("credits.licenseTitle")} />
            <p>{t("credits.licenseText")}</p>
            <h3 className="mb-2 mt-8">{t("credits.photoTitle")}</h3>
            <p>{t("credits.photoText")}</p>
            <div className="mt-8">
              <Updated date={site.lastUpdated} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
