import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PersonCard, VideoPoster } from "@/components/data";
import { EmptyState, L, PageHeader, SectionHead } from "@/components/ui";
import { getPerson, people, videos } from "@/lib/content";
import { fmtDate } from "@/lib/format";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/ponencias", title: t("meta.talksTitle"), description: t("meta.talksDescription") });
}

export default async function TalksPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const experts = people.filter((p) => p.kind === "experto");

  return (
    <>
      <PageHeader eyebrow={t("nav.talks")} title={t("talks.title")} lede={t("talks.lede")} crumbs={[{ label: t("nav.talks") }]} />

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("talks.series2026")} title={t("talks.seriesName")} lede={t("talks.seriesText")} />
          <ul className="grid gap-8 md:grid-cols-2">
            {videos.map((v) => (
              <li key={v.slug} className="card overflow-hidden">
                <VideoPoster v={v} className="!rounded-none" />
                <div className="p-5 md:p-6">
                  <p className="text-sm font-semibold text-suave">{fmtDate(v.date, locale)}</p>
                  <h3 className="mt-1">
                    <L v={v.title} />
                  </h3>
                  <p className="mt-2 text-[0.9375rem]">{v.speakers.map((id) => getPerson(id)?.name).join(" · ")}</p>
                  <Link href={{ pathname: "/ponencias/[slug]", params: { slug: v.slug } }} className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold">
                    {t("talks.viewTalk")} <ArrowRight size={18} aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 max-w-3xl">
            <EmptyState title={t("talks.moreTitle")}>{t("talks.moreText")}</EmptyState>
          </div>
        </div>
      </section>

      <section className="border-y border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("talks.workshops")} title={t("talks.workshopsTitle")} />
          <EmptyState title={t("talks.workshopsEmptyTitle")}>{t("talks.workshopsEmptyText")}</EmptyState>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("talks.expertsEyebrow")} title={t("talks.expertsTitle")} lede={t("talks.expertsText")} />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {experts.map((p) => (
              <PersonCard key={p.id} p={p} showBio={false} showTalk />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
