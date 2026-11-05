"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { User, ChevronDown, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthModalStore, useAuthStore, UserMenu } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { CurrencySwitcher } from "@/features/currencies";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import CatchSearchBar from "./CatchSearchBar";
import CatchLocaleSwitcher from "./CatchLocaleSwitcher";
import CatchLocationDisplay from "./CatchLocationDisplay";

interface CatchTopRowProps {
  settingsLogo?: string | null;
  currencyEnabled?: boolean;
}

/**
 * Screen top row: brand block, search pill, right action bar
 * (award badge, deliver-to, language, profile, bell, bag).
 * All state (auth, cart count, notifications) comes from the existing stores.
 */
export default function CatchTopRow({ settingsLogo, currencyEnabled = false }: CatchTopRowProps) {
  const t = useTranslations("catchHeader");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const openAuthModal = useAuthModalStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  const cartCount = isAuthenticated ? serverCartCount : guestCartCount;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:gap-6 lg:px-8">
      {/* Brand */}
      <Link href="/" className="flex shrink-0 items-center" aria-label="Catch Beauty">
        <Image
          src={settingsLogo || "/catch-logo.png"}
          alt="Catch Beauty"
          width={170}
          height={59}
          priority
          className="h-[59px] w-[170px] object-contain"
        />
      </Link>

      {/* Search */}
      <div className="relative hidden max-w-2xl flex-1 sm:block">
        <CatchSearchBar placeholder={t("searchPlaceholder")} />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 text-xs font-medium text-neutral-700 lg:gap-5">
        {/* Site award badge — static */}
        <div className="hidden items-center gap-1.5 font-medium text-ink xl:flex">
          <Image src="/medal.svg" alt="" width={24} height={25} />
          <span className="whitespace-nowrap text-xs font-semibold">
            {t("awardBadge")}
          </span>
        </div>

        <CatchLocationDisplay />
        <CatchLocaleSwitcher />

        {/* Profile */}
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal()}
            className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black"
          >
            <User className="h-4 w-4 text-neutral-600" />
            <span className="hidden md:inline">{t("profile")}</span>
            <ChevronDown className="hidden h-3 w-3 text-neutral-500 md:inline" />
          </button>
        )}

        <NotificationBell />

        {currencyEnabled && (
          <div className="hidden lg:block">
            <CurrencySwitcher />
          </div>
        )}

        {/* Cart */}
        <Link
          href="/cart"
          aria-label={t("cart")}
          className="relative transition-colors hover:text-black"
        >
          <ShoppingBag className="h-5 w-5 text-neutral-600" />
          {mounted && cartCount > 0 && (
            <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
