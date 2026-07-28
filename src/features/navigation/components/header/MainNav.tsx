"use client";

import { ShoppingCart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import Logo from "@/components/ui/Logo";
import { SearchAutocomplete } from "./SearchAutocomplete";
import Image from "next/image";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { useScrollState } from "@/features/navigation/hooks/useScrollState";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
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
  const tCommon = useTranslations("header.common");
  const tSearch = useTranslations("header.search");
  const authLabel = t("loginRegister");
  const openAuthModal = useAuthModalStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isScrolled = useScrollState();
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  const cartCount = isAuthenticated ? serverCartCount : guestCartCount;
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const otherLocale = locale === "en" ? "ar" : "en";
  const localeLabel = locale === "en" ? "AR" : "EN";

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6">
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Logo src={settingsLogo || "/meem-logo.png"} alt="Logo" priority />
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
        <button
          type="button"
          onClick={switchLocale}
          aria-label={tCommon("language")}
          className={cn(
            "inline-flex items-center justify-center rounded-md transition-all duration-300 hover:bg-surface text-sm font-semibold px-2 py-1",
            isScrolled && "opacity-0 invisible w-0 overflow-hidden",
          )}
        >
          <span>{localeLabel}</span>
        </button>

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
              className="inline-flex items-center text-sm font-semibold text-text-primary gap-1 transition hover:text-primary whitespace-nowrap"
            >
              <Image src="/icons/user.svg" width={25} height={25} alt="user icon" />
              <span className="hidden md:inline">{authLabel}</span>
              <span className="sr-only">{authLabel}</span>
            </button>
          )}
        </div>

        <Link
          href="/cart"
          className="relative inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-white shrink-0"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {mounted && cartCount > 0 && (
            <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary text-white font-bold px-1 text-xs">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
