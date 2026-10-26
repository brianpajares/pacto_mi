import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";

export const alt = "PACTO-MI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const data = (file: string) => `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/logos", file)).toString("base64")}`;

// R-121: fondo blanco, escudo PACTO-MI, título y franja inferior con auspicio (sello y USPA con el mismo diámetro).
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ height: 10, background: "#a71920", display: "flex" }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 72px", gap: 56 }}>
          <img src={data("pacto-escudo.png")} width={250} height={278} style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 124, fontWeight: 800, color: "#a71920", letterSpacing: -4, lineHeight: 1 }}>PACTO-MI</div>
            <div style={{ fontSize: 40, color: "#1e2a44", marginTop: 18, lineHeight: 1.2, maxWidth: 720 }}>{t("meta.ogTagline")}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "20px 72px", borderTop: "2px solid #d5dacf", background: "#ffffff" }}>
          <img src={data("sello-embajada.png")} width={96} height={96} style={{ objectFit: "contain", background: "#ffffff" }} />
          <img src={data("logo-uspa.png")} width={96} height={96} style={{ objectFit: "contain", background: "#ffffff" }} />
          <div style={{ fontSize: 24, color: "#1f2933", lineHeight: 1.3, maxWidth: 800 }}>{t("meta.ogSponsor")}</div>
        </div>
      </div>
    ),
    size,
  );
}

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}
