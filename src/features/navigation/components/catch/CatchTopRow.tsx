"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CatchSearchBar from "./CatchSearchBar";

interface CatchTopRowProps {
  settingsLogo?: string | null;
  siteName?: string;
}

/**
 * Screen top row: brand block, search field and the static award badge.
 * Location, language, profile, notifications and cart live in the
 * categories row (see CatchHeaderActions).
 */
export default function CatchTopRow({ settingsLogo, siteName }: CatchTopRowProps) {
  const t = useTranslations("catchHeader");
  const brandName = siteName || "Catch Beauty";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 pt-4 pb-0 lg:px-8">
      <div className="flex w-full items-center gap-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={brandName}>
          <Image
            src={settingsLogo || "/catch-logo.png"}
            alt={brandName}
            width={300}
            height={105}
            priority
            className="h-[105px] w-auto max-w-[300px] object-contain"
          />
        </Link>

        {/* Search */}
        <div className="relative mx-auto w-full min-w-0 flex-[0.9]">
          <CatchSearchBar placeholder={t("searchPlaceholder")} />
        </div>
      </div>

      {/* Site award badge — static */}
      <div className="flex shrink-0 items-center gap-2 font-medium text-ink">
        <Image src="/medal.svg" alt="" width={26} height={27} />
        <span className="whitespace-nowrap text-[18px]">
          {t("awardBadge")}
        </span>
      </div>
    </div>
  );
}
