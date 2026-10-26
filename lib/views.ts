import "server-only";
import type { Locale } from "@/i18n/routing";
import type { ResourceView } from "@/components/ResourceCard";
import type { z } from "zod";
import type * as S from "./schema";
import { loc } from "./format";

type Resource = z.infer<typeof S.Resource>;

export function resourceHref(r: Resource): string {
  if (r.source.kind === "drive") return `https://drive.google.com/uc?export=download&id=${r.source.fileId}`;
  if (r.source.kind === "repo") return r.source.path;
  return r.source.href;
}

export function toResourceView(r: Resource, locale: Locale): ResourceView {
  const title = loc(r.title, locale);
  const description = loc(r.description, locale);
  return {
    slug: r.slug,
    type: r.type,
    title: title.text,
    description: description.text,
    fallback: title.fallback,
    modules: r.modules,
    language: r.language,
    format: r.format,
    sizeMB: r.sizeMB,
    publisher: r.publisher,
    published: r.published,
    year: Number(r.published.slice(0, 4)),
    external: r.source.kind === "url",
    href: resourceHref(r),
    featured: r.featured,
  };
}
