import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventTimeline } from "@/components/data";
import { PageHeader } from "@/components/ui";
import { eventsSorted, regions } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/actividades", title: t("meta.activitiesTitle"), description: t("meta.activitiesDescription") });
}

export default async function ActivitiesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const regionNames = Object.fromEntries(regions.map((r) => [r.id, r.name]));
  return (
    <>
      <PageHeader eyebrow={t("nav.activities")} title={t("activities.title")} lede={t("activities.lede")} crumbs={[{ label: t("nav.activities") }]} />
      <section className="section">
        <div className="wrap max-w-4xl">
          <EventTimeline events={eventsSorted} regionNames={regionNames} />
          <p className="mt-2 text-sm text-suave">{t("activities.moreSoon")}</p>
        </div>
      </section>
    </>
  );
}
