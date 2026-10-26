import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Newspaper } from "lucide-react";
import { EmptyState, PageHeader, SectionHead } from "@/components/ui";
import { LinkedinIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { isConfigured, withUtm } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta({ locale, href: "/contacto", title: t("meta.contactTitle"), description: t("meta.contactDescription") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const linkedin = isConfigured(site.linkedin) ? withUtm(site.linkedin, "contacto") : "";
  const wa = isConfigured(site.whatsapp) ? site.whatsapp.replace(/\D/g, "") : "";
  const formUrl = isConfigured(site.forms.contact) ? site.forms.contact : "";

  return (
    <>
      <PageHeader eyebrow={t("nav.contact")} title={t("contact.title")} lede={t("contact.lede")} crumbs={[{ label: t("nav.contact") }]} />
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ul className="flex flex-col gap-4">
              <li className="card flex items-start gap-4 p-5">
                <Mail size={24} className="mt-1 shrink-0 text-escudo" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-suave">{t("contact.email")}</p>
                  <a href={`mailto:${site.email}`} className="break-all text-lg font-bold">
                    {site.email}
                  </a>
                </div>
              </li>
              {linkedin && (
                <li className="card flex items-start gap-4 p-5">
                  <span className="mt-1 text-escudo">
                    <LinkedinIcon size={24} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-suave">LinkedIn</p>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-lg font-bold">
                      PACTO-MI
                      <span className="sr-only">{t("common.opensNew")}</span>
                    </a>
                  </div>
                </li>
              )}
              {wa && (
                <li className="card flex items-start gap-4 p-5">
                  <span className="mt-1 text-escudo">
                    <WhatsappIcon size={24} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-suave">WhatsApp</p>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold">
                      {t("contact.whatsapp")}
                    </a>
                  </div>
                </li>
              )}
            </ul>
            <p className="mt-6 text-sm text-suave">
              {t("contact.privacyNote")} <Link href="/privacidad">{t("nav.privacy")}</Link>
            </p>
          </div>

          <div className="lg:col-span-7">
            <h2 className="mb-5 !text-[1.75rem]">{t("contact.formTitle")}</h2>
            {formUrl ? (
              <iframe src={formUrl} title={t("contact.formTitle")} loading="lazy" className="h-[640px] w-full rounded-md border border-borde" />
            ) : (
              <EmptyState title={t("contact.formSoonTitle")}>
                <p>{t("contact.formSoonText")}</p>
                <a href={`mailto:${site.email}`} className="btn btn-primary btn-sm mt-4">
                  <Mail size={18} aria-hidden /> {t("contact.writeUs")}
                </a>
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-borde bg-piedra-clara">
        <div className="wrap section">
          <SectionHead eyebrow={t("contact.pressEyebrow")} title={t("contact.pressTitle")} lede={t("contact.pressText")} />
          <EmptyState title={t("contact.pressKitTitle")} icon={<Newspaper size={22} strokeWidth={1.75} aria-hidden />}>
            {t("contact.pressKitText")}{" "}
            <a href={`mailto:${site.email}?subject=${encodeURIComponent(t("contact.pressMailSubject"))}`} className="font-bold">
              {t("contact.pressWrite")}
            </a>
          </EmptyState>
        </div>
      </section>
    </>
  );
}
