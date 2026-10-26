import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { site } from "@/lib/content";
import { SITE_URL, isConfigured } from "@/lib/site";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("meta.homeTitle"), template: "%s · PACTO-MI" },
    description: t("meta.homeDescription"),
    applicationName: "PACTO-MI",
    openGraph: { siteName: "PACTO-MI", type: "website", locale: locale === "es" ? "es_PE" : "en_US" },
    twitter: { card: "summary_large_image" },
  };
}

// Solo los espacios de nombres que usan componentes de cliente viajan al navegador.
const CLIENT_NAMESPACES = ["nav", "lang", "common", "share", "video", "resources", "network", "map"] as const;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const all = (await getMessages()) as Record<string, unknown>;
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((k) => [k, all[k]]));
  const linkedin = isConfigured(site.linkedin) ? site.linkedin : undefined;

  return (
    <html lang={locale === "es" ? "es-PE" : "en"} className={`${archivo.variable} ${publicSans.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#contenido" className="skip-link">
            {t("nav.skip")}
          </a>
          <SiteHeader linkedin={linkedin} />
          <main id="contenido" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
