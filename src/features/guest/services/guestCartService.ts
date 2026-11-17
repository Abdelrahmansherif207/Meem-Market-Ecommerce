import type { ApiResponse } from "@/shared/types";
import type { RequestChannel } from "@/shared/lib/api";
import {
  GUEST_CART,
  GUEST_CART_ITEMS,
  guestCartLineEndpoint,
} from "../lib/endpoints";
import { normalizeGuestCart } from "../lib/contract";
import type {
  GuestAddItemPayload,
  GuestCart,
  GuestShippingMethod,
  GuestUpdateItemPayload,
} from "../types";
import { guestFetch } from "./guestFetch";

/**
 * Mixed-cart scoping for guests. The backend refuses fast guest mutations
 * unless the matching `X-Channel` header is present, so every write names
 * the delivery group it targets. Reads stay channel-agnostic.
 */
function channelForDelivery(
  deliveryType: GuestShippingMethod | null | undefined,
): RequestChannel {
  return deliveryType === "fast" ? "fast-shipping" : "home";
}

/**
 * Server-backed guest cart. Reads need no CSRF; all writes require it (the
 * proxy or `guestFetch` attaches it). Client-sent prices are ignored by the
 * backend — never send them. Every response is normalized before it reaches
 * the UI.
 */
export const guestCartService = {
  getCart: (lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART, { lang }).then((response) =>
      normalizeGuestCart(response.data),
    ),

  addItem: (payload: GuestAddItemPayload, lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART_ITEMS, {
      method: "POST",
      body: JSON.stringify({ item: payload }),
      lang,
      channel: channelForDelivery(payload.shipping_method),
    }).then((response) => normalizeGuestCart(response.data)),

  updateItem: (
    payload: { item: GuestUpdateItemPayload },
    lang?: string,
  ): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART_ITEMS, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
      channel: channelForDelivery(payload.item.shipping_method),
    }).then((response) => normalizeGuestCart(response.data)),

  /** Removes one line by cart-item id. Unknown/foreign ids return 404. */
  removeLine: (
    itemId: number,
    lang?: string,
    deliveryType: GuestShippingMethod = "scheduled",
  ): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(guestCartLineEndpoint(itemId), {
      method: "DELETE",
      lang,
      channel: channelForDelivery(deliveryType),
    }).then((response) => normalizeGuestCart(response.data)),

  clear: (lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART, {
      method: "DELETE",
      lang,
    }).then((response) => normalizeGuestCart(response.data)),
};
