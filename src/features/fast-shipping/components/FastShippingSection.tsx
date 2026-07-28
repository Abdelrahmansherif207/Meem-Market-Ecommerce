"use client";

import { useTranslations } from "next-intl";
import { Truck } from "lucide-react";
import { ProductCartItem } from "@/features/cart/components/ProductCartItem";
import type { HydratedCartItem } from "@/features/cart";

interface FastShippingSectionProps {
  items: HydratedCartItem[];
  pendingItemIds?: Set<number>;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function FastShippingSection({
  items,
  pendingItemIds,
  onUpdateQuantity,
  onRemove,
}: FastShippingSectionProps) {
  const t = useTranslations("cartPage");

  return (
    <div className="rounded-2xl border-2 border-border p-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-bold text-white">
          <Truck className="h-4 w-4" />
          {t("fastTitle")}
        </span>
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <ProductCartItem
              key={item.product_id + "fast"}
              item={item}
              isPending={pendingItemIds?.has(item.product_id) ?? false}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
