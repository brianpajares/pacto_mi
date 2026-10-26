import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import ContourBg from "./ContourBg";
import { fmtDate, fmtNumber, loc } from "@/lib/format";
import type { Locale } from "@/i18n/routing";
import type { L10nT } from "@/lib/schema";

/* ───────── Encabezado de página + migas ───────── */
export type Crumb = { label: string; href?: React.ComponentProps<typeof Link>["href"] };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations();
  return (
    <nav aria-label={t("common.breadcrumb")} className="text-sm text-suave">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="!text-suave hover:!text-escudo">
            {t("nav.home")}
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight size={14} aria-hidden />
            {c.href ? (
              <Link href={c.href} className="!text-suave hover:!text-escudo">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-tinta">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-borde bg-piedra-clara">
      <ContourBg className="opacity-70" />
      <div className="wrap relative py-10 md:py-16">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="mt-6 max-w-4xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1>{title}</h1>
          {lede && <div className="lede mt-5">{lede}</div>}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, lede, action }: { eyebrow?: string; title: string; lede?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2>{title}</h2>
        {lede && <div className="mt-4 text-[1.0625rem] text-texto md:text-lg">{lede}</div>}
      </div>
      {action}
    </div>
  );
}

/* ───────── Texto con aviso de idioma ───────── */
export function L({ v }: { v: L10nT | undefined }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { text, fallback } = loc(v, locale);
  if (!fallback) return <>{text}</>;
  return (
    <>
      <span lang="es">{text}</span>{" "}
      <span className="chip ml-1 align-middle">{t("common.spanishOnly")}</span>
    </>
  );
}

export { EmptyState } from "./EmptyState";

/* ───────── Cifra con fuente y fecha (SourcedStat) ───────── */
export type StatLike = {
  value: number;
  decimals?: number;
  prefix?: string;
  unit?: L10nT;
  label: L10nT;
  source: string;
  sourceUrl?: string;
  asOf: string;
};

export function SourcedStat({ stat, tone = "light", accent = false, compact = false }: { stat: StatLike; tone?: "light" | "dark"; accent?: boolean; compact?: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const dark = tone === "dark";
  const unit = stat.unit ? loc(stat.unit, locale).text : "";
  const prefix = stat.prefix ?? "";
  return (
    <figure className={`flex h-full flex-col ${dark ? "text-white" : "text-texto"}`}>
      <span className={`mb-4 block h-1 w-12 ${accent ? "bg-oro" : dark ? "bg-white" : "bg-escudo"}`} aria-hidden />
      <div className={`display leading-none ${dark ? "text-white" : "text-tinta"} ${compact ? "text-[2.75rem] md:text-[3.25rem]" : "text-[3.25rem] md:text-[4.5rem]"}`}>
        <span className="whitespace-nowrap">
          {prefix}
          {fmtNumber(stat.value, locale, stat.decimals ?? 0)}
        </span>
        {unit && <span className={`ml-1.5 inline-block align-baseline ${compact ? "text-2xl" : "text-3xl md:text-4xl"} ${dark ? "text-white/90" : "text-escudo"}`}>{unit}</span>}
      </div>
      <figcaption className="mt-3 flex flex-1 flex-col gap-2">
        <span className={`text-base leading-snug ${dark ? "text-white" : "text-texto"}`}>
          <L v={stat.label} />
        </span>
        <span className={`mt-auto text-[0.8125rem] ${dark ? "text-white/80" : "text-suave"}`}>
          {stat.sourceUrl ? (
            <a
              href={stat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={dark ? "!text-white" : ""}
            >
              {t("common.source")}: {stat.source}
              <ArrowUpRight size={13} aria-hidden className="ml-0.5 inline align-[-1px]" />
              <span className="sr-only">{t("common.opensNew")}</span>
            </a>
          ) : (
            <>
              {t("common.source")}: {stat.source}
            </>
          )}
          {" · "}
          {fmtDate(stat.asOf.slice(0, 7), locale)}
        </span>
      </figcaption>
    </figure>
  );
}

/* ───────── Marca de actualización ───────── */
export function Updated({ date }: { date: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  return <p className="text-sm text-suave">{t("common.updated", { date: fmtDate(date, locale) })}</p>;
}

/* ───────── Persona ───────── */
export function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || "?";
  return (
    <span
      aria-hidden
      className="display grid shrink-0 place-items-center rounded-full bg-tinta text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
