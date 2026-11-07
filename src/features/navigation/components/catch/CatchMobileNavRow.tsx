"use client";

import { useState } from "react";
import { useSyncExternalStore } from "react";
import { Bell, ChevronDown, Globe, Menu, ShoppingBag, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuthModalStore, useAuthStore } from "@/features/auth";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";
import type { CategoryMenuItem } from "@/features/categories/types";
import CatchCategoriesPanel from "./CatchCategoriesPanel";

interface CatchMobileNavRowProps {
  categoriesLabel: string;
  categories: CategoryMenuItem[];
}

/**
 * Mobile header action row (mobile screen spec): "Categories" pill on the
 * start side (taps open the mega panel) and language / profile /
 * notifications / cart icons on the end side. Navigation itself stays in
 * the bottom bar.
 */
export default function CatchMobileNavRow({
  categoriesLabel,
  categories,
}: CatchMobileNavRowProps) {
  const t = useTranslations("catchHeader");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const openAuthModal = useAuthModalStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  const cartCount = isAuthenticated ? serverCartCount : guestCartCount;

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0] ?? null;

  const switchLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: next });
  };

  const handleProfile = () => {
    if (isAuthenticated) router.push("/profile");
    else openAuthModal();
  };

  return (
    <div className="relative border-b border-catch-border bg-catch-ivory">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Categories pill */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((v) => !v)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-catch-charcoal transition-colors",
            panelOpen && "text-primary",
          )}
        >
          <Menu className="h-4 w-4" />
          {categoriesLabel}
          <ChevronDown
            className={cn("h-3.5 w-3.5 text-catch-muted-soft transition-transform", panelOpen && "rotate-180")}
          />
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-catch-charcoal">
          <button
            type="button"
            onClick={switchLocale}
            aria-label={t("language")}
            className="flex cursor-pointer items-center gap-0.5"
          >
            <Globe className="h-[18px] w-[18px]" />
            <ChevronDown className="h-3 w-3 text-catch-muted-soft" />
          </button>

          <button
            type="button"
            onClick={handleProfile}
            aria-label={t("profile")}
            className="flex cursor-pointer items-center gap-0.5"
          >
            <User className="h-[18px] w-[18px]" />
            <ChevronDown className="h-3 w-3 text-catch-muted-soft" />
          </button>

          <Link href="/notifications" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
          </Link>

          <Link href="/cart" aria-label={t("cart")} className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {mounted && cartCount > 0 && (
              <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Categories mega panel (mobile) */}
      {panelOpen && categories.length > 0 && (
        <>
          {/* Click-away layer */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <CatchCategoriesPanel
            variant="mobile"
            category={activeCategory ?? undefined}
            categories={categories}
            onSelectCategory={(cat) => setActiveCategoryId(cat.id)}
            onClose={() => setPanelOpen(false)}
          />
        </>
      )}
    </div>
  );
}
