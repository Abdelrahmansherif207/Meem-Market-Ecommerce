"use client";

import { useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { getEndingSoonAction } from "../actions/flashSaleCurrencyActions";
import { useCurrencyRefetch } from "@/features/currencies";
import type { FlashSaleProduct } from "../types";

interface EndingSoonClientProps {
  products: FlashSaleProduct[];
  period: "today" | "week";
  locale: string;
}

export default function EndingSoonClient({ products: initialProducts, period, locale }: EndingSoonClientProps) {
  const title = period === "today" ? "Ending Today" : "Ending This Week";
  const fetchAction = useCallback(
    (currency: string) => getEndingSoonAction(period, locale, currency),
    [period, locale],
  );
  const { data: products, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialProducts,
    initialProducts[0]?.currency?.code,
  );

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
              currency={product.currency}
              discountPercent={discountPercent}
              slug={product.slug}
              hasVariants={product.has_variants}
              isInStock={product.in_stock ?? product.quantity > 0}
              flashSaleActive={product.flash_sale_active}
                inWishlist={product.in_wishlist}
                tags={product.tags}
                pricesLoading={isRefreshing}
          />
        );
      })}
      </div>
    </section>
  );
}
