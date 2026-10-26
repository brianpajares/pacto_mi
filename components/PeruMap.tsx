import { useTranslations } from "next-intl";
import geo from "@/content/geo/peru.json";

type Props = {
  /** "hero": etiquetas, retícula y el arco animado · "mini": versión compacta sin adornos */
  variant?: "hero" | "mini";
  className?: string;
};

// El mapa base (departamentos + curvas de nivel) es un SVG estático en /public/maps: se cachea aparte y no
// engorda el HTML. Encima va un SVG ligero con las dos regiones activas y el arco (generado por scripts/build-map.mjs).
export default function PeruMap({ variant = "hero", className = "" }: Props) {
  const t = useTranslations();
  const [cx, cy] = geo.centroids.cajamarca;
  const [mx, my] = geo.centroids.madreDeDios;
  const hero = variant === "hero";

  const midX = (cx + mx) / 2;
  const midY = (cy + my) / 2 - 130;
  const arc = `M${cx},${cy} Q${midX},${midY} ${mx},${my}`;
  const arcLen = 560;

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${geo.w} / ${geo.h}` }} role="img" aria-label={t("map.alt")}>
      <img
        src={hero ? "/maps/peru-hero.svg" : "/maps/peru-mini.svg"}
        alt=""
        width={geo.w}
        height={geo.h}
        className="absolute inset-0 h-full w-full"
        fetchPriority={hero ? "high" : "low"}
        loading={hero ? "eager" : "lazy"}
        decoding="async"
      />
      <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        {hero && (
          <g stroke="#c9cfc3" strokeWidth="1">
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <line x1={i * 100} y1={0} x2={i * 100} y2={8} />
                <line x1={i * 100} y1={geo.h} x2={i * 100} y2={geo.h - 8} />
              </g>
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <line x1={0} y1={i * 100} x2={8} y2={i * 100} />
                <line x1={geo.w} y1={i * 100} x2={geo.w - 8} y2={i * 100} />
              </g>
            ))}
          </g>
        )}
        <path d={geo.highlight.cajamarca} fill="#a71920" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
        <path d={geo.highlight.madreDeDios} fill="#0f6b5c" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />

        {hero && (
          <>
            <path
              d={arc}
              className="arc-path"
              fill="none"
              stroke="#1e2a44"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={arcLen}
              style={{ ["--arc-len" as string]: arcLen }}
            />
            {(
              [
                [cx, cy, "#a71920"],
                [mx, my, "#0f6b5c"],
              ] as const
            ).map(([x, y, c], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={13} fill="#fff" className="arc-dot" />
                <circle cx={x} cy={y} r={7} fill={c} className="arc-dot" />
              </g>
            ))}
            <g fontFamily="var(--font-sans)" fontWeight={700} fontSize={17}>
              <g transform={`translate(${cx + 22},${cy - 30})`}>
                <rect x={-8} y={-18} width={112} height={50} rx={3} fill="#fff" stroke="#d5dacf" />
                <text x={0} y={2} fill="#a71920">
                  Cajamarca
                </text>
                <text x={0} y={22} fontSize={13} fontWeight={500} fill="#4a5663">
                  {t("map.andes")}
                </text>
              </g>
              <g transform={`translate(${mx - 168},${my + 74})`}>
                <rect x={-8} y={-18} width={146} height={50} rx={3} fill="#fff" stroke="#d5dacf" />
                <text x={0} y={2} fill="#0f6b5c">
                  Madre de Dios
                </text>
                <text x={0} y={22} fontSize={13} fontWeight={500} fill="#4a5663">
                  {t("map.amazon")}
                </text>
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
