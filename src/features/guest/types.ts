import type { CartApiCart, CartApiItem } from "@/features/cart/types";

/**
 * Guest cart line — the backend reuses the authenticated CartApiItem shape
 * (verified live 2026-11-11) plus per-line availability flags added by the
 * guest implementation.
 */
export interface GuestCartItem extends CartApiItem {
  is_available?: boolean;
  unavailable_reason?: string | null;
}

/**
 * Live guest cart payload. Same CartResource shape as the authenticated cart
 * plus guest-specific retention/currency fields; `user_id` is always null and
 * coupons are never applied to guest carts.
 */
export interface GuestCart extends Omit<CartApiCart, "normal_items" | "user_id"> {
  user_id: null;
  normal_items: GuestCartItem[];
  /** Guest retention deadline (7 days from the last cart mutation). */
  guest_expires_at: string | null;
  /** Currency the totals are quoted in (matches the `X-Currency` request). */
  currency?: string;
}

export type GuestShippingMethod = "scheduled" | "fast";

export interface GuestAddItemPayload {
  product_id: number;
  quantity: number;
  product_variant_id?: number | null;
  shipping_method?: GuestShippingMethod;
}

export interface GuestUpdateItemPayload {
  product_id: number;
  quantity: number;
  operation: "increment" | "decrement";
  product_variant_id?: number | null;
  shipping_method?: GuestShippingMethod;
}

/** Guests are limited to `online` | `cod` (contract §5). */
export type GuestPaymentMethod = "online" | "cod";

export interface GuestCheckoutRequest {
  name: string;
  user_phone: string;
  /** Optional — validated on the client only when provided. */
  user_email?: string;
  address: {
    street: string;
    city: string;
  };
  notes?: string;
  /** Required by the backend for delivery orders. */
  governorate_id: number;
  fulfillment_type?: "delivery" | "pickup";
  payment_method?: GuestPaymentMethod;
  gateway?: string;
  shipping_type?: string;
}

export interface GuestOrderItemProduct {
  id: number;
  name: string;
  slug: string;
  /** Order items expose the image under `image.thumbnail` (CartResource style). */
  image?: { thumbnail?: string; original?: unknown[] } | null;
  /** Some payloads include a flat thumbnail instead. */
  thumbnail?: string;
  current_price?: number;
  price?: number;
}

export interface GuestOrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  converted_unit_price?: number;
  converted_total_price?: number;
  is_gift: boolean;
  item_type: string;
  product: GuestOrderItemProduct;
  variant?: unknown | null;
}

/** OrderResource subset the guest confirmation + tracking flows rely on. */
export interface GuestOrder {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  promotion_discount?: number;
  total: number;
  converted_total?: number;
  currency: string;
  fulfillment_type: string;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  shipping_type?: string;
  shipping_price?: number;
  fast_shipping_fee?: number;
  created_at: string;
  notes?: string | null;
  order_items: GuestOrderItem[];
  /** Present on `GET /guest/orders/{id}` responses. */
  can_cancel?: boolean;
}

export interface GuestCheckoutResult {
  order: GuestOrder;
  /** Raw tokens are returned once, on first creation only (contract §5). */
  tracking_token: string | null;
  cancellation_token: string | null;
  payment: { method: string; gateway: string | null; next: string };
  idempotent_replay: boolean;
}

export interface GuestPaymentResult {
  url?: string;
  order_id: number;
  payment_method: string;
  gateway?: string | null;
  zero_value?: boolean;
}

export interface GuestOrderTokensResult {
  order_id?: number;
  tracking_token: string | null;
  tracking_revoked: boolean;
  cancellation_token: string | null;
  tracking_expires_at: string | null;
}

export interface GuestTrackResult {
  order: {
    order_number: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    created_at: string;
    last_updated_at: string;
  };
  timeline: Array<{ timestamp: string; title: string; description: string }>;
  tracking_expires_at: string | null;
}

export interface GuestCancelResult {
  order: { order_number: string; status: string };
}

/** `POST /guest/session` response payload. */
export interface GuestSessionData {
  guest: { expires_at: string };
  /** Mirrors the `meem_guest_csrf` cookie value; safe to hold in memory. */
  csrf_token: string;
  cookies: {
    session_cookie: string;
    csrf_cookie: string;
    csrf_header: string;
    path: string;
    domain: string | null;
    same_site: string;
    secure: boolean;
    http_only: boolean;
    ttl_days: number;
  };
}
