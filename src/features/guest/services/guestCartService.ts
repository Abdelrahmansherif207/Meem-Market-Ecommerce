import type { ApiResponse } from "@/shared/types";
import type { RequestChannel } from "@/shared/lib/api";
import type {
  GuestAddItemPayload,
  GuestCart,
  GuestShippingMethod,
  GuestUpdateItemPayload,
} from "../types";
import { guestFetch } from "./guestFetch";

const BASE = "/general/guest/cart";

/**
 * Mixed-cart scoping for guests. The backend refuses fast guest mutations
 * unless the matching `X-Channel` header is present, so every write names
 * the delivery group it targets. Reads stay channel-agnostic and return both
 * `normal_items` and `fast_items`.
 */
function channelForDelivery(
  deliveryType: GuestShippingMethod | null | undefined,
): RequestChannel {
  return deliveryType === "fast" ? "fast-shipping" : "home";
}

/**
 * Server-backed guest cart (contract §4). Reads need no CSRF; all writes
 * require it (the proxy or `guestFetch` attaches it). Client-sent prices are
 * ignored by the backend — never send them.
 *
 * All write responses return the updated cart, so callers can hydrate directly.
 */
export const guestCartService = {
  getCart: (lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<{ cart: GuestCart | null }>>(BASE, { lang }).then(
      (response) => response.data.cart,
    ),

  addItem: (
    payload: GuestAddItemPayload,
    lang?: string,
  ): Promise<GuestCart> =>
    guestFetch<ApiResponse<{ cart: GuestCart }>>(`${BASE}/items`, {
      method: "POST",
      body: JSON.stringify({ item: payload }),
      lang,
      channel: channelForDelivery(payload.shipping_method),
    }).then((response) => response.data.cart),

  updateItem: (
    payload: { item: GuestUpdateItemPayload },
    lang?: string,
  ): Promise<GuestCart> =>
    guestFetch<ApiResponse<{ cart: GuestCart }>>(`${BASE}/items`, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
      channel: channelForDelivery(payload.item.shipping_method),
    }).then((response) => response.data.cart),

  /** Removes one line by cart-item id. Unknown/foreign ids return 404. */
  removeLine: (
    itemId: number,
    lang?: string,
    deliveryType: GuestShippingMethod = "scheduled",
  ): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<{ cart: GuestCart | null }>>(
      `${BASE}/items/${itemId}`,
      {
        method: "DELETE",
        lang,
        channel: channelForDelivery(deliveryType),
      },
    ).then((response) => response.data.cart),

  clear: (lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<{ cart: GuestCart | null }>>(BASE, {
      method: "DELETE",
      lang,
    }).then((response) => response.data.cart),
};
