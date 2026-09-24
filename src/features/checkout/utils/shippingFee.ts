import type { FulfillmentType, Governorate } from "../types";

export interface ShippingQuote {
  fee: number;
  free: boolean;
  estimatedDays: number | null;
}

const NO_SHIPPING: ShippingQuote = { fee: 0, free: false, estimatedDays: null };

export function resolveShippingQuote({
  fulfillmentType,
  governorate,
  subtotal,
  ratePerBase,
}: {
  fulfillmentType: FulfillmentType;
  governorate: Governorate | null;
  subtotal: number;
  ratePerBase: number | null;
}): ShippingQuote {
  if (fulfillmentType !== "delivery" || !governorate) return NO_SHIPPING;
  const shipping = governorate.shipping_price;
  if (!shipping || shipping.status === false) return NO_SHIPPING;
  const estimatedDays =
    typeof shipping.estimated_days === "number" && shipping.estimated_days > 0
      ? shipping.estimated_days
      : null;
  const rate = ratePerBase && ratePerBase > 0 ? ratePerBase : 1;
  const threshold =
    shipping.free_shipping_over > 0 ? shipping.free_shipping_over * rate : 0;
  if (threshold > 0 && subtotal >= threshold) {
    return { fee: 0, free: true, estimatedDays };
  }
  return { fee: shipping.price ?? 0, free: false, estimatedDays };
}
