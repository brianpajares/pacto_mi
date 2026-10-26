"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

// R-30/R-31: el iframe de YouTube no existe hasta pulsar «Reproducir»; dominio youtube-nocookie.com, sin autoplay previo.
export default function LiteVideo({ youtubeId, title }: { youtubeId: string; title: string }) {
  const t = useTranslations();
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-tinta">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 grid place-items-center" aria-label={`${t("video.play")}: ${title}`}>
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-escudo text-white shadow-lg transition group-hover:scale-105">
            <Play size={28} fill="currentColor" aria-hidden />
          </span>
          <span className="absolute bottom-3 left-3 rounded-sm bg-white px-2 py-1 text-sm font-bold text-tinta">{t("video.play")}</span>
        </button>
      )}
    </div>
  );
}
