import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations();
  return (
    <section className="wrap section">
      <p className="display text-[6rem] leading-none text-escudo md:text-[9rem]">404</p>
      <h1 className="mt-4 max-w-3xl">{t("notFound.title")}</h1>
      <p className="lede mt-5">{t("notFound.text")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          {t("notFound.home")}
        </Link>
        <Link href="/recursos" className="btn btn-secondary">
          {t("notFound.search")}
        </Link>
      </div>
    </section>
  );
}
