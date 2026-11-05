import { getTranslations } from "next-intl/server";
import { BadgeCheck, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CurrencySwitcher } from "@/features/currencies";
import { LocationDisplay } from "@/features/location";

/**
 * Stitch top utility strip: charcoal band with deliver-to location,
 * authenticity claim, order/support links, currency & language switchers
 * and the download-app chip. All inner widgets are the existing functional
 * components (location sidebar, locale/currency switching) — only chrome.
 */
export default async function TopUtilityBar({
  currencyEnabled = false,
}: {
  currencyEnabled?: boolean;
}) {
  const t = await getTranslations("header.utility");

  return (
    <div className="w-full bg-[#121214] text-white">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between px-4 text-[11px] font-semibold">
        {/* Deliver to (real geolocation city) + authenticity claim */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="whitespace-nowrap">{t("deliverTo")}</span>
            <LocationDisplay />
          </div>
          <span className="hidden items-center gap-1.5 whitespace-nowrap text-white/80 xl:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-[#e0c298]" aria-hidden />
            {t("authenticity")}
          </span>
        </div>

        {/* Order/support links + existing switchers + app chip */}
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/profile"
            className="hidden items-center gap-1 whitespace-nowrap transition-colors hover:text-[#e0c298] md:inline-flex"
          >
            {t("trackOrder")}
          </Link>
          <Link
            href="/faq"
            className="hidden items-center gap-1 whitespace-nowrap transition-colors hover:text-[#e0c298] md:inline-flex"
          >
            {t("helpCenter")}
          </Link>
          {currencyEnabled && <CurrencySwitcher />}
          <LocaleSwitcher />
          <span className="hidden items-center gap-1.5 rounded-lg bg-white/10 px-2 py-0.5 transition-colors hover:bg-white/20 lg:inline-flex">
            <Smartphone className="h-3 w-3" aria-hidden />
            {t("downloadApp")}
          </span>
        </div>
      </div>
    </div>
  );
}
