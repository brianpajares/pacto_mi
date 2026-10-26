import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eye, Handshake, MapPinned, Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import LeaderNetwork, { type LeaderItem, type LeaderPoint } from "@/components/LeaderNetwork";
import PeruMap from "@/components/PeruMap";
import { EmptyState, L, PageHeader, SectionHead } from "@/components/ui";
import geo from "@/content/geo/peru.json";
import provinces from "@/content/geo/provinces.json";
import { initiatives, leaders, regions, site } from "@/lib/content";
import { loc } from "@/lib/format";
import { formLink } from "@/lib/links";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/red", title: t("meta.networkTitle"), description: t("meta.networkDescription") });
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w[0].toUpperCase()}.`)
    .join(" ");

export default async function NetworkPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const join = formLink("directory", t("network.joinMailSubject"), t("network.joinMailBody"));
  const regionName = (id: string) => (regions.find((r) => r.id === id) ? loc(regions.find((r) => r.id === id)!.name, locale).text : id);

  // Depuración en el servidor (R-41…R-43): la geografía llega como máximo a provincia; las iniciales y los
  // «ocultos» se resuelven aquí, de modo que el nombre real nunca viaja al navegador si la persona no lo autorizó.
  const points: LeaderPoint[] = [];
  const items: LeaderItem[] = [];
  for (const l of leaders) {
    const reg = regions.find((r) => r.id === l.region);
    const prov = provinces.find((p) => norm(p.name) === norm(l.province) && (!reg || p.dep === reg.ubigeo));
    if (!prov) continue;
    points.push({ regionId: regionName(l.region), province: prov.name, x: prov.x, y: prov.y, topics: l.topics, cohort: l.cohort });
    if (l.visibility === "oculto") continue;
    items.push({
      id: l.id,
      name: l.visibility === "iniciales" ? initials(l.displayName) : l.displayName,
      org: l.visibility === "publico" ? l.org : undefined,
      regionId: regionName(l.region),
      region: regionName(l.region),
      province: prov.name,
      topics: l.topics,
      cohort: l.cohort,
      linkedin: l.visibility === "publico" ? l.linkedin : undefined,
      initialsOnly: l.visibility === "iniciales",
    });
  }

  const promises = [
    { icon: Handshake, k: "optin" },
    { icon: MapPinned, k: "province" },
    { icon: Eye, k: "mediated" },
  ];

  return (
    <>
      <PageHeader eyebrow={t("nav.network")} title={t("network.title")} lede={t("network.lede")} crumbs={[{ label: t("nav.network") }]}>
        <a href={join.href} {...(join.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="btn btn-primary">
          {join.fallback && <Mail size={20} aria-hidden />}
          {t("network.join")}
        </a>
        {join.fallback && <p className="mt-3 max-w-md text-sm text-suave">{t("network.joinFallback")}</p>}
      </PageHeader>

      <section className="section">
        <div className="wrap">
          {items.length > 0 || points.length > 0 ? (
            <LeaderNetwork
              items={items}
              points={points}
              email={site.email}
              viewBox={{ w: geo.w, h: geo.h }}
              baseMap={<PeruMap variant="mini" className="block h-auto w-full" />}
            />
          ) : (
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <PeruMap variant="mini" className="mx-auto block h-auto w-full max-w-[340px]" />
              </div>
              <div className="lg:col-span-7">
                <EmptyState title={t("network.emptyTitle")}>{t("network.emptyText")}</EmptyState>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("network.privacyEyebrow")} title={t("network.privacyTitle")} lede={t("network.privacyText")} />
          <ul className="grid gap-5 md:grid-cols-3">
            {promises.map(({ icon: Icon, k }) => (
              <li key={k} className="card p-6">
                <Icon size={28} strokeWidth={1.5} className="text-rio" aria-hidden />
                <h3 className="mt-4 !text-[1.35rem]">{t(`network.promises.${k}.title`)}</h3>
                <p className="mt-2 text-[1rem]">{t(`network.promises.${k}.text`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("network.initiativesEyebrow")} title={t("network.initiativesTitle")} lede={t("network.initiativesText")} />
          {initiatives.length > 0 ? (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((i) => (
                <li key={i.id} className="card p-5">
                  <span className="chip">{t(`network.initiativeStatus.${i.status}`)}</span>
                  <h3 className="mt-3 !text-[1.3rem]">
                    <L v={i.title} />
                  </h3>
                  <p className="mt-1 text-sm text-suave">{regionName(i.region)}</p>
                  <p className="mt-3 text-[0.9375rem]">
                    <span className="font-semibold text-tinta">{t("network.seeking")}: </span>
                    <L v={i.seeking} />
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("network.initiativesEmptyTitle")}>{t("network.initiativesEmptyText")}</EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
