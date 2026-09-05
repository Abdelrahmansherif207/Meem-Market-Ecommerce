"use client";

import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "../store/useAuthStore";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { UserMenu } from "./UserMenu";

export function MobileAuthButton() {
  const t = useTranslations("header.mainNav");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <button
      type="button"
      onClick={() => openAuthModal()}
      className="group inline-flex items-center justify-center rounded-full border border-border-light bg-surface p-1.5 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
      aria-label={t("loginRegister")}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
        <LogIn className="h-4 w-4 text-primary" />
      </div>
    </button>
  );
}
