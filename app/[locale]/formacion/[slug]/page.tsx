import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, ClipboardCheck, Target } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import ResourceCard from "@/components/ResourceCard";
import ShareTools from "@/components/ShareTools";
import JsonLd from "@/components/JsonLd";
import { VideoPoster } from "@/components/data";
import { EmptyState, L, PageHeader, SectionHead } from "@/components/ui";
import { getModule, modules, resources, videos } from "@/lib/content";
import { loc } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";
import { toResourceView } from "@/lib/views";

const bySlug = (slug: string) => modules.find((m) => m.slug.es === slug || m.slug.en === slug);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => modules.map((m) => ({ locale, slug: m.slug[locale] })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const m = bySlug(slug);
  if (!m) return {};
  const t = await getTranslations({ locale });
  const title = t("modules.metaTitle", { n: m.n });
  return pageMeta({
    locale,
    href: { pathname: "/formacion/[slug]", params: { slug: m.slug[locale] } },
    hrefByLocale: { es: { pathname: "/formacion/[slug]", params: { slug: m.slug.es } }, en: { pathname: "/formacion/[slug]", params: { slug: m.slug.en } } },
    title,
    description: loc(m.summary, locale).text.slice(0, 155),
  });
}

export default async function ModulePage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const m = bySlug(slug);
  if (!m || m.slug[locale] !== slug) notFound();
  const t = await getTranslations();
  const prev = getModule(m.n - 1);
  const next = getModule(m.n + 1);
  const related = resources.filter((r) => r.modules.includes(m.n));
  const recordings = videos.filter((v) => v.modules.includes(m.n));
  const shortPath = `/m/${m.n}`;
  const title = loc(m.title, locale).text;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: title,
          description: loc(m.summary, locale).text,
          inLanguage: locale === "es" ? "es-PE" : "en",
          isPartOf: { "@type": "Course", name: "PACTO-MI", provider: { "@type": "Organization", name: "PACTO-MI", url: SITE_URL } },
        }}
      />
      <PageHeader
        eyebrow={t("modules.label", { n: m.n })}
        title={title}
        lede={<L v={m.summary} />}
        crumbs={[{ label: t("nav.training"), href: "/formacion" }, { label: t("modules.label", { n: m.n }) }]}
      >
        <ul className="flex flex-wrap gap-2">
          <li className={`chip ${m.status === "completado" ? "chip-rio" : m.status === "en-curso" ? "chip-escudo" : ""}`}>{t(`modules.status.${m.status}`)}</li>
          <li className="chip">{m.modality ? t(`modules.modality.${m.modality}`) : t("modules.modalityTbc")}</li>
          <li className="chip">{m.sessions.length > 0 ? t("modules.sessionsCount", { count: m.sessions.length }) : t("modules.dateTbc")}</li>
        </ul>
      </PageHeader>

      <div className="wrap section grid gap-14 lg:grid-cols-12">
        <div className="flex flex-col gap-14 lg:col-span-8">
          {/* Lo que aprenderás */}
          <section aria-labelledby="learn">
            <h2 id="learn" className="mb-6">
              {t("modules.learn")}
            </h2>
            {m.objectives.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {m.objectives.map((o, i) => (
                  <li key={i} className="flex gap-3">
                    <Target size={22} className="mt-1 shrink-0 text-escudo" aria-hidden />
                    <span>
                      <L v={o} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t("modules.objectivesTbcTitle")}>{t("modules.objectivesTbcText")}</EmptyState>
            )}
            {m.goal && (
              <p className="mt-6 rounded-md border-l-4 border-rio bg-piedra-clara p-4 text-[0.9375rem] font-semibold text-tinta">
                <L v={m.goal} />
              </p>
            )}
          </section>

          {/* Sesiones y grabaciones */}
          <section aria-labelledby="sessions">
            <h2 id="sessions" className="mb-6">
              {t("modules.sessions")}
            </h2>
            {recordings.length > 0 &&
              recordings.map((v) => (
                <div key={v.slug} className="mb-6 grid gap-5 md:grid-cols-5">
                  <div className="md:col-span-3">
                    <VideoPoster v={v} />
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-bold text-tinta">
                      <L v={v.title} />
                    </p>
                    <p className="mt-2 text-sm text-suave">{t("modules.relatedTalk")}</p>
                    <Link href={{ pathname: "/ponencias/[slug]", params: { slug: v.slug } }} className="btn btn-secondary btn-sm mt-4">
                      {t("home.talk.cta")}
                    </Link>
                  </div>
                </div>
              ))}
            <EmptyState title={t("modules.sessionsTbcTitle")}>{t("modules.sessionsTbcText")}</EmptyState>
          </section>

          {/* Materiales */}
          <section aria-labelledby="materials">
            <SectionHead title={t("modules.materials")} />
            {related.length > 0 ? (
              <>
                <p className="-mt-6 mb-6 text-[0.9375rem] text-suave">{t("modules.recommended")}</p>
                <ul className="grid gap-6 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.slug} className="relative">
                      <ResourceCard r={toResourceView(r, locale)} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className={related.length > 0 ? "mt-6" : ""}>
              <EmptyState title={t("modules.materialsTbcTitle")}>{t("modules.materialsTbcText")}</EmptyState>
            </div>
          </section>

          {/* Evaluación */}
          <section aria-labelledby="eval">
            <h2 id="eval" className="mb-6">
              {t("modules.evaluation")}
            </h2>
            {m.evaluationUrl ? (
              <a href={m.evaluationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <ClipboardCheck size={20} aria-hidden /> {t("modules.evaluationCta")}
                <span className="sr-only">{t("common.opensNew")}</span>
              </a>
            ) : (
              <EmptyState title={t("modules.evaluationTbcTitle")} icon={<ClipboardCheck size={22} strokeWidth={1.75} aria-hidden />}>
                {t("modules.evaluationTbcText")}
              </EmptyState>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <ShareTools shortPath={shortPath} title={title} />
        </aside>
      </div>

      <nav aria-label={t("modules.prevNext")} className="border-t border-borde bg-piedra-clara">
        <div className="wrap grid gap-4 py-8 sm:grid-cols-2">
          {prev ? (
            <Link href={{ pathname: "/formacion/[slug]", params: { slug: prev.slug[locale] } }} className="card flex items-center gap-4 p-5 !text-tinta no-underline hover:border-tinta">
              <ArrowLeft size={22} aria-hidden />
              <span>
                <span className="block text-sm text-suave">{t("modules.prev")}</span>
                <span className="font-bold">{t("modules.label", { n: prev.n })}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={{ pathname: "/formacion/[slug]", params: { slug: next.slug[locale] } }}
              className="card flex items-center justify-end gap-4 p-5 text-right !text-tinta no-underline hover:border-tinta"
            >
              <span>
                <span className="block text-sm text-suave">{t("modules.next")}</span>
                <span className="font-bold">{t("modules.label", { n: next.n })}</span>
              </span>
              <ArrowRight size={22} aria-hidden />
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
