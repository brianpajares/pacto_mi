"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { LinkedinIcon } from "./icons";

// Los datos llegan ya depurados desde el servidor (R-41/R-42): sin correo, teléfono, distrito ni coordenadas exactas;
// las iniciales se calculan en el servidor y los líderes «ocultos» solo aportan al conteo del mapa.
export type LeaderItem = {
  id: string;
  name: string;
  org?: string;
  regionId: string;
  region: string;
  province: string;
  topics: string[];
  cohort: string;
  linkedin?: string;
  initialsOnly: boolean;
};
export type LeaderPoint = { regionId: string; province: string; x: number; y: number; topics: string[]; cohort: string };

export default function LeaderNetwork({
  items,
  points,
  email,
  viewBox,
  baseMap,
}: {
  items: LeaderItem[];
  points: LeaderPoint[];
  email: string;
  viewBox: { w: number; h: number };
  baseMap: ReactNode;
}) {
  const t = useTranslations();
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [topic, setTopic] = useState("");
  const [cohort, setCohort] = useState("");
  const [q, setQ] = useState("");

  const regions = useMemo(() => [...new Map(points.map((p) => [p.regionId, p.regionId])).values()], [points]);
  const provinces = useMemo(() => [...new Set(points.filter((p) => !region || p.regionId === region).map((p) => p.province))].sort(), [points, region]);
  const topics = useMemo(() => [...new Set(points.flatMap((p) => p.topics))].sort(), [points]);
  const cohorts = useMemo(() => [...new Set(points.map((p) => p.cohort))].sort(), [points]);

  const match = (x: { regionId: string; province: string; topics: string[]; cohort: string }) =>
    (!region || x.regionId === region) && (!province || x.province === province) && (!topic || x.topics.includes(topic)) && (!cohort || x.cohort === cohort);

  const shown = items.filter((i) => match(i) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));
  const bubbles = useMemo(() => {
    const m = new Map<string, { x: number; y: number; n: number; province: string }>();
    for (const p of points.filter(match)) {
      const key = `${p.regionId}|${p.province}`;
      const cur = m.get(key) ?? { x: p.x, y: p.y, n: 0, province: p.province };
      cur.n += 1;
      m.set(key, cur);
    }
    return [...m.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, region, province, topic, cohort]);

  const sel = (id: string, label: string, value: string, set: (v: string) => void, opts: string[]) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-tinta">
        {label}
      </label>
      <select id={id} className="field" value={value} onChange={(e) => set(e.target.value)}>
        <option value="">{t("network.all")}</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
        {sel("nr", t("network.region"), region, (v) => (setRegion(v), setProvince("")), regions)}
        {sel("np", t("network.province"), province, setProvince, provinces)}
        {sel("nt", t("network.topic"), topic, setTopic, topics)}
        {sel("nc", t("network.cohort"), cohort, setCohort, cohorts)}
        <div>
          <label htmlFor="nq" className="mb-1 block text-sm font-semibold text-tinta">
            {t("network.byName")}
          </label>
          <input id="nq" type="search" className="field" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[420px]">
            {baseMap}
            <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
              {bubbles.map((b) => (
                <g key={`${b.province}`}>
                  <circle cx={b.x} cy={b.y} r={9 + Math.sqrt(b.n) * 7} fill="#1e2a44" fillOpacity={0.88} stroke="#fff" strokeWidth={2} />
                  <text x={b.x} y={b.y + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
                    {b.n}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <p className="mt-3 text-sm text-suave">{t("network.mapNote")}</p>
        </div>

        <div className="lg:col-span-7">
          <p className="mb-3 text-[0.9375rem] font-semibold text-tinta" aria-live="polite">
            {t("network.count", { count: shown.length })}
          </p>
          <ul className="flex flex-col gap-3">
            {shown.map((l) => {
              const subject = encodeURIComponent(t("network.mailSubject", { id: l.id }));
              const body = encodeURIComponent(t("network.mailBody", { id: l.id }));
              return (
                <li key={l.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-tinta">{l.name}</p>
                    <p className="text-[0.9375rem] text-suave">
                      {l.province}, {l.region}
                      {l.org && !l.initialsOnly ? ` · ${l.org}` : ""} · {l.cohort}
                    </p>
                    {l.topics.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {l.topics.map((x) => (
                          <li key={x} className="chip">
                            {x}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {l.linkedin && (
                      <a href={l.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" aria-label={`LinkedIn — ${l.name}`}>
                        <LinkedinIcon size={16} />
                      </a>
                    )}
                    <a href={`mailto:${email}?subject=${subject}&body=${body}`} className="btn btn-secondary btn-sm">
                      <Mail size={16} aria-hidden /> {t("network.requestContact")}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
