"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, QrCode } from "lucide-react";
import { LinkedinIcon, WhatsappIcon } from "./icons";

// Enlace corto + QR en SVG (generado en el cliente) + compartir con URLs de intención, sin scripts de terceros.
export default function ShareTools({ shortPath, title }: { shortPath: string; title: string }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const full = () => `${window.location.origin}${shortPath}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(full());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(t("share.copyManual"), full());
    }
  }

  async function qr() {
    setBusy(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const svg = await QRCode.toString(full(), { type: "svg", margin: 2, color: { dark: "#1e2a44", light: "#ffffff" }, errorCorrectionLevel: "M" });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `pactomi-qr${shortPath.replace(/\//g, "-")}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy(false);
    }
  }

  const shareText = encodeURIComponent(`${title} — PACTO-MI`);
  return (
    <div className="card p-5">
      <h3 className="!text-xl">{t("share.title")}</h3>
      <p className="mt-2 text-[0.9375rem] text-suave">
        {t("share.shortLink")}: <code className="rounded-sm bg-piedra px-1.5 py-0.5 font-mono text-[0.9em] text-tinta">{shortPath}</code>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
          {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
          {copied ? t("share.copied") : t("share.copy")}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={qr} disabled={busy}>
          <QrCode size={18} aria-hidden /> {t("share.qr")}
        </button>
        <a
          className="btn btn-ghost btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.currentTarget.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(full() + "?utm_source=linkedin")}`;
          }}
          href="https://www.linkedin.com/"
        >
          <LinkedinIcon size={16} /> LinkedIn
          <span className="sr-only">{t("common.opensNew")}</span>
        </a>
        <a
          className="btn btn-ghost btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.currentTarget.href = `https://wa.me/?text=${shareText}%20${encodeURIComponent(full())}`;
          }}
          href="https://wa.me/"
        >
          <WhatsappIcon size={16} /> WhatsApp
          <span className="sr-only">{t("common.opensNew")}</span>
        </a>
      </div>
    </div>
  );
}
