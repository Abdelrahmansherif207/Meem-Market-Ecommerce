import ProductCard from "@/components/ui/ProductCard";
import Pagination from "./Pagination";
import EmptyCategory from "./EmptyCategory";
import type { CategoryProduct, CategoryProductsResponse } from "../types";

interface CategoryProductsProps {
  products: CategoryProduct[];
  links?: CategoryProductsResponse["links"];
  /** When true, card price numbers render as skeleton bars. */
  pricesLoading?: boolean;
}

export default function CategoryProducts({
  products,
  links,
  pricesLoading = false,
}: CategoryProductsProps) {
  if (products.length === 0) {
    return <EmptyCategory />;
  }

  return (
    <div className="flex flex-col gap-6">
      {links && (
        <div className="text-sm text-text-secondary">
          Showing {links.from}–{links.to} of {links.total} products
        </div>
      )}

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

      {links && links.last_page > 1 && <Pagination links={links} />}
    </div>
  );
}
