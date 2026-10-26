import type { L10nT } from "./schema";
import type { Locale } from "@/i18n/routing";

const TZ = "America/Lima";
const tag = (l: Locale) => (l === "es" ? "es-PE" : "en-US");

export function loc(value: L10nT | undefined, locale: Locale): { text: string; fallback: boolean } {
  if (!value) return { text: "", fallback: false };
  if (locale === "en" && value.en) return { text: value.en, fallback: false };
  return { text: value.es, fallback: locale === "en" };
}

function toDate(iso: string): Date {
  if (iso.length === 10) return new Date(`${iso}T12:00:00-05:00`);
  if (iso.length === 7) return new Date(`${iso}-15T12:00:00-05:00`);
  return new Date(iso);
}

// "19 de noviembre de 2025" / "November 19, 2025". Con "AAAA-MM" devuelve "octubre de 2025".
export function fmtDate(iso: string, locale: Locale, opts?: { month?: "long" | "short"; withYear?: boolean }): string {
  const d = toDate(iso);
  const month = opts?.month ?? "long";
  if (iso.length === 7) return new Intl.DateTimeFormat(tag(locale), { month, year: "numeric", timeZone: TZ }).format(d);
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month,
    ...(opts?.withYear === false ? {} : { year: "numeric" }),
    timeZone: TZ,
  }).format(d);
}

export function fmtTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { hour: "numeric", minute: "2-digit", timeZone: TZ, hour12: locale === "en" }).format(new Date(iso));
}

// ES: 1 000 y 97,5 (espacio fino) · EN: 1,000 y 97.5
export function fmtNumber(n: number, locale: Locale, decimals = 0): string {
  const s = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
  if (locale === "en") return s;
  return s.replace(/,/g, " ").replace(".", ",");
}
