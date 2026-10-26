import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader, Updated } from "@/components/ui";
import { site } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/privacidad", title: t("meta.privacyTitle"), description: t("meta.privacyDescription") });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const sections = ["collect", "analytics", "purpose", "directory", "withdraw", "images", "law"] as const;
  return (
    <>
      <PageHeader eyebrow={t("nav.privacy")} title={t("privacy.title")} lede={t("privacy.lede")} crumbs={[{ label: t("nav.privacy") }]} />
      <section className="section">
        <div className="wrap">
          <div className="prose-pacto">
            {sections.map((k) => (
              <section key={k} aria-labelledby={`p-${k}`}>
                <h2 id={`p-${k}`} className="!text-[1.6rem]">
                  {t(`privacy.${k}.title`)}
                </h2>
                <p className="mt-3">{t(`privacy.${k}.text`)}</p>
              </section>
            ))}
            <p>
              {t("privacy.contactLine")} <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <Updated date={site.lastUpdated} />
          </div>
        </div>
      </section>
    </>
  );
}
