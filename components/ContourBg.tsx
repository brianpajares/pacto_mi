import pattern from "@/content/geo/pattern.json";

// Curvas de nivel decorativas como SVG en línea. En el primer pliegue se usa esto en lugar de background-image:
// un SVG en línea no es candidato de LCP y evita una petición extra.
export default function ContourBg({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox={`0 0 ${pattern.w} ${pattern.h}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d={pattern.d} fill="none" stroke="#D3D9CE" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  );
}
