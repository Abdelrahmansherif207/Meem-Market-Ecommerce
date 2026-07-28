"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function MobileLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === "en" ? "ar" : "en";
  const label = locale === "en" ? "AR" : "EN";

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="self-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold transition-colors hover:bg-surface"
    >
      {label}
    </button>
  );
}
