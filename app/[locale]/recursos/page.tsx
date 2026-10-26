import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ResourceLibrary from "@/components/ResourceLibrary";
import { EmptyState, PageHeader } from "@/components/ui";
import { resources } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { toResourceView } from "@/lib/views";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/recursos", title: t("meta.resourcesTitle"), description: t("meta.resourcesDescription") });
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = resources.map((r) => toResourceView(r, locale));
  const soon = ["toolkit", "infografia", "presentacion", "plantilla"] as const;

  return (
    <>
      <PageHeader eyebrow={t("nav.resources")} title={t("resources.title")} lede={t("resources.lede")} crumbs={[{ label: t("nav.resources") }]} />
      <section className="section">
        <div className="wrap">
          <Suspense fallback={<div className="min-h-[780px] text-suave" role="status">{t("common.loading")}</div>}>
            <ResourceLibrary items={items} />
          </Suspense>

          <div className="mt-16">
            <EmptyState title={t("resources.soonTitle")}>
              <p>{t("resources.soonText")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {soon.map((k) => (
                  <li key={k} className="chip">
                    {t(`resources.types.${k}`)}
                  </li>
                ))}
              </ul>
            </EmptyState>
          </div>
        </div>
      </section>
    </>
  );
}
