import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProgressIndicator } from "@/components/data";
import { PageHeader, Updated } from "@/components/ui";
import { indicators, site } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/impacto", title: t("meta.impactTitle"), description: t("meta.impactDescription") });
}

export default async function ImpactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageHeader eyebrow={t("nav.impact")} title={t("impact.title")} lede={t("impact.lede")} crumbs={[{ label: t("nav.impact") }]} />
      <section className="section">
        <div className="wrap">
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {indicators.map((i) => (
              <ProgressIndicator key={i.id} i={i} />
            ))}
          </ul>
          <div className="mt-10 max-w-3xl space-y-3 text-[0.9375rem] text-suave">
            <p>{t("impact.note")}</p>
            <Updated date={site.lastUpdated} />
          </div>
        </div>
      </section>
    </>
  );
}
