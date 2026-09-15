import ProductCard from "@/components/ui/ProductCard";
import EmptyCategory from "./EmptyCategory";
import { ProductsGridSkeletonRow } from "./skeletons/ProductsGridSkeletonRow";
import type { CategoryProduct } from "../types";

interface CategoryProductsProps {
  products: CategoryProduct[];
  /** True while the next cursor page is loading (skeleton row shows). */
  isLoadingMore?: boolean;
  /** When true, card price numbers render as skeleton bars. */
  pricesLoading?: boolean;
}

export default function CategoryProducts({
  products,
  isLoadingMore = false,
  pricesLoading = false,
}: CategoryProductsProps) {
  if (products.length === 0) {
    return <EmptyCategory />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {products.map((product) => {
          const discountPercent =
            product.has_discount && product.discount_valid
              ? Math.round(
                  (1 - product.current_price / product.price) * 100,
                )
              : 0;

          return (
            <ProductCard
              key={product.id}
              productId={product.id}
              image={product.image.thumbnail}
              title={product.name}
              price={product.current_price}
              originalPrice={product.price}
              currency={product.currency}
              discountPercent={discountPercent}
              slug={product.slug}
              hasVariants={product.has_variants}
              isInStock={product.in_stock ?? product.quantity > 0}
              inWishlist={product.in_wishlist}
              tags={product.tags}
              pricesLoading={pricesLoading}
            />
          );
        })}
      </div>

      {isLoadingMore && <ProductsGridSkeletonRow />}
    </div>
  );
}
