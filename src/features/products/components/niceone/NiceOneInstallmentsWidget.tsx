"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

/**
 * Static "Want to pay in installments?" widget with Tabby / Tamara badges
 * (Stitch PDP screens). The backend has no BNPL integration, so this stays
 * a visual-only widget with the third-party brand colors; the buttons are
 * intentionally inert.
 */
export function NiceOneInstallmentsWidget() {
  const t = useTranslations("niceOnePdp");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-page-gray px-3 py-2.5 text-xs">
      <span className="font-medium text-text-secondary">{t("installmentsTitle")}</span>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-tight text-(--pdp-tabby-fg) bg-(--pdp-tabby-bg) border border-(--pdp-tabby-border)"
          title="Tabby — pay in 4 installments"
        >
          tabby
          <Info className="size-3 opacity-70" aria-hidden />
        </span>
        <span
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-tight text-(--pdp-tamara-fg) bg-(--pdp-tamara-bg) border border-(--pdp-tamara-border)"
          title="Tamara — pay in installments"
        >
          tamara
          <Info className="size-3 opacity-70" aria-hidden />
        </span>
      </div>
    </div>
  );
}
