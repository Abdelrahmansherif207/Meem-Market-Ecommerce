"use client";

import { useTranslations } from "next-intl";
import Logo from "@/components/ui/Logo";
import { DEFAULT_LOGO } from "@/features/settings/constants";

interface AuthHeaderProps {
  isLogin: boolean;
  onToggleMode?: () => void;
  logo?: string | null;
  siteName?: string;
}

export function AuthHeader({ isLogin, logo, siteName }: AuthHeaderProps) {
  const t = useTranslations("auth");

  return (
    <>
      <div className="mb-4 flex justify-center">
        <Logo src={logo || DEFAULT_LOGO} alt={siteName || "Catch Beauty"} width={100} height={40} className="rounded-lg" />
      </div>
      {!isLogin && (
        <h2 className="text-center text-2xl font-semibold text-text-primary sm:text-3xl">
          {t("createAccountHeading")}
        </h2>
      )}
      <p className="mt-1 text-center text-sm text-text-secondary">
        {isLogin ? t("loginSubtitle") : t("registerSubtitle")}
      </p>
    </>
  );
}
