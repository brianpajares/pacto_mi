"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import ResourceCard, { type ResourceView } from "./ResourceCard";
import { EmptyState } from "./EmptyState";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const KEYS = ["q", "tipo", "modulo", "idioma", "anio"] as const;

// Filtros combinables con estado en la URL (?tipo=infografia&modulo=3) para compartir una búsqueda (R-22).
export default function ResourceLibrary({ items }: { items: ResourceView[] }) {
  const t = useTranslations();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const f = { q: sp.get("q") ?? "", tipo: sp.get("tipo") ?? "", modulo: sp.get("modulo") ?? "", idioma: sp.get("idioma") ?? "", anio: sp.get("anio") ?? "" };

  const set = (key: (typeof KEYS)[number], value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = Object.fromEntries(next.entries());
    router.replace({ pathname: pathname as "/recursos", query }, { scroll: false });
  };
  const clear = () => router.replace({ pathname: pathname as "/recursos" }, { scroll: false });

  const types = useMemo(() => [...new Set(items.map((i) => i.type))], [items]);
  const mods = useMemo(() => [...new Set(items.flatMap((i) => i.modules))].sort((a, b) => a - b), [items]);
  const years = useMemo(() => [...new Set(items.map((i) => i.year))].sort((a, b) => b - a), [items]);
  const langs = useMemo(() => [...new Set(items.map((i) => i.language))], [items]);

  const q = norm(f.q.trim());
  const filtered = items.filter(
    (r) =>
      (!f.tipo || r.type === f.tipo) &&
      (!f.modulo || r.modules.includes(Number(f.modulo))) &&
      (!f.idioma || r.language === f.idioma) &&
      (!f.anio || String(r.year) === f.anio) &&
      (!q || norm(`${r.title} ${r.description} ${r.publisher ?? ""}`).includes(q)),
  );
  const active = KEYS.some((k) => f[k]);

  const Select = ({ id, label, k, options }: { id: string; label: string; k: (typeof KEYS)[number]; options: { v: string; l: string }[] }) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-tinta">
        {label}
      </label>
      <select id={id} className="field" value={f[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="">{t("resources.all")}</option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <form role="search" aria-label={t("resources.searchLabel")} onSubmit={(e) => e.preventDefault()} className="card grid gap-4 p-4 sm:grid-cols-2 md:p-5 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="rq" className="mb-1 block text-sm font-semibold text-tinta">
            {t("resources.searchLabel")}
          </label>
          <div className="relative">
            <Search size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
            <input id="rq" type="search" className="field !pl-10" value={f.q} placeholder={t("resources.searchPlaceholder")} onChange={(e) => set("q", e.target.value)} />
          </div>
        </div>
        <Select id="rt" label={t("resources.filterType")} k="tipo" options={types.map((v) => ({ v, l: t(`resources.types.${v}`) }))} />
        <Select id="rm" label={t("resources.filterModule")} k="modulo" options={mods.map((v) => ({ v: String(v), l: t("resources.moduleLong", { n: v }) }))} />
        <Select id="rl" label={t("resources.filterLanguage")} k="idioma" options={langs.map((v) => ({ v, l: t(`resources.lang.${v}`) }))} />
        <Select id="ry" label={t("resources.filterYear")} k="anio" options={years.map((v) => ({ v: String(v), l: String(v) }))} />
      </form>

      <div className="mt-5 flex min-h-11 flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-[0.9375rem] font-semibold text-tinta">{t("resources.count", { count: filtered.length })}</p>
        {active && (
          <button type="button" onClick={clear} className="btn btn-ghost btn-sm">
            <X size={16} aria-hidden /> {t("resources.clear")}
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.slug} className="relative">
              <ResourceCard r={r} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState title={t("resources.noResults")}>{t("resources.noResultsText")}</EmptyState>
        </div>
      )}
    </div>
  );
}
