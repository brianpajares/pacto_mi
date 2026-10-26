import { useTranslations } from "next-intl";

// R-100…R-103: franja de auspicio sobre blanco; sello de la Embajada y logo USPA con el mismo diámetro.
// Los logos no se estiran, recolorean ni se hacen transparentes: object-fit: contain, sin filtros ni opacity.
export function SponsorLogos({ size = 88 }: { size?: number }) {
  const t = useTranslations();
  const box = { width: size, height: size, background: "#fff" } as const;
  return (
    <div className="flex items-center gap-5" data-sponsor-logos>
      <div style={box} className="shrink-0">
        <img
          src="/logos/sello-embajada.webp"
          alt={t("sponsor.embassyAlt")}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "contain", background: "#fff" }}
          data-sponsor-logo="embassy"
        />
      </div>
      <div style={box} className="shrink-0">
        <img
          src="/logos/logo-uspa.webp"
          alt={t("sponsor.uspaAlt")}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "contain", background: "#fff" }}
          data-sponsor-logo="uspa"
        />
      </div>
    </div>
  );
}

export default function SponsorStrip() {
  const t = useTranslations();
  return (
    <section aria-label={t("sponsor.label")} className="border-t border-borde bg-white" data-sponsor-strip style={{ background: "#fff" }}>
      <div className="wrap flex flex-col items-start gap-6 py-8 md:flex-row md:items-center md:gap-10">
        <SponsorLogos />
        <p className="max-w-[60ch] text-[0.9375rem] leading-relaxed text-texto">{t("sponsor.text")}</p>
      </div>
    </section>
  );
}
