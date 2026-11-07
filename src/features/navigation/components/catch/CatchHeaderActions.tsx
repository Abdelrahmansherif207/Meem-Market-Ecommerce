"use client";

import { useSyncExternalStore } from "react";
import { User, ChevronDown, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthModalStore, useAuthStore, UserMenu } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { CurrencySwitcher } from "@/features/currencies";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import { cn } from "@/shared/utils/cn";
import CatchLocaleSwitcher from "./CatchLocaleSwitcher";
import CatchLocationDisplay from "./CatchLocationDisplay";

interface CatchHeaderActionsProps {
  currencyEnabled?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Deliver-to, language, profile, notifications and cart actions.
 * Rendered inside the categories nav row so both groups share one
 * full-width line (space-between).
 *
 * `compact` is used by the sticky header: it drops the deliver-to and
 * currency controls so the row stays narrow.
 */
export default function CatchHeaderActions({
  currencyEnabled = false,
  className,
  compact = false,
}: CatchHeaderActionsProps) {
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
    <div
      className={cn(
        "flex items-center text-xs font-medium text-catch-charcoal",
        compact ? "gap-3 lg:gap-4" : "gap-4 lg:gap-5",
        className,
      )}
    >
      {!compact && <CatchLocationDisplay />}
      <CatchLocaleSwitcher />

      {!compact && currencyEnabled && (
        <div className="hidden lg:block">
          <CurrencySwitcher />
        </div>
      )}

      {/* Profile */}
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal()}
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-catch-primary"
        >
          <User className="h-4 w-4 text-catch-muted" />
          <span className="hidden md:inline">{t("profile")}</span>
          <ChevronDown className="hidden h-3 w-3 text-catch-muted-soft md:inline" />
        </button>
      )}

      <NotificationBell />

      {/* Cart */}
      <Link
        href="/cart"
        aria-label={t("cart")}
        className="relative transition-colors hover:text-catch-primary"
      >
        <ShoppingBag className="h-5 w-5 text-catch-muted" />
        {mounted && cartCount > 0 && (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-catch-ivory">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
