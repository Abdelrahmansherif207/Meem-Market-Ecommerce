"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import type { CategoryMenuItem } from "@/features/categories/types";

interface CatchCategoriesPanelProps {
  variant: "desktop" | "mobile";
  /** The active (hovered/tapped) category whose subcategories render. */
  category?: CategoryMenuItem;
  /** Mobile only: the full category list rendered above the columns. */
  categories?: CategoryMenuItem[];
  /** Mobile only: tapping a list item selects it. */
  onSelectCategory?: (category: CategoryMenuItem) => void;
  onClose: () => void;
}

/**
 * Nice One-style categories panel.
 *
 * Desktop: hovering a category link in the nav row opens a full-width
 * dropdown with that category's subcategory columns ("All Products ›"
 * + parent groups with children). A promo zone on the right renders the
 * category's own image when available.
 *
 * Mobile: stacked — vertical category list on top, the tapped category's
 * subcategory columns below.
 */
export default function CatchCategoriesPanel({
  variant,
  category,
  categories,
  onSelectCategory,
  onClose,
}: CatchCategoriesPanelProps) {
  const t = useTranslations("catchHeader");
  const isDesktop = variant === "desktop";

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full z-50 border-t border-neutral-100 bg-white shadow-lg",
        !isDesktop && "max-h-[75dvh] overflow-y-auto",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px]",
          !isDesktop && "flex-col",
        )}
      >
        {isDesktop ? (
          <>
            {/* Subcategory columns for the hovered category */}
            <div className="flex-1 px-6 py-5">
              <div className="columns-1 gap-8 lg:columns-2 xl:columns-3">
                <div className="mb-4 break-inside-avoid">
                  <Link
                    href={`/category/${category?.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-[13px] font-bold text-neutral-900 transition-colors hover:text-primary"
                  >
                    {t("allProducts")}
                    <ChevronRight className="h-3 w-3 text-neutral-400 rtl:rotate-180" />
                  </Link>
                </div>

                {category?.children?.map((group) => (
                  <div key={group.id} className="mb-4 break-inside-avoid">
                    <Link
                      href={`/category/${group.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-1 text-[13px] font-bold text-neutral-900 transition-colors hover:text-primary"
                    >
                      {group.name}
                      <ChevronRight className="h-3 w-3 text-neutral-400 rtl:rotate-180" />
                    </Link>
                    {group.children?.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {group.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/category/${child.slug}`}
                              onClick={onClose}
                              className="text-[13px] text-neutral-500 transition-colors hover:text-primary"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promo zone — the category's own banner image */}
            {category?.image?.desktop ? (
              <div className="hidden w-[430px] shrink-0 p-4 lg:block">
                <Link href={`/category/${category.slug}`} onClick={onClose} className="block">
                  <Image
                    src={category.image.desktop}
                    alt={category.name}
                    width={800}
                    height={280}
                    className="h-auto w-full rounded-md object-cover"
                  />
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <>
            {/* Mobile: vertical category list */}
            <ul className="divide-y divide-neutral-100">
              {(categories ?? []).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory?.(cat)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-start text-[13px] transition-colors hover:bg-neutral-50",
                      category?.id === cat.id
                        ? "font-bold text-neutral-900"
                        : "font-medium text-neutral-700",
                    )}
                  >
                    {cat.image?.desktop && (
                      <Image
                        src={cat.image.desktop}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded object-cover"
                      />
                    )}
                    <span className="truncate">{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile: tapped category's subcategory columns */}
            {category ? (
              <div className="border-t border-neutral-100 p-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <Link
                      href={`/category/${category.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-1 text-[13px] font-bold text-neutral-900"
                    >
                      {t("allProducts")}
                      <ChevronRight className="h-3 w-3 text-neutral-400 rtl:rotate-180" />
                    </Link>
                  </div>
                  {category.children?.map((group) => (
                    <div key={group.id}>
                      <Link
                        href={`/category/${group.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-1 text-[13px] font-bold text-neutral-900"
                      >
                        {group.name}
                        <ChevronRight className="h-3 w-3 text-neutral-400 rtl:rotate-180" />
                      </Link>
                      {group.children?.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {group.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/category/${child.slug}`}
                                onClick={onClose}
                                className="text-[13px] text-neutral-500"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
