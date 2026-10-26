import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarClock, MapPin, Monitor } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { AttendanceChart, PersonCard, SectorBars } from "@/components/data";
import { EmptyState, L, PageHeader, SectionHead } from "@/components/ui";
import { events, getPerson, getVideo, regions } from "@/lib/content";
import { fmtDate, fmtNumber, loc } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const e = events.find((x) => x.slug === slug);
  if (!e) return {};
  return pageMeta({
    locale,
    href: { pathname: "/actividades/[slug]", params: { slug } },
    title: loc(e.title, locale).text.slice(0, 60),
    description: loc(e.summary, locale).text.slice(0, 155),
  });
}

export default async function ActivityPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const e = events.find((x) => x.slug === slug);
  if (!e) notFound();
  const t = await getTranslations();
  const title = loc(e.title, locale).text;
  const region = e.region ? regions.find((r) => r.id === e.region) : undefined;
  const pending = e.status === "memoria-pendiente";
  const panel = e.panel.map((id) => getPerson(id)!).filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: title,
          ...(e.date ? { startDate: e.date } : {}),
          eventAttendanceMode: e.kind === "sesion-virtual" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: e.kind === "sesion-virtual" ? { "@type": "VirtualLocation", url: SITE_URL } : { "@type": "Place", name: loc(e.venue, "es").text || "Perú" },
          organizer: { "@type": "Organization", name: "PACTO-MI", url: SITE_URL },
        }}
      />
      <PageHeader
        eyebrow={t(`activities.kind.${e.kind}`)}
        title={title}
        lede={e.summary ? <L v={e.summary} /> : undefined}
        crumbs={[{ label: t("nav.activities"), href: "/actividades" }, { label: title.length > 40 ? `${title.slice(0, 38)}…` : title }]}
      >
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem] font-semibold text-tinta">
          <li className="inline-flex items-center gap-2">
            <CalendarClock size={18} aria-hidden /> {e.date ? fmtDate(e.date, locale) : t("activities.dateTbc")}
          </li>
          {e.venue && (
            <li className="inline-flex items-center gap-2">
              <MapPin size={18} aria-hidden /> <L v={e.venue} />
              {region && e.kind !== "sesion-virtual" ? `, ${loc(region.name, locale).text}` : ""}
            </li>
          )}
          {e.modality && (
            <li className="inline-flex items-center gap-2">
              <Monitor size={18} aria-hidden /> <L v={e.modality} />
            </li>
          )}
          <li>
            <span className={`chip ${e.status === "realizado" ? "chip-rio" : ""}`}>{t(`activities.status.${e.status}`)}</span>
          </li>
        </ul>
      </PageHeader>

      <div className="wrap section flex flex-col gap-16">
        {pending && (
          <EmptyState title={t("activities.pendingTitle")}>{t("activities.pendingText")}</EmptyState>
        )}

        {e.stats.length > 0 && (
          <section aria-labelledby="figures">
            <h2 id="figures" className="mb-8">
              {t("activities.figures")}
            </h2>
            <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
              {e.stats.map((s, i) => (
                <li key={i}>
                  <span className="mb-4 block h-1 w-12 bg-escudo" aria-hidden />
                  <p className="display text-[3.5rem] leading-none text-tinta md:text-[4.5rem]">{fmtNumber(s.value, locale)}</p>
                  <p className="mt-3 text-base">
                    <L v={s.label} />
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-suave">
                    {t("common.source")}: {s.source}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {e.attendanceByOrg && (
          <section aria-labelledby="attendance" className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="attendance" className="mb-6">
                {t("activities.attendance")}
              </h2>
              <AttendanceChart rows={e.attendanceByOrg} caption={loc(e.attendanceNote, locale).text || t("charts.attendanceCaption")} />
            </div>
            {e.attendanceBySector && (
              <div className="lg:col-span-5">
                <h2 className="mb-6">{t("activities.bySector")}</h2>
                <SectorBars rows={e.attendanceBySector} caption={t("charts.sectorCaption")} />
              </div>
            )}
          </section>
        )}

        {panel.length > 0 && (
          <section aria-labelledby="panel">
            <SectionHead title={e.kind === "sesion-virtual" ? t("activities.speakers") : t("activities.panel")} />
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {panel.map((p) => (
                <PersonCard key={p.id} p={p} showBio={false} showTalk={e.kind === "sesion-virtual"} />
              ))}
            </ul>
          </section>
        )}

        {e.methodology.length > 0 && (
          <section aria-labelledby="method" className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 id="method" className="mb-6">
                {t("activities.methodology")}
              </h2>
              <ol className="flex flex-col gap-4">
                {e.methodology.map((m, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="display w-9 shrink-0 text-[2rem] leading-none text-escudo">{i + 1}</span>
                    <span className="pt-0.5">
                      <L v={m} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            {e.lessons.length > 0 && (
              <div>
                <h2 className="mb-6">{t("activities.lessons")}</h2>
                <ul className="flex flex-col gap-4">
                  {e.lessons.map((m, i) => (
                    <li key={i} className="border-l-[3px] border-rio pl-4">
                      <L v={m} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {e.videos.length > 0 && (
          <section>
            <h2 className="mb-6">{t("activities.recordings")}</h2>
            <ul className="flex flex-col gap-3">
              {e.videos.map((slug) => {
                const v = getVideo(slug)!;
                return (
                  <li key={slug}>
                    <Link href={{ pathname: "/ponencias/[slug]", params: { slug } }} className="font-bold">
                      <L v={v.title} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="gallery">
          <h2 id="gallery" className="mb-6">
            {t("activities.gallery")}
          </h2>
          {e.gallery.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {e.gallery.map((g, i) => (
                <li key={i}>
                  <img src={g.src} alt={loc(g.alt, locale).text} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("activities.galleryTbcTitle")}>{t("activities.galleryTbcText")}</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
