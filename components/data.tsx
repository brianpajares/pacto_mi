import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarClock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fmtDate, fmtNumber, fmtTime, loc } from "@/lib/format";
import { Avatar, L } from "./ui";
import type { Locale } from "@/i18n/routing";
import type { z } from "zod";
import type * as S from "@/lib/schema";

type Module = z.infer<typeof S.Module>;
type Event = z.infer<typeof S.Event>;
type Video = z.infer<typeof S.Video>;
type Person = z.infer<typeof S.Person>;
type Indicator = z.infer<typeof S.Indicator>;

const statusChip = (s: string) => (s === "completado" || s === "realizado" ? "chip-rio" : s === "en-curso" ? "chip-escudo" : "");

/* ───────── Módulo: fila de la secuencia ───────── */
export function ModuleRow({ m, last = false }: { m: Module; last?: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const slug = m.slug[locale];
  return (
    <li className="relative grid grid-cols-[auto_1fr] gap-x-5 md:gap-x-8">
      <div className="flex flex-col items-center">
        <span className="display grid h-14 w-14 place-items-center rounded-full border-2 border-escudo bg-white text-[1.6rem] text-escudo md:h-16 md:w-16 md:text-3xl">{m.n}</span>
        {!last && <span aria-hidden className="mt-1 w-0.5 flex-1 bg-borde" />}
      </div>
      <div className={`pb-10 md:pb-12 ${last ? "" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-suave">{t("modules.label", { n: m.n })}</span>
          <span className={`chip ${statusChip(m.status)}`}>{t(`modules.status.${m.status}`)}</span>
        </div>
        <h3 className="mt-2 max-w-[34ch] !text-[1.45rem] md:!text-[1.75rem]">
          <Link href={{ pathname: "/formacion/[slug]", params: { slug } }} className="!text-tinta no-underline hover:!text-escudo">
            <L v={m.title} />
          </Link>
        </h3>
        <p className="mt-2 max-w-[60ch] text-[1rem] text-texto">
          <L v={m.summary} />
        </p>
        <Link href={{ pathname: "/formacion/[slug]", params: { slug } }} className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-bold">
          {t("modules.view")} <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

/* ───────── Póster tipográfico de una ponencia ───────── */
export function VideoPoster({ v, className = "" }: { v: Video; className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  return (
    <div className={`on-dark relative flex aspect-video flex-col justify-between overflow-hidden rounded-md bg-tinta p-5 text-white md:p-6 ${className}`}>
      <div className="pattern-bg absolute inset-0 opacity-[0.14] mix-blend-screen" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <span className="chip !bg-white !text-tinta">{t("talks.seriesName")}</span>
        {!v.youtubeId && <span className="chip chip-oro">{t("talks.editing")}</span>}
      </div>
      <div className="relative">
        <p className="display text-[4.5rem] leading-[0.85] text-white md:text-[6rem]">{t("talks.sessionNumber", { n: "01" })}</p>
        <p className="mt-3 text-[0.9375rem] text-white/90">
          {fmtDate(v.date, locale)} · {fmtTime(v.date, locale)}
        </p>
      </div>
    </div>
  );
}

/* ───────── Línea de tiempo de actividades ───────── */
export function EventTimeline({ events, regionNames }: { events: Event[]; regionNames: Record<string, { es: string; en?: string }> }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const done = e.status === "realizado";
        const region = e.region ? loc(regionNames[e.region], locale).text : null;
        return (
          <li key={e.slug} className="relative grid grid-cols-[auto_1fr] gap-x-5 md:gap-x-8">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={`mt-1.5 h-5 w-5 shrink-0 rounded-full border-[3px] ${done ? "border-escudo bg-escudo" : "border-tinta bg-white"}`}
              />
              {i < events.length - 1 && <span aria-hidden className="w-0.5 flex-1 bg-borde" />}
            </div>
            <div className="pb-12">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-suave">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock size={16} aria-hidden />
                  {e.date ? fmtDate(e.date, locale) : t("activities.dateTbc")}
                </span>
                {region && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} aria-hidden /> {region}
                  </span>
                )}
                <span className={`chip ${statusChip(e.status)}`}>{t(`activities.status.${e.status}`)}</span>
              </p>
              <h3 className="mt-2 max-w-[40ch]">
                <Link href={{ pathname: "/actividades/[slug]", params: { slug: e.slug } }} className="!text-tinta no-underline hover:!text-escudo">
                  <L v={e.title} />
                </Link>
              </h3>
              {e.summary && (
                <p className="mt-2 max-w-[62ch]">
                  <L v={e.summary} />
                </p>
              )}
              <Link href={{ pathname: "/actividades/[slug]", params: { slug: e.slug } }} className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-bold">
                {done ? t("activities.viewRecord") : t("activities.viewPage")} <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── Gráfico de asistencia por organización (SVG accesible + tabla) ───────── */
export function AttendanceChart({ rows, caption }: { rows: { org: string; n: number }[]; caption: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const sorted = [...rows].sort((a, b) => b.n - a.n);
  const total = sorted.reduce((a, r) => a + r.n, 0);
  const max = Math.max(...sorted.map((r) => r.n));
  const rowH = 30;
  const labelW = 262;
  const W = 700;
  const H = sorted.length * rowH + 8;
  const barMax = W - labelW - 56;
  return (
    <figure>
      <figcaption className="mb-4 text-[0.9375rem] font-semibold text-tinta">{caption}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("charts.attendanceAria", { n: sorted.length, total })} className="w-full">
        {sorted.map((r, i) => {
          const y = i * rowH + 4;
          const w = Math.max(3, (r.n / max) * barMax);
          return (
            <g key={r.org}>
              <text x={labelW - 12} y={y + 19} textAnchor="end" fontSize={14} fill="#1f2933" fontFamily="var(--font-sans)">
                {r.org}
              </text>
              <rect x={labelW} y={y + 4} width={w} height={20} rx={2} fill={i === 0 ? "#a71920" : "#1e2a44"} />
              <text x={labelW + w + 8} y={y + 19} fontSize={14} fontWeight={700} fill="#1f2933" fontFamily="var(--font-sans)">
                {fmtNumber(r.n, locale)}
              </text>
            </g>
          );
        })}
      </svg>
      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-escudo">{t("charts.showTable")}</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b-2 border-tinta">
                <th scope="col" className="py-2 pr-4">
                  {t("charts.organization")}
                </th>
                <th scope="col" className="py-2 text-right">
                  {t("charts.attendees")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.org} className="border-b border-borde">
                  <th scope="row" className="py-1.5 pr-4 font-normal">
                    {r.org}
                  </th>
                  <td className="py-1.5 text-right tabular-nums">{r.n}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="py-2 pr-4 text-left">
                  {t("charts.total")}
                </th>
                <td className="py-2 text-right font-bold tabular-nums">{total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </figure>
  );
}

export function SectorBars({ rows, caption }: { rows: { es: string; en: string; pct: number }[]; caption: string }) {
  const locale = useLocale() as Locale;
  return (
    <figure>
      <figcaption className="mb-4 text-[0.9375rem] font-semibold text-tinta">{caption}</figcaption>
      <ul className="flex flex-col gap-4">
        {rows.map((r) => (
          <li key={r.es}>
            <div className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
              <span>{locale === "es" ? r.es : r.en}</span>
              <span className="display text-2xl text-tinta tabular-nums">{fmtNumber(r.pct, locale, 1)} %</span>
            </div>
            <div className="mt-1.5 h-3 w-full rounded-sm bg-piedra" aria-hidden>
              <div className="h-full rounded-sm bg-tinta" style={{ width: `${Math.max(r.pct, 1.2)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ───────── Indicador meta vs. avance ───────── */
export function ProgressIndicator({ i }: { i: Indicator }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const unit = i.unit === "%" ? " %" : "";
  const has = i.actual !== null;
  const pct = has && i.target ? Math.min(100, (i.actual! / i.target) * 100) : null;
  return (
    <li className="card flex flex-col gap-3 p-5">
      <p className="font-semibold text-tinta">
        <L v={i.label} />
      </p>
      {has ? (
        <>
          <p className="display text-[2.75rem] text-tinta">
            {fmtNumber(i.actual!, locale)}
            {unit}
            {i.target !== null && <span className="ml-2 text-xl text-suave">/ {fmtNumber(i.target, locale)}{unit}</span>}
          </p>
          {pct !== null && (
            <div className="h-3 w-full rounded-sm bg-piedra" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={loc(i.label, locale).text}>
              <div className="h-full rounded-sm bg-rio" style={{ width: `${pct}%` }} />
            </div>
          )}
        </>
      ) : (
        <>
          <p className="display text-[2.75rem] text-borde">—</p>
          <p className="chip w-fit">{t("impact.consolidating")}</p>
        </>
      )}
      <dl className="mt-auto grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-borde pt-3 text-[0.8125rem] text-suave">
        <dt className="font-semibold">{t("impact.target")}</dt>
        <dd>{i.target !== null ? `${fmtNumber(i.target, locale)}${unit} ${i.unit === "%" ? "" : i.unit}` : t("impact.noTarget")}</dd>
        {i.asOf && (
          <>
            <dt className="font-semibold">{t("impact.cutoff")}</dt>
            <dd>{fmtDate(i.asOf, locale)}</dd>
          </>
        )}
        {i.source && (
          <>
            <dt className="font-semibold">{t("common.source")}</dt>
            <dd>{i.source}</dd>
          </>
        )}
      </dl>
    </li>
  );
}

/* ───────── Persona ───────── */
export function PersonCard({ p, showBio = true, showTalk = false }: { p: Person; showBio?: boolean; showTalk?: boolean }) {
  const t = useTranslations();
  return (
    <li className="card flex h-full flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        {p.photo ? (
          <img src={p.photo} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <Avatar name={p.pendingName ? "?" : p.name} />
        )}
        <div className="min-w-0">
          <h3 className="!text-[1.25rem]">{p.pendingName ? <L v={p.role} /> : p.name}</h3>
          {!p.pendingName && (
            <p className="mt-1 text-[0.9375rem] text-suave">
              <L v={p.role} />
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.fulbright && <span className="chip chip-rio">{t("people.fulbright", { year: p.fulbright.year })}</span>}
            {p.pendingName && <span className="chip chip-oro">{t("people.nameChecking")}</span>}
          </div>
        </div>
      </div>
      {showBio && p.bio && (
        <p className="text-[0.9375rem] text-texto">
          <L v={p.bio} />
        </p>
      )}
      {showTalk && p.talk && (
        <p className="mt-auto border-t border-borde pt-3 text-[0.9375rem]">
          <span className="font-semibold text-tinta">{t("people.talk")}: </span>
          <L v={p.talk} />
        </p>
      )}
      {p.linkedin && (
        <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold">
          LinkedIn
          <span className="sr-only"> — {p.name}. {t("common.opensNew")}</span>
        </a>
      )}
    </li>
  );
}
