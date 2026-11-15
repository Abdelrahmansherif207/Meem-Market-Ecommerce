import { apiFetch, type RequestChannel } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type {
  CartApiCart,
  CartItem,
  AddBulkPayload,
  DeliveryType,
} from "../types";

/**
 * Mixed cart scoping: every mutation names its delivery group explicitly and
 * also sends `X-Channel`, so the backend can never apply it to the other
 * group. Reads/coupons/guest calls deliberately omit the header.
 */
function channelForDelivery(
  deliveryType: DeliveryType | null | undefined,
): RequestChannel {
  return deliveryType === "fast" ? "fast-shipping" : "home";
}

export const cartService = {
  getCart: async (lang?: string): Promise<CartApiCart | null> => {
    const response = await apiFetch<ApiResponse<PaginatedData<CartApiCart>>>("/cart", { lang });
    return response.data.data[0] ?? null;
  },

  addItem: async (
    payload: {
      product_id: number;
      quantity: number;
      product_variant_id?: number | null;
      shipping_method?: DeliveryType;
    },
    lang?: string,
  ): Promise<CartItem> => {
    const response = await apiFetch<ApiResponse<CartItem>>("/cart", {
      method: "POST",
      body: JSON.stringify({ item: payload }),
      lang,
      channel: channelForDelivery(payload.shipping_method),
    });
    return response.data;
  },

  updateItem: async (
    payload: {
      item: {
        product_id: number;
        quantity: number;
        operation: "increment" | "decrement";
        product_variant_id?: number | null;
        shipping_method?: DeliveryType;
      };
    },
    lang?: string,
  ): Promise<CartApiCart> => {
    const response = await apiFetch<ApiResponse<CartApiCart>>("/cart/update-item", {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
      channel: channelForDelivery(payload.item.shipping_method),
    });
    return response.data;
  },

  removeItem: async (
    itemId: number,
    deliveryType: DeliveryType = "scheduled",
    lang?: string,
  ): Promise<void> => {
    await apiFetch<ApiResponse<{ message: string }>>("/cart/delete-items", {
      method: "DELETE",
      body: JSON.stringify({ item_id: itemId }),
      lang,
      channel: channelForDelivery(deliveryType),
    });
  },

  /**
   * Guest → authenticated bulk upload. Guests are scheduled-only, so this is
   * intentionally channel-agnostic.
   */
  addBulkToCart: async (payload: AddBulkPayload, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<{ message: string }>>("/cart/bulk-items", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
      channel: false,
    });
  },
};
