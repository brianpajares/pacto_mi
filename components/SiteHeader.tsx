"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, Search } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import { LinkedinIcon } from "./icons";

const NAV = [
  { href: "/proyecto", key: "nav.project" },
  { href: "/formacion", key: "nav.training" },
  { href: "/ponencias", key: "nav.talks" },
  { href: "/actividades", key: "nav.activities" },
  { href: "/recursos", key: "nav.resources" },
  { href: "/red", key: "nav.network" },
  { href: "/impacto", key: "nav.impact" },
] as const;

export default function SiteHeader({ linkedin }: { linkedin?: string }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        openRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-borde bg-white">
      <div className="wrap flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label={t("nav.home")}>
          <img src="/logos/pacto-escudo.webp" width={36} height={40} alt="" className="h-10 w-auto" />
          <span className="display whitespace-nowrap text-[1.5rem] text-escudo sm:text-[1.65rem]">PACTO-MI</span>
        </Link>

        <nav aria-label={t("nav.main")} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center px-3 text-[0.95rem] font-semibold no-underline hover:text-escudo ${
                    isActive(n.href) ? "text-escudo" : "text-tinta"
                  }`}
                >
                  {t(n.key)}
                  {isActive(n.href) && <span className="absolute inset-x-3 bottom-1 h-0.5 bg-escudo" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/recursos"
            className="hidden min-h-11 min-w-11 items-center justify-center rounded text-tinta hover:text-escudo sm:inline-flex"
            aria-label={t("nav.search")}
          >
            <Search size={20} strokeWidth={1.75} aria-hidden />
          </Link>
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 min-w-11 items-center justify-center rounded text-tinta hover:text-escudo sm:inline-flex"
              aria-label={t("nav.linkedin")}
            >
              <LinkedinIcon size={20} />
            </a>
          )}
          <button
            ref={openRef}
            type="button"
            className="btn btn-secondary btn-sm xl:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} strokeWidth={1.75} aria-hidden />
            {t("nav.menu")}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.main")}
          className="on-dark fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-tinta text-white"
        >
          <div className="wrap flex h-16 shrink-0 items-center justify-between">
            <span className="display text-[1.65rem] text-white">PACTO-MI</span>
            <button ref={closeRef} type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
              <X size={20} strokeWidth={1.75} aria-hidden />
              {t("nav.close")}
            </button>
          </div>
          <div className="wrap flex flex-1 flex-col gap-8 pb-10 pt-4">
            <Link href="/recursos" className="field flex items-center gap-3 !border-white/40 !bg-white/10 !text-white no-underline">
              <Search size={20} aria-hidden />
              <span>{t("nav.searchPlaceholder")}</span>
            </Link>
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <li key={n.href} className="border-b border-white/15">
                  <Link href={n.href} className="flex min-h-14 items-baseline gap-4 py-3 text-white no-underline">
                    <span className="display w-8 text-base text-white/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display text-[2rem]">{t(n.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-4">
              <LocaleSwitcher dark />
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <LinkedinIcon size={18} /> LinkedIn
                </a>
              )}
              <Link href="/contacto" className="btn btn-secondary btn-sm">
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
