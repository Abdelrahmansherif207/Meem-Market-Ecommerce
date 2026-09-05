import type { NotificationItem, RawNotification } from "./types";

export function resolveLocalizedText(
  value: string | { en: string; ar: string } | undefined,
  locale: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale as "en" | "ar"] ?? value.en ?? value.ar ?? "";
}

export function normalizeNotification(
  raw: RawNotification,
  locale: string,
): NotificationItem {
  return {
    id: raw.id,
    type: raw.type,
    title: resolveLocalizedText(raw.title, locale),
    message: resolveLocalizedText(raw.message, locale),
    icon: raw.icon ?? "",
    resourceType: raw.resource_type ?? "",
    resourceId: raw.resource_id ?? null,
    actionUrl: raw.action_url ?? "",
    orderId: raw.order_id ?? null,
    orderNumber: raw.order_number ?? null,
    couponId: raw.coupon_id ?? null,
    couponCode: raw.coupon_code ?? null,
    productId: raw.product_id ?? null,
    refundId: raw.refund_id ?? null,
    cartId: raw.cart_id ?? null,
    promotionId: raw.promotion_id ?? null,
    flashSaleId: raw.flash_sale_id ?? null,
    reviewId: raw.review_id ?? null,
    createdAt: raw.created_at ?? "",
    readAt: raw.read_at ?? null,
  };
}