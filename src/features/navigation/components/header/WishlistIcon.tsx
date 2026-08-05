"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function WishlistIcon() {
  const t = useTranslations("header.mainNav");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <Link
      href="/wishlist"
      aria-label={t("wishlist")}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-primary)/0.1)] bg-transparent shadow-sm transition-opacity duration-200 hover:opacity-80 active:opacity-60"
      style={{
        borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
      }}
    >
      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
    </Link>
  );
}
