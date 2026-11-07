"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import ProductCard from "./ProductCard";
import type { ProductTag, ProductBrand } from "@/shared/types";
import type { ProductCurrency } from "@/features/currencies";

export interface PaginatedProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  has_variants: boolean;
  quantity: number;
  in_stock?: boolean;
  ratings?: number;
  ratings_count?: number;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  discount_active?: boolean;
  flash_sale_active?: boolean;
  tags?: ProductTag[];
  brands?: ProductBrand[];
  in_wishlist?: boolean;
  currency?: ProductCurrency;
}

interface PaginatedProductGridProps {
  products: PaginatedProductItem[];
  itemsPerPage?: number;
  /** When true, card price numbers render as skeleton bars. */
  pricesLoading?: boolean;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

/**
 * Client-side paginated product grid used by banner/slider detail pages.
 * Product mapping and the card itself are shared with every other listing
 * surface, so behavior stays identical across pages.
 */
export default function PaginatedProductGrid({
  products,
  itemsPerPage = 12,
  pricesLoading = false,
}: PaginatedProductGridProps) {
  const t = useTranslations("catchHome");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            item={{
              id: product.id,
              title: product.name,
              image: product.image?.thumbnail ?? "",
              price: product.current_price,
              originalPrice: product.price,
              slug: product.slug,
              currency: product.currency,
              stockQuantity: product.quantity ?? 0,
              isInStock: product.in_stock ?? (product.quantity ?? 0) > 0,
              hasVariants: product.has_variants,
              inWishlist: product.in_wishlist,
              flashSaleActive: product.flash_sale_active ?? false,
              tags: product.tags,
              brands: product.brands,
              ratings: product.ratings,
              reviewsCount: product.ratings_count,
            }}
            pricesLoading={pricesLoading}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-6 flex select-none items-center justify-center gap-1"
          aria-label={t("pagination.label")}
        >
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>

          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-text-secondary"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  page === currentPage
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-primary hover:bg-surface",
                )}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={t("pagination.page", { page })}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t("pagination.next")}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
