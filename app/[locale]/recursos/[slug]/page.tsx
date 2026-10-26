import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Download, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import ResourceCard, { ResourceThumb } from "@/components/ResourceCard";
import ShareTools from "@/components/ShareTools";
import JsonLd from "@/components/JsonLd";
import { L, PageHeader } from "@/components/ui";
import { getModule, resources } from "@/lib/content";
import { fmtDate, loc } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";
import { resourceHref, toResourceView } from "@/lib/views";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => resources.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const r = resources.find((x) => x.slug === slug);
  if (!r) return {};
  return pageMeta({
    locale,
    href: { pathname: "/recursos/[slug]", params: { slug } },
    title: loc(r.title, locale).text.slice(0, 60),
    description: loc(r.description, locale).text.slice(0, 155),
  });
}

export default async function ResourcePage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = resources.find((x) => x.slug === slug);
  if (!r) notFound();
  const t = await getTranslations();
  const title = loc(r.title, locale).text;
  const external = r.source.kind === "url";
  const href = resourceHref(r);
  const related = resources.filter((x) => x.slug !== r.slug && x.modules.some((m) => r.modules.includes(m))).slice(0, 2);

  const meta: [string, React.ReactNode][] = [
    [t("resources.meta.type"), t(`resources.types.${r.type}`)],
    ...(r.publisher ? ([[t("resources.meta.publisher"), r.publisher]] as [string, React.ReactNode][]) : []),
    [t("resources.meta.language"), t(`resources.lang.${r.language}`)],
    [t("resources.meta.format"), r.sizeMB ? `${r.format} · ${r.sizeMB} MB` : r.format],
    [t("resources.meta.published"), fmtDate(r.published.length === 7 ? r.published : r.published, locale)],
    [t("resources.meta.license"), r.license],
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: title,
          description: loc(r.description, locale).text,
          datePublished: r.published,
          inLanguage: r.language === "es-en" ? ["es", "en"] : r.language,
          url: href,
          provider: { "@type": "Organization", name: "PACTO-MI", url: SITE_URL },
        }}
      />
      <PageHeader
        eyebrow={t(`resources.types.${r.type}`)}
        title={title}
        lede={<L v={r.description} />}
        crumbs={[{ label: t("nav.resources"), href: "/recursos" }, { label: title.length > 40 ? `${title.slice(0, 38)}…` : title }]}
      />
      <div className="wrap section grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-8">
          <div className="overflow-hidden rounded-md border border-borde">
            <ResourceThumb type={r.type} label={t(`resources.types.${r.type}`)} />
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn btn-primary">
              {external ? <ArrowUpRight size={20} aria-hidden /> : <Download size={20} aria-hidden />}
              {external ? t("resources.openSource") : t("resources.download")}
              {external && <span className="sr-only">{t("common.opensNew")}</span>}
            </a>
          </div>

          {external && (
            <p className="flex gap-3 rounded-md bg-piedra-clara p-4 text-[0.9375rem]">
              <Info size={20} className="mt-0.5 shrink-0 text-tinta" aria-hidden />
              <span>{t("resources.externalNote", { publisher: r.publisher ?? "—" })}</span>
            </p>
          )}

          {r.modules.length > 0 && (
            <section>
              <h2 className="mb-4 !text-[1.6rem]">{t("resources.usedIn")}</h2>
              <ul className="flex flex-wrap gap-3">
                {r.modules.map((n) => {
                  const m = getModule(n)!;
                  return (
                    <li key={n}>
                      <Link href={{ pathname: "/formacion/[slug]", params: { slug: m.slug[locale] } }} className="btn btn-ghost btn-sm">
                        {t("modules.label", { n })}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="mb-6 !text-[1.6rem]">{t("resources.related")}</h2>
              <ul className="grid gap-6 sm:grid-cols-2">
                {related.map((x) => (
                  <li key={x.slug} className="relative">
                    <ResourceCard r={toResourceView(x, locale)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="card p-5">
            <h3 className="!text-xl">{t("resources.details")}</h3>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[0.9375rem]">
              {meta.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-semibold text-tinta">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ShareTools shortPath={`/r/${r.slug}`} title={title} />
        </aside>
      </div>
    </>
  );
}
