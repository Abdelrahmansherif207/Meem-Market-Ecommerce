"use client";

import Image from "next/image";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { DEFAULT_LOGO } from "@/features/settings/constants";
import { useScrollState } from "../../hooks/useScrollState";
import MeemHeaderActions from "./MeemHeaderActions";
import MeemSearchBar from "./MeemSearchBar";

const STICKY_SCROLL_THRESHOLD = 170;

interface MeemStickyHeaderProps {
  settingsLogo?: string | null;
  siteName?: string;
}

/**
 * Compact fixed header that slides in once the full header scrolls away.
 * Desktop is a single 64px row; mobile uses two rows so the search field
 * and its autocomplete dropdown keep enough width. Brands only exists here.
 */
export default function MeemStickyHeader({
  settingsLogo,
  siteName,
}: MeemStickyHeaderProps) {
  const t = useTranslations("meemHeader");
  const pathname = usePathname();
  const isVisible = useScrollState(STICKY_SCROLL_THRESHOLD);
  const brandName = siteName || "Meem Market Riyadh";
  const hasCustomLogo = Boolean(settingsLogo && settingsLogo !== DEFAULT_LOGO);

  const categoriesActive = pathname.startsWith("/categories");
  const brandsActive = pathname.startsWith("/brands");

  const navLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-md px-2 py-2 transition-colors hover:text-meem-primary",
      active ? "text-meem-primary" : "text-meem-charcoal",
    );

  return (
    <header
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-meem-border bg-background transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        isVisible ? "translate-y-0" : "pointer-events-none -translate-y-full",
      )}
    >
      <div className="mx-auto w-full max-w-[1440px] px-3 lg:px-8">
        <div className="flex h-12 items-center gap-3 lg:h-16 lg:gap-5">
          <Link href="/" aria-label={brandName} className="flex shrink-0 items-center">
            {hasCustomLogo ? (
              <Image
                src={settingsLogo as string}
                alt=""
                width={300}
                height={80}
                loading="eager"
                sizes="140px"
                className="h-8 w-auto max-w-[130px] object-contain lg:h-9"
              />
            ) : (
              <Image
                src="/meem-logo.png"
                alt=""
                width={550}
                height={239}
                loading="eager"
                sizes="130px"
                className="h-8 w-auto max-w-[130px] object-contain transition-opacity duration-150 ease-out motion-reduce:transition-none lg:h-9"
              />
            )}
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex">
            <Link href="/categories" className={navLinkClass(categoriesActive)}>
              <LayoutGrid className="h-4 w-4" />
              {t("categories")}
              <ChevronDown className="h-3 w-3 text-meem-muted-soft" />
            </Link>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-meem-border" />
            <Link href="/brands" className={navLinkClass(brandsActive)}>
              {t("brands")}
            </Link>
          </nav>

          <div className="mx-auto min-w-0 max-w-[560px] flex-1">
            <MeemSearchBar placeholder={t("searchPlaceholder")} compact />
          </div>

          <MeemHeaderActions compact className="hidden shrink-0 lg:flex" />
        </div>

        <div className="flex h-10 items-center justify-between gap-3 border-t border-meem-border/70 lg:hidden">
          <nav className="flex items-center gap-1 text-[12px] font-semibold">
            <Link href="/categories" className={navLinkClass(categoriesActive)}>
              <LayoutGrid className="h-4 w-4" />
              {t("categories")}
            </Link>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-meem-border" />
            <Link href="/brands" className={navLinkClass(brandsActive)}>
              {t("brands")}
            </Link>
          </nav>

          <MeemHeaderActions compact className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
