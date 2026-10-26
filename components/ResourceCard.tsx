import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen, Download, ExternalLink, FileText, Image as ImageIcon, Newspaper, Package, Play, Presentation } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ResourceTypeT } from "@/lib/schema";

/** Datos ya localizados: sirven tanto para páginas de servidor como para la biblioteca (cliente). */
export type ResourceView = {
  slug: string;
  type: ResourceTypeT;
  title: string;
  description: string;
  fallback: boolean; // texto en español mostrado en la versión EN
  modules: number[];
  language: "es" | "en" | "es-en";
  format: string;
  sizeMB?: number;
  publisher?: string;
  published: string;
  year: number;
  external: boolean;
  href: string; // destino de "Ver" / "Descargar"
  featured: boolean;
};

const ICONS: Record<ResourceTypeT, typeof FileText> = {
  toolkit: Package,
  presentacion: Presentation,
  guia: BookOpen,
  infografia: ImageIcon,
  lectura: Newspaper,
  plantilla: FileText,
  informe: FileText,
  video: Play,
  "enlace-externo": ExternalLink,
};

const TONE: Record<ResourceTypeT, string> = {
  toolkit: "bg-[#f6e0e1] text-escudo-oscuro",
  presentacion: "bg-[#e3e7f1] text-tinta",
  guia: "bg-[#dcefe9] text-[#0b5246]",
  infografia: "bg-[#f7ecd2] text-[#6b4c0d]",
  lectura: "bg-piedra text-tinta",
  plantilla: "bg-[#e3e7f1] text-tinta",
  informe: "bg-[#f6e0e1] text-escudo-oscuro",
  video: "bg-tinta text-white",
  "enlace-externo": "bg-piedra text-tinta",
};

export function ResourceThumb({ type, label }: { type: ResourceTypeT; label: string }) {
  const Icon = ICONS[type];
  return (
    <div className={`relative flex aspect-[16/8] items-end justify-between overflow-hidden p-4 ${TONE[type]}`} aria-hidden>
      <div className="pattern-bg absolute inset-0 opacity-60" />
      <Icon size={44} strokeWidth={1.5} className="relative" />
      <span className="relative rounded-sm bg-white/90 px-2 py-0.5 text-[0.8125rem] font-semibold text-tinta">{label}</span>
    </div>
  );
}

export default function ResourceCard({ r }: { r: ResourceView }) {
  const t = useTranslations();
  const typeLabel = t(`resources.types.${r.type}`);
  const meta = [r.format, r.sizeMB ? `${r.sizeMB.toString().replace(".", t("common.decimal"))} MB` : null].filter(Boolean).join(" · ");
  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <ResourceThumb type={r.type} label={typeLabel} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="!text-[1.2rem] leading-tight">
          <Link href={{ pathname: "/recursos/[slug]", params: { slug: r.slug } }} className="!text-tinta no-underline after:absolute after:inset-0 hover:!text-escudo">
            {r.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-[0.9375rem] text-texto">{r.description}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {r.modules.map((m) => (
            <li key={m} className="chip">
              {t("resources.moduleShort", { n: m })}
            </li>
          ))}
          <li className="chip">{t(`resources.lang.${r.language}`)}</li>
          {r.fallback && <li className="chip chip-oro">{t("common.spanishOnly")}</li>}
        </ul>
        <p className="text-[0.8125rem] text-suave">
          {r.publisher ? `${r.publisher} · ` : ""}
          {meta}
        </p>
      </div>
      <div className="relative z-10 flex gap-2 border-t border-borde p-3">
        <a
          href={r.href}
          target={r.external ? "_blank" : undefined}
          rel={r.external ? "noopener noreferrer" : undefined}
          className="btn btn-primary btn-sm flex-1"
        >
          {r.external ? <ArrowUpRight size={18} aria-hidden /> : <Download size={18} aria-hidden />}
          {r.external ? t("resources.openSource") : t("resources.download")}
          {r.external && <span className="sr-only">{t("common.opensNew")}</span>}
        </a>
      </div>
    </article>
  );
}
