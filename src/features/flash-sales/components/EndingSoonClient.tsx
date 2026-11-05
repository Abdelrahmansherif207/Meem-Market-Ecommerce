"use client";

import { useCallback } from "react";
import CatchProductCard from "@/features/home/redesign/CatchProductCard";
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <CatchProductCard
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
              flashSaleActive: product.flash_sale_active ?? true,
              ratings: product.ratings,
              tags: product.tags,
            }}
            pricesLoading={isRefreshing}
          />
        ))}
      </div>
    </section>
  );
}
