// Genera el mapa del Perú en curvas de nivel (SVG estático) a partir del GeoJSON del INEI (simplificado).
// Uso: npm run build:map  → escribe content/geo/peru.json y public/patterns/contours.svg
// El resultado se versiona; el build del sitio no necesita d3 ni los GeoJSON.
import fs from "node:fs";
import path from "node:path";
import { geoMercator, geoPath, geoIdentity } from "d3-geo";
import { contours } from "d3-contour";

const root = path.resolve(import.meta.dirname, "..");
const dep = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/peru_departamental_simple.geojson"), "utf8"));
const prov = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/peru_provincial_simple.geojson"), "utf8"));

const W = 600;
const projection = geoMercator().fitExtent(
  [
    [14, 14],
    [W - 14, 800],
  ],
  dep,
);
const pather = geoPath(projection).digits(1);
const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(dep);
const H = Math.ceil(y1 + 14);

const titleCase = (s) =>
  s
    .toLowerCase()
    .split(" ")
    .map((w) => (["de", "del", "la", "los", "las", "y"].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

const departments = dep.features.map((f) => ({
  id: f.properties.FIRST_IDDP,
  name: titleCase(f.properties.NOMBDEP),
  d: pather(f),
}));

// centroide del polígono más grande de un departamento
function mainCentroid(id) {
  const f = dep.features.find((x) => x.properties.FIRST_IDDP === id);
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null;
  let bestArea = -1;
  for (const p of polys) {
    const feat = { type: "Feature", geometry: { type: "Polygon", coordinates: p } };
    const a = geoPath(projection).area(feat);
    if (a > bestArea) {
      bestArea = a;
      best = feat;
    }
  }
  const [cx, cy] = geoPath(projection).centroid(best);
  return [Math.round(cx * 10) / 10, Math.round(cy * 10) / 10];
}

// ---- ruido determinista
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const N = 256;
  const g = Array.from({ length: N * N }, () => rnd());
  const smooth = (t) => t * t * (3 - 2 * t);
  const at = (x, y) => g[((y & 255) * N + (x & 255)) & (N * N - 1)];
  const value = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi) * (1 - tx) + at(xi + 1, yi) * tx;
    const b = at(xi, yi + 1) * (1 - tx) + at(xi + 1, yi + 1) * tx;
    return a * (1 - ty) + b * ty;
  };
  return (x, y) => {
    let amp = 0.5;
    let f = 1;
    let sum = 0;
    for (let o = 0; o < 4; o++) {
      sum += amp * value(x * f, y * f);
      amp *= 0.5;
      f *= 2.1;
    }
    return sum / 0.9375;
  };
}

// eje de la cordillera andina (lon, lat)
const axis = [
  [-79.2, -4.6],
  [-78.4, -6.8],
  [-77.2, -9.0],
  [-75.6, -11.4],
  [-73.4, -13.6],
  [-71.4, -14.9],
  [-69.6, -16.4],
];
function distToAxis(lon, lat) {
  let best = Infinity;
  for (let i = 0; i < axis.length - 1; i++) {
    const [ax, ay] = axis[i];
    const [bx, by] = axis[i + 1];
    const vx = bx - ax;
    const vy = by - ay;
    const t = Math.max(0, Math.min(1, ((lon - ax) * vx + (lat - ay) * vy) / (vx * vx + vy * vy)));
    const px = ax + t * vx;
    const py = ay + t * vy;
    best = Math.min(best, Math.hypot(lon - px, lat - py));
  }
  return best;
}

function buildField(seed, step, w, h, geographic) {
  const noise = makeNoise(seed);
  const cols = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / step) + 1;
  const values = new Float64Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const px = i * step;
      const py = j * step;
      let v;
      if (geographic) {
        const [lon, lat] = projection.invert([px, py]);
        const d = distToAxis(lon, lat);
        const ridge = Math.exp(-Math.pow(d / 1.5, 2));
        const east = lon > -75 ? Math.min(1, (lon + 75) / 5) : 0;
        v = 0.78 * ridge + 0.34 * noise(px / 70, py / 70) + 0.12 * noise(px / 22 + 40, py / 22) - 0.1 * east;
      } else {
        v = noise(px / 160, py / 160) * 0.8 + 0.2 * noise(px / 50 + 9, py / 50);
      }
      values[j * cols + i] = v;
    }
  }
  return { values, cols, rows };
}

