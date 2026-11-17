/**
 * Canonical guest contract models.
 *
 * The guest API has moved between field names (`subtotal` vs `sub_total`,
 * `total` vs `total_price`, `items` vs `normal_items`). Everything the UI
 * consumes is normalized once in `lib/contract.ts`, so components never read
 * raw response fields again.
 */

export type GuestShippingMethod = "scheduled" | "fast";

export interface GuestCartLineAttribute {
  attribute: string;
  value: string;
}

/** One guest cart line, normalized from either contract revision. */
export interface GuestCartLine {
  /** Cart-item id used by the remove endpoint. */
  id: number;
  productId: number;
  productVariantId: number | null;
  quantity: number;
  /** Server price for a single unit. Never computed on the client. */
  unitPrice: number;
  /** Server line total (`unitPrice * quantity`, after backend pricing). */
  subtotal: number;
  shippingMethod: GuestShippingMethod;
  name: string;
  slug: string;
  image: string;
  sku: string;
  attributes: GuestCartLineAttribute[];
  isAvailable: boolean;
  unavailableReason: string | null;
}

/**
 * Flat guest cart. The backend owns every total; the client only displays
 * them. `subtotal` excludes shipping; `total` is what the order is charged.
 */
export interface GuestCart {
  id: number;
  items: GuestCartLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  /** Derived sum of line quantities — always safe for badges. */
  totalQuantity: number;
  currency: string | null;
  /** Guest retention deadline (7 days from the last cart mutation). */
  expiresAt: string | null;
}

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

/** Guests are limited to `online` | `cod`. */
export type GuestPaymentMethod = "online" | "cod";

export type GuestFulfillmentType = "delivery" | "pickup";

export interface GuestCheckoutAddress {
  street: string;
  city: string;
  /** Optional address detail lines; omitted when empty. */
  building?: string;
  details?: string;
}

export interface GuestCheckoutRequest {
  name: string;
  user_phone: string;
  /** Optional — validated on the client only when provided. */
  user_email?: string;
  address: GuestCheckoutAddress;
  notes?: string;
  /** Required for delivery orders; omitted for pickup. */
  governorate_id?: number;
  city_id?: number;
  pickup_location_id?: number | null;
  fulfillment_type: GuestFulfillmentType;
  payment_method: GuestPaymentMethod;
  gateway?: string;
  shipping_type?: string;
}

export interface GuestOrderAddress {
  street: string;
  city: string;
  building: string | null;
  details: string | null;
}

export interface GuestPickupLocationSummary {
  name: string;
  address: string | null;
  phone: string | null;
}

export interface GuestOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  name: string;
  image: string;
  slug: string;
  variantLabel: string | null;
}

/** Order subset the guest confirmation and tracking flows rely on. */
export interface GuestOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  fulfillmentType: string;
  shippingType: string | null;
  subtotal: number;
  shippingPrice: number;
  fastShippingFee: number;
  discount: number;
  total: number;
  currency: string | null;
  createdAt: string;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  address: GuestOrderAddress | null;
  pickupLocation: GuestPickupLocationSummary | null;
  items: GuestOrderItem[];
  canCancel: boolean;
}

export interface GuestCheckoutPaymentNext {
  method: string;
  gateway: string | null;
  /** e.g. `initiate_payment`, `paid`, `cod`. */
  next: string;
  /** Some deployments return the gateway URL directly on checkout. */
  redirectUrl: string | null;
}

export interface GuestCheckoutResult {
  order: GuestOrder;
  /** Raw tokens are returned once, on first creation only. */
  trackingToken: string | null;
  cancellationToken: string | null;
  payment: GuestCheckoutPaymentNext;
  idempotentReplay: boolean;
}

export interface GuestPaymentResult {
  /** Gateway redirect target (`redirect_url` or legacy `url`). */
  url: string | null;
  orderId: number;
  paymentMethod: string;
  gateway: string | null;
  zeroValue: boolean;
}

export interface GuestOrderTokensResult {
  orderId: number | null;
  trackingToken: string | null;
  trackingRevoked: boolean;
  cancellationToken: string | null;
  trackingExpiresAt: string | null;
}

export interface GuestTrackTimelineEntry {
  timestamp: string;
  /** Human title when the backend supplies one. */
  title: string | null;
  /** Machine status code when the backend only supplies `status`. */
  status: string | null;
  description: string | null;
}

export interface GuestTrackResult {
  order: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
    lastUpdatedAt: string;
  };
  timeline: GuestTrackTimelineEntry[];
  trackingExpiresAt: string | null;
}

export interface GuestCancelResult {
  order: { orderNumber: string; status: string };
}

/**
 * `POST /general/guest/orders/cancel/request-otp` response. The backend sends
 * a one-time code to the phone on file and returns the masked number so the
 * UI can confirm where it went.
 */
export interface GuestCancelOtpResult {
  otpId: string | null;
  provider: string | null;
  /** Masked phone, e.g. `+97*****5555`. */
  phone: string | null;
}

export interface GuestCancelOtpPayload {
  token: string;
  code: string;
  otpId?: string | null;
}

/** `POST /general/guest/session` response payload (normalized). */
export interface GuestSessionData {
  expiresAt: string | null;
  /** Mirrors the guest CSRF cookie value; safe to hold in memory. */
  csrfToken: string | null;
  cookies: {
    sessionName: string | null;
    csrfName: string | null;
    csrfHeader: string;
  };
}
