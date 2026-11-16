"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Car, Zap, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { useAuthStore } from "@/features/auth";
import { useDisplayCurrency } from "@/features/currencies";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import type { CartLineIdentity, DeliveryType, HydratedCartItem } from "../types";
import { getCartLineKey } from "../types";
import { ProductCartItem } from "./ProductCartItem";
import { calcSubtotal, canCheckout } from "../utils";

interface CartSectionProps {
  deliveryType: DeliveryType;
  items: HydratedCartItem[];
  pendingItemIds?: Set<string>;
  onUpdateQuantity: (productId: number, quantity: number, line: CartLineIdentity) => void;
  onRemove: (productId: number, line: CartLineIdentity) => void;
  minimumOrderAmount: number;
  /** Optional slot rendered at the bottom of the section (e.g. My Coupons). */
  couponSlot?: ReactNode;
}

/**
 * One mixed-cart order group. Each group keeps its own quantity, subtotal and
 * checkout CTA so checking out scheduled items never ships fast items and
 * vice-versa.
 */
export function CartSection({
  deliveryType,
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

  const isFast = deliveryType === "fast";
  const subtotal = calcSubtotal(
    items.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const checkoutEnabled = canCheckout(subtotal, minimumOrderAmount);

  const DeliveryIcon = isFast ? Zap : Car;
  const badgeColor = isFast ? "bg-[#4c1d95] text-white" : "bg-[#111827] text-white";
  const title = t(isFast ? "fastTitle" : "scheduledTitle");
  const eta = t(isFast ? "fastEta" : "scheduledEta");

  if (items.length === 0) return null;

  const checkoutHref = isFast
    ? isAuthenticated
      ? "/payment?type=fast"
      : isGuestCheckoutEnabled()
        ? "/guest-checkout"
        : `/auth?redirect=${encodeURIComponent("/payment?type=fast")}`
    : isAuthenticated
      ? "/payment"
      : isGuestCheckoutEnabled()
        ? "/guest-checkout"
        : `/auth?redirect=/payment`;

  const lineFor = (item: HydratedCartItem): CartLineIdentity => ({
    productVariantId: item.product_variant_id ?? null,
    deliveryType,
  });

  return (
    <div
      className={cn(
        "space-y-6 rounded-2xl border-2 p-4 sm:p-6 lg:p-10",
        isFast ? "border-[#4c1d95]/35 bg-[#4c1d95]/[0.03]" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
            badgeColor,
          )}
        >
          <DeliveryIcon className="h-4 w-4" />
          {title}
        </span>
        <span className="text-sm text-text-secondary">{eta}</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <ProductCartItem
            key={getCartLineKey(item.product_id, lineFor(item))}
            item={item}
            isPending={pendingItemIds?.has(
              getCartLineKey(item.product_id, lineFor(item)),
            ) ?? false}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      {couponSlot && (
        <div className="border-t border-border pt-4">{couponSlot}</div>
      )}

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-text-secondary">
            {t("subtotal")}
            <span className="ms-1 text-xs">
              ({t("cartItems", { count: totalQuantity })})
            </span>
          </span>
          <Price
            amount={subtotal}
            className="text-base font-medium text-text-primary"
          />
        </div>

        <Button
          size="lg"
          full
          variant={isFast ? "accent" : "primary"}
          disabled={!checkoutEnabled}
          onClick={() => router.push(checkoutHref)}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          {t(isFast ? "checkoutFast" : "checkoutScheduled")}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Button>

        {!checkoutEnabled && (
          <p className="text-center text-[11px] text-text-secondary">
            {t("minimumOrder", { amount: minimumText })}
          </p>
        )}
      </div>
    </div>
  );
}
