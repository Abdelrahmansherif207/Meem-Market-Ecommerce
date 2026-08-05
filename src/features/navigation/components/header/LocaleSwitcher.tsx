"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("header.common");

  const otherLocale = locale === "en" ? "ar" : "en";
  const localeLabel = locale === "en" ? "AR" : "EN";

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("language")}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-transparent p-2 text-sm font-semibold shadow-sm transition-opacity duration-200 hover:opacity-80 active:opacity-60 ${className ?? ""}`}
    >
      <span>{localeLabel}</span>
    </button>
  );
}
