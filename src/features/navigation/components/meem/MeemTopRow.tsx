"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DeliveryModes from "@/features/fast-shipping/components/DeliveryModes";
import MeemSearchBar from "./MeemSearchBar";

interface MeemTopRowProps {
  settingsLogo?: string | null;
  siteName?: string;
}

/**
 * Screen top row: brand block, search field and the scheduled/NOW delivery
 * toggle (the old award-badge slot). Location, language, profile,
 * notifications and cart live in the categories row (see MeemHeaderActions).
 */
export default function MeemTopRow({ settingsLogo, siteName }: MeemTopRowProps) {
  const t = useTranslations("meemHeader");
  const brandName = siteName || "Meem Market Kuwait";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 pt-4 pb-0 lg:px-8">
      <div className="flex w-full items-center gap-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={brandName}>
          <Image
            src={settingsLogo || "/meem-logo.png"}
            alt={brandName}
            width={300}
            height={105}
            priority
            className="h-[105px] w-auto max-w-[300px] object-contain"
          />
        </Link>

        {/* Search */}
        <div className="relative mx-auto w-full min-w-0 flex-[0.9]">
          <MeemSearchBar placeholder={t("searchPlaceholder")} />
        </div>
      </div>

      {/* Delivery-mode toggle (scheduled vs NOW) */}
      <DeliveryModes className="shrink-0" />
    </div>
  );
}
