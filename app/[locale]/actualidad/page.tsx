import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Rss } from "lucide-react";
import { L, PageHeader } from "@/components/ui";
import { news } from "@/lib/content";
import { fmtDate } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    ...pageMeta({ locale, href: "/actualidad", title: t("meta.newsTitle"), description: t("meta.newsDescription") }),
    alternates: {
      ...pageMeta({ locale, href: "/actualidad", title: "", description: "" }).alternates,
      types: { "application/rss+xml": locale === "es" ? "/es/actualidad/rss.xml" : "/en/news/rss.xml" },
    },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageHeader eyebrow={t("nav.news")} title={t("news.title")} lede={t("news.lede")} crumbs={[{ label: t("nav.news") }]}>
        <a href={locale === "es" ? "/es/actualidad/rss.xml" : "/en/news/rss.xml"} className="btn btn-secondary btn-sm">
          <Rss size={18} aria-hidden /> {t("news.rss")}
        </a>
      </PageHeader>
      <section className="section">
        <div className="wrap max-w-4xl">
          <ul className="flex flex-col">
            {news.map((n) => (
              <li key={n.slug} className="border-t border-borde py-8 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-suave">
                  <time dateTime={n.date}>{fmtDate(n.date, locale)}</time>
                  <span className={`chip ${n.kind === "proyecto" ? "chip-escudo" : ""}`}>{t(`news.kind.${n.kind}`)}</span>
                  {n.tags.map((tag, i) => (
                    <span key={i} className="chip">
                      <L v={tag} />
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 !text-[1.75rem] md:!text-[2.1rem]">
                  <L v={n.title} />
                </h2>
                <p className="mt-3 max-w-[62ch] text-[1.0625rem]">
                  <L v={n.summary} />
                </p>
                {n.sourceUrl && (
                  <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold">
                    {t("news.readAt", { source: n.sourceName ?? "" })} <ArrowUpRight size={18} aria-hidden />
                    <span className="sr-only">{t("common.opensNew")}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
