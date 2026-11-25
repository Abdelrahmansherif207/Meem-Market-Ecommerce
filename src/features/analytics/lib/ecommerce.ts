import { pushDataLayer } from "./dataLayer";
import type { GA4EcommerceItem } from "./items";

/**
 * Typed GA4 ecommerce events — the only way feature code reports analytics.
 * Components must not push to `window.dataLayer` directly.
 *
 * Conventions (GA4 recommended ecommerce names/params):
 * - `{ ecommerce: null }` is pushed before every ecommerce event so each
 *   event carries only its own payload.
 * - Everything goes through GTM. No gtag.js, no manual `page_view`
 *   (Enhanced Measurement owns pageviews).
 * - No personal data is ever included (names, emails, phones, addresses).
 * - Every function is throw-safe: an analytics failure can never break
 *   shopping or checkout.
 */

/** List context for events that support `item_list_id` / `item_list_name`. */
export interface GA4ListContext {
  itemListId?: string;
  itemListName?: string;
}

function compact(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
}

function trackEcommerce(event: string, ecommerce: Record<string, unknown>): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ecommerce });
}

/** Purchase idempotency: sessionStorage is scoped to the tab + session. */
const PURCHASE_SENT_PREFIX = "ga4_purchase_sent_";

function isPurchaseAlreadySent(transactionId: string): boolean {
  try {
    const key = `${PURCHASE_SENT_PREFIX}${transactionId}`;
    if (window.sessionStorage.getItem(key)) return true;
    window.sessionStorage.setItem(key, "1");
    return false;
  } catch {
    // Storage unavailable (private mode etc.) — send anyway; better to
    // over-report than to lose an order.
    return false;
  }
}

export function trackViewItemList(
  items: GA4EcommerceItem[],
  list: GA4ListContext = {},
): void {
  if (items.length === 0) return;
  trackEcommerce(
    "view_item_list",
    compact({ item_list_id: list.itemListId, item_list_name: list.itemListName, items }),
  );
}

export function trackSelectItem(
  item: GA4EcommerceItem,
  list: GA4ListContext = {},
): void {
  trackEcommerce(
    "select_item",
    compact({ item_list_id: list.itemListId, item_list_name: list.itemListName, items: [item] }),
  );
}

export function trackViewItem(
  item: GA4EcommerceItem,
  currency?: string,
): void {
  trackEcommerce("view_item", compact({ currency, items: [item] }));
}

/** GA4 `search` — the storefront search term (product keywords only). */
export function trackSearch(searchTerm: string): void {
  trackEcommerce("search", compact({ search_term: searchTerm }));
}

function cartValue(price: number | undefined, quantity: number | undefined): number {
  return Math.round((price ?? 0) * (quantity ?? 0) * 1000) / 1000;
}

/** `add_to_cart` — call only after the cart mutation succeeded. */
export function trackAddToCart(params: {
  item: GA4EcommerceItem;
  currency?: string;
}): void {
  const { item, currency } = params;
  trackEcommerce(
    "add_to_cart",
    compact({ currency, value: cartValue(item.price, item.quantity), items: [item] }),
  );
}

/** `remove_from_cart` — call only after the cart mutation succeeded. */
export function trackRemoveFromCart(params: {
  item: GA4EcommerceItem;
  currency?: string;
}): void {
  const { item, currency } = params;
  trackEcommerce(
    "remove_from_cart",
    compact({ currency, value: cartValue(item.price, item.quantity), items: [item] }),
  );
}

export function trackViewCart(params: {
  items: GA4EcommerceItem[];
  value: number;
  currency?: string;
  coupon?: string | null;
}): void {
  trackEcommerce(
    "view_cart",
    compact({ currency: params.currency, value: params.value, coupon: params.coupon, items: params.items }),
  );
}

export function trackBeginCheckout(params: {
  items: GA4EcommerceItem[];
  value: number;
  currency?: string;
  coupon?: string | null;
}): void {
  trackEcommerce(
    "begin_checkout",
    compact({ currency: params.currency, value: params.value, coupon: params.coupon, items: params.items }),
  );
}

export function trackAddShippingInfo(params: {
  items: GA4EcommerceItem[];
  value: number;
  currency?: string;
  shippingTier?: string | null;
  coupon?: string | null;
}): void {
  trackEcommerce(
    "add_shipping_info",
    compact({
      currency: params.currency,
      value: params.value,
      coupon: params.coupon,
      shipping_tier: params.shippingTier,
      items: params.items,
    }),
  );
}

export function trackAddPaymentInfo(params: {
  items: GA4EcommerceItem[];
  value: number;
  currency?: string;
  paymentType?: string | null;
  coupon?: string | null;
}): void {
  trackEcommerce(
    "add_payment_info",
    compact({
      currency: params.currency,
      value: params.value,
      coupon: params.coupon,
      payment_type: params.paymentType,
      items: params.items,
    }),
  );
}

/**
 * `purchase` — call ONLY for a backend-confirmed order (never pending or
 * failed). Deduplicated by `transaction_id`, so refreshes and revisits of
 * the confirmation page never repeat the event in the same browser session.
 *
 * `tax` is omitted on purpose: the order APIs expose no tax amount and we
 * never invent data. `coupon` is sent only when a real code is available.
 */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  shipping?: number;
  coupon?: string | null;
  items: GA4EcommerceItem[];
}): void {
  if (!params.transactionId || isPurchaseAlreadySent(params.transactionId)) return;
  trackEcommerce(
    "purchase",
    compact({
      transaction_id: params.transactionId,
      value: params.value,
      currency: params.currency,
      shipping: params.shipping,
      coupon: params.coupon,
      items: params.items,
    }),
  );
}
