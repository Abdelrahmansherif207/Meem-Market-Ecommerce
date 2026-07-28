"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { FastShippingSection } from "./FastShippingSection";
import { FastShippingSummary } from "./FastShippingSummary";
import { FastShippingCartContentSkeleton } from "./skeletons/FastShippingCartContentSkeleton";
import { calcSubtotal, calcTotalQuantity } from "@/features/cart/utils";
import type { HydratedCartItem } from "@/features/cart";

interface FastShippingCartContentProps {
  items: HydratedCartItem[];
  pendingItemIds?: Set<number>;
  isHydrating?: boolean;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function FastShippingCartContent({
  items,
  pendingItemIds,
  isHydrating = false,
  onUpdateQuantity,
  onRemove,
}: FastShippingCartContentProps) {
  const t = useTranslations("cartPage");

  const subtotal = calcSubtotal(
    items.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const quantity = calcTotalQuantity(items);

  if (isHydrating) {
    return <FastShippingCartContentSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-white">
          {t("fastTitle")}
        </span>
      </h3>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-gray-200" />
          <Link
            href="/"
            className="mt-4 rounded-xl bg-accent px-6 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {t("startShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <FastShippingSection
            items={items}
            pendingItemIds={pendingItemIds}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
          <FastShippingSummary
            subtotal={subtotal}
            quantity={quantity}
            checkoutEnabled={true}
          />
        </div>
      )}
    </div>
  );
}
