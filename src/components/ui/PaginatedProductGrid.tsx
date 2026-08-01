"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import ProductCard from "./ProductCard";
import type { ProductTag } from "@/shared/types";

export interface PaginatedProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  has_variants: boolean;
  quantity: number;
  in_stock?: boolean;
  is_fast_shipping_available: boolean;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  discount_active?: boolean;
  flash_sale_active?: boolean;
  tags?: ProductTag[];
}

interface PaginatedProductGridProps {
  products: PaginatedProductItem[];
  itemsPerPage?: number;
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

export default function PaginatedProductGrid({
  products,
  itemsPerPage = 12,
}: PaginatedProductGridProps) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        {visibleProducts.map((product) => {
          const discountPercent =
            product.discount_active && product.current_price < product.price
              ? Math.round((1 - product.current_price / product.price) * 100)
              : 0;
          return (
            <ProductCard
              key={product.id}
              productId={product.id}
              image={product.image.thumbnail}
              title={product.name}
              price={product.current_price}
              originalPrice={product.price}
              discountPercent={discountPercent}
              slug={product.slug}
              hasVariants={product.has_variants}
              deliveryType={product.is_fast_shipping_available ? "fast" : "scheduled"}
              isInStock={product.in_stock ?? product.quantity > 0}
              tags={product.tags}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-1 mt-6 select-none"
          aria-label="Product pagination"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span key={`ellipsis-${i}`} className="flex items-center justify-center w-9 h-9 text-sm text-text-secondary">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                  page === currentPage
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-primary hover:bg-surface",
                )}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
