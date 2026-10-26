import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClipboardList, FileSignature, Mail, Users } from "lucide-react";
import { EmptyState, L, PageHeader, SectionHead } from "@/components/ui";
import { events, site } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { isConfigured } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/replica", title: t("meta.replicateTitle"), description: t("meta.replicateDescription") });
}

export default async function ReplicatePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const lessons = events.find((e) => e.slug === "cajamarca-2025")?.lessons ?? [];
  const kit = isConfigured(site.replicationKit) ? site.replicationKit : "";
  const steps = ["s1", "s2", "s3", "s4"] as const;
  const templates = ["invitation", "commitment", "agenda", "registration", "certificate", "checklist"] as const;

  return (
    <>
      <PageHeader eyebrow={t("nav.replicate")} title={t("replicate.title")} lede={t("replicate.lede")} crumbs={[{ label: t("nav.replicate") }]}>
        {kit ? (
          <a href={kit} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {t("replicate.download")}
            <span className="sr-only">{t("common.opensNew")}</span>
          </a>
        ) : (
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(t("replicate.mailSubject"))}&body=${encodeURIComponent(t("replicate.mailBody"))}`}
            className="btn btn-primary"
          >
            <Mail size={20} aria-hidden /> {t("replicate.request")}
          </a>
        )}
      </PageHeader>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("replicate.howEyebrow")} title={t("replicate.howTitle")} lede={t("replicate.howText")} />
          <ol className="grid gap-5 md:grid-cols-2">
            {steps.map((k, i) => (
              <li key={k} className="card flex gap-5 p-6">
                <span className="display text-[3rem] leading-none text-escudo">{i + 1}</span>
                <div>
                  <h3 className="!text-[1.35rem]">{t(`replicate.steps.${k}.title`)}</h3>
                  <p className="mt-2 text-[1rem]">{t(`replicate.steps.${k}.text`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {lessons.length > 0 && (
        <section className="border-y border-borde bg-piedra-clara">
          <div className="wrap section">
            <SectionHead eyebrow={t("replicate.lessonsEyebrow")} title={t("replicate.lessonsTitle")} lede={t("replicate.lessonsText")} />
            <ul className="grid gap-5 md:grid-cols-3">
              {lessons.map((l, i) => (
                <li key={i} className="border-t-[3px] border-rio bg-white p-5 text-[1rem]">
                  <L v={l} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow={t("replicate.kitEyebrow")} title={t("replicate.kitTitle")} lede={t("replicate.kitText")} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((k) => (
              <li key={k} className="card flex items-center justify-between gap-4 p-5">
                <span className="flex items-center gap-3 font-semibold text-tinta">
                  {k === "checklist" ? <ClipboardList size={22} className="text-escudo" aria-hidden /> : k === "registration" ? <Users size={22} className="text-escudo" aria-hidden /> : <FileSignature size={22} className="text-escudo" aria-hidden />}
                  {t(`replicate.templates.${k}`)}
                </span>
                <span className="chip chip-oro shrink-0">{kit ? t("replicate.available") : t("common.soon")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 max-w-3xl">
            <EmptyState title={t("replicate.guideTitle")}>{t("replicate.guideText")}</EmptyState>
          </div>
        </div>
      </section>
    </>
  );
}
