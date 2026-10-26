import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarClock, GraduationCap, Users, Mail } from "lucide-react";
import { ModuleRow } from "@/components/data";
import { EmptyState, PageHeader, SectionHead } from "@/components/ui";
import { modules } from "@/lib/content";
import { formLink } from "@/lib/links";
import { pageMeta } from "@/lib/meta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/formacion", title: t("meta.trainingTitle"), description: t("meta.trainingDescription") });
}

export default async function TrainingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const join = formLink("registration", t("training.mailSubject"), t("training.mailBody"));

  return (
    <>
      <PageHeader eyebrow={t("nav.training")} title={t("training.title")} lede={t("training.lede")} crumbs={[{ label: t("nav.training") }]}>
        <a href={join.href} {...(join.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="btn btn-primary">
          {join.fallback && <Mail size={20} aria-hidden />}
          {t("training.join")}
        </a>
        {join.fallback && <p className="mt-3 max-w-md text-sm text-suave">{t("training.joinFallback")}</p>}
      </PageHeader>

      <section className="section">
        <div className="wrap">
          <ul className="grid gap-5 md:grid-cols-3">
            {[
              { icon: GraduationCap, k: "format" },
              { icon: Users, k: "audience" },
              { icon: CalendarClock, k: "calendar" },
            ].map(({ icon: Icon, k }) => (
              <li key={k} className="card p-6">
                <Icon size={28} strokeWidth={1.5} className="text-escudo" aria-hidden />
                <h2 className="mt-4 !text-[1.5rem]">{t(`training.${k}.title`)}</h2>
                <p className="mt-2 text-[1rem]">{t(`training.${k}.text`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("training.pathEyebrow")} title={t("training.pathTitle")} lede={t("training.pathText")} />
          <ol className="max-w-3xl">
            {modules.map((m, i) => (
              <ModuleRow key={m.n} m={m} last={i === modules.length - 1} />
            ))}
          </ol>
          <div className="mt-2 max-w-3xl">
            <EmptyState title={t("training.calendarTbcTitle")}>{t("training.calendarTbcText")}</EmptyState>
          </div>
        </div>
      </section>
    </>
  );
}
