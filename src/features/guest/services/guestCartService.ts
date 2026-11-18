import type { ApiResponse } from "@/shared/types";
import {
  GUEST_CART,
  GUEST_CART_ITEMS,
  guestCartLineEndpoint,
} from "../lib/endpoints";
import { normalizeGuestCart } from "../lib/contract";
import type {
  GuestAddItemPayload,
  GuestCart,
  GuestUpdateItemPayload,
} from "../types";
import { guestFetch } from "./guestFetch";

/**
 * Server-backed guest cart.
 *
 * Reads need no CSRF; all writes require it (the proxy or `guestFetch`
 * attaches it). Client-sent prices are ignored by the backend — never send
 * them. Every response is normalized before it reaches the UI.
 *
 * Catch guests only have the scheduled-delivery cart, so no channel header is
 * sent; the backend applies every mutation to that single group.
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
    }).then((response) => normalizeGuestCart(response.data)),

  updateItem: (
    payload: { item: GuestUpdateItemPayload },
    lang?: string,
  ): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART_ITEMS, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
    }).then((response) => normalizeGuestCart(response.data)),

  /** Removes one line by cart-item id. Unknown/foreign ids return 404. */
  removeLine: (itemId: number, lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(guestCartLineEndpoint(itemId), {
      method: "DELETE",
      lang,
    }).then((response) => normalizeGuestCart(response.data)),

  clear: (lang?: string): Promise<GuestCart | null> =>
    guestFetch<ApiResponse<unknown>>(GUEST_CART, {
      method: "DELETE",
      lang,
    }).then((response) => normalizeGuestCart(response.data)),
};
