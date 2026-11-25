import ProductCard from "@/features/products/components/ProductCard";
import { getHoverImage } from "@/features/products/utils";
import { fromCategoryProduct, useListImpression } from "@/features/analytics";
import { useMemo } from "react";
import EmptyCategory from "./EmptyCategory";
import { ProductsGridSkeletonRow } from "./skeletons/ProductsGridSkeletonRow";
import type { CategoryProduct } from "../types";

interface CategoryProductsProps {
  products: CategoryProduct[];
  /** True while the next cursor page is loading (skeleton row shows). */
  isLoadingMore?: boolean;
  /** When true, card price numbers render as skeleton bars. */
  pricesLoading?: boolean;
  /** GA4 list context — `view_item_list` + `select_item` when set. */
  itemListId?: string;
  itemListName?: string;
}

/**
 * Category product grid — the canonical `ProductCard` used on every listing
 * surface (whole card links to the PDP; floating add / heart / stepper keep
 * working via the card's control layer). Mapping is
 * presentational only: the display price prefers the discounted/flash
 * price coming from the API, with the base price as the strike-through.
 */
export default function CategoryProducts({
  products,
  isLoadingMore = false,
  pricesLoading = false,
  itemListId,
  itemListName,
}: CategoryProductsProps) {
  // view_item_list — once per unique list content (Strict Mode-safe).
  const ga4Items = useMemo(
    () => products.map((product, index) => fromCategoryProduct(product, index)),
    [products],
  );
  useListImpression(ga4Items, itemListId ?? "category_products", itemListName);

  if (products.length === 0) {
    return <EmptyCategory />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {products.map((product) => {
          const displayPrice =
            product.price_after_flash_sale ??
            product.price_after_discount ??
            product.current_price;
          const basePrice = product.price ?? 0;

          return (
            <ProductCard
              key={product.id}
              item={{
                id: product.id,
                title: product.name,
                image: product.image?.thumbnail ?? "",
                hoverImage: getHoverImage(
                  product.image,
                  product.image?.thumbnail ?? "",
                ),
                price: displayPrice,
                originalPrice: basePrice,
                slug: product.slug,
                currency: product.currency,
                ratings: product.ratings,
                reviewsCount: product.ratings_count,
                brands: product.brands,
                stockQuantity: product.quantity ?? 0,
                isInStock: product.in_stock ?? (product.quantity ?? 0) > 0,
                hasVariants: product.has_variants,
                inWishlist: product.in_wishlist,
                flashSaleActive: product.flash_sale_active ?? false,
                tags: product.tags,
              }}
              itemListId={itemListId}
              itemListName={itemListName}
              pricesLoading={pricesLoading}
            />
          );
        })}
      </div>

      {isLoadingMore && <ProductsGridSkeletonRow />}
    </div>
  );
}
