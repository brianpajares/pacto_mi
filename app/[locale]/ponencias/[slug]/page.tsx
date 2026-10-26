import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import LiteVideo from "@/components/LiteVideo";
import ShareTools from "@/components/ShareTools";
import { PersonCard, VideoPoster } from "@/components/data";
import { EmptyState, L, PageHeader } from "@/components/ui";
import { getModule, getPerson, videos } from "@/lib/content";
import { fmtDate, fmtTime, loc } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => videos.map((v) => ({ locale, slug: v.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const v = videos.find((x) => x.slug === slug);
  if (!v) return {};
  const t = await getTranslations({ locale });
  return pageMeta({
    locale,
    href: { pathname: "/ponencias/[slug]", params: { slug } },
    title: loc(v.title, locale).text.slice(0, 60),
    description: t("talks.metaDescription", { speakers: v.speakers.map((id) => getPerson(id)?.name).join(", ") }).slice(0, 155),
  });
}

export default async function TalkPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const v = videos.find((x) => x.slug === slug);
  if (!v) notFound();
  const t = await getTranslations();
  const title = loc(v.title, locale).text;
  const speakers = v.speakers.map((id) => getPerson(id)!);

  return (
    <>
      {v.youtubeId && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: title,
            uploadDate: v.date,
            thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
            publisher: { "@type": "Organization", name: "PACTO-MI", url: SITE_URL },
          }}
        />
      )}
      <PageHeader
        eyebrow={t("talks.seriesName")}
        title={title}
        crumbs={[{ label: t("nav.talks"), href: "/ponencias" }, { label: t("talks.sessionNumber", { n: "01" }) }]}
        lede={
          <>
            {fmtDate(v.date, locale)} · {fmtTime(v.date, locale)} · {t("talks.online")}
          </>
        }
      />

      <div className="wrap section grid gap-14 lg:grid-cols-12">
        <div className="flex flex-col gap-12 lg:col-span-8">
          {v.youtubeId ? <LiteVideo youtubeId={v.youtubeId} title={title} /> : <VideoPoster v={v} />}
          {!v.youtubeId && <EmptyState title={t("talks.editingTitle")}>{t("talks.editingText")}</EmptyState>}

          <section aria-labelledby="summary">
            <h2 id="summary" className="mb-5">
              {t("talks.summary")}
            </h2>
            {v.summary.length > 0 ? (
              <ul className="prose-pacto list-disc pl-5">
                {v.summary.map((s, i) => (
                  <li key={i}>
                    <L v={s} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t("talks.summaryTbcTitle")}>{t("talks.summaryTbcText")}</EmptyState>
            )}
          </section>

          <section aria-labelledby="speakers">
            <h2 id="speakers" className="mb-5">
              {t("talks.speakers")}
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {speakers.map((p) => (
                <PersonCard key={p.id} p={p} showBio={false} showTalk />
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          {v.modules.length > 0 && (
            <div className="card p-5">
              <h3 className="!text-xl">{t("talks.relatedModules")}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {v.modules.map((n) => {
                  const m = getModule(n);
                  if (!m) return null;
                  return (
                    <li key={n}>
                      <Link href={{ pathname: "/formacion/[slug]", params: { slug: m.slug[locale] } }} className="font-semibold">
                        {t("modules.label", { n })}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <ShareTools shortPath={`/v/${v.slug}`} title={title} />
        </aside>
      </div>
    </>
  );
}
