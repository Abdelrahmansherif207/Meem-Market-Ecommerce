"use client";

import { useSyncExternalStore } from "react";
import { User, ChevronDown, Heart, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthModalStore, useAuthStore, UserMenu } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { CurrencySwitcher } from "@/features/currencies";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { cn } from "@/shared/utils/cn";
import MeemLocaleSwitcher from "./MeemLocaleSwitcher";
import MeemLocationDisplay from "./MeemLocationDisplay";

interface MeemHeaderActionsProps {
  className?: string;
  compact?: boolean;
}

/**
 * Deliver-to, language, profile, notifications, wishlist and cart actions.
 * Rendered inside the categories nav row so both groups share one
 * full-width line (space-between).
 *
 * `compact` is used by the sticky header: it drops the deliver-to and
 * currency controls so the row stays narrow.
 */
export default function MeemHeaderActions({
  className,
  compact = false,
}: MeemHeaderActionsProps) {
  const t = useTranslations("meemHeader");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const openAuthModal = useAuthModalStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  // With the guest server cart enabled, the shared server counter is the only
  // source of truth for anonymous badges too.
  const cartCount =
    isAuthenticated || isGuestCheckoutEnabled()
      ? serverCartCount
      : guestCartCount;
  const wishlistCount = useWishlistStore((s) => s.count);

  return (
    <div
      className={cn(
        "flex items-center text-xs font-medium text-meem-charcoal",
        compact ? "gap-3 lg:gap-4" : "gap-4 lg:gap-5",
        className,
      )}
    >
      {!compact && <MeemLocationDisplay />}
      <MeemLocaleSwitcher />

      {!compact && <CurrencySwitcher className="hidden lg:inline-flex" />}

      {/* Profile */}
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal()}
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-meem-primary"
        >
          <User className="h-4 w-4 text-meem-muted" />
          <span className="hidden md:inline">{t("profile")}</span>
          <ChevronDown className="hidden h-3 w-3 text-meem-muted-soft md:inline" />
        </button>
      )}

      <NotificationBell />

      {/* Wishlist */}
      <Link
        href="/wishlist"
        aria-label={t("wishlist")}
        className="relative transition-colors hover:text-meem-primary"
      >
        <Heart className="h-5 w-5 text-meem-muted" />
        {mounted && isAuthenticated && wishlistCount > 0 && (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        aria-label={t("cart")}
        className="relative transition-colors hover:text-meem-primary"
      >
        <ShoppingBag className="h-5 w-5 text-meem-muted" />
        {mounted && cartCount > 0 && (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
