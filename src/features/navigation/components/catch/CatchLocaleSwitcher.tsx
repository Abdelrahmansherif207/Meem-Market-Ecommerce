"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Screen-style language selector: globe icon + locale code + chevron.
 * Same switching logic as the existing LocaleSwitcher.
 */
export default function CatchLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("header.common");

  const otherLocale = locale === "en" ? "ar" : "en";

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("language")}
      className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black"
    >
      <Globe className="h-4 w-4 text-neutral-600" />
      <span>{locale.toUpperCase()}</span>
      <ChevronDown className="h-3 w-3 text-neutral-500" />
    </button>
  );
}
