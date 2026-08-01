import ProductCard from "@/components/ui/ProductCard";
import Pagination from "./Pagination";
import type { CategoryProduct, CategoryProductsResponse } from "../types";

interface CategoryProductsProps {
  products: CategoryProduct[];
  links?: CategoryProductsResponse["links"];
}

export default function CategoryProducts({
  products,
  links,
}: CategoryProductsProps) {
  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No products found in this category.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {links && (
        <div className="text-sm text-text-secondary">
          Showing {links.from}–{links.to} of {links.total} products
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
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

      {links && links.last_page > 1 && <Pagination links={links} />}
    </div>
  );
}
