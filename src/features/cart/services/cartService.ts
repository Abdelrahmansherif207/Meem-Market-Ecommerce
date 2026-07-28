import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type {
  CartApiCart,
  CartItem,
  AddBulkPayload,
} from "../types";

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
      shipping_method?: "scheduled" | "fast";
    },
    lang?: string,
  ): Promise<CartItem> => {
    const response = await apiFetch<ApiResponse<CartItem>>("/cart", {
      method: "POST",
      body: JSON.stringify({ item: payload }),
      lang,
    });
    return response.data;
  },

  updateItem: async (
    payload: {
      item: {
        product_id: number;
        quantity: number;
        product_variant_id?: number | null;
      };
    },
    lang?: string,
  ): Promise<CartApiCart> => {
    const response = await apiFetch<ApiResponse<CartApiCart>>("/cart/update-item", {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
    });
    return response.data;
  },

  removeItem: async (itemId: number, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<{ message: string }>>("/cart/delete-items", {
      method: "DELETE",
      body: JSON.stringify({ item_id: itemId }),
      lang,
    });
  },

  addBulkToCart: async (payload: AddBulkPayload, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<{ message: string }>>("/cart/bulk-items", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
    });
  },
};
