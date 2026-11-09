"use client";

import Image from "next/image";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { DEFAULT_LOGO } from "@/features/settings/constants";
import { useScrollState } from "../../hooks/useScrollState";
import CatchHeaderActions from "./CatchHeaderActions";
import CatchSearchBar from "./CatchSearchBar";

const STICKY_SCROLL_THRESHOLD = 170;

interface CatchStickyHeaderProps {
  settingsLogo?: string | null;
  siteName?: string;
}

/**
 * Compact fixed header that slides in once the full header scrolls away.
 * Desktop is a single 64px row; mobile uses two rows so the search field
 * and its autocomplete dropdown keep enough width. Brands only exists here.
 */
export default function CatchStickyHeader({
  settingsLogo,
  siteName,
}: CatchStickyHeaderProps) {
  const t = useTranslations("catchHeader");
  const pathname = usePathname();
  const isVisible = useScrollState(STICKY_SCROLL_THRESHOLD);
  const brandName = siteName || "Catch Beauty";
  const hasCustomLogo = Boolean(settingsLogo && settingsLogo !== DEFAULT_LOGO);

  const categoriesActive = pathname.startsWith("/categories");
  const brandsActive = pathname.startsWith("/brands");

  const navLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-md px-2 py-2 transition-colors hover:text-catch-primary",
      active ? "text-catch-primary" : "text-catch-charcoal",
    );

  return (
    <header
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-catch-border bg-catch-ivory transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
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
              <span
                className={cn(
                  "relative block h-8 w-[29px] overflow-hidden transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none lg:h-9 lg:w-[33px]",
                  isVisible
                    ? "translate-y-0 opacity-100 delay-[40ms]"
                    : "-translate-y-0.5 opacity-0",
                )}
              >
                <Image
                  src="/catch-sticky-logo.jpg"
                  alt=""
                  width={976}
                  height={1084}
                  loading="eager"
                  sizes="80px"
                  className="absolute -left-[20px] -top-[7px] h-[77px] w-auto max-w-none object-contain mix-blend-multiply lg:-left-[22px] lg:-top-[8px] lg:h-[87px]"
                />
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex">
            <Link href="/categories" className={navLinkClass(categoriesActive)}>
              <LayoutGrid className="h-4 w-4" />
              {t("categories")}
              <ChevronDown className="h-3 w-3 text-catch-muted-soft" />
            </Link>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-catch-border" />
            <Link href="/brands" className={navLinkClass(brandsActive)}>
              {t("brands")}
            </Link>
          </nav>

          <div className="mx-auto min-w-0 max-w-[560px] flex-1">
            <CatchSearchBar placeholder={t("searchPlaceholder")} compact />
          </div>

          <CatchHeaderActions compact className="hidden shrink-0 lg:flex" />
        </div>

        <div className="flex h-10 items-center justify-between gap-3 border-t border-catch-border/70 lg:hidden">
          <nav className="flex items-center gap-1 text-[12px] font-semibold">
            <Link href="/categories" className={navLinkClass(categoriesActive)}>
              <LayoutGrid className="h-4 w-4" />
              {t("categories")}
            </Link>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-catch-border" />
            <Link href="/brands" className={navLinkClass(brandsActive)}>
              {t("brands")}
            </Link>
          </nav>

          <CatchHeaderActions compact className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
