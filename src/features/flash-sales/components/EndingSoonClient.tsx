"use client";

import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import type { FlashSaleProduct } from "../types";

interface EndingSoonClientProps {
  products: FlashSaleProduct[];
  period: "today" | "week";
  locale: string;
}

export default function EndingSoonClient({ products, period }: EndingSoonClientProps) {
  const title = period === "today" ? "Ending Today" : "Ending This Week";

  return (
    <section className="w-full" aria-label={title}>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const discountPercent =
            product.flash_sale_active && product.current_price < product.price
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
              flashSaleActive={product.flash_sale_active}
              inWishlist={product.in_wishlist}
              tags={product.tags}
            />
          );
        })}
      </div>
    </section>
  );
}
