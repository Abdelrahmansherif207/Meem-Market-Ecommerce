import { Zap } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import RibbonIcon from "./RibbonIcon";

interface AnnouncementTickerProps {
  locale: string;
}

/**
 * Stitch ribbon ticker (full-bleed rose strip directly under the header).
 * Pure marketing copy about Beauty Week — no API equivalent (static section).
 */
export default async function AnnouncementTicker({
  locale,
}: AnnouncementTickerProps) {
  const t = await getTranslations({ locale, namespace: "home.ticker" });

  return (
    <div
      className="w-full -mx-4 bg-[#ffd9dd] text-[#70343f] py-[8px] shadow-sm"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-[1280px] items-stretch justify-between px-5 font-[11px] font-semibold tracking-wide">
        <div className="flex items-center gap-2.5 sm:mx-auto">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d88b97] text-white">
            <RibbonIcon className="h-3 w-3" />
          </span>
          <span className="font-bold tracking-widest">{t("event")}</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">{t("offer")}</span>
          <span aria-hidden className="hidden sm:inline opacity-40">
            |
          </span>
          <span className="hidden bg-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm sm:inline">
            {t("code")}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 text-[#70343f]">
          <span className="flex items-center gap-1 text-[11px]">
            <Zap className="h-3.5 w-3.5 text-[#d88b97]" aria-hidden />
            {t("delivery")}
          </span>
          <span aria-hidden className="opacity-40">
            /
          </span>
          <Link
            href="/categories"
            className="font-semibold hover:underline underline-offset-2 whitespace-nowrap"
          >
            {t("explore")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
