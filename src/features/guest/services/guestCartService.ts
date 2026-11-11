import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type {
  GuestAddItemPayload,
  GuestCart,
  GuestUpdateItemPayload,
} from "../types";

const BASE = "/general/guest/cart";

/**
 * Server-backed guest cart (contract §4). Reads need no CSRF; all writes
 * require it (injected by `src/proxy.ts`). Client-sent prices are ignored by
 * the backend — never send them.
 *
 * All responses return the updated cart, so callers can hydrate directly.
 */
export const guestCartService = {
  getCart: (lang?: string): Promise<GuestCart | null> =>
    apiFetch<ApiResponse<{ cart: GuestCart | null }>>(BASE, { lang }).then(
      (response) => response.data.cart,
    ),

  addItem: (
    payload: GuestAddItemPayload,
    lang?: string,
  ): Promise<GuestCart> =>
    apiFetch<ApiResponse<{ cart: GuestCart }>>(`${BASE}/items`, {
      method: "POST",
      body: JSON.stringify({ item: payload }),
      lang,
    }).then((response) => response.data.cart),

  updateItem: (
    payload: { item: GuestUpdateItemPayload },
    lang?: string,
  ): Promise<GuestCart> =>
    apiFetch<ApiResponse<{ cart: GuestCart }>>(`${BASE}/items`, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
    }).then((response) => response.data.cart),

  /** Removes one line by cart-item id. Unknown/foreign ids return 404. */
  removeLine: (itemId: number, lang?: string): Promise<GuestCart> =>
    apiFetch<ApiResponse<{ cart: GuestCart }>>(`${BASE}/items/${itemId}`, {
      method: "DELETE",
      lang,
    }).then((response) => response.data.cart),

  clear: (lang?: string): Promise<GuestCart> =>
    apiFetch<ApiResponse<{ cart: GuestCart }>>(BASE, {
      method: "DELETE",
      lang,
    }).then((response) => response.data.cart),
};