function contourPath(field, step, thresholds) {
  const gen = contours().size([field.cols, field.rows]).thresholds(thresholds);
  const out = gen(Array.from(field.values));
  const p = geoPath(geoIdentity().scale(step)).digits(0);
  return out
    .map((c) => p(c))
    .filter(Boolean)
    .join("");
}

// ---- mapa del Perú
const step = 6;
const field = buildField(7, step, W, H, true);
const levels = Array.from({ length: 16 }, (_, i) => 0.1 + i * 0.058);
const peruContours = contourPath(field, step, levels);

const centroids = {
  cajamarca: mainCentroid("06"),
  madreDeDios: mainCentroid("17"),
};

const provinces = prov.features.map((f) => {
  const [cx, cy] = geoPath(projection).centroid(f);
  return {
    id: f.properties.FIRST_IDPR,
    name: titleCase(f.properties.NOMBPROV),
    dep: f.properties.FIRST_IDPR.slice(0, 2),
    x: Math.round(cx * 10) / 10,
    y: Math.round(cy * 10) / 10,
  };
});

const out = { w: W, h: H, departments, contours: peruContours, centroids };
fs.mkdirSync(path.join(root, "content/geo"), { recursive: true });
fs.writeFileSync(path.join(root, "content/geo/provinces.json"), JSON.stringify(provinces));
fs.mkdirSync(path.join(root, "content/geo"), { recursive: true });
fs.writeFileSync(path.join(root, "content/geo/peru.json"), JSON.stringify(out));
console.log("peru.json", (JSON.stringify(out).length / 1024).toFixed(1), "KB (contours", (peruContours.length / 1024).toFixed(1), "KB)", { W, H });

// ---- patrón de fondo (no geográfico), para secciones
const PW = 1200;
const PH = 640;
const pstep = 12;
const pf = buildField(21, pstep, PW, PH, false);
const pth = Array.from({ length: 9 }, (_, i) => 0.18 + i * 0.07);
const pd = contourPath(pf, pstep, pth);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" preserveAspectRatio="xMidYMid slice"><path d="${pd}" fill="none" stroke="#D3D9CE" stroke-width="1" stroke-linejoin="round"/></svg>`;
fs.mkdirSync(path.join(root, "public/patterns"), { recursive: true });
fs.writeFileSync(path.join(root, "public/patterns/contours.svg"), svg);
console.log("contours.svg", (svg.length / 1024).toFixed(1), "KB");

// ---- activos estáticos del mapa (no viajan dentro del HTML ni del payload RSC; se cachean aparte)
const coarse = geoPath(projection).digits(0);
const deptPaths = dep.features.map((f) => coarse(f));
const mapSvg = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}"><defs>` +
  deptPaths.map((d, i) => `<path id="d${i}" d="${d}"/>`).join("") +
  `<clipPath id="c">` + deptPaths.map((_, i) => `<use xlink:href="#d${i}"/>`).join("") + `</clipPath></defs>` +
  `<g fill="${fill}" stroke="#fff" stroke-width=".9" stroke-linejoin="round">` + deptPaths.map((_, i) => `<use xlink:href="#d${i}"/>`).join("") + `</g>` +
  `<g clip-path="url(#c)"><path d="${peruContours}" fill="none" stroke="#7c8a74" stroke-opacity=".5" stroke-width=".7" stroke-linejoin="round"/></g></svg>`;
fs.mkdirSync(path.join(root, "public/maps"), { recursive: true });
fs.writeFileSync(path.join(root, "public/maps/peru-hero.svg"), mapSvg("#e9ece6"));
fs.writeFileSync(path.join(root, "public/maps/peru-mini.svg"), mapSvg("#d2d8cb"));
const slim = {
  w: W,
  h: H,
  centroids,
  highlight: {
    cajamarca: departments.find((d) => d.id === "06").d,
    madreDeDios: departments.find((d) => d.id === "17").d,
  },
};
fs.writeFileSync(path.join(root, "content/geo/peru.json"), JSON.stringify(slim));
console.log("peru.json (slim)", (JSON.stringify(slim).length / 1024).toFixed(1), "KB · maps", (mapSvg("#fff").length / 1024).toFixed(1), "KB");
