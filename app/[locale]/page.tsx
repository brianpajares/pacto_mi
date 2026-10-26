import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import PeruMap from "@/components/PeruMap";
import { SponsorLogos } from "@/components/SponsorStrip";
import ResourceCard from "@/components/ResourceCard";
import { VideoPoster } from "@/components/data";
import { EmptyState, L, SectionHead, SourcedStat } from "@/components/ui";
import { LinkedinIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { eventsSorted, getPerson, getStat, modules, regions, resources, site, statsBy, videos } from "@/lib/content";
import { fmtDate, loc } from "@/lib/format";
import { formLink } from "@/lib/links";
import { pageMeta } from "@/lib/meta";
import { SITE_URL, isConfigured, withUtm } from "@/lib/site";
import { toResourceView } from "@/lib/views";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/", title: t("meta.homeTitle"), description: t("meta.homeDescription") });
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const heroStats = statsBy("proyecto");
  const whyIds = ["deforestacion-amazonia", "mdd-share", "rios-afectados", "flujo-financiero"];
  const why = whyIds.map((id) => getStat(id)!);
  const video = videos[0];
  const featured = resources.filter((r) => r.featured).slice(0, 3);
  const linkedin = isConfigured(site.linkedin) ? withUtm(site.linkedin, "web") : "";
  const join = formLink("directory", t("network.joinMailSubject"), t("network.joinMailBody"));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PACTO-MI",
          alternateName: loc(site.officialName, locale).text,
          url: SITE_URL,
          logo: `${SITE_URL}/logos/pacto-escudo.png`,
          email: site.email,
          description: loc(site.tagline, locale).text,
          ...(linkedin ? { sameAs: [site.linkedin] } : {}),
        }}
      />

      {/* ───────── HÉROE ───────── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pattern-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(100deg,transparent_35%,#000_85%)]"
          aria-hidden
        />
        <div className="wrap relative grid items-center gap-10 py-10 md:py-16 lg:grid-cols-12 lg:gap-6 lg:py-20">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">{t("home.hero.eyebrow")}</p>
            <h1>{t("home.hero.title")}</h1>
            <p className="lede mt-6">{t("home.hero.lede")}</p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              <Link href="/formacion" className="btn btn-primary">
                {t("home.hero.cta1")} <ArrowRight size={20} aria-hidden />
              </Link>
              <Link href="/red" className="btn btn-secondary">
                {t("home.hero.cta2")}
              </Link>
            </div>
            <div className="mt-10 flex max-w-xl flex-col gap-4 border-t border-borde pt-6 sm:flex-row sm:items-center">
              <div className="rounded-sm bg-white">
                <SponsorLogos size={64} />
              </div>
              <p className="text-[0.9375rem] leading-snug text-texto">{t("home.hero.sponsorLine")}</p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <PeruMap variant="hero" className="mx-auto block h-auto w-full max-w-[400px] lg:max-w-none" />
          </div>
        </div>
      </section>

      {/* ───────── FRANJA DE CIFRAS ───────── */}
      <section aria-label={t("home.stats.label")} className="border-y border-borde bg-piedra-clara">
        <div className="wrap grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4 lg:gap-x-8">
          {heroStats.map((s) => (
            <SourcedStat key={s.id} stat={s} compact />
          ))}
        </div>
      </section>

      {/* ───────── ¿POR QUÉ AHORA? ───────── */}
      <section className="on-dark relative overflow-hidden bg-tinta text-white">
        <div className="pattern-bg absolute inset-0 opacity-[0.12] mix-blend-screen" aria-hidden />
        <div className="wrap relative section">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4">{t("home.why.eyebrow")}</p>
              <h2 className="!text-white">{t("home.why.title")}</h2>
            </div>
            <p className="text-lg leading-relaxed text-white/95 lg:col-span-6 lg:col-start-7 lg:text-xl">{t("home.why.text")}</p>
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((s, i) => (
              <SourcedStat key={s.id} stat={s} tone="dark" accent={i < 3} compact />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FORMACIÓN ───────── */}
      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow={t("nav.training")}
            title={t("home.training.title")}
            lede={t("home.training.text")}
            action={
              <Link href="/formacion" className="btn btn-secondary shrink-0">
                {t("home.training.cta")}
              </Link>
            }
          />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <li key={m.n}>
                <Link
                  href={{ pathname: "/formacion/[slug]", params: { slug: m.slug[locale] } }}
                  className="card group flex h-full flex-col gap-4 p-5 !text-texto no-underline transition-colors hover:border-tinta md:p-6"
                >
                  <span className="display text-[4.5rem] leading-[0.8] text-escudo">{String(m.n).padStart(2, "0")}</span>
                  <span className="text-lg font-bold leading-snug text-tinta group-hover:text-escudo">
                    <L v={m.title} />
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[0.9375rem] font-bold text-escudo">
                    {t("modules.view")} <ArrowRight size={16} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── ÚLTIMA PONENCIA ───────── */}
      <section className="border-y border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("nav.talks")} title={t("home.talk.title")} />
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <VideoPoster v={video} />
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold text-suave">{fmtDate(video.date, locale)}</p>
              <h3 className="mt-2">
                <L v={video.title} />
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {video.speakers.map((id) => {
                  const p = getPerson(id)!;
                  return (
                    <li key={id} className="text-[0.9375rem]">
                      <span className="font-bold text-tinta">{p.name}</span>
                      {p.talk && (
                        <>
                          {" — "}
                          <L v={p.talk} />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Link href={{ pathname: "/ponencias/[slug]", params: { slug: video.slug } }} className="btn btn-primary mt-6">
                {t("home.talk.cta")} <ArrowRight size={20} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── ACTIVIDADES ───────── */}
      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow={t("nav.activities")}
            title={t("home.activities.title")}
            lede={t("home.activities.text")}
            action={
              <Link href="/actividades" className="btn btn-secondary shrink-0">
                {t("home.activities.cta")}
              </Link>
            }
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {eventsSorted.map((e) => {
              const region = e.region ? regions.find((r) => r.id === e.region) : undefined;
              return (
                <li key={e.slug}>
                  <Link
                    href={{ pathname: "/actividades/[slug]", params: { slug: e.slug } }}
                    className="card group flex h-full flex-col gap-3 p-5 !text-texto no-underline transition-colors hover:border-tinta md:p-6"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-suave">
                      {e.date ? fmtDate(e.date, locale) : t("activities.dateTbc")}
                      <span className={`chip ${e.status === "realizado" ? "chip-rio" : ""}`}>{t(`activities.status.${e.status}`)}</span>
                    </span>
                    <span className="display text-[1.6rem] leading-[1.05] text-tinta group-hover:text-escudo">
                      <L v={e.title} />
                    </span>
                    {region && <span className="mt-auto pt-2 text-sm text-suave">{loc(region.name, locale).text}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───────── RED ───────── */}
      <section className="border-y border-borde bg-piedra">
        <div className="wrap section grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">{t("nav.network")}</p>
            <h2>{t("home.network.title")}</h2>
            <p className="lede mt-5">{t("home.network.text")}</p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              <a href={join.href} {...(join.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="btn btn-primary">
                {join.fallback ? <Mail size={20} aria-hidden /> : null}
                {t("home.network.join")}
              </a>
              <Link href="/red" className="btn btn-secondary">
                {t("home.network.cta")}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <PeruMap variant="mini" className="mx-auto block h-auto w-full max-w-[260px]" />
          </div>
        </div>
      </section>

      {/* ───────── RECURSOS DESTACADOS ───────── */}
      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow={t("nav.resources")}
            title={t("home.resources.title")}
            lede={t("home.resources.text")}
            action={
              <Link href="/recursos" className="btn btn-secondary shrink-0">
                {t("home.resources.cta")}
              </Link>
            }
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {featured.map((r) => (
              <li key={r.slug} className="relative">
                <ResourceCard r={toResourceView(r, locale)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── LINKEDIN ───────── */}
      <section className="border-t border-borde bg-piedra-clara">
        <div className="wrap section">
          <div className="card flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-2xl">
              <h2 className="!text-[2rem] md:!text-[2.5rem]">{t("home.linkedin.title")}</h2>
              <p className="mt-3 text-lg">{linkedin ? t("home.linkedin.text") : t("home.linkedin.soon")}</p>
            </div>
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-primary shrink-0">
                <LinkedinIcon size={20} /> {t("home.linkedin.cta")}
                <span className="sr-only">{t("common.opensNew")}</span>
              </a>
            ) : (
              <Link href="/contacto" className="btn btn-secondary shrink-0">
                {t("home.linkedin.contact")}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
