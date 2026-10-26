import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader, SectionHead, EmptyState } from "@/components/ui";
import { PersonCard } from "@/components/data";
import { SponsorLogos } from "@/components/SponsorStrip";
import { EventTimeline } from "@/components/data";
import { eventsSorted, regions, site, team, visiblePartners } from "@/lib/content";
import { loc } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/proyecto", title: t("meta.projectTitle"), description: t("meta.projectDescription") });
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const regionNames = Object.fromEntries(regions.map((r) => [r.id, r.name]));

  const values = ["evidence", "territory", "youth", "articulation", "care"] as const;
  const fronts = ["f1", "f2", "f3", "f4"] as const;
  const components = ["c1", "c2", "c3", "c4", "c5"] as const;

  return (
    <>
      <PageHeader
        eyebrow={t("nav.project")}
        title={t("project.title")}
        lede={t("project.lede")}
        crumbs={[{ label: t("nav.project") }]}
      >
        <div className="flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center">
          <SponsorLogos size={64} />
          <p className="text-[0.9375rem] leading-snug">{t("project.sponsorLine")}</p>
        </div>
      </PageHeader>

      {/* Origen */}
      <section className="section">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">{t("project.origin.eyebrow")}</p>
            <h2>{t("project.origin.title")}</h2>
          </div>
          <div className="prose-pacto text-lg lg:col-span-7 lg:col-start-6">
            <p>{t("project.origin.p1")}</p>
            <p>{t("project.origin.p2")}</p>
            <p className="rounded-md border-l-4 border-escudo bg-piedra-clara p-5 text-xl font-semibold italic text-tinta">
              {loc(site.tagline, locale).text}
            </p>
          </div>
        </div>
      </section>

      {/* Misión, visión, objetivo */}
      <section className="border-y border-borde bg-piedra-clara">
        <div className="wrap section">
          <div className="grid gap-px overflow-hidden rounded-md border border-borde bg-borde md:grid-cols-3">
            {(["mission", "vision", "goal"] as const).map((k) => (
              <article key={k} className="bg-white p-6 md:p-8">
                <p className="eyebrow mb-4">{t(`project.${k}.label`)}</p>
                <p className="text-[1.0625rem] leading-relaxed text-texto">{t(`project.${k}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("project.values.eyebrow")} title={t("project.values.title")} />
          <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((k) => (
              <div key={k} className="border-t-[3px] border-tinta pt-4">
                <dt className="display text-[1.75rem] text-tinta">{t(`project.values.${k}.name`)}</dt>
                <dd className="mt-2 text-[1rem]">{t(`project.values.${k}.text`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* AEIF */}
      <section className="on-dark relative overflow-hidden bg-tinta text-white">
        <div className="pattern-bg absolute inset-0 opacity-[0.12] mix-blend-screen" aria-hidden />
        <div className="wrap section relative grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">AEIF 2025</p>
            <h2 className="!text-white">{t("project.aeif.title")}</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-white/95 lg:col-span-6 lg:col-start-7">
            <p>{t("project.aeif.p1")}</p>
            <p>{t("project.aeif.p2")}</p>
          </div>
        </div>
      </section>

      {/* Estrategia y componentes */}
      <section className="section">
        <div className="wrap grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHead title={t("project.fronts.title")} />
            <ol className="flex flex-col gap-5">
              {fronts.map((k, i) => (
                <li key={k} className="flex gap-4">
                  <span className="display w-10 shrink-0 text-[2.25rem] leading-none text-escudo">{i + 1}</span>
                  <p className="pt-1 text-[1.0625rem]">{t(`project.fronts.${k}`)}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHead title={t("project.components.title")} />
            <ul className="flex flex-col gap-5">
              {components.map((k) => (
                <li key={k} className="border-l-[3px] border-rio pl-4">
                  <p className="font-bold text-tinta">{t(`project.components.${k}.name`)}</p>
                  <p className="mt-1 text-[0.9375rem]">{t(`project.components.${k}.text`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="border-y border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("project.team.eyebrow")} title={t("project.team.title")} lede={t("project.team.text")} />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {team.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </ul>
          <p className="mt-6 text-sm text-suave">{t("project.team.note")}</p>
        </div>
      </section>

      {/* Aliados */}
      <section className="section">
        <div className="wrap">
          <SectionHead title={t("project.partners.title")} />
          {visiblePartners.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePartners.map((p) => (
                <li key={p.id} className="card p-5">
                  <p className="text-sm text-suave">{t("project.partners.withSupport")}</p>
                  <p className="mt-1 text-lg font-bold text-tinta">{p.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("project.partners.emptyTitle")}>{t("project.partners.emptyText")}</EmptyState>
          )}
        </div>
      </section>

      {/* Hitos */}
      <section className="border-t border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("project.timeline.eyebrow")} title={t("project.timeline.title")} lede={t("project.timeline.text")} />
          <div className="max-w-3xl">
            <EventTimeline events={eventsSorted} regionNames={regionNames} />
          </div>
        </div>
      </section>
    </>
  );
}
