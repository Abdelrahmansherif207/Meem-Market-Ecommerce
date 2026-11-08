"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Car, Truck, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth";
import { useDisplayCurrency } from "@/features/currencies";
import type { CartLineIdentity, HydratedCartItem } from "../types";
import { getCartLineKey } from "../types";
import { ProductCartItem } from "./ProductCartItem";
import { calcSubtotal, canCheckout } from "../utils";

interface CartSectionProps {
  items: HydratedCartItem[];
  pendingItemIds?: Set<string>;
  onUpdateQuantity: (productId: number, quantity: number, line: CartLineIdentity) => void;
  onRemove: (productId: number, line: CartLineIdentity) => void;
  minimumOrderAmount: number;
  /** Optional slot rendered at the bottom of the section (e.g. My Coupons). */
  couponSlot?: ReactNode;
}

export function CartSection({
  items,
  pendingItemIds,
  onUpdateQuantity,
  onRemove,
  minimumOrderAmount,
  couponSlot,
}: CartSectionProps) {
  const t = useTranslations("cartPage");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Display currency comes from the backend (settings + currencies list).
  const displayCurrency = useDisplayCurrency();
  const minimumText = formatMoney(minimumOrderAmount, "en", {
    symbol: displayCurrency.symbol,
    decimalPlaces: displayCurrency.decimalPlaces,
  });

  const subtotal = calcSubtotal(
    items.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );

  const checkoutEnabled = canCheckout(subtotal, minimumOrderAmount);

  const badgeColor = "bg-primary text-white";
  const DeliveryIcon = Car;
  const title = t("scheduledTitle");
  const eta = t("scheduledEta");

  if (items.length === 0) return null;

  const checkoutHref = isAuthenticated
    ? "/payment"
    : `/auth?redirect=/payment`;

  return (
    <div className="rounded-2xl border-2 border-border p-4 sm:p-6 lg:p-10 space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", badgeColor)}>
          <DeliveryIcon className="h-4 w-4" />
          {title}
        </span>
        <span className="text-sm text-text-secondary">{eta}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Truck className="h-4 w-4 shrink-0 text-primary" />
        <span>{t("freeShippingNote")}</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <ProductCartItem
            key={getCartLineKey(item.product_id, {
              productVariantId: item.product_variant_id ?? null,
            })}
            item={item}
            isPending={pendingItemIds?.has(
              getCartLineKey(item.product_id, {
                productVariantId: item.product_variant_id ?? null,
              }),
            ) ?? false}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      {couponSlot && <div className="border-t border-border pt-4">{couponSlot}</div>}

      <Button
        size="lg"
        full
        variant="primary"
        disabled={!checkoutEnabled}
        onClick={() => router.push(checkoutHref)}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        {t("checkout")}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Button>

      {!checkoutEnabled && (
        <p className="text-center text-[11px] text-text-secondary">
          {t("minimumOrder", { amount: minimumText })}
        </p>
      )}
    </div>
  );
}
