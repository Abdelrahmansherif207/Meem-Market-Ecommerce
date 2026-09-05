"use client";

import { useTranslations } from "next-intl";
import Logo from "@/components/ui/Logo";

interface AuthHeaderProps {
  isLogin: boolean;
  isOtp?: boolean;
  onToggleMode?: () => void;
}

export function AuthHeader({ isLogin, isOtp }: AuthHeaderProps) {
  const t = useTranslations("auth");

  if (isOtp) {
    return (
      <>
        <h2 className="text-center text-2xl font-semibold text-text-primary sm:text-3xl">
          {t("verifyEmailHeading")}
        </h2>
        <p className="mt-1 text-center text-sm text-text-secondary">
          {t("verifyEmailDesc")}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-center">
        <Logo src="/catch-footer-logo.jpeg" alt="Catch Beauty" width={100} height={40} className="rounded-lg" />
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
