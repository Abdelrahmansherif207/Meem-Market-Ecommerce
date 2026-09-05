"use client";

import { ShoppingCart, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import Logo from "@/components/ui/Logo";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { WishlistIcon } from "./WishlistIcon";
import { NotificationBell } from "@/features/notifications";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { useScrollState } from "@/features/navigation/hooks/useScrollState";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import { cn } from "@/shared/utils/cn";
import { Link } from "@/i18n/navigation";
import { LocationDisplay } from "@/features/location";

export default function MainNav({ settingsLogo }: { settingsLogo?: string | null }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const t = useTranslations("header.mainNav");
  const tSearch = useTranslations("header.search");
  const authLabel = t("loginRegister");
  const openAuthModal = useAuthModalStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isScrolled = useScrollState();
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  const cartCount = isAuthenticated ? serverCartCount : guestCartCount;

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6">
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Logo src={settingsLogo || "/catch-logo.png"} alt="Logo" priority className="rounded-full" width={60} height={60} />
        <LocationDisplay />
      </div>

      <div className="flex justify-center">
        <SearchAutocomplete
          wrapperClassName={cn(
            "w-full transition-all duration-300",
            isScrolled ? "max-w-none" : "max-w-xl lg:max-w-3xl",
          )}
          inputClassName="border-primary-dark"
          prefixText={tSearch("mainPlaceholderPrefix")}
          highlightText={tSearch("mainPlaceholderHighlight")}
        />
      </div>

      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        <LocaleSwitcher
          className={isScrolled ? "opacity-0 invisible w-0 overflow-hidden" : undefined}
        />

        <div className={cn(
          "transition-all duration-300",
          isScrolled && "opacity-0 invisible w-0 overflow-hidden",
        )}>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="group inline-flex items-center gap-2 rounded-full border border-border-light bg-surface px-3 py-1.5 whitespace-nowrap transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="hidden text-xs font-medium text-text-primary transition-colors group-hover:text-primary md:inline">
                {authLabel}
              </span>
              <span className="sr-only">{authLabel}</span>
            </button>
          )}
        </div>

        <WishlistIcon />
        <NotificationBell />

       <Link
  href="/cart"
  aria-label="Cart"
  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/80 bg-primary text-white shadow-sm transition-opacity duration-200 hover:opacity-90 active:opacity-75"
>
  <ShoppingCart className="h-5 w-5" />

  {mounted && cartCount > 0 && (
    <span
      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background"
    >
      {cartCount}
    </span>
  )}
</Link>
      </div>
    </div>
  );
}
